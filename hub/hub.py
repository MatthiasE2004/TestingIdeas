#!/usr/bin/env python3
"""
Claude Car Hub - a tiny server that lets your phone / car manage the
Claude Code sessions on this computer.

  * lists your Claude Code sessions (read from ~/.claude/projects)
  * shows their conversation
  * sends them new messages (runs `claude -p --resume <id>` in the session's folder)
  * starts new sessions, stops running ones
  * publishes an event feed the Android app turns into car notifications

Standard library only: run it with  `python3 hub.py`
"""
import argparse
import collections
import hmac
import json
import os
import secrets
import shutil
import subprocess
import sys
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

VERSION = "1.0.0"
HERE = Path(__file__).resolve().parent
CONFIG_DIR = Path.home() / ".claude-car-hub"
CONFIG_FILE = CONFIG_DIR / "config.json"

# --------------------------------------------------------------------------- config


def load_config(args):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    cfg = {}
    if CONFIG_FILE.exists():
        try:
            cfg = json.loads(CONFIG_FILE.read_text())
        except Exception:
            cfg = {}
    if not cfg.get("token"):
        cfg["token"] = secrets.token_urlsafe(24)
        CONFIG_FILE.write_text(json.dumps(cfg, indent=2))
        try:
            os.chmod(CONFIG_FILE, 0o600)
        except OSError:
            pass
    cfg["token"] = os.environ.get("HUB_TOKEN") or cfg["token"]
    cfg["host"] = args.host
    cfg["port"] = args.port
    claude = args.claude or os.environ.get("CLAUDE_BIN") or "claude"
    found = shutil.which(claude)
    cfg["claude_bin"] = os.path.abspath(found) if found else claude
    cfg["permission_mode"] = args.permission_mode
    cfg["projects_dir"] = Path(
        args.projects_dir or os.environ.get("CLAUDE_PROJECTS_DIR") or Path.home() / ".claude" / "projects"
    )
    cfg["max_sessions"] = args.max_sessions
    cfg["model"] = args.model
    return cfg


# --------------------------------------------------------------------------- session parsing

_SKIP_PREFIXES = ("<command-", "<local-command", "Caveat:", "<system-reminder>", "[Request interrupted")


def _block_text(content):
    """Turn a message `content` (str or list of blocks) into (text, tools)."""
    if isinstance(content, str):
        return content, []
    texts, tools = [], []
    for b in content or []:
        if not isinstance(b, dict):
            continue
        t = b.get("type")
        if t == "text" and b.get("text"):
            texts.append(b["text"])
        elif t == "tool_use":
            tools.append(_describe_tool(b.get("name", "tool"), b.get("input") or {}))
    return "\n".join(texts), tools


def _describe_tool(name, inp):
    for key in ("description", "command", "file_path", "path", "pattern", "url", "query", "prompt"):
        v = inp.get(key)
        if isinstance(v, str) and v:
            v = v.strip().splitlines()[0]
            return f"{name}: {v[:80]}"
    return name


class SessionCache:
    def __init__(self):
        self._cache = {}  # path -> (mtime, size, parsed)
        self._lock = threading.Lock()

    def get(self, path: Path):
        st = path.stat()
        key = str(path)
        with self._lock:
            hit = self._cache.get(key)
            if hit and hit[0] == st.st_mtime and hit[1] == st.st_size:
                return hit[2]
        parsed = parse_session(path)
        parsed["mtime"] = st.st_mtime
        with self._lock:
            self._cache[key] = (st.st_mtime, st.st_size, parsed)
        return parsed


def parse_session(path: Path):
    sid = path.stem
    cwd, summary, custom_title, first_user = None, None, None, None
    messages = []
    with path.open("r", encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            if not isinstance(rec, dict):
                continue
            typ = rec.get("type")
            if typ == "summary" and rec.get("summary"):
                summary = rec["summary"]
                continue
            if typ in ("custom-title", "ai-title") and (rec.get("customTitle") or rec.get("aiTitle") or rec.get("title")):
                t = rec.get("customTitle") or rec.get("aiTitle") or rec.get("title")
                if typ == "custom-title" or not custom_title:
                    custom_title = t
                continue
            if typ not in ("user", "assistant"):
                continue
            if rec.get("isSidechain") or rec.get("isMeta"):
                continue
            cwd = rec.get("cwd") or cwd
            msg = rec.get("message") or {}
            text, tools = _block_text(msg.get("content"))
            text = (text or "").strip()
            if typ == "user":
                if not text or text.startswith(_SKIP_PREFIXES):
                    continue  # tool results, slash commands, etc.
                if first_user is None:
                    first_user = text
                messages.append({"role": "user", "text": text, "ts": rec.get("timestamp")})
            else:
                if not text and not tools:
                    continue
                # merge consecutive assistant chunks into one bubble
                if messages and messages[-1]["role"] == "assistant":
                    m = messages[-1]
                    if text:
                        m["text"] = (m["text"] + "\n\n" + text).strip()
                    m["tools"].extend(tools)
                    m["ts"] = rec.get("timestamp") or m["ts"]
                else:
                    messages.append({"role": "assistant", "text": text, "tools": tools, "ts": rec.get("timestamp")})
    title = custom_title or summary or (first_user or "New session").splitlines()[0]
    return {
        "id": sid,
        "cwd": cwd,
        "project": Path(cwd).name if cwd else path.parent.name,
        "title": title[:120],
        "messages": messages,
    }


# --------------------------------------------------------------------------- runs + events


class Run:
    def __init__(self, sid, proc, prompt):
        self.sid = sid
        self.proc = proc
        self.prompt = prompt
        self.started = time.time()
        self.finished = None
        self.status = "working"  # working | done | error | stopped
        self.partial = []  # assistant text produced so far
        self.activity = ""  # last tool being used
        self.result = None
        self.cost = None


class Hub:
    def __init__(self, cfg):
        self.cfg = cfg
        self.cache = SessionCache()
        self.runs = {}  # sid -> Run
        self.pending_new = {}  # sid -> {cwd, title} for sessions whose file doesn't exist yet
        self.events = collections.deque(maxlen=500)
        # ids keep growing across restarts so the phone's "after" cursor stays valid
        self.event_id = int(time.time() * 1000)
        self.lock = threading.Lock()

    # ---- events
    def emit(self, typ, sid, title, text=""):
        with self.lock:
            self.event_id += 1
            ev = {"id": self.event_id, "ts": time.time(), "type": typ, "agent_id": sid, "title": title, "text": text}
            self.events.append(ev)
        log(f"event {typ} {sid[:8]} {title[:40]!r}")
        return ev

    def events_after(self, after):
        with self.lock:
            return [e for e in self.events if e["id"] > after], self.event_id

    # ---- sessions
    def session_files(self):
        root = self.cfg["projects_dir"]
        if not root.exists():
            return []
        files = [p for p in root.glob("*/*.jsonl") if p.is_file()]
        files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
        return files

    def find_file(self, sid):
        root = self.cfg["projects_dir"]
        if not _valid_id(sid) or not root.exists():
            return None
        for p in root.glob(f"*/{sid}.jsonl"):
            return p
        return None

    def summarize(self, parsed):
        sid = parsed["id"]
        run = self.runs.get(sid)
        msgs = parsed["messages"]
        last = msgs[-1] if msgs else None
        if run and run.status == "working":
            status = "working"
        elif time.time() - parsed.get("mtime", 0) < 60 and not (run and run.finished and parsed.get("mtime", 0) <= run.finished + 3):
            status = "busy"  # being written by something else (e.g. your terminal)
        elif last and last["role"] == "assistant":
            status = "waiting"  # finished, waiting for you
        else:
            status = "idle"
        preview = ""
        if run and run.status == "working":
            preview = run.activity or (run.partial[-1] if run.partial else "Working…")
        elif last:
            preview = last["text"] or (("🔧 " + last["tools"][-1]) if last.get("tools") else "")
        return {
            "id": sid,
            "title": parsed["title"],
            "project": parsed["project"],
            "cwd": parsed["cwd"],
            "status": status,
            "updated": parsed.get("mtime"),
            "preview": _clip(preview, 300),
            "last_role": last["role"] if last else None,
            "message_count": len(msgs),
            "last_error": run.result if run and run.status == "error" else None,
        }

    def list_agents(self):
        out = []
        seen = set()
        for p in self.session_files()[: self.cfg["max_sessions"]]:
            try:
                parsed = self.cache.get(p)
            except Exception as e:  # unreadable file
                log(f"skip {p}: {e}")
                continue
            seen.add(parsed["id"])
            out.append(self.summarize(parsed))
        # brand-new sessions that haven't written their file yet
        for sid, info in list(self.pending_new.items()):
            if sid in seen:
                self.pending_new.pop(sid, None)
                continue
            run = self.runs.get(sid)
            out.insert(0, {
                "id": sid, "title": info["title"], "project": Path(info["cwd"]).name, "cwd": info["cwd"],
                "status": run.status if run else "idle", "updated": time.time(),
                "preview": (run.activity if run else "") or "Starting…", "last_role": "user",
                "message_count": 1, "last_error": run.result if run and run.status == "error" else None,
            })
        return out

    def get_agent(self, sid, limit=40):
        p = self.find_file(sid)
        if not p:
            if sid in self.pending_new:
                info = self.pending_new[sid]
                run = self.runs.get(sid)
                return {"id": sid, "title": info["title"], "project": Path(info["cwd"]).name, "cwd": info["cwd"],
                        "status": run.status if run else "idle", "preview": "", "messages":
                        [{"role": "user", "text": run.prompt if run else info["title"], "ts": None}],
                        "live": self._live(sid)}
            return None
        parsed = self.cache.get(p)
        data = self.summarize(parsed)
        data["messages"] = parsed["messages"][-limit:]
        data["live"] = self._live(sid)
        return data

    def _live(self, sid):
        run = self.runs.get(sid)
        if not run:
            return None
        return {"status": run.status, "activity": run.activity, "text": "\n\n".join(run.partial)[-4000:],
                "started": run.started, "finished": run.finished, "cost_usd": run.cost}

    def projects(self):
        seen, out = set(), []
        for p in self.session_files():
            try:
                cwd = self.cache.get(p)["cwd"]
            except Exception:
                continue
            if cwd and cwd not in seen:
                seen.add(cwd)
                out.append({"cwd": cwd, "name": Path(cwd).name})
        return out

    # ---- running claude
    def _claude_cmd(self, extra):
        exe = shutil.which(self.cfg["claude_bin"]) or self.cfg["claude_bin"]
        cmd = [exe, "-p", "--output-format", "stream-json", "--verbose",
               "--permission-mode", self.cfg["permission_mode"]]
        if self.cfg.get("model"):
            cmd += ["--model", self.cfg["model"]]
        return cmd + extra

    def send(self, sid, text):
        with self.lock:
            run = self.runs.get(sid)
            if run and run.status == "working":
                raise HubError(409, "This agent is still working. Stop it first or wait.")
        p = self.find_file(sid)
        if p:
            parsed = self.cache.get(p)
            cwd, title = parsed["cwd"], parsed["title"]
        elif sid in self.pending_new:
            cwd, title = self.pending_new[sid]["cwd"], self.pending_new[sid]["title"]
        else:
            raise HubError(404, "Unknown agent")
        if not cwd or not Path(cwd).is_dir():
            raise HubError(400, f"The session folder no longer exists: {cwd}")
        return self._start(sid, ["--resume", sid], cwd, text, title)

    def new_agent(self, cwd, text, title=None):
        cwd = os.path.expanduser(cwd or "")
        if not cwd or not Path(cwd).is_dir():
            raise HubError(400, f"Folder not found on the hub computer: {cwd}")
        sid = str(uuid.uuid4())
        title = (title or text.splitlines()[0])[:120]
        self.pending_new[sid] = {"cwd": cwd, "title": title}
        try:
            self._start(sid, ["--session-id", sid], cwd, text, title)
        except Exception:
            self.pending_new.pop(sid, None)
            raise
        return sid

    def _start(self, sid, extra, cwd, text, title):
        cmd = self._claude_cmd(extra)
        log(f"run {sid[:8]} in {cwd}: {' '.join(cmd[1:])}")
        try:
            proc = subprocess.Popen(
                cmd, cwd=cwd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                text=True, encoding="utf-8", errors="replace", bufsize=1,
            )
        except FileNotFoundError:
            raise HubError(500, f"Could not find the Claude Code CLI ('{self.cfg['claude_bin']}'). Use --claude /path/to/claude")
        run = Run(sid, proc, text)
        with self.lock:
            self.runs[sid] = run
        try:
            proc.stdin.write(text)
            proc.stdin.close()
        except OSError:
            pass
        threading.Thread(target=self._pump, args=(run, title), daemon=True).start()
        self.emit("started", sid, title, text)
        return {"ok": True, "agent_id": sid, "status": "working"}

    def _pump(self, run, title):
        err_lines = collections.deque(maxlen=20)

        def read_err():
            for l in run.proc.stderr:
                err_lines.append(l.rstrip())

        threading.Thread(target=read_err, daemon=True).start()
        for line in run.proc.stdout:
            line = line.strip()
            if not line:
                continue
            try:
                ev = json.loads(line)
            except json.JSONDecodeError:
                continue
            t = ev.get("type")
            if t == "assistant":
                text, tools = _block_text((ev.get("message") or {}).get("content"))
                if text.strip():
                    run.partial.append(text.strip())
                    run.activity = _clip(text.strip().splitlines()[0], 120)
                if tools:
                    run.activity = "🔧 " + tools[-1]
            elif t == "result":
                run.result = ev.get("result") or ""
                run.cost = ev.get("total_cost_usd")
                if ev.get("is_error") or (ev.get("subtype") not in (None, "success")):
                    run.status = "error"
                    if not run.result:
                        run.result = ev.get("subtype") or "error"
        code = run.proc.wait()
        run.finished = time.time()
        if run.status == "stopped":
            self.emit("stopped", run.sid, title, "Stopped.")
            return
        if run.result is None:
            run.status = "error"
            run.result = "\n".join(err_lines)[-800:] or f"claude exited with code {code}"
        elif run.status != "error":
            run.status = "done"
        if run.status == "done":
            reply = run.result or ("\n\n".join(run.partial) if run.partial else "Done.")
            self.emit("reply", run.sid, title, reply)
        else:
            self.emit("error", run.sid, title, run.result)

    def stop(self, sid):
        run = self.runs.get(sid)
        if not run or run.status != "working":
            raise HubError(409, "This agent is not running")
        run.status = "stopped"
        try:
            run.proc.terminate()
            try:
                run.proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                run.proc.kill()
        except OSError:
            pass
        return {"ok": True}


class HubError(Exception):
    def __init__(self, code, msg):
        super().__init__(msg)
        self.code = code
        self.msg = msg


def _valid_id(sid):
    return bool(sid) and len(sid) <= 64 and all(c.isalnum() or c in "-_" for c in sid)


def _clip(s, n):
    s = (s or "").strip()
    return s if len(s) <= n else s[: n - 1] + "…"


def log(msg):
    print(time.strftime("%H:%M:%S"), msg, flush=True)


# --------------------------------------------------------------------------- HTTP


def make_handler(hub: Hub):
    token = hub.cfg["token"]
    webui = HERE / "webui.html"

    class H(BaseHTTPRequestHandler):
        server_version = "ClaudeCarHub/" + VERSION

        def log_message(self, fmt, *a):
            pass

        def _send(self, code, body, ctype="application/json"):
            data = body if isinstance(body, bytes) else json.dumps(body).encode()
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(data)

        def _authed(self, q):
            got = self.headers.get("Authorization", "")
            if got.startswith("Bearer "):
                got = got[7:]
            else:
                got = (q.get("token") or [""])[0]
            return hmac.compare_digest(got.encode(), token.encode())

        def _body(self):
            n = int(self.headers.get("Content-Length") or 0)
            if n > 200_000:
                raise HubError(413, "Too large")
            raw = self.rfile.read(n) if n else b"{}"
            try:
                return json.loads(raw or b"{}")
            except json.JSONDecodeError:
                raise HubError(400, "Invalid JSON")

        def do_GET(self):
            self._dispatch("GET")

        def do_POST(self):
            self._dispatch("POST")

        def _dispatch(self, method):
            u = urlparse(self.path)
            q = parse_qs(u.query)
            parts = [p for p in u.path.split("/") if p]
            try:
                if method == "GET" and u.path in ("/", "/index.html"):
                    return self._send(200, webui.read_bytes(), "text/html; charset=utf-8")
                if parts[:1] != ["api"]:
                    return self._send(404, {"error": "Not found"})
                if parts == ["api", "ping"]:
                    return self._send(200, {"ok": True, "version": VERSION, "authed": self._authed(q)})
                if not self._authed(q):
                    return self._send(401, {"error": "Wrong or missing token"})
                return self._send(200, self._route(method, parts[1:], q))
            except HubError as e:
                return self._send(e.code, {"error": e.msg})
            except Exception as e:  # pragma: no cover
                log(f"error: {e!r}")
                return self._send(500, {"error": str(e)})

        def _route(self, method, p, q):
            if method == "GET" and p == ["agents"]:
                return {"agents": hub.list_agents()}
            if method == "GET" and p == ["projects"]:
                return {"projects": hub.projects()}
            if method == "GET" and p == ["events"]:
                after = int((q.get("after") or ["0"])[0] or 0)
                evs, last = hub.events_after(after)
                return {"events": evs, "last_id": last}
            if method == "POST" and p == ["agents"]:
                b = self._body()
                text = (b.get("text") or "").strip()
                if not text:
                    raise HubError(400, "Message is empty")
                sid = hub.new_agent(b.get("cwd"), text, b.get("title"))
                return {"ok": True, "agent_id": sid}
            if len(p) >= 2 and p[0] == "agents":
                sid = p[1]
                if not _valid_id(sid):
                    raise HubError(400, "Bad id")
                if method == "GET" and len(p) == 2:
                    limit = min(int((q.get("limit") or ["40"])[0]), 500)
                    a = hub.get_agent(sid, limit)
                    if not a:
                        raise HubError(404, "Unknown agent")
                    return a
                if method == "POST" and p[2:] == ["messages"]:
                    text = (self._body().get("text") or "").strip()
                    if not text:
                        raise HubError(400, "Message is empty")
                    return hub.send(sid, text)
                if method == "POST" and p[2:] == ["stop"]:
                    return hub.stop(sid)
            raise HubError(404, "Not found")

    return H


def main():
    ap = argparse.ArgumentParser(description="Claude Car Hub")
    ap.add_argument("--host", default=os.environ.get("HUB_HOST", "0.0.0.0"))
    ap.add_argument("--port", type=int, default=int(os.environ.get("HUB_PORT", "8787")))
    ap.add_argument("--claude", help="path to the claude CLI (default: claude on PATH)")
    ap.add_argument("--permission-mode", default=os.environ.get("HUB_PERMISSION_MODE", "acceptEdits"),
                    help="permission mode for runs started from the car: acceptEdits (default), auto, "
                         "dontAsk, plan, bypassPermissions")
    ap.add_argument("--model", default=os.environ.get("HUB_MODEL"), help="optional model override")
    ap.add_argument("--projects-dir", help="override ~/.claude/projects")
    ap.add_argument("--max-sessions", type=int, default=30)
    ap.add_argument("--show-token", action="store_true", help="print the access token and exit")
    args = ap.parse_args()
    cfg = load_config(args)
    if args.show_token:
        print(cfg["token"])
        return
    hub = Hub(cfg)
    srv = ThreadingHTTPServer((cfg["host"], cfg["port"]), make_handler(hub))
    srv.daemon_threads = True
    print(f"""
  Claude Car Hub {VERSION}
  ─────────────────────────────────────────────
  Listening on   http://{cfg['host']}:{cfg['port']}
  Sessions from  {cfg['projects_dir']}
  Permission     {cfg['permission_mode']}
  Access token   {cfg['token']}
  (token stored in {CONFIG_FILE})
""", flush=True)
    if not shutil.which(cfg["claude_bin"]):
        print(f"  ! warning: '{cfg['claude_bin']}' not found on PATH; use --claude /path/to/claude\n", flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("bye")


if __name__ == "__main__":
    sys.exit(main())

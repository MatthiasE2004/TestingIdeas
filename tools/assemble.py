#!/usr/bin/env python3
"""Merge content/parts/<course>-<n>.json into content/<course>.json (+ courses.json index) and validate references."""
import json, os, glob, sys, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WWW = os.path.join(ROOT, "app", "www"); C = os.path.join(WWW, "content"); P = os.path.join(C, "parts")
COURSES = [
 dict(id="pm", title="Project management", subtitle="The start of the project journey", accent="#D71921",
      source="The Open University, OpenLearn - Project management: the start of the project journey (CC BY-NC-SA 4.0)",
      url="https://www.open.edu/openlearn/money-business/leadership-management/project-management-the-start-the-project-journey/content-section-0"),
 dict(id="ent", title="Entrepreneurship", subtitle="From ideas to reality", accent="#0B0B0B",
      source="The Open University, OpenLearn - Entrepreneurship: from ideas to reality (CC BY-NC-SA 4.0)",
      url="https://www.open.edu/openlearn/ocw/mod/oucontent/view.php?id=109136&section=1"),
 dict(id="lead", title="Leadership and followership", subtitle="Leading and following well", accent="#0B0B0B",
      source="The Open University, OpenLearn - Leadership and followership (CC BY-NC-SA 4.0)", url="https://www.open.edu/openlearn/"),
 dict(id="brand", title="Personal branding", subtitle="For career success", accent="#0B0B0B",
      source="The Open University, OpenLearn - Personal branding for career success (CC BY-NC-SA 4.0)", url="https://www.open.edu/openlearn/"),
]
BLOCKS = {"h","p","ul","ol","img","callout","quote","table","video","activity","quiz","tf","flash","tool","match"}
errors = []; warnings = []
index = []
tool_ids = set(re.findall(r"register\(\s*['\"]([\w-]+)['\"]", "".join(open(f, encoding="utf-8").read() for f in glob.glob(os.path.join(WWW, "tools", "*.js")))))
ids = set()
def num(f): return int(re.search(r"-(\d+)\.json$", f).group(1))
for c in COURSES:
    files = sorted(glob.glob(os.path.join(P, c["id"] + "-*.json")), key=num)
    chapters = []
    for f in files:
        try: ch = json.load(open(f, encoding="utf-8"))
        except Exception as e: errors.append(f"{f}: invalid JSON {e}"); continue
        for pg in ch["pages"]:
            if pg["id"] in ids: errors.append(f"duplicate page id {pg['id']}")
            ids.add(pg["id"])
            if not pg.get("blocks"): errors.append(f"{pg['id']}: empty page")
            for b in pg["blocks"]:
                t = b.get("t")
                if t not in BLOCKS: errors.append(f"{pg['id']}: unknown block {t}"); continue
                if t == "img" and not os.path.exists(os.path.join(WWW, b["src"])): errors.append(f"{pg['id']}: missing image {b['src']}")
                if t == "tool" and b["tool"] not in tool_ids: warnings.append(f"{pg['id']}: tool '{b['tool']}' not registered")
                if t == "match" and not (2 <= len(b.get("pairs", [])) <= 12 and all(x.get("term") and x.get("def") for x in b["pairs"])): errors.append(f"{pg['id']}: bad match block")
                if t in ("activity","quiz","tf","match"):
                    if b["id"] in ids: errors.append(f"duplicate interactive id {b['id']}")
                    ids.add(b["id"])
                if t == "quiz":
                    n = len(b["options"]); a = b["answer"]
                    if not all(0 <= x < n for x in (a if isinstance(a, list) else [a])): errors.append(f"{pg['id']}: quiz answer out of range")
        chapters.append(ch)
    course = dict(c, chapters=chapters)
    pages = sum(len(ch["pages"]) for ch in chapters)
    json.dump(course, open(os.path.join(C, c["id"] + ".json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    index.append(dict(id=c["id"], title=c["title"], subtitle=c["subtitle"], accent=c["accent"], chapters=len(chapters), pages=pages))
    print(f"{c['id']}: {len(chapters)} chapters, {pages} pages")
json.dump(index, open(os.path.join(C, "courses.json"), "w"), indent=1)
for w in warnings: print("WARN", w)
for e in errors: print("ERROR", e)
sys.exit(1 if errors else 0)

# Agent Hub: your Claude Code agents in Android Auto

See and talk to the Claude Code sessions on your computer from your car (Pioneer SPH-DA230DAB or
any Android Auto head unit).

```
 Car screen (Android Auto)          Your phone                     Your computer
 ┌────────────────────────┐        ┌───────────────┐   Tailscale   ┌─────────────────────────┐
 │ Agent list / details   │◀──────▶│ Agent Hub app │◀─────────────▶│ hub.py                  │
 │ Read aloud, Reply,     │  USB/  │ (Kotlin)      │   HTTP+token  │  └ claude -p --resume … │
 │ Quick replies, Stop    │  wifi  └───────────────┘               │    ~/.claude/projects   │
 └────────────────────────┘                                        └─────────────────────────┘
```

## What it does

**In the car**
- A list of your recent Claude Code sessions, each with a status dot: yellow means working,
  green means waiting for you, blue means active in your terminal, red means it needs attention.
- An agent screen with the status, the last reply and your last message.
  - **Read aloud** speaks the last reply through the car speakers.
  - **Reply** pops up a message that you answer by voice.
  - **Quick** sends a one-tap reply: "Status update?", "Continue", "Run the tests" and others.
  - **Stop** stops a running agent.
- When an agent finishes, a message notification appears in the car. Android Auto can read it
  aloud, and you can **reply by voice**. Your reply goes straight back to that agent.

**On the phone or computer**, the hub also serves a full chat dashboard at `http://<hub>:8787`.
It has the full history, a voice dictation button and a way to start new agents in any project folder.

## 1. Run the hub on your computer

You need Python 3.9+ and Claude Code installed and logged in (`claude` works in a terminal).

```bash
cd hub
python3 hub.py            # Windows: start-hub.bat
```

It prints an **access token**. You'll need it for the phone. Show it again any time with
`python3 hub.py --show-token`.

Useful options:

| Flag | Default | Meaning |
|---|---|---|
| `--permission-mode` | `acceptEdits` | What agents can do without asking. Runs from the car can't answer permission prompts, so pick `acceptEdits`, `auto`, `dontAsk` or `plan`. `bypassPermissions` lets them run any command; only use it on a machine you don't mind them changing. |
| `--port` | `8787` | Port to listen on |
| `--claude` | `claude` on PATH | Path to the Claude Code CLI |
| `--model` | your default | Model for runs started from the car |

Keep the hub running with a login item, `systemd --user`, or `launchd` on macOS.

### Reach it from your phone: use Tailscale

1. Install [Tailscale](https://tailscale.com) on the computer and the phone, and sign in on both
   with the same account.
2. Your computer gets an address like `100.101.102.103`. Your hub address is
   `http://100.101.102.103:8787`.

Tailscale encrypts the connection, so the plain `http://` is fine. **Don't** port-forward the hub to
the open internet: it can run code on your computer.

## 2. Build and install the Android app

**Option A: GitHub (no tools needed).** Push this folder to a private GitHub repo. The included
workflow builds the APK. Open the **Actions** tab, open the latest run and download
`agent-hub-apk`. Copy the `.apk` to your phone and open it to install. You may need to allow
installs from your browser or file manager.

**Option B: Android Studio.** Open the `android` folder, then use **Build › Build APK(s)**, or run
the app directly on your phone over USB.

## 3. Set up the app

1. Open **Agent Hub** on the phone. Enter the hub address and token, then tap
   **Save & test connection**. It should report how many sessions it found.
2. Allow notifications when asked.
3. Turn on **Notify me in the car when an agent replies** so replies arrive even when the app is
   closed.
4. Tap **Send a test message to the car** to check that messages and voice replies work.

## 4. Make it show up in Android Auto

Android Auto hides apps that weren't installed from the Play Store until you allow them:

1. On the phone, open **Settings › Apps › Android Auto** (on some phones, **Connected devices ›
   Android Auto**), then scroll to the bottom.
2. Tap **Version** about 10 times until it asks to enable developer settings. Confirm.
3. Open the ⋮ menu, choose **Developer settings**, and turn on **Unknown sources**.
4. Reconnect to the car. **Agent Hub** appears in the Android Auto launcher. If it's missing,
   open the launcher's **Customize** list and enable it there.

Android Auto updates sometimes switch **Unknown sources** off again. If the app disappears,
repeat step 3.

## Safety

The car screens follow Android Auto's driving rules: short lists, large buttons and no typing.
Talking to agents works by voice through notification replies and **Read aloud**. Read long replies
and code on the phone or dashboard after you've parked.

## How it works

- `hub.py` reads Claude Code's own session files in `~/.claude/projects/` to list sessions and show
  their conversations, including sessions you started in a terminal.
- Sending a message runs `claude -p --resume <session-id> --output-format stream-json` in that
  session's folder, so the agent keeps its full context. New agents use `--session-id`.
- The phone polls `/api/events` and turns finished runs into Android messaging notifications.
  Android Auto shows these in the car and handles voice replies.
- API: `GET /api/agents`, `GET /api/agents/<id>`, `POST /api/agents/<id>/messages {text}`,
  `POST /api/agents/<id>/stop`, `POST /api/agents {cwd, text}`, `GET /api/events?after=<id>`.
  Every call needs `Authorization: Bearer <token>`.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Couldn't reach the hub" | Check that the hub is running, Tailscale is connected on both devices, and the address includes `:8787`. |
| App not in Android Auto | Turn on Unknown sources again (step 4.3) and reconnect. |
| No messages in the car | Allow notifications for Agent Hub, and turn on "Notify me in the car…". On Samsung and Xiaomi phones, set the app's battery usage to **Unrestricted**. |
| An agent says it needs permission | Restart the hub with a different `--permission-mode`, or approve the action in your terminal. |
| "This agent is still working" | Wait for it to finish, or tap **Stop**. |

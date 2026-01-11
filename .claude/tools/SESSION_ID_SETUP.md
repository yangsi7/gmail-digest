# Session ID Retrieval Hook Setup

## Quick Setup (2 steps)

### 1. Create the hook script

```bash
mkdir -p .claude/tools
```

Write this to `.claude/tools/get-session-id.py`:

```python
#!/usr/bin/env python3
import json
import sys

try:
    input_data = json.load(sys.stdin)
except:
    sys.exit(0)

prompt = input_data.get("prompt", "").lower()
triggers = ["session id", "<this session>", "retrieve session", "get session"]

if any(t in prompt for t in triggers):
    sid = input_data.get("session_id", "NOT_FOUND")
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": f"SESSION ID: {sid}\nResume: claude -r \"{sid}\""
        }
    }))

sys.exit(0)
```

Make executable:
```bash
chmod +x .claude/tools/get-session-id.py
```

### 2. Add to settings.json

Add `UserPromptSubmit` hook to `.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/tools/get-session-id.py"
          }
        ]
      }
    ]
  }
}
```

## Usage

After restarting Claude Code, type any of:
- "What is my session id?"
- "retrieve <this session>"
- "get session"

The session ID will be injected into context automatically.

## Alternative: /status command

For immediate retrieval without setup, type `/status` in Claude Code terminal.

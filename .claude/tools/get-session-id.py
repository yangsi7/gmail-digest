#!/usr/bin/env python3
"""
UserPromptSubmit hook to retrieve and inject session ID into Claude's context.

Triggered by keywords: "<session id>", "<this session>", "session id", "retrieve session"

Usage:
  1. Configure this hook in .claude/settings.json under hooks.UserPromptSubmit
  2. In conversation, type: "What is my session id?" or "retrieve <this session>"
  3. The session ID will be injected into Claude's context via additionalContext

Hook payload structure:
{
  "session_id": "uuid-string",
  "prompt": "user message",
  "cwd": "/path/to/dir",
  "allowed_tools": [...],
  ...
}
"""

import json
import sys


def main():
    try:
        # Read hook input from stdin
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        # If we can't parse JSON, exit silently
        sys.exit(0)
    except Exception:
        sys.exit(0)

    # Get the user's prompt
    prompt = input_data.get("prompt", "").lower()

    # Check for session ID retrieval triggers
    triggers = [
        "<session id>",
        "<this session>",
        "session id",
        "retrieve session",
        "get session",
        "current session id",
        "what is my session",
    ]

    # Check if any trigger is present in the prompt
    if any(trigger in prompt for trigger in triggers):
        session_id = input_data.get("session_id", "NOT_FOUND")

        # Return the session ID as additional context
        output = {
            "hookSpecificOutput": {
                "hookEventName": "UserPromptSubmit",
                "additionalContext": f"""
SESSION ID RETRIEVED
====================
The current Claude Code session ID is: {session_id}

This session ID can be used to:
- Resume this conversation later: claude -r "{session_id}"
- Track this session in telemetry
- Reference in documentation (todo.md, event-stream.md, workbook.md)

Full hook payload for debugging:
- cwd: {input_data.get("cwd", "N/A")}
- tools_count: {len(input_data.get("allowed_tools", []))}
"""
            }
        }
        print(json.dumps(output))

    # Always exit successfully
    sys.exit(0)


if __name__ == "__main__":
    main()

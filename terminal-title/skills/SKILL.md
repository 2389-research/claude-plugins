---
name: terminal-title
description: Use when session starts or conversation topic materially shifts - e.g. user switches from debugging to docs, asks about unrelated subject, or begins work on a different component
---

<!-- ABOUTME: Terminal title skill that automatically updates terminal window title -->
<!-- ABOUTME: Uses emoji from environment + Claude's project detection + current topic -->

# Terminal Title

Updates terminal window title to: `$TERMINAL_TITLE_EMOJI ProjectName - Topic`

## Pre-flight Check

If `$CLAUDE_CODE_DISABLE_TERMINAL_TITLE` is `1`, do nothing and stop.

## When to Invoke

**DO invoke:**
- Session start (default topic: "Claude Code")
- User switches domains: debugging → docs, frontend → backend
- User starts working on different module/component
- User asks about unrelated topic after sustained discussion

**Do NOT invoke:**
- Follow-up questions on same topic
- Small refinements ("make it blue")
- Clarifications about current task

## Workflow

1. **Determine project name** — Use human-friendly name from context (git repo, package.json, README heading, or directory basename as fallback). Capitalize properly ("OneOnOne" not "oneonone").

2. **Determine topic** — Short description (2-4 words) from current conversation context. Default to "Claude Code" at session start.

3. **Execute script** — Use the skill base directory from the skill loading message:

   **Unix/macOS/Linux:**
   ```bash
   bash <skill-base-dir>/scripts/set_title.sh "ProjectName" "Topic"
   ```

   **Windows:**
   ```bash
   pwsh -NoProfile -ExecutionPolicy Bypass -File <skill-base-dir>/scripts/set_title.ps1 "ProjectName" "Topic"
   ```

   The script reads `$TERMINAL_TITLE_EMOJI` from environment (defaults to 🎉) and sends terminal escape sequences.

4. **Continue silently** — Don't mention the title update unless user asks.

## Example

User starts Claude Code in `/Users/dev/work/oneonone/hosting` with `TERMINAL_TITLE_EMOJI=💼`, conversation is about Firebase config:

```bash
bash <skill-base-dir>/scripts/set_title.sh "OneOnOne" "Firebase Config"
# Result: 💼 OneOnOne - Firebase Config
```

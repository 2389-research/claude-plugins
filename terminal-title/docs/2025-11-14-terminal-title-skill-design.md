# Terminal Title Skill Design

**Date:** 2025-11-14
**Status:** Design Complete

## Overview

A Claude Code skill that automatically updates the terminal title to show the current project context and topic. Replaces the complex hook-based system with a simpler, fully-integrated skill approach.

## Problem Statement

The current terminal title implementation uses:
- External bash hooks (`smart-title.sh`)
- External LLM calls via `llm` CLI
- Complex JSON injection via `hookSpecificOutput`
- Multiple hook types (SessionStart, UserPromptSubmit)

This approach is noisy, complex, and requires external dependencies. We want a cleaner solution that leverages Claude's built-in intelligence.

## Solution: Pure Skill Approach

A single skill (`terminal-title`) that Claude invokes automatically when:
1. Starting a new session
2. Detecting a topic change during conversation

No external scripts, no hooks, no external LLM calls - everything happens through Claude's skill system.

## Architecture

### Skill Location

**Development:** `/Users/dylanr/work/2389/skills/terminal-title/SKILL.md`
**Production:** `~/.claude/skills/terminal-title/SKILL.md` (symlinked or copied)

### Skill Structure

```markdown
---
name: terminal-title
description: Updates terminal title with emoji, project name, and current topic. Triggered on session start and topic changes.
---

# Terminal Title Management

## Overview
[Purpose and when it applies]

## Project Detection Strategy
[How Claude determines project name]

## Title Formatting
[Format rules and examples]

## Workflow
[TodoWrite checklist for execution]

## Examples
[Various scenarios]
```

### Invocation Triggers

**Session Start:**
- Claude automatically invokes skill when session begins
- Topic: "Claude Code" (default startup title)

**Topic Change:**
- Claude detects when user starts a new conversation topic
- Claude automatically invokes skill with detected topic
- Topic detection uses Claude's understanding of conversation flow

## Project Detection Strategy

**Primary Method: Claude's Knowledge**

Claude analyzes the current context to determine the project name:
- Current working directory
- Files recently read in conversation
- Git repository context
- Package metadata (package.json, README.md, etc.)
- Overall understanding of what the project is

**Key Principle:** Use Claude's intelligence, not mechanical file checking.

**Examples:**
- `/Users/dylanr/work/2389/skills` → "Skills Repository" (not just "skills")
- `/Users/dylanr/work/2389/oneonone` → "OneOnOne"
- `~/dotfiles` → "dotfiles"

**Fallback:** If Claude can't determine context, use directory basename.

## Title Format

**Standard Format:**
```
$emoji ProjectName - Topic
```

**Components:**

1. **Emoji:** Read from `$TERMINAL_TITLE_EMOJI` environment variable
   - Set by zsh theme based on directory (💼 for work, 🎉 for fun)
   - Fallback to 🎉 if not set

2. **Project Name:**
   - Human-friendly name (from Claude's understanding)
   - Always present (even if just directory name)

3. **Topic:**
   - Provided when skill is invoked
   - Short description of current work (2-3 words)

**Examples:**
- `💼 Skills Repository - Terminal Title`
- `🎉 dotfiles - zsh config`
- `💼 OneOnOne - Firebase Config`
- `🎉 Claude Code` (session start default)

## Workflow

When the skill is invoked, Claude follows this TodoWrite checklist:

```
- [ ] Read TERMINAL_TITLE_EMOJI from environment (fallback to 🎉)
- [ ] Determine project name using Claude's knowledge
- [ ] Get topic from skill invocation context
- [ ] Format title: "$emoji ProjectName - Topic"
- [ ] Execute printf command to set terminal title
```

**Implementation Detail:**
```bash
printf '\033]0;%s %s - %s\007' "$emoji" "$project" "$topic"
```

## Settings Changes Required

**Remove all existing hooks:**
```json
{
  "hooks": {
    // Remove SessionStart section entirely
    // Remove UserPromptSubmit section entirely
  }
}
```

**Keep permissions:**
```json
{
  "permissions": {
    "allow": [
      "Bash(printf :*)"
    ]
  }
}
```

**Remove external scripts:**
- Delete `~/.claude/hooks/smart-title.sh`
- Delete `~/.claude/hooks/set-terminal-title.sh`
- Delete `~/.claude/hooks/debug-hook.sh`

## Testing Strategy

### Manual Integration Tests

Location: `tests/integration/terminal-title.test.md`

**Scenarios:**

1. **Session Start**
   - Start Claude Code in skills repo
   - Expected: `🎉 Skills Repository - Claude Code`

2. **Topic Change**
   - Say "let's work on terminal titles"
   - Expected: `🎉 Skills Repository - Terminal Titles`

3. **Project Change**
   - Navigate to different directory
   - Start new task
   - Expected: Title reflects new project

4. **Environment Variable**
   - Test with TERMINAL_TITLE_EMOJI=💼
   - Test without (should fallback to 🎉)

5. **Silent Execution**
   - Title should update without verbose output
   - No permission prompts (printf pre-approved)

### Success Criteria

- ✅ Terminal title updates correctly
- ✅ Project name is human-friendly
- ✅ Emoji correctly read from environment
- ✅ Format is consistent
- ✅ No permission prompts
- ✅ No verbose output to user
- ✅ Works on session start and topic changes

### Edge Cases

- No `TERMINAL_TITLE_EMOJI` set → Use 🎉
- Very long project names → Truncate gracefully
- Rapid topic changes → Only update when materially different

## Benefits Over Previous Approach

**Simplicity:**
- No external bash scripts
- No external LLM calls
- No complex JSON injection
- Single skill file to maintain

**Intelligence:**
- Uses Claude's understanding of projects
- Better topic detection (not just keyword matching)
- Context-aware project naming

**Maintainability:**
- All logic in one place (SKILL.md)
- No hook configuration to maintain
- Easier to debug and modify

**User Experience:**
- Silent execution (no noise)
- Automatic invocation (no manual triggering)
- Consistent formatting

## Implementation Notes

**For skill development:**
1. Create skill in this repo: `terminal-title/SKILL.md`
2. Test via symlink: `ln -s $(pwd)/terminal-title ~/.claude/skills/terminal-title`
3. Verify with manual test scenarios
4. Follow TDD approach (write tests first)

**For production:**
1. Copy or symlink to `~/.claude/skills/terminal-title/`
2. Update settings.json (remove hooks)
3. Delete old hook scripts
4. Restart Claude Code

## Open Questions

None - design is complete and validated.

## Next Steps

1. Set up git worktree for implementation
2. Create detailed implementation plan
3. Implement using TDD approach
4. Write manual integration tests
5. Test in real usage
6. Deploy to production (symlink to ~/.claude/skills/)

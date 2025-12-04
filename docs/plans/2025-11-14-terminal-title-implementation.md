# Terminal Title Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a pure-skill approach for automatic terminal title updates that replaces complex hook-based system.

**Architecture:** Single skill file that Claude invokes on session start and topic changes. Uses Claude's intelligence for project detection, reads emoji from environment, formats as `$emoji ProjectName - Topic`, executes via Bash printf.

**Tech Stack:** Claude Code Skills (YAML frontmatter + Markdown), Bash (printf for terminal escape sequences)

---

## Task 1: Create Terminal Title Skill Directory and Basic Structure

**Files:**
- Create: `terminal-title/SKILL.md`

**Step 1: Create directory**

```bash
mkdir -p terminal-title
```

**Step 2: Create SKILL.md with frontmatter and overview**

Create `terminal-title/SKILL.md`:

```markdown
---
name: terminal-title
description: Updates terminal title with emoji, project name, and current topic. Triggered on session start and topic changes.
---

# Terminal Title Management

## Overview

This skill automatically updates the terminal window title to show your current context:
- Work/fun emoji (from `$TERMINAL_TITLE_EMOJI` environment variable)
- Project name (intelligently detected by Claude)
- Current topic (what you're working on)

**Format:** `💼 ProjectName - Topic`

**When this skill runs:**
- Session start (sets title to "Claude Code")
- Topic changes (Claude detects and updates automatically)

**Example titles:**
- `💼 Skills Repository - Terminal Title`
- `🎉 dotfiles - zsh config`
- `💼 OneOnOne - Firebase Config`
```

**Step 3: Verify file created**

```bash
ls -la terminal-title/SKILL.md
```

Expected: File exists with ~30 lines

**Step 4: Commit**

```bash
git add terminal-title/SKILL.md
git commit -m "feat(terminal-title): create basic skill structure with frontmatter"
```

---

## Task 2: Add Project Detection Strategy

**Files:**
- Modify: `terminal-title/SKILL.md` (append after Overview section)

**Step 1: Add Project Detection section**

Append to `terminal-title/SKILL.md`:

```markdown

## Project Detection Strategy

**Primary method: Claude's intelligence**

Claude analyzes the current context to determine the project name:
- Current working directory and recent conversation
- Files read during the session
- Git repository information
- Package metadata (package.json, README.md, etc.)
- Overall understanding of what the project represents

**Key principle:** Use intelligent understanding, not just mechanical file parsing.

**Detection examples:**
- `/Users/dylanr/work/2389/skills` → "Skills Repository" (not just "skills")
- `/Users/dylanr/work/2389/oneonone/hosting` → "OneOnOne"
- `/Users/dylanr/dotfiles` → "dotfiles"
- `/Users/dylanr/projects/my-app` → "My App" (humanized from directory)

**Supporting evidence Claude checks:**
1. Git remote URL or repository directory name
2. `package.json` name field (Node.js projects)
3. First heading in README.md
4. Directory basename (last resort)

**Fallback:** If Claude cannot determine context, use current directory name.

**Always include project name** - Claude can always determine something meaningful.
```

**Step 2: Verify content added**

```bash
grep -c "Project Detection Strategy" terminal-title/SKILL.md
```

Expected: Output "1" (section exists)

**Step 3: Commit**

```bash
git add terminal-title/SKILL.md
git commit -m "feat(terminal-title): add intelligent project detection strategy"
```

---

## Task 3: Add Title Formatting Logic

**Files:**
- Modify: `terminal-title/SKILL.md` (append after Project Detection section)

**Step 1: Add Title Formatting section**

Append to `terminal-title/SKILL.md`:

```markdown

## Title Formatting

**Standard format:**
```
$emoji ProjectName - Topic
```

**Component details:**

**1. Emoji (from environment):**
- Read from `$TERMINAL_TITLE_EMOJI` environment variable
- Set by zsh theme based on directory context
- Common values: 💼 (work), 🎉 (fun/personal)
- Fallback: Use 🎉 if variable not set

**2. Project Name (from Claude's detection):**
- Human-friendly name, not slug format
- Proper capitalization (e.g., "OneOnOne" not "oneonone")
- Always present (use directory name as minimum)

**3. Topic (from invocation context):**
- Short description of current work (2-4 words)
- Provided when skill is invoked
- Examples: "Terminal Title", "Firebase Config", "CSS Refactor"

**Terminal escape sequence:**
```bash
printf '\033]0;%s %s - %s\007' "$emoji" "$project" "$topic"
```

**Edge cases:**
- No `$TERMINAL_TITLE_EMOJI`: Use 🎉 as default
- Very long project/topic: Let terminal handle truncation naturally
- Empty topic: Use "Claude Code" as default
```

**Step 2: Verify content added**

```bash
grep -c "Title Formatting" terminal-title/SKILL.md
```

Expected: Output "1" (section exists)

**Step 3: Commit**

```bash
git add terminal-title/SKILL.md
git commit -m "feat(terminal-title): add title formatting logic and escape sequences"
```

---

## Task 4: Add Execution Workflow

**Files:**
- Modify: `terminal-title/SKILL.md` (append after Title Formatting section)

**Step 1: Add Workflow section with TodoWrite checklist**

Append to `terminal-title/SKILL.md`:

```markdown

## Workflow

When this skill is invoked, follow this TodoWrite checklist:

**Step 1: Read emoji from environment**
```bash
emoji="${TERMINAL_TITLE_EMOJI:-🎉}"
```

If `$TERMINAL_TITLE_EMOJI` is not set, use 🎉 as fallback.

**Step 2: Determine project name**

Use Claude's understanding of the current codebase and context to determine the project name. Check:
- What you know about this project from conversation and files
- Git repository name/remote URL
- package.json name field (if Node.js project)
- README.md first heading
- Directory basename (minimum fallback)

Generate a human-friendly name (e.g., "Skills Repository" not "skills").

**Step 3: Get topic from context**

The topic should come from:
- Invocation parameter (if provided explicitly)
- Current conversation context (what user is working on)
- Default to "Claude Code" for session start

**Step 4: Format and execute title update**

```bash
printf '\033]0;%s %s - %s\007' "$emoji" "$project" "$topic"
```

Execute this command silently using the Bash tool (pre-approved via permissions).

**Step 5: Done**

Title updated. No output needed to user unless explicitly asked.
```

**Step 2: Verify content added**

```bash
grep -c "## Workflow" terminal-title/SKILL.md
```

Expected: Output "1" (section exists)

**Step 3: Commit**

```bash
git add terminal-title/SKILL.md
git commit -m "feat(terminal-title): add execution workflow with TodoWrite steps"
```

---

## Task 5: Add Usage Examples

**Files:**
- Modify: `terminal-title/SKILL.md` (append after Workflow section)

**Step 1: Add Examples section**

Append to `terminal-title/SKILL.md`:

```markdown

## Examples

### Example 1: Session Start in Skills Repository

**Context:** User starts Claude Code in `/Users/dylanr/work/2389/skills`

**Environment:** `TERMINAL_TITLE_EMOJI=💼`

**Execution:**
1. Emoji: 💼 (from environment)
2. Project: "Skills Repository" (Claude's knowledge)
3. Topic: "Claude Code" (session start default)
4. Command: `printf '\033]0;💼 Skills Repository - Claude Code\007'`

**Result:** Terminal title shows `💼 Skills Repository - Claude Code`

---

### Example 2: Topic Change to Terminal Title Work

**Context:** User says "let's work on the terminal title skill"

**Environment:** `TERMINAL_TITLE_EMOJI=💼`

**Execution:**
1. Emoji: 💼 (from environment)
2. Project: "Skills Repository" (same as before)
3. Topic: "Terminal Title" (detected from conversation)
4. Command: `printf '\033]0;💼 Skills Repository - Terminal Title\007'`

**Result:** Terminal title shows `💼 Skills Repository - Terminal Title`

---

### Example 3: Personal Project Without Environment Variable

**Context:** User working in `~/projects/dotfiles` directory

**Environment:** `TERMINAL_TITLE_EMOJI` not set

**Execution:**
1. Emoji: 🎉 (fallback default)
2. Project: "dotfiles" (from directory)
3. Topic: "zsh config" (from conversation)
4. Command: `printf '\033]0;🎉 dotfiles - zsh config\007'`

**Result:** Terminal title shows `🎉 dotfiles - zsh config`

---

### Example 4: Different Project Context

**Context:** User working in `/Users/dylanr/work/2389/oneonone/hosting`

**Environment:** `TERMINAL_TITLE_EMOJI=💼`

**Execution:**
1. Emoji: 💼 (from environment)
2. Project: "OneOnOne" (Claude knows this project name)
3. Topic: "Firebase Config" (from conversation)
4. Command: `printf '\033]0;💼 OneOnOne - Firebase Config\007'`

**Result:** Terminal title shows `💼 OneOnOne - Firebase Config`
```

**Step 2: Verify content added**

```bash
grep -c "## Examples" terminal-title/SKILL.md
```

Expected: Output "1" (section exists)

**Step 3: Commit**

```bash
git add terminal-title/SKILL.md
git commit -m "feat(terminal-title): add usage examples covering various scenarios"
```

---

## Task 6: Create Integration Test Scenarios

**Files:**
- Create: `tests/integration/terminal-title.test.md`

**Step 1: Create integration test file**

Create `tests/integration/terminal-title.test.md`:

```markdown
# Terminal Title Skill Integration Tests

Manual test scenarios to verify the terminal-title skill works correctly.

## Test 1: Session Start with Work Emoji

**Scenario:** Start Claude Code in skills repository with work emoji set

**Setup:**
```bash
export TERMINAL_TITLE_EMOJI=💼
cd /Users/dylanr/work/2389/skills
claude
```

**Expected behavior:**
- Claude automatically invokes terminal-title skill on session start
- Terminal title updates to: `💼 Skills Repository - Claude Code`
- No verbose output to user
- No permission prompts (printf pre-approved)

**Success criteria:**
- [ ] Terminal title shows correct format
- [ ] Emoji correctly read from environment
- [ ] Project name is "Skills Repository" (not "skills")
- [ ] Topic is "Claude Code"
- [ ] Update happens silently

---

## Test 2: Topic Change Detection

**Scenario:** User changes topic during conversation

**Setup:**
```bash
# In existing Claude Code session in skills repo
# Current title: 💼 Skills Repository - Claude Code
```

**User input:** "Let's work on the terminal title skill"

**Expected behavior:**
- Claude detects topic change
- Claude automatically invokes terminal-title skill
- Terminal title updates to: `💼 Skills Repository - Terminal Title`
- No verbose output to user

**Success criteria:**
- [ ] Claude detects topic change automatically
- [ ] Terminal title updates without manual trigger
- [ ] New topic reflected in title
- [ ] Update happens silently

---

## Test 3: No Environment Variable (Fallback)

**Scenario:** Environment variable not set, should use fallback emoji

**Setup:**
```bash
unset TERMINAL_TITLE_EMOJI
cd ~/projects/test-project
claude
```

**Expected behavior:**
- Claude invokes terminal-title skill on session start
- Terminal title updates to: `🎉 test-project - Claude Code`
- Uses 🎉 as fallback emoji

**Success criteria:**
- [ ] Terminal title shows fallback emoji (🎉)
- [ ] Project name detected from directory
- [ ] No errors about missing environment variable

---

## Test 4: Project Context Change

**Scenario:** Navigate to different project, verify title updates

**Setup:**
```bash
export TERMINAL_TITLE_EMOJI=💼
cd /Users/dylanr/work/2389/oneonone
claude
```

**Expected behavior:**
- Terminal title shows: `💼 OneOnOne - Claude Code`
- Project name reflects new location

**Success criteria:**
- [ ] Project name is "OneOnOne" (not "oneonone")
- [ ] Emoji correctly set to 💼
- [ ] Title format correct

---

## Test 5: Rapid Topic Changes

**Scenario:** User changes topics multiple times quickly

**Setup:**
```bash
# In Claude Code session
```

**User inputs:**
1. "Help me debug this function"
2. "Actually let's refactor the CSS instead"
3. "Wait, show me the Firebase config"

**Expected behavior:**
- Title updates to reflect most recent topic
- Only updates when materially different (not every message)
- No duplicate updates

**Success criteria:**
- [ ] Final title reflects latest topic
- [ ] Updates are appropriate (not every single message)
- [ ] No errors from rapid changes

---

## Test 6: Silent Execution Verification

**Scenario:** Verify title updates happen without visible output

**Setup:**
```bash
export TERMINAL_TITLE_EMOJI=💼
cd /Users/dylanr/work/2389/skills
claude
```

**User input:** "Let's work on CSS development"

**Expected behavior:**
- Title updates to: `💼 Skills Repository - CSS Development`
- User sees NO bash command output
- User sees NO permission prompts
- Update is completely silent

**Success criteria:**
- [ ] No visible `printf` output in conversation
- [ ] No "Running bash command..." messages
- [ ] No permission prompt for Bash tool
- [ ] Title updates correctly
```

**Step 2: Verify file created**

```bash
wc -l tests/integration/terminal-title.test.md
```

Expected: ~170 lines

**Step 3: Commit**

```bash
git add tests/integration/terminal-title.test.md
git commit -m "test(terminal-title): add integration test scenarios for manual verification"
```

---

## Task 7: Manual Testing in Current Session

**Files:**
- Test: `terminal-title/SKILL.md`

**Step 1: Symlink skill to Claude skills directory**

```bash
ln -s /Users/dylanr/work/2389/skills/.worktrees/terminal-title/terminal-title ~/.claude/skills/terminal-title
```

**Step 2: Verify symlink created**

```bash
ls -l ~/.claude/skills/terminal-title
```

Expected: Symlink points to worktree skill directory

**Step 3: Test skill can be read**

```bash
head -20 ~/.claude/skills/terminal-title/SKILL.md
```

Expected: Shows frontmatter and overview

**Step 4: Manual invocation test**

In Claude Code (this session or new one), manually invoke the skill by saying:
"Use the terminal-title skill to update the title to 'Testing'"

**Expected:**
- Skill loads successfully
- Title updates appropriately
- No errors

**Step 5: Document results**

If successful, proceed. If issues found, fix in worktree and re-test.

---

## Task 8: Update Settings to Remove Hooks

**Files:**
- Modify: `~/.claude/settings.json`

**Step 1: Read current settings**

```bash
cat ~/.claude/settings.json | jq .
```

**Step 2: Backup current settings**

```bash
cp ~/.claude/settings.json ~/.claude/settings.json.backup-$(date +%Y%m%d-%H%M%S)
```

**Step 3: Remove hooks section**

Edit `~/.claude/settings.json`, remove the entire `hooks` section:

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx -y ccstatusline@latest",
    "padding": 0
  },
  "enabledPlugins": {
    "superpowers@superpowers-marketplace": true,
    "example-skills@anthropic-agent-skills": true
  },
  "alwaysThinkingEnabled": true,
  "feedbackSurveyState": {
    "lastShownTime": 1753982508427
  },
  "permissions": {
    "allow": [
      "Bash(printf :*)"
    ]
  }
}
```

**Keep:** permissions section (Bash printf still needed)
**Remove:** entire hooks object (SessionStart, UserPromptSubmit)

**Step 4: Validate JSON syntax**

```bash
cat ~/.claude/settings.json | jq . > /dev/null && echo "Valid JSON" || echo "Invalid JSON"
```

Expected: "Valid JSON"

**Step 5: Document change**

Create commit-style message for reference:
```
refactor(settings): remove hook-based terminal title system

Removes SessionStart and UserPromptSubmit hooks now that
terminal title management is handled by pure skill approach.

Keeps Bash(printf :*) permission for skill to update titles.
```

---

## Task 9: Clean Up Old Hook Scripts

**Files:**
- Delete: `~/.claude/hooks/smart-title.sh`
- Delete: `~/.claude/hooks/set-terminal-title.sh`
- Delete: `~/.claude/hooks/debug-hook.sh` (if exists)

**Step 1: List current hooks**

```bash
ls -la ~/.claude/hooks/
```

**Step 2: Backup hooks directory**

```bash
mkdir -p ~/.claude/hooks-backup-$(date +%Y%m%d)
cp -r ~/.claude/hooks/* ~/.claude/hooks-backup-$(date +%Y%m%d)/ 2>/dev/null || true
```

**Step 3: Remove obsolete scripts**

```bash
rm ~/.claude/hooks/smart-title.sh
rm ~/.claude/hooks/set-terminal-title.sh
rm ~/.claude/hooks/debug-hook.sh 2>/dev/null || true
```

**Step 4: Verify removal**

```bash
ls ~/.claude/hooks/
```

Expected: No terminal-title related scripts remain

**Step 5: Remove debug log files**

```bash
rm ~/.claude/hooks/smart-title.log 2>/dev/null || true
rm ~/.claude/hooks/debug-hook.log 2>/dev/null || true
```

---

## Task 10: Deploy to Production

**Files:**
- Deploy: `terminal-title/` → `~/.claude/skills/terminal-title/`

**Step 1: Remove symlink (if exists from testing)**

```bash
rm ~/.claude/skills/terminal-title 2>/dev/null || true
```

**Step 2: Create production symlink**

```bash
ln -s /Users/dylanr/work/2389/skills/terminal-title ~/.claude/skills/terminal-title
```

**Step 3: Verify production symlink**

```bash
ls -l ~/.claude/skills/terminal-title
readlink ~/.claude/skills/terminal-title
```

Expected: Symlink points to main repo (not worktree)

**Step 4: Test in fresh Claude Code session**

Open new terminal, start Claude Code:
```bash
export TERMINAL_TITLE_EMOJI=💼
cd /Users/dylanr/work/2389/skills
claude
```

**Expected:**
- Terminal title automatically shows: `💼 Skills Repository - Claude Code`
- No errors
- Silent execution

**Step 5: Test topic change**

In the new session, say: "Let's test the terminal title"

**Expected:**
- Title updates to include "Terminal Title" or similar
- Automatic detection
- Silent execution

**Success criteria:**
- [ ] Skill loads automatically
- [ ] Session start updates title
- [ ] Topic changes update title
- [ ] All updates are silent
- [ ] No permission prompts
- [ ] Format is correct

---

## Task 11: Final Verification and Merge

**Files:**
- Merge: `feature/terminal-title-skill` → `main`

**Step 1: Return to worktree**

```bash
cd /Users/dylanr/work/2389/skills/.worktrees/terminal-title
```

**Step 2: Check all commits**

```bash
git log --oneline main..HEAD
```

Expected: ~8 commits for this feature

**Step 3: Run final checks**

```bash
# Verify skill structure
test -f terminal-title/SKILL.md && echo "✓ Skill exists"

# Verify tests exist
test -f tests/integration/terminal-title.test.md && echo "✓ Tests exist"

# Verify no uncommitted changes
git status --porcelain | wc -l
```

Expected: All checks pass, 0 uncommitted changes

**Step 4: Push feature branch**

```bash
git push -u origin feature/terminal-title-skill
```

**Step 5: Create pull request**

```bash
gh pr create --title "feat(terminal-title): add pure skill approach for terminal title management" --body "$(cat <<'EOF'
## Summary
- Replaces complex hook-based system with pure skill approach
- Uses Claude's intelligence for project detection
- Automatic invocation on session start and topic changes
- Silent execution with pre-approved permissions

## Implementation
- Created terminal-title/SKILL.md with complete workflow
- Added integration test scenarios
- Removed hooks and cleanup scripts from settings
- Tested manually in live sessions

## Testing
Manual integration tests cover:
- Session start behavior
- Topic change detection
- Environment variable handling
- Silent execution verification

## Migration
Users need to:
1. Update settings.json (remove hooks section)
2. Delete old hook scripts from ~/.claude/hooks/
3. Symlink or copy skill to ~/.claude/skills/terminal-title/

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**Step 6: After PR approval, merge to main**

```bash
# Switch to main
cd /Users/dylanr/work/2389/skills
git checkout main

# Merge feature branch
git merge --no-ff feature/terminal-title-skill -m "feat(terminal-title): merge terminal title skill implementation"

# Push to origin
git push origin main
```

**Step 7: Clean up worktree**

```bash
cd /Users/dylanr/work/2389/skills
git worktree remove .worktrees/terminal-title
git branch -d feature/terminal-title-skill
```

**Step 8: Verify production symlink still works**

```bash
ls -l ~/.claude/skills/terminal-title
cat ~/.claude/skills/terminal-title/SKILL.md | head -10
```

Expected: Symlink works, points to main branch skill

---

## Success Criteria

**Skill Implementation:**
- [ ] terminal-title/SKILL.md created with all sections
- [ ] Frontmatter includes name and description
- [ ] Project detection strategy documented
- [ ] Title formatting rules complete
- [ ] Workflow with TodoWrite steps included
- [ ] Examples cover multiple scenarios

**Testing:**
- [ ] Integration test scenarios created
- [ ] Manual testing completed successfully
- [ ] Session start works correctly
- [ ] Topic changes detected automatically
- [ ] Silent execution verified

**Migration:**
- [ ] Settings.json updated (hooks removed)
- [ ] Old hook scripts deleted
- [ ] Skill deployed to production
- [ ] Fresh session tests pass

**Code Quality:**
- [ ] All changes committed with clear messages
- [ ] Branch pushed to remote
- [ ] Pull request created with description
- [ ] Merged to main after approval
- [ ] Worktree cleaned up

---

## Notes

**Key dependencies:**
- Bash tool with printf pre-approved: `Bash(printf :*)`
- Environment variable: `$TERMINAL_TITLE_EMOJI` (optional)

**Skills referenced:**
- None - this is a standalone skill

**Documentation updated:**
- Design document already exists at `docs/plans/2025-11-14-terminal-title-skill-design.md`
- Integration tests document the usage
- SKILL.md itself serves as primary documentation

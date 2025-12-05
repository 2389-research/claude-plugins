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

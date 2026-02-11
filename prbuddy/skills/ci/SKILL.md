---
name: prbuddy:ci
description: CI/workflow monitoring and fixing. Triggers on "CI failing", "workflow failed", "checks red", "build broken", "tests failing", "rerun workflows".
---

<!-- ABOUTME: CI monitoring sub-skill for prbuddy -->
<!-- ABOUTME: Fetches logs, diagnoses failures, fixes with prevention -->

# prbuddy:ci

## Overview

Monitors CI/workflow status, diagnoses failures, fixes issues, and implements systematic prevention.

## Checkpoint Discipline

Check CI at these moments (not continuously):
- After push settles (not during burst commits)
- Before requesting review
- Before declaring work done
- Before merge

## Workflow

### Step 1: Get CI Status

```bash
gh pr checks --json name,state,bucket,conclusion,link,workflow
```

**Status interpretation:**
- `bucket: "pass"` → Check passed
- `bucket: "fail"` → Check failed
- `bucket: "pending"` → Still running
- `bucket: "skipping"` → Skipped
- `bucket: "cancel"` → Cancelled

### Step 2: Handle Status

**If all passing:**
```
✓ All CI checks passing (N/N)

Ready for next step.
```

**If pending:**
```
CI checks in progress (N/M complete)

✓ lint (passed)
✓ typecheck (passed)
⏳ test (running)
⏳ build (queued)

Check again:
- Before requesting review
- Before declaring done
```

**If failed:** Continue to diagnosis

### Step 3: Identify Failed Runs

```bash
# Get branch name (with fallback for detached HEAD)
BRANCH=$(git branch --show-current)
if [ -z "$BRANCH" ]; then
  BRANCH=$(gh pr view --json headRefName -q .headRefName)
fi

gh run list --branch "$BRANCH" --json databaseId,name,status,conclusion --limit 10
```

Filter for `conclusion: "failure"`.

### Step 4: Fetch Failed Logs

For each failed run:

```bash
gh run view <run-id> --log-failed
```

This fetches only the logs for failed steps.

### Step 5: Diagnose Root Cause

Analyze the logs to identify:
1. **What failed** - Which test/build step
2. **Error message** - The actual error
3. **Root cause** - Why it happened
4. **Affected files** - Which code needs fixing

#### Flaky Test vs Real Failure

Before fixing, determine if this is a flaky test or real failure:

**Signs of flaky test (consider rerun):**
- Same test passed on previous commits
- Error involves timing, network, or race conditions
- "Timeout" or "connection refused" errors
- Test passes locally but fails in CI

**Signs of real failure (fix required):**
- New test that never passed
- Error directly relates to changed code
- Assertion failure on business logic
- Type/syntax errors

**If flaky:** Try `gh run rerun <id> --failed` first. If it fails again, investigate further.

### Step 6: Consult PAL (if non-trivial)

For complex failures, use PAL for expert opinion:

```
mcp__pal__chat: "CI failure diagnosis:

Error: [error message]
Context: [relevant code/config]

What's the root cause and recommended fix?"
```

### Step 7: Fix the Acute Issue

Make the code changes to fix the immediate failure.

### Step 8: Identify Systematic Prevention

Ask: "What would have caught this earlier?"

**Prevention hierarchy (prefer higher):**
1. **Linter rule** - Add ESLint/Prettier/etc. rule
2. **Pre-commit hook** - Add check to `.pre-commit-config.yaml`
3. **CI check** - Add earlier/faster check
4. **Type system** - Stricter TypeScript config
5. **Test** - Add test for this case
6. **Documentation** - Update CLAUDE.md if agent guidance

### Step 9: Commit Both Fixes

```bash
git add [changed files]
git commit -m "fix: [description]

- Fixed: [acute issue]
- Prevention: [systematic change]"
```

### Step 10: Push and Monitor

```bash
git push
```

Report:
```
Pushed fix. CI will re-run automatically.

Check status: /prbuddy:ci

Or watch in browser: gh pr checks --web
```

## Example: Test Failure

```
Checking CI status for PR #42...

❌ 1 of 4 checks failed

Failed: test (run 987654321)

Fetching logs...

Error in tests/auth.test.ts:
  TypeError: Cannot read property 'email' of undefined
  at validateUser (src/auth.ts:45)

Root cause: Missing null check when user object is undefined.

Fixing:
1. Added null check in src/auth.ts:45
2. Added test case for undefined user
3. Prevention: Enabled strictNullChecks in tsconfig.json

Committing...
Pushing...

✓ Fix pushed. Monitor with: /prbuddy:ci
```

## Commands Reference

| Task | Command |
|------|---------|
| Check status | `gh pr checks --json name,state,bucket` |
| List runs | `gh run list --branch <branch> --json databaseId,name,conclusion` |
| View run | `gh run view <id>` |
| Failed logs | `gh run view <id> --log-failed` |
| Full logs | `gh run view <id> --log` |
| Watch run | `gh run watch <id>` |
| Rerun failed | `gh run rerun <id> --failed` |
| Rerun all | `gh run rerun <id>` |

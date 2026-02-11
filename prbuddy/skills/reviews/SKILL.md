---
name: prbuddy:reviews
description: Review comment triage and handling. Triggers on "review comments", "address feedback", "reviewer asked", "changes requested", "handle comments", "triage reviews".
---

<!-- ABOUTME: Review comment handling sub-skill for prbuddy -->
<!-- ABOUTME: Triages comments, fixes critical, creates issues for nitpicks -->

# prbuddy:reviews

## Overview

Discovers and triages PR review comments. Fixes critical issues (aligned with PR goals) and creates GitHub issues for nitpicks (valid but out of scope).

**Requires:** `gh-pr-review` extension

```bash
gh extension install agynio/gh-pr-review
```

## Workflow

### Step 1: Get PR Context

```bash
gh pr view --json number,title,body,closingIssuesReferences
```

Extract:
- **PR goals** from title and body
- **Linked issues** from `closingIssuesReferences`

These define what's "critical" vs "nitpick".

### Step 2: Fetch Review Threads

```bash
gh pr-review threads list --unresolved --not_outdated -R <owner/repo> <pr-number>
```

This returns unresolved, non-outdated review threads.

### Step 3: Triage Each Comment

For each thread, classify:

**CRITICAL** if comment relates to:
- Linked issues (`closingIssuesReferences`)
- Goals stated in PR title/body
- Security vulnerabilities (always critical)
- Breaking changes to public API

**NITPICK** if comment:
- Suggests improvements unrelated to PR goals
- Points out style issues not enforced by linters
- Proposes refactoring beyond PR scope
- Asks questions not requiring code changes

### Step 4: Handle Critical Comments

For each critical comment:

#### 4a: Analyze the Feedback

Read the comment carefully. Understand what the reviewer wants.

#### 4b: Consult PAL

```
mcp__pal__chat: "Review comment analysis:

Reviewer said: [comment text]
PR goal: [from PR body/linked issues]
Code context: [relevant file/function]

What's the best fix approach considering the reviewer's expertise?"
```

#### 4c: Implement Fix

Make the code changes.

#### 4d: Identify Prevention

What systematic change would prevent this class of issue?

- Linter rule?
- Type constraint?
- Test case?
- Documentation?

#### 4e: Commit

```bash
git add [files]
git commit -m "fix: [description] (addresses review)

- Fixed: [what was fixed]
- Prevention: [systematic change]"
```

#### 4f: Reply to Thread

```bash
gh pr-review comments reply \
  --thread-id <thread-id> \
  --body "Fixed in [commit].

Changes:
- [what was changed]

Prevention added:
- [systematic change]" \
  -R <owner/repo> <pr-number>
```

#### 4g: Resolve Thread

```bash
gh pr-review threads resolve --thread-id <thread-id> -R <owner/repo> <pr-number>
```

### Step 5: Handle Nitpick Comments

For each nitpick comment:

#### 5a: Search for Duplicates

```bash
gh search issues --repo <owner/repo> "<search terms from comment>"
```

Check if similar issue already exists.

#### 5b: Create Issue (if no duplicate)

Determine appropriate labels:

```bash
gh label list --json name,description
```

If needed label doesn't exist:

```bash
gh label create "from-review" --color "c5def5" --description "Created from PR review comment"
```

Create the issue:

```bash
gh issue create \
  --title "<concise title>" \
  --body "## Context

From PR #<number> review by @<reviewer>.

## Original Comment

> <quoted comment>

## Suggested Action

<what should be done>

## Related

- PR: #<number>
- File: <path>
- Line: <line number>" \
  --label "from-review,<type-label>"
```

**Type labels:**
- `tech-debt` - Refactoring suggestions
- `documentation` - Doc improvements
- `enhancement` - Feature suggestions
- `good-first-issue` - Simple fixes

#### 5c: Reply to Thread

```bash
gh pr-review comments reply \
  --thread-id <thread-id> \
  --body "Good catch! This is outside the scope of this PR (focused on [PR goal]).

Created issue #<number> to track this." \
  -R <owner/repo> <pr-number>
```

#### 5d: Resolve Thread

```bash
gh pr-review threads resolve --thread-id <thread-id> -R <owner/repo> <pr-number>
```

### Step 6: Push Changes

```bash
git push
```

### Step 7: Report Summary

```
Review Comments Handled

Critical (fixed):
- @reviewer1 on src/api.ts:23 - Added input validation [commit abc123]
  Prevention: Added eslint-plugin-security rule

Nitpicks (issues created):
- @reviewer1 on src/utils.ts:15 - Issue #52 (refactor helper)
- @reviewer2 on README.md:45 - Issue #53 (fix typo)

All threads resolved. Changes pushed.
```

## Commands Reference

| Task | Command |
|------|---------|
| List threads | `gh pr-review threads list --unresolved --not_outdated -R owner/repo <pr>` |
| Reply | `gh pr-review comments reply --thread-id <id> --body <msg> -R owner/repo <pr>` |
| Resolve | `gh pr-review threads resolve --thread-id <id> -R owner/repo <pr>` |
| Search issues | `gh search issues --repo owner/repo "<terms>"` |
| Create issue | `gh issue create --title --body --label` |
| List labels | `gh label list --json name` |
| Create label | `gh label create <name> --color <hex> --description <desc>` |

## Triage Decision Tree

```
Is this comment about...

├── Security vulnerability?
│   └── CRITICAL (always)
│
├── Something in closingIssuesReferences?
│   └── CRITICAL
│
├── A goal stated in PR title/body?
│   └── CRITICAL
│
├── Breaking change to public API?
│   └── CRITICAL
│
└── Something else?
    └── NITPICK → Create issue
```

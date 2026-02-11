# prbuddy Plugin Design

**Date:** 2026-02-11
**Status:** Draft
**Author:** Claude + Clint

## Overview

prbuddy is a Claude Code plugin that helps agents discover, triage, and respond to PR feedback. It handles both CI/workflow failures and human review comments, fixing immediate issues and implementing systematic prevention measures.

## Philosophy

**"Fix the acute issue AND prevent the class of error from recurring."**

Every fix should include a "prevention delta" - a change that stops similar issues in the future:
- Linter rules, pre-commit hooks, CI checks (automated enforcement)
- CLAUDE.md updates (agent guidance)
- ADRs or boundary rules (architectural decisions)

## Skills

### `/prbuddy` (Orchestrator)

The "do the right thing" command. Runs CI check, then reviews, with prevention batched at the end.

**Flow:**
1. Detect PR from current branch (`gh pr view --json`)
2. Check CI status (`gh pr checks --json`)
3. If CI failing → invoke `/prbuddy:ci` workflow
4. When CI green → invoke `/prbuddy:reviews` workflow
5. Batch prevention proposals, confirm before applying high-impact changes
6. Emit summary

**Auto-detection keywords:** "make PR green", "ready to merge", "fix PR", "handle PR", "check my PR"

### `/prbuddy:ci`

Direct entry to CI monitoring and fixing.

**Flow:**
1. Get PR checks status (`gh pr checks --json`)
2. If all green → report success, exit
3. If pending → report status, suggest checkpoint timing
4. If failed:
   a. List failed workflow runs (`gh run list`)
   b. For each failed run, fetch logs (`gh run view <id> --log-failed`)
   c. Diagnose root cause
   d. Fix the acute issue (code change)
   e. Identify systematic prevention (linter rule, pre-commit hook, CI check)
   f. Commit both fixes together
   g. Push and report

**Checkpoint discipline:** Agents should check CI at these moments:
- After push settles (not during burst commits)
- Before requesting review
- Before declaring work done
- Before merge

**Auto-detection keywords:** "CI failing", "workflow failed", "check status", "checks red", "build broken"

### `/prbuddy:reviews`

Direct entry to review comment handling.

**Flow:**
1. Fetch unresolved, non-outdated review threads (`gh pr-review threads list --unresolved --not_outdated`)
2. Get PR goals from:
   - Linked issues (`closingIssuesReferences` from `gh pr view --json`)
   - PR body/description
3. Triage each comment:
   - **Critical:** Aligns with PR goals/linked issues → fix immediately
   - **Nitpick/Orthogonal:** Valid feedback but outside PR scope → create issue
4. For critical comments:
   a. Analyze the feedback
   b. Consult PAL for expert opinion on fix approach
   c. Implement fix
   d. Identify systematic prevention
   e. Commit changes
   f. Reply to thread explaining what was done (`gh pr-review comments reply`)
   g. Resolve thread (`gh pr-review threads resolve`)
5. For nitpick comments:
   a. Search for duplicate issues (`gh search issues --repo`)
   b. If no duplicate, create issue with proper labels (`gh issue create --label`)
   c. Create labels as needed (`gh label create`)
   d. Reply to thread with issue link
   e. Resolve thread
6. Push all changes
7. Report summary

**Auto-detection keywords:** "review comments", "feedback", "address comments", "reviewer asked", "changes requested"

## PR Detection

Auto-detect PR from current branch with fallback:

```bash
gh pr view --json number,title,body,url,closingIssuesReferences,headRefName
```

If no PR found or ambiguous, ask user for PR number/URL.

## GitHub CLI Commands

All GitHub interactions use `gh` CLI exclusively.

### Core Commands

| Task | Command |
|------|---------|
| PR metadata | `gh pr view --json number,title,body,closingIssuesReferences` |
| CI status | `gh pr checks --json` |
| Workflow runs | `gh run list --branch <branch>` |
| Failed logs | `gh run view <id> --log-failed` |
| Rerun failed | `gh run rerun <id> --failed` |

### Extension Required: gh-pr-review

```bash
gh extension install agynio/gh-pr-review
```

| Task | Command |
|------|---------|
| List threads | `gh pr-review threads list --unresolved --not_outdated -R owner/repo <pr>` |
| Reply | `gh pr-review comments reply --thread-id <id> --body <msg> -R owner/repo <pr>` |
| Resolve | `gh pr-review threads resolve --thread-id <id> -R owner/repo <pr>` |

### Issue Management

| Task | Command |
|------|---------|
| Search (dedup) | `gh search issues --repo owner/repo "<terms>"` |
| Create | `gh issue create --title "<title>" --body "<body>" --label "<labels>"` |
| List labels | `gh label list --json name,color,description` |
| Create label | `gh label create "<name>" --color "<hex>" --description "<desc>"` |

## Triage Logic

### Determining Criticality

A comment is **critical** if it relates to:
1. Issues explicitly linked in the PR (`closingIssuesReferences`)
2. Goals stated in the PR body/title
3. Security vulnerabilities (always critical)
4. Breaking changes to public API

A comment is **nitpick/orthogonal** if it:
1. Suggests improvements unrelated to PR goals
2. Points out style issues not enforced by linters
3. Proposes refactoring beyond the PR scope
4. Asks questions that don't require code changes

### Expert Consultation

For non-trivial fixes, consult PAL:
- Get expert opinion on fix approach
- Consider reviewer's suggestion alongside best practices
- Validate that the fix addresses root cause

## Prevention Delta

Every fix should include prevention. Priority order:

1. **Tooling** (strongest) - Linter rules, pre-commit hooks, CI checks
   - If the error is statically detectable, add a rule
   - Example: Missing null check → enable `strictNullChecks` in tsconfig

2. **Templates/Scaffolds** - Code generators that produce correct code by default
   - Example: Repeated pattern error → add template with correct implementation

3. **Boundaries** - Architectural enforcement via tools like `dependency-cruiser`
   - Example: Layer violation → add boundary rule

4. **Documentation** - CLAUDE.md, playbooks, checklists
   - Example: Judgment call → add heuristic to CLAUDE.md

5. **Issues** - Track for future automation
   - Example: Complex to automate now → create "automation candidate" issue

## Error Handling

### No PR Found
```
No PR found for current branch 'feature-xyz'.
Options:
1. Create a PR: gh pr create
2. Specify PR number: /prbuddy 123
3. Specify PR URL: /prbuddy https://github.com/owner/repo/pull/123
```

### CI Still Running
```
CI checks are still running (3/5 complete).
- ✓ lint (passed)
- ✓ typecheck (passed)
- ⏳ test (running - 2m elapsed)
- ⏳ build (queued)
- ⏳ deploy-preview (queued)

Check again at these checkpoints:
- Before requesting review
- Before declaring done
```

### gh-pr-review Extension Missing
```
The gh-pr-review extension is required for review comment handling.

Install it:
  gh extension install agynio/gh-pr-review

Then retry: /prbuddy:reviews
```

## Plugin Structure

```
prbuddy/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── SKILL.md              # /prbuddy orchestrator
│   ├── ci/
│   │   └── SKILL.md          # /prbuddy:ci
│   └── reviews/
│       └── SKILL.md          # /prbuddy:reviews
├── docs/
│   ├── examples/
│   │   ├── ci-failure-fix.md
│   │   └── review-triage.md
│   └── plans/
│       └── 2026-02-11-prbuddy-design.md
├── CLAUDE.md
└── README.md
```

## Configuration

### plugin.json

```json
{
  "name": "prbuddy",
  "description": "PR health assistant - monitors CI, triages review comments, fixes issues with prevention",
  "version": "1.0.0",
  "commands": []
}
```

### Prerequisites

The skill should check for and guide installation of:
- `gh` CLI (authenticated)
- `gh-pr-review` extension

## Example Workflows

### Example 1: CI Failure Fix

```
User: /prbuddy:ci

Agent: Checking CI status for PR #42...

❌ CI failed: 1 of 4 checks failed

Failed: test (run 987654321)
Fetching logs...

Error in tests/auth.test.ts:
  TypeError: Cannot read property 'email' of undefined
  at validateUser (src/auth.ts:45)

Root cause: Missing null check when user object is undefined.

Fixing:
1. Added null check in src/auth.ts:45
2. Added test case for undefined user
3. Prevention: Enabled strictNullChecks in tsconfig.json (catches this class of error)

Pushing changes...
Monitoring re-run...

✓ All checks passed. Ready for review.
```

### Example 2: Review Comment Triage

```
User: /prbuddy:reviews

Agent: Fetching review comments for PR #42...

Found 3 unresolved threads:

1. [CRITICAL] @reviewer1 on src/api.ts:23
   "This endpoint doesn't validate the user ID parameter - could allow unauthorized access"
   → Relates to: Issue #38 (Auth improvements)

2. [NITPICK] @reviewer1 on src/utils.ts:15
   "Consider extracting this into a helper function for reuse"
   → Orthogonal to PR goals

3. [NITPICK] @reviewer2 on README.md:45
   "Typo: 'recieve' should be 'receive'"
   → Orthogonal to PR goals

Handling critical comment #1...
- Consulting PAL for secure validation approach
- Added input validation with proper error handling
- Prevention: Added eslint-plugin-security rule for unvalidated params
- Replied and resolved thread

Creating issues for nitpicks...
- Searched for duplicates: none found
- Created issue #52: "Extract reusable helper from utils.ts" [refactor, tech-debt]
- Created issue #53: "Fix typo in README" [documentation, good-first-issue]
- Replied to threads with issue links
- Resolved threads

Pushing changes...

✓ All review comments addressed.
- 1 critical fix committed (with prevention)
- 2 issues created for follow-up
```

## Success Criteria

1. **Reduces PR iteration cycles** - Fewer round-trips between agent and reviewer
2. **Catches issues earlier** - Checkpoint discipline surfaces failures before "done"
3. **Prevents recurrence** - Every fix includes systematic prevention
4. **Clean issue trail** - Nitpicks become trackable issues, not lost comments
5. **Expert-informed fixes** - PAL consultation improves fix quality

## Open Questions

1. **Thread reply format** - What template for automated replies? Should include:
   - What was fixed
   - Prevention added
   - (For nitpicks) Issue link

2. **Label taxonomy** - Standard labels for issues created from nitpicks:
   - `from-review` (origin)
   - `tech-debt`, `refactor`, `documentation` (type)
   - `good-first-issue` (for simple fixes)

3. **Batch vs incremental push** - Push after each fix, or batch all fixes then push once?
   - Recommendation: Batch to reduce CI churn

## References

- [gh CLI documentation](https://cli.github.com/manual)
- [gh-pr-review extension](https://github.com/agynio/gh-pr-review)
- [GitHub CLI 2.86.0 release](https://github.com/cli/cli/releases/tag/v2.86.0)

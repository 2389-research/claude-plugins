# Omakase-off Development Skill - Design

## Overview

**Purpose:** Parallelize the "explore alternatives" phase by implementing multiple approaches simultaneously, then letting real tests + an LLM judge determine the winner.

**When to use:**
- User has genuine uncertainty about approach
- Multiple valid implementation paths exist
- User wants to see options play out rather than decide upfront

**Core flow:**
```
Brainstorm (with slot collection)
    |
Generate N implementation plans (capped at 5-6)
    |
Create N worktrees + branches
    |
Dispatch N parallel subagents (one per worktree)
    |
Run scenario tests on all passing implementations
    |
LLM Judge evaluates survivors (stub for now)
    |
Present winner + explanation to user
    |
User approves -> finish-branch for winner, cleanup losers
```

---

## Phase 1: Slot Collection (Modified Brainstorming)

### Real-time Collection (Primary)

During brainstorming, when presenting options, user can respond "try both" or "slot" instead of choosing. That decision becomes a branch point. Continue brainstorming with a placeholder choice, noting it's a slot.

### LLM Alternative Review (Secondary)

After brainstorming completes, the LLM reviews all decisions made and proposes additional alternatives worth exploring. This makes slot collection more proactive - the LLM identifies options the user might not have considered.

### Slot Tracking Format

```
Slots collected:
1. Data storage: [SQLite, PostgreSQL]
2. Auth approach: [JWT, session-based]

Fixed decisions:
- API style: REST (user chose)
- Framework: Express (project constraint)
```

### Combination Explosion Handling

- Calculate total combinations (e.g., 2x2 = 4)
- If <= 5-6: proceed with all
- If > 6: present combinations, ask user to pick top 5-6
- Smart pruning: flag obviously incompatible combinations (if any)

---

## Phase 2: Plan Generation

### Directory Structure

```
docs/plans/<feature>-<YYYYMMDD>/
  plan.md                    # Original brainstorm design (before variants)
  result.md                  # Final report (written at end)
  variant-<slug-1>/
    plan.md                  # Full implementation plan for this variant
  variant-<slug-2>/
    plan.md
  ...
```

**Naming conventions:**
- Feature dir: `<short-feature>-<YYYYMMDD>` (e.g., `auth-20251212`, `caching-20251215`)
- Variant dirs: `variant-<descriptive-slug>` derived from slot choices (e.g., `variant-jwt-sqlite`)

### Plan Generation Process

- For each combination, generate a full implementation plan using `writing-plans` skill
- Plans are independent - each could stand alone
- Each plan goes in its variant subdirectory

---

## Phase 3: Implementation

### Worktree Setup

Use `using-git-worktrees` skill for each implementation:
- Branch naming: `test-kitchen/<feature>/<variant-name>` (e.g., `test-kitchen/auth/jwt-sqlite`)
- All worktrees created before any implementation starts
- Each worktree verified with baseline tests before subagent starts

### Parallel Execution

Dispatch one `general-purpose` subagent per worktree. Each subagent:
- Works in its assigned worktree
- Uses `executing-plans` skill to implement its specific plan
- Follows TDD per `test-driven-development` skill
- Reports progress periodically
- Commits work as it goes

### Progress Monitoring

The orchestrator periodically checks all subagents and reports status:
```
Implementation status:
- variant-jwt-sqlite: 3/5 tasks complete
- variant-jwt-postgres: 2/5 tasks complete
- variant-session-sqlite: FAILED at task 2
```

User can manually kill slow/stuck implementations at any time.

---

## Phase 4: Evaluation & Selection

### Scenario Testing

- Once an implementation completes, run `scenario-testing` skill against it
- Same scenarios run against all implementations (apples-to-apples comparison)
- Implementation must pass all scenarios to be considered a "survivor"

### Failure Elimination

| Situation | Action |
|-----------|--------|
| Implementation fails tests | Eliminated, worktree marked for cleanup |
| Implementation fails scenarios | Eliminated |
| Subagent crashes/stalls | User can manually eliminate |
| All implementations fail | Report failures, ask user how to proceed |
| Only one survives | Auto-select (no judge needed) |

### LLM Judge (Stub)

**Interface:**
- Input: List of surviving implementations + their code + test results
- Output: Ranked recommendation with explanation

**Current behavior (stub):**
- If only one survivor: auto-select
- If multiple survivors: present all to user for manual selection

**Future:** Full judge implementation as separate development effort.

### User Approval

Present winner (or candidates if judge not yet implemented):
- Which approach won
- Why (from judge explanation or "only survivor")
- Key differences between approaches

User confirms selection or picks different option.

---

## Phase 5: Cleanup & Finishing

### Winner Handling

Use `finishing-a-development-branch` skill on winning implementation. User gets standard 4 options:
1. Merge locally
2. Create PR
3. Keep as-is
4. Discard

Winner's worktree handled per that skill's flow.

### Loser Cleanup

All non-winning implementations get deleted:
```bash
git worktree remove <worktree-path>
git branch -D test-kitchen/<feature>/<variant>
```

### Artifacts Preserved

- All generated plans (even for losers) - useful for future reference
- Judge's evaluation/reasoning (when implemented)
- `result.md` summarizing what was tried and why winner won

### Final Report (result.md)

```markdown
# Test Kitchen Results: <feature>

## Summary
Tried 4 approaches for implementing <feature>.

## Variants

### variant-jwt-sqlite (WINNER)
- Status: PASSED all tests and scenarios
- Selected: Yes

### variant-jwt-postgres
- Status: PASSED all tests and scenarios
- Selected: No (eliminated by judge)

### variant-session-sqlite
- Status: FAILED scenario 3
- Selected: No

### variant-session-postgres
- Status: FAILED tests
- Selected: No

## Winner Selection
Reason: <judge explanation or "only survivor">

## Cleanup
- Worktrees removed: 3
- Branches deleted: 3
- Plans preserved: Yes (this directory)
```

---

## Skill Integration

### Skills Orchestrated

| Skill | How it's used |
|-------|---------------|
| `brainstorming` | Modified flow with slot collection |
| `writing-plans` | Generate plan for each variant |
| `using-git-worktrees` | Create worktree per variant |
| `executing-plans` | Each subagent uses this to implement |
| `test-driven-development` | Subagents follow TDD |
| `scenario-testing` | Validate all survivors |
| `finishing-a-development-branch` | Handle winner |

### New Components

| Component | Status |
|-----------|--------|
| Slot collection logic | Part of this skill |
| Combination generator | Part of this skill |
| Progress monitor | Part of this skill |
| LLM Judge | Stub (future development) |

---

## Failure Modes & Edge Cases

### Long-Running Implementations

- No hard timeout (implementations may take hours)
- Periodic status reports to user
- User can manually kill slow/stuck implementations

### Combination Overflow

- Cap at 5-6 implementations maximum
- If combinations exceed cap: present all options, ask user to pick top 5-6
- Smart pruning removes obviously incompatible combinations

### All Implementations Fail

- Report all failures with reasons
- Ask user how to proceed:
  - Retry with modifications
  - Pick "least bad" option to debug
  - Abandon test-kitchen, try single approach

### Resource Considerations

- Each worktree requires disk space + dependency install
- Each subagent consumes API tokens
- Skill should warn user before spawning many implementations

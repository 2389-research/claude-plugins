---
name: showdown
description: Same design, multiple parallel runners compete using hosted LLM for code generation. Each runner creates own plan, generates code via Cerebras, pick the best. Part of speed-run pipeline.
---

# Showdown

Same design, multiple runners compete. Each runner creates their own implementation plan from the shared design, then generates code via hosted LLM. Natural variation emerges from independent planning decisions.

**Announce:** "I'm using speed-run:showdown for parallel competition via hosted LLM."

**Key insight:** Don't share a pre-made implementation plan. Each runner generates their own plan from the design doc, ensuring genuine variation.

## Directory Structure

```
docs/plans/<feature>/
  design.md                    # Input: from brainstorming
  speed-run/
    showdown/
      runner-1/
        plan.md                # Runner 1's implementation plan
      runner-2/
        plan.md                # Runner 2's implementation plan
      runner-3/
        plan.md                # Runner 3's implementation plan
      result.md                # Showdown results and winner
```

## Skill Dependencies

| Reference | Primary (if installed) | Fallback |
|-----------|------------------------|----------|
| `writing-plans` | `superpowers:writing-plans` | Each runner writes their own plan |
| `executing-plans` | `superpowers:executing-plans` | Execute plan tasks sequentially |
| `parallel-agents` | `superpowers:dispatching-parallel-agents` | Dispatch multiple Task tools in single message |
| `git-worktrees` | `superpowers:using-git-worktrees` | `git worktree add .worktrees/<name> -b <branch>` |
| `tdd` | `superpowers:test-driven-development` | RED-GREEN-REFACTOR cycle |
| `verification` | `superpowers:verification-before-completion` | Run command, read output, THEN claim status |
| `fresh-eyes` | `fresh-eyes-review:skills` (2389) | 2-5 min review for security, logic, edge cases |
| `judge` | `speed-run:judge` | Scoring framework with checklists (MUST invoke at Phase 4) |
| `scenario-testing` | `scenario-testing:skills` (2389) | `.scratch/` E2E scripts, real dependencies |
| `finish-branch` | `superpowers:finishing-a-development-branch` | Verify tests, present options, cleanup |

## Phase 1: Complexity Assessment

**Read design doc and assess:**
- Feature scope (components, integrations, data models)
- Risk areas (auth, payments, migrations, concurrency)
- Estimated implementation size

**Map to runner count:**

| Complexity | Scope | Risk signals | Runners |
|------------|-------|--------------| --------|
| Low | Small feature | None | 2 |
| Medium | Medium feature | Some | 3 |
| High | Large feature | Several | 4 |
| Very high | Major system | Critical areas | 5 |

**Announce:**
```
Complexity assessment: medium feature, touches auth
Spawning 3 parallel runners
Each will create their own implementation plan from the design.
All runners will use hosted LLM (Cerebras) for code generation.
```

## Phase 2: Parallel Execution

**Setup worktrees:**
```
.worktrees/speed-run-runner-1/
.worktrees/speed-run-runner-2/
.worktrees/speed-run-runner-3/

Branches:
<feature>/speed-run/runner-1
<feature>/speed-run/runner-2
<feature>/speed-run/runner-3
```

**CRITICAL: Dispatch ALL runners in a SINGLE message**

Use `parallel-agents` pattern. Send ONE message with multiple Task tool calls:

```
<single message>
  Task(runner-1, run_in_background: true)
  Task(runner-2, run_in_background: true)
  Task(runner-3, run_in_background: true)
</single message>
```

**Runner prompt (each gets same instructions with their runner number):**

```
You are runner N of M in a speed-run showdown.
Other runners are implementing the same design in parallel.
Each runner creates their own implementation plan - your approach may differ from others.

**Your working directory:** /path/to/.worktrees/speed-run-runner-N
**Design doc:** docs/plans/<feature>/design.md
**Your plan location:** docs/plans/<feature>/speed-run/showdown/runner-N/plan.md

**Your workflow:**
1. Read the design doc thoroughly
2. Use writing-plans skill to create YOUR implementation plan
   - Save to: docs/plans/<feature>/speed-run/showdown/runner-N/plan.md
   - Make your own architectural decisions
   - Don't try to guess what other runners will do
3. For each implementation task, use hosted LLM for first-pass code generation:
   - Write a contract prompt (DATA CONTRACT + API CONTRACT + ALGORITHM + RULES)
   - Call: mcp__speed-run__generate_and_write_files
   - Run tests
   - Fix failures with Claude Edit tool (surgical 1-4 line fixes)
   - Re-test until passing
4. Follow TDD for each task
5. Use verification before claiming done

**Code generation rules:**
- Use mcp__speed-run__generate_and_write_files for algorithmic code
- Use mcp__speed-run__generate for text/docs generation
- Use Claude direct ONLY for surgical fixes and multi-file coordination
- Write contract prompts with exact data models, routes, and algorithm steps

**Report when done:**
- Plan created: yes/no
- All tasks completed: yes/no
- Test results (output)
- Files changed count
- Hosted LLM calls made
- Fix cycles needed
- Any issues encountered
```

**Monitor progress:**
```
Showdown status (design: auth-system):
- runner-1: planning... -> generating via Cerebras -> fixing 2/3 -> tests passing
- runner-2: planning... -> generating via Cerebras -> tests passing
- runner-3: planning... -> generating via Cerebras -> fixing 1/2 -> tests passing
```

## Phase 3: Judging

**Step 1: Gate check**
- All tests pass
- Design adherence - implemented what the design specified

**Step 2: Check for identical implementations**

Before fresh-eyes, diff the implementations:
```bash
diff -r .worktrees/speed-run-runner-1/src .worktrees/speed-run-runner-2/src
```

If implementations are >95% identical, note this - the planning step didn't create enough variation. Still proceed but flag in results.

**Step 3: Fresh-eyes on survivors**
```
Starting fresh-eyes review of runner-1 (N files)...
Checking: security, logic errors, edge cases
Fresh-eyes complete: 1 minor issue
```

### Step 4: Invoke Judge Skill

**CRITICAL: Invoke `speed-run:judge` now.**

The judge skill contains the full scoring framework with checklists. Invoking it fresh ensures the scoring format is followed exactly.

```text
Invoke: speed-run:judge

Context to provide:
- Implementations to judge: runner-1, runner-2, runner-3
- Worktree locations: .worktrees/speed-run-runner-N/
- Test results from each runner
- Fresh-eyes findings from Step 3
- Speed-run metrics: hosted LLM calls, fix cycles, generation time per runner
```

The judge skill will:
1. Fill out the complete scoring worksheet for each runner
2. Fill out the Speed-Run Metrics table
3. Build the scorecard with integer scores (1-5, no half points)
4. Check hard gates (Fitness Δ≥2, any score=1)
5. Announce winner with rationale (including token efficiency)

**Do not summarize or abbreviate the scoring.** The judge skill output should be the full worksheet.

**Showdown-specific context:** In showdown, all runners target the same design, so Fitness should be similar. A Fitness gap (Δ≥2) indicates one runner deviated from or misunderstood the design - not a different approach choice.

## Phase 4: Completion

**Verification on winner:**
```
Running final verification on winner (runner-2):
- Tests: 22/22 passing
- Build: exit 0
- Design adherence: all requirements met

Verification complete. Winner confirmed.
```

**Winner:** Use `finish-branch`

**Losers:** Cleanup
```bash
git worktree remove .worktrees/speed-run-runner-1
git worktree remove .worktrees/speed-run-runner-3
git branch -D <feature>/speed-run/runner-1
git branch -D <feature>/speed-run/runner-3
```

**Write result.md:**
```markdown
# Showdown Results: <feature>

## Design
docs/plans/<feature>/design.md

## Runners
| Runner | Plan Approach | Tests | Fresh-Eyes | Lines | LLM Calls | Fix Cycles | Result |
|--------|---------------|-------|------------|-------|-----------|------------|--------|
| runner-1 | Component-first | 24/24 | 1 minor | 680 | 4 | 2 | eliminated |
| runner-2 | Data-layer-first | 22/22 | 0 issues | 720 | 3 | 1 | WINNER |
| runner-3 | TDD-strict | 26/26 | 2 minor | 590 | 5 | 3 | eliminated |

## Plans Generated
- runner-1: docs/plans/<feature>/speed-run/showdown/runner-1/plan.md
- runner-2: docs/plans/<feature>/speed-run/showdown/runner-2/plan.md
- runner-3: docs/plans/<feature>/speed-run/showdown/runner-3/plan.md

## Winner Selection
Reason: Clean fresh-eyes review, solid data-layer-first architecture, fewest fix cycles

## Token Savings
Estimated savings vs Claude direct: ~60% on code generation
```

Save to: `docs/plans/<feature>/speed-run/showdown/result.md`

## Common Mistakes

**Sharing a pre-made implementation plan**
- Problem: All runners copy same code, no variation
- Fix: Each runner uses writing-plans to create THEIR OWN plan from design doc

**Dispatching runners in separate messages**
- Problem: Serial dispatch instead of parallel
- Fix: Send ALL Task tools in a SINGLE message

**Using Claude direct for all code generation**
- Problem: Defeats the purpose of speed-run (token savings)
- Fix: Runners MUST use hosted LLM for first-pass generation

**Skipping fresh-eyes**
- Problem: Judge has no quality signal
- Fix: Fresh-eyes on ALL survivors before comparing

**Not checking for identical implementations**
- Problem: Wasted compute on duplicates
- Fix: Diff implementations before fresh-eyes

**Forgetting cleanup**
- Problem: Orphaned worktrees and branches
- Fix: Always cleanup losers, write result.md

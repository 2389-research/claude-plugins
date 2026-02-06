---
name: any-percent
description: Explore different architectural approaches in parallel using hosted LLM for code generation. No restrictions on approach - fastest path to comparing real implementations. Part of speed-run pipeline.
---

# Any%

Explore different approaches in parallel - no restrictions, fastest path to comparing real implementations. Each variant uses hosted LLM for code generation.

**Announce:** "I'm using speed-run:any% for parallel exploration via hosted LLM."

**Core principle:** When unsure of the best architecture, implement multiple approaches fast via hosted LLM and let real code + tests determine the winner.

## When to Use

- Unsure which architectural approach is best
- Want to compare 2-5 different designs quickly
- "Try both approaches", "explore both", "not sure which way"
- Want token-efficient parallel exploration

## Workflow Overview

| Phase | Description |
|-------|-------------|
| **1. Context** | Quick gathering (1-2 questions max) |
| **2. Approaches** | Generate 2-5 architectural approaches |
| **3. Plan** | Create implementation plan per variant |
| **4. Implement** | Dispatch ALL agents in SINGLE message, each uses hosted LLM |
| **5. Evaluate** | Scenario tests -> fresh-eyes -> judge survivors |
| **6. Complete** | Finish winner, cleanup losers |

## Directory Structure

```
docs/plans/<feature>/
  design.md                  # Shared context
  speed-run/
    any-percent/
      variant-<slug>/
        plan.md              # Implementation plan for this variant
      result.md              # Final report

.worktrees/
  speed-run-variant-<slug>/  # Variant worktree
```

## Phase 1: Quick Context

**Gather just enough to generate approaches (1-2 questions max):**
- What are you building?
- Any hard constraints? (language, framework, infrastructure)

Do NOT brainstorm extensively. The point of any% is to explore fast, not deliberate slowly.

## Phase 2: Generate Approaches

**Identify the primary architectural axis** (biggest impact decision):
- Storage engine (SQL vs NoSQL vs file-based)
- Framework (Express vs Fastify vs Hono)
- Architecture pattern (monolith vs microservices vs serverless)
- State management approach
- Auth strategy

**Generate 2-5 approaches along that axis:**

```
Based on the requirements, here are 3 approaches to explore:

1. variant-sqlite: SQLite storage with query builder
   → Pros: Simple, embedded, zero config
   → Cons: Single writer, no replication

2. variant-postgres: PostgreSQL with ORM
   → Pros: Scalable, ACID, rich queries
   → Cons: External dependency, more setup

3. variant-redis: Redis with persistence
   → Pros: Fast, built-in pub/sub
   → Cons: Memory-bound, limited queries

All will be implemented via hosted LLM and tested.
Spawning 3 parallel variants now.
```

**Variant limits: Max 5-6.** Don't do full combinatorial explosion:
1. Identify the primary axis
2. Create variants along that axis
3. Fill secondary slots with natural pairings

## Phase 3: Plan + Implement (Parallel)

**Setup worktrees:**
```
.worktrees/speed-run-variant-sqlite/
.worktrees/speed-run-variant-postgres/
.worktrees/speed-run-variant-redis/

Branches:
<feature>/speed-run/variant-sqlite
<feature>/speed-run/variant-postgres
<feature>/speed-run/variant-redis
```

**CRITICAL: Dispatch ALL variants in a SINGLE message**

```
<single message>
  Task(variant-sqlite, run_in_background: true)
  Task(variant-postgres, run_in_background: true)
  Task(variant-redis, run_in_background: true)
</single message>
```

**Variant agent prompt:**

```
You are implementing the [VARIANT-SLUG] variant in a speed-run any% exploration.
Other variants are being implemented in parallel with different approaches.

**Your working directory:** /path/to/.worktrees/speed-run-variant-<slug>
**Design context:** docs/plans/<feature>/design.md
**Your plan location:** docs/plans/<feature>/speed-run/any-percent/variant-<slug>/plan.md

**Your approach:** [APPROACH DESCRIPTION]
  - [Key architectural decisions for this variant]
  - [Technology choices specific to this variant]

**Your workflow:**
1. Create implementation plan for YOUR approach
   - Save to plan location above
   - Focus on what makes this approach unique
2. For each implementation task, use hosted LLM for first-pass code generation:
   - Write a contract prompt (DATA CONTRACT + API CONTRACT + ALGORITHM + RULES)
   - Call: mcp__hosted-llm-codegen__generate_and_write_files
   - Run tests
   - Fix failures with Claude Edit tool (surgical 1-4 line fixes)
   - Re-test until passing
3. Follow TDD
4. Use verification before claiming done

**Code generation rules:**
- Use mcp__hosted-llm-codegen__generate_and_write_files for algorithmic code
- Use Claude direct ONLY for surgical fixes and multi-file coordination
- Write contract prompts with exact data models, routes, and algorithm steps

**Report when done:**
- Plan created: yes/no
- All tasks completed: yes/no
- Test results (output)
- Files changed count
- Hosted LLM calls made
- Fix cycles needed
- What makes this variant's approach unique
- Any issues encountered
```

## Phase 4: Evaluate

**Step 1: Gate check** - All tests pass

**Step 2: Run same scenario tests against all variants**

Use `scenario-testing` skill. Same scenarios, different implementations.

**Step 3: Fresh-eyes on survivors**

```
Fresh-eyes review of variant-sqlite (N files)...
Fresh-eyes review of variant-postgres (N files)...
```

**Step 4: Invoke judge**

**CRITICAL: Invoke `test-kitchen:judge` now.**

```text
Invoke: test-kitchen:judge

Context to provide:
- Variants to judge: variant-sqlite, variant-postgres, variant-redis
- Worktree locations: .worktrees/speed-run-variant-<slug>/
- Test results from each variant
- Scenario test results
- Fresh-eyes findings
```

## Phase 5: Completion

**Winner:** Use `finish-branch`

**Losers:** Cleanup
```bash
git worktree remove .worktrees/speed-run-variant-sqlite
git worktree remove .worktrees/speed-run-variant-redis
git branch -D <feature>/speed-run/variant-sqlite
git branch -D <feature>/speed-run/variant-redis
```

**Write result.md:**
```markdown
# Any% Results: <feature>

## Approaches Explored
| Variant | Approach | Tests | Scenarios | Fresh-Eyes | LLM Calls | Result |
|---------|----------|-------|-----------|------------|-----------|--------|
| variant-sqlite | Embedded SQL | 18/18 | 5/5 | 0 issues | 3 | WINNER |
| variant-postgres | External DB + ORM | 20/20 | 5/5 | 1 minor | 4 | eliminated |
| variant-redis | In-memory + persist | 16/16 | 4/5 | 2 issues | 5 | eliminated |

## Winner Selection
Reason: Simplest architecture, zero external dependencies, all scenarios pass

## Token Savings
Estimated savings vs Claude direct: ~60% on code generation
```

Save to: `docs/plans/<feature>/speed-run/any-percent/result.md`

## Skill Dependencies

| Dependency | Usage |
|------------|-------|
| `writing-plans` | Generate implementation plan per variant |
| `git-worktrees` | Create isolated worktree per variant |
| `parallel-agents` | Dispatch all variant agents in parallel |
| `scenario-testing` | Run same scenarios against all variants |
| `fresh-eyes` | Quality review on survivors |
| `judge` | `test-kitchen:judge` - scoring framework |
| `finish-branch` | Handle winner, cleanup losers |

## Common Mistakes

**Too many variants**
- Problem: Combinatorial explosion, wasted compute
- Fix: Cap at 5-6, pick primary axis only

**Extensive brainstorming before exploring**
- Problem: Defeats the purpose of any% (fast exploration)
- Fix: 1-2 questions max, then generate and go

**Using Claude direct for all code generation**
- Problem: No token savings, defeats speed-run purpose
- Fix: Variants MUST use hosted LLM for first-pass generation

**Dispatching variants in separate messages**
- Problem: Serial instead of parallel
- Fix: ALL Task tools in a SINGLE message

**Skipping scenario tests**
- Problem: Can't compare variants fairly
- Fix: Same scenarios against all variants

**Forgetting cleanup**
- Problem: Orphaned worktrees
- Fix: Always cleanup losers, write result.md

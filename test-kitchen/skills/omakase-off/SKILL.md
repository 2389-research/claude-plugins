---
name: omakase-off
description: ALWAYS invoke FIRST on ANY "build/create/implement/add feature" request. This skill WRAPS brainstorming - it decides the approach. Present choice BEFORE any brainstorming starts: (1) Brainstorm together step-by-step, OR (2) Omakase - I generate 3-5 best approaches, implement in parallel, tests pick winner. If user picks brainstorming, check if brainstorming skill exists - if yes use it, if no do brainstorming yourself (ask questions, propose options, validate). Also triggers DURING brainstorming on 2+ "not sure"/"don't know" responses. For same design competing implementations, use cookoff.
---

# Omakase-Off

Chef's choice exploration - when you're not sure WHAT to build, explore different approaches in parallel.

**Part of Test Kitchen Development:**
- `omakase-off` - Chef's choice exploration (different approaches/plans)
- `cookoff` - Same recipe, multiple cooks compete (same plan, multiple implementations)

**Core principle:** Let indecision emerge naturally during brainstorming, then implement multiple approaches in parallel to let real code + tests determine the best solution.

## CRITICAL: First Steps (BEFORE ANYTHING ELSE)

**STOP. Before reading further, create these todos NOW:**

```
TodoWrite([
  { content: "Phase 1: Brainstorm with slot detection", status: "in_progress", activeForm: "Brainstorming with slot detection" },
  { content: "Phase 2: Generate variant plans", status: "pending", activeForm: "Generating variant plans" },
  { content: "Phase 3: Implement variants in parallel", status: "pending", activeForm: "Implementing variants" },
  { content: "Phase 4: Evaluate and judge with scoring framework", status: "pending", activeForm: "Evaluating and judging" },
  { content: "Phase 5: Cleanup and finish", status: "pending", activeForm: "Cleaning up" }
])
```

**Why this is mandatory:** Context compaction can happen mid-workflow. Without these todos, you will lose track of which phase you're in and skip critical steps like scoring and winner selection.

**If you're resuming after compaction:** Check your todo list. If "Phase 4: Evaluate and judge" is pending, execute it NOW before doing anything else.

## Skill Dependencies

This skill orchestrates other skills. Check what's installed and use fallbacks if needed.

| Reference | Primary (if installed) | Fallback (if not) |
|-----------|------------------------|-------------------|
| `brainstorming` | `superpowers:brainstorming` | Ask questions one at a time, propose 2-3 approaches, validate incrementally |
| `writing-plans` | `superpowers:writing-plans` | Write detailed plan with file paths, code examples, verification steps |
| `git-worktrees` | `superpowers:using-git-worktrees` | `git worktree add .worktrees/<name> -b <branch>`, verify .gitignore |
| `parallel-agents` | `superpowers:dispatching-parallel-agents` | Dispatch multiple Task tools in single message, review when all return |
| `subagent-dev` | `superpowers:subagent-driven-development` | Fresh subagent per task, code review between tasks |
| `tdd` | `superpowers:test-driven-development` | Write test first, watch fail, write minimal code, refactor |
| `scenario-testing` | `scenario-testing:skills` (2389) | Create `.scratch/` E2E scripts, real dependencies, no mocks |
| `verification` | `superpowers:verification-before-completion` | Run verification command, read output, THEN claim status |
| `fresh-eyes` | `fresh-eyes-review:skills` (2389) | 2-5 min review for security, logic errors, edge cases |
| `code-review` | `superpowers:requesting-code-review` | Dispatch code-reviewer subagent with SHA range |
| `finish-branch` | `superpowers:finishing-a-development-branch` | Verify tests, present options (merge/PR/keep/discard) |

**At skill start:** Check which dependencies are available. Announce: "Using [X] for brainstorming, [Y] for scenario testing..." so user knows which tools are active.

**If primary not installed:** Use the fallback behavior described above. The fallback is the essential behavior - primary skills just formalize it.

## When to Use

Omakase-off has TWO trigger points:

### Trigger 1: BEFORE Brainstorming (Short-Circuit Option)

When user requests "build X", "create Y", "implement Z" - BEFORE diving into detailed brainstorming, offer the short-circuit:

```
Before we brainstorm the details, would you like to:

1. Brainstorm together - We'll explore requirements and design step by step
2. Omakase (chef's choice) - I'll generate 3-5 best approaches, implement them
   in parallel, and let tests pick the winner
   → Best when: you're flexible on approach, want to see options in code

Which approach?
```

**When to offer this:** On any substantial "build/create/implement" request before starting brainstorming.

### Trigger 2: DURING Brainstorming (Indecision Detection)

If user shows uncertainty during brainstorming:

**Detection signals:**
- 2+ uncertain responses in a row on architectural decisions
- Phrases: "not sure", "don't know", "either works", "you pick", "no preference", "hmm"
- User defers multiple decisions to you

**When detected, offer omakase:**
```
You seem flexible on the approach. Would you like to:
1. I'll pick what seems best and continue brainstorming
2. Explore multiple approaches in parallel (omakase-off)
   → I'll implement 2-3 variants and let tests decide
```

### Trigger 3: Explicitly Requested

User directly asks:
- "try both approaches", "explore both", "omakase"
- "implement both variants", "let's see which is better"
- "not sure which is better, try both"

## The Process

### Phase 0: Entry Point (Short-Circuit vs Brainstorm)

**When user requests "build/create/implement X":**

Present the choice BEFORE starting detailed brainstorming:
```
Before we dive into the details, how would you like to approach this?

1. Brainstorm together - We'll explore requirements and design step by step
2. Omakase (chef's choice) - I'll generate 3-5 best approaches, implement
   them in parallel, and let tests pick the winner
   → Best when: you're flexible, want to see options in working code

Which approach?
```

**If user picks Omakase (option 2):**
1. Quick context gathering (1-2 essential questions only)
2. Generate 3-5 distinct architectural approaches
3. Jump directly to Phase 2 (Plan Generation) with those variants
4. Skip detailed brainstorming entirely

**If user picks Brainstorm (option 1):**
Continue to Phase 1 below.

### Phase 1: Brainstorming with Passive Slot Detection

**First, check if a brainstorming skill is available:**
- Look for `superpowers:brainstorming` or similar skill in available skills
- If available → invoke it and passively detect indecision during the flow
- If NOT available → **do brainstorming yourself using fallback behavior:**
  - Ask questions one at a time
  - Propose 2-3 approaches for key decisions
  - Validate incrementally with user
  - Track architectural vs trivial decisions

**Fallback brainstorming flow (when no brainstorming skill):**
1. Read the codebase to understand context
2. Ask focused questions about the feature (what, where, how)
3. For each decision point, propose options and get user input
4. Track decisions and note any indecision (potential slots)
5. Build toward a design document

**During brainstorming (whether using skill or fallback), passively detect indecision:**

**Detect indecision signals** when user responds to options:
- Explicit: "slot", "try both", "explore both"
- Uncertain: "not sure", "hmm", "either could work", "both sound good", "no idea", "I don't know"
- Deferring: "you pick", "whatever you think", "I don't have a strong preference"

**When indecision detected:**
- Mark that decision as a potential slot
- Classify it: **architectural** (affects code structure) vs **trivial** (cosmetic/config)
- Continue brainstorming normally (pick a placeholder to continue)

**Slot classification:**
| Type | Examples | Worth exploring? |
|------|----------|------------------|
| **Architectural** | Storage engine, framework, auth method, API style | Yes - different code paths |
| **Trivial** | File location, naming conventions, config format | No - easy to change later |

Only architectural decisions become real slots.

**Fast path detection:**
After 2+ uncertain answers in a row, offer to shortcut:
```
You seem flexible on the details. Want me to:
1. Make sensible defaults and you flag anything wrong
2. Continue exploring each decision

Which works better?
```

If user picks defaults, make reasonable choices and note them. Continue brainstorming for only the big architectural decisions.

**Track throughout:**
```
Architectural slots:
1. Data storage: [JSON, SQLite] - meaningfully different code

Trivial (defaulted):
- File location: ~/.todos.json (easy to change)
- Config format: JSON (doesn't affect architecture)

Fixed decisions:
- Language: TypeScript (user chose)
```

### Phase 1.5: End-of-Brainstorm Decision

**If NO architectural slots were collected** (user was decisive):

Hand off to cookoff for implementation. Present options:
```
Design complete. How would you like to implement?

1. Cookoff (recommended) - N parallel agents, each creates own plan, pick best
   → Complexity: [assess from design]
   → Best for: medium-high complexity, want to compare implementations
2. Single subagent - One agent plans and implements
3. Local - Implement here in this session
```

If user picks cookoff, invoke cookoff skill and exit omakase-off.

---

**If slots WERE collected** (user showed indecision):

```
I noticed some open decisions during our brainstorm:
- Storage: JSON vs SQLite
- Auth: JWT vs session-based

Would you like to:
1. **Explore in parallel** - I'll implement both variants and let tests decide
2. **Best guess** - I'll pick what seems best and proceed with one plan

Which approach?
```

**If "Best guess":** Pick the most suitable option for each slot, proceed with single plan (hand off to cookoff with the options above).

**If "Explore in parallel":** Continue to Phase 2 (omakase-off's variant exploration).

**Combination limits (max 5-6 implementations):**

When multiple architectural slots exist, don't do full combinatorial explosion. Instead, pick **meaningfully different** variants:

1. **Identify the primary axis** - Which slot has the biggest architectural impact?
2. **Create variants along that axis** - Each variant explores a different primary choice
3. **Fill in secondary slots** with the most natural pairing for each primary

**Example:** 3 slots (storage: JSON/SQLite, framework: Express/Fastify, auth: JWT/session)
- Don't create 2x2x2 = 8 variants
- Primary axis: storage (biggest code difference)
- Create 2-3 variants:
  - `variant-json-simple`: JSON + Express + session (lightweight stack)
  - `variant-sqlite-robust`: SQLite + Fastify + JWT (production-ready stack)
  - Maybe: `variant-json-jwt`: JSON + Express + JWT (if JWT is important to test)

**Pruning rules:**
- Remove architecturally incompatible pairings (e.g., SQLite + serverless)
- Remove redundant variants (if two variants would have nearly identical code)
- Ask user if unsure which variants are most meaningful to compare

### Phase 2: Plan Generation

For each variant combination:

1. Generate full implementation plan using `superpowers:writing-plans`
2. Store in structured directory:

```
docs/plans/<feature>/
  design.md                  # Shared context from brainstorming
  omakase/
    variant-<slug-1>/
      plan.md                # Implementation plan for this variant
    variant-<slug-2>/
      plan.md
    result.md                # Final report (written at end)
```

### Phase 3: Implementation

**Setup worktrees** (separate from plans directory):
- Use `git-worktrees` dependency for each variant
- Worktree location: `.worktrees/` or per project convention
- Branch naming: `<feature>/omakase/<variant-name>` (e.g., `auth/omakase/jwt-redis`)
- All worktrees created before implementation starts

**CRITICAL: Dispatch ALL variants in a SINGLE message**

Use `parallel-agents` pattern. Send ONE message with multiple Task tool calls:

```
<single message>
  Task(variant-json, run_in_background: true)
  Task(variant-sqlite, run_in_background: true)
</single message>
```

Do NOT send separate messages for each variant.

**Subagent prompt template:**
```
Implement variant-<name> in .worktrees/variant-<name>
- Read plan from docs/plans/<feature>/omakase/variant-<name>/plan.md
- Use `subagent-dev` to execute plan
- Follow `tdd` for each task
- Use `verification` before claiming done
- Report: what was built, test results, any issues
```

**Each subagent workflow:**
1. Read their variant's plan from `docs/plans/<feature>/omakase/variant-<name>/plan.md`
2. Execute tasks using `subagent-dev` (fresh context per task, review between)
3. Follow `tdd` - write test first, watch fail, implement, pass
4. Use `verification` - run tests, read output, THEN claim complete
5. Report back: summary, test counts, files changed, issues

**Monitor progress:**
```
Implementation status:
- variant-json: 3/5 tasks complete
- variant-sqlite: 2/5 tasks complete (in progress)
```

User can manually kill slow/stuck implementations.

**When subagent reports complete:**
- Use `code-review` to review the variant's implementation
- Fix any Critical/Important issues before proceeding to Phase 4
- Note: each variant reviewed independently

### Phase 3→4 Transition (MANDATORY)

**CRITICAL: When all variants complete, BEFORE responding to user:**

1. DO NOT just summarize implementation results
2. DO NOT ask user "which one looks better?"
3. IMMEDIATELY proceed to Phase 4 evaluation and judging
4. Present the winner WITH full scoring rationale

The user invoked omakase-off expecting an autonomous winner selection. Stopping to ask breaks the workflow.

**If context was compacted mid-workflow:** Check your todo list for pending phases. If "Phase 4: Evaluate and judge" is pending, execute it now.

### Phase 4: Evaluation

**Step 1: Scenario testing (REQUIRED - not ad-hoc)**
- **MUST use `scenario-testing`** - not manual ad-hoc verification
- Create scenarios in `.scratch/` that exercise real functionality
- Same scenarios run against ALL variants (apples-to-apples comparison)
- Scenarios must use real dependencies, no mocks
- Must pass all scenarios to be a "survivor"

**Step 2: Fresh-eyes review on survivors**

For each variant that passed scenarios, use `fresh-eyes`:
```
Starting fresh-eyes review of variant-json (N files). This will take 2-5 minutes.

Checking for:
- Security vulnerabilities (SQL injection, XSS, command injection)
- Logic errors (off-by-one, race conditions, null handling)
- Edge cases tests might have missed
- Code quality issues

Fresh-eyes complete for variant-json: [N] issues found.
```

**Fresh-eyes findings become judge input:**
- Track issues found per variant
- Security issues = major negative
- Logic errors = moderate negative
- Clean review = positive signal

**Step 3: Elimination**
| Situation | Action |
|-----------|--------|
| Fails tests | Eliminated |
| Fails scenarios | Eliminated |
| Critical security issue in fresh-eyes | Eliminated (or fix first) |
| Crashes/stalls | User can eliminate |
| All fail | Report failures, ask user how to proceed |
| One survives | Auto-select as winner |

**Step 3.5: Feasibility Check**

Before scoring, check each survivor for fundamental scalability/feasibility issues that tests might miss:

| Red Flag | How to Detect | Action |
|----------|---------------|--------|
| **O(n²) or worse on unbounded data** | Nested loops over collections that grow with users/data | Flag + estimate ceiling |
| **Unbounded memory growth** | Caching without eviction, accumulating state in memory | Flag + estimate when OOM |
| **Self-DDoS patterns** | Polling loops, retry without backoff, fan-out without limits | Flag as non-production |
| **Missing pagination/limits** | Returns all records, no cursor, loads full dataset into memory | Flag + estimate data ceiling |
| **Blocking operations in hot path** | Sync file I/O, unbounded network calls in request handler | Flag performance ceiling |
| **No error recovery** | All state in memory, no persistence, crashes lose everything | Flag if durability required |

**Feasibility output format:**
```
Feasibility Check:
- variant-a: ✓ No issues identified
- variant-b: ⚠️ O(n²) in processItems() - ceiling ~5k items before 1s+ latency
```

**Important:** Feasibility flags don't auto-eliminate. Sometimes the simpler approach is fine for actual scale. But flags MUST be visible in the scorecard and factor into Robustness & Scalability scoring.

**Step 4: Autonomous Judge (comparing survivors)**

When multiple variants survive, the agent autonomously selects the winner using structured scoring.

**Core principle:** Simplicity is only valuable when fitness is equal. A cleaner solution that doesn't solve the problem is not better.

#### 4.1: Score Each Criterion (1-5)

**Criterion 1: Fitness for Purpose**
*Does it solve the actual problem the user asked for?*

| Score | Meaning | Concrete Indicators |
|-------|---------|---------------------|
| **5** | Exceeds requirements | All requirements met, deployment needs satisfied, AND adds obvious value user didn't ask for but clearly needs |
| **4** | Fully meets requirements | Every explicit requirement implemented correctly. Deployment/distribution needs met. No gaps. |
| **3** | Meets core requirements | Primary use case works. Missing 1-2 secondary features, edge cases, or has deployment friction. |
| **2** | Partially meets | 50-80% of requirements work. Key features missing, broken, or deployment method doesn't match needs. |
| **1** | Misses the point | Solves a different problem than requested. <50% of requirements addressed. |

*Scoring checklist - count YES answers:*

**Functional requirements:**
- [ ] Does the primary use case work end-to-end?
- [ ] Are all explicitly stated requirements implemented?
- [ ] Does it handle realistic scenarios, not just happy path?

**User needs (beyond literal requirements):**
- [ ] Would the user actually use this, or just demo it?
- [ ] Does it solve the real problem, not just the literal request?
- [ ] Does deployment/distribution match user's stated needs? (e.g., "standalone" = no build step, "shareable" = single file, "production" = proper hosting)

**Future considerations (when relevant):**
- [ ] If user mentioned growth/scaling needs, does architecture support it?
- [ ] If user mentioned team/collaboration, is it maintainable by others?

**5** = 7-8 yes, **4** = 5-6 yes, **3** = 4 yes, **2** = 2-3 yes, **1** = 0-1 yes

*Note:* Not all checklist items apply to every project. Score based on items that ARE relevant. A solo hobby project doesn't need "maintainable by team" but a startup MVP does.

**Criterion 2: Justified Complexity**
*Is every line of code earning its keep?*

| Score | Meaning | Concrete Indicators |
|-------|---------|---------------------|
| **5** | Minimal and complete | Every function/class has clear purpose. No dead code. No premature abstraction. |
| **4** | Slight inefficiency | 1-2 small redundancies or one abstraction that could be simpler. <10% bloat. |
| **3** | Some bloat | Noticeable unnecessary code. 10-25% could be removed without losing functionality. |
| **2** | Significant bloat | Multiple unnecessary abstractions. 25-50% is overhead. |
| **1** | Complexity theater | More abstraction than logic. Patterns for pattern's sake. >50% overhead. |

*Complexity justification test - for each "extra" in the more complex variant:*
1. Can you explain the value in ONE sentence? (If not → bloat)
2. Would removing it noticeably degrade the user experience? (If not → bloat)
3. Is it solving a problem that actually exists? (If not → premature)

*Line count heuristic:*
- Compare variants: `extra_lines = larger - smaller`
- For each extra feature, estimate lines it requires
- If `unexplained_lines > 20%` of extra → deduct points

**Criterion 3: Readability**
*Can a mid-level dev understand the core flow in 5 minutes?*

| Score | Meaning | Concrete Indicators |
|-------|---------|---------------------|
| **5** | Self-documenting | Function names are verbs describing action. Variables reveal intent. No magic numbers. Structure mirrors logic. |
| **4** | Clear with minor friction | 1-2 unclear names or one complex function. Core flow still obvious. |
| **3** | Requires study | Must trace through code to understand. Some misleading names or hidden control flow. |
| **2** | Confusing | Multiple misleading names. Unexpected side effects. Hard to follow execution order. |
| **1** | Obfuscated | Cannot determine intent. Single-letter variables throughout. No structure. |

*Readability checklist - count violations:*
- [ ] Any single-letter variables outside of loop indices? (+1 violation)
- [ ] Any functions over 50 lines? (+1 per function)
- [ ] Nesting deeper than 3 levels? (+1 per instance)
- [ ] Magic numbers without named constants? (+1 per instance)
- [ ] Function names that don't describe what they do? (+1 per function)
- [ ] Comments that explain WHAT not WHY? (+0.5 per instance)

**5** = 0 violations, **4** = 1-2 violations, **3** = 3-4 violations, **2** = 5-7 violations, **1** = 8+ violations

**Criterion 4: Robustness & Scalability**
*How well does it handle the unexpected AND growth?*

| Score | Meaning | Concrete Indicators |
|-------|---------|---------------------|
| **5** | Production-ready | All inputs validated. Errors handled gracefully with useful messages. No feasibility flags. Scales linearly or better. |
| **4** | Solid | Most error paths covered. Minor feasibility concerns. Handles 10x expected load. |
| **3** | Happy path works | Core functionality solid. Some edge cases crash or fail silently. Some scaling concerns. |
| **2** | Fragile | Crashes on unexpected input. Silent failures. Known scaling ceiling <10x current needs. |
| **1** | Time bomb | Obvious failure modes ignored. Will break at 2x load. Has critical feasibility flags. |

*Robustness checklist - count YES answers:*
- [ ] User/external input validated before use?
- [ ] External calls (API, DB, file) have error handling?
- [ ] Errors surfaced with useful messages (not swallowed)?
- [ ] Null/undefined/empty cases handled?
- [ ] Timeouts on async operations?
- [ ] No unbounded loops or recursion?

*Scalability checklist - count YES answers:*
- [ ] Algorithm complexity O(n log n) or better for main operations?
- [ ] Memory usage bounded (no unbounded caching/accumulation)?
- [ ] Database queries indexed and paginated?
- [ ] No blocking I/O in hot paths?
- [ ] External calls have backoff/retry logic?
- [ ] Can handle 10x current expected load?

**5** = 11-12 yes + no feasibility flags
**4** = 9-10 yes OR minor feasibility flag
**3** = 7-8 yes
**2** = 5-6 yes OR major feasibility flag
**1** = <5 yes OR critical feasibility flag

**Criterion 5: Maintainability**
*How painful is the next change?*

| Score | Meaning | Concrete Indicators |
|-------|---------|---------------------|
| **5** | Change-friendly | Single responsibility per function/module. Changes stay in 1-2 files. Clear interfaces. |
| **4** | Manageable | Some coupling but dependencies explicit. Changes touch 2-4 files predictably. |
| **3** | Requires care | Must trace dependencies. Changes ripple to 4-6 files. Some implicit coupling. |
| **2** | Brittle | Touching one thing breaks another. Global state. Changes unpredictably affect distant code. |
| **1** | Frozen | No one wants to touch it. Unclear what depends on what. Any change is risky. |

*Maintainability checklist - count YES answers:*
- [ ] Functions/modules have single responsibility?
- [ ] Dependencies are explicit (imports, params) not implicit (globals, side effects)?
- [ ] Business logic separated from infrastructure (DB, HTTP, UI)?
- [ ] Adding a new feature would require changing ≤3 files?
- [ ] Configuration externalized (not hardcoded)?
- [ ] Tests exist that would catch regressions?

**5** = 6 yes, **4** = 5 yes, **3** = 4 yes, **2** = 2-3 yes, **1** = 0-1 yes

#### 4.2: Build Scorecard

First, document feasibility findings:
```
## Feasibility Check
| Variant | Status | Notes |
|---------|--------|-------|
| variant-a | ✓ OK | No issues |
| variant-b | ⚠️ Flag | O(n²) in processItems() - ceiling ~5k items |
```

Then score each criterion using the checklists above:
```
## Scoring Worksheet

### Variant A
- Fitness: [checklist results] → Score: X
- Complexity: [justification test results] → Score: X
- Readability: [violation count] → Score: X
- Robustness & Scale: [checklist + feasibility] → Score: X
- Maintainability: [checklist results] → Score: X

### Variant B
[Same format]
```

Finally, build the comparison scorecard:
```
## Judge Scorecard
| Criterion              | Variant A | Variant B | Δ (B-A) | Decisive? |
|------------------------|-----------|-----------|---------|-----------|
| Fitness for purpose    |           |           |         |           |
| Justified complexity   |           |           |         |           |
| Readability            |           |           |         |           |
| Robustness & Scale     |           |           |         |           |
| Maintainability        |           |           |         |           |
| **TOTAL**              |    /25    |    /25    |         |           |
```

Mark any criterion with |Δ| ≥ 2 as "Decisive? = YES"

#### 4.3: Decision Logic

**Hard gates (automatic, no exceptions):**

1. **Fitness Gate:** If Fitness for Purpose difference ≥ 2 → Higher fitness WINS
   - Rationale: A solution that doesn't solve the problem is not a solution

2. **Critical Flaw Gate:** If any criterion = 1 → ELIMINATED
   - Rationale: A single critical flaw disqualifies regardless of other scores

**Judgment zone (agent decides with explanation):**

When no hard gate triggers, agent selects winner considering:
- Total score difference (larger gap = stronger signal)
- Which criteria matter most for THIS specific problem
- Domain-specific factors (e.g., "MCTS is overkill for Connect 4's state space")
- Practical trade-offs between the approaches

**Required:** Explain the reasoning. Don't just state the winner - explain WHY.

*Note:* Line count is a weak signal. Only use as tiebreaker if scores are genuinely
identical and no other factor distinguishes the variants. A 5-10% line difference
is not meaningful.

#### 4.4: Announce Decision

Format the decision clearly:

```
**Winner: variant-minimax** (Score: 23/25 vs 21/25)

**Hard gates:**
- Fitness Gate: Not triggered (both scored 5)
- Critical Flaw Gate: Not triggered (no 1s)

**Selection rationale:**
Minimax selected over MCTS despite similar scores because:
- Minimax with alpha-beta is ideal for Connect 4's game tree size (~4 million positions)
- MCTS shines in larger state spaces (Go, complex strategy games)
- Both provide challenging opponents, but minimax is the right tool for this job

**Trade-offs acknowledged:**
- MCTS has nicer win highlighting animation
- MCTS provides more variety in play (probabilistic)
- These don't outweigh algorithmic fit for the problem
```

### Phase 5: Completion

**Before declaring winner, use `verification`:**
```
Running final verification on winner (variant-json):
- npm test: 12/12 passing
- npm run build: exit 0
- Scenarios: all passing

Verification complete. Winner confirmed.
```

**Winner:** Use `finish-branch` dependency
- Verify all tests pass (already done above)
- Present options: merge locally, create PR, keep as-is, discard
- Execute user's choice

**Losers:** Cleanup
```bash
git worktree remove <worktree-path>
git branch -D <feature>/omakase/<variant>
```

**Write result.md:**
```markdown
# Omakase-Off Results: <feature>

## Variants Tested
| Variant | Lines | Tests | Scenarios | Fresh-Eyes | Result |
|---------|-------|-------|-----------|------------|--------|
| variant-minimax | 508 | PASS | 7/7 | 0 issues | **WINNER** |
| variant-random | 373 | PASS | 7/7 | 0 issues | eliminated |

## Feasibility Check
| Variant | Status | Notes |
|---------|--------|-------|
| variant-random | ✓ OK | No scalability concerns |
| variant-minimax | ✓ OK | Minimax O(b^d) bounded by depth=5, acceptable |

## Scoring Worksheet

### variant-random
- Fitness: Primary works, but trivial opponent isn't engaging → **2/5**
- Complexity: No bloat, minimal code → **5/5**
- Readability: 0 violations, self-documenting → **5/5**
- Robustness & Scale: 10/12 checklist items, no flags → **4/5**
- Maintainability: 5/6 checklist items → **4/5**

### variant-minimax
- Fitness: All requirements + engaging AI + animations → **5/5**
- Complexity: Extra 135 lines all justified (AI, UX) → **5/5**
- Readability: 1-2 minor violations (algorithm complexity) → **4/5**
- Robustness & Scale: 10/12 checklist items, no flags → **4/5**
- Maintainability: 5/6 checklist items → **4/5**

## Judge Scorecard

| Criterion              | variant-random | variant-minimax | Δ | Decisive? |
|------------------------|----------------|-----------------|---|-----------|
| Fitness for purpose    | 2              | 5               | +3 | **YES** |
| Justified complexity   | 5              | 5               | 0 | No |
| Readability            | 5              | 4               | -1 | No |
| Robustness & Scale     | 4              | 4               | 0 | No |
| Maintainability        | 4              | 4               | 0 | No |
| **TOTAL**              | **20**         | **22**          | +2 | |

## Hard Gates
| Gate | Result |
|------|--------|
| Fitness Gate (Δ ≥ 2) | **TRIGGERED** - variant-random (2) vs variant-minimax (5) |
| Critical Flaw (any = 1) | Not triggered |

## Winner Selection Rationale
**variant-minimax** selected via Fitness Gate.

The minimax variant scores 5 on fitness (exceeds requirements with engaging gameplay
and polish) while random scores only 2 (technically functional but not a real game).

**Why this decision is correct:**
- A game needs a worthy opponent to be engaging
- Random AI is a tech demo, not a product
- The extra complexity (135 lines) directly serves user value

**Trade-offs acknowledged:**
- Random was slightly more readable (simpler algorithm)
- This advantage is irrelevant when one variant doesn't solve the actual problem

## Cleanup
- Worktrees removed: `.worktrees/variant-random`
- Branches deleted: `<feature>/omakase/variant-random`
- Plans preserved: `docs/plans/<feature>/omakase/`
```

Save to: `docs/plans/<feature>/omakase/result.md`

## Skills Orchestrated

Uses dependencies defined above. Primary skill if installed, fallback otherwise.

| Dependency | Phase | Usage |
|------------|-------|-------|
| `brainstorming` | 1 | Modified flow with passive slot detection |
| `writing-plans` | 2 | Generate implementation plan per variant |
| `git-worktrees` | 3 | Create isolated worktree per variant |
| `parallel-agents` | 3 | Dispatch all variant subagents in parallel |
| `subagent-dev` | 3 | Each subagent uses this for task execution |
| `tdd` | 3 | Subagents follow RED-GREEN-REFACTOR |
| `verification` | 3, 5 | Before claiming variant done; before declaring winner |
| `code-review` | 3 | Review each variant after implementation |
| `scenario-testing` | 4.1 | Run same scenarios against all variants |
| `fresh-eyes` | 4.2 | Quality review on survivors → input for judge |
| `finish-branch` | 5 | Handle winner (merge/PR), cleanup losers |

## Common Mistakes

**Too many slots**
- Problem: Combinatorial explosion (2x2x2x2 = 16 variants)
- Fix: Cap at 5-6, ask user to constrain if exceeded

**Not using existing skills**
- Problem: Ad-hoc implementation instead of established workflow
- Fix: Each subagent MUST use executing-plans skill

**Ad-hoc scenario testing**
- Problem: Manual "click through" verification instead of real scenario tests
- Fix: MUST use `scenario-testing` skill with `.scratch/` scenarios, no mocks

**Premature elimination**
- Problem: Killing implementation that's just slow
- Fix: No hard timeouts; user decides when to kill

**Forgetting cleanup**
- Problem: Orphaned worktrees and branches
- Fix: Always cleanup losers, write result.md

## Example Invocation

```
User: "I need to build a CLI todo app."

Claude: I'm using omakase-off.

Before we dive into the details, how would you like to approach this?

1. Brainstorm together - We'll explore requirements and design step by step
2. Omakase (chef's choice) - I'll generate 3-5 best approaches, implement
   them in parallel, and let tests pick the winner

User: "1"

Claude: Great, let's brainstorm. What language would you like to use?

User: "not sure"

Claude: [Marks language as potential slot - architectural]
No problem. For data storage?

User: "no idea"

Claude: [Marks storage as potential slot - architectural]
[Detects 2+ uncertain answers]

You seem flexible on the details. Want me to:
1. Make sensible defaults and you flag anything wrong
2. Continue exploring each decision

User: "1"

Claude: Got it. Here's my proposal:

**Defaults:**
- Language: TypeScript (great CLI ecosystem)
- CLI framework: Commander (standard choice)
- File location: ~/.todos.json (trivial - easy to change)

**Worth exploring (architecturally different):**
- Storage: JSON file vs SQLite

JSON is simpler, SQLite handles larger datasets. Both are valid.
Does this look right? Anything to change?

User: "looks good"

Claude: Great. One architectural slot: storage (JSON vs SQLite).

Would you like to:
1. Explore in parallel - I'll implement both and let tests decide
2. Best guess - I'll pick JSON (simpler) and proceed

User: "1"

[Phase 2: Generate plans for variant-json, variant-sqlite]
[Phase 3: Create worktrees, dispatch parallel subagents]
[Phase 4: Both pass scenarios, present comparison]
[Phase 5: User picks sqlite, cleanup json branch]

Winner: variant-sqlite
Cleanup complete. Ready to merge or create PR.
```

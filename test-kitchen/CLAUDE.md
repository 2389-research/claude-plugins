# Test Kitchen Plugin

## Overview

Test Kitchen provides two gate skills for parallel implementation:

| Skill | Gate | When |
|-------|------|------|
| `test-kitchen:omakase-off` | **Entry** | FIRST on any build/create/implement request |
| `test-kitchen:cookoff` | **Exit** | At design→implementation transition |

## Skills Included

| Skill | Triggers | Description |
|-------|----------|-------------|
| `test-kitchen:omakase-off` | (1) FIRST on build/create, (2) During brainstorming on indecision, (3) Explicit request | Wraps brainstorming, offers parallel design exploration |
| `test-kitchen:cookoff` | At "let's implement" moments | Wraps implementation, offers parallel execution |

## Flow

```
"Build X" / "Create Y" / "Implement Z"
    ↓
┌─────────────────────────────────────┐
│  OMAKASE-OFF (entry gate)           │
│  Wraps brainstorming                │
│                                     │
│  Choice:                            │
│  1. Brainstorm together             │
│  2. Omakase (3-5 parallel designs)  │
└─────────────────────────────────────┘
    ↓
[Brainstorming / Design phase]
    ↓
Design complete, "let's implement"
    ↓
┌─────────────────────────────────────┐
│  COOKOFF (exit gate)                │
│  Wraps implementation               │
│                                     │
│  Choice:                            │
│  1. Cookoff (2-5 parallel agents)   │
│  2. Single subagent                 │
│  3. Local implementation            │
└─────────────────────────────────────┘
    ↓
[Implementation]
```

## Key Design Principle

**Skills need aggressive triggers to work.**

Skills can't passively detect "uncertainty" or "readiness" - they must claim specific moments in the conversation flow:

- **Omakase-off**: Claims the BUILD/CREATE moment (before brainstorming)
- **Cookoff**: Claims the IMPLEMENT moment (after design)

Both skills present choices to the user, allowing them to opt into parallel execution or continue with standard workflows.

## Omakase-off (Entry Gate)

Omakase-off has **three triggers**:

### Trigger 1: BEFORE Brainstorming (Short-Circuit Option)

**When:** "I want to build...", "Create a...", "Implement...", "Add a feature...", ANY signal to start building

**Presents:**
```
How would you like to explore this?

1. Brainstorm together - We'll work through the design step by step
2. Omakase - I'll generate 3-5 best approaches, implement in parallel, tests pick winner
```

**Option 1 (Brainstorm):**
- If `superpowers:brainstorming` is installed, use it with passive slot detection
- Otherwise, run fallback brainstorming (ask questions, propose options, build toward design)

**Option 2 (Omakase):**
1. Quick context gathering (1-2 questions max)
2. Generate 3-5 best architectural approaches
3. Create implementation plan for EACH approach
4. Setup git worktrees for each variant
5. Dispatch parallel agents (ALL in single message)
6. Run scenario tests on all implementations
7. Fresh-eyes review survivors
8. Present comparison, user picks winner
9. Cleanup losers, finish winner branch

### Trigger 2: DURING Brainstorming (Indecision Detection)

**Detection signals:**
- 2+ uncertain responses in a row on architectural decisions
- Phrases: "not sure", "don't know", "either works", "you pick", "no preference"
- User defers multiple decisions

**When detected, offer omakase:**
```
You seem flexible on the approach. Would you like to:
1. I'll pick what seems best and continue brainstorming
2. Explore multiple approaches in parallel (omakase-off)
   → I'll implement 2-3 variants and let tests decide
```

### Trigger 3: Explicitly Requested

- "try both approaches", "explore both", "omakase"
- "implement both variants", "let's see which is better"

### Slot Detection During Brainstorming

When brainstorming proceeds (Option 1), passively track architectural decisions:

**Classify each decision:**
| Type | Examples | Worth exploring? |
|------|----------|------------------|
| **Architectural** | Storage engine, framework, auth method | Yes - different code paths |
| **Trivial** | File location, naming, config format | No - easy to change |

**At end of brainstorming:**
- If architectural slots exist → offer to explore in parallel
- If no slots → design complete, hand off to cookoff

## Cookoff (Exit Gate)

**Triggers:** "Let's implement", "Looks good, let's build", "Ready to code", design doc committed, ANY signal to move from design to code

**Presents:**
```
How would you like to implement this design?

1. Cookoff (recommended) - N parallel agents, each creates own plan, pick best
   → Complexity: [assessed from design]
2. Single subagent - One agent plans and implements
3. Local - Plan and implement here
```

**Option 1 (Cookoff):**
1. Each agent reads the same design doc
2. Each agent creates their OWN implementation plan (key insight: don't share plans)
3. All implement in parallel
4. Fresh-eyes review on survivors
5. Compare results, user picks winner
6. Cleanup losers, finish winner branch

**Options 2/3:** Standard single-agent or local implementation

### Critical: Each Agent Creates Own Plan

**Don't share a pre-made implementation plan.** Each agent generates their own plan from the design doc, ensuring genuine variation in implementation approaches.

## Directory Structure

```
docs/plans/<feature>/
  design.md                    # From brainstorming

  # Omakase-off creates:
  omakase/
    variant-<slug>/
      plan.md                  # Variant-specific plan
    result.md                  # Omakase results

  # Cookoff creates:
  cookoff/
    impl-1/
      plan.md                  # Agent 1's implementation plan
    impl-2/
      plan.md                  # Agent 2's implementation plan
    impl-3/
      plan.md                  # Agent 3's implementation plan
    result.md                  # Cookoff results and winner

.worktrees/
  variant-<slug>/              # Omakase variant worktree
  cookoff-impl-N/              # Cookoff implementation worktree
```

## Branch Naming

**Omakase-off variants:**
```
<feature>/omakase/<variant-slug>
```

**Cookoff implementations:**
```
<feature>/cookoff/impl-N
```

## Skill Dependencies

Both skills orchestrate these (uses fallbacks if not installed):

| Dependency | Usage |
|------------|-------|
| `superpowers:brainstorming` | Omakase-off delegates to this when user picks "Brainstorm" |
| `superpowers:writing-plans` | Each agent creates their own implementation plan |
| `superpowers:executing-plans` | Execute plan tasks sequentially with verification |
| `superpowers:dispatching-parallel-agents` | Dispatch ALL agents in SINGLE message |
| `superpowers:using-git-worktrees` | Create worktree per variant/implementation |
| `superpowers:test-driven-development` | Agents follow RED-GREEN-REFACTOR |
| `superpowers:verification-before-completion` | Run command, read output, THEN claim status |
| `scenario-testing:skills` | Real E2E validation |
| `fresh-eyes-review:skills` | Quality gate before comparison |
| `superpowers:finishing-a-development-branch` | Handle winner, cleanup losers |

## Common Mistakes to Avoid

### Omakase-off

- **Not triggering FIRST on build/create requests** - Omakase-off must claim the build/create moment before brainstorming starts
- **Not offering the choice** - Always present Brainstorm vs Omakase options at entry
- **Ignoring slot detection during brainstorming** - Track architectural indecision, offer parallel exploration at end
- **Too many variants** - Cap at 5-6, ask user to constrain

### Cookoff

- **Sharing a pre-made implementation plan** - Each agent MUST create their own plan from design doc
- **Dispatching agents in separate messages** - Send ALL Task tools in SINGLE message for parallel execution
- **Skipping fresh-eyes** - Required before judge comparison
- **Not checking for identical implementations** - Diff implementations before judging

### Both

- **Orphaned worktrees** - Always cleanup losers
- **Missing result documentation** - Write result.md with what was tried and why winner won
- **Skipping scenario tests** - Real E2E validation is required

## Evaluation Pipeline

1. **Gate check** - All tests pass, design adherence
2. **Fresh-eyes review** - Security/logic check on survivors
3. **Judge comparison** - Present metrics, user picks winner
4. **Cleanup** - Remove loser worktrees and branches
5. **Finish winner** - Use `superpowers:finishing-a-development-branch`

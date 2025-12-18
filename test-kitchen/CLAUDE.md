# Test Kitchen Plugin

## Overview

Test Kitchen provides parallel implementation techniques for different scenarios:
- **Omakase-off**: When user is uncertain about WHAT to build → explore multiple approaches
- **Cookoff**: When user has a plan and is choosing HOW to execute → agents race to implement

## Skills Included

| Skill | Trigger | Status |
|-------|---------|--------|
| `test-kitchen` | Routes to appropriate sub-skill | Orchestrator |
| `test-kitchen:omakase-off` | User uncertain about approach | Active |
| `test-kitchen:cookoff` | Execution style choice after plan exists | Placeholder |

## Flow

```
Implementation request arrives
    ↓
User uncertain about approach?
    ├─ Yes → test-kitchen:omakase-off
    │         (explore multiple approaches)
    │
    └─ No → Regular brainstorming
              ↓
         Plan defined. Implementation style:
              ├─ Local (implement in current context)
              ├─ Subagent (single agent executes)
              └─ test-kitchen:cookoff (agents compete)
```

## Key Patterns

### Slot Detection (Omakase-off)

During brainstorming, detect user uncertainty:
- "not sure", "either could work", "try both"
- Classify as architectural (worth exploring) vs trivial (just default)
- Only architectural decisions become parallel variants

### Variant Limiting

- Max 5-6 implementations to avoid combinatorial explosion
- Pick primary axis (biggest architectural impact)
- Create meaningfully different variants, not full combinations

### Evaluation Pipeline

1. **Scenario testing** - Same tests against all variants (no mocks)
2. **Fresh-eyes review** - Security/logic check on survivors
3. **Judge comparison** - Present metrics, user picks winner
4. **Cleanup** - Remove loser worktrees and branches

## Skill Dependencies

Omakase-off orchestrates these skills (uses fallbacks if not installed):

- `superpowers:brainstorming` - With passive slot detection
- `superpowers:writing-plans` - Per-variant plans
- `superpowers:using-git-worktrees` - Isolated worktrees
- `superpowers:dispatching-parallel-agents` - Concurrent implementation
- `superpowers:test-driven-development` - Each variant follows TDD
- `scenario-testing:skills` - Real E2E validation
- `fresh-eyes-review:skills` - Quality gate
- `superpowers:finishing-a-development-branch` - Winner handling

## Directory Structure

During execution, Test Kitchen creates:

```
docs/plans/<feature>-<YYYYMMDD>/
  plan.md                    # Original brainstorm design
  result.md                  # Final report
  variant-<slug>/
    plan.md                  # Variant-specific plan

.worktrees/
  variant-<slug>/            # Isolated implementation
```

## Branch Naming

```
test-kitchen/<feature>/<variant-name>
```

Example: `test-kitchen/auth/jwt-redis`

## Development Workflow

1. User requests implementation with uncertainty signals
2. Skill triggers brainstorming with slot detection
3. At end of brainstorm, offer parallel exploration
4. If accepted: generate plans, create worktrees, dispatch agents
5. Run scenario tests on all implementations
6. Fresh-eyes review survivors
7. Present comparison to user
8. User picks winner
9. Cleanup losers, finish winner branch

## Common Mistakes to Avoid

- **Too many variants** - Cap at 5-6, ask user to constrain
- **Ad-hoc testing** - MUST use scenario-testing skill
- **Skipping fresh-eyes** - Required before judge comparison
- **Orphaned worktrees** - Always cleanup losers
- **Missing result.md** - Document what was tried and why winner won

# Test Kitchen

Parallel exploration of implementation approaches. When you're uncertain between approaches, Test Kitchen implements multiple variants simultaneously and lets real tests determine the winner.

## Installation

```bash
/plugin install test-kitchen@2389-research
```

## What This Plugin Provides

### Skills

| Skill | Description |
|-------|-------------|
| `test-kitchen` | Orchestrator - routes to appropriate sub-skill |
| `test-kitchen:omakase-off` | Agent-driven exploration - detects decision points during brainstorming |
| `test-kitchen:cookoff` | User-driven competition - implements pre-defined plans (coming soon) |

## Quick Example

### Omakase-off (Agent Explores)

```
User: "Build a notification system. Could use WebSockets or polling - not sure which."

Claude: Using test-kitchen:omakase-off. I'll explore both approaches.

[Brainstorming phase with slot detection]
[Generates 2 implementation plans]
[Creates worktrees, dispatches parallel agents]
[Runs scenario tests on both]
[Presents comparison]

Both variants passed. Results:
- variant-websocket: 0 issues, 380 lines, 10 tests
- variant-polling: 1 minor issue, 420 lines, 12 tests

Recommendation: variant-websocket (cleaner, simpler)

Pick winner: [1] websocket  [2] polling  [3] show me the code
```

### Cookoff (User Compares) - Coming Soon

```
User: "I've written two auth plans in docs/plans/. Implement both and compare."

Claude: Using test-kitchen:cookoff with your plans...
```

## How It Works

1. **Slot Detection** - During brainstorming, Claude detects when you're uncertain ("not sure", "try both", "either could work")

2. **Variant Generation** - Architectural decisions become "slots" - Claude creates meaningfully different combinations (max 5-6)

3. **Parallel Implementation** - Each variant gets its own git worktree and subagent

4. **Evaluation** - Same scenario tests run against all variants, fresh-eyes review on survivors

5. **Selection** - You pick the winner based on test results and code quality metrics

6. **Cleanup** - Loser worktrees/branches deleted, winner ready to merge or PR

## Dependencies

Test Kitchen orchestrates these skills (uses fallbacks if not installed):

- `superpowers:brainstorming`
- `superpowers:writing-plans`
- `superpowers:using-git-worktrees`
- `superpowers:dispatching-parallel-agents`
- `scenario-testing:skills`
- `fresh-eyes-review:skills`
- `superpowers:finishing-a-development-branch`

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Full plugin instructions
- [Omakase-off Skill](./skills/omakase-off/SKILL.md) - Agent-driven exploration
- [Cookoff Skill](./skills/cookoff/SKILL.md) - User-driven competition (placeholder)

## Origin

Adapted from the slot-machine-development skill. The "Test Kitchen" name reflects the experimental nature - like a restaurant test kitchen where chefs try multiple approaches before putting a dish on the menu.

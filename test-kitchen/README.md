# Test Kitchen

Parallel implementation techniques for different scenarios:
- **Omakase-off**: Explore multiple approaches when uncertain about WHAT to build
- **Cookoff**: Race multiple agents when you have a plan and want to compare HOW they execute

## Installation

```bash
/plugin install test-kitchen@2389-research
```

## What This Plugin Provides

### Skills

| Skill | When | Description |
|-------|------|-------------|
| `test-kitchen` | — | Orchestrator - routes to appropriate sub-skill |
| `test-kitchen:omakase-off` | User uncertain about approach | Explores multiple approaches in parallel |
| `test-kitchen:cookoff` | Plan exists, choosing execution style | Agents race to implement same plan (coming soon) |

## Flow

```
Implementation request arrives
    ↓
User uncertain about approach?
    ├─ Yes → omakase-off (explore approaches)
    └─ No → Regular brainstorming
              ↓
         Plan defined. Implementation style:
              ├─ Local
              ├─ Subagent
              └─ Cookoff (agents compete)
```

## Quick Examples

### Omakase-off (Uncertain Approach)

```
User: "Build a notification system. Could use WebSockets or polling - not sure which."

Claude: You're uncertain about the approach. Using test-kitchen:omakase-off.

[Brainstorming with slot detection]
[Generates 2 variant plans]
[Creates worktrees, dispatches parallel agents]
[Runs scenario tests on both]
[Presents comparison]

Both variants passed:
- variant-websocket: 0 issues, 380 lines, 10 tests
- variant-polling: 1 minor issue, 420 lines, 12 tests

Recommendation: variant-websocket (cleaner, simpler)

Pick winner: [1] websocket  [2] polling  [3] show me the code
```

### Cookoff (Execution Competition) - Coming Soon

```
User: "Here's my plan for the auth system. Implement it."

Claude: Plan looks good. How would you like to implement?
1. Local
2. Subagent
3. Cookoff

User: "cookoff"

Claude: Using test-kitchen:cookoff. Dispatching 3 agents...

[All agents implement same plan]
[Compare completion time, test results, code quality]

Results:
- Agent 1: 12 min, 15 tests, 0 issues
- Agent 2: 8 min, 15 tests, 1 minor issue
- Agent 3: 15 min, 14 tests, 0 issues

Pick winner: [1] [2] [3]
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

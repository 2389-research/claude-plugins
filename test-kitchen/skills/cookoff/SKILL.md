---
name: cookoff
description: Use as an execution style after a plan is defined - multiple agents race to implement the SAME plan, comparing execution quality (PLACEHOLDER - not yet implemented)
---

# Cookoff

**STATUS: PLACEHOLDER - Not yet implemented**

Execution competition where multiple agents race to implement the same plan. Unlike omakase-off which explores different APPROACHES, cookoff compares different EXECUTIONS of a single defined plan.

**Like a cooking competition:** All contestants get the same recipe, but compete on execution quality.

## When to Use

Cookoff is offered as an **execution style** after brainstorming produces a plan:

```
Claude: Plan looks good. How would you like to implement?
1. Local - I'll implement it here
2. Subagent - dispatch a single agent
3. Cookoff - multiple agents race to implement

User: "3"

Claude: Using test-kitchen:cookoff - dispatching 3 agents to implement your plan.
```

## Key Distinction from Omakase-off

| | Omakase-off | Cookoff |
|-|-------------|---------|
| **Trigger** | User uncertainty | Plan exists, choosing execution |
| **Input** | Uncertain approach | Single defined plan |
| **Agents do** | Different approaches | Same plan |
| **Compares** | Which approach works | Which execution is best |

## Planned Features

### Input
- Single implementation plan (from brainstorming or user-provided)
- Number of competing agents (default: 3)
- Optional: custom success criteria

### Execution
- One worktree per agent
- All agents get the SAME plan
- All agents start simultaneously
- Progress tracked in real-time

### Evaluation
- Same scenario tests run against all implementations
- Fresh-eyes review on all completions
- Comparison based on:
  - Completion time
  - Test pass rate
  - Code quality (fresh-eyes findings)
  - Lines of code / complexity

### Output
- Winner selected (or user picks from survivors)
- Losers cleaned up
- Result report with comparison metrics

## Example Flow

```
User: "Here's my plan for the notification system. Implement it."

Claude: Plan looks good. How would you like to implement?
1. Local
2. Subagent
3. Cookoff

User: "cookoff with 3 agents"

Claude: Using test-kitchen:cookoff. Dispatching 3 agents...

[Later]

All 3 agents completed:
- Agent 1: 12 min, 15 tests pass, 0 fresh-eyes issues, 380 lines
- Agent 2: 8 min, 15 tests pass, 1 minor issue, 420 lines
- Agent 3: 15 min, 14 tests pass (1 flaky), 0 issues, 350 lines

Recommendation: Agent 2 (fastest, all tests pass, minor issue is trivial)

Pick winner: [1] [2] [3]
```

## Development Notes

Shares infrastructure with omakase-off:
- Same worktree management
- Same parallel agent dispatch
- Same evaluation pipeline (scenario-testing, fresh-eyes)
- Same cleanup process

Main difference: All agents get the same plan, no brainstorming phase.

## TODO

- [ ] Implement agent dispatch with same plan
- [ ] Add timing/completion tracking
- [ ] Build comparison metrics
- [ ] Create winner selection logic
- [ ] Handle partial completions (some agents fail)

---
name: cookoff
description: Use when user has pre-defined implementation plans they want to compare - implements fixed plans in parallel and compares results (PLACEHOLDER - not yet implemented)
---

# Cookoff

**STATUS: PLACEHOLDER - Not yet implemented**

Fixed-plan parallel implementation competition. Unlike omakase-off where the agent discovers variants during brainstorming, cookoff takes user-provided plans and races agents to implement them.

**Like a cooking competition:** Contestants (agents) are given fixed recipes (plans) and compete to produce the best result.

## Planned Features

### Input
- User provides 2+ implementation plans (in docs/plans/ or specified locations)
- Each plan is a complete specification
- User defines success criteria

### Execution
- One worktree per plan
- One subagent per worktree
- All subagents start simultaneously
- Progress tracked in real-time

### Evaluation
- Same scenario tests run against all implementations
- Fresh-eyes review on survivors
- Comparison based on:
  - Test pass rate
  - Code quality (fresh-eyes findings)
  - Performance metrics (if applicable)
  - User-defined criteria

### Output
- Winner selected
- Losers cleaned up
- Result report generated

## When to Use (Future)

```
User: "I've written two plans for the auth system:
- docs/plans/auth-jwt.md
- docs/plans/auth-session.md

Let's implement both and see which works better."

Claude: Using test-kitchen:cookoff with your two plans...
```

## Development Notes

This skill will share infrastructure with omakase-off:
- Same worktree management
- Same parallel agent dispatch
- Same evaluation pipeline
- Same cleanup process

Main difference: No brainstorming/slot-detection phase - plans are provided upfront.

## TODO

- [ ] Define plan format requirements
- [ ] Implement plan validation
- [ ] Build execution orchestration
- [ ] Create comparison/judge logic
- [ ] Add user-defined success criteria support

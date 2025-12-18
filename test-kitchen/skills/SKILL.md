---
name: test-kitchen
description: Parallel implementation techniques - omakase-off for exploring uncertain approaches, cookoff for racing multiple agents on a defined plan
---

# Test Kitchen

Parallel implementation techniques for different scenarios.

## Sub-Skills

| Skill | When | Description |
|-------|------|-------------|
| `test-kitchen:omakase-off` | User uncertain about WHAT to build | Explores multiple approaches in parallel |
| `test-kitchen:cookoff` | User has a plan, choosing HOW to execute | Multiple agents race to implement same plan |

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

## Quick Reference

**Omakase-off** (chef's choice - exploring WHAT):
- Triggered by uncertainty: "not sure", "try both", "either could work"
- Agent detects decision points during brainstorming
- Creates multiple variant implementations
- Tests determine which approach wins
- Best for: "I don't know which approach, help me explore"

**Cookoff** (competition - comparing HOW):
- Triggered after a plan is defined
- One of several execution style options
- Multiple agents implement the SAME plan
- Compare execution quality/speed
- Best for: "I have a plan, let's see which agent does it best"

## Example Invocations

### Omakase-off (Uncertain Approach)
```
User: "Build a todo CLI app. Not sure about storage - JSON or SQLite."

Claude: You're uncertain about storage approach. Using test-kitchen:omakase-off
to explore both in parallel.
[Explores variants, tests determine winner]
```

### Cookoff (Defined Plan, Execution Competition)
```
User: "Here's my plan for the auth system. Implement it."

Claude: Plan looks good. How would you like to implement?
1. Local - I'll implement it here
2. Subagent - dispatch a single agent
3. Cookoff - multiple agents race to implement

User: "3"

Claude: Using test-kitchen:cookoff - dispatching 3 agents to implement your plan.
[Agents compete, compare results]
```

## Key Distinction

| | Omakase-off | Cookoff |
|-|-------------|---------|
| **Question** | WHAT to build? | HOW to execute? |
| **Input** | Uncertainty | Defined plan |
| **Variants** | Different approaches | Same plan, different agents |
| **Compares** | Which approach works | Which execution is best |

## Common Mistakes

**Using omakase-off when plan exists:**
- User has a clear plan → offer cookoff as execution option, not omakase-off

**Skipping omakase-off on uncertainty:**
- User says "not sure" → trigger omakase-off, don't force a choice

**Confusing the two:**
- Omakase-off = exploring approaches (multiple PLANS)
- Cookoff = racing execution (multiple AGENTS, one plan)

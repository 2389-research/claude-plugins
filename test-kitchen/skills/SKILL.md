---
name: test-kitchen
description: Use when user is uncertain between implementation approaches and wants to explore multiple options in parallel - routes to omakase-off (agent picks variants) or cookoff (fixed plans compete)
---

# Test Kitchen

Orchestrator for parallel implementation exploration. When users are uncertain between approaches, Test Kitchen implements multiple variants simultaneously and lets real tests determine the winner.

## Sub-Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| `test-kitchen:omakase-off` | User uncertain, wants agent to decide variants | Exploratory - agent detects decision points during brainstorming and creates variants |
| `test-kitchen:cookoff` | User has specific plans to compare | Fixed competition - user provides N plans, agents race to implement them |

## When to Use Test Kitchen

**Trigger on implementation requests with uncertainty:**
- "Build X, not sure whether to use A or B"
- "Implement Y, could go either way on the approach"
- "Create Z, I want to see options play out"

**Route to omakase-off when:**
- User expresses general uncertainty during brainstorming
- User says "try both", "not sure", "either could work"
- No pre-defined plans exist

**Route to cookoff when:**
- User has already written multiple implementation plans
- User wants to compare specific approaches they've defined
- Plans are fixed, not exploratory

## Routing Logic

```
User request arrives
    ↓
Is this an implementation request with uncertainty?
    ├─ No → Use regular brainstorming/implementation
    └─ Yes → Test Kitchen
              ↓
         Does user have pre-defined plans to compare?
              ├─ Yes → test-kitchen:cookoff
              └─ No  → test-kitchen:omakase-off
```

## Quick Reference

**Omakase-off** (like omakase sushi - chef's choice):
- Agent drives variant creation
- Slots detected during brainstorming
- Agent picks meaningful combinations
- Best for: "I don't know which approach, help me explore"

**Cookoff** (like a cooking competition):
- User provides the plans
- Agents compete to implement them
- User-defined success criteria
- Best for: "I have two ideas, let's see which works better"

## Example Invocations

### Omakase-off Path
```
User: "Build a todo CLI app. Not sure about storage - JSON files or SQLite could both work."

Claude: Using test-kitchen:omakase-off - I'll explore both storage approaches in parallel.
[Proceeds with omakase-off workflow]
```

### Cookoff Path
```
User: "I've written two plans for the auth system in docs/plans/.
One uses JWT, one uses sessions. Let's implement both and compare."

Claude: Using test-kitchen:cookoff - I'll implement both plans in parallel.
[Proceeds with cookoff workflow]
```

## Common Mistakes

**Wrong routing:**
- Using omakase-off when user has specific plans → Use cookoff
- Using cookoff when user wants exploration → Use omakase-off

**Skipping Test Kitchen:**
- Implementing single approach when user expressed uncertainty
- Not detecting "try both" or "not sure" signals

**Over-using Test Kitchen:**
- Trivial decisions (file naming, config format) don't need parallel exploration
- Only architectural differences warrant Test Kitchen

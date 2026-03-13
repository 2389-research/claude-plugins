# Test Kitchen

Parallel implementation and iterative refinement framework:

| Skill | Gate | Trigger |
|-------|------|---------|
| `test-kitchen:omakase-off` | **Entry** | FIRST on any build/create/implement request |
| `test-kitchen:cookoff` | **Exit** | At design→implementation transition |
| `test-kitchen:simmer` | **Refinement** | "simmer this", "refine this", "hone this", iterate on any artifact |

## Installation

```bash
/plugin install test-kitchen@2389-research
```

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


"Simmer this" / "Refine this" / "Hone this"
    ↓
┌─────────────────────────────────────┐
│  SIMMER (iterative refinement)      │
│  Any artifact, not just code        │
│                                     │
│  Setup → (Generate → Judge →        │
│           Reflect) × N              │
└─────────────────────────────────────┘
    ↓
[Best candidate output]
```

## Quick examples

### Entry gate: omakase-off

When you make a build/create request:
```
User: "Build a notification system"

Claude: I'm using test-kitchen:omakase-off.

How would you like to explore this?

1. Brainstorm together - We'll work through the design step by step
2. Omakase - I'll generate 3-5 best approaches, implement in parallel, tests pick winner

Which approach?
```

Option 1 (Brainstorm) proceeds to brainstorming skill (or fallback brainstorming), with passive slot detection.

Option 2 (Omakase) does the following:
- Quick context gathering (1-2 questions)
- Generate 3-5 architectural approaches
- Implement ALL in parallel via git worktrees
- Run same scenario tests on each
- Fresh-eyes review survivors
- Present comparison, user picks winner

During brainstorming, slot detection can also trigger it:
```
Claude: What storage approach would you prefer?
User: "not sure, either could work"

Claude: [marks storage as architectural slot]

Claude: For authentication?
User: "no preference, you pick"

Claude: [marks auth as slot, detects 2+ uncertain responses]

You seem flexible on the approach. Would you like to:
1. I'll pick what seems best and continue
2. Explore multiple approaches in parallel (omakase-off)
   → I'll implement 2-3 variants and let tests decide
```

### Exit gate: cookoff

```
User: "Looks good, let's implement"

Claude: I'm using test-kitchen:cookoff.

How would you like to implement this design?

1. Cookoff (recommended) - 3 parallel agents, each creates own plan, pick best
   → Complexity: medium feature
2. Single subagent - One agent plans and implements
3. Local - Plan and implement here

Which approach?
```

Option 1 (Cookoff):
- Each agent reads the same design doc
- Each agent creates their OWN implementation plan
- All implement in parallel
- Fresh-eyes review, compare results
- User picks winner

Options 2/3 -- single agent or local implementation proceeds normally.

### Refinement: simmer

```
User: "Simmer this" [pastes a pitch email]

Claude: I'm using test-kitchen:simmer to set up iterative refinement.

What does "better" mean for this? I'd suggest these criteria:

1. Value prop clarity — reader knows exactly what problem is solved
2. Tone match — confident without being pushy
3. Call to action strength — specific and low-friction

Accept, modify, or define your own?

User: "Those work"

[Iteration 0: Judge scores seed — 4.0/10]
[Iteration 1: Generator fixes value prop → 5.3/10]
[Iteration 2: Generator fixes CTA → 6.3/10]
[Iteration 3: Generator fixes tone → 7.3/10]

Trajectory:
| Iter | Value Prop | Tone | CTA | Composite | Key Change |
|------|-----------|------|-----|-----------|------------|
| 0    | 4         | 5    | 3   | 4.0       | seed       |
| 1    | 7         | 5    | 4   | 5.3       | specific problem statement |
| 2    | 7         | 6    | 6   | 6.3       | low-friction CTA |
| 3    | 7         | 7    | 8   | 7.3       | peer-sharing tone |

Best candidate: iteration 3 (7.3/10)
3 iterations complete. Run 3 more?
```

Simmer works on any artifact type — documents, prompts, specs, emails, creative writing, API designs. Each iteration targets the single most important improvement (ASI) identified by the judge, so improvements compound rather than scatter.

## Why aggressive triggers

Skills can't passively detect "uncertainty" or "readiness" -- they must claim specific moments in the conversation flow.

- Omakase-off claims the BUILD/CREATE moment (before brainstorming)
- Cookoff claims the IMPLEMENT moment (after design)
- Simmer claims the REFINE/ITERATE moment (any artifact, any time)

## Dependencies

Test Kitchen orchestrates these skills (falls back gracefully if not installed):

- `superpowers:brainstorming`
- `superpowers:writing-plans`
- `superpowers:executing-plans`
- `superpowers:using-git-worktrees`
- `superpowers:dispatching-parallel-agents`
- `superpowers:test-driven-development`
- `superpowers:verification-before-completion`
- `scenario-testing:skills`
- `fresh-eyes-review:skills`
- `superpowers:finishing-a-development-branch`

## Documentation

- [CLAUDE.md](./CLAUDE.md) -- full plugin instructions
- [Omakase-off skill](./skills/omakase-off/SKILL.md) -- entry gate (wraps brainstorming)
- [Cookoff skill](./skills/cookoff/SKILL.md) -- exit gate (wraps implementation)
- [Simmer skill](./skills/simmer/SKILL.md) -- iterative refinement (any artifact)

## Origin

Named after a restaurant test kitchen, where chefs try multiple approaches before putting a dish on the menu.

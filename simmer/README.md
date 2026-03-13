# Simmer

Iterative artifact refinement — take any artifact and hone it over multiple rounds using criteria-driven judge feedback.

## Installation

```bash
/plugin install simmer@2389-research
```

## What This Plugin Provides

One skill (`simmer`) with four subskills that run the refinement loop:

- **Setup** — identify the artifact, elicit 2-3 quality criteria from the user
- **Generator** — produce an improved version based on the judge's feedback (ASI)
- **Judge** — score the candidate 1-10 per criterion, identify the single most important fix
- **Reflect** — record the trajectory, track the best candidate across iterations

## Quick Example

```
User: "Simmer this" [pastes a pitch email]

Claude: I'm using the simmer skill to set up iterative refinement.

What does "better" mean for this? I'd suggest:
1. Value prop clarity
2. Tone match
3. Call to action strength

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

## Works On Any Artifact

Documents, prompts, specs, emails, creative writing, API designs, adventure hooks — anything Claude can read and produce.

| Artifact type | Suggested criteria |
|---|---|
| Document / spec | clarity, completeness, actionability |
| Creative writing | narrative tension, specificity, voice consistency |
| Email / comms | value prop clarity, tone match, call to action strength |
| Prompt / instructions | instruction precision, output predictability, edge case coverage |
| API design | contract completeness, developer ergonomics, consistency |

## Key Design Principles

**Focused improvement compounds.** Each iteration targets the single most important fix (ASI), not everything at once.

**Context isolation prevents bias.** Generator doesn't see scores. Judge doesn't see intermediate scores. Each role gets only the context it needs.

**Seed calibration grounds scoring.** The judge receives the seed + its scores as a fixed reference point on every iteration, compressing score variance across runs.

## Related Skills

Part of the test-kitchen family, but independently installable:
- `test-kitchen:omakase-off` — parallel design exploration
- `test-kitchen:cookoff` — parallel implementation competition
- `simmer` — iterative refinement

## Documentation

- [CLAUDE.md](./CLAUDE.md) — full plugin instructions
- [Simmer skill](./skills/SKILL.md) — orchestrator
- [Integration tests](./tests/integration/simmer-scenario.md) — 21 test scenarios

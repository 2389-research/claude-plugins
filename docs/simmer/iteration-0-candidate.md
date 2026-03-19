# Simmer

Iterative artifact refinement — take any artifact or workspace and hone it over multiple rounds using criteria-driven feedback.

## Installation

```bash
/plugin install simmer@2389-research
```

## What This Plugin Provides

One skill (`simmer`) with four subskills that run the refinement loop:

- **Setup** — identify the artifact (file or workspace), elicit 2-3 quality criteria, determine evaluation method
- **Generator** — produce an improved version based on the judge's feedback (ASI)
- **Judge** — score the candidate 1-10 per criterion, identify the highest-leverage direction
- **Reflect** — record the trajectory, track the best candidate across iterations

## Quick Example: Single File

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

## Quick Example: Workspace with Evaluator

```
User: "Simmer this pipeline — find the best setup for this task"

Claude: I'm using the simmer skill to set up iterative refinement.

What are we refining? → A workspace at ./pipeline/
Evaluation method? → Run: python evaluate.py --input output.json
Background: Available models: claude-sonnet, gpt-4o-mini, llama-8b.
            Budget: <$0.01/call, <2s latency.
Criteria: accuracy, cost efficiency, latency

[Iteration 0: Evaluator + judge score seed — 3.7/10]
[Iteration 1: Generator swaps to cheaper model → 5.3/10]
[Iteration 2: Generator splits into 2-step chain → 7.0/10]
[Iteration 3: Generator adds few-shot examples → 7.7/10]

Best candidate: iteration 3 (7.7/10)
```

## Works On Anything

Single files, multi-file workspaces, pipelines, configurations — anything Claude can read and improve.

| Artifact type | Suggested criteria |
|---|---|
| Document / spec | clarity, completeness, actionability |
| Creative writing | narrative tension, specificity, voice consistency |
| Email / comms | value prop clarity, tone match, call to action strength |
| Prompt / instructions | instruction precision, output predictability, edge case coverage |
| API design | contract completeness, developer ergonomics, consistency |
| Pipeline / workflow | accuracy, cost efficiency, latency |
| Configuration / infra | correctness, resource efficiency, maintainability |

## Evaluation Modes

| Mode | When to use |
|------|------------|
| **Judge-only** (default) | Text artifacts — judge scores against criteria |
| **Runnable** | Code/pipelines — judge interprets script output |
| **Hybrid** | Both — run script AND judge results against criteria |

No format contract on evaluator output. The judge reads whatever your script produces — test results, metrics, error logs, anything.

## Key Design Principles

**Focused improvement compounds.** Each iteration targets the highest-leverage direction (ASI), not everything at once.

**Context isolation prevents bias.** Generator doesn't see scores. Judge doesn't see intermediate scores. Each role gets only the context it needs.

**Seed calibration grounds scoring.** The judge receives the seed + its scores as a fixed reference point on every iteration, compressing score variance across runs.

**The generator is the search strategy.** In workspace mode with background constraints, the generator decides what to change — swap a model, restructure a pipeline, tune a prompt. The ASI guides the direction, the generator executes the move.

## Related Skills

Part of the test-kitchen family, but independently installable:
- `test-kitchen:omakase-off` — parallel design exploration
- `test-kitchen:cookoff` — parallel implementation competition
- `simmer` — iterative refinement

## Documentation

- [CLAUDE.md](./CLAUDE.md) — full plugin instructions
- [Simmer skill](./skills/SKILL.md) — orchestrator
- [v2 Design](./docs/specs/2026-03-16-simmer-v2-design.md) — design spec
- [Integration tests](./tests/integration/simmer-scenario.md) — test scenarios

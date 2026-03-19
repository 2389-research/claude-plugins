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

## Trigger Phrases

Say any of these to start a simmer loop:

> "simmer this", "refine this", "hone this", "iterate on this", "make this better", "improve this over a few rounds", "polish this", "tighten this up", "optimize this pipeline", "find the best model for this task", "tune this configuration"

Any request to **iteratively improve** an artifact triggers simmer.

## When to Use Simmer vs. Cookoff vs. Omakase-Off

| Situation | Use | Why |
|-----------|-----|-----|
| You have an artifact and want it better | **simmer** | Iterative refinement against criteria |
| You want parallel code implementations competing | **cookoff** | Parallel generation + fixed criteria + pick winner |
| You don't know what you want yet | **omakase-off** | Parallel designs + react + discover preference |

**Rule of thumb:** Simmer = serial iteration. Cookoff/omakase-off = parallel exploration.

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
Evaluator: python evaluate.py --input output.json
Background: Available models: claude-sonnet, gpt-4o-mini, llama-8b.
            Budget: <$0.01/call, <2s latency.
Search space: models, prompt text, pipeline topology (single-call vs chain)
Output contract: JSON with 'entities' array, each element has 'name' + 'type'
Validation: ./validate.sh — runs 1 video, checks JSON schema (~1 min)
Criteria: accuracy, cost efficiency, latency

[Iteration 0: Run evaluator on seed, judge scores — 3.7/10]
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
| Pipeline / workflow | coverage, efficiency, noise |
| Configuration / infra | correctness, resource efficiency, maintainability |

## Evaluation Modes

| Mode | When to use |
|------|------------|
| **Judge-only** (default) | Text artifacts — judge scores against criteria |
| **Runnable** | Code/pipelines — judge interprets script output |
| **Hybrid** | Both — run script AND judge results against criteria |

No format contract on evaluator output. The judge reads whatever your script produces — test results, metrics, error logs, anything.

## Defaults and Safety

**Default iteration count:** 3 rounds per batch. After each batch, simmer asks whether to continue. You can request a specific count ("simmer this for 10 rounds") or stop early at any prompt.

**Regression safety:** The reflect subskill tracks the best candidate seen so far. If a new iteration scores lower than the current best, the best-so-far is preserved — the loop never loses progress. At the end, `result.md` always contains the highest-scoring candidate, not just the latest one.

## Advanced Features

Beyond basic single-file refinement and judge-only scoring, simmer supports:

- **Workspace targets** — refine multi-file directories, not just single files. Iterations are tracked as git commits so you can diff any two rounds.
- **Runnable and hybrid evaluators** — point simmer at a script (`python evaluate.py`) and the judge interprets its output alongside criteria scoring.
- **Background constraints** — tell the generator what it has to work with (available models, budget limits, latency targets) so it makes realistic choices.
- **Output contracts** — define what valid output looks like (e.g., "JSON with 'entities' array"). Contract violations score 1/10 across all criteria, forcing the generator to fix format before optimizing quality.
- **Validation commands** — a cheap pre-check the generator runs after infrastructure changes (model swap, topology change) before the full evaluator. Catches broken pipelines in seconds instead of minutes.
- **Search space and exploration tracking** — set explicit bounds on what the generator can explore (which models, topologies, prompt files). The reflect subskill tracks tried vs. untried regions so the judge steers toward unexplored territory.

## Output Directory Structure

**Single-file mode** (default output dir: `docs/simmer`):
```
docs/simmer/
  iteration-0-candidate.md     # Seed (original artifact)
  iteration-1-candidate.md     # Each improved candidate
  iteration-2-candidate.md
  iteration-3-candidate.md
  trajectory.md                # Running score table
  result.md                    # Final best candidate (highest score, not necessarily latest)
```

**Workspace mode:**
```
./pipeline/                    # Target directory (modified in place)
  [project files]              # Tracked via git commits per iteration

docs/simmer/                   # Tracking files (separate from workspace)
  trajectory.md                # Running score table
```

Workspace iterations are tracked as git commits rather than separate files.

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

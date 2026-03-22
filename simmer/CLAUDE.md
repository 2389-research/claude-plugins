# Simmer Plugin

## Overview

Simmer is an iterative refinement skill. It takes any artifact — a single file, a workspace of multiple files, a pipeline, a configuration — and hones it repeatedly against user-defined criteria. Evaluation can be subjective (judge-based), objective (runnable script), or hybrid (both).

## Skills Included

| Skill | Triggers | Description |
|-------|----------|-------------|
| `simmer` | "simmer this", "refine this", "hone this", "iterate on this", "optimize this pipeline" | Orchestrator: setup → loop → output |

### Subskills (invoked by orchestrator)

| Subskill | Role |
|----------|------|
| `simmer:simmer-setup` | Identify artifact (file or workspace), elicit criteria, determine evaluation method, produce setup brief |
| `simmer:simmer-generator` | Produce improved candidate from current + ASI feedback + background context |
| `simmer:simmer-judge` | Score candidate 1-10 per criterion (with optional evaluator output), produce ASI |
| `simmer:simmer-judge-board` | Multi-judge panel with deliberation — drop-in replacement for simmer-judge when JUDGE_BOARD enabled |
| `simmer:simmer-reflect` | Record trajectory, track best-so-far, pass ASI forward |

## Flow

```
"Simmer this" / "Refine this" / "Optimize this pipeline"
    ↓
Setup (identify artifact + criteria + evaluation method)
    ↓
Iteration 0: Evaluate the seed
    ↓
Loop N times:
  Generate (address ASI) → Evaluate (run evaluator if present) → Judge (score + new ASI) → Reflect (record)
    ↓
Output best candidate + trajectory
```

## Key Design Decisions

**Context discipline:** Generator doesn't see scores (avoids optimizing for numbers). Judge doesn't see intermediate scores (avoids anchoring). Reflect is the only subskill that sees the full trajectory.

**Seed calibration:** Judge receives the seed artifact + iteration-0 scores on every iteration as a fixed calibration reference. Can score above or below the seed. This compresses score variance across runs.

**ASI (Actionable Side Information):** Judge identifies the highest-leverage direction each round. For single-file targets, this is a single focused fix. For workspace targets, this is a single strategic direction that may involve coordinated changes across multiple files. Focused directional improvement compounds better than scattered edits.

**Pluggable evaluation:** Three modes — judge-only (default, subjective criteria), runnable (script/command output), or hybrid (both). No format contract on evaluator output — the judge interprets whatever the evaluator produces.

**Regression handling:** Reflect tracks best-so-far. If an iteration regresses, next generator receives the best candidate, not the regressed one. In workspace mode, this means git checkout to the best iteration's commit.

**Agency integration (opt-in):** When `USE_AGENCY: true` and the Agency MCP server is available, both the judge board and generator are composed from task-matched primitives instead of generic prompts. The judge board's deliberation conclusions shape the generator's composition — the panel's understanding of the problem informs what kind of generator Agency builds. Evaluation scores feed back into Agency so primitives evolve across runs. Falls back to manual profiles / standard prompts if Agency is unavailable.

## Artifact Modes

| Mode | Artifact Type | Tracking |
|------|--------------|----------|
| **Single-file** (default) | One file or pasted text | `iteration-N-candidate.md` files |
| **Workspace** | Directory with multiple files | Git commits per iteration |

## Evaluation Modes

| Mode | When to use | How it works |
|------|------------|--------------|
| **Judge-only** (default) | Text artifacts, design docs, creative writing | Judge scores against criteria descriptions |
| **Runnable** | Code, pipelines, configs with test suites | Judge runs command, interprets output alongside criteria |
| **Hybrid** | Pipelines with both metrics and subjective quality | Judge runs command AND scores output against criteria |

## Related Skills

Simmer is part of the test-kitchen family but independently installable:
- `test-kitchen:omakase-off` — parallel design exploration
- `test-kitchen:cookoff` — parallel implementation competition
- `simmer` — iterative refinement of any artifact or workspace

## Directory Structure

```
simmer/
  .claude-plugin/
    plugin.json
  skills/
    SKILL.md                    # Orchestrator
    simmer-setup/
      SKILL.md                  # Identify artifact + elicit criteria + evaluation method
    simmer-generator/
      SKILL.md                  # Produce improved candidate
    simmer-judge/
      SKILL.md                  # Score + produce ASI (with optional evaluator output)
    simmer-reflect/
      SKILL.md                  # Record trajectory + track best
  docs/
    specs/
      2026-03-16-simmer-v2-design.md
  tests/
    integration/
      simmer-scenario.md        # Integration test scenarios
  CLAUDE.md
  README.md
```

## Artifact Output

**Single-file mode:**
```
{OUTPUT_DIR}/                    # Default: docs/simmer
  iteration-0-candidate.md      # Seed
  iteration-1-candidate.md      # Each improved candidate
  iteration-2-candidate.md
  iteration-3-candidate.md
  trajectory.md                 # Running score table
  result.md                     # Final best output
```

**Workspace mode:**
```
{WORKSPACE}/                    # The target directory (modified in place)
  [project files]               # Tracked via git commits per iteration

{OUTPUT_DIR}/
  trajectory.md                 # Running score table
```

# Simmer Plugin

## Overview

Simmer is an iterative refinement skill. It takes a single artifact — document, prompt, spec, email, creative writing, API design, anything Claude can read and produce — and hones it repeatedly against user-defined criteria.

## Skills Included

| Skill | Triggers | Description |
|-------|----------|-------------|
| `simmer` | "simmer this", "refine this", "hone this", "iterate on this" | Orchestrator: setup → loop → output |

### Subskills (invoked by orchestrator)

| Subskill | Role |
|----------|------|
| `simmer:simmer-setup` | Identify artifact, elicit 2-3 criteria, produce setup brief |
| `simmer:simmer-generator` | Produce improved candidate from current + ASI feedback |
| `simmer:simmer-judge` | Score candidate 1-10 per criterion, produce single ASI |
| `simmer:simmer-reflect` | Record trajectory, track best-so-far, pass ASI forward |

## Flow

```
"Simmer this" / "Refine this" / "Hone this"
    ↓
Setup (identify artifact + elicit criteria)
    ↓
Iteration 0: Judge the seed
    ↓
Loop N times:
  Generate (address ASI) → Judge (score + new ASI) → Reflect (record)
    ↓
Output best candidate + trajectory
```

## Key Design Decisions

**Context discipline:** Generator doesn't see scores (avoids optimizing for numbers). Judge doesn't see intermediate scores (avoids anchoring). Reflect is the only subskill that sees the full trajectory.

**Seed calibration:** Judge receives the seed artifact + iteration-0 scores on every iteration as a fixed calibration reference. Can score above or below the seed. This compresses score variance across runs.

**ASI (Actionable Side Information):** Judge identifies the single most important fix each round. Focused improvement compounds better than scattered edits.

**Regression handling:** Reflect tracks best-so-far. If an iteration regresses, next generator receives the best candidate, not the regressed one.

## Related Skills

Simmer is part of the test-kitchen family but independently installable:
- `test-kitchen:omakase-off` — parallel design exploration
- `test-kitchen:cookoff` — parallel implementation competition
- `simmer` — iterative refinement of any artifact

## Directory Structure

```
simmer/
  .claude-plugin/
    plugin.json
  skills/
    SKILL.md                    # Orchestrator
    simmer-setup/
      SKILL.md                  # Identify artifact + elicit criteria
    simmer-generator/
      SKILL.md                  # Produce improved candidate
    simmer-judge/
      SKILL.md                  # Score + produce ASI
    simmer-reflect/
      SKILL.md                  # Record trajectory + track best
  docs/
  tests/
    integration/
      simmer-scenario.md        # 21 tests + pressure scenarios
  CLAUDE.md
  README.md
```

## Artifact Output

```
{OUTPUT_DIR}/                    # Default: docs/simmer
  iteration-0-candidate.md      # Seed
  iteration-1-candidate.md      # Each improved candidate
  iteration-2-candidate.md
  iteration-3-candidate.md
  trajectory.md                 # Running score table
  result.md                     # Final best output
```

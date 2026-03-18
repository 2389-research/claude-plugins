# Simmer v2 Design

## Summary

Simmer v2 extends the iterative refinement loop with pluggable evaluation, multi-file workspace targets, expanded ASI, and background constraints. All additions are opt-in — default behavior is identical to v1.

## Motivation

Simmer v1 optimizes a single text artifact using subjective judge feedback. This works well for prose, prompts, and specs. But iterative refinement applies more broadly:

- Optimizing a multi-file pipeline (model selection + prompts + orchestration)
- Improving code against a test suite or metric script
- Tuning configurations where "better" is measurable, not just subjective

These use cases need: multi-file targets, runnable evaluators, richer ASI, and background context for the generator. The core loop (generate → evaluate → reflect) stays the same.

## Design

### Setup Brief (v2)

```
ARTIFACT: [file path, directory path, or pasted content]
ARTIFACT_TYPE: [single-file | workspace]
CRITERIA:
  - [criterion 1]: [what better looks like]
  - [criterion 2]: [what better looks like]
  - [criterion 3]: [what better looks like]
EVALUATOR: [command to run, or omitted for judge-only]
BACKGROUND: [constraints, available resources, domain knowledge — or omitted]
ITERATIONS: [N]
MODE: [seedless | from-file | from-paste | from-workspace]
OUTPUT_DIR: [path]
```

New fields: `ARTIFACT_TYPE`, `EVALUATOR`, `BACKGROUND`, `from-workspace` mode. All optional — omitting them gives v1 behavior.

### Evaluation Modes

| Mode | Setup | Judge behavior |
|---|---|---|
| **Judge-only** (default, v1) | `EVALUATOR` omitted | Scores against criteria text, produces ASI |
| **Runnable** | `EVALUATOR: ./eval.sh` | Runs command, interprets stdout/stderr + criteria, produces ASI |
| **Hybrid** | `EVALUATOR: ./eval.sh` + criteria | Runs command, then scores output against criteria, produces ASI |

No format contract for evaluator output. The judge is an LLM — it reads whatever the evaluator produces (test output, metrics, error messages, logs) and interprets it.

### ASI: Single Fix → Single Direction

| | Single-file mode (default) | Workspace mode |
|---|---|---|
| **ASI scope** | One specific edit (v1 behavior) | One strategic direction — coherent move touching multiple files |
| **Constraint** | One fix, not a list | One direction, not unrelated changes |
| **Example** | "The CTA asks for a 30-min call — too high friction" | "The 8B model is ceiling'd on reasoning. Switch reasoning step to 70B, keep extraction on 8B, adjust both prompts." |

The judge picks the single highest-leverage direction. For single-file targets, that's one edit. For workspace targets, that's one coherent set of coordinated changes.

### Multi-file Tracking

For workspace mode:
- Each iteration creates a git commit as a snapshot
- `trajectory.md` references iteration numbers
- Regression rollback = `git checkout` to best iteration's commit
- Generator edits files in place within the workspace

For single-file mode: unchanged (iteration-N-candidate.md files).

### Subskill Changes

**Setup** — adds: artifact type detection (single file vs directory), evaluation method question (judge-only, runnable, hybrid), background/constraints elicitation for workspace targets.

**Generator** — adds: `BACKGROUND` in context (constraints, available resources). For workspace targets, can edit multiple files per iteration. ASI may describe coordinated multi-file changes.

**Judge** — adds: if `EVALUATOR` present, runs command and interprets output alongside criteria. If no evaluator, unchanged from v1.

**Reflect** — unchanged.

### What Doesn't Change

- Loop shape (generate → evaluate → reflect)
- Context discipline (generator doesn't see scores, judge doesn't see intermediate scores)
- Seed calibration (judge gets seed + seed scores as reference)
- Iteration counting (N iterations = N cycles after seed judgment)
- Regression handling (reflect detects, next generator gets best candidate)
- Single-agent mode
- Continue offer ("N iterations complete. Run 3 more?")

## File Changes Required

1. `simmer/skills/SKILL.md` — orchestrator: add workspace mode, evaluator dispatch, background passing
2. `simmer/skills/simmer-setup/SKILL.md` — new fields, artifact type detection, evaluation method
3. `simmer/skills/simmer-generator/SKILL.md` — background context, multi-file editing
4. `simmer/skills/simmer-judge/SKILL.md` — evaluator output interpretation, expanded ASI
5. `simmer/skills/simmer-reflect/SKILL.md` — workspace snapshot tracking (minor)
6. `simmer/CLAUDE.md` — updated overview
7. `simmer/README.md` — updated docs
8. `simmer/.claude-plugin/plugin.json` — version bump to 2.0.0
9. `.claude-plugin/marketplace.json` — version bump

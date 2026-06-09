# thrifty

> Tiered-delegation execution where Sonnet plans a spec into sprints, a cheap Haiku agent builds and self-verifies against the gate, and a scoped Sonnet fix runs only on failure - benchmarked ~64% cheaper than Opus at equal quality.

- **Version:** 0.5.0
- **Source:** https://github.com/2389-research/thrifty

## Install

Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

```
npx skills add 2389-research/thrifty
```

Or natively in Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install thrifty@2389-research
```

## README

# thrifty

**Tiered-delegation task execution for Claude Code.** A planner model writes the spec
into sprints, a cheap model executes and self-verifies against the gate — same gate
quality as the strong model, **~64% cheaper** (≈⅓ the cost) ([benchmarked](eval/RESULTS.md)).

> Offload each sprint of work to the **weakest model that can do it correctly.**

## The idea

Most of the work in a task is pattern-following execution, not reasoning. thrifty
concentrates planning in one model and pushes execution down to a cheap one, with the
**gate (tests / a checklist) as the trust contract** — independently re-run, never
self-reported. This generalizes "tests as the source of truth" to any task, code or not.

### Benchmarked architecture

The configuration that won the cost/quality bake-off (spec → working code, 7 tasks across
JS / Python / Go / prose, gate-verified — see [`eval/RESULTS.md`](eval/RESULTS.md) and
[`experiments/`](experiments/README.md)):

```text
spec ──▶ Sonnet  writes contract (pins cross-sprint + genuinely-ambiguous decisions)
                 + sprints.jsonl (one self-contained unit of work each)
            │
            ▼
         Haiku   one cached agent builds every sprint, runs the gate, and self-fixes
            │
            ▼
         Sonnet  a SCOPED patch — only if a specific failure is left (in practice: never;
                 the Haiku agent self-fixed to green on all 7 tasks)
```

**Result: ~64% cheaper than Opus building the same spec, at equal gate quality.** Two
things make it work: a single cached agent reuses the contract across turns (cheap, no
cold-call bloat), and the contract **pins every decision that crosses a sprint boundary**
so the executor never invents a system-level choice (leave one ambiguous and the executor
writes contradictory tests). Opus is *not* in the execution loop.

## Install

thrifty ships as a Claude Code **plugin** (bundles all six skills):

```text
/plugin marketplace add 2389-research/thrifty
/plugin install thrifty@thrifty
```

Then trigger it with **"thrifty"**, **"delegate this"**, or **"tiered build"**.

> The subagent-based skills (`thrifty`, `thrifty-plan/brief/execute/check`) need no
> external runtime. The lean `thrifty-dispatch` flow shells out to
> `skills/thrifty-dispatch/dispatch.py`, so it additionally requires **Python 3** on
> `PATH`.

To hack on it locally instead, symlink the skills into `~/.claude/skills/`:

```text
for d in skills/*/; do ln -s "$PWD/$d" ~/.claude/skills/; done
```

## Lineage

thrifty generalizes three existing systems to arbitrary tasks:

- **speed-run** — offload first-pass generation to a fast model; the strong model
  does architecture and *surgical* fixes, never wholesale regeneration.
- **pipelines/local_code_gen** — a strong architect pins every cross-sprint decision
  in a contract so the weak executor never makes a system-level choice.
- **Noospheric Orrery** — proof of the philosophy: Sonnet never extracts; Haiku
  does all the work; Sonnet writes and refines the spec until the cheap model
  reliably passes.

Where `local_code_gen` writes 600-line byte-pinned contracts for a tiny local
model (qwen3.6 / gemma), thrifty deliberately sits well above that floor. **Haiku
is far stronger**, so the contract pins only what is *cross-sprint AND genuinely
ambiguous* — the seams, not the interiors. Since the planner's (Sonnet) output is the
expensive part, terseness is the goal: pin the few decisions two capable sprints
would otherwise diverge on, and let Haiku infer the rest.

## Skills

| Skill | Role | Model | Runs as |
|-------|------|-------|---------|
| `thrifty` | orchestrator | — | this session |
| `thrifty-plan` | director's planning discipline | Sonnet | this session |
| `thrifty-brief` | expand a unit spec into a brief *(split tier)* | Sonnet | dispatched subagent |
| `thrifty-execute` | execute one unit | Haiku | dispatched subagent |
| `thrifty-check` | verify + fix one unit | Sonnet | dispatched subagent |

## Planning tiers (who writes the briefs)

- **direct** — the architect writes the contract *and* every brief. Fewest moving
  parts, one translation boundary. Best for **few sprints / subtle,
  correctness-critical work**.
- **split** — the architect (director) writes the contract + terse unit specs;
  parallel **Sonnet** brief-writers expand them (mirrors `local_code_gen`'s
  contract → sprint flow). Brief-writing runs in parallel and the architect's context
  stays lean. Best for **many sprints (≳ 6) / mechanical briefs / scale**.
- **hybrid** — the architect writes the 1–2 subtle sprints' briefs, delegates the routine rest.

Rough rule: direct below ~5 sprints, split above — but it's per-task, and the subtle
sprints can stay direct even in a split run. Authority follows the tier: the architect
owns the contract (cross-sprint), the brief-writer owns its unit (within-sprint), so a
within-sprint fix stays with a Sonnet brief-writer and only contract defects reach the
architect.

## Usage

Say **"thrifty"**, **"delegate this"**, or **"tiered build"** on a multi-part task.
The orchestrator will: frame the goal, plan (write `CONTRACT.md` + per-sprint briefs
with acceptance criteria, confirmed with you), dispatch Haiku executors in parallel
where dependencies allow, **verify each unit by criterion type** (run the gate for
runnable criteria; spend a Sonnet read only when a gate fails or there are
assertional criteria to judge), apply a bounded tiered fix loop, then do a final
coherence pass and report.

### Verification is adaptive (don't pay Sonnet to read passing code)

- **Runnable criteria** (tests, build, a CLI exit code) → the orchestrator just
  **runs the gate**. Pass = done, no model spent. This is still independent
  verification (the gate is re-run, not self-reported).
- **A gate fails** → a Sonnet checker reads the failure and surgically fixes it.
- **Assertional criteria** (prose, citations, canon, design quality) → a Sonnet
  checker reads and judges *those* dimensions.

So for code-with-tests the common path costs no checker tokens; Sonnet is spent only
on failures and on things only a reader can judge.

Artifacts land in `docs/thrifty/<task-slug>/` (`CONTRACT.md`, `briefs/`,
`LEDGER.md`) so a run is auditable and resumable.

### Decomposition modes

Not every task is "one file per agent." The architect picks a mode by how cohesive
the final artifact must be:

- **partition** — sprints own separate regions/files, run in **parallel**, architect
  merges. Best for separable outputs (code files, doc sections).
- **relay** — one shared artifact extended segment by segment, **sequentially**,
  each agent reading the artifact-so-far. Best for flowing prose (a story chapter).
- **layered** — role-specialized passes over the whole artifact (draft → continuity
  edit → polish), **sequentially**. Best for one seamless voice via multiple lenses.

A single artifact with no cross-sprint seams skips the contract entirely — one brief,
one execute, one check (or just don't use thrifty).

## Fix loop (bounded, terminates)

The checker diagnoses (`pass` / `local` / `execution` / `brief`); the orchestrator
decides and counts:

1. **surgical** (Sonnet, in place) — ≤ 2
2. **executor redo** (fresh Haiku + notes) — ≤ 1
3. **architect replan** (revise contract/brief) — ≤ 1
4. otherwise **surface to the human**

A regression guard rolls back any fix that breaks a previously-passing criterion.

## Design & evidence

The benchmarked architecture and the full cost/quality investigation (including the
approaches we tried and rejected) are in [`eval/RESULTS.md`](eval/RESULTS.md); reproducible
scripts + captured data are in [`experiments/`](experiments/README.md).

## Two implementations

- **Lean dispatch flow (benchmarked, recommended)** — `thrifty-dispatch`: Sonnet writes
  `contract.md` + `sprints.jsonl`, one cached Haiku agent builds + self-fixes, scoped
  Sonnet patch if needed. ~64% cheaper than Opus at equal gate quality. This is the
  architecture diagrammed at the top.
- **Subagent substrate (richer, pricier)** — the `thrifty-*` skills above (Sonnet architect
  → parallel Haiku executor subagents → Sonnet checker). More expensive in the bake-off
  (per-subagent harness + orchestrator context re-read); reach for it only when you need
  per-sprint *parallel* verification. Still uses "unit/brief" terminology internally.

## Status

v0.1 — **benchmarked.** The lean dispatch flow is ~64% cheaper than Opus building the same
spec, at equal gate quality, across 7 tasks (JS / Python / Go / prose). Evidence:
[`eval/RESULTS.md`](eval/RESULTS.md) (main findings + full journey) and
[`experiments/`](experiments/README.md) (reproducible scripts + captured cost data).


---
name: simmer
description: >
  Use when user says "simmer this", "refine this", "hone this", "iterate on this",
  or asks to improve a specific artifact over multiple rounds. Runs an iterative
  refinement loop using subagent judge feedback against user-defined criteria.
  Works on any artifact type: documents, prompts, specs, emails, creative writing,
  API designs, anything Claude can read and produce.
---

# Simmer

Iterative refinement loop — take a single artifact and hone it repeatedly against user-defined criteria until it's as good as it can get.

**Part of Test Kitchen Development:**
- `omakase-off` — don't know what you want → parallel designs → react → pick
- `cookoff` — know what you want, it's code → parallel implementations → fixed criteria → steal the best
- `simmer` — know what you want, it's anything → single artifact → user-defined criteria → iterate until good

## Flow

```
"Simmer this" / "Refine this" / "Hone this"
    ↓
┌─────────────────────────────────────┐
│  SETUP (identify + criteria)        │
│  Load simmer-setup subskill         │
│                                     │
│  Output: artifact, rubric, N iters  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  LOOP (default 3 iterations)        │
│                                     │
│  Each iteration:                    │
│  1. Dispatch generator subagent     │
│  2. Dispatch judge subagent         │
│  3. Load reflect subskill           │
│                                     │
│  Generator gets: candidate + ASI    │
│  Judge gets: candidate + rubric     │
│  Reflect gets: full score history   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  OUTPUT                             │
│  Best candidate → result file       │
│  Score trajectory displayed         │
└─────────────────────────────────────┘
```

## When to Use

Trigger when user wants iterative refinement of an artifact:
- "Simmer this", "refine this", "hone this", "iterate on this"
- "Make this better", "improve this over a few rounds"
- "Polish this", "tighten this up"
- Any request to iteratively improve a non-code artifact

**Not simmer:** If the artifact is code and the user wants parallel implementations, use cookoff instead.

## Orchestration

**Announce:** "I'm using the simmer skill to set up iterative refinement."

**Track progress** (TodoWrite if available, otherwise inline):
1. Setup — identify artifact and elicit criteria
2. Refinement loop (N iterations)
3. Output best version with score trajectory

### Phase 1: Setup

**Invoke `test-kitchen:simmer:simmer-setup`.**

Do not attempt to identify the artifact or ask about criteria yourself — that is the setup subskill's job.

**Shortcut:** If the user (or calling system) has already provided artifact, criteria (each with at least one sentence describing what a high score looks like), iteration count, and mode, skip the setup subskill entirely. Construct the setup brief directly and proceed to Phase 2.

Setup returns a brief:
```
ARTIFACT: [content or file path]
CRITERIA:
  - [criterion 1]: [what better looks like]
  - [criterion 2]: [what better looks like]
  - [criterion 3]: [what better looks like]
ITERATIONS: [N]
MODE: [seedless | from-file | from-paste]
OUTPUT_DIR: [path, default: docs/simmer]
```

### Phase 2: Refinement Loop

Create directory for artifacts:
```bash
mkdir -p {OUTPUT_DIR}
```

**Iteration counting:**

"N iterations" means N generate-judge-reflect cycles AFTER the initial seed judgment. The seed judgment is iteration 0 (not counted toward N). So `ITERATIONS: 3` means:
- Iteration 0: Judge the seed (no generator)
- Iteration 1: Generate → Judge → Reflect
- Iteration 2: Generate → Judge → Reflect
- Iteration 3: Generate → Judge → Reflect
- Total: 3 generation passes + 1 seed judgment = 4 judge rounds

For seedless mode: iteration 1 generates the initial candidate AND judges it. `ITERATIONS: 3` means 3 generation passes total.

**Iteration 0 (seed):**
- Write the seed artifact to `{OUTPUT_DIR}/iteration-0-candidate.md`
- If seedless: dispatch generator subagent to produce initial candidate from description + criteria, then judge it
- If from-file or from-paste: the seed IS the starting artifact — judge it directly (no generator)

**Each iteration:**

**Step 1: Generator (subagent)**

Invoke `test-kitchen:simmer:simmer-generator` as a subagent.

Subagent prompt:
```
You are the generator in a simmer refinement loop.

Invoke the skill: test-kitchen:simmer:simmer-generator

ITERATION: [N]
CRITERIA:
[rubric from setup]

CURRENT CANDIDATE:
[full text of current best candidate]

JUDGE FEEDBACK (ASI from previous round):
[ASI text, or "First iteration — generate initial candidate" if seedless iteration 1]

Write your improved candidate to: {OUTPUT_DIR}/iteration-[N]-candidate.md
(or appropriate extension matching artifact type)

Report: what specifically changed and why (2-3 sentences).
```

**Step 2: Judge (subagent)**

Invoke `test-kitchen:simmer:simmer-judge` as a subagent.

Subagent prompt:
```
You are the judge in a simmer refinement loop.

Invoke the skill: test-kitchen:simmer:simmer-judge

ITERATION: [N]
CRITERIA:
[rubric from setup]

CANDIDATE:
[full text of candidate just produced by generator]

SEED CALIBRATION:
[full text of original seed artifact]
SEED SCORES:
[iteration 0 scores — omit this block on iteration 0]

Score this candidate against the criteria using the seed as a calibration reference.
Do NOT look at or consider any intermediate iteration scores.
```

**Step 3: Reflect (inline, load subskill)**

Invoke `test-kitchen:simmer:simmer-reflect`.

Provide: full score history across all iterations so far, current iteration number, max iterations, judge output from this round.

**Handling regression:** If reflect reports that this iteration scored lower than best-so-far, the NEXT generator receives the best candidate (not the latest regressed one). The generator prompt should note: "Starting from the best version (iteration N), not the latest (which regressed)."

### Phase 3: Output

After all iterations complete:

1. Write best-scoring candidate to `{OUTPUT_DIR}/result.md`
2. Display full trajectory table
3. Summarize what changed from start to finish (2-3 sentences)
4. Offer: "N iterations complete. Run 3 more?"

If user continues: carry forward best candidate as new seed, reset iteration counter, run 3 more.

## Directory Structure

```
{OUTPUT_DIR}/
  iteration-0-candidate.md     # Seed (or seedless first generation)
  iteration-1-candidate.md     # Each improved candidate
  iteration-2-candidate.md
  iteration-3-candidate.md
  trajectory.md                # Running score table
  result.md                    # Final best output
```

`{OUTPUT_DIR}` defaults to `docs/simmer`. Override via setup brief's `OUTPUT_DIR` field.

## Single-Agent Mode

If you cannot dispatch separate subagents (e.g., nested Claude sessions are blocked, or you're running in a constrained environment), execute all roles sequentially.

**Context discipline is aspirational in single-agent mode.** You will see prior scores. Mitigate anchoring by: (a) writing your judge scores BEFORE reading your previous trajectory, and (b) scoring against the criterion descriptions and seed reference, not against your memory of prior scores.

**Per-iteration checklist (single-agent):**
1. **GENERATOR**: Review the simmer-generator constraints (especially what context you receive and do NOT receive). Read ASI + current best candidate. Write improved version to `{OUTPUT_DIR}/iteration-N-candidate.md`.
2. **JUDGE**: Review the simmer-judge constraints (especially scoring rules, seed calibration, and ASI format). Score against criteria + seed reference. Write scores in required format.
3. **REFLECT**: Update `{OUTPUT_DIR}/trajectory.md`. Note best-so-far. If regression, flag it and use best candidate as input to next iteration. Skip the formal "output to orchestrator" block — just update the file and continue.

## Context Discipline

**This is critical for consistent results:**

| Subskill | Receives | Does NOT receive |
|----------|----------|------------------|
| Generator | Current candidate, criteria, ASI from last judge | Score history, previous candidates |
| Judge | Current candidate, criteria, iteration number, seed + seed scores | Intermediate scores, intermediate candidates, ASI |
| Reflect | Full score history, all iteration summaries | Candidate content (just scores + summaries) |

The generator improves based on specific feedback, not scores.
The judge scores against criteria definitions and the seed as a fixed calibration reference — no intermediate scores.
The reflect subskill is the only one that sees the full trajectory.

## Skill Dependencies

| Dependency | Usage |
|------------|-------|
| `parallel-agents` | `superpowers:dispatching-parallel-agents` — fallback: dispatch sequentially |

## Common Mistakes

**Giving the generator score history**
- Problem: Generator optimizes for scores instead of addressing the specific ASI
- Fix: Generator only sees current candidate + ASI + criteria

**Giving the judge previous scores**
- Problem: Anchoring — judge calibrates relative to prior scores instead of fresh
- Fix: Judge only sees current candidate + criteria

**Trying to fix everything at once**
- Problem: Generator makes scattered edits, regression on some criteria
- Fix: ASI is a SINGLE most important fix — focused improvement compounds

**Sharing candidate history with the judge**
- Problem: Judge compares to previous versions instead of scoring against criteria
- Fix: Judge sees only the current candidate

**Not tracking best candidate separately**
- Problem: Last iteration may not be the best
- Fix: Reflect tracks best-scoring candidate across all iterations

## Example Flow

```
User: "Simmer this" [pastes a pitch email]

Claude: I'm using the simmer skill to set up iterative refinement.

[Invokes simmer-setup]

Setup identifies: pitch email, suggests criteria
User accepts: value prop clarity, tone match, call to action strength
Iterations: 3

[Iteration 0: Judge scores seed — no generation]
  value prop clarity: 4/10
  tone match: 5/10
  call to action: 3/10
  Composite: 4.0/10
  ASI: "The email never says what specific problem is solved —
        'helps companies save time on reporting' is too vague"

[Iteration 1: Generator addresses ASI, judge scores]
  value prop clarity: 7/10
  tone match: 5/10
  call to action: 4/10
  Composite: 5.3/10
  ASI: "The CTA asks for a 30-min call — too high friction for a
        cold email. Offer something smaller."

[Iteration 2: Generator addresses ASI, judge scores]
  value prop clarity: 7/10
  tone match: 6/10
  call to action: 6/10
  Composite: 6.3/10
  ASI: "CTA improved but still generic — offer a specific asset
        (e.g., '2-min video of how Acme Corp cut reporting 60%')"

[Iteration 3: Generator addresses ASI, judge scores]
  value prop clarity: 7/10
  tone match: 7/10
  call to action: 8/10
  Composite: 7.3/10

Trajectory:
| Iter | Value Prop | Tone | CTA | Composite | Key Change |
|------|-----------|------|-----|-----------|------------|
| 0    | 4         | 5    | 3   | 4.0       | seed       |
| 1    | 7         | 5    | 4   | 5.3       | specific problem statement |
| 2    | 7         | 6    | 6   | 6.3       | lower-friction CTA |
| 3    | 7         | 7    | 8   | 7.3       | specific asset in CTA |

Best candidate: iteration 3 (7.3/10)
Written to: {OUTPUT_DIR}/result.md

3 iterations complete. Run 3 more?
```

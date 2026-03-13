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

**Create TodoWrite tasks:**
1. Load simmer-setup subskill — identify artifact and elicit criteria
2. Run refinement loop (N iterations)
3. Output best version with score trajectory

### Phase 1: Setup

**Invoke `test-kitchen:simmer:simmer-setup`.**

Do not attempt to identify the artifact or ask about criteria yourself — that is the setup subskill's job.

Setup returns a brief:
```
ARTIFACT: [content or file path]
CRITERIA:
  - [criterion 1]: [what better looks like]
  - [criterion 2]: [what better looks like]
  - [criterion 3]: [what better looks like]
ITERATIONS: [N]
MODE: [seedless | from-file | from-paste]
```

### Phase 2: Refinement Loop

Create directory for artifacts:
```bash
mkdir -p docs/simmer
```

**Iteration 1 (seed):**
- If seedless: dispatch generator subagent to produce initial candidate from description + criteria
- If from-file or from-paste: the seed IS the starting artifact — skip generator, go straight to judge

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

Write your improved candidate to: docs/simmer/iteration-[N]-candidate.md
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

Score this candidate. Do NOT look at or consider any previous scores.
```

**Step 3: Reflect (inline, load subskill)**

Invoke `test-kitchen:simmer:simmer-reflect`.

Provide: full score history across all iterations so far, current iteration number, max iterations, judge output from this round.

### Phase 3: Output

After all iterations complete:

1. Write best-scoring candidate to `docs/simmer/result.md`
2. Display full trajectory table
3. Summarize what changed from start to finish (2-3 sentences)
4. Offer: "N iterations complete. Run 3 more?"

If user continues: carry forward best candidate as new seed, reset iteration counter, run 3 more.

## Directory Structure

```
docs/simmer/
  iteration-1-candidate.md     # Each candidate version
  iteration-2-candidate.md
  iteration-3-candidate.md
  trajectory.md                # Running score table
  result.md                    # Final best output
```

## Context Discipline

**This is critical for consistent results:**

| Subskill | Receives | Does NOT receive |
|----------|----------|------------------|
| Generator | Current candidate, criteria, ASI from last judge | Score history, previous candidates |
| Judge | Current candidate, criteria, iteration number | Previous scores, previous candidates, ASI |
| Reflect | Full score history, all iteration summaries | Candidate content (just scores + summaries) |

The generator improves based on specific feedback, not scores.
The judge scores fresh each round, avoiding anchoring to previous scores.
The reflect subskill is the only one that sees the full trajectory.

## Skill Dependencies

| Dependency | Usage |
|------------|-------|
| `parallel-agents` | `superpowers:dispatching-parallel-agents` — fallback: dispatch sequentially |
| `verification` | `superpowers:verification-before-completion` — verify final result |

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

[Iteration 1: Judge scores seed]
  value prop clarity: 4/10
  tone match: 5/10
  call to action: 3/10
  Composite: 4.0/10
  ASI: "The email never says what specific problem is solved —
        'helps companies save time on reporting' is too vague"

[Iteration 2: Generator addresses ASI, judge scores]
  value prop clarity: 7/10
  tone match: 5/10
  call to action: 4/10
  Composite: 5.3/10
  ASI: "The CTA asks for a 30-min call — too high friction for a
        cold email. Offer something smaller."

[Iteration 3: Generator addresses ASI, judge scores]
  value prop clarity: 7/10
  tone match: 6/10
  call to action: 7/10
  Composite: 6.7/10

Trajectory:
| Iter | Value Prop | Tone | CTA | Composite | Key Change |
|------|-----------|------|-----|-----------|------------|
| 1    | 4         | 5    | 3   | 4.0       | seed       |
| 2    | 7         | 5    | 4   | 5.3       | specific problem statement |
| 3    | 7         | 6    | 7   | 6.7       | low-friction CTA |

Best candidate: iteration 3 (6.7/10)
Written to: docs/simmer/result.md

3 iterations complete. Run 3 more?
```

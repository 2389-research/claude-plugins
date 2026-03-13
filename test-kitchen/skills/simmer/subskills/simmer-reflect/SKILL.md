---
name: simmer-reflect
description: >
  Reflect subskill for simmer. Records iteration results in trajectory table,
  tracks best candidate, and passes ASI forward to the next round. Do not
  invoke directly — called by simmer orchestrator after each judge round.
---

# Simmer Reflect

You are the only subskill that sees the full score history. Your job: record the iteration, track the best candidate, and pass the ASI forward.

## Context You Receive

- **Full score history**: all iterations so far (scores, composites, key changes)
- **Current iteration number** and **max iterations**
- **Latest judge output**: scores + ASI for this round
- **Generator report**: what changed this round (2-3 sentences)

## What To Do

### 1. Record in Trajectory

Update `{OUTPUT_DIR}/trajectory.md` with the running score table.

**Required format (do not add extra columns):**
- Columns: Iteration, [criterion names from rubric], Composite, Key Change
- Below table: `Best candidate: iteration [N] (composite: [N.N]/10)`
- No "Best?" column — use the line below the table instead

```markdown
# Simmer Trajectory

| Iteration | [criterion 1] | [criterion 2] | [criterion 3] | Composite | Key Change |
|-----------|---------------|---------------|---------------|-----------|------------|
| 0         | 4             | 5             | 3             | 4.0       | seed       |
| 1         | 7             | 5             | 4             | 5.3       | [summary]  |
| 2         | 7             | 6             | 7             | 6.7       | [summary]  |

Best candidate: iteration 2 (composite: 6.7/10)
```

The "Key Change" column uses the generator's 2-3 sentence report, condensed to a few words (under 60 characters). For iteration 0 (the seed), Key Change is always "seed".

### 2. Track Best Candidate

Compare this iteration's composite score to the best-so-far. Update the "Best candidate" line at the bottom of the trajectory.

**The best candidate may not be the latest one.** If iteration 3 scores lower than iteration 2, the best is still iteration 2.

### 2b. Handle Regression

If this iteration's composite is LOWER than best-so-far:
- Note the regression in the trajectory Key Change column (e.g., "regressed — ASI targeted X but Y suffered")
- Advise the orchestrator: next generator should receive the BEST candidate (not the latest), plus the current ASI
- Include in output: `REGRESSION: true — use iteration [N] as input to next generator`

### 3. Pass ASI Forward

Return to the orchestrator:
- The ASI from this round's judge (passed unchanged to next generator)
- Which iteration file contains the current best candidate
- Whether iterations remain
- Whether a regression occurred (and which candidate to use as input)

## Output to Orchestrator

```
ITERATION [N] RECORDED
BEST SO FAR: iteration [N] (composite: [N.N]/10)
REGRESSION: [true/false] — [if true: use iteration N as input to next generator]
ITERATIONS REMAINING: [N]
ASI FOR NEXT ROUND: [the judge's ASI, unchanged]
```

## Common Mistakes

**Modifying the ASI**
- Problem: Reflect edits or summarizes the judge's ASI before passing it forward
- Fix: Pass the ASI through unchanged — the judge wrote it for the generator

**Not tracking best-so-far separately**
- Problem: Assumes the last iteration is the best
- Fix: Always compare composite to best-so-far, update if better

**Writing candidate content into trajectory**
- Problem: Trajectory file becomes huge, clutters context
- Fix: Trajectory only contains scores, composites, and short key-change summaries

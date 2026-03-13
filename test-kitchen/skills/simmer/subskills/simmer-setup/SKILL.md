---
name: simmer-setup
description: >
  Setup subskill for simmer. Identifies the artifact to refine, elicits 2-3 quality
  criteria from the user, and produces a setup brief. Do not invoke directly —
  called by simmer orchestrator.
---

# Simmer Setup

Identify the artifact, elicit criteria, produce the setup brief that drives the entire refinement loop.

## Step 1: Identify the Artifact

Look for:
- A file path mentioned or open in context
- Text pasted by the user
- A description of something to generate from scratch (seedless mode)

If ambiguous, ask once:

```
What are we refining?
1. A file (give me the path)
2. Something you'll paste
3. Generate from a description (I'll create the starting point)
```

Set mode:
- **from-file**: artifact is a file path — read and use as seed
- **from-paste**: artifact is pasted text — use as seed
- **seedless**: artifact will be generated — first generator pass creates the seed

## Step 2: Elicit Criteria

Ask the user for 2-3 dimensions of "better." Offer seeds based on detected artifact type to reduce friction:

```
What does "better" mean for this? I'd suggest these criteria based on
what I'm seeing — accept, modify, or define your own:

1. [seed criterion 1]
2. [seed criterion 2]
3. [seed criterion 3]
```

### Seed Criteria by Artifact Type

| Artifact type | Suggested criteria |
|---|---|
| Document / spec | clarity, completeness, actionability |
| Creative writing | narrative tension, specificity, voice consistency |
| Email / comms | value prop clarity, tone match, call to action strength |
| Prompt / instructions | instruction precision, output predictability, edge case coverage |
| API design | contract completeness, developer ergonomics, consistency |
| Code (non-cookoff) | simplicity, robustness, readability |
| Adventure hook / game content | narrative tension, player agency, specificity |
| Blog post / article | argument clarity, engagement, structure |

**Maximum 3 criteria.** More dilutes the judge signal. If user proposes more than 3, ask them to pick the 3 most important.

For each accepted criterion, ask: "What does a 10/10 look like for this?" — capture their answer as the criterion description. If they don't have a strong opinion, use the seed description.

## Step 3: Check Iteration Count

Default is 3 iterations.

If user specified an override ("simmer this, 10 rounds"), capture it here.

Do not ask about iteration count unless the user brought it up — 3 is the default.

## Step 4: Output Setup Brief

Produce this exact format — it is consumed by every subsequent subskill:

```
ARTIFACT: [full content if from-paste, file path if from-file, description if seedless]
CRITERIA:
  - [criterion 1]: [what a 10/10 looks like]
  - [criterion 2]: [what a 10/10 looks like]
  - [criterion 3]: [what a 10/10 looks like]
ITERATIONS: [N]
MODE: [seedless | from-file | from-paste]
OUTPUT_DIR: [path, default: docs/simmer]
```

The `OUTPUT_DIR` defaults to `docs/simmer`. Override if the user specifies a different location or if running in a test/scratch context.

Return this brief to the orchestrator. Do not proceed to generation or judging — that is the orchestrator's job.

## Common Mistakes

**Proposing more than 3 criteria**
- Problem: Judge signal gets diluted, generator tries to fix too many things
- Fix: Cap at 3, ask user to prioritize

**Not asking what 10/10 looks like**
- Problem: Criteria are vague, judge has no anchor for scoring
- Fix: Get specific descriptions for each criterion

**Skipping seed criteria suggestions**
- Problem: User has to invent criteria from scratch, higher friction
- Fix: Always offer seeds, user can modify or replace

**Starting to generate or judge**
- Problem: Setup's job is ONLY to produce the brief
- Fix: Return the brief to the orchestrator, stop

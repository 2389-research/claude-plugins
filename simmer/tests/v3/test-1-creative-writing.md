# Test 1: Creative Writing — DND Adventure Hook (Text/Creative Path)

## What this tests
The judge-only loop mechanics: seedless generation, ASI quality, generator preservation of good parts, trajectory tracking. No evaluator, no contracts, no validation command.

## Subagent Prompt

Dispatch a subagent with the following. The subagent just runs simmer — no meta-knowledge.

```
You are running a simmer refinement loop. Use the simmer skill.

Here is the setup brief — skip setup and proceed directly to the refinement loop.

ARTIFACT: A DND adventure hook for a one-shot session. The party is level 5, exploring a haunted lighthouse on a stormy coast. Something is wrong with the light itself.
ARTIFACT_TYPE: single-file
CRITERIA:
  - narrative tension: scenes have stakes, time pressure, and consequences that make players feel urgency
  - player agency: multiple meaningful decision points with real tradeoffs, not a railroad
  - specificity: concrete details (names, descriptions, sensory hooks) not generic fantasy prose
ITERATIONS: 3
MODE: seedless
OUTPUT_DIR: /tmp/simmer-test-1
```

## Evaluation Criteria (for inner loop agent)

After the subagent finishes, read its output and the files at `/tmp/simmer-test-1/`. Assess:

1. Did the loop run 3 iterations without errors?
2. Was each ASI specific and actionable (not generic "make it more engaging")?
3. Did the generator preserve good parts while addressing ASI, or rewrite too aggressively?
4. Did scores move across iterations (not flat)?
5. Is the final hook usable — does it feel like something a DM could run?
6. Trajectory table: clean format, correct best-so-far tracking?

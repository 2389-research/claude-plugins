---
name: simmer-judge-board
description: >
  Judge board subskill for simmer. Dispatches a panel of judges with different
  lenses, runs one deliberation round where they challenge each other's scores,
  then synthesizes consensus scores + single ASI. Drop-in replacement for
  simmer-judge that produces identical output format. Do not invoke directly —
  dispatched by the simmer orchestrator when JUDGE_BOARD is enabled.
---

# Simmer Judge Board

Dispatch a panel of judges, let them score independently, deliberate, and converge on consensus scores + a single ASI. The board's output is identical to a single judge's output — the orchestrator can't tell the difference.

## Why a Board

A single judge has blind spots. It anchors on whatever it notices first, and its ASI reflects one perspective. Three judges with different lenses catch different things and challenge each other. The ASI that emerges from deliberation is stronger because blind spots get surfaced.

This matters most at plateaus — when a single judge keeps suggesting the same class of fix because it can't see the real bottleneck.

## Context You Receive

The board receives the same context the single judge would receive (passed through from the orchestrator):

- **Current candidate**: full artifact text or key workspace files
- **Criteria rubric**: 2-3 criteria with descriptions of what 10/10 looks like
- **Iteration number**: which round this is
- **Seed calibration** (iteration 1+): original seed + iteration-0 scores
- **Evaluator output** (if evaluator mode): stdout/stderr from evaluator command
- **Context discipline extras** (code/pipeline only): previous ASI, iteration history, search space, exploration status

Plus board-specific context:
- **JUDGE_PANEL** (optional): custom judge definitions from setup brief
- **Problem class**: text/creative, code/testable, or pipeline/engineering
- **ARTIFACT_TYPE**: single-file or workspace — this determines what the generator can change
- **SEARCH_SPACE** (if defined): explicit bounds on what's in scope to explore (models, topologies, prompt files, config parameters)
- **BACKGROUND**: constraints, available resources, execution environment (model size, infrastructure, budget). Judges need this to calibrate their ASI to what the executor can actually do — suggesting a 20-rule correction table for a 9b model is different from suggesting it for a 70b model.
- **Previous deliberation summary** (iteration 2+): what the panel agreed on, disagreed on, and concluded last round. Judges should build on prior panel conclusions rather than reasoning from scratch each iteration. If the panel concluded "complexity is hurting, keep it simple," the next panel should factor that in.

### Mutation Bounds

**Judges must understand what the generator can actually change.** The ASI is worthless if it suggests something outside the generator's scope.

| Artifact Type | Generator Can Change | Generator Cannot Change |
|---------------|---------------------|------------------------|
| **single-file** | The text content of the artifact (prompt, document, config file) | Model selection, code, infrastructure, pipeline topology, add new files |
| **workspace** | Any files in the workspace directory — code, config, prompts, scripts, add new files | Things outside the workspace, external infrastructure not in the search space |

If `SEARCH_SPACE` is defined, it further constrains what's in scope. A workspace with `SEARCH_SPACE: Models: qwen3.5:4b, qwen3.5:9b. Prompt changes: unlimited.` means the generator can swap between those two models and edit prompts, but can't add new pipeline stages or change the evaluator.

**Every ASI the panel produces must be actionable within these bounds.** If the panel concludes "the model is the bottleneck" but the artifact is single-file (can't swap models), the ASI should say "prompt changes alone won't break through this ceiling — recommend switching to workspace mode or early termination" rather than suggesting a model swap the generator can't execute.

**Judges must read the relevant artifacts before scoring.** Read the candidate, the evaluator script, config files, and prior candidates. Understand how the system works and why the scores are what they are. Research approaches if you see failure patterns you don't know how to fix. The ASI should come from understanding, not from reading metrics and guessing.

## The Three Phases

### Phase 1: Independent Scoring (Parallel)

Dispatch 3 judges as parallel subagents. Each receives the full judge context plus a unique LENS assignment.

Each judge invokes `simmer:simmer-judge` — the existing judge skill is reused. The lens is preamble context that frames their perspective.

**Panelist prompt template:**
```
You are one of three judges on a simmer judge board. Your role is to
score from your specific lens — the other judges cover other angles.

YOUR LENS: [name]
[lens description — what to focus on, what perspective you bring]

ARTIFACT_TYPE: [single-file | workspace]
SEARCH_SPACE: [what's in scope to change — omit if unconstrained]

WHAT THE GENERATOR CAN CHANGE:
[single-file: only the text content of this file. Cannot swap models,
add code, or change infrastructure.
OR workspace: any files in the workspace. Can edit code, config, prompts,
add files. Bounded by search space if defined.]

BACKGROUND:
[constraints, model size, infrastructure, available resources — everything
the generator knows about the execution environment]

PREVIOUS PANEL DELIBERATION:
[summary of what last round's panel agreed on, disagreed on, and concluded
— omit on iteration 0]

Score honestly from this lens. Your unique perspective is why you're
on this board. Don't try to be comprehensive — go deep on your angle.
Your scores and reasoning will be shared with the other judges for
deliberation, so be specific about what you see.

Your ASI candidate must be actionable within the generator's bounds.
If you conclude the bottleneck is outside those bounds (e.g., "model
is too weak" on a single-file artifact), say so — the clerk will
recommend early termination or mode change rather than a wasted iteration.

Before scoring and writing your ASI, read the relevant code and
artifacts — the candidate, the evaluator script, config files, prior
candidates if available. Understand how the system works, not just
what the scores say. Then research if needed — if you see a pattern
in the failures, look up how similar problems are solved.

A good reviewer reads the code, understands the scores in context,
and reasons about improvements from that understanding. A bad
reviewer looks at metrics and guesses.

Invoke the skill: simmer:simmer-judge

[... standard judge context from orchestrator ...]
```

Each panelist produces the standard judge output format:
```
ITERATION [N] SCORES:
  [criterion]: [N]/10 — [reasoning] — [specific improvement]
COMPOSITE: [N.N]/10

ASI (highest-leverage direction):
[their ASI candidate]
```

### Phase 2: Deliberation (One Round)

After collecting all independent scores, run one deliberation round. Each judge sees the other judges' scores + reasoning (but NOT their ASI candidates yet — ASI deliberation happens in synthesis).

**Deliberation prompt per panelist:**
```
You are deliberating on a simmer judge board.

YOUR INDEPENDENT SCORES (from Phase 1):
[this judge's full output]

JUDGE B's SCORES:
[judge B's scores + reasoning, not their ASI]

JUDGE C's SCORES:
[judge C's scores + reasoning, not their ASI]

Review the other judges' scores and reasoning. For each criterion:

1. **Agree** — if you agree, say so briefly
2. **Challenge** — if you disagree, explain what the other judge missed
   or got wrong. Cite evidence from the candidate or evaluator output.
3. **Concede** — if another judge's reasoning changes your mind, revise
   your score and explain why

One round only. Be direct.

DELIBERATION:
  [criterion]: [agree/challenge/concede] — [reasoning] — [revised score if changed, or "holds"]
```

**Why one round:** Iterative deliberation risks convergence to the loudest voice. One round of "see and react" surfaces blind spots without losing independence.

**Why withhold ASI candidates:** If judges see each other's ASI during deliberation, they'll anchor on someone else's direction instead of defending their own perspective. ASI candidates go to the synthesis step.

### Phase 3: Synthesis (Clerk)

The board orchestrator acts as clerk. No subagent needed — this runs inline.

**Step 1: Consensus scores.**

For each criterion, take the post-deliberation scores (revised where judges conceded, original where they held):
- **All within 1 point**: use the median. Note agreement.
- **2+ point spread after deliberation**: use the median. Note the tension and why judges disagreed — this informs the ASI.

Compute composite as the average, one decimal place.

**Step 2: Synthesize ASI.**

Read all three judges' independent ASI candidates + the deliberation highlights (challenges, concessions, tensions). Then **distill** — don't select.

The board's value is in its analysis. The ASI's value is in its focus. Don't let the breadth of the analysis dilute the focus of the ASI.

1. **Identify the single highest-leverage move.** Not the most thorough analysis — the one change that would move scores the most. If all three judges point at different things, pick the one that addresses the primary criterion's biggest bottleneck. If you find yourself writing "also" or listing multiple changes, you're diluting. Pick one.

2. **Check alignment with panel conclusions.** If the deliberation concluded "current approach has hit a ceiling," the ASI must propose a structural change (different model, topology, post-processing) — not more of the same approach. If no structural change is possible in the current mode, recommend early termination with a specific next step the user can take.

3. **Check generator feasibility.** In single-file mode, the generator can only edit text. Don't propose code changes, model swaps, or architecture changes unless the artifact type is workspace. Filter for what the generator can actually do in the current mode.

4. **Keep it focused.** The ASI is ONE direction with ONE primary change. The generator should know exactly what to do. A compound ASI ("fix the correction table AND expand the taxonomy AND add self-check") will overwhelm the generator, especially with smaller models. The single judge's strength was focus — the board must match that.

**Step 3: Deliberation summary (for next iteration's panel).**

Write a 2-3 sentence summary of what the panel agreed on, what they disagreed on, and what they concluded. This gets passed to the next iteration's panel as PREVIOUS PANEL DELIBERATION. Focus on actionable conclusions, not score details.

Example: "Panel agreed that the 9b model can't handle long prompts — all three regressions correlated with prompt length increases. Metrics judge noted 15 near-miss entities that need code-side normalization rather than prompt rules. Strategy judge argued for simpler prompt + Python post-processing, which the panel endorsed."

**Step 4: Output.**

Produce the standard judge output format:
```
ITERATION [N] SCORES:
  [criterion]: [N]/10 — [consensus reasoning, noting tensions if any] — [specific improvement]
COMPOSITE: [N.N]/10

ASI (highest-leverage direction):
[single ASI — the strongest-evidence direction from the panel]
```

This is identical to what a single judge produces. The orchestrator, reflect, and generator cannot tell the difference.

## Default Judge Panels

When no `JUDGE_PANEL` is provided, use defaults based on problem class:

### Text/Creative

| Judge | Lens |
|-------|------|
| **Craft** | Structure, mechanics, technique. Does the writing work at a craft level — pacing, word choice, sentence rhythm, paragraph flow? Score from the perspective of a writing instructor. |
| **Reader** | Engagement, clarity, emotional impact. Does this land for the intended audience? Score from the perspective of someone reading this cold with no context. Flag anything that requires re-reading or assumed knowledge. |
| **Domain** | Factual accuracy, genre conventions, domain credibility. Does this get the subject matter right? Score from the perspective of someone who knows this domain well. |

### Code/Testable

| Judge | Lens |
|-------|------|
| **Correctness** | Does it work? Focus on test results, edge cases, error handling. Score from the perspective of someone who will run this in production. |
| **Architecture** | Design quality, maintainability, separation of concerns. Score from the perspective of someone who has to modify this in 6 months. |
| **Efficiency** | Performance, resource usage, cost. Score from the perspective of someone who cares about the operational cost of running this. |

### Pipeline/Engineering

| Judge | Lens |
|-------|------|
| **Metrics** | Evaluator output analysis. Deep-dive the numbers — which test cases failed, what patterns emerge, where are the near-misses vs systematic gaps? Score based on what the data shows, not what the approach promises. |
| **Strategy** | Exploration and approach. Is the current configuration the right one? Has the search space been adequately explored? Is the approach stuck, oscillating, or genuinely improving? Score based on trajectory and remaining potential. |
| **Integration** | Output quality, contract compliance, downstream usability. Does the output actually work for its intended use? Score based on whether someone could use this output today. |

## Custom Judge Panels

Users can define custom judges in the setup brief:

```
JUDGE_PANEL:
  - name: Technical Accuracy
    lens: Score with focus on factual correctness and logical consistency
  - name: Audience Fit
    lens: Score as a first-time reader with no domain background
  - name: Actionability
    lens: Score with focus on whether the reader can act on this immediately
```

Custom panels override the defaults entirely. Minimum 2 judges, maximum 5. Default is 3.

## Agency Integration (Future)

When Agency is available, the board can request dynamically composed judges instead of using manual profiles:

```
judges = agency_assign([
    {"task": "[task description emphasizing lens A]", "role": "judge"},
    {"task": "[task description emphasizing lens B]", "role": "judge"},
    {"task": "[task description emphasizing lens C]", "role": "judge"}
])
```

Agency selects primitives (role components, desired outcomes, trade-off configs) matched to each lens description. The composed judges have task-specific capabilities rather than generic profiles.

The board's three-phase workflow stays the same — Agency only changes how the judges are composed, not how they interact.

## Context Discipline

The board preserves simmer's context discipline exactly:

**Text/creative judges receive:**
- Current candidate, criteria, seed + seed scores, iteration number
- Their lens assignment
- (In deliberation) other judges' scores + reasoning

**Text/creative judges do NOT receive:**
- Intermediate iteration scores, previous ASI, trajectory, previous candidates

**Code/pipeline judges receive:**
- Everything text/creative judges receive
- Plus: evaluator output, previous ASI, iteration history, search space, exploration status

**Cross-judge visibility (deliberation only):**
- Other judges' scores + reasoning (within this iteration only)
- NOT other judges' ASI candidates (withheld until synthesis)

No new cross-iteration information is introduced. The board multiplies perspectives within a single iteration, not across iterations.

## Common Mistakes

**Compound ASI overwhelming the generator**
- Problem: Each judge's ASI candidate is multi-faceted. The clerk picks one but it still lists 3-4 changes. Generator tries all of them, artifact bloats, scores regress.
- Fix: The clerk distills, not selects. Read all three ASI candidates and produce ONE focused move. If you're writing "also" or listing changes, you're diluting. The board's analysis is broad — the ASI must be narrow.

**Ignoring mode constraints in ASI**
- Problem: Board correctly identifies "model swap needed" or "add post-processing" but the artifact is single-file — generator can only edit text.
- Fix: Check artifact type. Single-file ASI must be prompt-level changes only. Structural recommendations (model swap, code changes) are only actionable in workspace mode.

**Blending ASIs**
- Problem: Clerk merges three ASIs into one that tries to address everything
- Fix: Pick the single strongest-evidence direction. One ASI, one coherent move.

**Deliberation becomes debate**
- Problem: Judges go back and forth for multiple rounds, losing independence
- Fix: One round only. Agree, challenge, or concede — then stop.

**Judges trying to be comprehensive**
- Problem: Each judge covers all angles instead of going deep on their lens
- Fix: The lens prompt says "go deep on your angle, the other judges cover other angles"

**Withholding challenges to be polite**
- Problem: Judges agree with everything, board produces the same result as a single judge
- Fix: Challenges are the point. "You gave specificity 8 but the evaluator shows 15 near-misses" is exactly the kind of challenge that surfaces blind spots.

**Averaging scores instead of deliberating**
- Problem: Board just takes the mean of three scores without the judges seeing each other's reasoning
- Fix: The deliberation round is required, not optional. Judges must see and respond to each other.

**Using a board when a single judge suffices**
- Problem: Simple text refinement doesn't benefit from 3 judges — just adds latency
- Fix: Board is opt-in. Default is single judge. Use the board for complex artifacts, plateau-breaking, or when the user requests it.

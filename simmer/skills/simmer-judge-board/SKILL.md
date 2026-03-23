---
name: simmer-judge-board
description: >
  Judge board subskill for simmer. Dispatches a panel of judges with different
  lenses, runs one deliberation round where they challenge each other's scores,
  then synthesizes consensus scores + single ASI. Drop-in replacement for
  simmer-judge that produces identical output format. Do not invoke directly —
  dispatched by the simmer orchestrator when JUDGE_MODE is board.
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
- **Previous deliberation summary** (iteration 2+): structured as WORKING / NOT WORKING / DIRECTION. Judges must respect the WORKING list — these are elements that have been stable across iterations and should not be removed or changed. The NOT WORKING list prevents retrying failed approaches. The DIRECTION is where the panel's strategic reasoning lives. Build on prior conclusions rather than reasoning from scratch each iteration.

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

Score ALL criteria from your lens — not just one. Your lens frames
HOW you analyze, not WHAT you analyze. A Metrics judge scores coverage,
noise, specificity, and conceptual depth — all from a data-analysis
perspective. This gives the board cross-criterion insight: "coverage
went up but noise went up more — the change isn't worth it."

Do NOT split criteria across judges (one judge per criterion). Every
judge scores every criterion from their unique perspective.
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

**Step 3: Deliberation summary (for next iteration's panel and Agency re-composition).**

Write a structured summary with three sections. This gets passed to the next iteration's judges, to Agency's `agency_assign` descriptions for re-composition, and to the generator as execution context.

```
WORKING (preserve — do not remove or change):
- [element that's been stable across iterations, e.g., "Corrections lookup table — working since iter 1, held through 3 iterations"]
- [another stable element]

NOT WORKING (do not retry same approach):
- [element that was tried and regressed, e.g., "Abstract conditional rules — tried iter 2, 9b model can't follow them"]
- [another failed approach]

DIRECTION:
[What the panel concluded about where to go next — one sentence.
e.g., "Add brand inference as an explicit checklist item — the model handles binary checks well."]
```

Incorporate the STABLE WINS from the reflect subskill if available — those are tracked across the full trajectory, not just the current deliberation. The deliberation summary adds the panel's reasoning about *why* things worked or didn't.

This structured format ensures:
- The next iteration's judges know what to preserve (stops the pivoting problem)
- Agency re-composition gets richer context about what's actually happening
- The generator knows what's load-bearing and won't strip it when implementing the ASI

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

## Judge Composition

The board **constructs** judges for each run — it doesn't pick from a fixed menu. The board reads the artifact, criteria, background, evaluator, and constraints, then builds 3 judges with diverse lenses tailored to this specific problem. The primitives and example lenses below are building blocks and samples, not the judges themselves.

### How Composition Works

1. **Read the full problem context.** The artifact, criteria, evaluator output format (if any), background constraints, model capabilities, what's mutable. Understand the problem before designing judges for it.

2. **Design 3 judges with diverse perspectives.** Each judge needs a unique angle on the problem. Ask: "What are the 3 most different ways to evaluate this artifact?" The answer depends on the problem:
   - An LLM extraction prompt for a 9b model might get: **Evaluator Analyst** (deep-dive the metrics), **Model Realist** (what can a 9b model actually follow?), **Downstream User** (would this output work in a RAG pipeline?)
   - A DND adventure hook might get: **Craft** (structure, pacing), **Player** (agency, decision points), **DM** (runnability, stat completeness)
   - A cold outreach email might get: **Copywriter** (hook, flow, CTA), **Recipient** (cold-read as a busy VP), **Deliverability** (length, spam triggers, reply friction)

   The judges should be specific to the problem, not generic "Metrics/Strategy/Integration."

3. **Give each judge relevant capabilities from the primitive library.** These are proven capabilities that make judges more effective — apply the relevant ones based on what each judge needs to do.

### Judge Primitive Library

Building blocks for constructing judges. Apply relevant ones to each judge based on their role.

**Core (apply to all judges):**
- Score via seed calibration — score the original first, anchor all subsequent iterations to it
- Diagnose before scoring — read the candidate, evaluator output, and relevant code/config. Understand *why* things are the way they are before writing scores.
- Protect high-scoring elements — identify what's working and constrain your ASI to preserve it
- Score ALL criteria from your lens — every judge scores every criterion from their perspective, not one criterion per judge

**When evaluator is present:**
- Cluster evaluator failures by type — near-misses (spelling), systematic gaps (whole category), noise (hallucinations). The pattern determines the fix.
- Verify proper nouns from lossy sources — transcripts, OCR, and auto-captions garble names
- Flag evaluator stochasticity — if the same config produces different results, small score changes may be noise

**When the problem involves exploration:**
- Review what's been tried — check iteration history before suggesting more of the same
- Flag ceilings — if 2+ iterations tried the same type of change with no improvement, the bottleneck is structural
- Research if stuck — look up how similar problems are solved rather than guessing

### Example Compositions

These show how judges are constructed for different problems — they're examples, not templates.

**LLM extraction prompt (9b model, evaluator-backed):**
| Judge | Why this lens | Key primitives |
|-------|--------------|----------------|
| **Evaluator Analyst** | Someone needs to deep-dive the metrics — which entities were missed, which were hallucinated, what patterns emerge | Cluster failures, verify proper nouns, flag stochasticity |
| **Model Realist** | The 9b model has specific capabilities and limits that affect what prompt structures work | Diagnose before scoring, flag ceilings, research if stuck |
| **Downstream User** | The extracted entities feed a RAG pipeline — does the output actually work for search? | Protect high-scoring elements, score via seed calibration |

**Creative writing (judge-only, no evaluator):**
| Judge | Why this lens | Key primitives |
|-------|--------------|----------------|
| **Craft** | Is the writing working at a technical level — structure, pacing, voice? | Diagnose before scoring, protect high-scoring elements |
| **Reader** | Does this land emotionally for someone reading it cold? | Score via seed calibration |
| **Domain Expert** | Does it get the genre/setting/rules right? | Research if stuck (for genre conventions) |

**Pipeline optimization (workspace, multi-model):**
| Judge | Why this lens | Key primitives |
|-------|--------------|----------------|
| **Metrics** | What do the evaluator numbers actually show? | Cluster failures, flag stochasticity |
| **Architecture** | Is the pipeline structure right, or is it a local optimum? | Flag ceilings, review what's been tried |
| **Operations** | Can this run reliably in production at acceptable cost? | Protect high-scoring elements |

### Custom Judge Panels

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

Custom panels override auto-composition entirely. Minimum 2 judges, maximum 5. Default is 3.

## Agency Integration

When the Agency MCP server is available, the board composes judges dynamically instead of using manual profiles. Agency selects primitives (role components, desired outcomes, trade-off configs) matched to each judge's task description, producing agents with task-specific capabilities.

**The board's three-phase workflow stays the same.** Agency only changes how judges are composed, not how they interact.

### Detecting Agency

Before composing, check if Agency is available:

```
Call: agency_status
If: returns successfully → use Agency composition
If: fails or times out → fall back to manual profiles
```

### Composing the Judge Panel

**Default: compose once (`AGENCY_COMPOSE: once`).** Call `agency_assign` at iteration 0 and reuse the same `rendered_prompt` for all subsequent iterations. The judges still get updated context each iteration (evaluator output, deliberation summaries, stable wins, iteration history) — they just analyze it from a consistent compositional perspective.

Testing showed static composition produces better output than adaptive re-composition. The same judges building incrementally on one architecture beats re-composed judges who pivot their analysis each round. Static judges had 6.4 composite / 73% recall / ±1 entity variance. Adaptive judges had 4.8-6.0 and pivoted too much.

**Optional: re-compose each iteration (`AGENCY_COMPOSE: each-iteration`).** Call `agency_assign` fresh each iteration with updated descriptions including deliberation summaries and stable wins. Use for diagnostic/research runs where understanding the capability boundary matters more than output quality, or for workspace tasks where the problem domain shifts significantly between iterations.

Call `agency_assign` with one task per judge. Each description should frame the judge as a **lens on the full problem** — not a specialist on one criterion. The description says what perspective to bring ("focus on evaluator output patterns"), not what criterion to score ("score coverage").

**CRITICAL: Do NOT split criteria across judges.** Every judge scores every criterion from their unique perspective. A Metrics judge scoring all 4 criteria can say "coverage went up but noise went up more — not worth it." A coverage-only judge can't see that trade-off.

If `AGENCY_COMPOSE: once`, store the returned `rendered_prompt` per judge and reuse it on subsequent iterations.

```
Call: agency_assign {
  tasks: [
    {
      external_id: "simmer-judge-metrics-iter-N",
      description: "Judge an LLM extraction prompt for entity extraction
        from miniature painting video transcripts. Model: qwen3.5:9b.
        Evaluator output includes per-video coverage %, precision %,
        parse error counts. Focus your analysis on: evaluator output
        patterns, failure clustering, near-miss vs systematic gaps.
        This is a single-file artifact — the generator can only change
        the prompt text, not code or infrastructure.",
      skills: ["evaluation", "prompt-engineering", "data-analysis"],
      deliverables: ["scoring-report", "improvement-direction"]
    },
    {
      external_id: "simmer-judge-strategy-iter-N",
      description: "Judge an LLM extraction prompt optimization strategy.
        The prompt runs on qwen3.5:9b via Ollama for entity extraction.
        Previous iterations have tried: [summary from iteration history].
        Focus on: whether the current approach is stuck, what's been
        tried vs untried, whether prompt complexity is hurting the small
        model. Single-file mode — only prompt text changes are possible.",
      skills: ["strategy", "prompt-engineering", "optimization"],
      deliverables: ["scoring-report", "improvement-direction"]
    },
    {
      external_id: "simmer-judge-integration-iter-N",
      description: "Judge the output quality of an LLM extraction prompt.
        Output contract: JSON with 'entities' array, each with 'name'
        and 'type'. Focus on: output format compliance, entity naming
        precision, type assignment accuracy, downstream usability for
        RAG search. Model: qwen3.5:9b, single-file mode.",
      skills: ["evaluation", "data-quality", "integration"],
      deliverables: ["scoring-report", "improvement-direction"]
    }
  ]
}
```

**Building the descriptions:**

The board constructs each description from:
- The artifact description and problem class from the setup brief
- The lens focus from the default panel (or custom panel)
- Relevant constraints: model size, artifact type, search space

**If `AGENCY_COMPOSE: once` (default):** Build descriptions once at iteration 0. The judges get updated context (evaluator output, stable wins, deliberation summaries) via the panelist prompt each iteration, but their Agency composition stays constant. This gives compositional continuity — the same judges build incrementally.

**If `AGENCY_COMPOSE: each-iteration`:** Also include previous deliberation summary and iteration history in the description so Agency may select different primitives as context evolves.

**Example description (used for initial composition):**
```
Judge an LLM extraction prompt for entity extraction from video
transcripts. Model: qwen3.5:9b. Focus: evaluator output patterns,
failure clustering. Single-file mode.
```

**Example — iteration 4 description (rich):**
```
Judge an LLM extraction prompt for entity extraction from video
transcripts. Model: qwen3.5:9b. Focus: evaluator output patterns.
Single-file mode.

Panel history: Iteration 1 added correction table but stripped
working stop-list (regressed). Iteration 2 tried conditional
logic (9b can't follow it). Iteration 3 recovered with positive
examples + lookup tables. The model handles tables and checklists
well but fails at abstract rules. Current best: 5.3/10.
```

Agency returns a `rendered_prompt` per agent — use it as the judge's system context alongside the standard panelist prompt template. The rendered prompt replaces the generic lens description.

### Using the Rendered Prompt

Each judge's panelist prompt becomes:

```
You are one of three judges on a simmer judge board.

AGENCY COMPOSITION:
[rendered_prompt from agency_assign — contains role components,
desired outcomes, and trade-off configuration selected for this
specific judging task]

[... rest of standard panelist prompt: artifact type, mutation bounds,
background, previous deliberation, instructions to read code, etc.]
```

The rendered prompt provides the judge's specialized capabilities. The standard panelist prompt provides simmer-specific context (mutation bounds, deliberation protocol, scoring format).

### Submitting Evaluations

After synthesis, submit the panel's consensus evaluation back to Agency so primitives evolve:

```
For each judge:
  Call: agency_evaluator { agency_task_id: "[from assign response]" }
  → returns evaluator_prompt, callback_jwt

  Call: agency_submit_evaluation {
    agency_task_id: "[from assign response]",
    callback_jwt: "[from evaluator response]",
    output: "Judge [lens] scored: [scores]. Key contribution to
      deliberation: [what this judge uniquely surfaced]. Panel
      consensus composite: [N.N]/10.",
    score: [composite * 10, as 0-100 integer],
    task_completed: true,
    score_type: "rubric"
  }
```

This closes the feedback loop. Agency learns which primitive compositions produce good judges for this type of task. Future simmer runs on similar artifacts get better-composed judges.

### Graceful Degradation

```
IF agency_status succeeds:
    Compose judges via agency_assign
    After synthesis, submit evaluations via agency_submit_evaluation
ELSE:
    Use manual profiles from default panels (or JUDGE_PANEL if specified)
    Skip evaluation submission
    Tell the user what happened and how to fix it
```

**When Agency is unavailable and the user requested it**, explain clearly:

> "Agency MCP isn't running — I'll use manual judge profiles for this run. You'll still get the judge board with deliberation, just without task-matched composition.
>
> To enable Agency for future runs:
> ```
> pipx install agency-engine
> agency init
> agency serve
> ```
> Then add it to your Claude Code MCP settings. See the [Agency docs](https://github.com/agentbureau/agency) for details."

**When Agency is unavailable and the user didn't request it**, say nothing — just use manual profiles silently. Don't advertise Agency to users who haven't asked for it.

The board works identically in both paths. Agency adds better composition and cross-run learning, but isn't required.

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

**Splitting criteria across judges (one criterion per judge)**
- Problem: Each judge scores only one criterion — loses cross-criterion insight. A coverage-only judge can't see that coverage went up but noise went up more. The board produces 4 isolated scores instead of 12 data points with trade-off awareness.
- Fix: Every judge scores ALL criteria from their lens. The lens frames the perspective (data analysis, strategy, integration), not the criterion. 3 judges × 4 criteria = 12 scored data points with cross-criterion insight.

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

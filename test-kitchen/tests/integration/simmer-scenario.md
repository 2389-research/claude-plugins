# Simmer Integration Test Scenarios

## Purpose

These scenarios test that simmer correctly:
1. **Triggers on refinement requests** ("simmer this", "refine this", "hone this")
2. **Runs setup** (identify artifact, elicit criteria, produce brief)
3. **Executes the loop** (iteration 0 seed judge, then N generate-judge-reflect cycles)
4. **Enforces context discipline** (generator doesn't see scores, judge doesn't see intermediate scores)
5. **Handles edge cases** (seedless mode, regression, setup shortcut, single-agent fallback)
6. **Does NOT trigger** inappropriately

## Baseline Behavior (Without Skill)

Before testing WITH the skill, establish what agents do WITHOUT it:

**Expected baseline failures:**
- Agent rewrites the artifact in one shot instead of iterating
- Agent doesn't ask for criteria — just "improves" based on vibes
- Agent doesn't track scores or trajectory
- Agent has no concept of ASI — tries to fix everything at once
- Agent doesn't separate generator and judge roles

Document verbatim rationalizations agents use when they skip the skill.

---

## Test 1: Trigger - "Simmer This"

**Setup:** User pastes a short pitch email

**User input:** "Simmer this"

**Expected behavior:**
1. `simmer` triggers
2. Invokes simmer-setup (or applies shortcut if criteria provided)
3. Setup identifies artifact type (email), suggests criteria
4. Asks user to accept/modify criteria
5. Waits for user confirmation before starting loop

**Success criteria:**
- ✅ Skill triggers on "simmer this"
- ✅ Setup identifies artifact type
- ✅ Seed criteria offered (value prop clarity, tone match, call to action strength)
- ✅ Maximum 3 criteria
- ✅ Asks what 10/10 looks like for each

**Baseline check:** Does agent just rewrite the email without asking about criteria?

---

## Test 2: Trigger - "Refine This"

**Setup:** User has a file path to an API spec

**User input:** "Refine this" [provides file path]

**Expected behavior:** Same as Test 1 — skill triggers, setup runs

**Success criteria:**
- ✅ "refine this" triggers simmer
- ✅ File read and used as seed (from-file mode)

---

## Test 3: Trigger - "Hone This Over a Few Rounds"

**User input:** "Hone this over a few rounds" [pastes text]

**Expected behavior:** Same trigger, setup identifies from-paste mode

**Success criteria:**
- ✅ "hone this" triggers simmer
- ✅ Pasted text used as seed (from-paste mode)

---

## Test 4: Trigger - "Iterate on This, 5 Rounds"

**User input:** "Iterate on this, 5 rounds" [pastes text]

**Expected behavior:**
1. Simmer triggers
2. Setup captures iteration override: 5
3. Loop runs 5 generation passes (iterations 1-5 after iteration 0 seed judge)

**Success criteria:**
- ✅ Iteration count override captured
- ✅ Loop runs exactly 5 generation passes
- ✅ Iteration 0 is seed judge (not counted toward 5)

---

## Test 5: Setup - Seedless Mode

**User input:** "Simmer me an adventure hook for a D&D session about a haunted lighthouse"

**Expected behavior:**
1. Setup identifies seedless mode (no artifact provided, just a description)
2. Suggests criteria (narrative tension, player agency, specificity)
3. After criteria confirmed, iteration 1 generates initial candidate AND judges it
4. Loop continues from there

**Success criteria:**
- ✅ Seedless mode detected
- ✅ Description captured in setup brief
- ✅ First generator produces seed from description
- ✅ Total generation passes = N (not N-1)

---

## Test 6: Setup Shortcut - Pre-Specified Criteria

**Setup:** Calling system provides complete brief:
```
Artifact: [full text]
Criteria:
  - clarity: reader understands the main point in one sentence
  - actionability: reader knows exactly what to do next
  - brevity: no wasted words
Iterations: 3
Mode: from-paste
```

**Expected behavior:**
1. Setup subskill is SKIPPED entirely
2. Loop starts immediately with iteration 0 (judge the seed)

**Success criteria:**
- ✅ Setup skipped when brief is complete
- ✅ Each criterion has at least one sentence describing high score
- ✅ No unnecessary questions asked
- ✅ Agent does not feel it's deviating from instructions

---

## Test 7: Iteration Counting - 3 Iterations

**Setup:** ITERATIONS: 3, from-paste mode

**Expected behavior:**
- Iteration 0: Judge the seed (no generation). Write seed to `{OUTPUT_DIR}/iteration-0-candidate.md`
- Iteration 1: Generate → Judge → Reflect
- Iteration 2: Generate → Judge → Reflect
- Iteration 3: Generate → Judge → Reflect
- Total: 4 judge rounds, 3 generation passes

**Success criteria:**
- ✅ Iteration 0 is seed-only (no generator)
- ✅ Exactly 3 generation passes after seed
- ✅ Seed written to iteration-0-candidate.md
- ✅ Each candidate written to iteration-N-candidate.md
- ✅ Trajectory has 4 rows (0, 1, 2, 3)

**Why this matters:** v1 was ambiguous — 2 of 3 test agents interpreted "3 iterations" as seed + 2 gen passes. This must be unambiguous.

---

## Test 8: Seed Calibration

**Setup:** from-paste mode, 3 iterations

**Expected behavior:**
1. Iteration 0: Judge scores seed — these become calibration baseline
2. Iteration 1+: Judge receives seed artifact + seed scores as reference
3. Judge can score below, equal to, or above seed scores
4. Judge does NOT receive intermediate iteration scores

**Success criteria:**
- ✅ Seed scores established at iteration 0
- ✅ Subsequent judges receive seed + seed scores
- ✅ No intermediate scores leaked to judge
- ✅ Scores are not monotonically inflating (calibration is grounding them)

**Red flags:**
- ❌ Judge never scores below seed on any criterion (treating seed as floor)
- ❌ Judge receives iteration 1 scores when judging iteration 2

---

## Test 9: ASI Quality - Single Most Important Fix

**Setup:** Any artifact, any iteration

**Expected behavior:**
- Judge produces ONE specific, concrete, actionable fix
- Not a list, not vague guidance
- Generator addresses that specific fix in next iteration

**Success criteria:**
- ✅ ASI is a single fix (not multiple)
- ✅ ASI is specific ("the second paragraph assumes X" not "improve clarity")
- ✅ Generator's next output visibly addresses the ASI
- ✅ Generator does not try to fix everything else too

**Red flags:**
- ❌ ASI is multi-paragraph
- ❌ ASI is vague ("make it better")
- ❌ Generator ignores ASI and rewrites from scratch

---

## Test 10: ASI for Sparse Seeds

**Setup:** Seed is a single sentence (e.g., "POST /users — Creates a user.")

**Expected behavior:**
- Judge names the single most foundational missing element
- Not "everything is missing" but "add request/response schemas first"

**Success criteria:**
- ✅ ASI identifies one foundational element
- ✅ Generator builds on that foundation
- ✅ Not a laundry list of everything wrong

---

## Test 11: Context Discipline - Generator Isolation

**Setup:** Multi-agent dispatch mode, iteration 2+

**Expected behavior:**
- Generator subagent receives: current candidate, criteria, ASI
- Generator does NOT receive: score history, previous candidates, trajectory

**Success criteria:**
- ✅ Generator prompt contains only candidate + criteria + ASI
- ✅ No scores in generator prompt
- ✅ No previous candidates in generator prompt

---

## Test 12: Context Discipline - Judge Isolation

**Setup:** Multi-agent dispatch mode, iteration 2+

**Expected behavior:**
- Judge subagent receives: current candidate, criteria, iteration number, seed + seed scores
- Judge does NOT receive: intermediate scores, intermediate candidates, ASI

**Success criteria:**
- ✅ Judge prompt contains candidate + criteria + seed calibration
- ✅ No intermediate scores in judge prompt
- ✅ No ASI in judge prompt

---

## Test 13: Trajectory Format

**Setup:** Any complete simmer run

**Expected behavior:**
- `{OUTPUT_DIR}/trajectory.md` contains standardized table
- Columns: Iteration, [criterion names], Composite, Key Change
- Below table: `Best candidate: iteration [N] (composite: [N.N]/10)`
- Key Change entries under 60 characters

**Success criteria:**
- ✅ Exact column format (no extra columns)
- ✅ "Best candidate" line below table
- ✅ No "Best?" column
- ✅ Key Change is concise (<60 chars)
- ✅ Iteration 0 Key Change is "seed"

---

## Test 14: Best-So-Far Tracking

**Setup:** Run where iteration 3 might score lower than iteration 2

**Expected behavior:**
- Reflect tracks best composite across all iterations
- Best candidate may not be the latest
- "Best candidate" line in trajectory reflects actual best

**Success criteria:**
- ✅ Best-so-far compared on every iteration
- ✅ Best candidate line updates only when beaten
- ✅ Final result.md contains the best candidate (not necessarily the last)

---

## Test 15: Regression Handling

**Setup:** Force a scenario where quality drops (e.g., sparse seed where ASI causes overexpansion)

**Expected behavior:**
1. Reflect detects regression (composite lower than best-so-far)
2. Notes regression in trajectory Key Change
3. Next generator receives the BEST candidate, not the regressed one
4. Generator prompt notes: "Starting from the best version (iteration N)"

**Success criteria:**
- ✅ Regression detected by reflect
- ✅ Next generator starts from best, not latest
- ✅ Regression noted in trajectory
- ✅ Loop continues (regression doesn't stop the loop)

---

## Test 16: Output Files

**Setup:** Complete 3-iteration run

**Expected behavior:**
Files created:
- `{OUTPUT_DIR}/iteration-0-candidate.md` (seed)
- `{OUTPUT_DIR}/iteration-1-candidate.md`
- `{OUTPUT_DIR}/iteration-2-candidate.md`
- `{OUTPUT_DIR}/iteration-3-candidate.md`
- `{OUTPUT_DIR}/trajectory.md`
- `{OUTPUT_DIR}/result.md` (copy of best candidate)

**Success criteria:**
- ✅ All iteration files present
- ✅ trajectory.md has complete table
- ✅ result.md matches best-scoring candidate
- ✅ OUTPUT_DIR is parameterized (not hardcoded to docs/simmer)

---

## Test 17: Continuation - "Run 3 More"

**Setup:** 3-iteration run complete, user says "yes, run 3 more"

**Expected behavior:**
1. Best candidate carried forward as new seed
2. Iteration counter resets (new iterations 4, 5, 6)
3. Trajectory table continues (appends, doesn't restart)
4. New candidates written to iteration-4, 5, 6 files

**Success criteria:**
- ✅ Best candidate (not last) used as starting point
- ✅ Trajectory is continuous
- ✅ New iterations numbered sequentially
- ✅ Offer again at end of 3 more

---

## Test 18: Artifact Growth - Tightly Scoped

**Setup:** Seed is a tweet or tagline (very short, format-constrained)

**Expected behavior:**
- Generator respects the artifact's natural scope
- Improvements stay within format constraints
- Does not expand a tweet into a paragraph

**Success criteria:**
- ✅ Output stays within format (e.g., 280 chars for tweet)
- ✅ Improvements are within-constraint refinements
- ✅ Not expanded into a different format

---

## Test 19: Non-Trigger - Code Implementation Request

**User input:** "Build a REST API for user management"

**Expected behavior:**
- Simmer does NOT trigger
- This is a build/create request → omakase-off or cookoff territory

**Success criteria:**
- ✅ Build request not confused for refinement
- ✅ No simmer setup initiated

---

## Test 20: Non-Trigger - Bug Fix

**User input:** "Fix the failing tests"

**Expected behavior:**
- Simmer does NOT trigger
- Agent fixes tests directly

**Success criteria:**
- ✅ Bug fix, not iterative refinement
- ✅ No criteria elicitation

---

## Test 21: Non-Trigger - Research Question

**User input:** "How does the auth middleware work?"

**Expected behavior:**
- Simmer does NOT trigger
- Agent explores and explains

**Success criteria:**
- ✅ Research question, not refinement
- ✅ No simmer setup

---

## Pressure Scenarios (Discipline Testing)

### Pressure 1: "Just Make It Better"

**User input:** "Just make this better, don't ask me questions"

**Expected behavior:**
- Still needs to establish criteria (even minimal ones)
- Can use seed criteria without asking for modification
- Should NOT skip criteria entirely and just rewrite

**Baseline check:** Does agent just rewrite without criteria or scoring?

### Pressure 2: "Skip the Scoring, Just Improve It"

**User input:** "Skip the judging, just generate better versions"

**Expected behavior:**
- Explains that scoring + ASI is what makes each iteration focused
- Without ASI, generator would make scattered edits
- Proceeds with full loop

**Success criteria:**
- ✅ Explains value of judge + ASI
- ✅ Does NOT skip judging

### Pressure 3: "Use 10 Criteria"

**User input:** [provides 10 criteria]

**Expected behavior:**
- Asks user to pick the 3 most important
- Explains more than 3 dilutes judge signal
- Does NOT proceed with 10

**Success criteria:**
- ✅ Caps at 3 criteria
- ✅ Explains why
- ✅ User picks their top 3

### Pressure 4: "Fix Everything Each Round"

**User input:** "Don't just fix one thing — address all the judge's feedback"

**Expected behavior:**
- Explains focused improvement compounds better than scattered edits
- ASI is single fix by design
- Each criterion still gets a specific improvement suggestion, but generator targets the ASI

**Success criteria:**
- ✅ Maintains single-ASI discipline
- ✅ Explains the rationale

---

## Single-Agent Mode Tests

### SA Test 1: Per-Iteration Checklist

**Setup:** Single-agent mode (no subagent dispatch available)

**Expected behavior:**
- Agent follows 3-step checklist per iteration: GENERATOR → JUDGE → REFLECT
- Reviews subskill constraints before each role-switch
- Updates trajectory.md after each iteration (no "output to orchestrator" block)

**Success criteria:**
- ✅ Clear role separation per step
- ✅ Trajectory updated incrementally
- ✅ No ceremonial "return to orchestrator" output

### SA Test 2: Anchoring Mitigation

**Setup:** Single-agent mode, iteration 3

**Expected behavior:**
- Agent writes judge scores BEFORE reading previous trajectory
- Scores against criterion descriptions + seed reference
- Does not reference "last time I scored this a 6"

**Success criteria:**
- ✅ Scores written before trajectory consulted
- ✅ No explicit anchoring to previous scores
- ✅ Seed calibration used as primary reference

---

## Manual Testing Instructions

1. **Install plugin:**
   ```bash
   /plugin install test-kitchen@2389-research
   ```

2. **Setup for testing:**
   - Prepare 2-3 seed artifacts of different types (email, spec, creative writing)
   - Have criteria ready for shortcut tests
   - Have a scratch output directory

3. **For each test:**
   - Provide "User input" exactly as written
   - Observe behavior
   - Check against "Success criteria"
   - Document failures and rationalizations

4. **Baseline testing (RED phase):**
   - Temporarily disable skill
   - Run tests to establish what agents do WITHOUT skill
   - Document exact rationalizations used

5. **Iterate (REFACTOR phase):**
   - Fix skill issues
   - Re-test
   - Add counters for new rationalizations discovered

---

## Rationalization Table

| Excuse | Reality |
|--------|---------|
| "I can improve this in one pass" | One-shot rewrites miss targeted improvement — ASI compounds |
| "Criteria are obvious, no need to ask" | Different users want different things — criteria make it explicit |
| "Scoring is overhead, just generate" | Without ASI, generator makes scattered edits instead of focused fixes |
| "3 criteria is too few, I need 5" | More criteria dilutes judge signal — 3 keeps iterations focused |
| "The seed is so bad, just rewrite it" | Even bad seeds benefit from structured iteration — rewriting loses the loop's compounding |
| "I already know the scores will improve" | Anchoring bias — score fresh each round against criteria + seed |
| "Tracking trajectory is bookkeeping" | Trajectory catches regressions and identifies best-so-far |
| "Single-agent mode doesn't need role separation" | Role separation is what keeps the loop disciplined — even aspirationally |

---

## Subagent Prompt Template Verification

### Generator Prompt

When simmer dispatches the generator subagent, verify the prompt includes:

```
You are the generator in a simmer refinement loop.

Invoke the skill: test-kitchen:simmer:simmer-generator

ITERATION: [N]
CRITERIA:
[rubric from setup]

CURRENT CANDIDATE:
[full text of current best candidate]

JUDGE FEEDBACK (ASI from previous round):
[ASI text]

Write your improved candidate to: {OUTPUT_DIR}/iteration-[N]-candidate.md
```

**Success criteria:**
- ✅ No scores in prompt
- ✅ No previous candidates
- ✅ ASI from previous round included
- ✅ Correct output path

### Judge Prompt

When simmer dispatches the judge subagent, verify the prompt includes:

```
You are the judge in a simmer refinement loop.

Invoke the skill: test-kitchen:simmer:simmer-judge

ITERATION: [N]
CRITERIA:
[rubric from setup]

CANDIDATE:
[full text of candidate]

SEED CALIBRATION:
[full text of original seed]
SEED SCORES:
[iteration 0 scores]
```

**Success criteria:**
- ✅ No intermediate scores
- ✅ No intermediate candidates
- ✅ Seed calibration included (iteration 1+)
- ✅ No ASI in prompt

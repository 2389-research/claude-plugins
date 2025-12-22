# Cookoff Integration Test Scenarios

## Purpose

These scenarios test that cookoff correctly:
1. **Triggers at design→implementation transition** (exit gate)
2. **Presents implementation choices** (cookoff, single agent, local)
3. **Each agent creates their OWN plan** (not shared)
4. **Dispatches ALL agents in single message** (parallel)
5. **Does NOT trigger** inappropriately

## Baseline Behavior (Without Skill)

Before testing WITH the skill, establish what agents do WITHOUT it:

**Expected baseline failures:**
- Agent jumps straight to implementation without offering choice
- Agent shares a single implementation plan with all agents
- Agent dispatches agents in separate messages (serial)
- Agent doesn't recognize "let's implement" as trigger moment

Document verbatim rationalizations agents use when they skip the skill.

---

## Test 1: Exit Gate Trigger - "Let's Implement"

**Setup:** Design phase complete, design.md exists

**User input:** "Let's implement this"

**Expected behavior:**
1. `cookoff` triggers at design→implementation transition
2. Presents choice:
   ```
   How would you like to implement this design?

   1. Cookoff (recommended) - N parallel agents, each creates own plan, pick best
      → Complexity: [assessed from design]
   2. Single subagent - One agent plans and implements
   3. Local - Plan and implement here
   ```
3. Waits for user selection

**Success criteria:**
- ✅ Skill triggers on "let's implement"
- ✅ Complexity assessment shown
- ✅ All 3 options presented
- ✅ No implementation starts until user chooses

**Baseline check:** Does agent just start implementing without offering choice?

---

## Test 2: Exit Gate Trigger - "Looks Good, Let's Build"

**Setup:** User just approved a design

**User input:** "Looks good, let's build it"

**Expected behavior:** Same as Test 1 - choice presented

**Success criteria:**
- ✅ "looks good" + "build" triggers cookoff
- ✅ Choice presented before any coding

---

## Test 3: Exit Gate Trigger - "Ready to Code"

**User input:** "Ready to code"

**Expected behavior:** Same as Test 1 - choice presented

**Success criteria:**
- ✅ "ready to code" triggers cookoff
- ✅ Choice presented

---

## Test 4: Exit Gate Trigger - Design Doc Committed

**Setup:** Agent just committed design.md

**Expected behavior:**
1. After commit, recognizes design phase complete
2. Proactively offers implementation options

**Success criteria:**
- ✅ Design commit triggers implementation transition
- ✅ Choice presented after commit

---

## Test 5: Exit Gate Trigger - After Omakase-off Hands Off

**Setup:** omakase-off completed brainstorming with no slots (user was decisive)

**Expected behavior:**
1. omakase-off hands off to cookoff
2. cookoff presents implementation choice

**Success criteria:**
- ✅ Smooth handoff from omakase-off
- ✅ cookoff choice presented
- ✅ No gap or confusion

---

## Test 6: Cookoff Path - User Chooses Option 1

**User input after choice:** "1" (cookoff)

**Expected behavior:**
1. Assesses complexity from design
2. Creates directories: `docs/plans/<feature>/cookoff/impl-{1,2,3}/`
3. Sets up worktrees for each implementation
4. Dispatches ALL agents in SINGLE message
5. Each agent:
   - Reads design.md
   - Creates their OWN implementation plan
   - Implements their plan
6. Fresh-eyes review on completions
7. Presents comparison with metrics

**Success criteria:**
- ✅ Complexity assessment determines agent count (2-5)
- ✅ Directories created correctly
- ✅ Worktrees set up for each impl
- ✅ ALL Task tools in single message
- ✅ Each agent writes own plan (not shared)
- ✅ Fresh-eyes on survivors
- ✅ Comparison includes: tests, fresh-eyes, lines, plan approach

**Red flags:**
- ❌ Agents dispatched in separate messages
- ❌ Single plan shared across agents
- ❌ Skipping fresh-eyes review

---

## Test 7: Single Agent Path - User Chooses Option 2

**User input after choice:** "2" (single subagent)

**Expected behavior:**
1. Single agent uses writing-plans then executing-plans
2. cookoff exits (job done)

**Success criteria:**
- ✅ Single agent dispatched
- ✅ Uses proper planning skills
- ✅ cookoff doesn't interfere further

---

## Test 8: Local Path - User Chooses Option 3

**User input after choice:** "3" (local)

**Expected behavior:**
1. User implements manually in current session
2. cookoff exits (job done)

**Success criteria:**
- ✅ No agents dispatched
- ✅ User proceeds with local implementation

---

## Test 9: Complexity Assessment - Low Complexity

**Setup:** Design describes small feature (single component, no auth, no external integrations)

**Expected behavior:**
- Assessment: "Low complexity"
- Recommends 2 implementations

**Success criteria:**
- ✅ Correctly assesses as low complexity
- ✅ Recommends appropriate count (2)

---

## Test 10: Complexity Assessment - High Complexity

**Setup:** Design describes large feature (multiple components, auth integration, database migrations, external API)

**Expected behavior:**
- Assessment: "High complexity"
- Recommends 4-5 implementations

**Success criteria:**
- ✅ Correctly assesses as high complexity
- ✅ Recommends higher count (4-5)

---

## Test 11: Plan Independence Verification

**Setup:** Cookoff with 3 agents

**Expected behavior:**
- Each agent creates DIFFERENT implementation plan
- Plans saved to separate directories:
  - `docs/plans/<feature>/cookoff/impl-1/plan.md`
  - `docs/plans/<feature>/cookoff/impl-2/plan.md`
  - `docs/plans/<feature>/cookoff/impl-3/plan.md`

**Success criteria:**
- ✅ 3 separate plan files exist
- ✅ Plans are meaningfully different
- ✅ No copy-paste between plans

**Why this matters:** Shared plans defeat the purpose - we want genuine variation

---

## Test 12: Parallel Dispatch Verification

**Setup:** Cookoff with 3 implementations

**Expected behavior:**
- ALL 3 Task tools dispatched in SINGLE message
- NOT 3 separate messages

**Success criteria:**
- ✅ Single message contains multiple Task tool calls
- ✅ All implementations start simultaneously

**Why this matters:** Serial dispatch = 3x longer, defeats parallelism

---

## Test 13: Implementation Diff Check

**Setup:** All 3 agents complete

**Expected behavior:**
1. Before fresh-eyes, diff implementations
2. If >95% identical, flag in results
3. Still proceed but note lack of variation

**Success criteria:**
- ✅ Implementations are diffed
- ✅ High similarity flagged if detected
- ✅ Process continues regardless

---

## Test 14: Fresh-Eyes on All Survivors

**Setup:** 3 implementations complete, all tests pass

**Expected behavior:**
1. Fresh-eyes review on ALL 3 (not just some)
2. Results used in comparison

**Success criteria:**
- ✅ All survivors get fresh-eyes
- ✅ Fresh-eyes findings shown in comparison table

---

## Test 15: Winner Selection and Cleanup

**Setup:** User picks impl-2 as winner

**Expected behavior:**
1. Final verification on winner
2. Loser worktrees removed
3. Loser branches deleted
4. Winner branch ready for finish-branch
5. result.md written

**Success criteria:**
- ✅ Winner verified before declaring
- ✅ Losers cleaned up (worktrees + branches)
- ✅ Winner preserved
- ✅ result.md documents comparison

---

## Test 16: Non-Trigger - Still in Design Phase

**User input:** "What if we used Redis instead?"

**Expected behavior:**
- cookoff does NOT trigger
- Discussion continues in design phase

**Success criteria:**
- ✅ Design discussion continues
- ✅ No implementation choice presented

---

## Test 17: Non-Trigger - Research Question

**User input:** "How does caching work in this codebase?"

**Expected behavior:**
- cookoff does NOT trigger
- Agent explores and explains

**Success criteria:**
- ✅ Research, not implementation transition
- ✅ No choice presented

---

## Test 18: Non-Trigger - Bug Fix

**User input:** "Fix the tests that are failing"

**Expected behavior:**
- cookoff does NOT trigger
- Agent fixes tests directly

**Success criteria:**
- ✅ Bug fix, not new implementation
- ✅ No choice presented

---

## Test 19: Handoff from Any Brainstorming Source

**Setup:** Design completed via different methods:
- Via superpowers:brainstorming
- Via omakase-off brainstorm path
- Via manual discussion (no skill)

**Expected behavior:**
- cookoff triggers regardless of HOW design was created
- Same choice presented

**Success criteria:**
- ✅ Triggers on design→implementation regardless of source
- ✅ Not dependent on specific brainstorming skill

**Why this matters:** cookoff triggers on a SITUATION, not a specific skill's output

---

## Pressure Scenarios (Discipline Testing)

### Pressure 1: Time Pressure

**User input:** "We need to ship today. Just implement it quickly."

**Expected behavior:**
- Still presents cookoff choice
- Time pressure doesn't bypass exit gate
- Could note cookoff may actually be faster (parallel exploration)

**Baseline check:** Does agent skip choice and implement directly?

### Pressure 2: "Just Use the Same Plan"

**User input:** "Have all agents use the same implementation plan to save time"

**Expected behavior:**
- Explains why each agent should create own plan
- Genuine variation requires independent planning
- Proceeds with independent plans

**Success criteria:**
- ✅ Explains the value of independent plans
- ✅ Does NOT share a single plan

### Pressure 3: "Just Send One Agent at a Time"

**User input:** "Send agents one at a time so I can monitor"

**Expected behavior:**
- Explains parallel dispatch is core to cookoff
- Offers alternative: user can monitor via progress updates
- Does NOT dispatch serially

**Success criteria:**
- ✅ Maintains parallel dispatch
- ✅ Offers monitoring alternatives

### Pressure 4: Skip Fresh-Eyes

**User input:** "Skip the review, just pick the fastest one"

**Expected behavior:**
- Explains fresh-eyes is quality signal for comparison
- Speed alone is weak tiebreaker
- Proceeds with fresh-eyes

**Success criteria:**
- ✅ Fresh-eyes still runs
- ✅ Speed used as input but not sole criteria

---

## Manual Testing Instructions

1. **Install plugin:**
   ```bash
   /plugin install test-kitchen@2389-research
   ```

2. **Setup for testing:**
   - Create a simple design.md in a test project
   - Or complete brainstorming to generate one

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
| "User wants to move fast, skip the choice" | Choice takes 5 seconds, wrong path wastes hours |
| "Sharing one plan is more efficient" | Shared plans = no variation = wasted compute |
| "Serial dispatch is easier to monitor" | Parallel is the whole point - offer status updates instead |
| "Fresh-eyes is overkill for simple features" | Quality signal matters for comparison |
| "Implementations will be similar anyway" | Independent planning creates meaningful variation |
| "Design is clear, no need for multiple approaches" | Cookoff tests execution quality, not design options |

---

## Subagent Prompt Template Verification

When cookoff dispatches agents, verify the prompt includes:

```
You are implementation team N of M in a cookoff competition.
Other teams are implementing the same design in parallel.
Each team creates their own implementation plan - your approach may differ from others.

**Your working directory:** /path/to/.worktrees/cookoff-impl-N
**Design doc:** docs/plans/<feature>/design.md
**Your plan location:** docs/plans/<feature>/cookoff/impl-N/plan.md

**Your workflow:**
1. Read the design doc thoroughly
2. Use writing-plans skill to create YOUR implementation plan
3. Use executing-plans skill to implement your plan
4. Follow TDD for each task
5. Use verification before claiming done
```

**Success criteria:**
- ✅ Prompt emphasizes independent planning
- ✅ Correct paths provided
- ✅ Uses writing-plans then executing-plans
- ✅ TDD and verification required

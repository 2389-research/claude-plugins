# Omakase-Off Integration Test Scenarios

## Purpose

These scenarios test that omakase-off correctly:
1. **Triggers FIRST** on build/create/implement requests (entry gate)
2. **Presents the choice** between brainstorming and omakase mode
3. **Detects indecision** during brainstorming and offers parallel exploration
4. **Does NOT trigger** inappropriately

## Baseline Behavior (Without Skill)

Before testing WITH the skill, establish what agents do WITHOUT it:

**Expected baseline failures:**
- Agent jumps straight into brainstorming without offering omakase option
- Agent ignores "not sure" signals and picks for user without offering parallel exploration
- Agent doesn't recognize build/create as trigger moments

Document verbatim rationalizations agents use when they skip the skill.

---

## Test 1: Entry Gate Trigger - Build Request

**Scenario:** User makes a build request

**User input:** "Build a notification system for my app"

**Expected behavior:**
1. `omakase-off` triggers FIRST (before any brainstorming)
2. Presents choice:
   ```
   How would you like to explore this?
   1. Brainstorm together - We'll work through the design step by step
   2. Omakase - I'll generate 3-5 best approaches, implement in parallel, tests pick winner
   ```
3. Waits for user selection before proceeding

**Success criteria:**
- ✅ Skill triggers immediately on "build"
- ✅ Choice presented BEFORE any questions about the feature
- ✅ Both options clearly explained
- ✅ No brainstorming starts until user chooses

**Baseline check:** Does agent jump straight to "What kind of notifications?" without offering choice?

---

## Test 2: Entry Gate Trigger - Create Request

**User input:** "Create a user authentication system"

**Expected behavior:** Same as Test 1 - choice presented first

**Success criteria:**
- ✅ "Create" triggers omakase-off
- ✅ Choice presented before diving into auth details

---

## Test 3: Entry Gate Trigger - Implement Request

**User input:** "Implement a caching layer for the API"

**Expected behavior:** Same as Test 1 - choice presented first

**Success criteria:**
- ✅ "Implement" triggers omakase-off
- ✅ Choice presented before discussing caching strategies

---

## Test 4: Entry Gate Trigger - Add Feature Request

**User input:** "Add a dark mode toggle to the settings page"

**Expected behavior:** Same as Test 1 - choice presented first

**Success criteria:**
- ✅ "Add" + feature context triggers omakase-off
- ✅ Choice presented before discussing implementation

---

## Test 5: Brainstorm Path - User Chooses Option 1

**User input:** "Build a CLI todo app"

**Claude presents choice, user responds:** "1" (brainstorm together)

**Expected behavior:**
1. If `superpowers:brainstorming` installed → delegates to it
2. If NOT installed → runs fallback brainstorming (ask questions, propose options)
3. Passively tracks architectural decisions where user shows uncertainty

**Success criteria:**
- ✅ Delegates to brainstorming skill if available
- ✅ Falls back to manual brainstorming if not
- ✅ Tracks "slots" (uncertain decisions) during process

---

## Test 6: Omakase Path - User Chooses Option 2

**User input:** "Build a real-time chat feature"

**Claude presents choice, user responds:** "2" (omakase)

**Expected behavior:**
1. Quick context gathering (1-2 essential questions MAX)
2. Generates 3-5 distinct architectural approaches
3. Creates implementation plans for EACH approach
4. Sets up git worktrees
5. Dispatches ALL agents in SINGLE message
6. Runs scenario tests on implementations
7. Presents comparison, user picks winner

**Success criteria:**
- ✅ Only 1-2 context questions (not full brainstorm)
- ✅ 3-5 meaningfully different approaches generated
- ✅ Worktrees created for each variant
- ✅ ALL Task tools dispatched in single message (parallel)
- ✅ Same scenario tests run against all variants
- ✅ Fresh-eyes review on survivors
- ✅ Comparison presented with metrics

**Red flags:**
- ❌ More than 2 context questions (becoming a brainstorm)
- ❌ Agents dispatched in separate messages (serial not parallel)
- ❌ Skipping scenario testing

---

## Test 7: Indecision Detection - During Brainstorming

**Setup:** User chose "brainstorm together" (option 1)

**Conversation flow:**
```
Claude: What storage approach would you prefer?
User: "not sure, either could work"

Claude: For authentication?
User: "no preference, you pick"
```

**Expected behavior:**
1. Claude marks "storage" as architectural slot
2. Claude marks "auth" as architectural slot
3. After 2+ uncertain responses, Claude offers:
   ```
   You seem flexible on the approach. Would you like to:
   1. I'll pick what seems best and continue
   2. Explore multiple approaches in parallel (omakase-off)
      → I'll implement 2-3 variants and let tests decide
   ```

**Success criteria:**
- ✅ Detects "not sure", "no preference" as indecision signals
- ✅ Classifies decisions as architectural vs trivial
- ✅ Offers parallel exploration after 2+ uncertain responses
- ✅ Only architectural slots become variants (not trivial choices)

**Baseline check:** Does agent just pick for user without offering parallel exploration?

---

## Test 8: Indecision Detection - Explicit Request

**User input during brainstorming:** "try both approaches"

**Expected behavior:**
1. Immediately offers to explore both in parallel
2. Does NOT continue asking more brainstorming questions

**Success criteria:**
- ✅ "try both" triggers immediate omakase offer
- ✅ Stops brainstorming flow

---

## Test 9: End of Brainstorm - Slots Collected

**Setup:** Brainstorming completed with architectural slots detected

**Expected behavior:**
```
I noticed some open decisions during our brainstorm:
- Storage: JSON vs SQLite
- Auth: JWT vs session-based

Would you like to:
1. Explore in parallel - I'll implement both variants and let tests decide
2. Best guess - I'll pick what seems best and proceed with one plan
```

**Success criteria:**
- ✅ Lists detected architectural slots
- ✅ Offers parallel exploration OR single path
- ✅ If user picks "best guess" → hands off to cookoff

---

## Test 10: End of Brainstorm - No Slots (User Was Decisive)

**Setup:** Brainstorming completed, user made clear choices throughout

**Expected behavior:**
```
Design complete. How would you like to implement?

1. Cookoff (recommended) - N parallel agents, each creates own plan, pick best
2. Single subagent - One agent plans and implements
3. Local - Implement here in this session
```

**Success criteria:**
- ✅ Hands off to cookoff for implementation choice
- ✅ Does NOT offer omakase exploration (no slots to explore)

---

## Test 11: Non-Trigger - Simple Question

**User input:** "What's the best way to handle errors in JavaScript?"

**Expected behavior:**
- Omakase-off does NOT trigger
- Agent answers the question directly

**Success criteria:**
- ✅ No implementation request detected
- ✅ No choice presented
- ✅ Direct answer given

---

## Test 12: Non-Trigger - Research Request

**User input:** "How does the authentication work in this codebase?"

**Expected behavior:**
- Omakase-off does NOT trigger
- Agent explores codebase and explains

**Success criteria:**
- ✅ Research/exploration, not implementation
- ✅ No choice presented

---

## Test 13: Non-Trigger - Bug Fix

**User input:** "Fix the null pointer error in user.ts"

**Expected behavior:**
- Omakase-off does NOT trigger (this is debugging, not building)
- Agent investigates and fixes the bug

**Success criteria:**
- ✅ Bug fix, not new feature
- ✅ No choice presented
- ✅ Goes to debugging workflow instead

---

## Test 14: Combination Overflow

**Setup:** User chose omakase, context reveals 3 slots with 3 options each = 27 combinations

**Expected behavior:**
1. Recognizes 27 > 5-6 cap
2. Presents combinations to user
3. Asks user to select top 5-6 OR suggests pruning incompatible combinations

**Success criteria:**
- ✅ Does NOT try to implement all 27
- ✅ Caps at 5-6 variants
- ✅ Consults user on which to prioritize

---

## Test 15: Parallel Dispatch Verification

**Setup:** Omakase mode with 3 variants

**Expected behavior:**
- ALL 3 Task tools dispatched in SINGLE message
- NOT 3 separate messages

**Success criteria:**
- ✅ Check that single message contains multiple Task tool calls
- ✅ All variants start simultaneously

**Why this matters:** Serial dispatch defeats the purpose of parallel exploration

---

## Pressure Scenarios (Discipline Testing)

### Pressure 1: Time Pressure + Uncertainty

**User input:** "I need to ship a feature by end of day. Build a payment integration - not sure if Stripe or PayPal."

**Expected behavior:**
- Still presents omakase choice (doesn't skip due to time pressure)
- Time pressure doesn't bypass the entry gate

**Baseline check:** Does agent skip the choice and just pick Stripe to "save time"?

### Pressure 2: Sunk Cost + User Impatience

**Setup:** Brainstorming has been going for 10+ exchanges

**User shows impatience:** "Can we just pick something and move on?"

**Expected behavior:**
- If slots were collected → offers parallel exploration as way to resolve faster
- Does NOT abandon the process

**Baseline check:** Does agent drop all slots and just pick arbitrarily?

### Pressure 3: Authority Override Attempt

**User input:** "Just implement the SQLite version, don't ask questions"

**Expected behavior:**
- Respects user's explicit choice
- Does NOT force omakase-off when user has made clear decision

**Success criteria:**
- ✅ User override is respected
- ✅ Proceeds with single implementation

---

## Manual Testing Instructions

1. **Install plugin:**
   ```bash
   /plugin install test-kitchen@2389-research
   ```

2. **For each test:**
   - Start new Claude Code session
   - Provide "User input" exactly as written
   - Observe behavior
   - Check against "Success criteria"
   - Document failures and rationalizations

3. **Baseline testing (RED phase):**
   - Temporarily disable skill
   - Run tests to establish what agents do WITHOUT skill
   - Document exact rationalizations used

4. **Iterate (REFACTOR phase):**
   - Fix skill issues
   - Re-test
   - Add counters for new rationalizations discovered

---

## Rationalization Table

| Excuse | Reality |
|--------|---------|
| "User seems to know what they want" | Entry gate still applies - user might want omakase |
| "Too simple for parallel exploration" | Simple is subjective - let user decide |
| "Time pressure means skip the choice" | Parallel exploration can be FASTER than wrong single choice |
| "User said 'not sure' but probably meant..." | Don't assume - offer the choice |
| "Brainstorming was thorough, no need for omakase" | Slots collected = offer exploration |

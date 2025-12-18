# Omakase-off Test Scenario

## Test 1: Recognition

**Prompt:**
```
User: "I want to add user authentication to my app. I'm torn between JWT tokens and session-based auth - both have tradeoffs and I'd love to see how each would work in practice before committing."

What approach would you take?
```

**Expected behavior (with skill):**
- Recognizes this as an omakase-off scenario
- Announces using test-kitchen:omakase-off skill
- Explains will explore both approaches in parallel

**Baseline behavior (without skill):**
- Likely picks one approach and proceeds
- Or asks user to choose
- Does NOT suggest parallel implementation

---

## Test 2: Workflow Comprehension

**Prompt:**
```
You have access to the test-kitchen:omakase-off skill. A user says:

"Build a notification system. Could be WebSockets or polling - not sure which is better for our use case. Also uncertain about storing notification state in Redis vs PostgreSQL."

Walk me through exactly what you would do, step by step, citing which skills you'd use at each phase.
```

**Expected behavior:**
1. Phase 1: Identifies 2 slots (transport: WS/polling, storage: Redis/PG) = 4 combinations
2. Phase 2: Generates 4 implementation plans, stores in docs/plans/notifications-YYYYMMDD/
3. Phase 3: Creates 4 worktrees, dispatches 4 subagents using executing-plans
4. Phase 4: Runs scenario-testing on survivors
5. Phase 5: Presents winner, uses finishing-a-development-branch

**Red flags:**
- Skips slot collection phase
- Doesn't mention worktrees
- Doesn't mention subagents using executing-plans skill
- Forgets scenario testing
- Doesn't mention cleanup of losers

---

## Test 3: Combination Overflow

**Prompt:**
```
User wants to implement a data pipeline with these uncertainties:
- Storage: SQLite, PostgreSQL, or MongoDB (3 options)
- Queue: Redis, RabbitMQ, or Kafka (3 options)
- Processing: Sync, async, or batch (3 options)

That's 27 combinations. How do you handle this with test-kitchen:omakase-off?
```

**Expected behavior:**
- Recognizes 27 > 5-6 cap
- Presents combinations to user
- Asks user to select top 5-6 to implement
- OR suggests pruning incompatible combinations first

**Red flags:**
- Tries to implement all 27
- Arbitrarily picks without consulting user
- Doesn't mention the cap

---

## Test 4: Failure Handling

**Prompt:**
```
During test-kitchen:omakase-off development:
- Variant A: Tests passing, scenarios passing
- Variant B: Tests passing, scenarios passing
- Variant C: Failed at task 3 (type error)
- Variant D: Tests passing, but scenario 2 failed

What happens next?
```

**Expected behavior:**
- C and D are eliminated
- A and B are survivors
- Since multiple survivors and no judge yet: present both to user
- User picks winner
- Winner gets finishing-a-development-branch
- Losers (B, C, D) get cleanup

**Red flags:**
- Doesn't eliminate C and D
- Auto-picks between A and B without user input
- Forgets to cleanup loser worktrees

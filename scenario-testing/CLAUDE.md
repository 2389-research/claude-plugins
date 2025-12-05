# Scenario Testing Plugin

## Overview

This plugin enforces end-to-end testing with real dependencies instead of mocks. It validates that features actually work by exercising real systems with real data.

## Skill Included

### scenario-testing

**Trigger keywords**: test, mock, validate, feature complete, integration test, end-to-end, e2e, testing

**When to use**:
- Writing tests for new features
- Validating that code actually works
- When tempted to use mocks
- Before declaring work complete
- After fixing bugs

**What it does**:
1. Enforces "NO FEATURE IS VALIDATED UNTIL A SCENARIO PASSES WITH REAL DEPENDENCIES"
2. Requires scenarios in `.scratch/` directory (gitignored)
3. Prohibits mocks - must use real dependencies (sandbox/test mode acceptable)
4. Ensures scenarios run independently (no ordering dependencies)
5. Extracts recurring patterns to `scenarios.jsonl` (committed)

**Definition of done**:
- Scenario in `.scratch/` passes with zero mocks
- Real dependencies exercised
- `.scratch/` remains gitignored
- Patterns extracted to `scenarios.jsonl`

## Core Principle

**The Iron Law**: "NO FEATURE IS VALIDATED UNTIL A SCENARIO PASSES WITH REAL DEPENDENCIES"

Mocks create false confidence. Only scenarios exercising real systems validate that code works.

## The Truth Hierarchy

1. **Scenario tests** (real system, real data) = **TRUTH**
2. **Unit tests** (isolated) = human comfort only
3. **Mocks** = lies hiding bugs

"A test that uses mocks is not testing your system. It's testing your assumptions about how dependencies behave."

## Required Practices

### 1. Write Scenarios in `.scratch/`

```python
# .scratch/test-feature.py - GITIGNORED
def test_user_can_register():
    # Hit real database
    user = register_user(email="test@example.com")

    # Hit real auth service (test mode)
    token = authenticate(user)

    # Verify against real storage
    assert load_user(user.id) is not None
```

### 2. Promote Patterns to `scenarios.jsonl`

```jsonl
{"name":"user-registration","description":"User can register and authenticate","given":"New user credentials","when":"User registers","then":"User exists in DB and can authenticate","validates":"Registration flow"}
```

### 3. Use Real Dependencies

External APIs must hit actual services:
- Real database (test instance)
- Real auth service (sandbox mode)
- Real file storage (test bucket)
- Real message queue (local instance)

Sandbox/test mode acceptable. Mocks invalidate the scenario.

### 4. Independence Requirement

Each scenario runs standalone:
- Setup own test data
- Don't depend on prior scenarios
- Clean up after execution
- Enable parallel execution

## Common Violations to Reject

- **"Just a quick unit test..."** → Unit tests don't validate features
- **"Too simple for end-to-end..."** → Integration breaks simple things
- **"I'll mock for speed..."** → Speed doesn't matter if tests lie
- **"I don't have API credentials..."** → Ask partner for real test credentials

## Development Workflow

This skill **prevents mock-based testing**:

1. User asks to write tests
2. Skill enforces scenario approach
3. Scenarios must use real dependencies
4. Scenarios live in `.scratch/` (gitignored)
5. Patterns extracted to `scenarios.jsonl` (committed)

## Auto-Detection

Skill triggers on:
- "write tests"
- "add test coverage"
- "I'll mock the database"
- "create integration test"
- "validate the feature"

## Common Usage

```
User: "Write tests for the authentication feature"
Assistant: [Triggers scenario-testing skill]

I'll write a scenario test with real dependencies.

Creating .scratch/test-auth.py:
- Hits real database (test instance)
- Hits real auth service (sandbox mode)
- No mocks
- Validates complete auth flow

Running scenario... ✓ Passes

Extracting pattern to scenarios.jsonl:
{"name":"authentication","description":"User can register, login, and access protected resources",...}

.scratch/ is gitignored ✓
scenarios.jsonl is committed ✓
```

## Integration with Other Plugins

Complements all development:
- **fresh-eyes-review**: Review scenarios before committing
- **firebase-development**: Test Firebase features with real Firestore/Auth
- **building-multiagent-systems**: Test multi-agent systems with real agents

## Philosophy

Real validation over false confidence.

- Unit tests verify isolated logic (useful!)
- Integration tests verify components work together (useful!)
- **Scenario tests verify the system actually works** (TRUTH!)

All three have value, but only scenarios prove features work.

## What Makes Scenarios Different

| Aspect | Unit Test | Integration Test | Scenario Test |
|--------|-----------|------------------|---------------|
| **Scope** | Single function | Multiple components | Complete feature |
| **Dependencies** | Mocked | Some real, some mocked | All real |
| **Speed** | Fast | Medium | Slower |
| **Truth** | Tests logic | Tests integration | Tests reality |
| **Committed** | Yes | Yes | No (.scratch only) |

Scenarios are the **last line of defense**. They prove the feature works in reality.

## Notes

- Originated from Harper Reed's personal dotfiles
- Battle-tested practice from production systems
- Explicitly rejects mocking
- `.scratch/` convention prevents test clutter in git
- `scenarios.jsonl` documents what should work

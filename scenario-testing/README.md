# Scenario Testing

End-to-end testing with real dependencies. No mocks allowed - scenarios with real data are the only source of truth.

## Installation

```bash
/plugin install scenario-testing@2389-research
```

## What This Plugin Provides

Enforces scenario-driven testing where features are validated by exercising real systems with real dependencies. Mocks create false confidence - only real scenarios prove code works.

### Core Principle

**"NO FEATURE IS VALIDATED UNTIL A SCENARIO PASSES WITH REAL DEPENDENCIES"**

## When to Use

- Writing tests for new features
- Validating that code actually works
- When tempted to use mocks
- Before declaring work complete
- After fixing bugs

## The Truth Hierarchy

1. **Scenario tests** (real system, real data) = **TRUTH**
2. **Unit tests** (isolated) = human comfort only
3. **Mocks** = lies hiding bugs

As the principle states: "A test that uses mocks is not testing your system. It's testing your assumptions about how dependencies behave."

## Quick Example

```python
# .scratch/test-user-registration.py - NOT COMMITTED, gitignored
# Uses real database, real auth service (test mode)

def test_user_registration_scenario():
    # No mocks - hit real services
    user = register_user(
        email="test@example.com",
        password="secure123"
    )

    # Verify against real database
    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.email_verified is False

    # Verify can authenticate with real auth service
    token = login(email="test@example.com", password="secure123")
    assert token is not None

    # Cleanup real data
    delete_user(user.id)

# After scenario passes, extract pattern to scenarios.jsonl (IS COMMITTED)
```

## Required Practices

### 1. Write Scenarios in `.scratch/`

- Use any language appropriate to the task
- Exercise the real system end-to-end
- **Zero mocks allowed**
- Must be in `.gitignore` (never commit)

### 2. Promote Patterns to `scenarios.jsonl`

- Extract recurring scenarios as documented specifications
- One JSON line per scenario
- Include: name, description, given/when/then, validates
- **This file IS committed**

### 3. Use Real Dependencies

External APIs must hit actual services (sandbox/test mode acceptable). Mocking any dependency invalidates the scenario.

### 4. Independence Requirement

Each scenario must run standalone without depending on prior executions. This enables:
- Parallel execution
- Prevents hidden ordering dependencies
- Reliable CI/CD integration

## What Makes a Scenario Invalid

A scenario is invalid if it:
- Contains any mocks whatsoever
- Uses fake data instead of real storage
- Depends on another scenario running first
- Was never actually executed to verify it passes

## Common Violations to Avoid

Reject these rationalizations:

- **"Just a quick unit test..."** - Unit tests don't validate features
- **"Too simple for end-to-end..."** - Integration breaks simple things
- **"I'll mock for speed..."** - Speed doesn't matter if tests lie
- **"I don't have API credentials..."** - Ask your human partner for real ones

## Definition of Done

A feature is complete only when:

1. ✅ A scenario in `.scratch/` passes with zero mocks
2. ✅ Real dependencies are exercised
3. ✅ `.scratch/` remains in `.gitignore`
4. ✅ Robust patterns extracted to `scenarios.jsonl`

## Example Workflow

1. **Write scenario** - Create `.scratch/test-user-registration.py`
2. **Use real dependencies** - Hit real database, real auth service (test mode)
3. **Run and verify** - Execute scenario, confirm it passes
4. **Extract pattern** - Document in `scenarios.jsonl`
5. **Keep .scratch ignored** - Never commit scratch scenarios

## Why This Matters

- **Unit tests** verify isolated logic
- **Integration tests** verify components work together
- **Scenario tests** verify the system actually works

Only scenario tests prove your feature delivers value to users.

## Documentation

See [skills/SKILL.md](skills/SKILL.md) for complete scenario testing protocol.

## Philosophy

Real validation over false confidence. Mocks test assumptions, not reality.

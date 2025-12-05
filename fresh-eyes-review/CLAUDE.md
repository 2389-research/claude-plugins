# Fresh-Eyes Review Plugin

## Overview

This plugin enforces a mandatory final quality gate before code ships. It catches security vulnerabilities, logic errors, and bugs that slip through despite passing tests.

## Skill Included

### fresh-eyes-review

**Trigger keywords**: commit, PR, done, complete, finished, ship, deploy, push

**When to use**:
- ALWAYS before git commit
- ALWAYS before creating pull request
- ALWAYS before declaring work complete
- After all tests pass but before shipping

**What it does**:
1. Announces "Starting fresh-eyes review of [N] files. This will take 2-5 minutes."
2. Systematically checks for:
   - Security vulnerabilities (SQL injection, XSS, path traversal, command injection)
   - Logic errors (off-by-one, race conditions, null handling)
   - Business rule bugs (calculations match requirements?)
   - Input validation (type, range, format checks complete?)
   - Performance issues (N+1 queries, unbounded loops)
3. Fixes issues immediately
4. Re-runs tests after corrections
5. Announces results: "Fresh-eyes complete. [N] issues found and fixed."

**Time commitment**: 2-5 minutes

## Core Principle

**"NO COMMIT WITHOUT FRESH-EYES REVIEW FIRST"**

This is non-negotiable. The discipline applies universally, even without explicit skill activation.

## Key Distinctions

- **Testing** - Validates expected behavior under controlled conditions
- **Code review** - Examines patterns and quality during implementation
- **Fresh-eyes** - Catches unexpected issues through deliberate re-reading with psychological distance

The skill emphasizes: "100% test coverage and passing scenarios" can coexist with "critical bugs" waiting discovery.

## Resistance Patterns to Reject

The skill explicitly lists rationalizations to ignore:

- "Tests are comprehensive"
- "I'm confident it's correct"
- "Partner is waiting"
- "Production is blocked"
- "Senior dev already approved"

**These circumstances represent precisely when critical bugs escape into production.**

## Development Workflow

This skill is a **mandatory guard** that triggers before shipping:

1. User completes implementation
2. All tests pass
3. **Fresh-eyes review runs** (this skill)
4. Issues found and fixed
5. Tests re-run and pass
6. Code ships

## Auto-Detection

Skill should trigger on:
- "I'm done" or "finished"
- "let me commit"
- "ready to push"
- "creating PR"
- "deploying to production"

## Common Usage

```
User: "I'm done implementing the feature, let me commit"
Assistant: [Triggers fresh-eyes-review skill]

Starting fresh-eyes review of 4 files. This will take 2-5 minutes.

[Reviews auth.ts for security]
- Found: Missing input validation on email field
- Fixed: Added email format validation

[Reviews handler.ts for logic]
- Found: Off-by-one error in pagination
- Fixed: Changed < to <= in boundary check

[Reviews db.ts for performance]
- No issues found

[Reviews api.ts for business rules]
- No issues found

Re-running tests... ✓ All tests pass

Fresh-eyes complete. 2 issues found and fixed.
```

## Integration with Other Plugins

Complements all development workflows:

- **scenario-testing**: Fresh-eyes runs after scenarios pass
- **building-multiagent-systems**: Review orchestrator code before shipping
- **firebase-development**: Review before deploying to Firebase

## Philosophy

Quality over speed. The 2-5 minutes spent here prevent hours of debugging production issues.

Passing tests prove code works as designed. Fresh-eyes proves the design is correct.

## Notes

- Originated from Harper Reed's personal dotfiles
- Battle-tested practice from production systems
- Non-negotiable discipline
- Explicitly rejects rationalization

# Fresh-Eyes Review

Mandatory final sanity check before git commit or PR creation. The last line of defense before code ships.

## Installation

```bash
/plugin install fresh-eyes-review@2389-research
```

## What This Plugin Provides

A disciplined review process that catches security vulnerabilities, logic errors, edge cases, and business logic bugs that slip through despite passing tests.

### Core Principle

**"NO COMMIT WITHOUT FRESH-EYES REVIEW FIRST"**

This final quality gate executes *after* implementation, *after* tests pass, but *before* shipping code.

## When to Use

- **ALWAYS** before git commit
- **ALWAYS** before creating pull request
- **ALWAYS** before declaring work complete
- After all tests pass but before shipping

## What It Catches

The skill systematically checks for:

- **Security vulnerabilities**: SQL injection, XSS, path traversal, command injection
- **Logic errors**: off-by-one boundaries, race conditions, null handling
- **Business rule bugs**: calculations not matching requirements
- **Input validation**: missing type, range, or format checks
- **Performance issues**: N+1 queries, unbounded loops

## Quick Example

```bash
# Before committing code:
# 1. Announce: "Starting fresh-eyes review of 3 files. This will take 2-5 minutes."
# 2. Review systematically for security, logic, business rules, validation, performance
# 3. Fix issues immediately and re-run tests
# 4. Announce: "Fresh-eyes complete. 2 issues found and fixed."
```

## The Process

**Step 1 - Announce Commitment**

Explicitly declare: "Starting fresh-eyes review of [N] files. This will take 2-5 minutes."

**Step 2 - Systematic Checklist**

Review all touched files for the five categories above.

**Step 3 - Fix Immediately**

Address findings before declaring completion. Re-run tests after corrections.

**Step 4 - Declare Results**

Mandatory announcement: "Fresh-eyes complete. [N] issues found and fixed."

## Time Commitment

Expected duration: **2-5 minutes** depending on file count.

- Faster completion suggests insufficient depth
- Excessive time indicates scope creep

## Why This Matters

The skill emphasizes that **"100% test coverage and passing scenarios" can coexist with "critical bugs"** waiting to be discovered.

### Key Distinctions

- **Testing** validates expected behavior under controlled conditions
- **Code review** examines patterns and quality during implementation
- **Fresh-eyes** catches unexpected issues through deliberate re-reading

## Resistance Patterns to Reject

Don't rationalize away the review with:

- "Tests are comprehensive"
- "I'm confident it's correct"
- "Partner is waiting"
- "Production is blocked"
- "Senior dev already approved"

**These circumstances represent precisely when critical bugs escape into production.**

## Documentation

See [skills/SKILL.md](skills/SKILL.md) for complete fresh-eyes review protocol.

## Philosophy

Quality over speed. The 2-5 minutes spent here prevent hours of debugging production issues.

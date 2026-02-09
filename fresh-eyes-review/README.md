# Fresh-eyes review

Mandatory sanity check before git commit or PR creation.

## Installation

```bash
/plugin install fresh-eyes-review@2389-research
```

## What this plugin does

A disciplined review process that catches security holes, logic errors, edge cases, and business logic bugs that slip through despite passing tests.

### Core principle

**"NO COMMIT WITHOUT FRESH-EYES REVIEW FIRST"**

This runs *after* implementation, *after* tests pass, but *before* code ships.

## When to use

- Before git commit
- Before creating a pull request
- Before declaring work complete
- After all tests pass but before shipping

## What it catches

The skill checks for:

- Security vulnerabilities -- SQL injection, XSS, path traversal, command injection
- Logic errors -- off-by-one boundaries, race conditions, null handling
- Business rule bugs -- calculations not matching requirements
- Input validation gaps -- missing type, range, or format checks
- Performance problems -- N+1 queries, unbounded loops

## Quick example

```bash
# Before committing code:
# 1. Announce: "Starting fresh-eyes review of 3 files. This will take 2-5 minutes."
# 2. Review systematically for security, logic, business rules, validation, performance
# 3. Fix issues immediately and re-run tests
# 4. Announce: "Fresh-eyes complete. 2 issues found and fixed."
```

## The process

**Step 1 -- Announce commitment**

Declare: "Starting fresh-eyes review of [N] files. This will take 2-5 minutes."

**Step 2 -- Systematic checklist**

Review all touched files for the five categories above.

**Step 3 -- Fix immediately**

Address findings before declaring completion. Re-run tests after corrections.

**Step 4 -- Declare results**

Announce: "Fresh-eyes complete. [N] issues found and fixed."

## Time commitment

Expected duration: **2-5 minutes** depending on file count.

- If you finish faster than that, you probably didn't look hard enough
- If it takes much longer, you're probably scope-creeping

## Why bother

**"100% test coverage and passing scenarios" can coexist with critical bugs** waiting to be discovered.

Testing, code review, and fresh-eyes review are different things. Testing validates expected behavior under controlled conditions. Code review examines patterns and quality during implementation. Fresh-eyes catches unexpected issues through deliberate re-reading -- you're looking at the code with psychological distance.

## Resistance patterns to reject

Don't rationalize away the review with:

- "Tests are comprehensive"
- "I'm confident it's correct"
- "Partner is waiting"
- "Production is blocked"
- "Senior dev already approved"

These are exactly the circumstances when critical bugs escape into production.

## Documentation

See [skills/SKILL.md](skills/SKILL.md) for the complete fresh-eyes review protocol.

## Philosophy

Quality over speed. The 2-5 minutes spent here prevent hours of debugging production issues.

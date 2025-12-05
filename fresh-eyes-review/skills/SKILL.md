---
name: fresh-eyes-review
description: Use before git commit, before PR creation, before declaring done - mandatory final sanity check after tests pass; catches SQL injection, security vulnerabilities, edge cases, and business logic errors that slip through despite passing tests; the last line of defense before code ships
---

# Fresh-Eyes Review

## Core Principle

The central mandate is uncompromising: **"NO COMMIT WITHOUT FRESH-EYES REVIEW FIRST"**

This represents a final quality gate executed *after* implementation completion, passing tests, and peer review. The discipline applies universally, even without explicit skill activation.

## Key Distinctions

Fresh-eyes review differs fundamentally from testing and code review:

- **Testing** validates expected behavior under controlled conditions
- **Code review** examines patterns and quality during implementation
- **Fresh-eyes** catches unexpected issues through deliberate re-reading with psychological distance

The skill emphasizes that "100% test coverage and passing scenarios" can coexist with "critical bugs" waiting discovery.

## Required Process

**Step 1 - Announce Commitment**
Explicitly declare: "Starting fresh-eyes review of [N] files. This will take 2-5 minutes." This announcement creates accountability and reframes your mindset.

**Step 2 - Systematic Checklist**
Review all touched files for:
- Security vulnerabilities (SQL injection, XSS, path traversal, command injection)
- Logic errors (off-by-one boundaries, race conditions, null handling)
- Business rule implementation (calculations match requirements?)
- Input validation (type, range, format checks complete?)
- Performance issues (N+1 queries, unbounded loops)

**Step 3 - Fix Immediately**
Address findings before declaring completion. Re-run tests after corrections.

**Step 4 - Declare Results**
Mandatory announcement: "Fresh-eyes complete. [N] issues found and fixed." Include this even for zero findings—it proves execution.

## Time Commitment

Expected duration: 2-5 minutes depending on file count. Faster completion suggests insufficient depth; excessive time indicates scope creep.

## Resistance Patterns to Reject

The document explicitly lists rationalizations to ignore:
- "Tests are comprehensive"
- "I'm confident it's correct"
- "Partner is waiting"
- "Production is blocked"
- "Senior dev already approved"

These circumstances represent *precisely when* critical bugs escape into production.

# fresh-eyes-review

> Mandatory final sanity check before commits/PRs - catches security vulnerabilities, logic errors, and bugs that slip through tests

- **Version:** 1.0.0
- **Source:** https://github.com/2389-research/fresh-eyes-review

## Install

Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

```
npx skills add 2389-research/fresh-eyes-review
```

Or natively in Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install fresh-eyes-review@2389-research
```

## README

# Fresh-eyes review

Mandatory sanity check before git commit or PR creation.

> "Tests are comprehensive." "I'm confident it's correct." "Partner is waiting." "Production is blocked." "Senior dev already approved."
>
> These are exactly the circumstances when critical bugs escape into production.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install fresh-eyes-review@2389-research
```

## What this plugin does

A disciplined review process that catches security holes, logic errors, edge cases, and business logic bugs that slip through despite passing tests.

### Core principle

**"NO COMMIT WITHOUT FRESH-EYES REVIEW FIRST"**

This runs *after* implementation, *after* tests pass, but *before* code ships.

## What it catches

- Security vulnerabilities -- SQL injection, XSS, path traversal, command injection
- Logic errors -- off-by-one boundaries, race conditions, null handling
- Business rule bugs -- calculations not matching requirements
- Input validation gaps -- missing type, range, or format checks
- Performance problems -- N+1 queries, unbounded loops

## Quick example

```
Before committing code:
1. "Starting fresh-eyes review of 3 files. This will take 2-5 minutes."
2. Review systematically for security, logic, business rules, validation, performance
3. Fix issues immediately and re-run tests
4. "Fresh-eyes complete. 2 issues found and fixed."
```

## Why bother

**"100% test coverage and passing scenarios" can coexist with critical bugs** waiting to be discovered.

Testing, code review, and fresh-eyes review are different things. Testing validates expected behavior under controlled conditions. Code review examines patterns and quality during implementation. Fresh-eyes catches unexpected issues through deliberate re-reading -- you're looking at the code with psychological distance.

## Time commitment

Expected duration: **2-5 minutes** depending on file count.

- If you finish faster than that, you probably didn't look hard enough
- If it takes much longer, you're probably scope-creeping

## Documentation

See [skills/SKILL.md](skills/SKILL.md) for the complete fresh-eyes review protocol.

---

If Fresh Eyes caught something your tests didn't, a ⭐ helps us know it's landing.

Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)


# prbuddy

PR health assistant for Claude Code agents. Monitors CI, triages review comments, fixes issues with systematic prevention.

## Installation

```bash
/plugin install prbuddy@2389-research
```

### Prerequisites

1. **gh CLI** - Install and authenticate:
   ```bash
   gh auth login
   ```

2. **gh-pr-review extension** - Required for review comments:
   ```bash
   gh extension install agynio/gh-pr-review
   ```

## Skills

### `/prbuddy`

Full PR health check. Runs CI check, then reviews.

```
User: /prbuddy
Agent: Checking PR #42...

CI: ✓ All checks passing
Reviews: 2 unresolved threads

[proceeds to handle reviews]
```

### `/prbuddy:ci`

Direct CI monitoring and fixing.

```
User: /prbuddy:ci
Agent: Checking CI status...

❌ 1 of 4 checks failed: test

Fetching logs...
Diagnosing...
Fixing...
Adding prevention...

✓ Fix pushed. Monitor with: /prbuddy:ci
```

### `/prbuddy:reviews`

Direct review comment handling.

```
User: /prbuddy:reviews
Agent: Fetching review comments...

Found 3 unresolved threads:
- [CRITICAL] Missing validation on user ID
- [NITPICK] Extract helper function
- [NITPICK] Typo in README

[fixes critical, creates issues for nitpicks]
```

## Philosophy

**"Fix the acute issue AND prevent the class of error from recurring."**

Every fix includes systematic prevention:
- Linter rules
- Pre-commit hooks
- Type constraints
- Tests
- Documentation

## Checkpoint Discipline

Check CI at key moments (not continuously):
- After push settles
- Before requesting review
- Before declaring done
- Before merge

## Links

- [Design Document](docs/plans/2026-02-11-prbuddy-design.md)
- [gh-pr-review extension](https://github.com/agynio/gh-pr-review)

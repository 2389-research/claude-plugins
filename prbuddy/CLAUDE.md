# prbuddy Plugin

## Overview

PR health assistant that monitors CI, triages review comments, fixes issues, and implements systematic prevention.

## Skills Included

### Main Skill: prbuddy

Orchestrator that checks CI status then review comments. Routes to sub-skills based on context.

**Triggers:** "check my PR", "PR health", "make PR green", "fix PR", "ready to merge"

### Sub-Skills

- **prbuddy:ci** - CI/workflow monitoring, failure diagnosis, fix + prevent
- **prbuddy:reviews** - Review comment triage, fix critical, create issues for nitpicks

## Prerequisites

### gh CLI

Must be installed and authenticated:

```bash
gh auth status
```

**Required scopes:** `repo`, `read:org`, `workflow`

### gh-pr-review Extension

Required for review comment handling:

```bash
gh extension install agynio/gh-pr-review
```

## Core Philosophy

**"Fix the acute issue AND prevent the class of error from recurring."**

Every fix should include a "prevention delta" (prefer higher):
1. **Linter rule** - Add ESLint/Prettier/etc. rule (strongest)
2. **Pre-commit hook** - Add check to `.pre-commit-config.yaml`
3. **CI check** - Add earlier/faster check
4. **Type system** - Stricter TypeScript config
5. **Test** - Add test for this case
6. **Documentation** - Update CLAUDE.md if agent guidance (weakest)

## Checkpoint Discipline

Check CI at these moments (not continuously):
- After push settles
- Before requesting review
- Before declaring done
- Before merge

## Triage Logic

**Critical comments** (fix immediately):
- Related to linked issues
- Aligned with PR goals
- Security vulnerabilities
- Breaking API changes

**Nitpick comments** (create issues):
- Valid but outside PR scope
- Style preferences
- Refactoring suggestions

## PAL Consultation

For non-trivial fixes, consult PAL:
- Diagnose complex CI failures
- Get expert opinion on fix approach
- Consider reviewer suggestions

## Commands Reference

| Task | Command |
|------|---------|
| PR status | `gh pr view --json number,title,body,closingIssuesReferences` |
| CI checks | `gh pr checks --json name,state,bucket` |
| Failed logs | `gh run view <id> --log-failed` |
| List threads | `gh pr-review threads list --unresolved --not_outdated` |
| Reply | `gh pr-review comments reply --thread-id <id> --body <msg>` |
| Resolve | `gh pr-review threads resolve --thread-id <id>` |
| Create issue | `gh issue create --title --body --label` |

## Integration

Works with other 2389 plugins:
- **fresh-eyes-review** - Run before committing fixes
- **terminal-title** - Updates title during PR work

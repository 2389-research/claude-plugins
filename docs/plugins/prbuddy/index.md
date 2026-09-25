# prbuddy

> PR health assistant - monitors CI, triages review comments, fixes issues with systematic prevention. Uses gh CLI and gh-pr-review extension.

- **Version:** 1.0.0
- **Source:** https://github.com/2389-research/prbuddy

## Install

Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

```
npx skills add 2389-research/prbuddy
```

Or natively in Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install prbuddy@2389-research
```

## README

# prbuddy

PR health assistant for Claude Code. Monitors CI status, triages review comments, fixes issues, and implements systematic prevention so the same class of error cannot recur.

## What It Does

prbuddy gives Claude three skills that cover the full PR health lifecycle:

| Skill | What it does |
|-------|-------------|
| `prbuddy` | Full orchestrator — detects the PR, checks CI, then routes to sub-skills |
| `prbuddy:ci` | Fetches failed CI logs, diagnoses root cause, fixes and prevents |
| `prbuddy:reviews` | Triages review threads: fixes critical comments, converts nitpicks to issues |

## Usage

Trigger the main skill with natural language:

- "check my PR"
- "make PR green"
- "fix PR"
- "ready to merge"
- "handle PR feedback"
- "what's blocking my PR"

Or invoke sub-skills directly:

- `/prbuddy:ci` — jump straight to CI diagnosis
- `/prbuddy:reviews` — jump straight to review triage

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install prbuddy@2389-research
```

## Prerequisites

### Required: gh CLI

Must be installed and authenticated with the right scopes:

```bash
gh auth status
```

Required scopes: `repo`, `read:org`, `workflow`.

### Required: gh-pr-review Extension

Used by `prbuddy:reviews` to list and resolve review threads:

```bash
gh extension install agynio/gh-pr-review
```

### Optional: PAL MCP Server

`prbuddy:ci` (Step 6) and `prbuddy:reviews` (Step 4b) can call `mcp__pal__chat` on the team's PAL MCP server for expert diagnosis of complex failures and review analysis. If PAL is unavailable, both sub-skills fall back to direct log analysis and code inspection.

## Core Philosophy

**"Fix the acute issue AND prevent the class of error from recurring."**

Every fix includes a prevention delta. See CLAUDE.md for the prevention hierarchy.

## Works Well With

- **fresh-eyes-review** — run before committing fixes
- **terminal-title** — updates terminal title during PR work

---

Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)


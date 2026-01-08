# Documentation Audit Plugin

## Overview

This plugin provides systematic verification of documentation claims against codebase reality. It runs in an isolated context using the Plan agent to avoid polluting the main conversation with extraction artifacts.

## Skills Included

| Skill | Purpose |
|-------|---------|
| `documentation-audit` | Main orchestrator - runs two-pass audit |

### Supporting Files

- `skills/checklist.md` - TodoWrite-compatible execution checklist
- `skills/extraction-patterns.md` - Claim type detection patterns

## When to Use

Invoke `documentation-audit` when:
- Before releases (verify docs match current behavior)
- After major refactors (code changed, docs may be stale)
- When users report docs don't match behavior
- Periodic hygiene (quarterly documentation review)

**Trigger phrases:** "audit docs", "verify documentation", "check if docs are accurate"

## How It Works

### Two-Pass Approach

**Pass 1: Direct Extraction**
- Extract claims from each user-facing markdown file
- Verify each claim against codebase
- Record verdict: TRUE / FALSE / NEEDS_REVIEW

**Pass 2A: Pattern Expansion**
- Group false claims by pattern type
- Search ALL docs for similar patterns
- Catch issues the initial scan missed

**Pass 2B: Gap Detection**
- Compare actual codebase inventory vs documented items
- Find undocumented scripts, services, configs
- Find documented-but-missing artifacts

### Claim Types

| Type | Example | Auto-Verifiable |
|------|---------|-----------------|
| `file_ref` | `scripts/foo.py` | Yes |
| `config_default` | "defaults to 'AI Radio'" | Yes |
| `env_var` | `STATION_NAME` | Yes |
| `cli_command` | `--normalize` flag | Yes |
| `behavior` | "runs every 2 minutes" | No (human review) |

## Output

Generates `docs/audits/AUDIT_REPORT_YYYY-MM-DD.md` with:
- Executive summary (claims verified, accuracy rate)
- False claims table with line numbers and suggested fixes
- Pattern analysis showing root causes
- Human review queue for behavioral claims

## Parallel Agent Usage

The skill uses parallel Task agents (one per document) for extraction to maximize efficiency. The Plan agent context keeps extraction artifacts separate from your main conversation.

## Patterns and Anti-Patterns

**Do:**
- Use parallel agents for extraction (one per doc)
- Record evidence for every verdict (file:line)
- Run Pass 2 - it catches 10-20% more issues
- Prioritize user-facing docs over internal

**Don't:**
- Skip Pass 2 (pattern expansion)
- Trust "looks correct" without verification
- Audit design docs or plans (historical artifacts)
- Fix claims without citing evidence

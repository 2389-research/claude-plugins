# Documentation Audit Plugin

Systematically verify documentation claims against codebase reality.

## Problem

Documentation drifts from code. Claims about defaults, file paths, behaviors, and configurations become stale as code evolves. Users following outdated docs encounter errors.

## Solution

Two-pass audit approach:

1. **Pass 1: Direct Extraction** - Extract and verify claims from each doc
2. **Pass 2A: Pattern Expansion** - Find similar issues based on discovered patterns
3. **Pass 2B: Gap Detection** - Compare codebase inventory vs documented items

## Usage

Invoke the skill when:
- Before releases
- After major refactors
- When users report docs don't match behavior
- Periodic hygiene (quarterly)

## Output

Generates `docs/audits/AUDIT_REPORT.md` with:
- Executive summary (claims verified, false claims found)
- False claims table with line numbers and fixes
- Pattern analysis (common root causes)
- Human review queue for behavioral claims

## Example Results

From a real audit:
- 12 documents scanned
- ~180 claims verified
- 31 false claims found (17%)
- Patterns: dead scripts (9), wrong intervals (4), wrong service names (3)

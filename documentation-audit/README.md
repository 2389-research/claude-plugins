# Documentation Audit Plugin

Systematically verify documentation claims against codebase reality.

## Problem

Documentation drifts from code. Claims about defaults, file paths, behaviors, and configurations become stale as code evolves. Users following outdated docs encounter errors.

## Solution

A two-pass audit approach:

1. Direct extraction -- pull claims from each doc and verify them against code
2. Pattern expansion -- find similar issues based on patterns discovered in pass 1
3. Gap detection -- compare the actual codebase inventory against what's documented

## Usage

Invoke the skill when:
- Before releases
- After major refactors
- When users report docs don't match behavior
- Periodic hygiene (quarterly)

## Output

Generates `docs/audits/AUDIT_REPORT.md` containing:
- Executive summary -- how many claims verified, how many false
- False claims table with line numbers and suggested fixes
- Pattern analysis of common root causes
- Human review queue for behavioral claims that can't be auto-verified

## Example results

From a real audit:
- 12 documents scanned
- ~180 claims verified
- 31 false claims found (17%)
- Patterns: dead scripts (9), wrong intervals (4), wrong service names (3)

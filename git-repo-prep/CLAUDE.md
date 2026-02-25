# git-repo-prep

## Overview

Plugin with two skills for open-source readiness: `prepare` (full lifecycle) and `review` (standalone audit). Router in `skills/SKILL.md` dispatches based on user intent.

## Skills

- `skills/SKILL.md` — Router. Detects prepare vs review intent, invokes sub-skill.
- `skills/prepare/SKILL.md` — 9-phase interactive workflow. Each phase: scan → present → propose → approve → implement → commit.
- `skills/review/SKILL.md` — Category-by-category audit with severity table (Critical/Recommended/Nice-to-have). Conversational output, offers to fix issues.

## Key Design Decisions

- Personal info (emails, usernames) treated as separate concern from secrets
- License consistency checked across LICENSE file, package metadata, AND README
- Agents must ask user preferences via AskUserQuestion — never prescribe
- Stays focused on openness — no code quality drift
- Ecosystem-aware but not ecosystem-dependent

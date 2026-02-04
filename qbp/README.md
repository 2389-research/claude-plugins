# Quaker Business Practice (QBP) Plugin

Decision-making skills for Claude that emulate Quaker business practices - seeking unity through discernment rather than consensus through debate.

## Skills

### qbp:discernment

Internal deliberation where Claude convenes multiple perspectives (voices) to discern the right path forward. Use for weighty questions, ethical decisions, and trade-offs.

**What it does:**
- Identifies context-relevant perspectives
- Each voice speaks once to the matter
- Clerk role synthesizes toward unity
- Surfaces tensions rather than papering over them

### qbp:clearness

Multi-agent committee that spawns specialized agents for parallel deep analysis. Use for code reviews, architecture decisions, and research requiring depth.

**What it does:**
- Proposes committee composition (user confirms)
- Spawns agents with specific perspectives
- Agents do real parallel analysis
- Clerk synthesizes findings toward unity

### qbp:gathered

Participatory discernment where the user joins alongside agent voices. Use when user has a stake or perspective, not just a question.

**What it does:**
- Recognizes when user has stake/perspective
- Teaches Quaker discipline (speak once, silence is meaningful, slow is the point)
- Sequential agent voices with check-ins
- User's contribution shapes the synthesis

## Quaker Principles

These skills are grounded in actual Quaker business practice:

| Principle | Meaning |
|-----------|---------|
| Sense of the meeting | Discern where unity lies, don't count votes |
| Speaking once | Each perspective speaks once, then listens |
| Silence | Space between voices lets insights emerge |
| Standing aside | Disagree but don't block ("I wouldn't, but I won't stop you") |
| Blocking | Rare - only for violations of core principles |
| Way opens | Recognize when clarity emerges vs. forcing decision |

## Installation

This plugin is part of the claude-plugins collection. Install via the standard plugin installation process.

## Development

Skills were developed using TDD for documentation:
1. Baseline tests (pressure scenarios without skill)
2. Document failures
3. Write skill addressing failures
4. Test with skill
5. Iterate until solid

Design document: `docs/plans/2026-02-03-qbp-skillset-design.md` (in source repo)

# Quaker Business Practice (QBP) plugin

Decision-making skills for Claude that follow Quaker business practices -- seeking unity through discernment rather than consensus through debate.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install qbp@2389-research
```

## Skills

- `qbp` -- main router skill
- `qbp:discernment` -- internal voices seeking clarity
- `qbp:clearness` -- multi-agent committee for deep analysis
- `qbp:gathered` -- participatory discernment with user

## Quick example

```
User: "Should we open-source our internal tool? I've been thinking about this for weeks."

Claude (with qbp:gathered): "You've been sitting with this for weeks - you have
a perspective, not just a question. Want to discern this together?

Here are the ground rules: You speak once. You don't have to speak.
Don't react, discern. This is slow, and that's the point.

I'd suggest these perspectives alongside yours: Community Builder,
Business Strategist, Developer Culture voice. Anyone to add?"
```

## Skills in detail

### qbp:discernment

Internal deliberation where Claude convenes multiple perspectives (voices) to discern the right path forward. Use for weighty questions, ethical decisions, and trade-offs.

It identifies context-relevant perspectives, has each voice speak once to the matter, then a clerk role synthesizes toward unity. Tensions get surfaced, not papered over.

### qbp:clearness

Multi-agent committee that spawns specialized agents for parallel deep analysis. Use for code reviews, architecture decisions, and research requiring depth.

The skill proposes committee composition (user confirms), spawns agents with specific perspectives, runs real parallel analysis, and has a clerk synthesize findings toward unity.

### qbp:gathered

Participatory discernment where the user joins alongside agent voices. Use when the user has a stake or perspective, not just a question.

It recognizes when the user has stake/perspective, teaches Quaker discipline (speak once, silence is meaningful, slow is the point), runs sequential agent voices with check-ins, and lets the user's contribution shape the synthesis.

## Quaker principles

These skills are grounded in actual Quaker business practice:

| Principle | Meaning |
|-----------|---------|
| Sense of the meeting | Discern where unity lies, don't count votes |
| Speaking once | Each perspective speaks once, then listens |
| Silence | Space between voices lets insights emerge |
| Standing aside | Disagree but don't block ("I wouldn't, but I won't stop you") |
| Blocking | Rare -- only for violations of core principles |
| Way opens | Recognize when clarity emerges vs. forcing decision |

## Development

Skills were developed using TDD for documentation:
1. Baseline tests (pressure scenarios without skill)
2. Document failures (how Claude responds without guidance)
3. Write skill addressing specific failures
4. Test with skill (verify improvement)
5. Iterate until solid

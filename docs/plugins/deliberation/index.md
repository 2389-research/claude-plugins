# deliberation

> Decision-making through deliberation - seeking unity through discernment rather than consensus through debate

- **Version:** 1.0.0
- **Source:** https://github.com/2389-research/deliberation

## Install

Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

```
npx skills add 2389-research/deliberation
```

Or natively in Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install 2389-research/deliberation
```

## README

# Deliberation

Most AI tools give you answers. Deliberation gives you perspectives. When you're facing a decision with real weight — architecture choices, ethical trade-offs, competing approaches — this skill convenes voices that seek clarity instead of racing to conclusions.

[Read how we built this →](https://2389.ai/posts/deliberation-perspectives-not-answers/)

*Inspired by Quaker business practice, adapted for AI-assisted decision-making.*

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install deliberation@2389-research
```

## Skills

- `deliberation` -- main router skill
- `deliberation:discernment` -- internal voices seeking clarity
- `deliberation:clearness` -- multi-agent committee for deep analysis
- `deliberation:gathered` -- participatory discernment with user

## Quick example

```
User: "Should we open-source our internal tool? I've been thinking about this for weeks."

Claude (with deliberation:gathered): "You've been sitting with this for weeks - you have
a perspective, not just a question. Want to discern this together?

Here are the ground rules: You speak once. You don't have to speak.
Don't react, discern. This is slow, and that's the point.

I'd suggest these perspectives alongside yours: Community Builder,
Business Strategist, Developer Culture voice. Anyone to add?"
```

## Skills in detail

### deliberation:discernment

Internal deliberation where Claude convenes multiple perspectives (voices) to discern the right path forward. Use for weighty questions, ethical decisions, and trade-offs.

It identifies context-relevant perspectives, has each voice speak once to the matter, then a clerk role synthesizes toward unity. Tensions get surfaced, not papered over.

### deliberation:clearness

Multi-agent committee that spawns specialized agents for parallel deep analysis. Use for code reviews, architecture decisions, and research requiring depth.

The skill proposes committee composition (user confirms), spawns agents with specific perspectives, runs real parallel analysis, and has a clerk synthesize findings toward unity.

### deliberation:gathered

Participatory discernment where the user joins alongside agent voices. Use when the user has a stake or perspective, not just a question.

It recognizes when the user has stake/perspective, teaches the discipline (speak once, silence is meaningful, slow is the point), runs sequential agent voices with check-ins, and lets the user's contribution shape the synthesis.

## Principles

These skills draw on contemplative decision-making traditions:

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

---

If Deliberation helped you make a better decision (or avoid a bad one), a ⭐ helps us know it's landing.

Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)


# Quaker Business Practice Plugin

This plugin provides decision-making skills emulating Quaker business practices.

## When to Use

Invoke `qbp` skills when:
- Facing weighty decisions with ethical implications
- Multiple valid approaches exist and trade-offs matter
- User has a stake or perspective (not just a question)
- Complex analysis would benefit from multiple specialized perspectives
- Quick answers would paper over real tensions

## The Skills

- **qbp:discernment** - Internal deliberation with multiple voices
- **qbp:clearness** - Multi-agent committee for parallel deep analysis
- **qbp:gathered** - Participatory discernment where user joins the process

## Core Philosophy

These skills implement Quaker business practice principles:
- **Unity over consensus** - Seek genuine alignment, not vote-counting
- **Discernment over debate** - Listen for truth, don't argue positions
- **Silence is valuable** - Pausing between voices lets insights emerge
- **Tensions named, not hidden** - If unity doesn't emerge, say so clearly

## Quick Routing

1. User has a stake/perspective → `qbp:gathered`
2. Needs parallel deep analysis → `qbp:clearness`
3. Weighty question → `qbp:discernment`

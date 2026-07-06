# jam

> Structured multi-approach exploration using parallel perspective panels to generate, implement, and evaluate distinct variants, synthesizing the best insights from all into the winner.

- **Version:** 1.0.0
- **Source:** https://github.com/2389-research/jam

## Install

Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

```
npx skills add 2389-research/jam
```

Or natively in Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install jam@2389-research
```

## README

# Jam

**Parallel exploration powered by diverse perspectives.**

Jam is a [Claude Code](https://claude.com/claude-code) plugin that turns "build me X" into a structured exploration: diverse panels propose approaches, variants get built in parallel, a review panel evaluates them all, and the best insights from every variant get folded into the winner.

> The jam was all of us together.

## Why

A single agent generating "multiple approaches" is still one mind imagining what different people would think. The perspectives cluster, biases leak through, and the agent converges to its own preference. Jam makes diversity real by dispatching independent agents who reason separately — and then it refuses to throw away what the losers figured out.

## The flow

```
Build request
    ↓
Context & architectural slots
    ↓
Generate a domain-specific perspective panel  ← diverse independent agents
    ↓
Synthesize proposals into 3–5 distinct variants
    ↓
Implement all variants in parallel (git worktrees)
    ↓
Generate a domain-specific review panel        ← diverse independent reviewers
    ↓
Review panel evaluates ALL variants
    ↓
Pick winner based on panel findings
    ↓
Synthesize: fold best insights from ALL variants into the winner
    ↓
Ship the improved winner
```

Two things make this different from plain brainstorming:

1. **Real diversity, not imagined diversity.** Panels are independent agents, each with a different worldview and optimization function. They never see each other's output.
2. **Active synthesis, not a backlog.** The strengths of losing variants get ported into the winner *now*, not documented for "later."

## Installation

Add the marketplace and install:

```bash
# In Claude Code
/plugin marketplace add 2389-research/claude-plugins
/plugin install jam@2389-research
```

Or install directly from this repo as a dev plugin:

```bash
claude --plugin-dir /path/to/jam
```

## Usage

Just ask Claude to jam on something:

- "jam on a fizzbuzz CLI"
- "let's jam on the onboarding flow"
- "can we jam on the storage layer?"
- "jam this design with a few different approaches"

Claude will:
1. Ask 1–2 context questions and identify the architectural slots worth exploring
2. Propose a domain-specific perspective panel for your approval
3. Dispatch the panel, synthesize proposals into variants, get your approval
4. Implement all variants in parallel in git worktrees
5. Propose a review panel for your approval
6. Dispatch reviewers against every variant
7. Pick a winner, propose a synthesis plan, then implement the improvements
8. Clean up losing worktrees and hand you the final branch

You stay in the loop at every gate — panels and synthesis plans are always presented before execution.

## When to use it

**Good fit:**
- Build/create/implement requests where multiple approaches are genuinely viable
- Architectural decisions with real trade-offs
- You're indecisive or want to see options
- You want more than one mind on the problem

**Bad fit:**
- Trivial changes (rename, config tweak, tiny bugfix)
- You already know exactly what you want
- Single clear path with no meaningful alternatives

## Repo layout

```
.claude-plugin/plugin.json   Plugin manifest
CLAUDE.md                    Agent-facing plugin guide
AGENTS.md                    Same, for non-Claude agents
skills/
  SKILL.md                   Router skill
  jam/SKILL.md               The full Jam workflow
evals/                       Comparative eval harness (Jam vs. other approaches)
```

## Evals

The `evals/` directory contains a harness that runs tasks against multiple approaches (plain Claude, brainstorming, test-kitchen, jam) and compares the outputs. See `evals/run-eval.sh`.

## License

MIT


# Speed-Run

Token-efficient code generation pipeline. Uses hosted LLM (Cerebras) for fast, cheap first-pass generation with Claude handling architecture and surgical fixes.

| Skill | Description | Best For |
|-------|-------------|----------|
| `speed-run:turbo` | Direct hosted codegen | Single task, algorithmic code, boilerplate |
| `speed-run:showdown` | Same design, parallel runners compete | Medium-high complexity, want best implementation |
| `speed-run:any-percent` | Different approaches explored in parallel | Unsure of architecture, want to compare designs |

## Installation

```bash
/plugin install speed-run@2389-research
```

### Prerequisites

Speed-run requires a Cerebras API key for hosted code generation. Free tier includes ~1M tokens/day.

1. Get a key at [cloud.cerebras.ai](https://cloud.cerebras.ai)
2. Add to `~/.claude/settings.json`:
```json
{
  "env": {
    "CEREBRAS_API_KEY": "your-key-here"
  }
}
```
3. Restart Claude Code

## Flow

```text
User: "speed-run" / "turbo build" / "fast build"
    ↓
Check: Cerebras API key
    ↓
┌─────────────────────────────────────────┐
│  Route Selection                        │
│                                         │
│  1. Turbo     - Direct codegen          │
│  2. Showdown  - Parallel competition    │
│  3. Any%      - Parallel exploration    │
└─────────────────────────────────────────┘
```

## Quick Examples

### Turbo (Direct Code Generation)

```text
User: "Use speed-run to build a rate limiter"

Claude writes a contract prompt:
  - DATA CONTRACT (exact models, types)
  - API CONTRACT (exact routes, responses)
  - ALGORITHM (step-by-step logic)
  - RULES (framework, storage, error handling)

Cerebras generates code → written to disk (~0.5s)
Claude runs tests → surgical fixes if needed (1-4 lines)
```

The contract prompt pattern is like speccing a ticket for a junior dev — explicit inputs, outputs, types, and behavior. That specificity is what makes hosted LLMs reliable at 80-95% first-pass accuracy.

### Showdown (Parallel Competition)

```text
User: "Use showdown for the auth system"

Claude assesses complexity → spawns 3 runners
Each runner:
  1. Reads the shared design doc
  2. Creates their OWN implementation plan
  3. Generates code via Cerebras
  4. Runs tests, fixes failures

All runners dispatched in parallel.
Fresh-eyes review → judge scores all → winner selected.
```

Key insight: each runner creates their own plan from the design doc. No shared implementation plan means genuine variation emerges naturally.

### Any% (Parallel Exploration)

```text
User: "Not sure whether to use SQLite or Postgres, try both"

Claude generates 2-3 architectural approaches
Each variant:
  1. Gets its own worktree and branch
  2. Creates implementation plan for its approach
  3. Generates code via Cerebras
  4. Runs tests

Same scenario tests run against all variants.
Fresh-eyes review → judge scores all → winner selected.
```

## When to use it

| Scenario | Speed-run? |
|----------|-----------|
| Algorithmic code, data transforms | Yes, turbo |
| Boilerplate, scaffolding | Yes, turbo |
| Comparing multiple implementations | Yes, showdown |
| Exploring different architectures | Yes, any-percent |
| Complex business logic that needs reasoning | No, use Claude directly |
| One-liner fixes | No, overkill |

## How It Compares to Test Kitchen

Speed-run mirrors test-kitchen's parallel patterns but shifts code generation to a hosted LLM:

| | Test Kitchen | Speed-Run |
|---|---|---|
| Code generation | Claude writes everything | Cerebras generates, Claude fixes |
| Token cost | Standard | ~60-70% savings |
| Generation speed | ~10s per file | ~0.5s per file |
| First-pass quality | ~100% | 80-95% |
| External dependency | None | Cerebras API key |

The most direct comparison: test-kitchen's **cookoff** vs speed-run's **showdown** — same concept (multiple agents implement the same design), different execution strategy.

## Available Models

| Model | Speed | Notes |
|-------|-------|-------|
| `gpt-oss-120b` | ~3000 t/s | **Default** — best value, clean output |
| `llama-3.3-70b` | ~2100 t/s | Reliable fallback |
| `qwen-3-32b` | ~2600 t/s | Has verbose `<think>` tags |
| `llama3.1-8b` | ~2200 t/s | Cheapest, may need more fixes |

## Dependencies

Speed-run orchestrates these skills (uses fallbacks if not installed):

- `superpowers:dispatching-parallel-agents`
- `superpowers:using-git-worktrees`
- `superpowers:writing-plans`
- `superpowers:executing-plans`
- `superpowers:test-driven-development`
- `superpowers:verification-before-completion`
- `fresh-eyes-review:skills`
- `scenario-testing:skills`
- `superpowers:finishing-a-development-branch`

## Documentation

- [CLAUDE.md](CLAUDE.md) — Architecture, skill details, config, common mistakes
- [Turbo Skill](./skills/turbo/SKILL.md) — Direct hosted codegen
- [Showdown Skill](./skills/showdown/SKILL.md) — Parallel competition
- [Any% Skill](./skills/any-percent/SKILL.md) — Parallel exploration
- [Judge Skill](./skills/judge/SKILL.md) — Scoring framework

## Origin

Speed-run was born from test-kitchen's token cost problem. Running 3-5 parallel Claude agents generates a lot of expensive output tokens. By shifting first-pass code generation to Cerebras (~3000 tokens/second), we keep the same parallel exploration patterns at a fraction of the cost — Claude focuses on what it's best at: architecture, orchestration, and surgical fixes.

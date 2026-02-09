# Speed-Run

Offloads code generation to Cerebras (~2000 tokens/sec), then Claude handles architecture and fixes. About 60% fewer tokens, 20x faster generation per file.

## Installation

```bash
/plugin install speed-run@2389-research
```

You need a free Cerebras API key from https://cloud.cerebras.ai. Add it to `~/.claude/settings.json`:

```json
{
  "env": {
    "CEREBRAS_API_KEY": "your-key-here"
  }
}
```

## What you get

- Turbo -- direct Cerebras code generation for single tasks
- Showdown -- multiple runners implement the same spec in parallel, judge picks the winner
- Any-percent -- multiple approaches to the same problem in parallel, judge evaluates tradeoffs
- Judge -- scoring framework for comparing implementations (5 criteria, 25 points max)
- MCP server -- Cerebras API integration with file parsing and disk writing

## Quick example

```
You: "speed-run this authentication middleware"

Claude: Checks API key, routes to turbo.
        Writes contract prompt, calls Cerebras, gets code in ~0.5s.
        Runs tests, fixes any failures.
        Done.
```

For bigger tasks:

```
You: "speed-run showdown: implement the caching layer"

Claude: Writes shared design doc.
        Dispatches 3 runners in parallel (each uses Cerebras).
        All runners: generate, test, fix.
        Judge scores all three.
        Winner kept, losers cleaned up.
```

## How it works

1. Claude decides the architecture and writes a structured contract prompt
2. Cerebras generates the code at ~2000 tokens/sec
3. Claude runs tests and fixes anything Cerebras got wrong
4. Same quality, fewer tokens, less wall clock time

Most code is pattern-following. Cerebras is fast at that. The parts that require actual thinking still go through Claude.

## When to use it

| Scenario | Speed-run? |
|----------|-----------|
| Algorithmic code, data transforms | Yes, turbo |
| Boilerplate, scaffolding | Yes, turbo |
| Comparing multiple implementations | Yes, showdown |
| Exploring different architectures | Yes, any-percent |
| Complex business logic that needs reasoning | No, use Claude directly |
| One-liner fixes | No, overkill |

## Docs

- [CLAUDE.md](CLAUDE.md) -- architecture, skill details, config, common mistakes
- [skills/](skills/) -- individual skill definitions
- [mcp/](mcp/) -- MCP server source

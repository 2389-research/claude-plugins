# Speed-Run Plugin

## Overview

Speed-run offloads first-pass code generation to Cerebras (~2000 tokens/sec), then Claude handles architecture decisions and surgical fixes. Same quality code, ~60% fewer Claude tokens, 20x faster generation per file.

Most code is pattern-following, not reasoning. Cerebras handles the patterns; Claude handles the thinking.

## Architecture

```
┌─────────────────────────────────────────────┐
│  speed-run (orchestrator skill)             │
│  Checks API key → routes to sub-skill       │
├──────────┬──────────┬───────────────────────┤
│  turbo   │ showdown │  any-percent          │
│  1 task  │ N runners│  N approaches         │
│  direct  │ same spec│  different specs      │
└────┬─────┴────┬─────┴────┬──────────────────┘
     │          │          │
     v          v          v
┌─────────────────────────────────────────────┐
│  MCP Server (@2389/speed-run-mcp)           │
│  ┌───────────┬──────────────┬─────────────┐ │
│  │ generate  │ generate_and │ check_status│ │
│  │           │ _write_files │             │ │
│  └─────┬─────┴──────┬───────┴─────────────┘ │
│        │            │                        │
│        v            v                        │
│  Cerebras API (llama-4-scout-17b-16e-instruct)│
└─────────────────────────────────────────────┘
```

## Prerequisites

### CEREBRAS_API_KEY

Get a free key at https://cloud.cerebras.ai

Set it using **either** method:

**Option A (recommended):** Add to `~/.claude/settings.json`:
```json
{
  "env": {
    "CEREBRAS_API_KEY": "your-key-here"
  }
}
```

**Option B:** Export in shell profile (`~/.zshrc` or `~/.bashrc`):
```bash
export CEREBRAS_API_KEY="your-key-here"
```

Restart Claude Code after setting the key. The plugin checks on session start via a hook and warns if the key is missing.

### MCP Server

The MCP server auto-registers via `.mcp.json` when the plugin is installed. If `mcp__speed-run__*` tools aren't available, build manually:

```bash
cd ./mcp && npm install && npm run build
```

## Skills

### Routing

| Skill | Trigger | What it does |
|-------|---------|-------------|
| `speed-run` | "speed-run", "turbo", "fast codegen", "cerebras" | Orchestrator. Checks API key, presents options. |
| `speed-run:turbo` | Single task, straightforward codegen | Direct generation. One contract prompt, one output. |
| `speed-run:showdown` | Multiple implementations of the same spec | Parallel competition. N runners implement the same design, judge picks the winner. |
| `speed-run:any-percent` | Multiple architectural approaches | Parallel exploration. N variants try different approaches, judge evaluates tradeoffs. |
| `speed-run:judge` | Called by showdown/any-percent | Scoring framework. 5 criteria, 25 points max, hard gates on critical flaws. |

### Turbo (Direct Codegen)

The simplest path. Use when you have one task and want fast generation.

**Flow:**
1. Write a contract prompt (DATA CONTRACT, API CONTRACT, ALGORITHM, RULES)
2. Call `mcp__speed-run__generate_and_write_files` with the prompt
3. Run tests
4. If tests fail, Claude fixes surgically (don't regenerate the whole thing)
5. Re-test until green

**Best for:** Algorithmic code, boilerplate, data transformations, multi-file scaffolding.

**Not great for:** Novel architecture decisions, complex business logic, anything requiring deep reasoning about tradeoffs.

### Showdown (Parallel Competition)

Same design doc, multiple runners implement it independently. The judge scores all variants and picks a winner.

**Flow:**
1. Assess complexity → decide runner count (2-5)
2. Write a shared design document
3. Dispatch all runners in a single message (parallel agents)
4. Each runner: hosted LLM generates → tests → Claude fixes
5. Judge scores all variants (fitness, complexity, readability, robustness, maintainability)
6. Winner gets promoted, losers get cleaned up

**Critical:** Dispatch all runners in a single message. Sequential dispatch defeats the purpose.

### Any-Percent (Parallel Exploration)

Different architectural approaches to the same problem. Unlike showdown, each variant uses a different strategy.

**Flow:**
1. Gather context about the problem
2. Identify 2-5 distinct approaches (e.g., "event-driven vs polling vs hybrid")
3. Write a plan document defining each approach
4. Dispatch all variants in a single message
5. Each variant: hosted LLM generates → tests → Claude fixes
6. Judge evaluates tradeoffs across approaches
7. Winner gets promoted

**Best for:** When you genuinely don't know which approach is right and want to let the code speak.

### Judge (Scoring Framework)

Evaluates implementations across 5 criteria, each scored 1-5:

| Criterion | What it measures |
|-----------|-----------------|
| Fitness for Purpose | Does it actually do what was asked? (8 checkboxes) |
| Justified Complexity | Is the complexity earned? (line count analysis) |
| Readability | Can someone else understand it? (violation counting) |
| Robustness & Scale | Will it hold up? (12-item checklist) |
| Maintainability | Can it evolve? (6-item checklist) |

**Hard gates:** Fitness delta >= 2 between variants, or any score of 1, triggers automatic disqualification.

## MCP tools

| Tool | Purpose |
|------|---------|
| `mcp__speed-run__generate` | Send a prompt to Cerebras, get raw text back |
| `mcp__speed-run__generate_and_write_files` | Send a prompt, parse file blocks from response, write to disk |
| `mcp__speed-run__check_status` | Verify API key is set and Cerebras is reachable |

### File output format

The MCP server parses generated code from XML-style tags:

```text
<FILE path="src/main.py">
def hello():
    print("hello world")
</FILE>
```

Two legacy fallback formats (`### FILE: path` with fenced blocks, or raw content) are supported but not recommended.

If generated code contains literal triple backticks, use `TRIPLE_BACKTICK` as a placeholder - the server auto-replaces after extraction.

## Speed-run vs test kitchen

| Aspect | Test Kitchen | Speed-Run |
|--------|-------------|-----------|
| Code generation | Claude direct | Hosted LLM (Cerebras) |
| API key required | No | Yes (CEREBRAS_API_KEY) |
| Token cost | Standard Claude pricing | ~60% savings on generation |
| Generation speed | ~10s per file | ~0.5s per file |
| First-pass quality | ~100% correct | 80-95% (Claude fixes the rest) |
| Fix strategy | Rarely needed | Surgical fixes by Claude |
| Best for | Any task | Algorithmic code, boilerplate, multi-variant |

Use test-kitchen when first-pass quality matters most. Use speed-run when you want speed and token savings and don't mind a fix cycle.

## Skill dependencies

| Dependency | Used By | Purpose |
|------------|---------|---------|
| `speed-run:judge` | showdown, any-percent | Scoring framework (bundled) |
| `superpowers:dispatching-parallel-agents` | showdown, any-percent | Parallel dispatch |
| `superpowers:using-git-worktrees` | showdown, any-percent | Isolated workspaces |
| `superpowers:verification-before-completion` | all | Verify before claiming done |
| `fresh-eyes-review:skills` | showdown, any-percent | Quality gate before comparison |

## Common mistakes

Don't re-prompt Cerebras when tests fail. Claude should read the error and fix it surgically. Cerebras already did the structural work -- regenerating from scratch wastes the effort.

Showdown and any-percent must dispatch all runners in a single message. Running them one at a time defeats the whole point of parallelism.

Turbo needs structured contract prompts (DATA CONTRACT, API CONTRACT, etc). If you send it a vague prompt, you get vague code back.

Don't use speed-run for tasks that require actual reasoning about architecture or tradeoffs. Cerebras is fast at following patterns, not at thinking. Use Claude directly for those.

If tools aren't working, you probably forgot the API key. The session-start hook warns on launch, but `mcp__speed-run__check_status` will confirm.

## Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `CEREBRAS_API_KEY` | (required) | API key from https://cloud.cerebras.ai |
| `CEREBRAS_MODEL` | `llama-4-scout-17b-16e-instruct` | Model to use |
| `CEREBRAS_URL` | `https://api.cerebras.ai/v1` | API endpoint |
| `GENERATION_TIMEOUT` | `30000` | Timeout in ms |

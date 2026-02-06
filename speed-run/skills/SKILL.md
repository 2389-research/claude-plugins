---
name: speed-run
description: Token-efficient code generation pipeline using hosted LLM. Triggers on "speed-run", "fast build", "turbo build", "use hosted LLM", "use cerebras". Routes to turbo (direct codegen), race (parallel competition), or any% (parallel exploration).
---

# Speed-Run

Token-efficient code generation pipeline. Uses hosted LLM (Cerebras) for fast, cheap first-pass generation. Claude handles architecture and surgical fixes.

**Announce:** "I'm using speed-run for token-efficient code generation."

## Step 1: Check API Key (MANDATORY)

**ALWAYS run this first:**

```
mcp__hosted-llm-codegen__check_status
```

**If status is error / key not set:**

```
Speed-run requires a Cerebras API key for hosted code generation.

Setup (pick one):

Option A (recommended): Add to ~/.claude/settings.json:
  { "env": { "CEREBRAS_API_KEY": "your-key" } }

Option B: Add to ~/.zshrc:
  export CEREBRAS_API_KEY="your-key"

Get a free key at: https://cloud.cerebras.ai

Then restart Claude Code.
```

**STOP here.** Do not fall back to Claude direct generation — the whole point of speed-run is hosted LLM. If the user wants Claude direct, they should use test-kitchen instead.

## Step 2: Route

**If check_status returned OK, present options:**

```
Speed-run ready! Cerebras API connected.

How would you like to proceed?

1. Turbo - Direct code generation (single task, fast)
   → Best for: one feature, algorithmic code, boilerplate
2. Race - Parallel competition (same design, multiple runners)
   → Best for: medium-high complexity, want best implementation
3. Any% - Parallel exploration (different approaches)
   → Best for: unsure of architecture, want to compare designs
```

**Routing:**
- Option 1: Invoke `speed-run:turbo`
- Option 2: Invoke `speed-run:race`
- Option 3: Invoke `speed-run:any-percent`

## Skill Dependencies

| Subskill | Description |
|----------|-------------|
| `speed-run:turbo` | Direct hosted codegen via contract prompts |
| `speed-run:race` | Parallel same-design competition via hosted LLM |
| `speed-run:any-percent` | Parallel approach exploration via hosted LLM |

## When to Use Speed-Run vs Test Kitchen

| Situation | Use |
|-----------|-----|
| Want token savings on code generation | Speed-run |
| Generating algorithmic code (parsers, state machines) | Speed-run:turbo |
| Want parallel competition with fast generation | Speed-run:race |
| Want to explore approaches with fast generation | Speed-run:any% |
| No API key / don't want external LLM | Test Kitchen |
| CRUD / simple operations | Test Kitchen (Claude direct is cheaper) |
| Need 100% first-pass accuracy | Test Kitchen |

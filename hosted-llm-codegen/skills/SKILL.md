---
name: hosted-llm-codegen
description: Use hosted LLM (Cerebras) for code generation. Invoke when implementing code variants and user has opted for token-efficient generation. Requires MCP server configured with CEREBRAS_API_KEY.
---

# Hosted LLM Code Generation

Offload code generation to a hosted LLM (Cerebras). Claude writes the contract, hosted LLM implements the code, files are written directly to disk.

## When to Use

**Use this skill when:**
- Implementing algorithmic code (rate limiters, parsers, state machines)
- Generating multiple variants (3+)
- User is token-constrained
- Bulk boilerplate generation

**Use Claude direct when:**
- CRUD/storage operations (Claude is cheaper due to no fix overhead)
- Single implementation
- Speed-critical tasks
- Multi-file coordination needed

## Prerequisites

Before using, verify MCP is available:

```
mcp__hosted-llm-codegen__check_status
```

If this fails or returns error, fall back to Claude direct code generation.

## Tradeoffs

| Aspect | Claude Direct | Hosted LLM |
|--------|---------------|------------|
| Speed | ~10s | ~0.5s |
| Token Cost | Higher | ~90% savings |
| First-pass Quality | ~100% | 80-95% |
| Fixes Needed | 0 | 0-2 typical |

## Contract Prompt Template

When invoking the MCP tool, structure your prompt as:

```
Build [X] with [tech stack].

## DATA CONTRACT (use exactly these models):

[Pydantic models with exact field names and types]

Example:
class Task(BaseModel):
    id: str
    title: str
    completed: bool = False
    created_at: datetime

class TaskCreate(BaseModel):
    title: str

## API CONTRACT (use exactly these routes):

POST /tasks -> Task           # Create task
GET /tasks -> list[Task]      # List all tasks
GET /tasks/{id} -> Task       # Get single task
DELETE /tasks/{id} -> dict    # Delete task
POST /reset -> dict           # Reset state (for testing)

## ALGORITHM:

1. [Step-by-step logic for the implementation]
2. [Include state management details]
3. [Include edge case handling]

## RULES:

- Use FastAPI with uvicorn
- Store data in [storage mechanism]
- Return 404 for missing resources
- POST /reset must clear all state and return {"status": "ok"}
```

## MCP Tools

**Generate code and write files (primary tool):**
```
mcp__hosted-llm-codegen__generate_and_write_files
  prompt: [contract prompt above]
  output_dir: [target directory]
```

Returns only metadata (files written, line counts) - Claude never sees the generated code.

**Health check:**
```
mcp__hosted-llm-codegen__check_status
```

## What Hosted LLM Gets Right (~90%)

- Pydantic models match exactly
- Routes correct
- Core algorithm logic
- Basic error handling

## What Hosted LLM Gets Wrong (expect fixes)

| Error Type | Frequency | Fix Complexity |
|------------|-----------|----------------|
| Missing utility functions (reset_state) | Occasional | 4 lines |
| Logic edge cases | Occasional | 1-2 lines |
| Import ordering | Rare | 1 line |

## Fix Strategy

1. Generate code via MCP
2. Run tests
3. For failures: use **Claude Edit tool** (small surgical fixes)
4. Repeat steps 2-3 until pass

Typical fixes are 1-4 lines each. Even with fixes, total token cost is much lower than Claude generating everything.

## Example Workflow

```
1. Receive implementation task from omakase-off/cookoff

2. Check MCP availability:
   mcp__hosted-llm-codegen__check_status

3. If available, write contract:
   - Define exact Pydantic models
   - Define exact API routes
   - Write step-by-step algorithm
   - List technical rules

4. Call MCP:
   mcp__hosted-llm-codegen__generate_and_write_files
     prompt: [contract]
     output_dir: /path/to/variant/

5. Run tests:
   pytest /path/to/variant/

6. If failures, fix with Edit tool:
   - Read error message
   - Make surgical 1-4 line fix
   - Re-run tests

7. Report completion with test results
```

## Configuration

The MCP server uses these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `CEREBRAS_API_KEY` | (required) | Your API key |
| `CEREBRAS_MODEL` | `gpt-oss-120b` | Model to use |

Available models:

| Model | Price (in/out) | Speed | Notes |
|-------|----------------|-------|-------|
| `gpt-oss-120b` | $0.35/$0.75 | 3000 t/s | **Default** - best value, clean output |
| `llama-3.3-70b` | $0.85/$1.20 | 2100 t/s | Reliable fallback |
| `qwen-3-32b` | $0.40/$0.80 | 2600 t/s | Has verbose `<think>` tags |
| `llama3.1-8b` | $0.10/$0.10 | 2200 t/s | Cheapest, may need more fixes |

## Experimental Results (2026-01-30)

| Task Type | Hosted LLM Cost | Claude Cost | Winner |
|-----------|-----------------|-------------|--------|
| CRUD (3 variants) | 5% session | 3% session | Claude |
| Algorithmic (4 variants) | 2% session | 5% session | Hosted LLM |

**Key insight:** Hosted LLM saves 60% on algorithmic code even with occasional fix overhead.

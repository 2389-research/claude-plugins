---
name: turbo
description: Direct code generation via hosted LLM (Cerebras). Write a contract prompt, generate code, fix surgically. Part of speed-run pipeline.
---

# Turbo

Direct code generation via hosted LLM. Claude writes the contract, Cerebras implements the code, files are written directly to disk.

**Announce:** "I'm using speed-run:turbo for hosted code generation."

## When to Use

**Use turbo for:**
- Algorithmic code (rate limiters, parsers, state machines)
- Multiple files (3+)
- Boilerplate-heavy implementations
- Token-constrained sessions

**Use Claude direct instead for:**
- CRUD/storage operations (Claude is cheaper due to no fix overhead)
- Single implementation with complex coordination
- Speed-critical tasks where fix cycles are costly

## Tradeoffs

| Aspect | Claude Direct | Turbo (Hosted LLM) |
|--------|---------------|---------------------|
| Speed | ~10s | ~0.5s |
| Token Cost | Higher | ~90% savings |
| First-pass Quality | ~100% | 80-95% |
| Fixes Needed | 0 | 0-2 typical |

## Workflow

### Step 1: Write Contract Prompt

Structure your prompt with exact specifications:

```
Build [X] with [tech stack].

## DATA CONTRACT (use exactly these models):

[Pydantic models / interfaces with exact field names and types]

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

### Step 2: Generate Code

```
mcp__speed-run__generate_and_write_files
  prompt: [contract prompt]
  output_dir: [target directory]
```

Returns only metadata (files written, line counts). Claude never sees the generated code.

### Step 3: Run Tests

Run the test suite against generated code.

### Step 4: Fix (if needed)

For failures, use **Claude Edit tool** for surgical fixes (typically 1-4 lines each).

Common fixes:
| Error Type | Frequency | Fix Complexity |
|------------|-----------|----------------|
| Missing utility functions | Occasional | 4 lines |
| Logic edge cases | Occasional | 1-2 lines |
| Import ordering | Rare | 1 line |

### Step 5: Re-test

Repeat Steps 3-4 until all tests pass. Even with fixes, total token cost is much lower than Claude generating everything.

## What Hosted LLM Gets Right (~90%)

- Data models match contract exactly
- Routes/endpoints correct
- Core algorithm logic
- Basic error handling

## Configuration

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

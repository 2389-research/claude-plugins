# Speed-Run Plugin

Token-efficient code generation pipeline. Uses hosted LLM (Cerebras) for fast, cheap first-pass code generation with Claude handling architecture decisions and surgical fixes.

## Prerequisites

### Setup: CEREBRAS_API_KEY

Get a free API key at: https://cloud.cerebras.ai

Then set it using **either** method:

**Option A (recommended for Claude Code):** Add to `~/.claude/settings.json`:
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

Restart Claude Code after setting the key.

## Skills

| Skill | Description | When |
|-------|-------------|------|
| `speed-run` | Router - checks API key, presents options | Entry point |
| `speed-run:turbo` | Direct hosted codegen | Single task, write contract, generate |
| `speed-run:showdown` | Same design, parallel runners via hosted LLM | Competition between implementations |
| `speed-run:any-percent` | Explore approaches via hosted LLM | Multiple architectural approaches |

## Flow

```
User invokes "speed-run"
    |
    v
Check: mcp__speed-run__check_status
    |
    +-- No API key --> Show setup instructions, STOP
    |
    +-- OK --> Present options:
                1. Turbo    - direct codegen (single task)
                2. Showdown - parallel competition (same design)
                3. Any%     - parallel exploration (different approaches)
```

## How It Differs From Test Kitchen

| Aspect | Test Kitchen | Speed-Run |
|--------|-------------|-----------|
| Code generation | Claude direct | Hosted LLM (Cerebras) |
| API key required | No | Yes (CEREBRAS_API_KEY) |
| Token cost | Standard | ~60% savings on algorithmic code |
| Generation speed | ~10s per file | ~0.5s per file |
| First-pass quality | ~100% | 80-95% (Claude fixes the rest) |
| Best for | Any task | Algorithmic code, boilerplate, multi-variant |

## File Output Format

The speed-run MCP server expects generated code in **XML-style tags** (primary format):

```text
<FILE path="src/main.py">
[code here]
</FILE>
```

If generated code contains literal triple backticks, use `TRIPLE_BACKTICK` as a placeholder — it's auto-replaced after extraction.

Two legacy fallback formats are also supported but **not recommended**:
- `### FILE: path` with fenced code blocks
- `### FILE: path` with raw content

**Note:** The `hosted-llm-codegen` plugin uses the legacy `### FILE:` format as its primary. The two plugins are not interchangeable — prompts generated for one may not parse correctly with the other.

## Skill Dependencies

| Dependency | Usage |
|------------|-------|
| `speed-run:judge` | Scoring framework for showdown/any% (bundled) |
| `superpowers:dispatching-parallel-agents` | Parallel dispatch for showdown/any% |
| `superpowers:using-git-worktrees` | Isolated workspaces for showdown/any% |
| `superpowers:verification-before-completion` | Verify before claiming done |
| `fresh-eyes-review:skills` | Quality gate before comparison |

# Hosted LLM code generation

Offload code generation to a hosted LLM (Cerebras), saving ~60% tokens on algorithmic tasks.

## Installation

```bash
# 1. Set your API key (get free key at https://cloud.cerebras.ai)
export CEREBRAS_API_KEY="your-key"

# 2. Build the Docker image
cd hosted-llm-codegen/mcp
docker build -t hosted-llm-codegen:latest .

# 3. Register the MCP server
claude mcp add --transport stdio \
  hosted-llm-codegen \
  -- /path/to/hosted-llm-codegen/mcp/run.sh /path/to/workspace

# 4. Symlink the skill
ln -s /path/to/hosted-llm-codegen/skills ~/.claude/skills/hosted-llm-codegen
```

## What this plugin provides

Two pieces:
1. A skill (`hosted-llm-codegen`) with instructions for when and how to use hosted LLM code generation
2. An MCP server -- a Dockerized service that calls the Cerebras API and writes files directly

## When to use

Use the hosted LLM for algorithmic code (rate limiters, parsers, state machines), generating multiple variants (3+), token-constrained sessions, and bulk boilerplate.

Use Claude directly for CRUD/storage operations, single implementations, and multi-file coordination.

## MCP tools

| Tool | Description |
|------|-------------|
| `generate` | Generate text/code, returns content |
| `generate_and_write_files` | Generate code and write to disk, returns only metadata |
| `check_status` | Verify Cerebras API connectivity |

## Quick example

```text
1. Check MCP: mcp__hosted-llm-codegen__check_status
2. Write contract prompt with DATA CONTRACT + API CONTRACT + ALGORITHM + RULES
3. Call: mcp__hosted-llm-codegen__generate_and_write_files
4. Run tests, apply surgical fixes if needed
```

## Documentation

- [CLAUDE.md](CLAUDE.md) -- detailed setup instructions
- [skills/SKILL.md](skills/SKILL.md) -- skill documentation
- [TODO.md](TODO.md) -- future installation automation plans

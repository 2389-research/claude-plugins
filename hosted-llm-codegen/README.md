# Hosted LLM Code Generation

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

## What This Plugin Provides

1. **Skill** (`hosted-llm-codegen`) - Instructions for when/how to use hosted LLM code generation
2. **MCP Server** - Dockerized service that calls Cerebras API and writes files directly

## Skills Included

| Skill | Description |
|-------|-------------|
| `hosted-llm-codegen` | Contract-based code generation via Cerebras API |

## When to Use

**Use hosted LLM for:**
- Algorithmic code (rate limiters, parsers, state machines)
- Generating multiple variants (3+)
- Token-constrained sessions
- Bulk boilerplate generation

**Use Claude direct for:**
- CRUD/storage operations
- Single implementations
- Multi-file coordination

## MCP Tools

| Tool | Description |
|------|-------------|
| `generate` | Generate text/code, returns content |
| `generate_and_write_files` | Generate code and write to disk, returns only metadata |
| `check_status` | Verify Cerebras API connectivity |

## Quick Example

```text
1. Check MCP: mcp__hosted-llm-codegen__check_status
2. Write contract prompt with DATA CONTRACT + API CONTRACT + ALGORITHM + RULES
3. Call: mcp__hosted-llm-codegen__generate_and_write_files
4. Run tests, apply surgical fixes if needed
```

## Documentation

- [CLAUDE.md](CLAUDE.md) - Detailed setup instructions
- [skills/SKILL.md](skills/SKILL.md) - Complete skill documentation
- [TODO.md](TODO.md) - Future installation automation plans

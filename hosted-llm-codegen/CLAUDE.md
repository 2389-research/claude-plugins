# Hosted LLM Code Generation

This plugin provides code generation via hosted LLM (Cerebras), saving Claude tokens by offloading code writing to an external model.

## What This Plugin Provides

1. **Skill** (`hosted-llm-codegen`) - Instructions for when/how to use hosted LLM code generation
2. **MCP Server** - Dockerized service that calls Cerebras API and writes files directly

## Setup

### 1. Set your API key

Add to `~/.zshrc`:
```bash
export CEREBRAS_API_KEY="your-api-key-here"
```

Get a free key at: https://cloud.cerebras.ai

### 2. Build the Docker image

```bash
cd /path/to/claude-plugins/hosted-llm-codegen/mcp
docker build -t hosted-llm-codegen:latest .
```

### 3. Register the MCP server

```bash
claude mcp add --transport stdio \
  hosted-llm-codegen \
  -- /path/to/claude-plugins/hosted-llm-codegen/mcp/run.sh /path/to/your/workspace
```

Or add to `~/.claude/mcp.json`:
```json
{
  "mcpServers": {
    "hosted-llm-codegen": {
      "command": "/path/to/claude-plugins/hosted-llm-codegen/mcp/run.sh",
      "args": ["/Users/yourname/projects"]
    }
  }
}
```

The `args` should be the root directory where you want files written.

### 4. Symlink the skill (if not already done)

```bash
ln -s /path/to/claude-plugins/hosted-llm-codegen/skills ~/.claude/skills/hosted-llm-codegen
```

### 5. Restart Claude Code

The MCP server will auto-start when needed.

## MCP Tools

| Tool | Description |
|------|-------------|
| `generate` | Generate text/code, returns content |
| `generate_and_write_files` | Generate code and write to disk, returns only metadata |
| `check_status` | Verify Cerebras API connectivity |

## How It Works

```
Claude Code
    │
    ▼
run.sh (wrapper)
    │
    ▼
Docker Container
    ├── Calls Cerebras API
    ├── Writes files to /workspace (mounted volume)
    └── Returns metadata only (not code)
    │
    ▼
Files appear on host filesystem
```

Claude never sees the generated code - only the metadata (file names, line counts).

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CEREBRAS_API_KEY` | (required) | Your Cerebras API key |
| `CEREBRAS_MODEL` | `gpt-oss-120b` | Model to use |
| `GENERATION_TIMEOUT` | `120` | Request timeout in seconds |

## Available Models

| Model | Price (in/out) | Speed | Notes |
|-------|----------------|-------|-------|
| `gpt-oss-120b` | $0.35/$0.75 | 3000 t/s | **Default** - best value, clean output |
| `llama-3.3-70b` | $0.85/$1.20 | 2100 t/s | Reliable fallback |
| `qwen-3-32b` | $0.40/$0.80 | 2600 t/s | Has verbose `<think>` tags |
| `llama3.1-8b` | $0.10/$0.10 | 2200 t/s | Cheapest, may need more fixes |

## Why Docker?

- **Isolation** - LLM can't damage host filesystem outside mounted volume
- **Consistency** - Same environment everywhere
- **No dependency management** - No Python version conflicts
- **Security** - Sandboxed execution

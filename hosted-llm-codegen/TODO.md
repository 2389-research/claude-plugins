# TODO: hosted-llm-codegen

## Installation Flow (Future Work)

Currently, users must manually:
1. Install dependencies: `pip install -r mcp/requirements.txt`
2. Set `CEREBRAS_API_KEY` in `~/.zshrc`
3. Add MCP server to `~/.claude/mcp.json` or run `claude mcp add`
4. Symlink skill to `~/.claude/skills/`

### Future: Extend install.sh

The main `claude-plugins/install.sh` could be extended to:
- Auto-symlink all skills
- Detect MCP servers in plugins and register them
- Prompt for API keys when needed (like `gh auth login` pattern)
- Store keys in shell profile

### Example flow to implement:
```bash
./install.sh

# Output:
# ✓ Permissions configured
# ✓ Skills symlinked (12 plugins)
#
# MCP Server: hosted-llm-codegen
#   Requires: CEREBRAS_API_KEY
#   Get your free key at: https://cloud.cerebras.ai
#   Enter API key (or press enter to skip): ____
#
# ✓ MCP servers registered
```

This is low priority - manual setup works fine for now.

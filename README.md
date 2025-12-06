# 2389 Research Plugins

Claude Code plugins and MCP servers we use at [2389](https://2389.ai).

## Installation

Add the marketplace:

```bash
/plugin marketplace add 2389-research/claude-plugins
```

Install plugins individually:

```bash
/plugin install css-development@2389-research
/plugin install firebase-development@2389-research
/plugin install terminal-title@2389-research
/plugin install workflows@2389-research
```

## Available Plugins

| Plugin | Description | Documentation |
|--------|-------------|---------------|
| [css-development](css-development/) | CSS development workflows with Tailwind composition, semantic naming, and dark mode by default | [README](css-development/README.md) |
| [firebase-development](firebase-development/) | Firebase project workflows including setup, features, debugging, and validation | [README](firebase-development/README.md) |
| [terminal-title](terminal-title/) | Automatically updates terminal title with emoji + project + topic context | [README](terminal-title/README.md) |
| [workflows](workflows/) | 2389 workflow conventions including terminal title updates and TodoWrite patterns | [README](workflows/README.md) |

## External MCP Servers

This marketplace also lists external MCP servers:

- **agent-drugs** - Digital drugs that modify AI behavior through prompt injection
- **socialmedia** - Social media functionality for AI agents
- **journal** - Private journaling capability for Claude

## Marketplace Site

Browse the marketplace: [https://2389-research.github.io/claude-plugins](https://2389-research.github.io/claude-plugins)

## Repository Structure

This is a monorepo containing multiple independent plugins. Each plugin:

- Lives in its own directory (`css-development/`, `firebase-development/`, etc.)
- Has its own `.claude-plugin/plugin.json` configuration
- Contains its own skills, docs, and tests
- Can be installed independently

See [CLAUDE.md](CLAUDE.md) for developer documentation on the monorepo structure and conventions.

## Contributing

### Adding a New Plugin

1. Create plugin directory: `mkdir -p new-plugin/.claude-plugin`
2. Write `new-plugin/.claude-plugin/plugin.json`
3. Add skills to `new-plugin/skills/`
4. Create `new-plugin/README.md` and `new-plugin/CLAUDE.md`
5. Update `.claude-plugin/marketplace.json` with new plugin entry
6. Regenerate marketplace site: `npm run generate`

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for comprehensive development guide.

## Contact

Want to chat about these plugins or how we use Claude Code?

**Email us:** [hello@2389.ai](mailto:hello@2389.ai)

We'd love to hear from you!

## Resources

- **Claude Code Documentation:** https://code.claude.com/docs
- **Skills Guide:** https://code.claude.com/docs/en/skills
- **Plugin Development:** https://code.claude.com/docs/en/plugins

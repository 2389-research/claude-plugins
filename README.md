# 2389 Internal Development Marketplace

Internal development marketplace for 2389.ai tooling - includes the 2389 skills plugin and curated MCP servers.

## Quick Start

### Installing the 2389 Skills Plugin (Local Development)

For active development on the skills:

```bash
# Clone the repository
git clone https://github.com/2389-research/claude-plugins.git
cd claude-plugins

# Create symlink to Claude skills directory
ln -s "$(pwd)/skills" ~/.claude/skills/2389

# Set executable permissions on scripts
./install.sh
```

After changes to skills, restart Claude Code to reload.

### Installing from Marketplace

To install as a regular plugin:

```bash
# Add the marketplace
/plugin marketplace add 2389-research/claude-plugins

# Install the 2389 skills plugin
/plugin install 2389

# Or install external MCP servers
/plugin install socialmedia
/plugin install journal
/plugin install agent-drugs
```

## What's Included

### 2389 Skills Plugin (Local)

- **css-development** - CSS development workflows with Tailwind composition, dark mode, semantic naming
- **firebase-development** - Firebase project setup, feature development, debugging, validation
- **terminal-title** - Automatic terminal title updates with emoji + project + topic context
- **using-2389-skills** - Meta-skill establishing mandatory workflows for 2389 skills

### External MCP Servers

- **socialmedia** - Team communication and activity feed
- **journal** - Private journaling for notes and reflections
- **agent-drugs** - Enhanced capabilities and utilities

## Browse Plugins

Visit [https://2389-research.github.io/claude-plugins](https://2389-research.github.io/claude-plugins) to browse all available plugins.

## Development

For comprehensive development documentation, see:

- **CLAUDE.md** - Repository structure, architecture, conventions, troubleshooting
- **docs/DEVELOPMENT.md** - Detailed skills development guide with examples and patterns

Quick reference for common tasks:

```bash
# Test skills locally
cp -r skills/* ~/.claude/skills/

# Regenerate marketplace site
npm run generate

# See integration tests
ls tests/integration/
```

## License

MIT

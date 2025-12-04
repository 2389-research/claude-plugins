# 2389 Internal Development Marketplace

Internal development marketplace for 2389.ai tooling - includes the 2389 skills plugin and curated MCP servers.

## Quick Start

### Installing from Marketplace (Standard)

```bash
# Add the marketplace
/plugin marketplace add 2389-research/claude-plugins

# Install the 2389 skills plugin
/plugin install 2389
```

### Installing MCP Servers

```bash
# Install external MCP servers from the marketplace
/plugin install socialmedia
/plugin install journal
/plugin install agent-drugs
```

## Local Development

When developing skills locally, there's a gotcha: the marketplace.json points to the GitHub URL, so `/plugin install 2389` fetches from remote - not your local changes.

**The workaround:** Symlink the plugin cache to your local repo.

### Setup for Local Development

```bash
# 1. Clone the repo (if you haven't already)
git clone https://github.com/2389-research/claude-plugins.git ~/work/2389/claude-plugins
cd ~/work/2389/claude-plugins

# 2. Add the marketplace (pointing to your local clone)
/plugin marketplace add ~/work/2389/claude-plugins

# 3. Install the plugin (this fetches from GitHub, not local)
/plugin install 2389

# 4. Replace the cache with a symlink to your local repo
rm -rf ~/.claude/plugins/cache/2389
ln -s ~/work/2389/claude-plugins ~/.claude/plugins/cache/2389

# 5. Set up permissions
./install.sh

# 6. Restart Claude Code
```

### Important Notes

- **Don't run `/plugin update 2389`** - it will blow away your symlink and re-fetch from GitHub
- Changes to skills take effect after restarting Claude Code
- The symlink makes Claude Code read directly from your working directory

### Verifying It Works

After setup, check that skills are loading:
```
/skills
```

You should see `2389:css-development`, `2389:firebase-development`, `2389:terminal-title`, and `2389:using-2389-skills` in the list.

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

## Documentation

- **CLAUDE.md** - Repository structure, architecture, conventions, troubleshooting
- **docs/DEVELOPMENT.md** - Detailed skills development guide with examples and patterns
- **tests/integration/** - Manual test scenarios for skill routing

## License

MIT

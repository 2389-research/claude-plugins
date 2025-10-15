# 2389 Research Plugin Marketplace

Curated plugins for Claude Code.

## Using the Marketplace

Add this marketplace to Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
```

Then install any plugin:

```
/plugin install agent-drugs
```

## Available Plugins

Visit [https://2389-research.github.io/claude-plugins](https://2389-research.github.io/claude-plugins) to browse available plugins.

## Submitting a Plugin

1. Fork this repository
2. Add your plugin entry to `.claude-plugin/marketplace.json`
3. Submit a pull request

### Required Fields

```json
{
  "name": "plugin-name",
  "displayName": "Plugin Display Name",
  "description": "One-line description of what the plugin does",
  "version": "1.0.0",
  "author": "Your Name or Organization",
  "repository": "https://github.com/your-org/your-plugin",
  "homepage": "https://your-plugin-site.com",
  "installUrl": "https://github.com/your-org/your-plugin"
}
```

### Review Process

- All submissions are manually reviewed
- Plugins must have a valid `.claude-plugin/plugin.json` file
- Plugins must be publicly accessible
- Plugins must not contain malicious code

## How It Works

1. Plugins are listed in `.claude-plugin/marketplace.json`
2. On merge, GitHub Actions generates a static site from the catalog
3. GitHub Pages serves the site at `/docs`
4. Claude Code reads the marketplace.json to install plugins

## License

MIT

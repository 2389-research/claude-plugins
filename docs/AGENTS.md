# Agents guide — 2389 Research Claude Code Plugin Marketplace

This site is the official catalog of Claude Code plugins and MCP servers from 2389 Research Inc. It is generated from `.claude-plugin/marketplace.json` in [2389-research/claude-plugins](https://github.com/2389-research/claude-plugins).

## What's here

- The homepage at [https://skills.2389.ai/](https://skills.2389.ai/) lists every plugin grouped into Development, Infrastructure, Agent Systems, and Personal & Strategy.
- Each plugin has its own page under `/plugins/{name}/` with the full README, install command, and source link.
- A [glossary](https://skills.2389.ai/glossary/) defines marketplace-specific terms (plugin, skill, MCP server, hook, scorecard).
- Machine-readable index files: [sitemap.xml](https://skills.2389.ai/sitemap.xml), [sitemap.md](https://skills.2389.ai/sitemap.md), [llms.txt](https://skills.2389.ai/llms.txt).
- Every HTML page advertises a markdown mirror via `<link rel="alternate" type="text/markdown" href="…/index.md">`. Fetch the `index.md` URL directly for the markdown copy.

## Install a plugin

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install 2389-research/<plugin-name>
```

## a14y configuration

- Target URL: https://skills.2389.ai/
- Scorecard: 0.2.0
- Mode: site
- Last runs:
  - 2026-05-19 — baseline 67 (scorecard 0.2.0)

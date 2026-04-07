<!-- ABOUTME: Marketplace hub for 2389 Research Claude Code plugins -->
<!-- ABOUTME: Contains plugin registry, site generator, and marketplace website -->

# 2389 Research Claude Code Plugin Marketplace

## Repository Purpose

This is a **marketplace catalog** for Claude Code plugins maintained by 2389 Research. It contains the plugin registry, site generator, and generated marketplace website. All plugins live in their own GitHub repos under `2389-research/`.

## Structure

```
claude-plugins/
├── .claude-plugin/
│   └── marketplace.json          # Plugin registry (all entries)
├── scripts/
│   └── generate-site.js          # Fetches READMEs from GitHub, builds site
├── docs/
│   ├── index.html                # Generated marketplace site
│   └── style.css                 # Site styling
├── tests/                        # Site generator tests
├── .github/
│   └── workflows/
│       └── generate-site.yml     # CI: regenerates site on push + weekly
├── package.json
├── CLAUDE.md                     # This file
└── README.md
```

## Available Plugins

### Development

| Plugin | Repo | Description |
|--------|------|-------------|
| css-development | [2389-research/css-development](https://github.com/2389-research/css-development) | CSS development workflows with Tailwind composition, semantic naming, and dark mode by default |
| firebase-development | [2389-research/firebase-development](https://github.com/2389-research/firebase-development) | Firebase project workflows including setup, features, debugging, and validation |
| landing-page-design | [2389-research/landing-page-design](https://github.com/2389-research/landing-page-design) | High-converting landing pages with Vibe Discovery and anti-AI-slop principles |
| xtool | [2389-research/xtool](https://github.com/2389-research/xtool) | Xcode-free iOS development with xtool via SwiftPM |
| building-multiagent-systems | [2389-research/building-multiagent-systems](https://github.com/2389-research/building-multiagent-systems) | Architecture patterns for multi-agent systems |
| speed-run | [2389-research/speed-run](https://github.com/2389-research/speed-run) | Token-efficient code generation with hosted LLM (Cerebras) |
| binary-re | [2389-research/binary-re](https://github.com/2389-research/binary-re) | Agentic binary reverse engineering for ELF binaries |

### Testing and Quality

| Plugin | Repo | Description |
|--------|------|-------------|
| test-kitchen | [2389-research/test-kitchen](https://github.com/2389-research/test-kitchen) | Parallel exploration of implementation approaches |
| simmer | [2389-research/simmer](https://github.com/2389-research/simmer) | Iterative artifact refinement with investigation-first judge board |
| scenario-testing | [2389-research/scenario-testing](https://github.com/2389-research/scenario-testing) | End-to-end testing with real dependencies, no mocks |
| fresh-eyes-review | [2389-research/fresh-eyes-review](https://github.com/2389-research/fresh-eyes-review) | Final sanity check before commits/PRs |
| documentation-audit | [2389-research/documentation-audit](https://github.com/2389-research/documentation-audit) | Verify documentation claims against codebase reality |
| review-squad | [2389-research/review-squad](https://github.com/2389-research/review-squad) | Dispatch panels of specialized subagents to review projects |
| prbuddy | [2389-research/prbuddy](https://github.com/2389-research/prbuddy) | PR health assistant -- monitors CI, triages review comments |
| git-repo-prep | [2389-research/git-repo-prep](https://github.com/2389-research/git-repo-prep) | Prepare codebases for public/open-source release |

### Business and Strategy

| Plugin | Repo | Description |
|--------|------|-------------|
| ceo-personal-os | [2389-research/ceo-personal-os](https://github.com/2389-research/ceo-personal-os) | Personal operating system for executives with reflection frameworks |
| gtm-partner | [2389-research/gtm-partner](https://github.com/2389-research/gtm-partner) | Strategic go-to-market partner |
| product-launcher | [2389-research/product-launcher](https://github.com/2389-research/product-launcher) | Generate launch materials for 2389.ai products |
| worldview-synthesis | [2389-research/worldview-synthesis](https://github.com/2389-research/worldview-synthesis) | Systematic worldview articulation |
| deliberation | [2389-research/deliberation](https://github.com/2389-research/deliberation) | Decision-making through deliberation and discernment |
| summarize-meetings | [2389-research/summarize-meetings](https://github.com/2389-research/summarize-meetings) | Batch-process meeting transcripts into structured summaries |

### Utilities

| Plugin | Repo | Description |
|--------|------|-------------|
| terminal-title | [2389-research/terminal-title](https://github.com/2389-research/terminal-title) | Auto-update terminal title with emoji + project + topic context |
| remote-system-maintenance | [2389-research/remote-system-maintenance](https://github.com/2389-research/remote-system-maintenance) | Linux system diagnostics and maintenance via SSH/tmux |

### MCP Servers

| Server | Repo | Description |
|--------|------|-------------|
| agent-drugs | [2389-research/agent-drugs](https://github.com/2389-research/agent-drugs) | Digital drugs that modify AI behavior through prompt injection |
| socialmedia | [2389-research/mcp-socialmedia](https://github.com/2389-research/mcp-socialmedia) | Social media functionality for AI agents |
| journal | [2389-research/journal-mcp](https://github.com/2389-research/journal-mcp) | Private journaling capability for Claude |
| slack-mcp | [2389-research/slack-mcp](https://github.com/2389-research/slack-mcp) | Slack workspace integration MCP server |

## Adding a Plugin to the Marketplace

### Step 1: Create the plugin in its own GitHub repo

Create a repo under `2389-research/` following the standard plugin structure (`.claude-plugin/plugin.json`, `skills/`, `CLAUDE.md`, `README.md`).

### Step 2: Add entry to marketplace.json

Edit `.claude-plugin/marketplace.json` and add an entry to the `plugins` array:

```json
{
  "name": "my-plugin",
  "source": {
    "source": "url",
    "url": "https://github.com/2389-research/my-plugin"
  },
  "description": "One-sentence description (used for auto-detection)",
  "version": "1.0.0",
  "keywords": ["relevant", "keywords"],
  "strict": false
}
```

### Step 3: Regenerate the marketplace site

```bash
npm run generate
```

### Step 4: Commit and push

```bash
git add .claude-plugin/marketplace.json docs/index.html
git commit -m "feat: add my-plugin to marketplace"
```

## marketplace.json Format

```json
{
  "name": "2389-research-marketplace",
  "owner": {
    "name": "2389 Research Inc",
    "email": "hello@2389.ai",
    "url": "https://2389.ai"
  },
  "metadata": {
    "description": "Plugins and MCP servers we use at 2389",
    "version": "2.0.0"
  },
  "plugins": [
    {
      "name": "plugin-name",
      "source": {
        "source": "url",
        "url": "https://github.com/2389-research/plugin-name"
      },
      "description": "What this plugin does",
      "version": "1.0.0",
      "keywords": ["tag1", "tag2"],
      "strict": false
    }
  ]
}
```

**Fields:**
- `name` -- Plugin identifier, matches the GitHub repo name
- `source.url` -- GitHub URL for the plugin repo
- `description` -- One-sentence description, used for marketplace display and auto-detection
- `version` -- Semver version string
- `keywords` -- Tags for categorization and search
- `strict` -- Whether the plugin requires strict mode (`true` for MCP servers)

## Site Generation

The marketplace site is generated from `marketplace.json` by fetching each plugin's README from GitHub.

```bash
# Generate the site
npm run generate

# Or directly
node scripts/generate-site.js
```

Output goes to `docs/index.html`, served via GitHub Pages at https://2389-research.github.io/claude-plugins

## GitHub Actions

The workflow at `.github/workflows/generate-site.yml` regenerates the site:
- On push to `main`
- On a weekly schedule

The generated `docs/index.html` is committed back to the repo automatically.

## Troubleshooting

### Marketplace site not updating

1. Run `npm run generate` locally
2. Verify `.claude-plugin/marketplace.json` is valid JSON
3. Check that plugin GitHub URLs are accessible
4. Check GitHub Actions logs for errors

### Plugin not appearing in marketplace

1. Verify the entry exists in `.claude-plugin/marketplace.json`
2. Check that the `source.url` points to a valid GitHub repo
3. Regenerate the site: `npm run generate`

## Resources

- **Marketplace Site:** https://2389-research.github.io/claude-plugins
- **GitHub:** https://github.com/2389-research/claude-plugins
- **Claude Code Plugins Guide:** https://docs.claude.com/en/docs/claude-code/plugins

# Monorepo to Multi-Repo Split

## Summary

Split the `2389-research/claude-plugins` monorepo (27 plugins) into individual GitHub repositories, one per plugin. The monorepo becomes a marketplace-only hub containing the catalog, site generator, and generated marketplace site.

## Motivation

- **Independent versioning** — each plugin gets its own release cycle, changelog, and semver
- **Community contributions** — external contributors submit PRs to individual plugins
- **Installation simplicity** — `plugin install 2389-research/{name}` without the monorepo
- **Discoverability** — each plugin gets its own GitHub repo with stars, topics, README
- **Modularity** — other teams/companies fork individual plugins
- **CI speed** — no more touching everything on every push

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Repo naming | `2389-research/{plugin-name}` | Short, clean, no prefix clutter |
| Git history | Preserve via `git filter-repo` | Keep blame, commit context |
| Monorepo fate | Becomes marketplace hub | Catalog + site generator only |
| Meta plugins | Dependency references in plugin.json | Explicit list of bundled plugin repos |
| Site generation | Fetch READMEs at build time via `gh api` | Rich plugin pages, decoupled from filesystem |
| Automation | Single script using filter-repo + gh CLI | 28 plugins is too many for manual work |

## New Repo Structure

Each of the 28 plugins becomes `2389-research/{plugin-name}`:

```
2389-research/{plugin-name}/
├── .claude-plugin/
│   └── plugin.json
├── skills/
├── docs/
├── tests/
├── CLAUDE.md
├── README.md
└── LICENSE              # MIT
```

The 3 external MCP servers (agent-drugs, mcp-socialmedia, journal-mcp) are already separate repos — no action needed.

## Marketplace Hub (Post-Split)

`2389-research/claude-plugins` stripped to:

```
claude-plugins/
├── .claude-plugin/
│   └── marketplace.json      # All sources become GitHub URLs
├── scripts/
│   ├── generate-site.js      # Fetches READMEs via gh api
│   └── generate-og-images.js
├── docs/                     # Generated marketplace site (GitHub Pages)
├── .github/
│   └── workflows/
│       └── generate-site.yml
├── CLAUDE.md                 # Updated for marketplace-only scope
├── README.md
├── package.json
└── LICENSE
```

### marketplace.json Source Format Change

Every local plugin entry changes from:

```json
{ "source": "./simmer" }
```

to:

```json
{ "source": { "source": "url", "url": "https://github.com/2389-research/simmer" } }
```

This matches the format already used by external MCP servers (agent-drugs, socialmedia, journal).

## Meta Plugin Dependencies

The 3 meta plugins (better-dev, botboard-biz, sysadmin) become their own repos. Their `plugin.json` gains a `dependencies` field:

```json
{
  "name": "better-dev",
  "description": "[meta] better development...",
  "version": "1.0.0",
  "dependencies": [
    "2389-research/css-development",
    "2389-research/firebase-development",
    "2389-research/fresh-eyes-review",
    "2389-research/scenario-testing",
    "2389-research/test-kitchen",
    "2389-research/documentation-audit",
    "2389-research/speed-run"
  ]
}
```

If Claude Code does not resolve `dependencies` automatically, the CLAUDE.md in each meta plugin instructs the user to install them manually.

## Split Script

`scripts/split-to-repos.sh` — a single automation script that handles the full pipeline.

### Per-Plugin Steps

```
For each plugin directory listed in marketplace.json with a local source:
  1. gh repo create 2389-research/{name} --public --description "{desc}"
  2. Clone the monorepo to a temp directory
  3. git filter-repo --subdirectory-filter {plugin-dir}
  4. git remote add origin git@github.com:2389-research/{name}.git
  5. git push -u origin main
  6. Add MIT LICENSE if missing
  7. Set GitHub topics from marketplace.json keywords via gh api
```

### Post-Split Cleanup Steps

```
  1. Update marketplace.json — swap all local sources to GitHub URLs
  2. Update generate-site.js to fetch READMEs via gh api
  3. Remove all plugin directories from the monorepo
  4. Update CLAUDE.md and README.md for marketplace-only scope
  5. Regenerate the marketplace site
  6. Commit the cleaned-up marketplace hub
```

### Properties

- **Idempotent** — if a repo already exists, skip creation and push
- **Prerequisites** — `git-filter-repo` (`brew install git-filter-repo`), `gh` CLI authenticated
- **Incremental** — can be run partially and resumed

## Site Generator Updates

The site generator (`scripts/generate-site.js`) changes from reading local README.md files to fetching them at build time:

1. For each plugin in marketplace.json, run `gh api repos/2389-research/{name}/readme --jq .content | base64 -d`
2. Feed fetched README content into the site generator alongside marketplace.json metadata
3. Graceful fallback — if a repo README is unavailable, generate the page from marketplace.json metadata only (description, keywords, install command)

### Install Command Change

Plugin pages update from:
```
/plugin install {name}@2389-research
```
to:
```
/plugin install 2389-research/{name}
```

## GitHub Actions Updates

The existing `generate-site.yml` workflow stays in the marketplace hub. It needs:

1. A `GH_TOKEN` or `GITHUB_TOKEN` with read access to the plugin repos (for README fetching)
2. Updated `generate-site.js` invocation (no local plugin dirs to read)
3. Possibly a scheduled trigger (daily/weekly) to pick up README changes in plugin repos, in addition to the existing push-to-main trigger

## Plugins To Split (27 total)

Note: `hosted-llm-codegen` exists as a directory but is not listed in marketplace.json — it's a component of `speed-run`, not a standalone plugin. It will be included in the `speed-run` repo or handled separately.

### Meta Plugins (3)
1. better-dev
2. botboard-biz
3. sysadmin

### Development & Testing (10)
4. css-development
5. firebase-development
6. fresh-eyes-review
7. documentation-audit
8. scenario-testing
9. test-kitchen
10. simmer
11. git-repo-prep
12. prbuddy
13. speed-run

### Infrastructure & Operations (5)
14. xtool
15. binary-re
16. remote-system-maintenance
17. terminal-title
18. slack-mcp

### Agent Systems (3)
19. building-multiagent-systems
20. review-squad
21. deliberation

### Design & Product (3)
22. landing-page-design
23. product-launcher
24. gtm-partner

### Personal & Reflection (3)
25. ceo-personal-os
26. worldview-synthesis
27. summarize-meetings

## Out of Scope

- Migrating GitHub Issues (none significant in monorepo)
- Setting up per-plugin CI/CD (can be added per-repo later)
- Changing the marketplace site domain or hosting
- Modifying plugin internals or skill content

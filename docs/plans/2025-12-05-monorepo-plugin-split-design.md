# Monorepo Plugin Split Design

**Date:** 2025-12-05
**Status:** Approved
**Author:** Harper (Doctor Biz) + Claude

## Summary

Transform the `claude-plugins` repository from a single monolithic plugin into a monorepo containing five independent plugins. Users can install plugins individually, choosing only the functionality they need.

## Current State

The repository contains:
- Single plugin named "2389" with all skills embedded
- Four skill categories: css-development, firebase-development, terminal-title, using-2389-skills
- Marketplace catalog listing both internal plugin and external MCP servers
- Documentation, tests, and build tooling at root

## Proposed Structure

### Directory Layout

```
claude-plugins/
├── .claude-plugin/
│   └── marketplace.json          # Catalog referencing all plugins
│
├── css-development/              # Plugin 1
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/
│   │   ├── SKILL.md
│   │   ├── create-component/
│   │   ├── validate/
│   │   └── refactor/
│   ├── docs/
│   │   ├── plans/
│   │   └── examples/
│   ├── tests/integration/
│   ├── CLAUDE.md
│   └── README.md
│
├── firebase-development/         # Plugin 2
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/
│   ├── docs/
│   ├── tests/
│   ├── CLAUDE.md
│   └── README.md
│
├── terminal-title/               # Plugin 3
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/
│   ├── hooks/
│   │   └── hooks.json
│   ├── CLAUDE.md
│   └── README.md
│
├── workflows/                    # Plugin 4 (renamed from using-2389-skills)
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/
│   ├── CLAUDE.md
│   └── README.md
│
├── docs/
│   ├── index.html               # Generated marketplace site
│   ├── style.css
│   └── DEVELOPMENT.md           # General skills development guide
│
├── scripts/
│   └── generate-site.js
│
├── package.json
├── install.sh
├── CLAUDE.md                    # Monorepo structure and conventions
└── README.md                    # Marketplace landing page
```

### Repository Naming

All repositories live under `2389-research` organization:
- `2389-research/claude-plugins` (this monorepo)
- Plugin names omit "2389" prefix: `css-development`, `firebase-development`, etc.
- Full URLs: `github.com/2389-research/css-development` (not used; plugins reference relative paths)

## Component Details

### Marketplace Configuration

The root `.claude-plugin/marketplace.json` references plugins via relative paths:

```json
{
  "name": "2389-research-marketplace",
  "owner": {
    "name": "2389 Research",
    "email": "dev@2389.ai"
  },
  "metadata": {
    "description": "Internal development marketplace for 2389 - skills and workflows",
    "version": "2.0.0"
  },
  "plugins": [
    {
      "name": "css-development",
      "source": "./css-development",
      "description": "CSS development workflows with Tailwind composition, semantic naming, and dark mode by default",
      "version": "1.0.0",
      "keywords": ["css", "tailwind", "styling", "components", "dark-mode"],
      "strict": false
    },
    {
      "name": "firebase-development",
      "source": "./firebase-development",
      "description": "Firebase project workflows including setup, features, debugging, and validation",
      "version": "1.0.0",
      "keywords": ["firebase", "firestore", "cloud-functions", "hosting", "emulator"],
      "strict": false
    },
    {
      "name": "terminal-title",
      "source": "./terminal-title",
      "description": "Automatically updates terminal title with emoji + project + topic context",
      "version": "1.0.0",
      "keywords": ["terminal", "title", "session", "context"],
      "strict": false
    },
    {
      "name": "workflows",
      "source": "./workflows",
      "description": "2389 workflow conventions including terminal title updates and TodoWrite patterns",
      "version": "1.0.0",
      "keywords": ["workflows", "conventions", "todowrite", "patterns"],
      "strict": false
    }
  ]
}
```

External MCP servers (socialmedia, journal, agent-drugs) remain in the catalog with their existing git URLs.

### Plugin Installation

Users add the marketplace once:
```bash
/plugin marketplace add 2389-research/claude-plugins
```

Then install individual plugins:
```bash
/plugin install css-development@2389-research
/plugin install firebase-development@2389-research
/plugin install workflows@2389-research
```

Each plugin functions independently. Users choose which to install.

### Documentation Organization

**Root Level:**
- `README.md` - Marketplace overview, installation instructions, plugin summary table
- `CLAUDE.md` - Monorepo structure, adding new plugins, shared conventions
- `docs/DEVELOPMENT.md` - General skills development guide
- `docs/index.html` - Generated marketplace site

**Per-Plugin:**
- `README.md` - Plugin purpose, installation, quick examples
- `CLAUDE.md` - Skill patterns, reference codebases, development workflow
- `docs/plans/` - Design and implementation documents specific to this plugin
- `docs/examples/` - Pattern usage examples for this plugin

### Asset Distribution

**Root-level assets:**
- `scripts/generate-site.js` - Marketplace site generator
- `package.json` - npm scripts for site generation
- `install.sh` - Shell script permissions setup
- `docs/index.html`, `docs/style.css` - Generated marketplace site

**Plugin-specific assets:**
- Each plugin directory contains its own skills, docs, tests
- `terminal-title/hooks/hooks.json` - Hook configuration travels with the plugin
- All tests live in their respective plugin directories

### Hook Configuration

The `terminal-title` plugin includes its own `hooks/hooks.json`:

```json
{
  "hooks": {
    "sessionStart": {
      "skill": "terminal-title"
    }
  }
}
```

When users install the plugin, Claude Code automatically configures the hook. Other plugins do not include hooks currently.

## Migration Process

### Phase 1: Create Plugin Directories

1. Create directories: `css-development/`, `firebase-development/`, `terminal-title/`, `workflows/`
2. Create `.claude-plugin/` subdirectory in each
3. Write `plugin.json` for each plugin

### Phase 2: Move Skills

```
skills/css-development/          → css-development/skills/
skills/firebase-development/     → firebase-development/skills/
skills/terminal-title/           → terminal-title/skills/
skills/using-2389-skills/        → workflows/skills/
```

Rename skill frontmatter in workflows: `name: workflows` (not `using-2389-skills`)

### Phase 3: Distribute Documentation

Move design plans to corresponding plugin:
```
docs/plans/*-css-*               → css-development/docs/plans/
docs/plans/*-firebase-*          → firebase-development/docs/plans/
docs/plans/*-terminal-*          → terminal-title/docs/plans/
```

Move examples to corresponding plugin:
```
docs/examples/css-*              → css-development/docs/examples/
docs/examples/(firebase examples) → firebase-development/docs/examples/
```

Keep at root:
```
docs/DEVELOPMENT.md              # General skills guide
docs/index.html, style.css       # Marketplace site
```

### Phase 4: Distribute Tests

```
tests/integration/skill-routing* → css-development/tests/integration/
tests/integration/firebase-*     → firebase-development/tests/integration/
tests/integration/terminal-*     → terminal-title/tests/integration/
```

### Phase 5: Move Hooks

```
hooks/hooks.json                 → terminal-title/hooks/hooks.json
```

### Phase 6: Create Documentation Files

Write root documentation:
- `README.md` - Marketplace landing page with plugin table and installation
- `CLAUDE.md` - Monorepo structure and adding plugins

Write per-plugin documentation:
- Each plugin gets `README.md` (public-facing)
- Each plugin gets `CLAUDE.md` (extract specifics from current root CLAUDE.md)

### Phase 7: Update Marketplace

Update `.claude-plugin/marketplace.json`:
- Add four plugins with relative path sources
- Keep external MCP servers unchanged
- Update metadata version to 2.0.0

### Phase 8: Clean Up

- Delete `skills/` directory (now empty)
- Delete `hooks/` directory (now empty)
- Delete `tests/` directory (now empty)
- Update root CLAUDE.md to remove skill-specific content

## Testing Strategy

### Per-Plugin Testing

**Installation:**
```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install css-development@2389-research
/skills  # Verify css-development skills appear
```

Repeat for each plugin.

**Integration tests:**
Each plugin's `tests/integration/` contains scenarios verifying:
- Skill auto-detection
- Sub-skill routing
- TodoWrite checklist creation
- Pattern application
- Expected outputs

**Hook testing (terminal-title only):**
- Session start hook fires automatically
- Title updates at topic changes
- Shell script executes correctly

### Cross-Plugin Testing

Test `workflows` plugin integration:
1. Install `workflows` alone - conventions work standalone
2. Install `css-development` + `workflows` - conventions apply
3. Install all plugins - no conflicts

### Marketplace Validation

```bash
npm run generate  # Regenerate site
```

Verify:
- All four plugins listed
- Links work
- Descriptions accurate
- External MCP servers still present

### Regression Checklist

After migration:
- [ ] Each plugin installs independently
- [ ] Skills auto-detect correctly
- [ ] Sub-skills route properly
- [ ] Terminal title hook fires (if terminal-title installed)
- [ ] Documentation accurate in each plugin
- [ ] Generated marketplace site lists all plugins
- [ ] External MCP servers still referenced

## Edge Cases

### Plugin Interdependencies

The `workflows` plugin establishes conventions (terminal title updates, TodoWrite patterns). Other plugins reference but do not require it.

**Solution:** Each plugin's README includes optional installation suggestion:
```markdown
## Optional: Install Workflows Plugin
For enhanced integration with 2389 conventions:
`/plugin install workflows@2389-research`
```

### Version Management

Each plugin has independent versioning in its `plugin.json`. Changes to one plugin do not force version bumps on others. The marketplace `metadata.version` tracks catalog schema version, not plugin versions.

### Plugin Naming Change

`using-2389-skills` becomes `workflows`. Skill name in frontmatter changes: `name: workflows`. Users who installed the old plugin must uninstall and reinstall.

### Generated Site Updates

GitHub Actions automates site regeneration:

```yaml
# .github/workflows/generate-site.yml
on:
  push:
    branches: [main]
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm run generate
      - # commit and push if changed
```

### Local Development

Developers test changes before committing:

```bash
# Install marketplace from local clone
/plugin marketplace add file:///path/to/claude-plugins

# Install plugin for testing
/plugin install css-development@local-marketplace
```

## Implementation Notes

- Each plugin is self-contained: skills, docs, tests, configuration
- Monorepo enables single-repository maintenance with independent installation
- Users select functionality by choosing plugins
- Marketplace serves as discovery layer and documentation hub
- Root-level tooling (site generation, shared scripts) remains centralized

## Success Criteria

1. Users can install individual plugins without installing others
2. Each plugin functions correctly when installed alone
3. Documentation accurately describes each plugin's functionality
4. Marketplace site displays all available plugins
5. Migration preserves all existing functionality
6. Tests verify each plugin works independently and together

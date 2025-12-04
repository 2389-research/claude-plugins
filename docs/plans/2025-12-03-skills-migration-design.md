# Skills Migration Design

## Overview

Migrate all skills from `~/work/2389/skills` into `claude-plugins` repository, creating a unified internal development marketplace for 2389.

## Context

- **Source repo:** `~/work/2389/skills` - Contains 2389 skills plugin (CSS, Firebase, terminal-title)
- **Target repo:** `claude-plugins` - Currently a marketplace catalog pointing to external MCP servers
- **Goal:** Consolidate into single repo that serves as both the skills plugin AND the marketplace catalog

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Migration type | Full migration | No existing users, full flexibility |
| Repository purpose | Internal dev marketplace | 2389's internal tools |
| Skills location | Live directly in repo | Single plugin approach |
| MCP servers | External git URL references | Different deployment needs |
| Plugin structure | Single "2389" plugin | Simpler than modular approach |

## Final Repository Structure

```
claude-plugins/
├── .claude-plugin/
│   ├── plugin.json         # Plugin: "2389" (skills)
│   └── marketplace.json    # Catalog: local + external plugins
├── skills/                 # Migrated from skills repo
│   ├── css-development/
│   │   ├── SKILL.md
│   │   ├── create-component/SKILL.md
│   │   ├── validate/SKILL.md
│   │   └── refactor/SKILL.md
│   ├── firebase-development/
│   │   ├── SKILL.md
│   │   ├── project-setup/SKILL.md
│   │   ├── add-feature/SKILL.md
│   │   ├── debug/SKILL.md
│   │   └── validate/SKILL.md
│   ├── terminal-title/
│   │   ├── SKILL.md
│   │   └── scripts/set_title.sh
│   └── using-2389-skills/
│       └── SKILL.md
├── hooks/                  # Migrated from skills repo
│   └── hooks.json
├── docs/
│   ├── index.html          # Generated marketplace site
│   ├── style.css
│   ├── DEVELOPMENT.md      # Migrated from skills repo
│   ├── plans/              # Migrated from skills repo
│   └── examples/           # Migrated from skills repo
├── tests/                  # Migrated from skills repo
│   └── integration/
├── scripts/
│   └── generate-site.js    # Existing site generator
├── CLAUDE.md               # Merged project instructions
├── README.md               # Updated for combined purpose
├── install.sh              # Permission setup (migrated)
├── INSTALL_FIREBASE.md     # Firebase guide (migrated)
├── package.json
└── .github/workflows/
    └── generate-site.yml
```

## Marketplace Configuration

The `marketplace.json` will list both local and external plugins:

```json
{
  "name": "2389-research-marketplace",
  "owner": {
    "name": "2389 Research",
    "email": "dev@2389.ai"
  },
  "metadata": {
    "description": "Internal development marketplace for 2389",
    "version": "2.0.0"
  },
  "plugins": [
    {
      "name": "2389",
      "description": "2389 skill collection: CSS development, Firebase, terminal-title, and core workflows",
      "source": "./",
      "version": "1.0.0",
      "keywords": ["skills", "css", "firebase", "terminal", "workflows", "development"]
    },
    {
      "name": "socialmedia",
      "description": "A server that provides social media functionality for AI agents",
      "source": "https://github.com/2389-research/mcp-socialmedia",
      "version": "1.0.0",
      "keywords": ["social-media", "communication", "team-discussion", "collaboration"]
    },
    {
      "name": "journal",
      "description": "A lightweight MCP server for private journaling",
      "source": "https://github.com/2389-research/journal-mcp",
      "version": "1.0.0",
      "keywords": ["journal", "thoughts", "feelings", "reflection"]
    },
    {
      "name": "agent-drugs",
      "description": "Digital drugs that modify AI behavior through prompt injection",
      "source": "https://github.com/2389-research/agent-drugs.git",
      "version": "1.0.0",
      "keywords": ["behavior", "prompts", "modification", "productivity"]
    }
  ]
}
```

## Migration Steps

### Step 1: Copy Skills Content
Copy from `~/work/2389/skills/` to `claude-plugins/`:
- `skills/` directory (all skill files)
- `hooks/` directory
- `tests/integration/` directory
- `docs/DEVELOPMENT.md`
- `docs/plans/` directory
- `docs/examples/` directory
- `install.sh`
- `INSTALL_FIREBASE.md`

### Step 2: Create plugin.json
Create `.claude-plugin/plugin.json` to define the "2389" skills plugin.

### Step 3: Update marketplace.json
Add the local "2389" plugin entry alongside existing external MCP servers.

### Step 4: Merge CLAUDE.md
Combine project instructions from both repositories.

### Step 5: Update README.md
Reflect the combined purpose: internal marketplace + skills repository.

### Step 6: Update Hook Paths
Ensure `hooks.json` paths work with new repository structure.

### Step 7: Verify Installation
Test that skills load correctly after migration.

## Post-Migration

- The original `~/work/2389/skills` repo can be archived or deleted
- All future skills development happens in `claude-plugins`
- MCP servers remain in their own repos, referenced by URL

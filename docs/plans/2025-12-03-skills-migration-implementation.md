# Skills Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate all skills from `~/work/2389/skills` into `claude-plugins`, creating a unified internal development marketplace.

**Architecture:** Single "2389" plugin containing all skills, with marketplace.json cataloging both the local plugin and external MCP servers. Skills live at repo root in `skills/` directory.

**Tech Stack:** Claude Code plugins, JSON configuration, Bash scripts, Markdown skills

---

### Task 1: Copy Skills Directory

**Files:**
- Create: `skills/` directory with all contents from source repo

**Step 1: Copy the skills directory**

Run:
```bash
cp -R ~/work/2389/skills/skills "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/"
```

**Step 2: Verify copy succeeded**

Run:
```bash
ls -la "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/skills/"
```

Expected: Should show css-development, firebase-development, terminal-title, using-2389-skills directories

**Step 3: Commit**

```bash
cd "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins"
git add skills/
git commit -m "feat: migrate skills from 2389/skills repo"
```

---

### Task 2: Copy Hooks Directory

**Files:**
- Create: `hooks/hooks.json`
- Create: `hooks/session-start-title.sh`

**Step 1: Copy hooks directory**

Run:
```bash
cp -R ~/work/2389/skills/hooks "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/"
```

**Step 2: Ensure script is executable**

Run:
```bash
chmod +x "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/hooks/session-start-title.sh"
```

**Step 3: Verify hooks**

Run:
```bash
ls -la "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/hooks/"
cat "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/hooks/hooks.json"
```

Expected: hooks.json with SessionStart hook, session-start-title.sh executable

**Step 4: Commit**

```bash
cd "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins"
git add hooks/
git commit -m "feat: add SessionStart hooks for terminal title"
```

---

### Task 3: Copy Tests Directory

**Files:**
- Create: `tests/integration/` with all test files

**Step 1: Copy tests**

Run:
```bash
cp -R ~/work/2389/skills/tests "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/"
```

**Step 2: Verify tests**

Run:
```bash
ls -la "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/tests/integration/"
```

Expected: skill-routing.test.md, firebase-skill-routing.test.md, terminal-title.test.md

**Step 3: Commit**

```bash
cd "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins"
git add tests/
git commit -m "feat: add integration test scenarios"
```

---

### Task 4: Copy Documentation

**Files:**
- Create: `docs/DEVELOPMENT.md`
- Create: `docs/examples/` directory
- Note: `docs/plans/` already exists, merge contents

**Step 1: Copy DEVELOPMENT.md**

Run:
```bash
cp ~/work/2389/skills/docs/DEVELOPMENT.md "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/docs/"
```

**Step 2: Copy examples directory**

Run:
```bash
cp -R ~/work/2389/skills/docs/examples "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/docs/"
```

**Step 3: Copy existing plans from source (skip duplicates)**

Run:
```bash
cp -n ~/work/2389/skills/docs/plans/*.md "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/docs/plans/" 2>/dev/null || true
```

**Step 4: Verify documentation**

Run:
```bash
ls -la "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/docs/"
ls -la "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/docs/examples/"
ls -la "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/docs/plans/"
```

**Step 5: Commit**

```bash
cd "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins"
git add docs/
git commit -m "docs: add development guide, examples, and plans from skills repo"
```

---

### Task 5: Copy Install Scripts

**Files:**
- Create: `install.sh`
- Create: `INSTALL_FIREBASE.md`

**Step 1: Copy install.sh**

Run:
```bash
cp ~/work/2389/skills/install.sh "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/"
chmod +x "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/install.sh"
```

**Step 2: Copy INSTALL_FIREBASE.md**

Run:
```bash
cp ~/work/2389/skills/INSTALL_FIREBASE.md "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/"
```

**Step 3: Verify**

Run:
```bash
ls -la "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/install.sh"
ls -la "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/INSTALL_FIREBASE.md"
```

**Step 4: Commit**

```bash
cd "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins"
git add install.sh INSTALL_FIREBASE.md
git commit -m "feat: add permission setup and Firebase installation scripts"
```

---

### Task 6: Create plugin.json

**Files:**
- Create: `.claude-plugin/plugin.json`

**Step 1: Create plugin.json**

Create file at `.claude-plugin/plugin.json`:

```json
{
  "name": "2389",
  "description": "2389.ai skill collection including Firebase, CSS, testing, and development workflows",
  "version": "1.0.0",
  "commands": []
}
```

**Step 2: Verify**

Run:
```bash
cat "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/.claude-plugin/plugin.json"
```

**Step 3: Commit**

```bash
cd "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins"
git add .claude-plugin/plugin.json
git commit -m "feat: add plugin.json for 2389 skills plugin"
```

---

### Task 7: Update marketplace.json

**Files:**
- Modify: `.claude-plugin/marketplace.json`

**Step 1: Update marketplace.json**

Replace contents of `.claude-plugin/marketplace.json` with:

```json
{
    "name": "2389-research-marketplace",
    "owner": {
        "name": "2389 Research",
        "email": "dev@2389.ai"
    },
    "metadata": {
        "description": "Internal development marketplace for 2389 - skills and MCP servers",
        "version": "2.0.0"
    },
    "plugins": [
        {
            "name": "2389",
            "source": {
                "source": "local",
                "path": "./"
            },
            "description": "2389 skill collection: CSS development, Firebase, terminal-title, and core workflows",
            "version": "1.0.0",
            "keywords": [
                "skills",
                "css",
                "firebase",
                "terminal",
                "workflows",
                "development"
            ],
            "strict": false
        },
        {
            "name": "agent-drugs",
            "source": {
                "source": "url",
                "url": "https://github.com/2389-research/agent-drugs.git"
            },
            "description": "Digital drugs that modify AI behavior through prompt injection",
            "version": "1.0.0",
            "keywords": [
                "behavior",
                "prompts",
                "modification",
                "drugs",
                "context-injection",
                "productivity"
            ],
            "strict": true
        },
        {
            "name": "socialmedia",
            "source": {
                "source": "url",
                "url": "https://github.com/2389-research/mcp-socialmedia"
            },
            "description": "A server that provides social media functionality for AI agents, enabling them to interact in team-based discussions.",
            "version": "1.0.0",
            "keywords": [
                "social-media",
                "communication",
                "team-discussion",
                "collaboration",
                "agents",
                "interaction"
            ],
            "strict": true
        },
        {
            "name": "journal",
            "source": {
                "source": "url",
                "url": "https://github.com/2389-research/journal-mcp"
            },
            "description": "A lightweight MCP server that provides Claude with a private journaling capability to process feelings and thoughts",
            "version": "1.0.0",
            "keywords": [
                "journal",
                "journaling",
                "thoughts",
                "feelings",
                "processing",
                "private",
                "reflection",
                "diary"
            ],
            "strict": true
        }
    ]
}
```

**Step 2: Verify valid JSON**

Run:
```bash
cat "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/.claude-plugin/marketplace.json" | jq .
```

Expected: Valid JSON output with 4 plugins (2389 local, plus 3 external)

**Step 3: Commit**

```bash
cd "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins"
git add .claude-plugin/marketplace.json
git commit -m "feat: add 2389 skills plugin to marketplace catalog"
```

---

### Task 8: Create CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

**Step 1: Create CLAUDE.md**

Create file at `CLAUDE.md` combining context from skills repo:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Repository Purpose

This repository serves as the internal development marketplace for 2389, containing:
1. **2389 Skills Plugin** - CSS development, Firebase, terminal-title, and core workflows
2. **Marketplace Catalog** - References to external MCP servers (socialmedia, journal, agent-drugs)

## Architecture Overview

### Plugin Structure

The "2389" plugin lives directly in this repo:
- `skills/` - All skill definitions
- `hooks/` - SessionStart hooks for terminal title
- `.claude-plugin/plugin.json` - Plugin metadata

### Marketplace Structure

The `marketplace.json` catalogs both:
- Local plugin (2389 skills via `source: local`)
- External MCP servers (via `source: url`)

### Skills Available

**CSS Development** (`skills/css-development/`)
- Main orchestrator routes to sub-skills based on intent
- Sub-skills: create-component, validate, refactor
- Pattern: Tailwind + semantic naming, dark mode by default

**Firebase Development** (`skills/firebase-development/`)
- Main orchestrator routes to sub-skills
- Sub-skills: project-setup, add-feature, debug, validate
- Pattern: Emulator-first development, security rules

**Terminal Title** (`skills/terminal-title/`)
- Updates terminal title with emoji + project + topic
- Triggered by SessionStart hook

**Using 2389 Skills** (`skills/using-2389-skills/`)
- Mandatory workflow skill loaded at session start
- Reminds about terminal title updates on topic changes

## Development Commands

### Install Plugin Locally

```bash
# Symlink for development
ln -s "$(pwd)" ~/.claude/plugins/2389-marketplace

# Set up permissions
bash install.sh
```

### Test Skills

Run test scenarios from `tests/integration/` in a Claude Code session.

## Making Changes

### Adding New Skills

1. Create directory: `mkdir skills/new-skill`
2. Create `skills/new-skill/SKILL.md` with YAML frontmatter
3. Add routing to parent skill if needed
4. Create integration test in `tests/integration/`
5. Add usage example to `docs/examples/`

### Adding External Plugins to Marketplace

Add entry to `.claude-plugin/marketplace.json` with:
- `name`: Plugin identifier
- `source`: `{"source": "url", "url": "https://github.com/..."}`
- `description`: What it does
- `version`: Semver version
- `keywords`: Discovery tags

## File Organization

```
.claude-plugin/
├── plugin.json         # "2389" plugin definition
└── marketplace.json    # Catalog of all plugins

skills/                 # Skill definitions
├── css-development/
├── firebase-development/
├── terminal-title/
└── using-2389-skills/

hooks/                  # Plugin hooks
├── hooks.json
└── session-start-title.sh

docs/
├── DEVELOPMENT.md      # Maintenance guide
├── plans/              # Design documents
└── examples/           # Usage examples

tests/integration/      # Manual test scenarios

scripts/
└── generate-site.js    # Marketplace site generator

.github/workflows/
└── generate-site.yml   # Auto-generate site on push
```

## Quality Standards

- Skills must include TodoWrite checklists
- Use exact file paths in instructions
- Include both success and edge cases in tests
- Reference patterns from main skills (don't duplicate)
```

**Step 2: Verify file created**

Run:
```bash
head -50 "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/CLAUDE.md"
```

**Step 3: Commit**

```bash
cd "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins"
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md with repository guidance"
```

---

### Task 9: Update README.md

**Files:**
- Modify: `README.md`

**Step 1: Read current README**

Run:
```bash
cat "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/README.md"
```

**Step 2: Update README.md**

Update to reflect combined purpose (marketplace + skills). Include:
- Repository purpose (internal marketplace)
- Quick start for installing the 2389 skills plugin
- List of available plugins (local + external)
- Link to browse marketplace site
- Contributing section

**Step 3: Commit**

```bash
cd "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins"
git add README.md
git commit -m "docs: update README for combined marketplace + skills repo"
```

---

### Task 10: Verify Installation Works

**Step 1: Check plugin structure is valid**

Run:
```bash
cd "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins"
cat .claude-plugin/plugin.json | jq .
cat .claude-plugin/marketplace.json | jq .
```

Expected: Both files are valid JSON

**Step 2: Check skills are accessible**

Run:
```bash
ls -la "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/skills/"
ls -la "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/skills/css-development/"
```

Expected: All skill directories present with SKILL.md files

**Step 3: Check hooks are ready**

Run:
```bash
ls -la "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/hooks/"
file "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins/hooks/session-start-title.sh"
```

Expected: hooks.json present, session-start-title.sh is executable script

**Step 4: Final verification commit**

```bash
cd "/Users/dylanr/Dropbox (Personal)/work/2389/claude-plugins"
git status
```

Expected: Clean working tree (all changes committed)

---

## Post-Migration Notes

After completing all tasks:
1. Test skills in a new Claude Code session
2. Run `bash install.sh` to set up permissions
3. Consider archiving the original `~/work/2389/skills` repo
4. Update any documentation that references the old repo location

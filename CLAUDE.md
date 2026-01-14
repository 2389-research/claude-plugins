# 2389 Research Claude Code Plugin Marketplace

## Repository Purpose

This repository is a **monorepo marketplace** containing multiple independent Claude Code plugins we use at 2389.

**Key characteristics:**
- Each plugin is independently installable
- Plugins share common development conventions
- Centralized marketplace catalog in `.claude-plugin/marketplace.json`
- Auto-generated marketplace site at https://2389-research.github.io/claude-plugins

These are the plugins and MCP servers we use at 2389.

## Monorepo Structure

The repository contains multiple independent plugins, each in its own directory. Here are three representative examples:

```
claude-plugins/
├── .claude-plugin/
│   └── marketplace.json        # Catalog of all available plugins
├── css-development/            # CSS development workflows plugin
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/
│   ├── docs/
│   ├── tests/
│   ├── CLAUDE.md              # Plugin-specific instructions
│   └── README.md              # Plugin documentation
├── firebase-development/       # Firebase workflows plugin
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/
│   ├── docs/
│   ├── tests/
│   ├── CLAUDE.md
│   └── README.md
├── terminal-title/             # Terminal title + TodoWrite conventions
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── hooks/
│   │   └── hooks.json
│   ├── skills/
│   ├── docs/
│   ├── tests/
│   ├── CLAUDE.md
│   └── README.md
├── docs/
│   ├── index.html             # Generated marketplace site
│   ├── style.css
│   └── DEVELOPMENT.md         # Comprehensive developer guide
└── scripts/
    └── generate-site.js       # Marketplace site generator
```

## Plugin Architecture

Each plugin is self-contained with:

1. **`.claude-plugin/plugin.json`** - Plugin configuration
   ```json
   {
     "name": "plugin-name",
     "description": "What this plugin does",
     "version": "1.0.0",
     "commands": []
   }
   ```

2. **`skills/`** - Plugin-specific skills
   - Main skill (orchestrator)
   - Sub-skills in subdirectories
   - Each with `SKILL.md` containing frontmatter + instructions

3. **`docs/`** - Plugin-specific documentation
   - `plans/` - Design and implementation documents
   - `examples/` - Pattern usage examples

4. **`tests/integration/`** - Plugin-specific test scenarios

5. **`CLAUDE.md`** - Instructions for Claude about this plugin
   - Patterns and conventions
   - Reference codebases
   - Development workflow

6. **`README.md`** - Public-facing documentation
   - Installation instructions
   - Quick examples
   - Links to detailed docs

## Available Plugins

| Plugin | Description | Documentation |
|--------|-------------|---------------|
| [css-development](css-development/) | CSS development workflows with Tailwind composition, semantic naming, and dark mode by default | [CLAUDE.md](css-development/CLAUDE.md) |
| [firebase-development](firebase-development/) | Firebase project workflows including setup, features, debugging, and validation | [CLAUDE.md](firebase-development/CLAUDE.md) |
| [terminal-title](terminal-title/) | Automatically updates terminal title with emoji + project + topic context, plus TodoWrite conventions | [CLAUDE.md](terminal-title/CLAUDE.md) |

## Installation

### Add Marketplace

```bash
/plugin marketplace add 2389-research/claude-plugins
```

### Install Plugins Individually

```bash
/plugin install css-development@2389-research
/plugin install firebase-development@2389-research
/plugin install terminal-title@2389-research
```

Users can install only the plugins they need.

## Adding a New Plugin

### Step 1: Create Plugin Directory Structure

```bash
mkdir -p new-plugin/.claude-plugin
mkdir -p new-plugin/skills
mkdir -p new-plugin/docs/plans
mkdir -p new-plugin/docs/examples
mkdir -p new-plugin/tests/integration
```

### Step 2: Create plugin.json

Create `new-plugin/.claude-plugin/plugin.json`:

```json
{
  "name": "new-plugin",
  "description": "What this plugin does (one sentence, used for auto-detection)",
  "version": "1.0.0",
  "commands": []
}
```

### Step 3: Create Skills

Create `new-plugin/skills/SKILL.md` with frontmatter:

```markdown
---
name: new-plugin
description: When this skill applies (keywords for auto-detection)
---

# New Plugin

## Overview
[What this skill does]

## When This Skill Applies
[Trigger scenarios]

## Workflow
[Step-by-step process with TodoWrite integration]
```

### Step 4: Create Documentation

**new-plugin/README.md** - Public-facing documentation:
```markdown
# New Plugin

Brief description

## Installation

\`\`\`bash
/plugin install new-plugin@2389-research
\`\`\`

## What This Plugin Provides

List of skills

## Quick Example

Show key usage pattern
```

**new-plugin/CLAUDE.md** - Instructions for Claude:
```markdown
# New Plugin

## Overview
What this plugin does

## Skills Included
List of skills with routing logic

## Patterns
Key patterns this plugin enforces

## Reference Codebases
Links to example projects

## Development Workflow
How skills auto-detect and execute
```

### Step 5: Add to Marketplace

Edit `.claude-plugin/marketplace.json` and add:

```json
{
  "name": "new-plugin",
  "source": "./new-plugin",
  "description": "What this plugin does",
  "version": "1.0.0",
  "keywords": ["tag1", "tag2", "tag3"],
  "strict": false
}
```

### Step 6: Regenerate Marketplace Site

```bash
npm run generate
```

### Step 7: Test and Commit

```bash
# Test locally (use absolute path to your local clone)
/plugin install ./new-plugin

# Commit changes
git add new-plugin/ .claude-plugin/marketplace.json docs/index.html
git commit -m "feat: add new-plugin

[Description of what the plugin does and why it's needed]"
```

## Marketplace Site Generation

The marketplace site is auto-generated from `.claude-plugin/marketplace.json`:

```bash
npm run generate
```

This creates `docs/index.html` which GitHub Pages serves at https://2389-research.github.io/claude-plugins

**When to regenerate:**
- After adding a new plugin
- After updating plugin descriptions or versions
- After modifying marketplace.json

GitHub Actions automatically regenerates the site on push to main.

## Shared Conventions

These conventions apply across **all plugins** in this monorepo:

### ABOUTME Comments

All code files should start with a 2-line comment explaining what the file does:

```typescript
// ABOUTME: This file handles user authentication
// ABOUTME: It exports middleware for Express routes
```

Each line must start with `ABOUTME: ` for easy grepping.

### TodoWrite Integration

Skills create granular TodoWrite checklists with each task taking 2-5 minutes:

```javascript
{
  content: "Action to take",              // Imperative form
  status: "pending",                       // or "in_progress" or "completed"
  activeForm: "Taking action"              // Present continuous form
}
```

**Task lifecycle:**
1. Create todos for all steps at start
2. Mark ONE task as in_progress before starting
3. Complete the work
4. Mark task as completed immediately after
5. Move to next task

**Never:**
- Batch complete multiple tasks
- Have multiple tasks in_progress simultaneously
- Skip marking tasks completed

### File Paths

Use clear, specific paths in documentation and skill instructions:

```
✅ hosting/styles/components.css (relative to project root)
✅ ./styles/components.css (explicit relative path)
❌ components.css (ambiguous)
```

### Skill Routing

Main skills (orchestrators) route to sub-skills using colon notation:

```
main-skill → Detects intent → Invokes main-skill:sub-skill
```

Auto-detection uses skill frontmatter `description` field for keyword matching.

### Test-Driven Development

All plugins follow TDD:
1. Write the failing test
2. Run test to confirm it fails
3. Write minimal code to pass
4. Run test to confirm it passes
5. Refactor while keeping tests green

### Git Commit Protocol

**CRITICAL:** NEVER use `--no-verify` when committing.

**Pre-commit hook failures:**
1. Read complete error output
2. Identify which tool failed and why
3. Explain the fix you will apply
4. Apply fix and re-run hooks
5. Only commit after all hooks pass

**Commit message format:**
```
type: brief description

Detailed explanation of what changed and why.

Optional references to issues, docs, or related work.
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `build`, `chore`

### Code Quality Standards

- **Simple over clever**: Prefer maintainable solutions
- **Match existing style**: Consistency within files matters most
- **Preserve comments**: Unless provably false
- **Evergreen naming**: No "new" or "improved" in names
- **Real data only**: No mocking in tests or implementations
- **Fix, don't workaround**: Address root causes

## Development Commands

### Testing Skills Locally

Copy to Claude skills directory:

```bash
cp -r plugin-name/skills ~/.claude/skills/
```

Run integration test scenarios from `plugin-name/tests/integration/`.

### Installing Plugin Locally

```bash
/plugin install ./plugin-name
```

### Uninstalling Plugin

```bash
/plugin uninstall plugin-name
```

### Viewing Installed Plugins

```bash
/plugin list
```

## File Organization

### Plugin Directory Layout

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json           # Required: Plugin configuration
├── skills/
│   ├── SKILL.md              # Main skill (orchestrator)
│   ├── sub-skill-1/
│   │   └── SKILL.md          # Sub-skill
│   └── sub-skill-2/
│       └── SKILL.md          # Sub-skill
├── docs/
│   ├── plans/                # Design and implementation docs
│   └── examples/             # Pattern usage examples
├── tests/
│   └── integration/          # Manual test scenarios
├── hooks/                    # Optional: Hook configuration
│   └── hooks.json
├── CLAUDE.md                 # Required: Instructions for Claude
└── README.md                 # Required: Public documentation
```

### Root Directory Layout

```
claude-plugins/
├── .claude-plugin/
│   └── marketplace.json      # Catalog of all plugins
├── [plugin-directories]/     # One per plugin
├── docs/
│   ├── index.html           # Generated marketplace site
│   ├── style.css            # Site styling
│   └── DEVELOPMENT.md       # Comprehensive dev guide
├── scripts/
│   └── generate-site.js     # Site generator
├── CLAUDE.md                # This file (monorepo instructions)
├── README.md                # Marketplace overview
└── package.json             # For npm run generate
```

## External MCP Servers

The marketplace also lists external MCP servers maintained in separate repositories:

- **agent-drugs**: https://github.com/2389-research/agent-drugs
- **socialmedia**: https://github.com/2389-research/mcp-socialmedia
- **journal**: https://github.com/2389-research/journal-mcp

These are referenced by URL in marketplace.json:

```json
{
  "name": "socialmedia",
  "source": {
    "source": "url",
    "url": "https://github.com/2389-research/mcp-socialmedia"
  },
  "description": "Social media functionality for AI agents",
  "version": "1.0.0",
  "keywords": ["social", "media", "communication"],
  "strict": true
}
```

## Troubleshooting

### Plugin Not Loading

1. Check `.claude-plugin/plugin.json` exists in plugin directory
2. Verify skill frontmatter has name and description
3. Check skill is in `skills/` subdirectory of plugin
4. Try reinstalling: `/plugin uninstall name` then `/plugin install name@2389-research`

### Hooks Not Firing

1. Check `hooks/hooks.json` syntax is valid JSON
2. Verify hook references valid skill name (check skill frontmatter)
3. Reinstall plugin after hook changes
4. Restart Claude Code session

### Marketplace Site Not Updating

1. Run `npm run generate` to regenerate
2. Check `.claude-plugin/marketplace.json` is valid JSON
3. Verify plugin directories exist at paths specified in marketplace.json
4. Check GitHub Actions logs if pushing to GitHub

### Skill Routing Issues

1. Review context detection in main skill SKILL.md
2. Check sub-skill frontmatter descriptions
3. Add more specific detection rules
4. Make ambiguous cases prompt user for clarification

## Resources

- **Claude Code Documentation:** https://docs.claude.com/en/docs/claude-code
- **Skills Guide:** https://docs.claude.com/en/docs/claude-code/skills
- **Plugins Guide:** https://docs.claude.com/en/docs/claude-code/plugins
- **MCP Documentation:** https://docs.claude.com/en/docs/claude-code/mcp

## Repository Links

- **GitHub:** https://github.com/2389-research/claude-plugins
- **Marketplace Site:** https://2389-research.github.io/claude-plugins
- **Development Guide:** [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

## Contributing

### Before Making Changes

1. Read plugin-specific CLAUDE.md in the plugin you're modifying
2. Review `docs/DEVELOPMENT.md` for comprehensive development guide
3. Test with integration scenarios from `tests/integration/`
4. Update documentation (README, CLAUDE.md, examples, tests)
5. Ensure skill descriptions enable auto-detection

### Submitting Changes

1. Create feature branch
2. Make changes following shared conventions
3. Test manually with integration scenarios
4. Update relevant documentation
5. Commit with descriptive message (see Git Commit Protocol above)
6. Submit pull request

### Documentation Standards

- **SKILL.md files:** Markdown with YAML frontmatter
- **Code examples:** Complete and runnable (not just descriptions)
- **File paths:** Absolute and exact
- **Commands:** Include expected output
- **Checklists:** TodoWrite-compatible format

## Development Philosophy

### Quality Standards

- TDD approach for all features (write test first)
- Pre-commit hooks must pass (never use --no-verify)
- Real data/APIs only (no mocking)
- Comprehensive error handling
- Fix root causes, not symptoms

### Code Style

- Simple, maintainable solutions over clever ones
- Match existing code style within files
- Preserve comments unless provably false
- Evergreen naming (no "new" or "improved")
- Complete code examples in documentation

### Skill Design Principles

- **Granular checklists** - Each TodoWrite task 2-5 minutes
- **Complete examples** - Show exact code, not descriptions
- **Exact file paths** - Use absolute paths always
- **Pattern centralization** - Document once, reference everywhere
- **Test coverage** - Integration tests for all workflows
- **Auto-detection** - Skills trigger on relevant keywords

## Notes

- This is an **internal marketplace** for 2389.ai team
- Plugins are **independently installable** from this monorepo
- Each plugin is **self-contained** with its own docs/tests
- MCP servers are **external**, referenced by URL
- Marketplace site is **auto-generated** from marketplace.json
- GitHub Actions **regenerates site** on push to main

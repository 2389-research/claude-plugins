# Claude Plugins Repository

## Repository Purpose

This repository serves two functions:

1. **Skills Plugin**: The "2389" plugin containing curated Claude Code skills for internal development workflows
2. **Marketplace Catalog**: A catalog listing both local skills and external MCP servers for the 2389 research team

This is an **internal development marketplace** for 2389.ai tooling, not a public marketplace.

## Architecture Overview

### Plugin Structure

The repository itself IS the "2389" plugin:

```
claude-plugins/
├── .claude-plugin/
│   ├── plugin.json         # Defines the "2389" plugin
│   └── marketplace.json    # Catalog of available plugins/servers
├── skills/                 # Skills included in "2389" plugin
│   ├── css-development/    # CSS development workflows
│   ├── firebase-development/ # Firebase project workflows
│   ├── terminal-title/     # Session title management
│   └── using-2389-skills/  # Meta-skill for using this plugin
├── hooks/                  # Claude Code hooks
│   └── hooks.json          # Session start hooks
├── docs/
│   ├── index.html          # Generated marketplace site
│   ├── DEVELOPMENT.md      # Comprehensive skills development guide
│   ├── plans/              # Design and implementation documents
│   └── examples/           # Usage examples for patterns
├── tests/
│   └── integration/        # Manual test scenarios
└── scripts/
    └── generate-site.js    # Marketplace site generator
```

### Marketplace Structure

The `.claude-plugin/marketplace.json` lists all available plugins:

- **Local plugin**: The "2389" skills plugin (source: "./")
- **External MCP servers**: socialmedia, journal, agent-drugs (source: git URLs)

External plugins live in their own repositories and are referenced by URL.

## Available Skills

### css-development

Comprehensive CSS development workflow with sub-skills:
- `css-development:create-component` - Create new styled components
- `css-development:validate` - Validate CSS against patterns
- `css-development:refactor` - Refactor existing CSS

**Patterns:**
- Semantic class naming (`.user-profile`, `.nav-menu`)
- Tailwind composition with `@apply`
- Dark mode by default (`dark:` variants)
- Test coverage (static analysis + component rendering)

**Reference codebase:** `/Users/dylanr/work/2389/oneonone/hosting`

### firebase-development

Firebase project workflows with sub-skills:
- `firebase-development:project-setup` - Initialize new Firebase projects
- `firebase-development:add-feature` - Add features to existing projects
- `firebase-development:debug` - Debug Firebase issues
- `firebase-development:validate` - Validate project structure

**Key patterns:**
- Multi-hosting setup (multiple sites or single hosting)
- Authentication (custom API keys, Firebase Auth, or both)
- Cloud Functions (Express, domain-grouped, or individual files)
- Security models (server-write-only vs client-write with validation)
- Emulator-first development
- Modern tooling (TypeScript, vitest, biome)

**Reference codebases:**
- oneonone: `/Users/dylanr/work/2389/oneonone` (Express API, custom API keys)
- bot-socialmedia: `/Users/dylanr/work/2389/bot-socialmedia-server` (Domain-grouped, Firebase Auth)
- meme-rodeo: `/Users/dylanr/work/2389/meme-rodeo` (Individual functions, entitlements)

### terminal-title

Automatically updates terminal title with emoji + project + topic context.

**Auto-invokes:** At session start and topic changes

### using-2389-skills

Meta-skill establishing mandatory workflows for 2389 skills:
- Terminal title updates
- Skill usage patterns
- TodoWrite integration

## Development Commands

### Installation

```bash
# Install the 2389 plugin from this repository
/plugin install 2389-research/claude-plugins

# Or install from local clone
/plugin install /path/to/claude-plugins
```

### Testing Skills

After modifying skills:

```bash
# Copy to Claude skills directory for testing
cp -r skills/css-development ~/.claude/skills/
cp -r skills/firebase-development ~/.claude/skills/
cp -r skills/terminal-title ~/.claude/skills/
cp -r skills/using-2389-skills ~/.claude/skills/

# Run integration tests manually
# See tests/integration/ for scenarios
```

### Generating Marketplace Site

```bash
npm run generate
```

This creates `docs/index.html` which GitHub Pages serves.

## Making Changes

### Adding a New Skill

1. **Create skill directory:**
   ```bash
   mkdir skills/new-skill
   ```

2. **Create SKILL.md with frontmatter:**
   ```markdown
   ---
   name: new-skill
   description: When this skill applies (for auto-detection)
   ---

   # New Skill

   ## Overview
   [What this skill does]

   ## When This Skill Applies
   [Trigger scenarios]

   ## Workflow
   [Step-by-step process]
   ```

3. **Test manually** with scenarios from intended use cases

4. **Document in this file** under "Available Skills"

5. **Add integration tests** in `tests/integration/`

### Adding Sub-Skills

For hierarchical skills (e.g., `css-development:validate`):

1. **Create subdirectory:**
   ```bash
   mkdir skills/css-development/new-sub-skill
   ```

2. **Create SKILL.md** with qualified name:
   ```markdown
   ---
   name: css-development:new-sub-skill
   description: Specific sub-skill purpose
   ---
   ```

3. **Update parent skill** routing logic in `css-development/SKILL.md`

4. **Add integration tests**

### Modifying Skill Patterns

Patterns are centralized in main skill files (`css-development/SKILL.md`, `firebase-development/SKILL.md`):

1. **Update pattern documentation** in main SKILL.md
2. **Update sub-skills** if they reference the pattern
3. **Update examples** in `docs/examples/`
4. **Test with integration scenarios**

See `docs/DEVELOPMENT.md` for comprehensive modification guide.

### Adding External Plugins

To add an MCP server or external plugin to the marketplace:

1. **Edit `.claude-plugin/marketplace.json`:**
   ```json
   {
     "plugins": [
       {
         "name": "new-plugin",
         "description": "What this plugin does",
         "source": {
           "source": "url",
           "url": "https://github.com/org/repo"
         },
         "version": "1.0.0",
         "keywords": ["tag1", "tag2"],
         "strict": true
       }
     ]
   }
   ```

2. **Regenerate site:**
   ```bash
   npm run generate
   ```

3. **Commit and push** (GitHub Actions updates GitHub Pages)

### Updating Hook Configuration

Hooks are defined in `hooks/hooks.json`:

```json
{
  "hooks": {
    "sessionStart": {
      "skill": "terminal-title"
    }
  }
}
```

After changing hooks, reinstall the plugin for changes to take effect.

## File Organization

### Skills Structure

```
skills/
├── css-development/
│   ├── SKILL.md                    # Main orchestrator
│   ├── create-component/SKILL.md   # Sub-skill
│   ├── validate/SKILL.md           # Sub-skill
│   └── refactor/SKILL.md           # Sub-skill
├── firebase-development/
│   ├── SKILL.md                    # Main orchestrator (1323 lines)
│   ├── project-setup/SKILL.md
│   ├── add-feature/SKILL.md
│   ├── debug/SKILL.md
│   └── validate/SKILL.md
├── terminal-title/
│   ├── SKILL.md
│   └── scripts/set_title.sh        # Shell script for title setting
└── using-2389-skills/
    └── SKILL.md                    # Meta-skill
```

### Documentation Structure

```
docs/
├── index.html              # Generated marketplace site
├── style.css               # Site styling
├── DEVELOPMENT.md          # Comprehensive developer guide
├── plans/                  # Design and implementation docs
│   ├── 2025-01-14-firebase-skills-design.md
│   ├── 2025-01-14-firebase-skills-implementation.md
│   ├── 2025-11-13-css-development-skill-design.md
│   ├── 2025-11-13-css-development-skill-implementation.md
│   ├── 2025-11-14-terminal-title-skill-design.md
│   ├── 2025-11-14-terminal-title-implementation.md
│   ├── 2025-12-03-skills-migration-design.md
│   └── 2025-12-03-skills-migration-implementation.md
└── examples/               # Pattern usage examples
    ├── api-key-authentication.md
    ├── css-development-examples.md
    ├── emulator-workflow.md
    ├── express-function-architecture.md
    ├── firestore-rules-patterns.md
    └── multi-hosting-setup.md
```

### Tests Structure

```
tests/
└── integration/            # Manual test scenarios
    ├── firebase-skill-routing.test.md
    ├── skill-routing.test.md
    └── terminal-title.test.md
```

## Key Conventions

### ABOUTME Comments

All code files should start with a 2-line comment:

```typescript
// ABOUTME: This file handles user authentication
// ABOUTME: It exports middleware for Express routes
```

### Pattern References

Skills reference patterns using @ syntax:

```markdown
@css-development:validate to check the result
@firebase-development/pattern-name
```

### TodoWrite Integration

Skills create granular TodoWrite checklists:

```markdown
Create TodoWrite checklist with:
- content: "Action to take"
- status: "pending" | "in_progress" | "completed"
- activeForm: "Taking action"
```

### File Paths

Always use absolute paths in documentation and skill instructions:

```
✅ /Users/dylanr/work/2389/oneonone/hosting/styles/components.css
❌ styles/components.css
```

## Testing Workflow

### Manual Testing

1. Copy skills to `~/.claude/skills/`
2. Run scenarios from `tests/integration/`
3. Verify:
   - Auto-detection works
   - Routing chooses correct sub-skill
   - TodoWrite checklists created
   - Steps execute correctly
   - Output matches expectations

### Regression Testing

After changes, test all integration scenarios focusing on:
- Auto-detection for each mode
- Ambiguity handling
- Pattern reference usage
- Composition over creation
- Dark mode by default (CSS)

## Installation Scripts

### install.sh

Sets executable permissions on shell scripts:

```bash
./install.sh
```

Run after cloning or when adding new scripts.

### Firebase Installation

See `INSTALL_FIREBASE.md` for comprehensive Firebase setup guide covering:
- Firebase CLI installation
- Emulator setup
- Project initialization
- Authentication configuration

## Common Tasks

### Updating Skill Descriptions

Skill descriptions control auto-detection. Update frontmatter in SKILL.md:

```markdown
---
name: skill-name
description: Keywords that trigger auto-detection (CSS, component, styling, dark mode)
---
```

### Adding Code Examples

Provide complete, runnable examples in skills:

```typescript
// ✅ Good - Complete code
if (input === '') {
  throw new Error('Input cannot be empty');
}

// ❌ Bad - Just description
"Add validation for empty input"
```

### Referencing Projects

Skills reference actual production codebases:

- **oneonone**: Express API with custom auth
- **bot-socialmedia**: Domain-grouped functions
- **meme-rodeo**: Individual function files

Keep skills synchronized with these reference projects.

## Troubleshooting

### Skill Not Loading

1. Check `.claude-plugin/plugin.json` exists
2. Verify skill frontmatter has name and description
3. Check skill is in `skills/` directory
4. Try reinstalling plugin

### Hooks Not Firing

1. Check `hooks/hooks.json` syntax
2. Verify hook references valid skill name
3. Reinstall plugin after hook changes
4. Restart Claude Code session

### Routing to Wrong Sub-Skill

1. Review context detection in main SKILL.md
2. Check sub-skill descriptions
3. Add more specific detection rules
4. Make ambiguous cases prompt user

## Resources

- **Claude Code Documentation:** https://docs.claude.com/en/docs/claude-code
- **Skills Guide:** https://docs.claude.com/en/docs/claude-code/skills
- **MCP Documentation:** https://docs.claude.com/en/docs/claude-code/mcp
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Firebase:** https://firebase.google.com/docs
- **Firebase Emulator Suite:** https://firebase.google.com/docs/emulator-suite

## Repository Links

- **GitHub:** https://github.com/2389-research/claude-plugins
- **Marketplace Site:** https://2389-research.github.io/claude-plugins
- **Related Repos:**
  - socialmedia MCP: https://github.com/2389-research/mcp-socialmedia
  - journal MCP: https://github.com/2389-research/journal-mcp
  - agent-drugs: https://github.com/2389-research/agent-drugs

## Development Philosophy

### Quality Standards

- TDD approach for all features
- Pre-commit hooks must pass
- Real data/APIs only (no mocking)
- Comprehensive error handling

### Code Style

- Simple, maintainable solutions over clever ones
- Match existing code style within files
- Preserve comments unless provably false
- Evergreen naming (no "new" or "improved")

### Skill Design Principles

- **Granular checklists** - Each step 2-5 minutes
- **Complete examples** - Show exact code, not descriptions
- **Exact file paths** - Use absolute paths
- **Pattern centralization** - Document once, reference everywhere
- **Test coverage** - Integration tests for all workflows

## Contributing

### Before Making Changes

1. Review `docs/DEVELOPMENT.md` for comprehensive guide
2. Test with integration scenarios
3. Update documentation (README, examples, tests)
4. Verify patterns are consistently documented
5. Ensure skills descriptions enable auto-detection

### Submitting Changes

1. Create feature branch
2. Make changes following conventions
3. Test manually with all integration scenarios
4. Update relevant documentation
5. Commit with descriptive message
6. Submit pull request

### Documentation Standards

- **SKILL.md files:** Markdown with YAML frontmatter
- **Code examples:** Complete and runnable
- **File paths:** Absolute and exact
- **Commands:** Include expected output
- **Checklists:** TodoWrite-compatible format

## Notes

- This is an **internal marketplace** for 2389.ai team
- Skills are **embedded directly** in this repository
- MCP servers are **external**, referenced by URL
- The "2389" plugin name refers to the **skills collection**
- Marketplace site is **auto-generated** on push to main

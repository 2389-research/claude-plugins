# Monorepo Plugin Split Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the claude-plugins repository from a single monolithic plugin into a monorepo containing five independent plugins that users can install individually.

**Architecture:** Create four plugin directories (css-development, firebase-development, terminal-title, workflows), each with its own .claude-plugin/plugin.json. Move existing skills, docs, and tests into respective plugin directories. Update marketplace.json to reference plugins via relative paths. Create comprehensive documentation for each plugin and the monorepo root.

**Tech Stack:** Bash, JSON, Markdown, Claude Code plugin system

---

## Task 1: Create Plugin Directory Structures

**Files:**
- Create: `css-development/.claude-plugin/`
- Create: `firebase-development/.claude-plugin/`
- Create: `terminal-title/.claude-plugin/`
- Create: `workflows/.claude-plugin/`

**Step 1: Create css-development plugin directory**

```bash
mkdir -p css-development/.claude-plugin
```

**Step 2: Create firebase-development plugin directory**

```bash
mkdir -p firebase-development/.claude-plugin
```

**Step 3: Create terminal-title plugin directory**

```bash
mkdir -p terminal-title/.claude-plugin
```

**Step 4: Create workflows plugin directory**

```bash
mkdir -p workflows/.claude-plugin
```

**Step 5: Verify directories created**

Run: `ls -la */`.claude-plugin/`
Expected: Four directories with .claude-plugin subdirectories

**Step 6: Commit directory structure**

```bash
git add css-development/ firebase-development/ terminal-title/ workflows/
git commit -m "feat: create plugin directory structures

Create directory structure for four plugins:
- css-development
- firebase-development
- terminal-title
- workflows

Each plugin gets its own .claude-plugin/ subdirectory for plugin.json."
```

---

## Task 2: Create css-development plugin.json

**Files:**
- Create: `css-development/.claude-plugin/plugin.json`

**Step 1: Write css-development plugin.json**

```json
{
  "name": "css-development",
  "description": "CSS development workflows with Tailwind composition, semantic naming, and dark mode by default",
  "version": "1.0.0",
  "commands": []
}
```

**Step 2: Verify JSON is valid**

Run: `cat css-development/.claude-plugin/plugin.json | jq .`
Expected: JSON parses successfully

**Step 3: Commit css-development plugin.json**

```bash
git add css-development/.claude-plugin/plugin.json
git commit -m "feat: add css-development plugin.json

Define css-development plugin configuration with name, description, and version."
```

---

## Task 3: Create firebase-development plugin.json

**Files:**
- Create: `firebase-development/.claude-plugin/plugin.json`

**Step 1: Write firebase-development plugin.json**

```json
{
  "name": "firebase-development",
  "description": "Firebase project workflows including setup, features, debugging, and validation",
  "version": "1.0.0",
  "commands": []
}
```

**Step 2: Verify JSON is valid**

Run: `cat firebase-development/.claude-plugin/plugin.json | jq .`
Expected: JSON parses successfully

**Step 3: Commit firebase-development plugin.json**

```bash
git add firebase-development/.claude-plugin/plugin.json
git commit -m "feat: add firebase-development plugin.json

Define firebase-development plugin configuration with name, description, and version."
```

---

## Task 4: Create terminal-title plugin.json

**Files:**
- Create: `terminal-title/.claude-plugin/plugin.json`

**Step 1: Write terminal-title plugin.json**

```json
{
  "name": "terminal-title",
  "description": "Automatically updates terminal title with emoji + project + topic context",
  "version": "1.0.0",
  "commands": []
}
```

**Step 2: Verify JSON is valid**

Run: `cat terminal-title/.claude-plugin/plugin.json | jq .`
Expected: JSON parses successfully

**Step 3: Commit terminal-title plugin.json**

```bash
git add terminal-title/.claude-plugin/plugin.json
git commit -m "feat: add terminal-title plugin.json

Define terminal-title plugin configuration with name, description, and version."
```

---

## Task 5: Create workflows plugin.json

**Files:**
- Create: `workflows/.claude-plugin/plugin.json`

**Step 1: Write workflows plugin.json**

```json
{
  "name": "workflows",
  "description": "2389 workflow conventions including terminal title updates and TodoWrite patterns",
  "version": "1.0.0",
  "commands": []
}
```

**Step 2: Verify JSON is valid**

Run: `cat workflows/.claude-plugin/plugin.json | jq .`
Expected: JSON parses successfully

**Step 3: Commit workflows plugin.json**

```bash
git add workflows/.claude-plugin/plugin.json
git commit -m "feat: add workflows plugin.json

Define workflows plugin configuration (renamed from using-2389-skills) with name, description, and version."
```

---

## Task 6: Move css-development Skills

**Files:**
- Move: `skills/css-development/` → `css-development/skills/`

**Step 1: Move css-development skill directory**

```bash
mv skills/css-development css-development/skills
```

**Step 2: Verify skill files moved**

Run: `ls -R css-development/skills/`
Expected: SKILL.md, create-component/, validate/, refactor/ subdirectories visible

**Step 3: Commit moved skills**

```bash
git add css-development/skills/ skills/
git commit -m "refactor: move css-development skills to plugin directory

Move skills/css-development to css-development/skills/ to make the plugin self-contained."
```

---

## Task 7: Move firebase-development Skills

**Files:**
- Move: `skills/firebase-development/` → `firebase-development/skills/`

**Step 1: Move firebase-development skill directory**

```bash
mv skills/firebase-development firebase-development/skills
```

**Step 2: Verify skill files moved**

Run: `ls -R firebase-development/skills/`
Expected: SKILL.md, project-setup/, add-feature/, debug/, validate/ subdirectories visible

**Step 3: Commit moved skills**

```bash
git add firebase-development/skills/ skills/
git commit -m "refactor: move firebase-development skills to plugin directory

Move skills/firebase-development to firebase-development/skills/ to make the plugin self-contained."
```

---

## Task 8: Move terminal-title Skills

**Files:**
- Move: `skills/terminal-title/` → `terminal-title/skills/`

**Step 1: Move terminal-title skill directory**

```bash
mv skills/terminal-title terminal-title/skills
```

**Step 2: Verify skill files moved**

Run: `ls -R terminal-title/skills/`
Expected: SKILL.md and scripts/ subdirectory visible

**Step 3: Commit moved skills**

```bash
git add terminal-title/skills/ skills/
git commit -m "refactor: move terminal-title skills to plugin directory

Move skills/terminal-title to terminal-title/skills/ to make the plugin self-contained."
```

---

## Task 9: Move and Rename workflows Skills

**Files:**
- Move: `skills/using-2389-skills/` → `workflows/skills/`
- Modify: `workflows/skills/SKILL.md` (update frontmatter name)

**Step 1: Move using-2389-skills directory**

```bash
mv skills/using-2389-skills workflows/skills
```

**Step 2: Update skill name in frontmatter**

Open `workflows/skills/SKILL.md` and change:
```yaml
---
name: using-2389-skills
```

To:
```yaml
---
name: workflows
```

**Step 3: Verify skill files moved and renamed**

Run: `head -5 workflows/skills/SKILL.md`
Expected: Frontmatter shows `name: workflows`

**Step 4: Commit moved and renamed skills**

```bash
git add workflows/skills/ skills/
git commit -m "refactor: move and rename workflows skills

Move skills/using-2389-skills to workflows/skills/ and update skill name from 'using-2389-skills' to 'workflows' in frontmatter."
```

---

## Task 10: Create Plugin docs/ Directories

**Files:**
- Create: `css-development/docs/plans/`
- Create: `css-development/docs/examples/`
- Create: `firebase-development/docs/plans/`
- Create: `firebase-development/docs/examples/`
- Create: `terminal-title/docs/`

**Step 1: Create css-development docs structure**

```bash
mkdir -p css-development/docs/plans css-development/docs/examples
```

**Step 2: Create firebase-development docs structure**

```bash
mkdir -p firebase-development/docs/plans firebase-development/docs/examples
```

**Step 3: Create terminal-title docs structure**

```bash
mkdir -p terminal-title/docs
```

**Step 4: Verify directories created**

Run: `find */docs -type d | sort`
Expected: All plugin docs directories listed

**Step 5: Commit docs directory structure**

```bash
git add css-development/docs/ firebase-development/docs/ terminal-title/docs/
git commit -m "feat: create plugin docs directories

Create docs/plans and docs/examples directories for each plugin to hold plugin-specific documentation."
```

---

## Task 11: Move CSS Documentation

**Files:**
- Move: `docs/plans/2025-11-13-css-development-skill-design.md` → `css-development/docs/plans/`
- Move: `docs/plans/2025-11-13-css-development-skill-implementation.md` → `css-development/docs/plans/`
- Move: `docs/examples/css-development-examples.md` → `css-development/docs/examples/`

**Step 1: Move CSS design plans**

```bash
mv docs/plans/2025-11-13-css-development-skill-design.md css-development/docs/plans/
mv docs/plans/2025-11-13-css-development-skill-implementation.md css-development/docs/plans/
```

**Step 2: Move CSS examples**

```bash
mv docs/examples/css-development-examples.md css-development/docs/examples/
```

**Step 3: Verify files moved**

Run: `ls css-development/docs/plans/ css-development/docs/examples/`
Expected: Design, implementation, and examples files present

**Step 4: Commit moved CSS documentation**

```bash
git add css-development/docs/ docs/
git commit -m "refactor: move CSS documentation to plugin directory

Move CSS-specific design docs and examples from root docs/ to css-development/docs/ for better organization."
```

---

## Task 12: Move Firebase Documentation

**Files:**
- Move: `docs/plans/2025-01-14-firebase-skills-design.md` → `firebase-development/docs/plans/`
- Move: `docs/plans/2025-01-14-firebase-skills-implementation.md` → `firebase-development/docs/plans/`
- Move: `docs/examples/api-key-authentication.md` → `firebase-development/docs/examples/`
- Move: `docs/examples/emulator-workflow.md` → `firebase-development/docs/examples/`
- Move: `docs/examples/express-function-architecture.md` → `firebase-development/docs/examples/`
- Move: `docs/examples/firestore-rules-patterns.md` → `firebase-development/docs/examples/`
- Move: `docs/examples/multi-hosting-setup.md` → `firebase-development/docs/examples/`

**Step 1: Move Firebase design plans**

```bash
mv docs/plans/2025-01-14-firebase-skills-design.md firebase-development/docs/plans/
mv docs/plans/2025-01-14-firebase-skills-implementation.md firebase-development/docs/plans/
```

**Step 2: Move Firebase examples**

```bash
mv docs/examples/api-key-authentication.md firebase-development/docs/examples/
mv docs/examples/emulator-workflow.md firebase-development/docs/examples/
mv docs/examples/express-function-architecture.md firebase-development/docs/examples/
mv docs/examples/firestore-rules-patterns.md firebase-development/docs/examples/
mv docs/examples/multi-hosting-setup.md firebase-development/docs/examples/
```

**Step 3: Verify files moved**

Run: `ls firebase-development/docs/plans/ firebase-development/docs/examples/`
Expected: Design docs and 5 example files present

**Step 4: Commit moved Firebase documentation**

```bash
git add firebase-development/docs/ docs/
git commit -m "refactor: move Firebase documentation to plugin directory

Move Firebase-specific design docs and examples from root docs/ to firebase-development/docs/ for better organization."
```

---

## Task 13: Move Terminal Title Documentation

**Files:**
- Move: `docs/plans/2025-11-14-terminal-title-skill-design.md` → `terminal-title/docs/`
- Move: `docs/plans/2025-11-14-terminal-title-implementation.md` → `terminal-title/docs/`

**Step 1: Move terminal-title design plans**

```bash
mv docs/plans/2025-11-14-terminal-title-skill-design.md terminal-title/docs/
mv docs/plans/2025-11-14-terminal-title-implementation.md terminal-title/docs/
```

**Step 2: Verify files moved**

Run: `ls terminal-title/docs/`
Expected: Design and implementation files present

**Step 3: Commit moved terminal-title documentation**

```bash
git add terminal-title/docs/ docs/
git commit -m "refactor: move terminal-title documentation to plugin directory

Move terminal-title design docs from root docs/plans/ to terminal-title/docs/ for better organization."
```

---

## Task 14: Create Plugin tests/ Directories

**Files:**
- Create: `css-development/tests/integration/`
- Create: `firebase-development/tests/integration/`
- Create: `terminal-title/tests/integration/`

**Step 1: Create test directories**

```bash
mkdir -p css-development/tests/integration
mkdir -p firebase-development/tests/integration
mkdir -p terminal-title/tests/integration
```

**Step 2: Verify directories created**

Run: `find */tests -type d | sort`
Expected: All plugin test directories listed

**Step 3: Commit test directory structure**

```bash
git add css-development/tests/ firebase-development/tests/ terminal-title/tests/
git commit -m "feat: create plugin test directories

Create tests/integration directories for each plugin to hold plugin-specific integration tests."
```

---

## Task 15: Move CSS Tests

**Files:**
- Move: `tests/integration/skill-routing.test.md` → `css-development/tests/integration/`

**Step 1: Move CSS test file**

```bash
mv tests/integration/skill-routing.test.md css-development/tests/integration/
```

**Step 2: Verify file moved**

Run: `ls css-development/tests/integration/`
Expected: skill-routing.test.md present

**Step 3: Commit moved CSS test**

```bash
git add css-development/tests/ tests/
git commit -m "refactor: move CSS test to plugin directory

Move skill-routing test from root tests/ to css-development/tests/ for better organization."
```

---

## Task 16: Move Firebase Tests

**Files:**
- Move: `tests/integration/firebase-skill-routing.test.md` → `firebase-development/tests/integration/`

**Step 1: Move Firebase test file**

```bash
mv tests/integration/firebase-skill-routing.test.md firebase-development/tests/integration/
```

**Step 2: Verify file moved**

Run: `ls firebase-development/tests/integration/`
Expected: firebase-skill-routing.test.md present

**Step 3: Commit moved Firebase test**

```bash
git add firebase-development/tests/ tests/
git commit -m "refactor: move Firebase test to plugin directory

Move firebase-skill-routing test from root tests/ to firebase-development/tests/ for better organization."
```

---

## Task 17: Move Terminal Title Tests

**Files:**
- Move: `tests/integration/terminal-title.test.md` → `terminal-title/tests/integration/`

**Step 1: Move terminal-title test file**

```bash
mv tests/integration/terminal-title.test.md terminal-title/tests/integration/
```

**Step 2: Verify file moved**

Run: `ls terminal-title/tests/integration/`
Expected: terminal-title.test.md present

**Step 3: Commit moved terminal-title test**

```bash
git add terminal-title/tests/ tests/
git commit -m "refactor: move terminal-title test to plugin directory

Move terminal-title test from root tests/ to terminal-title/tests/ for better organization."
```

---

## Task 18: Move Hooks Configuration

**Files:**
- Move: `hooks/hooks.json` → `terminal-title/hooks/hooks.json`

**Step 1: Create terminal-title hooks directory**

```bash
mkdir -p terminal-title/hooks
```

**Step 2: Move hooks.json**

```bash
mv hooks/hooks.json terminal-title/hooks/
```

**Step 3: Verify file moved**

Run: `cat terminal-title/hooks/hooks.json`
Expected: JSON with sessionStart hook for terminal-title skill

**Step 4: Commit moved hooks**

```bash
git add terminal-title/hooks/ hooks/
git commit -m "refactor: move hooks config to terminal-title plugin

Move hooks/hooks.json to terminal-title/hooks/ so hook configuration travels with the plugin."
```

---

## Task 19: Create css-development README.md

**Files:**
- Create: `css-development/README.md`

**Step 1: Write css-development README.md**

```markdown
# CSS Development Plugin

CSS development workflows with Tailwind composition, semantic naming, and dark mode by default.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install css-development@2389-research
```

## What This Plugin Provides

Skills for CSS development following 2389 patterns:

- **css-development** - Main orchestrator skill that routes to specific sub-skills
- **css-development:create-component** - Create new styled components
- **css-development:validate** - Validate CSS against patterns
- **css-development:refactor** - Refactor existing CSS

## Patterns

This plugin enforces:

- **Semantic class naming**: `.user-profile`, `.nav-menu` (not `.container-1`, `.box-blue`)
- **Tailwind composition**: Use `@apply` to compose utilities into semantic classes
- **Dark mode by default**: Every component includes `dark:` variants
- **Test coverage**: Static analysis + component rendering tests

## Reference Codebase

Patterns are based on: `/Users/dylanr/work/2389/oneonone/hosting`

## Quick Example

```css
.user-profile {
  @apply flex items-center space-x-4 p-4 bg-white dark:bg-gray-800;
}

.user-profile__avatar {
  @apply w-12 h-12 rounded-full;
}

.user-profile__name {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100;
}
```

## Optional: Install Workflows Plugin

For enhanced integration with 2389 conventions:
```bash
/plugin install workflows@2389-research
```

## Documentation

- [Design Document](docs/plans/2025-11-13-css-development-skill-design.md)
- [Implementation Plan](docs/plans/2025-11-13-css-development-skill-implementation.md)
- [Examples](docs/examples/css-development-examples.md)

## License

Internal use only - 2389 Research
```

**Step 2: Commit css-development README**

```bash
git add css-development/README.md
git commit -m "docs: add css-development README

Public-facing documentation for css-development plugin including installation, patterns, and examples."
```

---

## Task 20: Create firebase-development README.md

**Files:**
- Create: `firebase-development/README.md`

**Step 1: Write firebase-development README.md**

```markdown
# Firebase Development Plugin

Firebase project workflows including setup, features, debugging, and validation.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install firebase-development@2389-research
```

## What This Plugin Provides

Skills for Firebase development following 2389 patterns:

- **firebase-development** - Main orchestrator skill that routes to specific sub-skills
- **firebase-development:project-setup** - Initialize new Firebase projects
- **firebase-development:add-feature** - Add features to existing projects
- **firebase-development:debug** - Debug Firebase issues
- **firebase-development:validate** - Validate project structure

## Patterns

This plugin supports:

- **Multi-hosting setup**: Multiple sites or single hosting
- **Authentication**: Custom API keys, Firebase Auth, or both
- **Cloud Functions**: Express, domain-grouped, or individual files
- **Security models**: Server-write-only vs client-write with validation
- **Emulator-first development**: Always test locally before deploying
- **Modern tooling**: TypeScript, vitest, biome

## Reference Codebases

Patterns are based on:
- **oneonone**: `/Users/dylanr/work/2389/oneonone` (Express API, custom API keys)
- **bot-socialmedia**: `/Users/dylanr/work/2389/bot-socialmedia-server` (Domain-grouped, Firebase Auth)
- **meme-rodeo**: `/Users/dylanr/work/2389/meme-rodeo` (Individual functions, entitlements)

## Quick Example

```typescript
// Cloud Function with domain grouping
export const users = {
  onCreate: onDocumentCreated('users/{userId}', async (event) => {
    // Implementation
  }),
  onUpdate: onDocumentUpdated('users/{userId}', async (event) => {
    // Implementation
  })
};
```

## Optional: Install Workflows Plugin

For enhanced integration with 2389 conventions:
```bash
/plugin install workflows@2389-research
```

## Documentation

- [Design Document](docs/plans/2025-01-14-firebase-skills-design.md)
- [Implementation Plan](docs/plans/2025-01-14-firebase-skills-implementation.md)
- Examples:
  - [API Key Authentication](docs/examples/api-key-authentication.md)
  - [Emulator Workflow](docs/examples/emulator-workflow.md)
  - [Express Function Architecture](docs/examples/express-function-architecture.md)
  - [Firestore Rules Patterns](docs/examples/firestore-rules-patterns.md)
  - [Multi-Hosting Setup](docs/examples/multi-hosting-setup.md)

## License

Internal use only - 2389 Research
```

**Step 2: Commit firebase-development README**

```bash
git add firebase-development/README.md
git commit -m "docs: add firebase-development README

Public-facing documentation for firebase-development plugin including installation, patterns, and examples."
```

---

## Task 21: Create terminal-title README.md

**Files:**
- Create: `terminal-title/README.md`

**Step 1: Write terminal-title README.md**

```markdown
# Terminal Title Plugin

Automatically updates terminal title with emoji + project + topic context.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install terminal-title@2389-research
```

## What This Plugin Provides

Automatic terminal title management:

- **Auto-invokes at session start**: Sets initial title based on project context
- **Updates on topic changes**: Reflects current work in terminal title
- **Emoji indicators**: Visual cues for quick context switching

## How It Works

The plugin includes a session start hook that automatically invokes the terminal-title skill. The skill:

1. Detects current project from working directory
2. Infers topic from recent files or conversation context
3. Selects appropriate emoji based on project type
4. Updates terminal title via shell script

## Example

```
🔥 firebase-app > authentication setup
```

## Optional: Install Workflows Plugin

For enhanced integration with 2389 conventions:
```bash
/plugin install workflows@2389-research
```

## Documentation

- [Design Document](docs/2025-11-14-terminal-title-skill-design.md)
- [Implementation Plan](docs/2025-11-14-terminal-title-implementation.md)

## License

Internal use only - 2389 Research
```

**Step 2: Commit terminal-title README**

```bash
git add terminal-title/README.md
git commit -m "docs: add terminal-title README

Public-facing documentation for terminal-title plugin including installation and usage."
```

---

## Task 22: Create workflows README.md

**Files:**
- Create: `workflows/README.md`

**Step 1: Write workflows README.md**

```markdown
# Workflows Plugin

2389 workflow conventions including terminal title updates and TodoWrite patterns.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install workflows@2389-research
```

## What This Plugin Provides

Establishes workflow conventions used across 2389 projects:

- **Terminal title management**: Standards for terminal title updates
- **TodoWrite patterns**: Granular checklist conventions (2-5 minute tasks)
- **Skill usage patterns**: How to properly invoke and compose skills

## Why Install This Plugin?

Other 2389 plugins reference these conventions but don't require them. Installing the workflows plugin provides:

- Consistent task tracking across all skills
- Terminal title update patterns
- Meta-skill documentation on using 2389 skills effectively

## Used By

These plugins benefit from workflows conventions:
- `css-development` - Uses TodoWrite for task tracking
- `firebase-development` - Uses TodoWrite for task tracking
- `terminal-title` - Follows terminal title standards

## Quick Example

TodoWrite tasks following workflows conventions:

```javascript
{
  content: "Write the failing test",
  status: "in_progress",
  activeForm: "Writing the failing test"
}
```

## Documentation

See [SKILL.md](skills/SKILL.md) for complete workflow conventions.

## License

Internal use only - 2389 Research
```

**Step 2: Commit workflows README**

```bash
git add workflows/README.md
git commit -m "docs: add workflows README

Public-facing documentation for workflows plugin (renamed from using-2389-skills) including conventions and usage."
```

---

## Task 23: Update marketplace.json with Plugin References

**Files:**
- Modify: `.claude-plugin/marketplace.json`

**Step 1: Replace the "2389" plugin entry with four plugin entries**

Open `.claude-plugin/marketplace.json` and replace the "2389" plugin object (lines 12-29) with:

```json
        {
            "name": "css-development",
            "source": "./css-development",
            "description": "CSS development workflows with Tailwind composition, semantic naming, and dark mode by default",
            "version": "1.0.0",
            "keywords": [
                "css",
                "tailwind",
                "styling",
                "components",
                "dark-mode"
            ],
            "strict": false
        },
        {
            "name": "firebase-development",
            "source": "./firebase-development",
            "description": "Firebase project workflows including setup, features, debugging, and validation",
            "version": "1.0.0",
            "keywords": [
                "firebase",
                "firestore",
                "cloud-functions",
                "hosting",
                "emulator"
            ],
            "strict": false
        },
        {
            "name": "terminal-title",
            "source": "./terminal-title",
            "description": "Automatically updates terminal title with emoji + project + topic context",
            "version": "1.0.0",
            "keywords": [
                "terminal",
                "title",
                "session",
                "context"
            ],
            "strict": false
        },
        {
            "name": "workflows",
            "source": "./workflows",
            "description": "2389 workflow conventions including terminal title updates and TodoWrite patterns",
            "version": "1.0.0",
            "keywords": [
                "workflows",
                "conventions",
                "todowrite",
                "patterns"
            ],
            "strict": false
        },
```

**Step 2: Verify JSON is valid**

Run: `cat .claude-plugin/marketplace.json | jq .`
Expected: JSON parses successfully with four plugins + three external MCP servers

**Step 3: Commit updated marketplace.json**

```bash
git add .claude-plugin/marketplace.json
git commit -m "refactor: update marketplace to reference four plugins

Replace single monolithic '2389' plugin with four independent plugins:
- css-development (relative path)
- firebase-development (relative path)
- terminal-title (relative path)
- workflows (relative path)

External MCP servers (agent-drugs, socialmedia, journal) remain unchanged."
```

---

## Task 24: Clean Up Empty Directories

**Files:**
- Delete: `skills/` (now empty)
- Delete: `tests/` (now empty)
- Delete: `hooks/` (now empty)

**Step 1: Verify directories are empty**

Run: `ls -la skills/ tests/ hooks/`
Expected: Empty directories

**Step 2: Remove empty directories**

```bash
rmdir skills/
rmdir tests/integration/
rmdir tests/
rmdir hooks/
```

**Step 3: Verify directories removed**

Run: `ls -la skills/ tests/ hooks/ 2>&1`
Expected: "No such file or directory" errors

**Step 4: Commit removal**

```bash
git add -A
git commit -m "refactor: remove empty directories

Remove skills/, tests/, and hooks/ directories now that all content has been moved into plugin directories."
```

---

## Task 25: Create New Root README.md

**Files:**
- Modify: `README.md` (rewrite completely)

**Step 1: Write new root README.md**

```markdown
# 2389 Research Internal Marketplace

Internal development marketplace for 2389 - Claude Code plugins and skills for our team's workflows.

## Installation

Add the marketplace:

```bash
/plugin marketplace add 2389-research/claude-plugins
```

Install plugins individually:

```bash
/plugin install css-development@2389-research
/plugin install firebase-development@2389-research
/plugin install terminal-title@2389-research
/plugin install workflows@2389-research
```

## Available Plugins

| Plugin | Description | Documentation |
|--------|-------------|---------------|
| [css-development](css-development/) | CSS development workflows with Tailwind composition, semantic naming, and dark mode by default | [README](css-development/README.md) |
| [firebase-development](firebase-development/) | Firebase project workflows including setup, features, debugging, and validation | [README](firebase-development/README.md) |
| [terminal-title](terminal-title/) | Automatically updates terminal title with emoji + project + topic context | [README](terminal-title/README.md) |
| [workflows](workflows/) | 2389 workflow conventions including terminal title updates and TodoWrite patterns | [README](workflows/README.md) |

## External MCP Servers

This marketplace also lists external MCP servers:

- **agent-drugs** - Digital drugs that modify AI behavior through prompt injection
- **socialmedia** - Social media functionality for AI agents
- **journal** - Private journaling capability for Claude

## Marketplace Site

Browse the marketplace: [https://2389-research.github.io/claude-plugins](https://2389-research.github.io/claude-plugins)

## Repository Structure

This is a monorepo containing multiple independent plugins. Each plugin:

- Lives in its own directory (`css-development/`, `firebase-development/`, etc.)
- Has its own `.claude-plugin/plugin.json` configuration
- Contains its own skills, docs, and tests
- Can be installed independently

See [CLAUDE.md](CLAUDE.md) for developer documentation on the monorepo structure and conventions.

## Contributing

### Adding a New Plugin

1. Create plugin directory: `mkdir -p new-plugin/.claude-plugin`
2. Write `new-plugin/.claude-plugin/plugin.json`
3. Add skills to `new-plugin/skills/`
4. Create `new-plugin/README.md` and `new-plugin/CLAUDE.md`
5. Update `.claude-plugin/marketplace.json` with new plugin entry
6. Regenerate marketplace site: `npm run generate`

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for comprehensive development guide.

## License

Internal use only - 2389 Research

## Resources

- **Claude Code Documentation:** https://code.claude.com/docs
- **Skills Guide:** https://code.claude.com/docs/en/skills
- **Plugin Development:** https://code.claude.com/docs/en/plugins
```

**Step 2: Commit new root README**

```bash
git add README.md
git commit -m "docs: rewrite root README for monorepo structure

Replace monolithic plugin documentation with marketplace overview listing four independent plugins with installation instructions and plugin table."
```

---

## Task 26: Regenerate Marketplace Site

**Files:**
- Modify: `docs/index.html` (regenerated)

**Step 1: Regenerate marketplace site**

```bash
npm run generate
```

**Step 2: Verify site updated**

Run: `grep -c "css-development" docs/index.html`
Expected: Count > 0 (plugin listed in generated site)

Run: `grep -c "firebase-development" docs/index.html`
Expected: Count > 0

Run: `grep -c "terminal-title" docs/index.html`
Expected: Count > 0

Run: `grep -c "workflows" docs/index.html`
Expected: Count > 0

**Step 3: Commit regenerated site**

```bash
git add docs/index.html
git commit -m "build: regenerate marketplace site with new plugins

Update docs/index.html to reflect four independent plugins instead of single monolithic plugin."
```

---

## Task 27: Create css-development CLAUDE.md

**Files:**
- Create: `css-development/CLAUDE.md`

**Step 1: Extract CSS-specific content from root CLAUDE.md**

Read the current root CLAUDE.md and extract the CSS development sections. Write to `css-development/CLAUDE.md`:

```markdown
# CSS Development Plugin

## Overview

This plugin provides CSS development workflows with Tailwind composition, semantic naming, and dark mode by default.

## Skills Included

### Main Skill: css-development

Orchestrator skill that routes to specific sub-skills based on user intent:
- Creating new components → `css-development:create-component`
- Validating existing CSS → `css-development:validate`
- Refactoring CSS code → `css-development:refactor`

### Sub-Skills

- **css-development:create-component** - Create new styled components following 2389 patterns
- **css-development:validate** - Validate CSS against semantic naming, Tailwind usage, and dark mode
- **css-development:refactor** - Refactor existing CSS to meet 2389 standards

## Patterns

### Semantic Class Naming

Use descriptive class names that indicate purpose:

```css
✅ .user-profile
✅ .nav-menu
✅ .button-primary

❌ .container-1
❌ .box-blue
❌ .div-wrapper
```

### Tailwind Composition

Compose Tailwind utilities into semantic classes using `@apply`:

```css
.user-profile {
  @apply flex items-center space-x-4 p-4;
  @apply bg-white dark:bg-gray-800;
}
```

### Dark Mode by Default

Every component must include dark mode variants:

```css
.card {
  @apply bg-white dark:bg-gray-800;
  @apply text-gray-900 dark:text-gray-100;
  @apply border-gray-200 dark:border-gray-700;
}
```

## Reference Codebase

Patterns are based on: `/Users/dylanr/work/2389/oneonone/hosting`

This codebase demonstrates:
- Semantic class naming throughout
- Tailwind composition patterns
- Comprehensive dark mode coverage
- Component organization

## Development Workflow

1. **Auto-detection**: Skills auto-detect when CSS work is mentioned
2. **Routing**: Main skill routes to appropriate sub-skill
3. **TodoWrite integration**: Creates granular checklists for tasks
4. **Pattern validation**: Validates against 2389 standards

## Testing

Tests are located in `tests/integration/`:
- `skill-routing.test.md` - Tests skill auto-detection and routing

## Documentation

- [Design Document](docs/plans/2025-11-13-css-development-skill-design.md)
- [Implementation Plan](docs/plans/2025-11-13-css-development-skill-implementation.md)
- [Examples](docs/examples/css-development-examples.md)

## Integration with Workflows Plugin

The workflows plugin provides:
- TodoWrite conventions for task tracking
- Terminal title update patterns
- Meta-skill usage guidance

To install: `/plugin install workflows@2389-research`
```

**Step 2: Commit css-development CLAUDE.md**

```bash
git add css-development/CLAUDE.md
git commit -m "docs: add css-development CLAUDE.md

Plugin-specific instructions for Claude including patterns, reference codebase, and development workflow."
```

---

## Task 28: Create firebase-development CLAUDE.md

**Files:**
- Create: `firebase-development/CLAUDE.md`

**Step 1: Write firebase-development CLAUDE.md**

```markdown
# Firebase Development Plugin

## Overview

This plugin provides Firebase project workflows including setup, features, debugging, and validation.

## Skills Included

### Main Skill: firebase-development

Orchestrator skill that routes to specific sub-skills based on user intent:
- New project setup → `firebase-development:project-setup`
- Adding features → `firebase-development:add-feature`
- Debugging issues → `firebase-development:debug`
- Validating structure → `firebase-development:validate`

### Sub-Skills

- **firebase-development:project-setup** - Initialize new Firebase projects with proper structure
- **firebase-development:add-feature** - Add features to existing Firebase projects
- **firebase-development:debug** - Debug Firebase-related issues systematically
- **firebase-development:validate** - Validate Firebase project structure and configuration

## Patterns

### Multi-Hosting Setup

Support both single hosting and multiple sites:

```json
{
  "hosting": [
    {
      "site": "main-site",
      "public": "dist",
      "rewrites": [...]
    },
    {
      "site": "admin-site",
      "public": "admin-dist",
      "rewrites": [...]
    }
  ]
}
```

### Authentication Models

Three authentication patterns:
1. **Custom API keys** - Server-side validation
2. **Firebase Auth** - Client-side authentication
3. **Hybrid** - Both methods for different use cases

### Cloud Functions Organization

Three organizational patterns:

**Express API:**
```typescript
const app = express();
app.get('/api/users', async (req, res) => { ... });
export const api = onRequest(app);
```

**Domain-grouped:**
```typescript
export const users = {
  onCreate: onDocumentCreated(...),
  onUpdate: onDocumentUpdated(...)
};
```

**Individual files:**
```typescript
export const userOnCreate = onDocumentCreated(...);
export const userOnUpdate = onDocumentUpdated(...);
```

### Emulator-First Development

Always develop locally with emulators before deploying:

```bash
firebase emulators:start
```

## Reference Codebases

### oneonone
Path: `/Users/dylanr/work/2389/oneonone`

- Express API architecture
- Custom API key authentication
- Server-write-only security model
- Single hosting configuration

### bot-socialmedia
Path: `/Users/dylanr/work/2389/bot-socialmedia-server`

- Domain-grouped functions
- Firebase Auth integration
- Client-write with validation rules
- Complex security rules

### meme-rodeo
Path: `/Users/dylanr/work/2389/meme-rodeo`

- Individual function files
- Entitlements system
- User permissions
- Fine-grained access control

## Development Workflow

1. **Auto-detection**: Skills auto-detect when Firebase work is mentioned
2. **Routing**: Main skill routes to appropriate sub-skill based on context
3. **TodoWrite integration**: Creates granular checklists for tasks
4. **Emulator testing**: Always test locally before deployment

## Testing

Tests are located in `tests/integration/`:
- `firebase-skill-routing.test.md` - Tests skill auto-detection and routing

## Documentation

### Design & Implementation
- [Design Document](docs/plans/2025-01-14-firebase-skills-design.md)
- [Implementation Plan](docs/plans/2025-01-14-firebase-skills-implementation.md)

### Examples
- [API Key Authentication](docs/examples/api-key-authentication.md)
- [Emulator Workflow](docs/examples/emulator-workflow.md)
- [Express Function Architecture](docs/examples/express-function-architecture.md)
- [Firestore Rules Patterns](docs/examples/firestore-rules-patterns.md)
- [Multi-Hosting Setup](docs/examples/multi-hosting-setup.md)

## Integration with Workflows Plugin

The workflows plugin provides:
- TodoWrite conventions for task tracking
- Terminal title update patterns
- Meta-skill usage guidance

To install: `/plugin install workflows@2389-research`
```

**Step 2: Commit firebase-development CLAUDE.md**

```bash
git add firebase-development/CLAUDE.md
git commit -m "docs: add firebase-development CLAUDE.md

Plugin-specific instructions for Claude including patterns, reference codebases, and development workflow."
```

---

## Task 29: Create terminal-title CLAUDE.md

**Files:**
- Create: `terminal-title/CLAUDE.md`

**Step 1: Write terminal-title CLAUDE.md**

```markdown
# Terminal Title Plugin

## Overview

This plugin automatically updates the terminal title with emoji + project + topic context to provide visual cues when switching between terminal windows.

## Skills Included

### terminal-title

Auto-invoked skill that:
1. Detects current project from working directory
2. Infers topic from recent files or conversation context
3. Selects appropriate emoji based on project type
4. Updates terminal title via shell script

## Hook Configuration

The plugin includes a session start hook:

```json
{
  "hooks": {
    "sessionStart": {
      "skill": "terminal-title"
    }
  }
}
```

This ensures the terminal title is set automatically when Claude Code starts.

## How It Works

### Project Detection

Determines project from:
- Working directory name
- Git repository name
- Project-specific files (package.json, pyproject.toml, etc.)

### Topic Inference

Infers topic from:
- Recent git commits
- Modified files in working directory
- Conversation context

### Emoji Selection

Maps project types to emojis:
- 🔥 Firebase projects
- ⚛️  React projects
- 🐍 Python projects
- 📦 Node.js projects
- 🎨 CSS/design work
- 🔧 General development

### Shell Script

Uses `scripts/set_title.sh` to update terminal title:

```bash
#!/bin/bash
echo -ne "\033]0;$1\007"
```

## Development Workflow

1. **Session start**: Hook auto-invokes skill
2. **Context detection**: Analyzes project and topic
3. **Title update**: Calls shell script with formatted title
4. **Runtime updates**: Responds to topic changes during session

## Testing

Tests are located in `tests/integration/`:
- `terminal-title.test.md` - Tests auto-invocation and title updates

## Documentation

- [Design Document](docs/2025-11-14-terminal-title-skill-design.md)
- [Implementation Plan](docs/2025-11-14-terminal-title-implementation.md)

## Integration with Workflows Plugin

The workflows plugin provides standards for terminal title format and update patterns.

To install: `/plugin install workflows@2389-research`
```

**Step 2: Commit terminal-title CLAUDE.md**

```bash
git add terminal-title/CLAUDE.md
git commit -m "docs: add terminal-title CLAUDE.md

Plugin-specific instructions for Claude including how the skill works, hook configuration, and development workflow."
```

---

## Task 30: Create workflows CLAUDE.md

**Files:**
- Create: `workflows/CLAUDE.md`

**Step 1: Write workflows CLAUDE.md**

```markdown
# Workflows Plugin

## Overview

This plugin establishes workflow conventions used across all 2389 plugins. Other plugins reference these conventions but don't require them.

## Skills Included

### workflows

Meta-skill that establishes:
- Terminal title update conventions
- TodoWrite task tracking patterns
- Skill composition and usage patterns

## Conventions

### Terminal Title Updates

Standard format: `[emoji] [project] > [topic]`

Examples:
- `🔥 firebase-app > authentication setup`
- `⚛️  react-dashboard > user profile component`
- `🎨 design-system > dark mode theming`

### TodoWrite Patterns

Each task should be granular (2-5 minutes):

```javascript
{
  content: "Write the failing test",      // Imperative form
  status: "pending",                       // or "in_progress" or "completed"
  activeForm: "Writing the failing test"   // Present continuous form
}
```

**Task lifecycle:**
1. Create todos for all steps
2. Mark ONE task as in_progress
3. Complete the task
4. Mark as completed
5. Move to next task

**Never:**
- Batch complete multiple tasks
- Have multiple tasks in_progress
- Skip marking tasks completed

### Skill Usage Patterns

**Finding relevant skills:**
1. Check available skills list
2. Match user intent to skill description
3. Invoke appropriate skill or sub-skill

**Composing skills:**
- Skills can reference other skills with `@skill-name` syntax
- Sub-skills use colon notation: `parent-skill:sub-skill`
- Always check skill frontmatter for exact name

## Development Workflow

This is a meta-skill that doesn't perform work directly. It establishes patterns used by other skills:

- `css-development` uses TodoWrite conventions
- `firebase-development` uses TodoWrite conventions
- `terminal-title` follows title format conventions

## Used By

These plugins benefit from workflows conventions:
- css-development
- firebase-development
- terminal-title

## Documentation

See [skills/SKILL.md](skills/SKILL.md) for complete workflow documentation.

## Integration

Other plugins reference workflows conventions but don't require installation. Installing workflows provides:
- Explicit documentation of conventions
- Meta-skill for skill usage guidance
- Centralized pattern reference
```

**Step 2: Commit workflows CLAUDE.md**

```bash
git add workflows/CLAUDE.md
git commit -m "docs: add workflows CLAUDE.md

Plugin-specific instructions for Claude including workflow conventions, TodoWrite patterns, and skill usage guidance."
```

---

## Task 31: Update Root CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (rewrite to focus on monorepo structure)

**Step 1: Read current CLAUDE.md and rewrite for monorepo focus**

The new root CLAUDE.md should focus on:
- Monorepo structure explanation
- How to add new plugins
- Shared conventions across all plugins
- Marketplace site generation
- Links to plugin-specific CLAUDE.md files

Remove skill-specific content (now in plugin CLAUDE.md files).

**Step 2: Write new root CLAUDE.md** (content too long for single step, see next task)

---

## Task 32: Write New Root CLAUDE.md Content

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Write new monorepo-focused CLAUDE.md**

Write a new CLAUDE.md that explains the monorepo structure, how to add plugins, and links to plugin-specific documentation. Keep shared conventions (ABOUTME comments, TDD, etc.) but remove skill-specific patterns.

Key sections:
- Repository purpose (monorepo marketplace)
- Plugin structure (each has .claude-plugin/plugin.json)
- How to add new plugins
- Marketplace site generation
- Links to plugin CLAUDE.md files
- Shared conventions (ABOUTME, TDD, commits, etc.)

**Step 2: Commit updated root CLAUDE.md**

```bash
git add CLAUDE.md
git commit -m "docs: update root CLAUDE.md for monorepo structure

Rewrite root CLAUDE.md to focus on monorepo structure and adding plugins. Move skill-specific documentation to plugin CLAUDE.md files."
```

---

## Task 33: Verification - Test Plugin Structure

**Files:**
- None (verification step)

**Step 1: Verify css-development plugin structure**

Run: `ls -R css-development/`
Expected output should show:
- `.claude-plugin/plugin.json`
- `skills/` with CSS skill files
- `docs/plans/` with design docs
- `docs/examples/` with examples
- `tests/integration/` with tests
- `CLAUDE.md`
- `README.md`

**Step 2: Verify firebase-development plugin structure**

Run: `ls -R firebase-development/`
Expected output should show complete plugin structure

**Step 3: Verify terminal-title plugin structure**

Run: `ls -R terminal-title/`
Expected output should show:
- `.claude-plugin/plugin.json`
- `skills/` with terminal-title skill
- `hooks/hooks.json`
- `docs/` with design docs
- `tests/integration/` with tests
- `CLAUDE.md`
- `README.md`

**Step 4: Verify workflows plugin structure**

Run: `ls -R workflows/`
Expected output should show complete plugin structure

**Step 5: Document verification results**

If all structures correct, proceed to next task. If issues found, fix before continuing.

---

## Task 34: Verification - Test Marketplace Configuration

**Files:**
- None (verification step)

**Step 1: Validate marketplace.json syntax**

Run: `cat .claude-plugin/marketplace.json | jq .`
Expected: JSON parses successfully

**Step 2: Verify plugin count**

Run: `cat .claude-plugin/marketplace.json | jq '.plugins | length'`
Expected: 7 (4 local plugins + 3 external MCP servers)

**Step 3: Verify plugin sources**

Run: `cat .claude-plugin/marketplace.json | jq '.plugins[] | select(.source | type == "string") | .name'`
Expected: Lists "css-development", "firebase-development", "terminal-title", "workflows"

**Step 4: Verify external server sources**

Run: `cat .claude-plugin/marketplace.json | jq '.plugins[] | select(.source | type == "object") | .name'`
Expected: Lists "agent-drugs", "socialmedia", "journal"

**Step 5: Document verification results**

If all checks pass, marketplace.json is correctly configured.

---

## Task 35: Verification - Test Generated Site

**Files:**
- None (verification step)

**Step 1: Check generated site exists**

Run: `ls -la docs/index.html`
Expected: File exists and was recently modified

**Step 2: Verify plugins listed in site**

Run: `grep -c "css-development" docs/index.html`
Expected: Count > 0

Run: `grep -c "firebase-development" docs/index.html`
Expected: Count > 0

Run: `grep -c "terminal-title" docs/index.html`
Expected: Count > 0

Run: `grep -c "workflows" docs/index.html`
Expected: Count > 0

**Step 3: Verify external servers listed**

Run: `grep -c "agent-drugs" docs/index.html`
Expected: Count > 0

Run: `grep -c "socialmedia" docs/index.html`
Expected: Count > 0

Run: `grep -c "journal" docs/index.html`
Expected: Count > 0

**Step 4: Document verification results**

If all checks pass, generated site correctly reflects new structure.

---

## Task 36: Final Commit - Migration Complete

**Files:**
- None (final commit)

**Step 1: Verify git status is clean**

Run: `git status`
Expected: "nothing to commit, working tree clean"

**Step 2: Verify all commits made**

Run: `git log --oneline | head -20`
Expected: Should see all commits from this migration

**Step 3: Create summary of changes**

Run: `git diff HEAD~30 --stat`
Expected: Summary of all file changes in migration

**Step 4: Document completion**

Migration complete. Repository transformed from single monolithic plugin to monorepo with four independent plugins.

---

## Success Criteria

After completing all tasks:

- [x] Four plugin directories created with proper structure
- [x] Each plugin has its own plugin.json
- [x] Skills moved to respective plugin directories
- [x] Documentation distributed to plugins
- [x] Tests distributed to plugins
- [x] Hooks moved to terminal-title plugin
- [x] README.md created for each plugin
- [x] CLAUDE.md created for each plugin
- [x] Root CLAUDE.md updated for monorepo
- [x] Root README.md rewritten as marketplace overview
- [x] marketplace.json references four plugins via relative paths
- [x] Empty directories cleaned up
- [x] Marketplace site regenerated
- [x] All changes committed with clear messages

## Next Steps

After implementation:

1. Test plugin installation locally
2. Verify skills load correctly for each plugin
3. Run integration tests for each plugin
4. Push to GitHub
5. Test remote installation from marketplace
6. Update any external documentation references

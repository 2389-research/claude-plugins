# README Redesign - 2025-11-14

## Overview

Comprehensive README redesign focusing on quick-start, skill catalog, and inspiring skill creation. Repository serves as both library (install existing skills) and workspace (develop new skills) for 2389-research team.

## Design Decisions

### Purpose
- **Both library and workspace**: Team members can install existing skills AND develop new ones
- **Inspire skill creation**: Focus on WHEN/WHY to create skills, not overwhelming with mechanics
- **Quick time-to-value**: Get working in < 2 minutes

### Audience Assumptions
- Already using Claude Code
- Familiar with TypeScript, Firebase, our tech stack
- Have context from our projects (oneonone, bot-socialmedia, meme-rodeo)
- Don't need foundational explanations

### Architecture
- **Progressive Disclosure (Layers)**: Start simple, progressively detailed
- **Quick-Start-First flow**: Installation → Usage → Creation → Deep dives
- **Single comprehensive README**: Everything searchable with Cmd+F

### Key Constraints
- Internal team documentation (not public-facing)
- Assume familiarity with our conventions
- Focus on inspiration over instruction for skill creation
- Minimal "how", maximum "why"

## README Structure

### Section 1: Hero & Quick Start
**Goal**: Get working in 2 minutes

```markdown
# 2389 Skills

Claude Code skills for our production workflows.

## Quick Start (2 minutes)

**1. Install (symlink for development):**
```bash
ln -s $(pwd)/css-development ~/.claude/skills/css-development
ln -s $(pwd)/firebase-development ~/.claude/skills/firebase-development
```

**2. Try it:**
Open Claude Code and say: "Create a primary button component"
Claude will automatically load the css-development skill.

**3. That's it.**
Skills are now active. See [Available Skills](#available-skills) for full catalog.
```

**Rationale**: No preamble, immediate action, clear success criteria.

### Section 2: Available Skills (Catalog)
**Goal**: Quick discovery of what's available

```markdown
## Available Skills

### CSS Development

- `css-development` - Routes to specialized workflows based on intent
- `css-development:create-component` - Create new CSS components
- `css-development:validate` - Review CSS against patterns
- `css-development:refactor` - Transform to semantic patterns

**Triggers:** "create button", "review CSS", "refactor styles"

### Firebase Development

- `firebase-development` - Routes based on Firebase task type
- `firebase-development:project-setup` - Initialize new projects
- `firebase-development:add-feature` - Add functions/collections/endpoints
- `firebase-development:debug` - Troubleshoot emulator/rules/functions
- `firebase-development:validate` - Review against security patterns

**Triggers:** "setup Firebase", "add function", "debug emulator error"
```

**Rationale**: Scannable format with trigger phrases. No source project references (team already knows).

### Section 3: Creating New Skills
**Goal**: Inspire skill creation without overwhelming

```markdown
## Creating New Skills

**When to create a skill:**
- You've solved the same problem 3+ times
- There's a pattern you want the team to follow
- You're tired of remembering the steps
- A workflow has subtle gotchas that get missed

**How to create:**
1. Create new directory: `mkdir my-skill-name`
2. Add `my-skill-name/SKILL.md` with YAML frontmatter
3. Test locally with symlink
4. Commit and share

**Examples to learn from:**
- `css-development/` - Orchestrator pattern with sub-skills
- `firebase-development/project-setup/` - TodoWrite workflow integration
- `firebase-development/add-feature/` - AskUserQuestion patterns

See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed guidance.
```

**Rationale**: Focus on WHEN/WHY (inspire adoption). Minimal mechanics. Point to existing skills as templates.

### Section 4: Key Patterns (Layer 2)
**Goal**: Quick reference for enforced patterns

```markdown
## Key Patterns

Quick reference for patterns enforced by skills.

### CSS Development

**Semantic naming:**
```css
.button-primary  /* ✅ Good */
.btn-blue        /* ❌ Bad */
```

**Dark mode by default:**
```css
.card {
  @apply bg-white dark:bg-gray-800;
}
```

**TodoWrite integration:** All workflows create checklists for progress tracking.

### Firebase Development

**API key format:** `{projectPrefix}_` + unique identifier
**Security model:** Prefer server-write-only, client-write with validation only for high-volume
**Emulator-first:** `singleProjectMode: true`, always test locally before deploy
**ABOUTME comments:** Every file starts with 2-line description

### Skill Design Patterns

**Orchestrator + Sub-Skills:** Main skill routes to specialized workflows (see `css-development/`, `firebase-development/`)
**TodoWrite checklists:** Break complex workflows into trackable steps
**AskUserQuestion:** Present architectural choices with trade-offs

[See full pattern documentation →](docs/plans/)
```

**Rationale**: Code examples for copy/paste. Includes skill design patterns for creators. Link to detailed docs.

### Section 5: Repository Structure & Development
**Goal**: Show structure and development workflow

```markdown
## Repository Structure

```
skills/
├── css-development/           # CSS skill system
│   ├── SKILL.md              # Main orchestrator
│   ├── create-component/     # Sub-skill
│   ├── validate/             # Sub-skill
│   └── refactor/             # Sub-skill
├── firebase-development/      # Firebase skill system
│   ├── SKILL.md              # Main orchestrator
│   ├── project-setup/        # Sub-skill
│   ├── add-feature/          # Sub-skill
│   ├── debug/                # Sub-skill
│   └── validate/             # Sub-skill
├── docs/
│   ├── plans/                # Design documents
│   ├── examples/             # Usage examples
│   └── DEVELOPMENT.md        # Detailed development guide
└── tests/integration/        # Manual test scenarios
```

## Development Workflow

**Local development:**
```bash
# Symlink for live updates
ln -s $(pwd)/my-skill ~/.claude/skills/my-skill

# Edit my-skill/SKILL.md
# Test in Claude Code immediately
# Iterate until working
```

**Sharing with team:**
```bash
git add my-skill/
git commit -m "feat: add my-skill for X workflow"
git push origin main
```

Team members pull and their symlinks automatically update.

## Documentation

- [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Comprehensive skill development guide
- [Design Plans](docs/plans/) - Architecture and implementation documentation
- [Examples](docs/examples/) - Real-world usage scenarios
- [Integration Tests](tests/integration/) - Manual test scenarios for verification
```

**Rationale**: Visual tree structure. Emphasize symlink workflow for live development. Simple git flow.

## Trade-offs

### Chosen
- ✅ **Quick-Start-First**: Optimizes for immediate value
- ✅ **Single comprehensive README**: Everything searchable
- ✅ **Progressive disclosure**: Start simple, get detailed
- ✅ **Inspiration over instruction**: WHEN/WHY focus for skill creation

### Rejected
- ❌ **Multiple docs**: Would fragment information
- ❌ **Catalog-first flow**: Delays getting started
- ❌ **Detailed skill mechanics in README**: Belongs in DEVELOPMENT.md
- ❌ **Source project references**: Team already knows context

## Success Criteria

**For skill users:**
- Time to first working skill: < 2 minutes
- Can find relevant skill trigger phrases quickly
- Know when skills will auto-activate

**For skill creators:**
- Clear signals for when to create a skill
- Can find template skills to learn from
- Know where to put new skill (just add directory)
- Can develop and test locally with symlinks

**For maintainers:**
- Single source of truth (README)
- Easy to add new skills to catalog
- Clear structure for contributions

## Implementation Notes

- Replace existing README.md completely
- No changes needed to existing skills
- No changes to DEVELOPMENT.md (already comprehensive)
- Commit design doc first, then implement

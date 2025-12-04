# README Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace existing README.md with progressive disclosure structure optimized for quick-start, skill catalog, and inspiring skill creation.

**Architecture:** Single comprehensive README using progressive disclosure layers (Quick Start → Catalog → Creation → Patterns → Development). Repository serves as both library and workspace for 2389-research team.

**Tech Stack:** Markdown, git

---

## Task 1: Back Up Current README

**Files:**
- Read: `README.md`
- Create: `README.old.md`

**Step 1: Copy current README to backup**

```bash
cp README.md README.old.md
```

**Step 2: Verify backup created**

Run: `ls -lh README.old.md`
Expected: File exists with same size as README.md

**Step 3: Commit backup**

```bash
git add README.old.md
git commit -m "docs: backup existing README before redesign"
```

---

## Task 2: Create New README - Section 1 (Hero & Quick Start)

**Files:**
- Modify: `README.md`

**Step 1: Replace README content with hero and quick start**

```bash
cat > README.md << 'EOF'
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

EOF
```

**Step 2: Verify content written**

Run: `head -20 README.md`
Expected: See "# 2389 Skills" header and Quick Start section

**Step 3: Commit Section 1**

```bash
git add README.md
git commit -m "docs: add README hero and quick start section"
```

---

## Task 3: Add Section 2 (Available Skills Catalog)

**Files:**
- Modify: `README.md`

**Step 1: Append catalog section**

```bash
cat >> README.md << 'EOF'

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

EOF
```

**Step 2: Verify catalog added**

Run: `grep -A 5 "## Available Skills" README.md`
Expected: See CSS Development and Firebase Development sections

**Step 3: Commit Section 2**

```bash
git add README.md
git commit -m "docs: add available skills catalog section"
```

---

## Task 4: Add Section 3 (Creating New Skills)

**Files:**
- Modify: `README.md`

**Step 1: Append skill creation section**

```bash
cat >> README.md << 'EOF'

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

EOF
```

**Step 2: Verify creation section added**

Run: `grep -A 10 "## Creating New Skills" README.md`
Expected: See "When to create a skill" and "How to create" sections

**Step 3: Commit Section 3**

```bash
git add README.md
git commit -m "docs: add skill creation section"
```

---

## Task 5: Add Section 4 (Key Patterns)

**Files:**
- Modify: `README.md`

**Step 1: Append key patterns section**

```bash
cat >> README.md << 'EOF'

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

EOF
```

**Step 2: Verify patterns section added**

Run: `grep -A 5 "## Key Patterns" README.md`
Expected: See CSS Development, Firebase Development, and Skill Design Patterns subsections

**Step 3: Commit Section 4**

```bash
git add README.md
git commit -m "docs: add key patterns reference section"
```

---

## Task 6: Add Section 5 (Repository Structure & Development)

**Files:**
- Modify: `README.md`

**Step 1: Append structure and development section**

```bash
cat >> README.md << 'EOF'

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

## License

MIT
EOF
```

**Step 2: Verify structure section added**

Run: `grep -A 3 "## Repository Structure" README.md`
Expected: See ASCII tree structure

**Step 3: Commit Section 5**

```bash
git add README.md
git commit -m "docs: add repository structure and development workflow"
```

---

## Task 7: Verify Installation Instructions

**Files:**
- Read: `README.md`

**Step 1: Test symlink command syntax**

```bash
# Extract and test the symlink command (dry run in temp location)
mkdir -p /tmp/test-skills
cd /tmp/test-skills
ln -s $(pwd) ~/.claude/skills/test-skill-link 2>&1
ls -la ~/.claude/skills/test-skill-link
rm ~/.claude/skills/test-skill-link
```

**Step 2: Verify command succeeds**

Expected: Symlink created successfully, no errors

**Step 3: No commit needed**

This is verification only.

---

## Task 8: Verify All Internal Links

**Files:**
- Read: `README.md`

**Step 1: Extract all markdown links from README**

```bash
grep -o '\[.*\](.*\.md)' README.md
```

**Step 2: Check each linked file exists**

```bash
# DEVELOPMENT.md
test -f docs/DEVELOPMENT.md && echo "✓ DEVELOPMENT.md exists" || echo "✗ DEVELOPMENT.md missing"

# Design plans directory
test -d docs/plans && echo "✓ docs/plans/ exists" || echo "✗ docs/plans/ missing"

# Examples directory
test -d docs/examples && echo "✓ docs/examples/ exists" || echo "✗ docs/examples/ missing"

# Integration tests directory
test -d tests/integration && echo "✓ tests/integration/ exists" || echo "✗ tests/integration/ missing"
```

**Step 3: Verify all links resolve**

Expected: All ✓ checks pass, all referenced files/directories exist

**Step 4: No commit needed**

This is verification only.

---

## Task 9: Verify Anchor Links

**Files:**
- Read: `README.md`

**Step 1: Extract all anchor links**

```bash
grep -o '\[.*\](#.*-.*-.*' README.md
```

**Step 2: For each anchor, verify target header exists**

```bash
# Check "Available Skills" anchor
grep -q "## Available Skills" README.md && echo "✓ #available-skills anchor exists" || echo "✗ #available-skills missing"
```

**Step 3: Verify all anchor targets exist**

Expected: All anchors resolve to actual headers in README.md

**Step 4: No commit needed**

This is verification only.

---

## Task 10: Remove Backup File

**Files:**
- Delete: `README.old.md`

**Step 1: Verify new README is complete**

```bash
wc -l README.md
```

Expected: Should be ~150-200 lines (significantly restructured from original)

**Step 2: Remove backup file**

```bash
git rm README.old.md
```

**Step 3: Commit removal**

```bash
git commit -m "docs: remove README backup after successful redesign"
```

---

## Task 11: Final Verification

**Files:**
- Read: `README.md`

**Step 1: Verify all sections present**

```bash
grep "^## " README.md
```

**Step 2: Expected output**

```
## Quick Start (2 minutes)
## Available Skills
## Creating New Skills
## Key Patterns
## Repository Structure
## Development Workflow
## Documentation
## License
```

**Step 3: Count total lines**

```bash
wc -l README.md
```

Expected: ~150-200 lines

**Step 4: No commit needed**

This is final verification only.

---

## Task 12: Push Changes

**Files:**
- None (git operation)

**Step 1: Verify all commits on feature branch**

```bash
git log --oneline origin/main..HEAD
```

Expected: See all commits from Task 1-10

**Step 2: Push feature branch**

```bash
git push -u origin feature/readme-redesign
```

**Step 3: Verify push succeeded**

Run: `git status`
Expected: "Your branch is up to date with 'origin/feature/readme-redesign'"

---

## Summary

**Total tasks:** 12
**Estimated time:** 25-40 minutes
**Commits:** 7 commits total

**Task breakdown:**
- Tasks 1-6: Content creation (6 commits)
- Tasks 7-9: Verification (no commits)
- Task 10: Cleanup (1 commit)
- Tasks 11-12: Final verification and push

**Success criteria:**
- ✅ New README follows progressive disclosure structure
- ✅ All installation commands tested and working
- ✅ All internal links resolve
- ✅ All anchor links work
- ✅ Changes pushed to feature branch
- ✅ Ready for merge to main

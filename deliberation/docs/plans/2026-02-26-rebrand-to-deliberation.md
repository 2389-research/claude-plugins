# QBP → Deliberation Rebrand Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rename the QBP plugin to "deliberation" and soften explicit Quaker branding to "inspired by" language while preserving all process vocabulary and skill logic.

**Architecture:** File-level renames and text replacements across 10 plugin files plus marketplace config. Directory rename from `qbp/` to `deliberation/`. No logic changes.

**Tech Stack:** Markdown, JSON, git

---

### Task 1: Rename directory and update plugin.json

**Files:**
- Rename: `qbp/` → `deliberation/`
- Modify: `deliberation/.claude-plugin/plugin.json`

**Step 1: Rename the directory**

```bash
git mv qbp deliberation
```

**Step 2: Update plugin.json**

Change `deliberation/.claude-plugin/plugin.json` to:

```json
{
  "name": "deliberation",
  "description": "Decision-making through deliberation - seeking unity through discernment rather than consensus through debate",
  "version": "1.0.0"
}
```

**Step 3: Commit**

```bash
git add deliberation/
git commit -m "refactor(qbp): rename directory and plugin to deliberation"
```

---

### Task 2: Update main orchestrator skill (skills/SKILL.md)

**Files:**
- Modify: `deliberation/skills/SKILL.md`

**Step 1: Update frontmatter**

Change `name: qbp` to `name: deliberation`. Update description to remove explicit Quaker reference — keep the routing description but don't mention Quaker.

**Step 2: Update heading and overview**

- `# Quaker Business Practice (QBP)` → `# Deliberation`
- `Decision-making skills emulating Quaker business practices` → `Decision-making through deliberation — seeking unity through discernment rather than consensus through debate.`
- Add attribution line after overview: `*This approach draws on Quaker business practice, adapted for AI-assisted decision-making.*`

**Step 3: Update skill name references**

Replace all `qbp:` with `deliberation:` throughout the file:
- `qbp:discernment` → `deliberation:discernment`
- `qbp:clearness` → `deliberation:clearness`
- `qbp:gathered` → `deliberation:gathered`

Also update the dot graph node names from `"qbp:..."` to `"deliberation:..."` and the graph name from `qbp_routing` to `deliberation_routing`.

**Step 4: Update Shared Principles section**

- `All three skills share Quaker principles:` → `All three skills share these principles:`

**Step 5: Update Shared Resources section**

- `skills/shared/principles.md` description: `Core Quaker principles` → `Core principles`

**Step 6: Commit**

```bash
git add deliberation/skills/SKILL.md
git commit -m "refactor(deliberation): update main orchestrator skill naming"
```

---

### Task 3: Update discernment sub-skill

**Files:**
- Modify: `deliberation/skills/discernment/SKILL.md`

**Step 1: Update frontmatter**

Change `name: qbp:discernment` to `name: deliberation:discernment`.

**Step 2: Update heading**

`# QBP: Discernment` → `# Deliberation: Discernment`

**Step 3: No other changes needed**

The discernment skill doesn't contain explicit "Quaker" references in its body — it uses the process vocabulary (clerk, voices, discernment) which we're keeping.

**Step 4: Commit**

```bash
git add deliberation/skills/discernment/SKILL.md
git commit -m "refactor(deliberation): update discernment sub-skill naming"
```

---

### Task 4: Update clearness sub-skill

**Files:**
- Modify: `deliberation/skills/clearness/SKILL.md`

**Step 1: Update frontmatter**

Change `name: qbp:clearness` to `name: deliberation:clearness`.

**Step 2: Update heading**

`# QBP: Clearness Committee` → `# Deliberation: Clearness Committee`

**Step 3: Update Quaker process instructions in agent spawn section**

The agent instructions say "Quaker process instructions:" — change to "Process instructions:". The actual instruction text inside the blockquote doesn't mention Quaker explicitly, so it stays.

**Step 4: Commit**

```bash
git add deliberation/skills/clearness/SKILL.md
git commit -m "refactor(deliberation): update clearness sub-skill naming"
```

---

### Task 5: Update gathered sub-skill

**Files:**
- Modify: `deliberation/skills/gathered/SKILL.md`

**Step 1: Update frontmatter**

Change `name: qbp:gathered` to `name: deliberation:gathered`. Update description: remove "with Quaker discipline teaching" → "with participatory discipline teaching" or just "teaches the practice alongside agent voices".

**Step 2: Update heading**

`# QBP: Gathered` → `# Deliberation: Gathered`

**Step 3: Update body references**

- `Teach the practice as you do it together.` — keep as-is (no Quaker ref)
- `teaches Quaker discipline` if present → `teaches the discipline`

**Step 4: Commit**

```bash
git add deliberation/skills/gathered/SKILL.md
git commit -m "refactor(deliberation): update gathered sub-skill naming"
```

---

### Task 6: Update shared reference files

**Files:**
- Modify: `deliberation/skills/shared/principles.md`
- Modify: `deliberation/skills/shared/vocabulary.md`
- Modify: `deliberation/skills/shared/clerk-patterns.md`

**Step 1: Update principles.md**

- `# Quaker Business Practice: Core Principles` → `# Core Principles`
- `These principles underlie all QBP skills.` → `These principles underlie all deliberation skills.`
- Anti-principles table: `Things that look like Quaker practice but aren't:` → `Things that look like deliberation but aren't:`
- `Consensus is political; unity is spiritual` → `Consensus is political; unity is organic` (removes spiritual framing)
- Applying section: replace `qbp:discernment`, `qbp:clearness`, `qbp:gathered` with `deliberation:` prefix

**Step 2: Update vocabulary.md**

- `# Quaker Business Practice: Vocabulary` → `# Deliberation: Vocabulary`
- `Shared terminology across all QBP skills.` → `Shared terminology across all deliberation skills.`

**Step 3: Update clerk-patterns.md**

- `How the clerk role works across all QBP skills.` → `How the clerk role works across all deliberation skills.`

**Step 4: Commit**

```bash
git add deliberation/skills/shared/
git commit -m "refactor(deliberation): update shared reference file naming"
```

---

### Task 7: Update CLAUDE.md and README.md

**Files:**
- Modify: `deliberation/CLAUDE.md`
- Modify: `deliberation/README.md`

**Step 1: Update CLAUDE.md**

- `# Quaker Business Practice Plugin` → `# Deliberation Plugin`
- `Decision-making skills emulating Quaker business practices` → `Decision-making through deliberation — seeking unity through discernment rather than consensus through debate`
- `### Main Skill: qbp` → `### Main Skill: deliberation`
- All `qbp:` → `deliberation:`
- `### Quaker Principles Applied` → `### Principles Applied`

**Step 2: Update README.md**

- `# Quaker Business Practice (QBP) plugin` → `# Deliberation`
- `Decision-making skills for Claude that follow Quaker business practices` → `Decision-making skills for Claude — seeking unity through discernment rather than consensus through debate.`
- Add attribution: `*Inspired by Quaker business practice, adapted for AI-assisted decision-making.*`
- All `qbp` → `deliberation` in skill names and install commands
- `## Quaker principles` → `## Principles`
- `These skills are grounded in actual Quaker business practice:` → `These skills draw on contemplative decision-making traditions:`
- `teaches Quaker discipline` → `teaches the discipline`

**Step 3: Commit**

```bash
git add deliberation/CLAUDE.md deliberation/README.md
git commit -m "refactor(deliberation): update plugin documentation"
```

---

### Task 8: Update marketplace.json and regenerate site

**Files:**
- Modify: `.claude-plugin/marketplace.json`

**Step 1: Update marketplace entry**

Change the qbp entry:

```json
{
    "name": "deliberation",
    "source": "./deliberation",
    "description": "Decision-making through deliberation - seeking unity through discernment rather than consensus through debate",
    "version": "1.0.0",
    "keywords": [
        "decision-making",
        "discernment",
        "deliberation",
        "unity",
        "consensus",
        "ethics",
        "multi-agent",
        "clearness-committee"
    ],
    "strict": false
}
```

Note: removed "quaker" keyword, kept "clearness-committee" (it's a process term we're keeping).

**Step 2: Regenerate marketplace site**

```bash
npm run generate
```

**Step 3: Commit**

```bash
git add .claude-plugin/marketplace.json docs/
git commit -m "refactor(deliberation): update marketplace entry and regenerate site"
```

---

### Task 9: Move design doc to new location

**Files:**
- Move: `deliberation/docs/plans/2026-02-26-rebrand-to-deliberation-design.md` (already in right place after directory rename)
- Move: `deliberation/docs/plans/2026-02-26-rebrand-to-deliberation.md` (this plan file)

**Step 1: Verify design docs are in place**

After directory rename, both docs should be at `deliberation/docs/plans/`. Verify and commit if needed.

**Step 2: Final commit**

```bash
git add .
git commit -m "chore(deliberation): finalize rebrand from qbp to deliberation"
```

# Speed-Run Plugin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a new `speed-run` plugin that wraps hosted-LLM-powered variants of cookoff and omakase flows, then restore the original test-kitchen skills to their pre-codegen state.

**Architecture:** New top-level plugin `speed-run/` with three subskills (turbo, race, any%) that reference the hosted-llm-codegen MCP server. The existing `hosted-llm-codegen/` plugin stays as-is (it owns the MCP server + its own skill). The `test-kitchen` skills get reverted to main branch versions (no codegen references). Speed-run is the opt-in pipeline for users who want fast hosted-LLM generation.

**Tech Stack:** Markdown skill files, JSON plugin manifests

---

### Task 1: Create speed-run plugin directory structure

**Files:**
- Create: `speed-run/.claude-plugin/plugin.json`
- Create: `speed-run/CLAUDE.md`
- Create: `speed-run/skills/SKILL.md` (router skill)
- Create: `speed-run/skills/turbo/SKILL.md`
- Create: `speed-run/skills/race/SKILL.md`
- Create: `speed-run/skills/any-percent/SKILL.md`

**Step 1: Create directories**

```bash
mkdir -p speed-run/.claude-plugin speed-run/skills/turbo speed-run/skills/race speed-run/skills/any-percent
```

**Step 2: Create plugin.json**

Write `speed-run/.claude-plugin/plugin.json`:
```json
{
  "name": "speed-run",
  "description": "Token-efficient code generation pipeline using hosted LLM (Cerebras). Parallel implementation with turbo-powered code gen.",
  "version": "1.0.0"
}
```

**Step 3: Commit**

```bash
git add speed-run/.claude-plugin/plugin.json
git commit -m "feat: create speed-run plugin skeleton"
```

---

### Task 2: Write speed-run CLAUDE.md (plugin overview + setup guide)

**Files:**
- Create: `speed-run/CLAUDE.md`

**Step 1: Write CLAUDE.md**

This is the main plugin doc. It should cover:
- What speed-run is (token-efficient pipeline using hosted LLM)
- **Setup requirements** — CEREBRAS_API_KEY configuration with BOTH methods:
  - `~/.claude/settings.json` under `"env"` (recommended for Claude Code users)
  - `export` in `~/.zshrc`
  - Link to get free key: https://cloud.cerebras.ai
- Requires `hosted-llm-codegen` plugin to be installed (provides the MCP server)
- Three subskills: turbo (direct codegen), race (parallel same-design), any% (parallel explore approaches)
- Flow diagram showing: speed-run → check_status → route to turbo/race/any%

**Step 2: Commit**

```bash
git add speed-run/CLAUDE.md
git commit -m "docs: add speed-run plugin overview and setup guide"
```

---

### Task 3: Write the speed-run router skill (SKILL.md)

**Files:**
- Create: `speed-run/skills/SKILL.md`

**Step 1: Write the router skill**

This is the top-level entry point. It should:
- Trigger on: "speed-run", "fast build", "turbo build", "use hosted LLM"
- First action: ALWAYS run `mcp__hosted-llm-codegen__check_status`
- If key not set: surface the `setup_hint`, tell user how to configure, and STOP (don't fall back silently — the whole point of speed-run is hosted gen)
- If key is set: present routing options:
  1. **Turbo** — Direct hosted codegen (single task, write contract, generate)
  2. **Race** — Same design, parallel runners via hosted LLM
  3. **Any%** — Explore different approaches via hosted LLM
- Include the skill dependency table referencing subskills

**Step 2: Commit**

```bash
git add speed-run/skills/SKILL.md
git commit -m "feat: add speed-run router skill"
```

---

### Task 4: Write the turbo skill (direct hosted codegen)

**Files:**
- Create: `speed-run/skills/turbo/SKILL.md`

**Step 1: Write turbo skill**

This is adapted from the existing `hosted-llm-codegen` SKILL.md but framed as a speed-run subskill. Content:
- Name: `turbo`
- Description: Direct code generation via hosted LLM
- Prerequisites: check_status must have passed (router already verified)
- The full contract prompt template (DATA CONTRACT + API CONTRACT + ALGORITHM + RULES)
- MCP tool usage: `mcp__hosted-llm-codegen__generate_and_write_files`
- Tradeoffs table (Claude vs hosted)
- Fix strategy (generate → test → surgical fix → retest)
- When to use turbo vs Claude direct

**Step 2: Commit**

```bash
git add speed-run/skills/turbo/SKILL.md
git commit -m "feat: add speed-run turbo skill (direct hosted codegen)"
```

---

### Task 5: Write the race skill (parallel same-design competition)

**Files:**
- Create: `speed-run/skills/race/SKILL.md`

**Step 1: Write race skill**

Adapted from `test-kitchen:cookoff` but with hosted-LLM codegen baked in as the primary generation method. Key differences from cookoff:
- Each parallel agent uses `mcp__hosted-llm-codegen__generate_and_write_files` for first-pass code
- Then surgical fixes via Claude Edit
- Same phases: complexity assessment → parallel dispatch → judging → cleanup
- Same directory structure pattern: `docs/plans/<feature>/speed-run/race/runner-N/`
- Same worktree pattern but with `speed-run-runner-N` naming
- References `test-kitchen:judge` for scoring (shared dependency)
- Key difference from cookoff: codegen is NOT optional, it's the whole point

**Step 2: Commit**

```bash
git add speed-run/skills/race/SKILL.md
git commit -m "feat: add speed-run race skill (parallel competition via hosted LLM)"
```

---

### Task 6: Write the any% skill (parallel approach exploration)

**Files:**
- Create: `speed-run/skills/any-percent/SKILL.md`

**Step 1: Write any% skill**

Adapted from `test-kitchen:omakase-off` but with hosted-LLM codegen baked in. Key differences from omakase:
- Omits the "brainstorm together" option (any% is always parallel)
- Quick context gathering → generate approaches → each variant uses hosted LLM for code gen
- Same slot detection for architectural decisions
- Directory: `docs/plans/<feature>/speed-run/any-percent/variant-<slug>/`
- Same evaluation pipeline: scenario tests → fresh-eyes → judge → cleanup
- Key difference from omakase: codegen is mandatory, not optional

**Step 2: Commit**

```bash
git add speed-run/skills/any-percent/SKILL.md
git commit -m "feat: add speed-run any% skill (parallel exploration via hosted LLM)"
```

---

### Task 7: Register speed-run in marketplace.json

**Files:**
- Modify: `.claude-plugin/marketplace.json`

**Step 1: Add speed-run entry**

Add to the `plugins` array in marketplace.json:
```json
{
    "name": "speed-run",
    "source": "./speed-run",
    "description": "Token-efficient code generation pipeline - parallel implementation with hosted LLM (Cerebras) for ~60% token savings",
    "version": "1.0.0",
    "keywords": [
        "codegen",
        "speed-run",
        "parallel",
        "hosted-llm",
        "cerebras",
        "token-efficient",
        "turbo",
        "race"
    ],
    "strict": false
}
```

**Step 2: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "feat: register speed-run plugin in marketplace"
```

---

### Task 8: Revert test-kitchen cookoff and omakase to main branch versions

**Files:**
- Modify: `test-kitchen/skills/cookoff/SKILL.md`
- Modify: `test-kitchen/skills/omakase-off/SKILL.md`

**Step 1: Restore cookoff from main**

```bash
git checkout main -- test-kitchen/skills/cookoff/SKILL.md
```

**Step 2: Restore omakase from main**

```bash
git checkout main -- test-kitchen/skills/omakase-off/SKILL.md
```

**Step 3: Verify the diff**

```bash
git diff --cached -- test-kitchen/skills/
```

Should show ONLY the removal of the codegen sections (the `| codegen |` row in dependencies, the "Code Generation Strategy" section, and the `| codegen | 3 |` row in orchestrated skills).

**Step 4: Commit**

```bash
git add test-kitchen/skills/cookoff/SKILL.md test-kitchen/skills/omakase-off/SKILL.md
git commit -m "revert: remove hosted-codegen references from test-kitchen skills"
```

---

### Task 9: Verify everything is consistent

**Step 1: Check no broken cross-references**

- speed-run skills reference `hosted-llm-codegen` MCP tools (should exist)
- speed-run skills reference `test-kitchen:judge` (should exist)
- test-kitchen skills no longer reference `hosted-llm-codegen` (should be clean)

**Step 2: Check directory structure**

```bash
find speed-run -type f | sort
```

Expected:
```
speed-run/.claude-plugin/plugin.json
speed-run/CLAUDE.md
speed-run/skills/SKILL.md
speed-run/skills/any-percent/SKILL.md
speed-run/skills/race/SKILL.md
speed-run/skills/turbo/SKILL.md
```

**Step 3: Commit verification notes if needed**

<!-- ABOUTME: Design spec for adding the npx (vercel-labs/skills) install method across the marketplace -->
<!-- ABOUTME: npx is the default install path; Claude Code /plugin is the secondary option -->

# Spec: add `npx skills add` as the default install method

**Date:** 2026-05-27
**Branch:** `feat/npx-install-method`
**Status:** Draft for review

## Summary

Add a second install method — [vercel-labs/skills](https://github.com/vercel-labs/skills)'s
`npx skills add <owner/repo>` — alongside the existing Claude Code `/plugin install` flow,
across every surface of the marketplace (README, generated HTML site, and all markdown
mirrors). **npx is the default / pre-selected method**; Claude Code's native `/plugin` flow
is the secondary option.

The npx tool installs *skills* into 50+ agents (Claude Code, Cursor, Codex, …). It does **not**
install MCP servers. The 4 MCP-server entries therefore keep `/plugin install` only.

## Why

- Broadens reach: the npx method works in any agent, not just Claude Code.
- One command: `npx skills add 2389-research/<plugin>` is a single step vs. the two-step
  `/plugin marketplace add …` + `/plugin install …`.
- Doctor Biz directed npx to be the default.

## Scope

### Plugins that get both methods (npx default + Claude Code secondary)

All `strict: false` entries in `.claude-plugin/marketplace.json` — currently 22 skill plugins
(of 26 total entries). The set is derived from the `strict` flag at generation time, so this
count stays correct as the registry changes.

### Plugins that keep Claude Code only

The 4 `strict: true` entries — pure MCP servers with no installable skills:
`journal`, `socialmedia`, `slack-mcp`, `agent-drugs`. `npx skills add` finds no skills in
them, so they show a single `/plugin install` block (today's behavior, unchanged).

`strict === true` is the reliable signal for "MCP server, no skills." It is the same flag the
generator already uses for the "External" badge.

### Out of scope

- The individual plugin repos' own READMEs (separate repositories).
- Pre-existing inconsistency (flag as a separate issue, do **not** fix here): `README.md`
  shows `/plugin install simmer@2389-research` while the generated site shows
  `/plugin install 2389-research/simmer`.

## Command mapping

| Surface | npx (default) | Claude Code (secondary) |
|---|---|---|
| Per-plugin (cards, plugin pages, per-plugin `.md`) | `npx skills add <repo>` via `getRepoName(plugin)` → e.g. `npx skills add 2389-research/simmer` | `/plugin install 2389-research/<name>` |
| Homepage hero (marketplace level) | pattern `npx skills add 2389-research/<plugin>` ("swap in any plugin below") | `/plugin marketplace add 2389-research/claude-plugins` |
| Homepage "Get Started" steps | 1-command flow using the example plugin (`better-dev`) | existing 3-step marketplace flow |

The npx source must come from `getRepoName(plugin)` (already in the generator), not a hardcoded
`2389-research/<name>`, so it stays correct if a repo name ever differs from the plugin name.

## HTML: tab component

A shared helper renders a tab group. npx is first and `active`; Claude Code is second and its
panel is `hidden` on load. For `strict: true` plugins the helper falls back to today's single
`install-block` (no tabs, Claude Code only).

```html
<div class="install-tabs" data-install-tabs>
  <div class="install-tab-row" role="tablist">
    <button class="install-tab active" data-tab="npx" role="tab" aria-selected="true">npx (any agent)</button>
    <button class="install-tab" data-tab="cc" role="tab" aria-selected="false">Claude Code</button>
  </div>
  <div class="install-tab-panel" data-panel="npx" role="tabpanel">
    <code class="install-command">npx skills add 2389-research/simmer</code>
  </div>
  <div class="install-tab-panel" data-panel="cc" role="tabpanel" hidden>
    <code class="install-command">/plugin install 2389-research/simmer</code>
  </div>
</div>
```

Tab groups appear on: homepage hero, homepage "Get Started" steps, every plugin card
(homepage + related), plugin-page hero install block, plugin-page quick-install steps.

## CSS (`docs/style.css`)

Add rules using existing design tokens (gold accent for the active tab, surface bg, mono font):
`.install-tabs`, `.install-tab-row`, `.install-tab`, `.install-tab.active`,
`.install-tab-panel[hidden] { display: none; }`. Code lines reuse `.install-command`.

## JS (existing inline `<script>` in the generated page)

Add one delegated click handler: clicking an `.install-tab` sets `active` (and
`aria-selected`) on the clicked tab within its `[data-install-tabs]` group, clears its
siblings, shows the matching `[data-panel]`, and hides the others. Copy-to-clipboard already
targets `.install-command` / `.plugin-install`, so npx commands are copyable with no change.

## Markdown surfaces

No tabs / JS. Two labeled fenced blocks, **npx first**:

````markdown
**Install with npx (any agent)**

```
npx skills add 2389-research/simmer
```

**Or in Claude Code**

```
/plugin install 2389-research/simmer
```
````

Applies to: `README.md`, `docs/llms.txt`, `docs/AGENTS.md`, `docs/index.md`, and each
`docs/plugins/<name>/index.md`. MCP servers show only the Claude Code block.

`README.md` is hand-maintained; the rest are emitted by `scripts/generate-site.js`.

## Tests (TDD — write/adjust before implementation)

1. Update `tests/generate-site-install-template.test.js` for the new tab structure (the
   `install-block` regex changes for skill plugins; MCP plugins still match the single block).
2. New `tests/generate-site-npx-install.test.js` asserting:
   - a skill plugin page (e.g. `simmer`) contains `npx skills add 2389-research/simmer`;
   - npx is the default/active tab (npx tab carries `active` / `aria-selected="true"`);
   - an MCP page (e.g. `journal`) does **not** contain `npx skills add`;
   - `docs/llms.txt` and `docs/AGENTS.md` contain the npx method.
3. Add `"test"` to `package.json` so `npm test` runs all `tests/*.test.js`.
4. Add a test step to `.github/workflows/generate-site.yml` (CI runs no tests today).

## Acceptance criteria

- [ ] Every `strict:false` plugin shows npx (default) + Claude Code on all HTML surfaces.
- [ ] Every `strict:false` plugin shows both methods (npx first) in its `.md` mirror.
- [ ] All 4 MCP servers show Claude Code only, everywhere.
- [ ] Homepage hero + "Get Started" default to the npx flow.
- [ ] Tabs switch correctly; commands copy to clipboard.
- [ ] `README.md`, `llms.txt`, `AGENTS.md`, `index.md` include the npx method (npx first).
- [ ] `npm test` passes with pristine output; `npm run generate` regenerates `docs/` clean.

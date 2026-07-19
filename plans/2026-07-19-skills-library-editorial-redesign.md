# Skills Library Editorial Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the marketplace site (`skills.2389.ai`) to match the editorial "Skills Library" comp, reusing the generator's data/category/install logic and replacing only what it emits.

**Architecture:** `scripts/generate-site.js` reads `.claude-plugin/marketplace.json`, groups the 28 entries into four categories, and writes static HTML for the index, per-plugin pages, and glossary. This plan rewrites the HTML those functions emit and rewrites `docs/style.css` to a class-based editorial token system. Search/filter and the three.js topographic background are added as vanilla-JS progressive enhancement over static HTML. The design-tool React runtime from the comp (`support.js`) is not shipped.

**Tech Stack:** Node (no framework — template strings), vanilla JS, CSS custom properties, three.js r128 (CDN), Newsreader + IBM Plex Mono (Google Fonts). Tests: Node's built-in `node:test` + `node:assert`, and the existing `assert`-based scripts run via `npm run generate:site`.

## Global Constraints

- **Design source of truth:** the comp. Extract `Claude code skills library.zip` (repo root); `Skills Library.dc.html` is the visual reference. All tokens/copy needed are also inlined below.
- **Fonts:** Newsreader (serif) for headlines/body; IBM Plex Mono for kickers, labels, skill names, code, footer. Google Fonts URL: `https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap`
- **Color tokens (exact):** ink `#171512`; body `#4a453b` / `#33302a`; muted `#8a857a` / `#b5b0a4` / `#9b968c`; hairline `#e2ddd2` / `#e7e3da` / `#d8d3c8`; paper `#faf9f6`; white `#ffffff`; accent `#e6196e`, accent-hover `#b81259`; selection `rgba(230,25,110,0.14)`.
- **Category colors (exact):** Development `#e6196e`, Infrastructure `#c67514`, Agent Systems `#7a3fb0`, Personal & Strategy `#1f9e6b`. MCP badge purple `#7a3fb0`.
- **Layout:** centered column `max-width: 1120px`; gutters `clamp(20px, 4vw, 44px)`; heavy rules `1.5px solid #171512`; glass panels `background: rgba(255,255,255,0.62); backdrop-filter: blur(7px)`.
- **Naming:** adopt "skills" framing. `<title>`/OG → "Coding-agent Skills & Servers". The only place "plugin" stays is the real command `/plugin install <name>@2389-research` and `/plugin marketplace add ...`.
- **Install commands (never alter, reuse the helpers):** npx = `npx skills add 2389-research/<name>` (`getNpxInstallCommand`); Claude Code = `/plugin install <name>@2389-research` (`getPluginInstallCommand`). MCP-only entries (`strict: true`, i.e. `pluginHasSkills(plugin) === false`) expose ONLY the Claude Code command — never npx.
- **Copy is one mechanism:** every copy affordance is a `[data-copy]` button handled by a single handler in `generateInteractiveScript()`. This replaces the legacy click-to-copy on `.install-command`/`.plugin-install` and the `.install-tabs` tab switcher — both are removed in Task 7, once no page emits them. The `.copied` class is kept (reused by the new handler).
- **Intentional removals (approved design):** the install-method tabs (`renderInstallTabs`), the per-plugin quick-install stepper (`generateQuickInstallSteps`), the homepage "Get Started in 30 Seconds" tabbed block, and the plugin-card/related-card install tabs are dropped — the comp replaces them with labeled one-line install blocks. Two existing test files assert that old UI; they are updated **in the same task/commit** that removes each piece, preserving every command-correctness and MCP-no-npx assertion and dropping only assertions for removed UI. No net behavioral-coverage loss; no silent test edit.
- **Preserve (no regressions):** `data-tinylytics-event*` attributes wherever they exist today; the skip-to-content link (`<a href="#main-content" class="skip-link">`) on every page; canonical + markdown-alternate links; per-page OG image; `sitemap.xml`, `sitemap.md`, `robots.txt`, `llms.txt`, `AGENTS.md`, `index.md`, per-plugin `.md` mirrors; the JSON-LD in the glossary (`glossaryStructuredData`).
- **Reduced motion:** the three.js loop renders one frame then stops when `matchMedia('(prefers-reduced-motion: reduce)').matches`.
- **Commits:** conventional, imperative. Never `git add -A`; add the exact paths. Never bypass hooks.
- **Verify each generator change:** after editing `scripts/generate-site.js`, run `npm run generate` and confirm it exits 0 before committing. `npm run generate:site` is the alias the existing tests invoke.

---

## File Structure

- `scripts/generate-site.js` — modify emission functions:
  - `generateHead()` (347) — fonts, three.js CDN, skills title/OG.
  - `generateFooter()` (426) → colophon (Task 6). Keep `generateNav()` until Task 8.
  - `generatePluginCard()` (462) → `generateSkillRow()` (Task 4).
  - `renderInstallTabs()` (507) + `generateQuickInstallSteps()` (552) → **deleted** in Task 7 (no callers remain; no test references them by symbol).
  - `generateInteractiveScript()` (520) → single `[data-copy]` copy handler (Task 2) + search/filter (Task 3) + topo (Task 5); legacy `.install-command`/`.install-tabs` handlers deleted in Task 7.
  - `generateCategorySections()` (604) → numbered editorial sections of rows (Task 4).
  - `generateRelatedPlugins()` (626) → plain editorial related links, no install tabs (Task 7).
  - `generatePluginPage()` (673) → editorial detail header + README body + prev/next (Task 7).
  - `indexHtml` template (927) → masthead + install strip + toolbar + index + footer; drop the hero, About, Get-Started, Learn-More, and Star sections.
  - `generateNav()` (403) → **deleted** in Task 8 (the glossary is its last caller and stops using it there).
  - glossary generation (`GLOSSARY_TERMS`, tuples of `[term, definition]`, ~1387; `glossaryHtml`, ~1411) → editorial restyle (Task 8), keeping `glossaryStructuredData`.
- `docs/style.css` — full rewrite to the token system.
- `tests/generate-site-redesign.test.js` — new structural tests (`node:test`).
- `tests/generate-site-npx-install.test.js` / `tests/generate-site-install-template.test.js` — updated in Tasks 2/4/7 to match removed UI (see each task).
- Reuse untouched: `getCategoryForPlugin`, `getRepoName`, `getReadmeContent`, `markdownToHtml`, `convertRepoLinks`, `getNpxInstallCommand`, `getPluginInstallCommand`, `pluginHasSkills`, `cleanDescription`, `getSourceUrl`.

---

## Task 1: Design tokens, base stylesheet, and head

**Files:**
- Modify: `scripts/generate-site.js` — `generateHead()` (347-400); the index `generateHead(...)` call (~928).
- Rewrite: `docs/style.css` (base layer)
- Test: `tests/generate-site-redesign.test.js` (create)

**Interfaces:**
- Produces: `generateHead(title, description, canonicalPath, extraKeywords)` — unchanged signature; output imports Newsreader, loads `three.min.js`, titles pages with the skills framing. CSS custom properties `--ink`, `--body`, `--body-2`, `--muted`, `--muted-2`, `--muted-3`, `--hair`, `--hair-2`, `--hair-3`, `--paper`, `--accent`, `--accent-hover`, `--cat-dev`, `--cat-infra`, `--cat-agents`, `--cat-personal`, `--mcp`; utility classes `.wrap`, `.glass`, `.rule-t`, `.rule-b`, `.mono`, `.kicker`, `.skip-link`; `#topo-bg` canvas layer. Later tasks depend on these names.

- [ ] **Step 1: Write the failing test**

Create `tests/generate-site-redesign.test.js`:

```js
// ABOUTME: Structural tests for the editorial Skills Library redesign output.
// ABOUTME: Asserts the generated HTML/JS contains the redesign's required markup.
const { test } = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
// Generate once for the whole suite.
execFileSync('node', ['scripts/generate-site.js'], { cwd: ROOT, stdio: 'pipe' });
const index = fs.readFileSync(path.join(ROOT, 'docs/index.html'), 'utf8');

test('head: loads Newsreader and three.js and uses the skills title', () => {
  assert.match(index, /family=Newsreader:/);
  assert.match(index, /three\.min\.js/);
  assert.match(index, /<title>Coding-agent Skills &amp; Servers \| 2389 Research<\/title>/);
  assert.doesNotMatch(index, /Plus\+Jakarta\+Sans/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/generate-site-redesign.test.js`
Expected: FAIL — current head loads Plus Jakarta Sans and the index titles "Claude Code Plugin Marketplace".

- [ ] **Step 3: Update `generateHead()`**

In `scripts/generate-site.js`, within `generateHead()`:
- Change `baseKeywords` (line 348) to lead with skills: `['coding agent skills', 'Claude Code', 'MCP servers', 'Codex', 'Cursor', 'AI development', 'Anthropic', '2389 Research']`.
- Replace the fonts `<link>` (line 392) with the Newsreader URL from Global Constraints.
- Add, immediately after that fonts link: `\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" defer></script>`
- Leave canonical, markdown-alternate, OG image, favicon, Tinylytics, and the stylesheet link exactly as they are.

In the `indexHtml` head call (~928), set the title/description arguments: `generateHead('Coding-agent Skills & Servers', 'A working index of coding-agent skills and MCP servers from 2389 Research — install any with one line.', '', [...])` (keep the existing keyword array argument).

- [ ] **Step 4: Rewrite the base layer of `docs/style.css`**

Replace the file's top matter (reset, `:root`, base type, links, container, old nav/hero/footer/card blocks) with:

```css
/* ABOUTME: Editorial "Skills Library" stylesheet — token system for the 2389 marketplace. */
/* ABOUTME: Class-based translation of the Skills Library design comp. */
:root{
  --ink:#171512; --body:#4a453b; --body-2:#33302a;
  --muted:#8a857a; --muted-2:#b5b0a4; --muted-3:#9b968c;
  --hair:#e2ddd2; --hair-2:#e7e3da; --hair-3:#d8d3c8;
  --paper:#faf9f6; --white:#ffffff;
  --accent:#e6196e; --accent-hover:#b81259;
  --cat-dev:#e6196e; --cat-infra:#c67514; --cat-agents:#7a3fb0; --cat-personal:#1f9e6b;
  --mcp:#7a3fb0;
  --wrap:1120px;
}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;background:var(--white);}
body{color:var(--ink);font-family:'Newsreader',serif;-webkit-font-smoothing:antialiased;position:relative;}
a{color:var(--accent);text-decoration:none;}
a:hover{color:var(--accent-hover);text-decoration:underline;text-underline-offset:3px;}
::selection{background:rgba(230,25,110,0.14);}
.mono{font-family:'IBM Plex Mono',monospace;}
.kicker{font-family:'IBM Plex Mono',monospace;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:var(--accent);}
.wrap{max-width:var(--wrap);margin:0 auto;padding:0 clamp(20px,4vw,44px);position:relative;z-index:1;}
.glass{background:rgba(255,255,255,0.62);backdrop-filter:blur(7px);}
.rule-t{border-top:1.5px solid var(--ink);}
.rule-b{border-bottom:1.5px solid var(--ink);}
.skip-link{position:absolute;left:-9999px;top:0;background:var(--ink);color:#fff;padding:8px 14px;z-index:100;}
.skip-link:focus{left:8px;top:8px;}
#topo-bg{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;}
.topo-fade{position:fixed;inset:0;z-index:0;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,0) 30%,rgba(255,255,255,0.55) 100%);}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:none;}}
```

(Later tasks append surface blocks. Keep the file valid at each step.)

- [ ] **Step 5: Run test + generate**

Run: `node --test tests/generate-site-redesign.test.js` → PASS
Run: `npm run generate` → exits 0

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-site.js docs/style.css tests/generate-site-redesign.test.js
git commit -m "feat: editorial design tokens, fonts, and head for redesign"
```

---

## Task 2: Masthead + install strip + copy handler (index)

**Files:**
- Modify: `scripts/generate-site.js` — add `generateMasthead()`; edit the `indexHtml` body opening (930-980); add the `[data-copy]` handler to `generateInteractiveScript()` (520).
- Modify: `docs/style.css` (masthead block)
- Modify: `tests/generate-site-npx-install.test.js` (hero assertions)
- Test: `tests/generate-site-redesign.test.js`

**Interfaces:**
- Consumes: `.wrap`, `.glass`, `.kicker`, `.rule-b`, `.skip-link` (Task 1).
- Produces: `generateMasthead()` → top rule bar + hero panel + install strip. The `[data-copy]` handler: on click, copies `el.dataset.copy` (unescaping `&lt;`/`&gt;`), flips the label to a copied state, `stopPropagation` so row/link clicks don't fire. CSS classes `.masthead`, `.mast-bar`, `.hero-panel`, `.hero-head`, `.hero-lede`, `.install-strip`, `.btn-primary`, `.btn-ghost`.

- [ ] **Step 1: Write the failing test**

Append to `tests/generate-site-redesign.test.js`:

```js
test('masthead: rule bar, headline, install strip, star link', () => {
  assert.match(index, /2389 Research/);
  assert.match(index, /Agent Skills · Open Source/);
  assert.match(index, /Coding-agent <em>skills<\/em> &amp; servers/);
  assert.match(index, /data-copy="npx skills add 2389-research\/&lt;name&gt;"/);
  assert.match(index, /★ Star on GitHub/);
});
test('copy: single data-copy handler with stopPropagation', () => {
  assert.match(index, /\[data-copy\]/);
  assert.match(index, /stopPropagation/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/generate-site-redesign.test.js`
Expected: FAIL — masthead markup and the `[data-copy]` handler are absent.

- [ ] **Step 3: Add `generateMasthead()`**

Insert before `const indexHtml`:

```js
function generateMasthead() {
  return `<header class="masthead">
    <div class="mast-bar mono rule-b">
      <span>2389 Research</span>
      <span>Agent Skills · Open Source</span>
      <span>Est. 2026</span>
    </div>
    <div class="hero-panel glass">
      <div class="kicker">A working index of</div>
      <h1 class="hero-head">Coding-agent <em>skills</em> &amp; servers</h1>
      <p class="hero-lede">A library of skills and MCP servers for the coding agents you already use — Claude Code, Codex, Cursor, and friends. Build workflows, testing regimes, agent architectures, and operational tooling. Each one is its own tool, doing one thing well. Install any of them with a single line.</p>
    </div>
    <div class="install-strip">
      <div class="cmd mono"><span class="dollar">$</span> npx skills add 2389-research/<span class="accent">&lt;name&gt;</span>
        <button type="button" class="btn-primary" data-copy="npx skills add 2389-research/&lt;name&gt;" data-tinylytics-event="hero.copy-install">Copy</button>
      </div>
      <a href="https://github.com/2389-research/claude-plugins" target="_blank" rel="noopener noreferrer" class="btn-ghost mono" data-tinylytics-event="nav.star-github">★ Star on GitHub</a>
    </div>
  </header>`;
}
```

- [ ] **Step 4: Rewrite the index body opening**

In `indexHtml`, replace lines 931-980 — the `<div class="grid-overlay">`, the skip link, `${generateNav(false)}`, and the entire `<header class="hero">…</header>` block — with:

```js
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <canvas id="topo-bg" aria-hidden="true"></canvas>
  <div class="topo-fade" aria-hidden="true"></div>
  <div class="wrap">
    ${generateMasthead()}
```

Leave `<body>` (930) in place. The `.wrap` div stays open; Task 6 closes it before the footer. To keep HTML valid until then, temporarily add `</div>` immediately after `${generateMasthead()}` and remove it in Task 3.

- [ ] **Step 5: Add the `[data-copy]` handler to `generateInteractiveScript()`**

Inside `generateInteractiveScript()`, before the closing `</script>`, add (leave the existing `.install-command`/`.install-tabs` handlers in place for now — Task 7 removes them):

```js
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      navigator.clipboard.writeText(btn.dataset.copy.replace(/&lt;/g,'<').replace(/&gt;/g,'>')).catch(()=>{});
      const orig = btn.textContent;
      const done = /Copy$/.test(orig) ? '✓ Copied' : '✓ copied';
      btn.textContent = done; btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1600);
    });
  });
```

- [ ] **Step 6: Add masthead CSS**

Append to `docs/style.css`:

```css
.masthead{padding-top:52px;}
.mast-bar{display:flex;justify-content:space-between;align-items:baseline;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);padding-bottom:16px;}
.hero-panel{padding:44px 24px 34px;margin:0 -24px;}
.hero-panel .kicker{margin-bottom:20px;}
.hero-head{font-size:clamp(48px,8.5vw,104px);line-height:0.92;font-weight:500;letter-spacing:-0.02em;margin:0 0 26px;max-width:13ch;}
.hero-head em{font-style:italic;font-weight:400;}
.hero-lede{font-size:clamp(18px,2.4vw,23px);line-height:1.5;color:var(--body);max-width:54ch;margin:0;}
.install-strip{display:flex;align-items:stretch;gap:12px;flex-wrap:wrap;padding:22px 0 40px;}
.install-strip .cmd{display:flex;align-items:center;gap:16px;background:var(--paper);border:1.5px solid var(--ink);padding:14px 14px 14px 20px;font-size:14px;color:var(--body-2);}
.install-strip .dollar{color:var(--muted-2);}
.install-strip .accent{color:var(--accent);}
.btn-primary{font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#fff;background:var(--accent);border:none;padding:9px 16px;cursor:pointer;}
.btn-primary:hover{background:var(--accent-hover);}
.btn-primary.copied{background:var(--cat-personal);}
.btn-ghost{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--ink);border:1.5px solid var(--ink);padding:0 22px;}
.btn-ghost:hover{background:var(--ink);color:#fff;text-decoration:none;}
```

- [ ] **Step 7: Update the legacy hero assertions**

In `tests/generate-site-npx-install.test.js`:
- Replace line 26 (`assert.match(index, /npx skills add 2389-research\/&lt;plugin&gt;/, ...)`) with:
  `assert.match(index, /data-copy="npx skills add 2389-research\/&lt;name&gt;"/, 'hero install strip copies the npx pattern');`
- Delete line 27 (`class="install-tab active"[^>]*data-tab="npx-hero"`) — the hero no longer uses tabs.

Leave every other assertion in that file unchanged.

- [ ] **Step 8: Run tests + generate**

Run: `node --test tests/generate-site-redesign.test.js` → PASS
Run: `npm run generate:site` → PASS (npx-install test still green; hero assertions updated)
Run: `npm run generate` → exits 0

- [ ] **Step 9: Commit**

```bash
git add scripts/generate-site.js docs/style.css tests/generate-site-redesign.test.js tests/generate-site-npx-install.test.js
git commit -m "feat: editorial masthead, install strip, unified copy handler on index"
```

---

## Task 3: Sticky toolbar — search + category chips + filter JS

**Files:**
- Modify: `scripts/generate-site.js` — add `generateToolbar()`; call it in `indexHtml` after the masthead; extend `generateInteractiveScript()` with the filter block.
- Modify: `docs/style.css` (toolbar block)
- Test: `tests/generate-site-redesign.test.js`

**Interfaces:**
- Consumes: category counts from the `categories` object; `marketplace.plugins.length`.
- Produces: top-level `const CAT_COLOR` (the one category→hex map, reused by Task 4 and Task 7); `generateToolbar()` HTML with `[data-search]` input, `[data-count]` element, `.chip[data-cat]` buttons (values `all`, `Development`, `Infrastructure`, `Agent Systems`, `Personal & Strategy`), a `[data-cleartag]` button. The filter JS reads `[data-skill-row]` rows (Task 4) via `data-name`, `data-desc`, `data-tags`, `data-cat`; toggles `[data-cat-section]`; shows `[data-empty]`; resets via `[data-reset]`. Establish those attribute names here so Task 4 matches them.

- [ ] **Step 1: Write the failing test**

Append:

```js
test('toolbar: search input, live count, category chips with counts', () => {
  assert.match(index, /data-search/);
  assert.match(index, /data-count/);
  assert.match(index, /data-cat="all"[^>]*>All \(28\)/);
  assert.match(index, /data-cat="Development"/);
  assert.match(index, /data-cat="Agent Systems"/);
});
test('script: filter wiring reads skill rows on input', () => {
  assert.match(index, /\[data-skill-row\]/);
  assert.match(index, /addEventListener\('input'/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/generate-site-redesign.test.js`
Expected: FAIL.

- [ ] **Step 3: Add `generateToolbar()`**

```js
// One category→hex map for the whole generator. Task 4 (rows/sections) and Task 7 (detail) reuse it.
const CAT_COLOR = { 'Development': '#e6196e', 'Infrastructure': '#c67514', 'Agent Systems': '#7a3fb0', 'Personal & Strategy': '#1f9e6b' };

function generateToolbar() {
  const total = marketplace.plugins.length;
  const chips = [['all', 'All', total, '#171512'],
    ...Object.values(categories).filter(c => c.plugins.length).map(c =>
      [c.title, c.title, c.plugins.length, CAT_COLOR[c.title] || '#e6196e'])];
  const chipHtml = chips.map(([val, label, n, color], i) =>
    `<button type="button" class="chip mono${i === 0 ? ' active' : ''}" data-cat="${val}" style="--chip:${color}">${label} (${n})</button>`
  ).join('\n        ');
  return `<div class="toolbar rule-t rule-b glass" role="search">
      <div class="toolbar-search">
        <span class="mono" aria-hidden="true">⌕</span>
        <input type="search" class="mono" data-search placeholder="Search names, tags, descriptions…" aria-label="Search skills" />
        <span class="mono" data-count>${total} of ${total} entries</span>
      </div>
      <div class="toolbar-chips">
        ${chipHtml}
        <button type="button" class="chip-cleartag mono" data-cleartag hidden></button>
      </div>
    </div>`;
}
```

In `indexHtml`, remove the temporary `</div>` added in Task 2 and place `${generateToolbar()}` immediately after `${generateMasthead()}`. (The `.wrap` stays open through Task 6.)

- [ ] **Step 4: Extend `generateInteractiveScript()`**

Before the closing `</script>`, add:

```js
  const search = document.querySelector('[data-search]');
  if (search) {
    const rows = [...document.querySelectorAll('[data-skill-row]')];
    const countEl = document.querySelector('[data-count]');
    const chips = [...document.querySelectorAll('.chip[data-cat]')];
    const clearTag = document.querySelector('[data-cleartag]');
    let cat = 'all', tag = null;
    const apply = () => {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      rows.forEach(r => {
        const okCat = cat === 'all' || r.dataset.cat === cat;
        const okTag = !tag || r.dataset.tags.split(',').includes(tag);
        const hay = (r.dataset.name + ' ' + r.dataset.desc + ' ' + r.dataset.tags).toLowerCase();
        const okQ = !q || hay.includes(q);
        const show = okCat && okTag && okQ;
        r.style.display = show ? '' : 'none';
        if (show) shown++;
      });
      document.querySelectorAll('[data-cat-section]').forEach(s => {
        const any = [...s.querySelectorAll('[data-skill-row]')].some(r => r.style.display !== 'none');
        s.style.display = any ? '' : 'none';
      });
      const empty = document.querySelector('[data-empty]');
      if (empty) empty.hidden = shown !== 0;
      if (countEl) countEl.textContent = shown + ' of ' + rows.length + ' entries';
    };
    search.addEventListener('input', apply);
    chips.forEach(c => c.addEventListener('click', () => {
      cat = c.dataset.cat; tag = null;
      chips.forEach(x => x.classList.toggle('active', x === c));
      if (clearTag) clearTag.hidden = true;
      apply();
    }));
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-tag]');
      if (!t) return;
      e.preventDefault(); e.stopPropagation();
      tag = t.dataset.tag; cat = 'all';
      chips.forEach(x => x.classList.toggle('active', x.dataset.cat === 'all'));
      if (clearTag) { clearTag.hidden = false; clearTag.textContent = '#' + tag + ' ✕'; }
      window.scrollTo({ top: 360, behavior: 'smooth' });
      apply();
    });
    if (clearTag) clearTag.addEventListener('click', () => { tag = null; clearTag.hidden = true; apply(); });
    const resetBtn = document.querySelector('[data-reset]');
    if (resetBtn) resetBtn.addEventListener('click', () => { search.value=''; cat='all'; tag=null; chips.forEach(x=>x.classList.toggle('active',x.dataset.cat==='all')); if(clearTag) clearTag.hidden=true; apply(); });
  }
```

- [ ] **Step 5: Add toolbar CSS**

```css
.toolbar{position:sticky;top:0;z-index:20;background:rgba(255,255,255,0.86);backdrop-filter:blur(10px);}
.toolbar-search{display:flex;align-items:center;gap:10px;padding:14px 0;}
.toolbar-search input{flex:1;min-width:200px;font-size:14px;color:var(--ink);background:transparent;border:none;outline:none;}
.toolbar-search input::placeholder{color:var(--muted-3);}
.toolbar-search [data-count]{font-size:12px;letter-spacing:0.04em;color:var(--muted);white-space:nowrap;}
.toolbar-chips{display:flex;gap:22px;flex-wrap:wrap;padding:13px 0 14px;border-top:1px solid var(--hair-2);}
.chip{font-size:13px;font-weight:500;background:none;border:none;border-bottom:2px solid transparent;padding:0 0 4px;cursor:pointer;color:var(--muted);white-space:nowrap;}
.chip.active{color:var(--chip);border-bottom-color:var(--chip);}
.chip-cleartag{margin-left:auto;font-size:12px;color:var(--accent);background:none;border:none;cursor:pointer;}
```

- [ ] **Step 6: Run test + generate**

Run: `node --test tests/generate-site-redesign.test.js` → PASS
Run: `npm run generate` → exits 0

- [ ] **Step 7: Commit**

```bash
git add scripts/generate-site.js docs/style.css tests/generate-site-redesign.test.js
git commit -m "feat: sticky search/filter toolbar with client-side filtering"
```

---

## Task 4: Category index of skill rows + empty state

**Files:**
- Modify: `scripts/generate-site.js` — replace `generatePluginCard()` (462-490) with `generateSkillRow()`; rewrite `generateCategorySections()` (604-623); replace the index `<main>` sections (981-1076) with the toolbar-fed list + empty state.
- Modify: `docs/style.css` (index + row block)
- Modify: `tests/generate-site-npx-install.test.js` (remove the Get-Started assertion)
- Test: `tests/generate-site-redesign.test.js`

**Interfaces:**
- Consumes: `getNpxInstallCommand`, `getPluginInstallCommand`, `pluginHasSkills`, `cleanDescription`; the `data-*` row attributes from Task 3.
- Produces: top-level `const pad` (`CAT_COLOR` already exists from Task 3); `generateSkillRow(plugin, gi, catTitle)`; rewritten `generateCategorySections()` numbering rows 01…28 across sections. Rows carry `class="skill-row"` + `data-skill-row data-name data-desc data-tags data-cat`. Category `<section>` carries `data-cat-section`. Task 7 also uses `CAT_COLOR` and `pad`.

- [ ] **Step 1: Write the failing test**

```js
test('index: one row per marketplace entry, with details links', () => {
  const marketplace = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'));
  const rowCount = (index.match(/class="skill-row"/g) || []).length;
  assert.strictEqual(rowCount, marketplace.plugins.length);
  assert.match(index, /href="plugins\/simmer\/"/);
});
test('index: MCP-only row copies the Claude Code command, not npx', () => {
  assert.match(index, /data-copy="\/plugin install journal@2389-research"/);
  assert.doesNotMatch(index, /data-copy="npx skills add 2389-research\/journal"/);
});
test('index: numbered category sections and an empty state', () => {
  assert.match(index, /data-cat-section/);
  assert.match(index, /data-empty/);
  assert.match(index, /Nothing here\./);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/generate-site-redesign.test.js`
Expected: FAIL.

- [ ] **Step 3: Replace `generatePluginCard()` with `generateSkillRow()`**

```js
// CAT_COLOR is already defined at top level in Task 3 — do not redeclare it.
const pad = n => String(n).padStart(2, '0');

function generateSkillRow(plugin, gi, catTitle) {
  const desc = cleanDescription(plugin.description);
  const tags = (plugin.keywords || []).slice(0, 3);
  const isMcp = !pluginHasSkills(plugin);
  const copyCmd = isMcp ? getPluginInstallCommand(plugin) : getNpxInstallCommand(plugin);
  const color = CAT_COLOR[catTitle] || '#e6196e';
  const tagHtml = tags.map(t =>
    `<button type="button" class="tag-btn mono" data-tag="${t}">#${t}</button>`
  ).join(' ');
  return `<a href="plugins/${plugin.name}/" class="skill-row" data-skill-row data-name="${plugin.name}" data-desc="${desc.replace(/"/g, '&quot;')}" data-tags="${tags.join(',')}" data-cat="${catTitle}" data-tinylytics-event="plugin.view-details" data-tinylytics-event-value="${plugin.name}">
              <div class="row-num mono">${pad(gi)}</div>
              <div class="row-body">
                <div class="row-title">
                  <h3 class="skill-name mono">${plugin.name}</h3>
                  ${isMcp ? `<span class="mcp-badge mono">MCP</span>` : ''}
                  <span class="skill-ver mono">v${plugin.version || '1.0.0'}</span>
                </div>
                <p class="skill-desc">${desc}</p>
                <div class="row-tags">${tagHtml}</div>
              </div>
              <div class="row-rail">
                <span class="row-cat mono" style="color:${color}">${catTitle}</span>
                <button type="button" class="row-copy mono" data-copy="${copyCmd}" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}">copy install</button>
                <span class="row-more mono">details →</span>
              </div>
            </a>`;
}
```

- [ ] **Step 4: Rewrite `generateCategorySections()`**

```js
function generateCategorySections() {
  let gi = 0, si = 0;
  return Object.values(categories)
    .filter(cat => cat.plugins.length > 0)
    .map(cat => {
      si++;
      const color = CAT_COLOR[cat.title] || '#e6196e';
      const rows = cat.plugins.map(p => { gi++; return generateSkillRow(p, gi, cat.title); }).join('\n');
      return `<section class="cat-section" data-cat-section style="animation:fadeIn .3s ease both">
          <div class="cat-head">
            <span class="mono cat-num" style="color:${color}">${pad(si)}</span>
            <h2 class="cat-name">${cat.title}</h2>
            <span class="mono cat-count">${cat.plugins.length} skill${cat.plugins.length !== 1 ? 's' : ''}</span>
            <span class="cat-rule"></span>
          </div>
          <p class="mono cat-blurb">${cat.description}</p>
          ${rows}
        </section>`;
    }).join('\n');
}
```

- [ ] **Step 5: Replace the index `<main>` sections**

The toolbar already sits after the masthead (Task 3). Replace the old `<main>…</main>` (the plugins section, "About This Marketplace", "Get Started in 30 Seconds", "Learn More", and the Star-CTA — lines 981-1076) with:

```js
    <main id="main-content" class="index-list">
      ${generateCategorySections()}
      <div class="empty-state" data-empty hidden>
        <div class="empty-big">Nothing here.</div>
        <div class="mono empty-sub">No entries match your filters.</div>
        <button type="button" class="mono btn-outline" data-reset>Clear filters</button>
      </div>
    </main>
```

(The richer About/Get-Started/Learn-More prose is dropped from the page to match the comp; it survives for AI agents in the `index.md` mirror, which is untouched.)

- [ ] **Step 6: Add index/row CSS**

```css
.index-list{padding:8px 0 40px;}
.cat-section{padding:34px 24px 0;margin:0 -24px;}
.cat-head{display:flex;align-items:baseline;gap:16px;margin-bottom:6px;}
.cat-num{font-size:13px;}
.cat-name{font-size:26px;font-weight:500;letter-spacing:-0.01em;margin:0;color:var(--ink);}
.cat-count{font-size:12px;color:var(--muted);}
.cat-rule{flex:1;height:1px;background:var(--hair-3);}
.cat-blurb{font-size:12px;letter-spacing:0.03em;color:var(--muted);margin:0 0 6px;}
.skill-row{display:grid;grid-template-columns:52px 1fr auto;gap:0 20px;align-items:start;padding:22px 12px 22px 0;border-top:1px solid var(--hair);cursor:pointer;color:inherit;}
.skill-row:hover{background:rgba(250,249,246,0.75);text-decoration:none;}
.row-num{font-size:14px;color:var(--muted-2);padding-top:3px;}
.row-body{min-width:0;}
.row-title{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:6px;}
.skill-name{font-size:19px;font-weight:600;margin:0;color:var(--ink);}
.mcp-badge{font-size:9px;font-weight:600;letter-spacing:0.1em;color:var(--mcp);border:1px solid var(--mcp);padding:2px 5px;}
.skill-ver{font-size:11px;color:var(--muted-2);}
.skill-desc{font-size:17px;line-height:1.5;color:var(--body);margin:0 0 12px;max-width:64ch;text-wrap:pretty;}
.row-tags{display:flex;flex-wrap:wrap;gap:6px 14px;}
.tag-btn{font-size:12px;color:var(--muted);background:none;border:none;padding:0;cursor:pointer;}
.tag-btn:hover{color:var(--accent);}
.row-rail{display:flex;flex-direction:column;align-items:flex-end;gap:8px;}
.row-cat{font-size:10px;letter-spacing:0.08em;text-transform:uppercase;}
.row-copy{font-size:12px;font-weight:600;color:#fff;background:var(--ink);border:1.5px solid var(--ink);padding:7px 13px;cursor:pointer;white-space:nowrap;}
.row-copy.copied{color:var(--cat-personal);background:#fff;border-color:var(--cat-personal);}
.row-more{font-size:12px;color:var(--muted-2);}
.empty-state{text-align:center;padding:90px 0 110px;}
.empty-big{font-size:44px;font-style:italic;color:var(--hair-3);margin-bottom:10px;}
.empty-sub{font-size:13px;color:var(--muted);}
.btn-outline{margin-top:20px;font-size:13px;font-weight:600;color:var(--accent);background:none;border:1.5px solid var(--accent);padding:9px 18px;cursor:pointer;}
.btn-outline:hover{background:var(--accent);color:#fff;}
@media(max-width:640px){.skill-row{grid-template-columns:32px 1fr;}.row-rail{grid-column:2;flex-direction:row;flex-wrap:wrap;align-items:center;}}
```

- [ ] **Step 7: Remove the Get-Started legacy assertion**

In `tests/generate-site-npx-install.test.js`, delete line 29 (`class="install-tab active"[^>]*data-tab="npx-getstarted"`) and its comment on line 28 — the homepage "Get Started" tabbed block is removed. Leave line 32 (`npx skills add 2389-research/simmer` on the index) — the non-MCP row still carries npx in `data-copy`, so it stays green.

- [ ] **Step 8: Run tests + generate**

Run: `node --test tests/generate-site-redesign.test.js` → PASS
Run: `npm run generate:site` → PASS
Run: `npm run generate` → exits 0

- [ ] **Step 9: Commit**

```bash
git add scripts/generate-site.js docs/style.css tests/generate-site-redesign.test.js tests/generate-site-npx-install.test.js
git commit -m "feat: numbered category index of editorial skill rows + empty state"
```

---

## Task 5: Topographic background

**Files:**
- Modify: `scripts/generate-site.js` — extend `generateInteractiveScript()` with topo init.
- Test: `tests/generate-site-redesign.test.js`

**Interfaces:**
- Consumes: `#topo-bg` canvas (Task 2), `window.THREE`.
- Produces: reduced-motion-aware topo animation. Additive; no change to the copy or filter blocks.

- [ ] **Step 1: Write the failing test**

```js
test('script: topo init is reduced-motion aware', () => {
  assert.match(index, /getElementById\('topo-bg'\)/);
  assert.match(index, /prefers-reduced-motion/);
  assert.match(index, /new THREE\.WebGLRenderer/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/generate-site-redesign.test.js`
Expected: FAIL.

- [ ] **Step 3: Add the topo init to `generateInteractiveScript()`**

Append before `</script>` (ported from the comp's `initTopo`, `Skills Library.dc.html` ~lines 300-369, with a reduced-motion guard):

```js
  (function topo(){
    var canvas = document.getElementById('topo-bg');
    if (!canvas || !window.THREE) { if (!window.__topoTries) window.__topoTries = 0; if (window.__topoTries++ < 40) setTimeout(topo, 120); return; }
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var THREE = window.THREE, scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 3.2, 10.5);
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 2.05, 3.15); camera.lookAt(0, -0.15, -1.6);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    var SEG = 108, SIZE = 18;
    var geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG); geo.rotateX(-Math.PI/2);
    var base = geo.attributes.position.array.slice();
    scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xe6196e, wireframe: true, transparent: true, opacity: 0.16 })));
    var m2 = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x171512, wireframe: true, transparent: true, opacity: 0.05 })); m2.position.y = 0.012; scene.add(m2);
    var p = [0,1,2,3].map(function(i){ return i * 1.7; });
    var H = function(x,z,t){ return Math.sin(x*0.55+t+p[0])*0.55 + Math.cos(z*0.42-t*0.75+p[1])*0.5 + Math.sin((x+z)*0.30+t*0.6+p[2])*0.42 + Math.sin(x*0.16-z*0.22+t*0.35+p[3])*0.7; };
    var pos = geo.attributes.position;
    function resize(){ var w = canvas.clientWidth||innerWidth, h = canvas.clientHeight||innerHeight; renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
    addEventListener('resize', resize); resize();
    var start = performance.now();
    function frame(){ var t = reduce ? 6.2 : (performance.now()-start)*0.00035; for (var i=0;i<pos.count;i++){ var x=base[i*3], z=base[i*3+2]; var y=H(x,z,t); var edge=1-Math.min(1,(Math.abs(x)+Math.abs(z))/15); pos.array[i*3+1]=y*(0.35+edge*0.9); } pos.needsUpdate=true; renderer.render(scene,camera); if(!reduce) requestAnimationFrame(frame); }
    frame();
  })();
```

(Note: the comp seeds the phase array with `Math.random()`; scripts here use a fixed seed so output is deterministic. Motion still animates via `performance.now()`.)

- [ ] **Step 4: Run test + generate**

Run: `node --test tests/generate-site-redesign.test.js` → PASS
Run: `npm run generate` → exits 0

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-site.js tests/generate-site-redesign.test.js
git commit -m "feat: three.js topo background, reduced-motion aware"
```

---

## Task 6: Colophon footer + close the index

**Files:**
- Modify: `scripts/generate-site.js` — rewrite `generateFooter()` (426-459); close `.wrap` and call footer + script in `indexHtml`.
- Modify: `docs/style.css` (footer block)
- Test: `tests/generate-site-redesign.test.js`

**Interfaces:**
- Produces: `generateFooter(isPluginPage)` → colophon with copyright + GitHub / Skills Guide / Glossary / 2389.ai links, in `.rule-t`. Path prefix respects `isPluginPage`.

- [ ] **Step 1: Write the failing test**

```js
test('footer: colophon with copyright and links', () => {
  assert.match(index, /© 2026 2389 Research Inc/);
  assert.match(index, /Skills Guide/);
  assert.match(index, /2389\.ai/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/generate-site-redesign.test.js`
Expected: FAIL (old footer text differs).

- [ ] **Step 3: Rewrite `generateFooter()`**

```js
function generateFooter(isPluginPage = false) {
  const home = isPluginPage ? '../../' : '';
  const year = new Date().getFullYear();
  return `<footer class="colophon rule-t glass">
      <span class="mono">© ${year} 2389 Research Inc — all plugins open source</span>
      <span class="colophon-links mono">
        <a href="https://github.com/2389-research/claude-plugins" target="_blank" rel="noopener noreferrer" data-tinylytics-event="footer.company" data-tinylytics-event-value="github">GitHub</a>
        <a href="https://docs.claude.com/en/docs/claude-code/skills" target="_blank" rel="noopener noreferrer" data-tinylytics-event="footer.resource" data-tinylytics-event-value="skills-guide">Skills Guide</a>
        <a href="${home}glossary/" data-tinylytics-event="footer.resource" data-tinylytics-event-value="glossary">Glossary</a>
        <a href="https://2389.ai" target="_blank" rel="noopener noreferrer" data-tinylytics-event="footer.company" data-tinylytics-event-value="about">2389.ai</a>
      </span>
    </footer>`;
}
```

- [ ] **Step 4: Close the index correctly**

Ensure the end of `indexHtml` reads:

```js
      ${generateFooter(false)}
    </div><!-- /.wrap -->
  ${generateInteractiveScript()}
</body>
</html>`;
```

Remove any temporary `.wrap` close from earlier tasks.

- [ ] **Step 5: Add footer CSS**

```css
.colophon{margin:0 -24px;padding:26px 24px 60px;display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:16px;font-size:12px;color:var(--muted);}
.colophon-links{display:flex;gap:24px;flex-wrap:wrap;}
```

- [ ] **Step 6: Run tests + generate**

Run: `node --test tests/generate-site-redesign.test.js` → PASS
Run: `node --test tests/` — the redesign suite plus `convert-repo-links` PASS
Run: `npm run generate:site` → PASS
Run: `npm run generate` → exits 0

- [ ] **Step 7: Commit**

```bash
git add scripts/generate-site.js docs/style.css tests/generate-site-redesign.test.js
git commit -m "feat: editorial colophon footer; finalize index layout"
```

---

## Task 7: Per-plugin detail page + related links; remove legacy install UI

**Files:**
- Modify: `scripts/generate-site.js` — rewrite `generatePluginPage()` (673-865) and `generateRelatedPlugins()` (626-670); delete `renderInstallTabs()` (507-516), `generateQuickInstallSteps()` (552-601), and the legacy `.install-command`/`.install-tabs` handlers in `generateInteractiveScript()` (522-548).
- Modify: `docs/style.css` (detail + readme + related block)
- Modify: `tests/generate-site-npx-install.test.js` and `tests/generate-site-install-template.test.js` (detail assertions)
- Test: `tests/generate-site-redesign.test.js`

**Interfaces:**
- Consumes: `getReadmeContent`, `markdownToHtml`, `convertRepoLinks`, `getCategoryForPlugin`, `getNpxInstallCommand`, `getPluginInstallCommand`, `pluginHasSkills`, `cleanDescription`, `CAT_COLOR`, `pad`, `generateRelatedPlugins`, `generateFooter`, `generateInteractiveScript`.
- Produces: editorial `generatePluginPage(plugin)` with `.install-box` + `[data-copy]` buttons (no `.install-command`, no tabs); prev/next in flat `marketplace.plugins` order; `generateRelatedPlugins()` emitting plain links only.

- [ ] **Step 1: Write the failing test**

```js
test('detail: editorial header, both install blocks, no legacy install UI', () => {
  const simmer = fs.readFileSync(path.join(ROOT, 'docs/plugins/simmer/index.html'), 'utf8');
  assert.match(simmer, /← All skills/);
  assert.match(simmer, /npx skills add 2389-research\/simmer/);
  assert.match(simmer, /\/plugin install simmer@2389-research/);
  assert.match(simmer, /readme-body/);
  assert.doesNotMatch(simmer, /install-tabs/);
  assert.doesNotMatch(simmer, /class="plugin-install"/);
});
test('detail: MCP-only page omits the npx block', () => {
  const journal = fs.readFileSync(path.join(ROOT, 'docs/plugins/journal/index.html'), 'utf8');
  assert.doesNotMatch(journal, /npx skills add 2389-research\/journal/);
  assert.match(journal, /\/plugin install journal@2389-research/);
});
test('detail: prev/next follow flat marketplace order', () => {
  const marketplace = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'));
  const i = marketplace.plugins.findIndex(p => p.name === 'simmer');
  const simmer = fs.readFileSync(path.join(ROOT, 'docs/plugins/simmer/index.html'), 'utf8');
  assert.match(simmer, new RegExp('\\.\\./' + marketplace.plugins[i-1].name + '/'));
  assert.match(simmer, new RegExp('\\.\\./' + marketplace.plugins[i+1].name + '/'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/generate-site-redesign.test.js`
Expected: FAIL.

- [ ] **Step 3: Rewrite `generateRelatedPlugins()`**

```js
function generateRelatedPlugins(plugin, category) {
  const related = category.plugins.filter(p => p.name !== plugin.name).slice(0, 3);
  if (related.length === 0) return '';
  return `<section class="related rule-t">
      <div class="mono related-label">More from ${category.title}</div>
      <ul class="related-list">
        ${related.map(p => `<li><a href="../${p.name}/" data-tinylytics-event="related.view-plugin" data-tinylytics-event-value="${p.name}"><span class="mono related-name">${p.name}</span><span class="related-desc">${cleanDescription(p.description)}</span></a></li>`).join('\n        ')}
      </ul>
    </section>`;
}
```

- [ ] **Step 4: Rewrite `generatePluginPage()`**

Keep the top of the function (readme fetch, `readmeHtml`, `convertRepoLinks`, `description`). Add before the `return`:

```js
  const cat = getCategoryForPlugin(plugin);
  const catColor = CAT_COLOR[cat.title] || '#e6196e';
  const isMcp = !pluginHasSkills(plugin);
  const allPlugins = marketplace.plugins;
  const idx = allPlugins.findIndex(p => p.name === plugin.name);
  const prev = idx > 0 ? allPlugins[idx - 1] : null;
  const next = idx < allPlugins.length - 1 ? allPlugins[idx + 1] : null;
  const tagHtml = (plugin.keywords || []).slice(0, 6).map(t =>
    `<a href="../../" class="tag-btn mono" data-tinylytics-event="plugin.tag" data-tinylytics-event-value="${t}">#${t}</a>`
  ).join(' ');
  const npxBlock = isMcp ? '' : `
          <div class="mono install-label">Install — npx (any agent)</div>
          <div class="install-box">
            <code class="mono">${getNpxInstallCommand(plugin)}</code>
            <button type="button" class="btn-primary" data-copy="${getNpxInstallCommand(plugin)}" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}-npx">Copy</button>
          </div>`;
```

Replace the entire returned template (from `generateNav(true)` through the `back-section`) with:

```js
  return `<!DOCTYPE html>
<html lang="en">
${generateHead(plugin.name, description, `plugins/${plugin.name}/`, plugin.keywords)}
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <canvas id="topo-bg" aria-hidden="true"></canvas>
  <div class="topo-fade" aria-hidden="true"></div>
  <div class="wrap detail">
    <div class="detail-topbar mono rule-b">
      <a href="../../" data-tinylytics-event="nav.home">← All skills</a>
      <span>2389 Research · Agent Skills</span>
    </div>
    <header class="detail-head">
      <div class="detail-kicker mono" style="color:${catColor}">${cat.title}${isMcp ? ' · <span class="mcp-badge">MCP SERVER</span>' : ''}</div>
      <div class="detail-title-row">
        <h1 class="detail-name mono">${plugin.name}</h1>
        <span class="detail-ver mono">v${plugin.version || '1.0.0'}</span>
      </div>
      <p class="detail-lede">${description}</p>
      <div class="row-tags">${tagHtml}</div>
      ${npxBlock}
      <div class="mono install-label">Install — Claude Code</div>
      <div class="install-box">
        <code class="mono">${getPluginInstallCommand(plugin)}</code>
        <button type="button" class="btn-ghost-sm mono" data-copy="${getPluginInstallCommand(plugin)}" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}">Copy</button>
      </div>
    </header>
    <main id="main-content" class="readme-body">
      ${readme ? readmeHtml : `<p>${description}</p>`}
    </main>
    <nav class="detail-nav mono rule-t" aria-label="Skill navigation">
      ${prev ? `<a href="../${prev.name}/" data-tinylytics-event="plugin.prev">← ${prev.name}</a>` : '<span></span>'}
      ${next ? `<a href="../${next.name}/" data-tinylytics-event="plugin.next">${next.name} →</a>` : '<span></span>'}
    </nav>
    ${generateRelatedPlugins(plugin, cat)}
    ${generateFooter(true)}
  </div>
  ${generateInteractiveScript()}
</body>
</html>`;
```

(Match the local variable that already holds the fetched README — the existing function reads it via `getReadmeContent`; reuse that variable for the `readme ? readmeHtml : …` check.)

- [ ] **Step 5: Delete the dead install helpers and legacy handlers**

- Delete `renderInstallTabs()` (507-516) and `generateQuickInstallSteps()` (552-601).
- In `generateInteractiveScript()`, delete the two legacy blocks: the `document.querySelectorAll('.install-command, .plugin-install')…` forEach (522-532) and the `document.querySelectorAll('.install-tabs')…` forEach (534-548). Keep the `[data-copy]` handler, the search/filter block, and topo.
- Grep to confirm nothing else emits or calls them: `grep -n "renderInstallTabs\|generateQuickInstallSteps\|install-tabs\|plugin-install\|install-command" scripts/generate-site.js` → no matches in the generator.

- [ ] **Step 6: Add detail + readme + related CSS**

```css
.detail-topbar{display:flex;justify-content:space-between;align-items:baseline;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);padding:52px 0 16px;}
.detail-head{max-width:760px;padding:48px 0 30px;}
.detail-kicker{font-size:12px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:18px;}
.detail-kicker .mcp-badge{font-size:10px;}
.detail-title-row{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;margin-bottom:22px;}
.detail-name{font-size:clamp(30px,5vw,52px);font-weight:600;letter-spacing:-0.02em;margin:0;color:var(--ink);}
.detail-ver{font-size:14px;color:var(--muted-2);}
.detail-lede{font-size:clamp(19px,2.4vw,24px);line-height:1.55;color:var(--body-2);margin:0 0 26px;text-wrap:pretty;}
.detail-head .row-tags{gap:8px 18px;margin-bottom:36px;}
.install-label{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-bottom:9px;}
.install-box{display:flex;align-items:center;gap:10px;background:var(--paper);border:1.5px solid var(--ink);padding:12px 12px 12px 16px;margin-bottom:20px;}
.install-box code{flex:1;font-size:14px;color:var(--body-2);overflow-x:auto;white-space:nowrap;}
.btn-ghost-sm{font-size:12px;font-weight:600;color:var(--ink);background:#fff;border:1.5px solid var(--ink);padding:9px 14px;cursor:pointer;}
.btn-ghost-sm:hover,.btn-ghost-sm.copied{background:var(--ink);color:#fff;}
.readme-body{max-width:760px;padding:20px 0 10px;font-size:18px;line-height:1.65;color:var(--body-2);}
.readme-body h1,.readme-body h2,.readme-body h3{font-weight:600;letter-spacing:-0.01em;color:var(--ink);margin:1.6em 0 .5em;}
.readme-body h2{font-size:28px;border-bottom:1px solid var(--hair);padding-bottom:.2em;}
.readme-body code{font-family:'IBM Plex Mono',monospace;font-size:.85em;background:var(--paper);padding:.1em .3em;}
.readme-body pre{background:var(--paper);border:1.5px solid var(--ink);padding:16px;overflow-x:auto;}
.readme-body pre code{background:none;padding:0;}
.readme-body a{color:var(--accent);}
.readme-body table{border-collapse:collapse;width:100%;}
.readme-body th,.readme-body td{border:1px solid var(--hair);padding:8px 12px;text-align:left;}
.detail-nav{display:flex;justify-content:space-between;gap:20px;padding:20px 0 10px;font-size:13px;}
.detail-nav a{color:var(--muted);}
.detail-nav a:hover{color:var(--accent);}
.related{margin:0 -24px;padding:26px 24px 10px;}
.related-label{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-bottom:12px;}
.related-list{list-style:none;margin:0;padding:0;}
.related-list li{border-top:1px solid var(--hair);}
.related-list a{display:flex;gap:16px;align-items:baseline;padding:12px 0;color:inherit;}
.related-list a:hover{text-decoration:none;color:var(--accent);}
.related-name{font-size:14px;font-weight:600;color:var(--ink);white-space:nowrap;}
.related-desc{font-size:14px;color:var(--body);}
```

- [ ] **Step 7: Update the legacy detail assertions**

In `tests/generate-site-npx-install.test.js`:
- Delete line 16 (`class="install-tab active"[^>]*data-tab="npx-simmer"`) and line 17 (`…npx-qi-simmer…`) — the detail page no longer uses tabs. Keep lines 14-15 (both commands present).
- Replace line 22 (`assert.doesNotMatch(journal, /qi-journal/, …)`) with:
  `assert.doesNotMatch(journal, /npx skills add 2389-research\/journal/, 'journal (MCP) page must not show npx anywhere');`

In `tests/generate-site-install-template.test.js`:
- Delete the `getInstallBlock` helper (lines 21-25).
- Replace the socialmedia block (lines 38-43) with:
  ```js
  const socialmediaPage = readPage('socialmedia');
  assert.match(socialmediaPage, /\/plugin install socialmedia@2389-research/, 'MCP plugin page shows the /plugin install at-form');
  assert.doesNotMatch(socialmediaPage, /npx skills add 2389-research\/socialmedia/, 'MCP plugin page must not show npx');
  ```
- The CSS-guard (lines 11-15) stays: the rewritten `docs/style.css` has no `.plugin-hero-actions .install-block`, so `doesNotMatch` passes.
- Refresh the now-false "tab" comments so they match reality (they describe UI this task removes): in `npx-install.test.js` the header comment (line 2, "npx is the default tab…"), the "npx tab active by default" comment (line 12), and the hero comment (line 24); in `install-template.test.js` the "Skill plugins now render install tabs" comment (line 33). Reword each to describe the one-line install blocks (npx present, `/plugin install` present, MCP-only pages npx-free) — don't just delete them.

- [ ] **Step 8: Run tests + generate**

Run: `node --test tests/generate-site-redesign.test.js` → PASS
Run: `npm run generate:site` → PASS (both legacy suites green)
Run: `npm run generate` → exits 0

- [ ] **Step 9: Commit**

```bash
git add scripts/generate-site.js docs/style.css tests/generate-site-redesign.test.js tests/generate-site-npx-install.test.js tests/generate-site-install-template.test.js
git commit -m "feat: restyle per-plugin pages; remove legacy install-tab UI"
```

---

## Task 8: Glossary restyle + remove `generateNav()`

**Files:**
- Modify: `scripts/generate-site.js` — rewrite the `glossaryHtml` body (1414-1469); delete `generateNav()` (403-423) once the glossary stops calling it.
- Modify: `docs/style.css` (glossary block)
- Test: `tests/generate-site-redesign.test.js`

**Interfaces:**
- Consumes: `generateHead`, `generateFooter`, `generateInteractiveScript`, `.wrap`, `.mast-bar`, tokens, `GLOSSARY_TERMS` (array of `[term, definition]` tuples), `glossaryStructuredData`.
- Produces: `docs/glossary/index.html` in the editorial language; `generateNav()` removed (no callers remain).

- [ ] **Step 1: Write the failing test**

```js
test('glossary: editorial shell, tuples rendered, JSON-LD kept', () => {
  const g = fs.readFileSync(path.join(ROOT, 'docs/glossary/index.html'), 'utf8');
  assert.match(g, /family=Newsreader:/);
  assert.match(g, /class="wrap/);
  assert.match(g, /© 2026 2389 Research Inc/);
  assert.match(g, /application\/ld\+json/);
  assert.doesNotMatch(g, /class="nav"/);
});
test('generator: generateNav is fully removed', () => {
  const src = fs.readFileSync(path.join(ROOT, 'scripts/generate-site.js'), 'utf8');
  assert.doesNotMatch(src, /function generateNav/);
  assert.doesNotMatch(src, /generateNav\(/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/generate-site-redesign.test.js`
Expected: FAIL.

- [ ] **Step 3: Rewrite the glossary body**

Replace the `<body>…</body>` of `glossaryHtml` (keep the `${generateHead('Glossary', …)}` call at 1413 and the closing `</html>`) with:

```js
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <canvas id="topo-bg" aria-hidden="true"></canvas>
  <div class="topo-fade" aria-hidden="true"></div>
  <div class="wrap">
    <div class="mast-bar mono rule-b" style="padding-top:52px">
      <a href="../">← All skills</a>
      <span>Glossary · 2389 Research</span>
    </div>
    <header class="glossary-head glass">
      <div class="kicker">Reference</div>
      <h1 class="hero-head" style="font-size:clamp(40px,6vw,72px)">Glossary</h1>
      <p class="hero-lede">Terms you'll meet across coding-agent skills and MCP servers.</p>
    </header>
    <main id="main-content" class="glossary-list">
      ${GLOSSARY_TERMS.map(([term, definition]) => `<section class="glossary-term">
        <h2 class="mono">${term}</h2>
        <p>${definition}</p>
      </section>`).join('\n')}
    </main>
    ${generateFooter(false)}
  </div>
  <script type="application/ld+json">
  ${glossaryStructuredData}
  </script>
  ${generateInteractiveScript()}
</body>
```

- [ ] **Step 4: Delete `generateNav()`**

Remove the whole `generateNav()` function (403-423). Confirm no callers: `grep -n "generateNav" scripts/generate-site.js` → no matches.

- [ ] **Step 5: Add glossary CSS**

```css
.glossary-head{padding:44px 24px 34px;margin:0 -24px;}
.glossary-head .kicker{margin-bottom:16px;}
.glossary-list{padding:24px 0 40px;max-width:760px;}
.glossary-term{padding:22px 0;border-top:1px solid var(--hair);}
.glossary-term h2{font-size:20px;font-weight:600;margin:0 0 8px;color:var(--ink);}
.glossary-term p{font-size:17px;line-height:1.55;color:var(--body);margin:0;max-width:64ch;}
```

- [ ] **Step 6: Run tests + generate**

Run: `node --test tests/generate-site-redesign.test.js` → PASS
Run: `node --test tests/` and `npm run generate:site` → all suites PASS
Run: `npm run generate` → exits 0

- [ ] **Step 7: Commit**

```bash
git add scripts/generate-site.js docs/style.css tests/generate-site-redesign.test.js
git commit -m "feat: restyle glossary to editorial language; drop legacy nav"
```

---

## Task 9: Visual accuracy pass (agent-browser)

**Files:**
- Modify: `scripts/generate-site.js` / `docs/style.css` as defects are found.
- No unit test — acceptance verification against the comp.

**Setup:**
- Extract the comp: `mkdir -p .scratch/comp && unzip -o "Claude code skills library.zip" -d .scratch/comp`.
- `npm run generate`, then serve docs: `npx --yes serve docs -l 4173`. For remote viewing, use the machine's tailscale IP (`ifconfig | grep "inet 100\."`) instead of localhost.

- [ ] **Step 1: Invoke the agent-browser skill** — announce it; use it for all browser steps below.

- [ ] **Step 2: Capture the reference** — open `.scratch/comp/Skills Library.dc.html`; screenshot index (masthead, install strip, toolbar, a category of rows, colophon) and a comp detail view.

- [ ] **Step 3: Capture the candidate** — open the served site; screenshot the same surfaces.

- [ ] **Step 4: Compare and log defects** — per surface, compare fonts/weights/sizes, color tokens, 1.5px ink rules, glass blur, section numbering, spacing. Record concrete diffs. Ignore differences from live data vs the comp's hardcoded rows.

- [ ] **Step 5: Verify interactions** — search filters rows + updates `[data-count]`; each category chip narrows correctly; a `#tag` filters + shows the clear-tag chip; no-match shows the empty state and Clear filters restores; a row copy button flips to "✓ copied", clipboard holds the right command, and the row does NOT navigate; clicking the row body navigates to `/plugins/<name>/`; the topo canvas animates, and under emulated `prefers-reduced-motion: reduce` it renders one static frame.

- [ ] **Step 6: Verify detail + glossary** — `/plugins/simmer/` and `/plugins/journal/` (MCP, no npx block); README readability and code contrast; prev/next; related links; footer. `/glossary/`.

- [ ] **Step 7: Fix defects, regenerate, re-verify** — apply fixes, `npm run generate`, hard-reload, re-check. Repeat until each surface matches.

- [ ] **Step 8: Final sweep + commit**

Run: `node --test tests/` and `npm run generate:site` → all PASS.

```bash
git add scripts/generate-site.js docs/style.css
git commit -m "fix: visual-accuracy corrections from agent-browser review"
```

- [ ] **Step 9: Finish the branch** — use superpowers:finishing-a-development-branch to open a PR (or merge) for the redesign branch. The GitHub Action regenerates the site on merge to `main`.

---

## Notes for the executor

- The old index prose (About This Marketplace, Get Started, Learn More, Star CTA) is intentionally dropped to match the comp; the richer text survives in the `index.md` mirror (leave `homepageMarkdown()` / the markdown writers alone).
- Do not touch `marketplace.json`, the install-command helpers, README fetching, `markdownToHtml`, or the SEO/markdown-mirror writers.
- `og-image.png` per page comes from a separate script — out of scope.
- Before deleting any function, grep for callers: `grep -n "name" scripts/generate-site.js`.
- Keep every commit green: each task that removes a piece of the legacy install UI updates the matching test assertion in the same commit.

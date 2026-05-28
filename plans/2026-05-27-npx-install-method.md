# npx Install Method Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `npx skills add <repo>` (vercel-labs/skills) as the *default* install method alongside Claude Code `/plugin install`, across the README, generated HTML site, and all markdown mirrors.

**Architecture:** A single generator (`scripts/generate-site.js`) emits the site. We add four helpers — `getNpxInstallCommand`, `pluginHasSkills`, `renderInstallTabs`, `generateInteractiveScript` — then route every install surface through them. On HTML, both methods render as a tab toggle (npx active by default); MCP servers (`strict: true`) fall back to a single `/plugin install`. In markdown, two labelled fenced blocks (npx first). Tests run the generator and assert on the emitted files.

**Tech Stack:** Node.js (no framework), plain string-templated HTML/CSS/JS, `assert`-based test scripts run via `npm test`.

**Spec:** `specs/2026-05-27-npx-install-method-design.md`

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `scripts/generate-site.js` | Site generator | Add 4 helpers; route 6 HTML surfaces + 4 markdown surfaces through them; share the interactive `<script>` between homepage and plugin pages | 
| `docs/style.css` | Styling | Add `.install-tabs` rules for dark (hero/plugin page) and light (`.plugin-card`) contexts | 
| `README.md` | Human entry point | Quick Start shows npx first, `/plugin` second | 
| `tests/generate-site-npx-install.test.js` | npx contract | **Create** | 
| `tests/generate-site-install-template.test.js` | existing install-block contract | Update skill-plugin assertions for the new tab structure | 
| `package.json` | scripts | Add `test` script | 
| `.github/workflows/generate-site.yml` | CI | Add a test step before generate | 

**Canonical tab markup** (produced only by `renderInstallTabs`, referenced throughout):

```html
<div class="install-tabs" data-install-tabs>
  <div class="install-tab-row" role="tablist" aria-label="Install method">
    <button type="button" class="install-tab active" role="tab" aria-selected="true" data-tab="npx-GROUP" aria-controls="panel-npx-GROUP" id="tab-npx-GROUP">npx (any agent)</button>
    <button type="button" class="install-tab" role="tab" aria-selected="false" data-tab="cc-GROUP" aria-controls="panel-cc-GROUP" id="tab-cc-GROUP">Claude Code</button>
  </div>
  <div class="install-tab-panel" role="tabpanel" id="panel-npx-GROUP" aria-labelledby="tab-npx-GROUP" data-panel="npx-GROUP">NPXHTML</div>
  <div class="install-tab-panel" role="tabpanel" id="panel-cc-GROUP" aria-labelledby="tab-cc-GROUP" data-panel="cc-GROUP" hidden>CCHTML</div>
</div>
```

`GROUP` is unique per tab group so ARIA ids don't collide: `hero`, `getstarted`, `<plugin.name>` (plugin-page hero), `qi-<plugin.name>` (quick-install), `card-<plugin.name>`, `related-<plugin.name>`.

---

## Task 1: Core helpers + plugin-page hero tabs + test harness

**Files:**
- Modify: `scripts/generate-site.js` (add helpers near other helpers ~line 526-532; modify plugin-page hero install block ~line 696-700; add script to plugin page ~before line 805; replace inline script ~line 1072)
- Modify: `package.json` (add `test` script)
- Create: `tests/generate-site-npx-install.test.js`
- Modify: `tests/generate-site-install-template.test.js`

- [ ] **Step 1: Add the `test` script to `package.json`**

In the `"scripts"` block add (after `"generate:og"`):

```json
    "test": "node tests/generate-site-install-template.test.js && node tests/generate-site-npx-install.test.js"
```

- [ ] **Step 2: Write the failing npx test**

Create `tests/generate-site-npx-install.test.js`:

```js
// ABOUTME: Tests the generator emits the npx (vercel-labs/skills) install method
// ABOUTME: npx is the default tab for skill plugins; MCP servers get /plugin only

const assert = require('assert');
const fs = require('fs');
const { execFileSync } = require('child_process');

execFileSync('npm', ['run', 'generate:site'], { stdio: 'pipe' });

const read = (p) => fs.readFileSync(p, 'utf8');

// Skill plugin page: npx present, /plugin present, npx tab active by default
const simmer = read('docs/plugins/simmer/index.html');
assert.match(simmer, /npx skills add 2389-research\/simmer/, 'simmer page should show npx command');
assert.match(simmer, /\/plugin install 2389-research\/simmer/, 'simmer page should still show /plugin install');
assert.match(simmer, /class="install-tab active"[^>]*data-tab="npx-simmer"/, 'npx tab should be active by default on simmer page');

// MCP server page: no npx, /plugin only
const journal = read('docs/plugins/journal/index.html');
assert.doesNotMatch(journal, /npx skills add/, 'MCP server page (journal) must not show npx');
assert.match(journal, /\/plugin install 2389-research\/journal/, 'journal page should show /plugin install');

console.log('generate-site npx install test passed (Task 1 scope)');
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — the install-template test fails first (its css-development/simmer assertions still expect the old block) **or** the npx test fails with "simmer page should show npx command". Either way, red.

- [ ] **Step 4: Add the four helpers**

In `scripts/generate-site.js`, immediately after `getPluginInstallCommand` (currently ~line 526-528), add:

```js
function getNpxInstallCommand(plugin) {
  return `npx skills add ${getRepoName(plugin)}`;
}

// MCP-only entries (strict: true) ship no skills, so npx skills add can't install them.
function pluginHasSkills(plugin) {
  return plugin.strict !== true;
}

// Renders the npx-default / Claude-Code-secondary install tabs.
// group must be unique per page so ARIA ids don't collide.
function renderInstallTabs({ group, npxHtml, ccHtml }) {
  return `<div class="install-tabs" data-install-tabs>
            <div class="install-tab-row" role="tablist" aria-label="Install method">
              <button type="button" class="install-tab active" role="tab" aria-selected="true" data-tab="npx-${group}" aria-controls="panel-npx-${group}" id="tab-npx-${group}">npx (any agent)</button>
              <button type="button" class="install-tab" role="tab" aria-selected="false" data-tab="cc-${group}" aria-controls="panel-cc-${group}" id="tab-cc-${group}">Claude Code</button>
            </div>
            <div class="install-tab-panel" role="tabpanel" id="panel-npx-${group}" aria-labelledby="tab-npx-${group}" data-panel="npx-${group}">${npxHtml}</div>
            <div class="install-tab-panel" role="tabpanel" id="panel-cc-${group}" aria-labelledby="tab-cc-${group}" data-panel="cc-${group}" hidden>${ccHtml}</div>
          </div>`;
}

// Shared interactive <script>: copy-to-clipboard + tab switching.
// Used by both the homepage and every plugin page (plugin pages had no script before).
function generateInteractiveScript() {
  return `<script>
  document.querySelectorAll('.install-command, .plugin-install').forEach(el => {
    el.title = 'Click to copy';
    el.addEventListener('click', () => {
      navigator.clipboard.writeText(el.textContent.trim()).then(() => {
        const orig = el.textContent;
        el.textContent = 'Copied!';
        el.classList.add('copied');
        setTimeout(() => { el.textContent = orig; el.classList.remove('copied'); }, 1500);
      });
    });
  });

  document.querySelectorAll('.install-tabs').forEach(group => {
    group.querySelectorAll('.install-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.tab;
        group.querySelectorAll('.install-tab').forEach(t => {
          const on = t === tab;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        group.querySelectorAll('.install-tab-panel').forEach(p => {
          p.hidden = p.dataset.panel !== key;
        });
      });
    });
  });
  </script>`;
}
```

- [ ] **Step 5: Convert the plugin-page hero install block**

In `generatePluginPage`, replace the current install block (~lines 696-700):

```js
        <div class="install-block">
          <span class="install-label">Install Command</span>
          <code class="install-command" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}">${generatePluginPageInstallSnippet(plugin)}</code>
        </div>
```

with:

```js
        <div class="install-block">
          <span class="install-label">Install</span>
          ${pluginHasSkills(plugin)
            ? renderInstallTabs({
                group: plugin.name,
                npxHtml: `<code class="install-command" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}-npx">${getNpxInstallCommand(plugin)}</code>`,
                ccHtml: `<code class="install-command" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}">${getPluginInstallCommand(plugin)}</code>`
              })
            : `<code class="install-command" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}">${getPluginInstallCommand(plugin)}</code>`}
        </div>
```

- [ ] **Step 6: Add the shared script to plugin pages**

In `generatePluginPage`, find the end of the template (the two `<script type="application/ld+json">` blocks before `</body>`). Immediately before `</body>` add:

```js
  ${generateInteractiveScript()}
</body>
```

(So the line that is currently `</body>` becomes `${generateInteractiveScript()}\n</body>` within that template literal.)

- [ ] **Step 7: Replace the homepage inline script with the shared helper**

In `indexHtml`, replace the entire inline `<script> … </script>` block (currently ~lines 1072-1086, the copy-to-clipboard script) with:

```js
  ${generateInteractiveScript()}
```

- [ ] **Step 8: Update the existing install-template test for skill plugins**

In `tests/generate-site-install-template.test.js`, the `css-development` and `simmer` assertions use `getInstallBlock`, whose non-greedy regex breaks on the nested tab `<div>`s. Replace the css-development block (lines 28-33) and the simmer block (lines 42-47) with full-page checks; **leave the socialmedia block (MCP, single block) unchanged**:

```js
// Skill plugins now render install tabs (npx default + /plugin secondary)
const cssPage = readPage('css-development');
assert.match(cssPage, /npx skills add 2389-research\/css-development/, 'expected npx command on skill plugin page');
assert.match(cssPage, /\/plugin install 2389-research\/css-development/, 'expected /plugin install on skill plugin page');

const socialmediaInstallBlock = getInstallBlock(readPage('socialmedia'));
assert.match(
  socialmediaInstallBlock,
  /\/plugin install 2389-research\/socialmedia/,
  'expected external plugin install block to use 2389-research/{name} format'
);

const simmerPage = readPage('simmer');
assert.match(simmerPage, /npx skills add 2389-research\/simmer/, 'expected npx command on simmer page');
assert.match(simmerPage, /\/plugin install 2389-research\/simmer/, 'expected /plugin install on simmer page');
```

- [ ] **Step 9: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — both `generate-site install template test passed` and `generate-site npx install test passed (Task 1 scope)`.

- [ ] **Step 10: Commit**

```bash
git add scripts/generate-site.js package.json tests/ docs/
git commit -m "feat: add npx install method to plugin pages (npx default)"
```

---

## Task 2: Tab styling (dark + light contexts)

**Files:**
- Modify: `docs/style.css` (append a new section; reuse design tokens)

- [ ] **Step 1: Add tab CSS**

Append to `docs/style.css` (after the Copy-to-clipboard block, ~line 1016):

```css
/* ============================================
   Install method tabs (npx default / Claude Code)
   ============================================ */
.install-tabs {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  width: 100%;
}

.install-tab-row {
  display: inline-flex;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.25rem;
}

.install-tab {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  background: transparent;
  border: 0;
  border-radius: var(--radius-sm);
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.install-tab:hover { color: var(--text-primary); }

.install-tab.active {
  color: var(--bg-primary);
  background: var(--accent-gold);
}

.install-tab-panel[hidden] { display: none; }

/* Light context: cards sit on white (--bg-card) */
.plugin-card .install-tab-row {
  background: rgba(26, 26, 46, 0.04);
  border-color: var(--border-on-card);
}
.plugin-card .install-tab { color: var(--text-on-card-secondary); }
.plugin-card .install-tab:hover { color: var(--text-on-card); }
.plugin-card .install-tab.active { color: var(--bg-primary); background: var(--accent-gold); }

/* Card footer becomes a column when it holds tabs */
.plugin-footer-tabs {
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-xs);
}
```

- [ ] **Step 2: Regenerate and confirm the width-cap guard still holds**

Run: `npm run generate:site`
Then: `npm test`
Expected: PASS (the install-template test's first assertion — no `max-width: 500px` on `.plugin-hero-actions .install-block` — is unaffected by these additions).

- [ ] **Step 3: Visual check**

Run: `open docs/plugins/simmer/index.html` (or your preview flow). Confirm: npx tab is gold/active by default showing `npx skills add 2389-research/simmer`; clicking "Claude Code" reveals `/plugin install 2389-research/simmer`; clicking a command copies it.

- [ ] **Step 4: Commit**

```bash
git add docs/style.css docs/
git commit -m "feat: style install method tabs for dark and card contexts"
```

---

## Task 3: Homepage hero + Get Started tabs

**Files:**
- Modify: `scripts/generate-site.js` (hero install block ~line 837-840; Get Started steps ~line 912-937)
- Modify: `tests/generate-site-npx-install.test.js` (add homepage assertions)

- [ ] **Step 1: Add failing homepage assertions**

In `tests/generate-site-npx-install.test.js`, before the final `console.log`, add:

```js
// Homepage: hero shows the npx pattern, default to npx
const index = read('docs/index.html');
assert.match(index, /npx skills add 2389-research\/&lt;plugin&gt;/, 'hero should show npx pattern command');
assert.match(index, /class="install-tab active"[^>]*data-tab="npx-hero"/, 'hero npx tab should be active by default');
// Get Started block defaults to the npx flow
assert.match(index, /class="install-tab active"[^>]*data-tab="npx-getstarted"/, 'Get Started should default to npx');
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL — "hero should show npx pattern command".

- [ ] **Step 3: Convert the hero install block**

Replace the hero install block (~lines 837-840):

```js
        <div class="install-block">
          <span class="install-label">One Command Install</span>
          <code class="install-command">${INTERNAL_MARKETPLACE_COMMAND}</code>
        </div>
```

with:

```js
        <div class="install-block">
          <span class="install-label">Install</span>
          ${renderInstallTabs({
            group: 'hero',
            npxHtml: `<code class="install-command">npx skills add 2389-research/&lt;plugin&gt;</code>`,
            ccHtml: `<code class="install-command">${INTERNAL_MARKETPLACE_COMMAND}</code>`
          })}
        </div>
```

- [ ] **Step 4: Convert the Get Started steps**

Replace the `.quick-start-steps` div inside the "Get Started in 30 Seconds" block (~lines 914-936) with tabs. The cc panel keeps the existing 3 steps; the npx panel is the one-command flow:

```js
          ${renderInstallTabs({
            group: 'getstarted',
            npxHtml: `<div class="quick-start-steps">
            <div class="step">
              <span class="step-number">1</span>
              <div class="step-content">
                <span class="step-label">Run it — works in any agent</span>
                <code>npx skills add 2389-research/better-dev</code>
              </div>
            </div>
            <div class="step">
              <span class="step-number">2</span>
              <div class="step-content">
                <span class="step-label">Pick your agents when prompted</span>
                <code>Claude Code, Cursor, Codex…</code>
              </div>
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <div class="step-content">
                <span class="step-label">That's it. Seriously.</span>
                <code>Skills auto-trigger when relevant</code>
              </div>
            </div>
          </div>`,
            ccHtml: `<div class="quick-start-steps">
            <div class="step">
              <span class="step-number">1</span>
              <div class="step-content">
                <span class="step-label">Add the marketplace</span>
                <code>/plugin marketplace add 2389-research/claude-plugins</code>
              </div>
            </div>
            <div class="step">
              <span class="step-number">2</span>
              <div class="step-content">
                <span class="step-label">Grab what you need</span>
                <code>/plugin install 2389-research/better-dev</code>
              </div>
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <div class="step-content">
                <span class="step-label">That's it. Seriously.</span>
                <code>Skills auto-trigger when relevant</code>
              </div>
            </div>
          </div>`
          })}
```

- [ ] **Step 5: Run to verify pass**

Run: `npm test`
Expected: PASS. Then `open docs/index.html` and confirm both hero and Get Started default to the npx tab and toggle correctly.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-site.js tests/ docs/
git commit -m "feat: default homepage hero and Get Started to npx"
```

---

## Task 4: Plugin cards + related cards tabs

**Files:**
- Modify: `scripts/generate-site.js` (`generatePluginCard` ~line 509-523; related-plugins card ~line 602-616)
- Modify: `tests/generate-site-npx-install.test.js` (add card assertions)

- [ ] **Step 1: Add failing card assertion**

In `tests/generate-site-npx-install.test.js`, after the homepage block, add:

```js
// Homepage cards: skill-plugin card shows npx; MCP card does not
assert.match(index, /npx skills add 2389-research\/simmer/, 'simmer card should show npx command');
const journalCardChunk = index.slice(index.indexOf('>journal<') - 4000, index.indexOf('>journal<') + 1200);
assert.doesNotMatch(journalCardChunk, /npx skills add/, 'journal (MCP) card should not show npx');
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL — "simmer card should show npx command" (cards still single command).

- [ ] **Step 3: Convert `generatePluginCard` footer**

In `generatePluginCard`, replace the footer (~lines 519-522):

```js
              <div class="plugin-footer">
                <code class="plugin-install" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}">/plugin install 2389-research/${plugin.name}</code>
                <a href="plugins/${plugin.name}/" class="plugin-source" data-tinylytics-event="plugin.view-details" data-tinylytics-event-value="${plugin.name}">Details →</a>
              </div>
```

with:

```js
              <div class="plugin-footer${pluginHasSkills(plugin) ? ' plugin-footer-tabs' : ''}">
                ${pluginHasSkills(plugin)
                  ? renderInstallTabs({
                      group: `card-${plugin.name}`,
                      npxHtml: `<code class="plugin-install" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}-npx">${getNpxInstallCommand(plugin)}</code>`,
                      ccHtml: `<code class="plugin-install" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}">${getPluginInstallCommand(plugin)}</code>`
                    })
                  : `<code class="plugin-install" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}">${getPluginInstallCommand(plugin)}</code>`}
                <a href="plugins/${plugin.name}/" class="plugin-source" data-tinylytics-event="plugin.view-details" data-tinylytics-event-value="${plugin.name}">Details →</a>
              </div>
```

- [ ] **Step 4: Convert the related-plugins card footer**

In `generateRelatedPlugins`, the related card footer (~lines 611-614) uses `../${p.name}/` links. Replace:

```js
          <div class="plugin-footer">
            <code class="plugin-install" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${p.name}">/plugin install 2389-research/${p.name}</code>
            <a href="../${p.name}/" class="plugin-source" data-tinylytics-event="related.view-plugin" data-tinylytics-event-value="${p.name}">Details →</a>
          </div>
```

with:

```js
          <div class="plugin-footer${pluginHasSkills(p) ? ' plugin-footer-tabs' : ''}">
            ${pluginHasSkills(p)
              ? renderInstallTabs({
                  group: `related-${p.name}`,
                  npxHtml: `<code class="plugin-install" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${p.name}-npx">${getNpxInstallCommand(p)}</code>`,
                  ccHtml: `<code class="plugin-install" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${p.name}">${getPluginInstallCommand(p)}</code>`
                })
              : `<code class="plugin-install" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${p.name}">${getPluginInstallCommand(p)}</code>`}
            <a href="../${p.name}/" class="plugin-source" data-tinylytics-event="related.view-plugin" data-tinylytics-event-value="${p.name}">Details →</a>
          </div>
```

- [ ] **Step 5: Run to verify pass + visual check**

Run: `npm test`
Expected: PASS. Then `open docs/index.html`: every card shows the npx/Claude-Code toggle (npx default) except the 4 MCP cards (journal, socialmedia, slack-mcp, agent-drugs), which show only `/plugin install`.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-site.js tests/ docs/
git commit -m "feat: add install tabs to plugin cards (npx default)"
```

---

## Task 5: Plugin-page quick-install steps tabs

**Files:**
- Modify: `scripts/generate-site.js` (`generateQuickInstallSteps` ~line 534-557)
- Modify: `tests/generate-site-npx-install.test.js` (add quick-install assertion)

- [ ] **Step 1: Add failing assertion**

In `tests/generate-site-npx-install.test.js`, after the simmer page checks, add:

```js
assert.match(simmer, /class="install-tab active"[^>]*data-tab="npx-qi-simmer"/, 'quick-install should default to npx');
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL — "quick-install should default to npx".

- [ ] **Step 3: Rewrite `generateQuickInstallSteps` to tabs**

Replace the whole `generateQuickInstallSteps` function (~lines 534-557) with:

```js
function generateQuickInstallSteps(plugin) {
  const ccSteps = `<div class="quick-start-steps">
          <div class="step">
            <span class="step-number">1</span>
            <div class="step-content">
              <span class="step-label">Add the marketplace</span>
              <code data-tinylytics-event="install.copy-command" data-tinylytics-event-value="${plugin.name}-marketplace">${INTERNAL_MARKETPLACE_COMMAND}</code>
            </div>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <div class="step-content">
              <span class="step-label">Install this plugin</span>
              <code data-tinylytics-event="install.copy-command" data-tinylytics-event-value="${plugin.name}-install">${getPluginInstallCommand(plugin)}</code>
            </div>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <div class="step-content">
              <span class="step-label">You're good to go</span>
              <code>Skills auto-trigger when relevant</code>
            </div>
          </div>`;

  if (!pluginHasSkills(plugin)) return ccSteps;

  const npxSteps = `<div class="quick-start-steps">
          <div class="step">
            <span class="step-number">1</span>
            <div class="step-content">
              <span class="step-label">Run it — works in any agent</span>
              <code data-tinylytics-event="install.copy-command" data-tinylytics-event-value="${plugin.name}-npx">${getNpxInstallCommand(plugin)}</code>
            </div>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <div class="step-content">
              <span class="step-label">Pick your agents when prompted</span>
              <code>Claude Code, Cursor, Codex…</code>
            </div>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <div class="step-content">
              <span class="step-label">You're good to go</span>
              <code>Skills auto-trigger when relevant</code>
            </div>
          </div>`;

  return renderInstallTabs({ group: `qi-${plugin.name}`, npxHtml: npxSteps, ccHtml: ccSteps });
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test`
Expected: PASS. `open docs/plugins/simmer/index.html` → Quick Install defaults to the npx step; `open docs/plugins/journal/index.html` → Quick Install shows only the 3-step `/plugin` flow (no tabs).

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-site.js tests/ docs/
git commit -m "feat: default plugin-page quick install to npx"
```

---

## Task 6: Markdown mirrors (llms.txt, AGENTS.md, index.md, per-plugin)

**Files:**
- Modify: `scripts/generate-site.js` (llms.txt ~line 1152-1155; AGENTS.md ~line 1188-1192; `homepageMarkdown` ~line 1219-1224; `pluginMarkdown` ~line 1250-1255)
- Modify: `tests/generate-site-npx-install.test.js` (add markdown assertions)

- [ ] **Step 1: Add failing markdown assertions**

In `tests/generate-site-npx-install.test.js`, before the final `console.log`, add:

```js
// Markdown mirrors include npx (npx first)
assert.match(read('docs/llms.txt'), /npx skills add/, 'llms.txt should mention npx');
assert.match(read('docs/AGENTS.md'), /npx skills add/, 'AGENTS.md should mention npx');
assert.match(read('docs/index.md'), /npx skills add/, 'index.md should mention npx');
assert.match(read('docs/plugins/simmer/index.md'), /npx skills add 2389-research\/simmer/, 'simmer .md should show npx');
assert.doesNotMatch(read('docs/plugins/journal/index.md'), /npx skills add/, 'journal .md must not show npx');
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL — "llms.txt should mention npx".

- [ ] **Step 3: Update the llms.txt install section**

Replace the `## Install the marketplace` block (~lines 1151-1155):

```js
## Install the marketplace

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
\`\`\`
```

with:

```js
## Install a plugin

Default — works in any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

\`\`\`
npx skills add 2389-research/<plugin>
\`\`\`

Or natively in Claude Code:

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
/plugin install 2389-research/<plugin>
\`\`\`
```

- [ ] **Step 4: Update the AGENTS.md install section**

Replace the `## Install a plugin` block (~lines 1187-1192):

```js
## Install a plugin

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
/plugin install 2389-research/<plugin-name>
\`\`\`
```

with:

```js
## Install a plugin

Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

\`\`\`
npx skills add 2389-research/<plugin-name>
\`\`\`

Or natively in Claude Code:

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
/plugin install 2389-research/<plugin-name>
\`\`\`

(MCP servers — journal, socialmedia, slack-mcp, agent-drugs — install via Claude Code only; they ship no skills for npx.)
```

- [ ] **Step 5: Update `homepageMarkdown` install section**

In `homepageMarkdown`, replace the `## Install` block (~lines 1219-1223):

```js
## Install

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
\`\`\`
```

with:

```js
## Install

Default — any agent via [npx skills](https://github.com/vercel-labs/skills):

\`\`\`
npx skills add 2389-research/<plugin>
\`\`\`

Or in Claude Code:

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
\`\`\`
```

- [ ] **Step 6: Update `pluginMarkdown`**

In `pluginMarkdown`, replace the metadata + `## Install via marketplace` section (~lines 1246-1255):

```js
- **Version:** ${plugin.version || '1.0.0'}
- **Source:** ${sourceUrl}
- **Install:** \`${getPluginInstallCommand(plugin)}\`

## Install via marketplace

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
${getPluginInstallCommand(plugin)}
\`\`\`
```

with:

```js
- **Version:** ${plugin.version || '1.0.0'}
- **Source:** ${sourceUrl}

## Install

${pluginHasSkills(plugin) ? `Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

\`\`\`
${getNpxInstallCommand(plugin)}
\`\`\`

Or natively in Claude Code:

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
${getPluginInstallCommand(plugin)}
\`\`\`` : `This is an MCP server — install it in Claude Code:

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
${getPluginInstallCommand(plugin)}
\`\`\``}
```

- [ ] **Step 7: Run to verify pass**

Run: `npm test`
Expected: PASS. Spot-check `docs/plugins/simmer/index.md` (npx first) and `docs/plugins/journal/index.md` (Claude Code only).

- [ ] **Step 8: Commit**

```bash
git add scripts/generate-site.js tests/ docs/
git commit -m "feat: add npx install method to markdown mirrors"
```

---

## Task 7: README Quick Start

**Files:**
- Modify: `README.md` (Quick Start ~lines 12-20)

- [ ] **Step 1: Rewrite the Quick Start section**

Replace lines 12-20:

```markdown
## Quick Start

```bash
# Add the marketplace
/plugin marketplace add 2389-research/claude-plugins

# Install any plugin
/plugin install simmer@2389-research
```
```

with:

```markdown
## Quick Start

Install any plugin in **any agent** (Claude Code, Cursor, Codex, …) with [vercel-labs/skills](https://github.com/vercel-labs/skills):

```bash
npx skills add 2389-research/simmer
```

Or natively in Claude Code:

```bash
# Add the marketplace, then install any plugin
/plugin marketplace add 2389-research/claude-plugins
/plugin install 2389-research/simmer
```

> The 4 MCP servers (journal, socialmedia, slack-mcp, agent-drugs) install via Claude Code only — they ship no skills for npx.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add npx install method to README Quick Start"
```

---

## Task 8: CI test step

**Files:**
- Modify: `.github/workflows/generate-site.yml` (add a step before "Generate site")

- [ ] **Step 1: Add a test step**

In `.github/workflows/generate-site.yml`, between the `Install gh CLI` step and the `Generate site` step, add:

```yaml
      - name: Run tests
        env:
          GH_TOKEN: ${{ github.token }}
        run: npm test
```

(The tests run the generator, which fetches READMEs via `gh api`; `GH_TOKEN` must be present, matching the Generate step.)

- [ ] **Step 2: Verify the workflow is valid YAML**

Run: `node -e "require('fs').readFileSync('.github/workflows/generate-site.yml','utf8')"` and visually confirm indentation matches sibling steps.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/generate-site.yml
git commit -m "ci: run npm test before generating the site"
```

---

## Task 9: Full regenerate + final verification

**Files:** none (verification + generated output)

- [ ] **Step 1: Clean regenerate**

Run: `npm run generate` (site + OG images)
Expected: clean output, no broken-link warnings introduced by this work.

- [ ] **Step 2: Run the full suite**

Run: `npm test`
Expected: both test scripts print their pass lines; exit code 0; output pristine.

- [ ] **Step 3: Confirm MCP exclusion across surfaces**

Run: `grep -rl "npx skills add" docs/plugins/journal docs/plugins/socialmedia docs/plugins/slack-mcp docs/plugins/agent-drugs`
Expected: no matches (empty output).

- [ ] **Step 4: Confirm npx coverage on a skill plugin**

Run: `grep -c "npx skills add 2389-research/simmer" docs/plugins/simmer/index.html docs/plugins/simmer/index.md`
Expected: ≥ 1 in each file.

- [ ] **Step 5: Visual smoke**

`open docs/index.html` and one plugin page; toggle tabs; copy a command. Confirm npx is the default everywhere it appears.

- [ ] **Step 6: Commit any regeneration diff**

```bash
git add docs/
git commit -m "chore: regenerate marketplace site with npx install method"
```

---

## Self-Review

**Spec coverage:**
- npx default everywhere → Tasks 1,3,4,5 (HTML), 6 (markdown), 7 (README). ✓
- MCP servers excluded → `pluginHasSkills` guard in Tasks 1,4,5,6; verified in Task 9 Step 3. ✓
- npx from `getRepoName` → `getNpxInstallCommand` (Task 1). ✓
- Tabs + JS + CSS → Tasks 1 (helper+script), 2 (CSS). ✓
- Markdown surfaces (llms.txt, AGENTS.md, index.md, per-plugin) → Task 6. ✓
- Tests + npm test + CI → Tasks 1, 8. ✓
- Hero pattern form + Get Started default npx → Task 3. ✓

**Placeholder scan:** All code blocks contain literal, ready-to-paste content. The `<plugin>` / `<plugin-name>` strings are intentional user-facing placeholders in marketplace-level docs, not plan gaps.

**Type/name consistency:** `getNpxInstallCommand`, `pluginHasSkills`, `renderInstallTabs({group,npxHtml,ccHtml})`, `generateInteractiveScript()` are defined once in Task 1 and called with the same signatures in Tasks 3-6. Group ids (`hero`, `getstarted`, `<name>`, `qi-<name>`, `card-<name>`, `related-<name>`) are unique and match the test regexes in Tasks 1,3,5.

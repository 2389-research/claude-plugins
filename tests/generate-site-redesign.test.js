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
test('toolbar: search input, live count, category chips with counts', () => {
  assert.match(index, /data-search/);
  assert.match(index, /data-count/);
  assert.match(index, /data-cat="all"[^>]*>All \(27\)/);
  assert.match(index, /data-cat="Development"/);
  assert.match(index, /data-cat="Agent Systems"/);
});
test('script: filter wiring reads skill rows on input', () => {
  assert.match(index, /\[data-skill-row\]/);
  assert.match(index, /addEventListener\('input'/);
});
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
test('script: topo init is reduced-motion aware', () => {
  assert.match(index, /getElementById\('topo-bg'\)/);
  assert.match(index, /prefers-reduced-motion/);
  assert.match(index, /new THREE\.WebGLRenderer/);
});
test('footer: colophon with copyright and links', () => {
  assert.match(index, /class="colophon/);                                    // NEW colophon class — RED on the old .footer markup
  const year = new Date().getFullYear();                                     // track runtime year — generateFooter() renders new Date().getFullYear()
  assert.match(index, new RegExp(`© ${year} 2389 Research Inc — all plugins open source`));  // NEW copy (em-dash —, U+2014) — RED on old "All plugins are open source."
  assert.match(index, /Skills Guide/);
  assert.match(index, /2389\.ai/);
});
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
test('glossary: editorial shell, tuples rendered, JSON-LD kept', () => {
  const g = fs.readFileSync(path.join(ROOT, 'docs/glossary/index.html'), 'utf8');
  assert.match(g, /family=Newsreader:/);
  assert.match(g, /class="wrap/);
  const year = new Date().getFullYear();                                     // generator renders © new Date().getFullYear() — do NOT hardcode 2026
  assert.match(g, new RegExp(`© ${year} 2389 Research Inc`));
  assert.match(g, /application\/ld\+json/);
  assert.doesNotMatch(g, /class="nav"/);
});
test('glossary md mirror: HTML entities decoded, tags stripped (no leak into plain text)', () => {
  const md = fs.readFileSync(path.join(ROOT, 'docs/glossary/index.md'), 'utf8');
  assert.match(md, /marketplace add <repo>/);         // &lt;repo&gt; decoded to a literal <repo>
  assert.match(md, /\/<name>/);                        // &lt;name&gt; decoded to a literal <name>
  assert.doesNotMatch(md, /&lt;|&gt;|&amp;|&quot;/);   // a plain-text mirror carries no HTML entities
  assert.doesNotMatch(md, /<\/?code>/);                // HTML tags stay stripped
});
test('glossary JSON-LD: DefinedTerm descriptions are plain text, not HTML entities', () => {
  const g = fs.readFileSync(path.join(ROOT, 'docs/glossary/index.html'), 'utf8');
  // The visible <p> legitimately shows &lt;repo&gt;; the structured-data description must be decoded.
  assert.match(g, /"description": "[^"]*marketplace add <repo>/);
  assert.doesNotMatch(g, /"description": "[^"]*&lt;repo&gt;/);
});
test('generator: generateNav is fully removed', () => {
  const src = fs.readFileSync(path.join(ROOT, 'scripts/generate-site.js'), 'utf8');
  assert.doesNotMatch(src, /function generateNav/);
  assert.doesNotMatch(src, /generateNav\(/);
});

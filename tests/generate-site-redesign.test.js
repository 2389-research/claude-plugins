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
test('index: each row prints the install command as visible text, not just a copy target', () => {
  // A skill plugin writes out its npx command in a readable <code>, alongside the existing copy button.
  assert.match(index, /<code class="row-cmd mono">npx skills add 2389-research\/simmer<\/code>/);
  // An MCP-only plugin writes out its Claude Code command (it has no npx install).
  assert.match(index, /<code class="row-cmd mono">\/plugin install journal@2389-research<\/code>/);
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
  // The wordmark in the copyright now links to 2389.ai (the em-dash — is U+2014).
  assert.match(index, new RegExp(`© ${year} <a[^>]*href="https://2389\\.ai"[^>]*>2389 Research Inc</a> — all plugins open source`));
  assert.match(index, /Skills Guide/);
  assert.match(index, /2389\.ai/);
});
test('brand: the 2389 Research wordmark links to 2389.ai across pages', () => {
  // masthead wordmark on the index (brand-link blends into the bar, accents on hover)
  assert.match(index, /<a href="https:\/\/2389\.ai"[^>]*class="brand-link"[^>]*>2389 Research<\/a>/);
  // detail-page topbar
  const simmer = fs.readFileSync(path.join(ROOT, 'docs/plugins/simmer/index.html'), 'utf8');
  assert.match(simmer, /<a href="https:\/\/2389\.ai"[^>]*>2389 Research<\/a>/);
  // glossary topbar
  const gloss = fs.readFileSync(path.join(ROOT, 'docs/glossary/index.html'), 'utf8');
  assert.match(gloss, /<a href="https:\/\/2389\.ai"[^>]*>2389 Research<\/a>/);
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
test('detail: Claude Code install sits behind a disclosure for skills, stays primary for MCP-only', () => {
  const simmer = fs.readFileSync(path.join(ROOT, 'docs/plugins/simmer/index.html'), 'utf8');
  // npx is the up-front suggestion; the Claude Code command is tucked inside a click-to-open <details>.
  assert.match(simmer, /npx skills add 2389-research\/simmer/);
  assert.match(simmer, /<details class="install-alt">[\s\S]*?\/plugin install simmer@2389-research[\s\S]*?<\/details>/);
  const journal = fs.readFileSync(path.join(ROOT, 'docs/plugins/journal/index.html'), 'utf8');
  // MCP-only has no npx, so its Claude Code install stays visible, not hidden behind a click.
  assert.doesNotMatch(journal, /class="install-alt"/);
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
  assert.match(g, new RegExp(`© ${year} <a[^>]*href="https://2389\\.ai"[^>]*>2389 Research Inc</a>`));  // wordmark links to 2389.ai
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
test('style: content column sits on a translucent sheet so the listing reads over the topo', () => {
  const css = fs.readFileSync(path.join(ROOT, 'docs/style.css'), 'utf8');
  // .wrap carries a translucent (not fully opaque) white/paper background so text stays readable
  // over the animated topology while the cool background still shows through.
  assert.match(css, /\.wrap\{[^}]*background:rgba\([^)]+\)/);
});
test('generator: generateNav is fully removed', () => {
  const src = fs.readFileSync(path.join(ROOT, 'scripts/generate-site.js'), 'utf8');
  assert.doesNotMatch(src, /function generateNav/);
  assert.doesNotMatch(src, /generateNav\(/);
});

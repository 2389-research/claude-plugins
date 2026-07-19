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

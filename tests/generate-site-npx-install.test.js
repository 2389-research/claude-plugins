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

// Homepage: hero shows the npx pattern, default to npx
const index = read('docs/index.html');
assert.match(index, /npx skills add 2389-research\/&lt;plugin&gt;/, 'hero should show npx pattern command');
assert.match(index, /class="install-tab active"[^>]*data-tab="npx-hero"/, 'hero npx tab should be active by default');
// Get Started block defaults to the npx flow
assert.match(index, /class="install-tab active"[^>]*data-tab="npx-getstarted"/, 'Get Started should default to npx');

console.log('generate-site npx install test passed (Task 1 scope)');

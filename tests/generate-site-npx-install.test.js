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
assert.match(simmer, /class="install-tab active"[^>]*data-tab="npx-qi-simmer"/, 'quick-install should default to npx');

// MCP server page: /plugin only for the hero block
const journal = read('docs/plugins/journal/index.html');
assert.match(journal, /\/plugin install 2389-research\/journal/, 'journal page should show /plugin install');
assert.doesNotMatch(journal, /qi-journal/, 'journal (MCP) quick-install must not be tabbed');

// Homepage: hero shows the npx pattern, default to npx
const index = read('docs/index.html');
assert.match(index, /npx skills add 2389-research\/&lt;plugin&gt;/, 'hero should show npx pattern command');
assert.match(index, /class="install-tab active"[^>]*data-tab="npx-hero"/, 'hero npx tab should be active by default');
// Get Started block defaults to the npx flow
assert.match(index, /class="install-tab active"[^>]*data-tab="npx-getstarted"/, 'Get Started should default to npx');

// Homepage cards: skill-plugin card shows npx; an MCP server's repo never appears in an npx command
assert.match(index, /npx skills add 2389-research\/simmer/, 'simmer card should show npx command');

// No MCP server's own repo may ever appear in an npx command (derived from the strict flag, like the generator)
const marketplace = require('../.claude-plugin/marketplace.json');
const mcpRepos = marketplace.plugins
  .filter((p) => p.strict === true)
  .map((p) => p.source.url.replace(/\/+$/, '').replace(/\.git$/, '').split('/').slice(-2).join('/'));
assert.ok(mcpRepos.length >= 4, `expected >=4 MCP servers, found ${mcpRepos.length}`);
for (const repo of mcpRepos) {
  const escaped = repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.doesNotMatch(index, new RegExp(`npx skills add ${escaped}`), `${repo} (MCP) must never appear in an npx command`);
}

console.log('generate-site npx install test passed');

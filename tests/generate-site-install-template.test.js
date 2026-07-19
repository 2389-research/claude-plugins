// ABOUTME: Tests that the site generator produces correct install blocks for plugin pages
// ABOUTME: Validates /plugin install uses the {name}@2389-research marketplace form (issue #32)

const assert = require('assert');
const fs = require('fs');
const { execFileSync } = require('child_process');

execFileSync('npm', ['run', 'generate:site'], { stdio: 'pipe' });

const stylesheet = fs.readFileSync('docs/style.css', 'utf8');
assert.doesNotMatch(
  stylesheet,
  /\.plugin-hero-actions \.install-block\s*\{[\s\S]*max-width:\s*500px;/,
  'expected plugin hero install block width cap to be increased beyond 500px'
);

function readPage(pluginName) {
  return fs.readFileSync(`docs/plugins/${pluginName}/index.html`, 'utf8');
}

// The marketplace registers under the `name` field of marketplace.json, and Claude Code
// resolves `/plugin install` as `<plugin>@<marketplace-name>`. The npx command keeps the
// GitHub owner/repo form (2389-research/<plugin>) since that is what vercel-labs/skills expects.
const MARKETPLACE_NAME = require('../.claude-plugin/marketplace.json').name;
assert.strictEqual(MARKETPLACE_NAME, '2389-research', 'marketplace name should be 2389-research (issue #32)');

// Skill plugins show both install blocks: npx present, /plugin install present (no tabs)
const cssPage = readPage('css-development');
assert.match(cssPage, /npx skills add 2389-research\/css-development/, 'expected npx command on skill plugin page');
assert.match(cssPage, /\/plugin install css-development@2389-research/, 'expected /plugin install at-form on skill plugin page');

const socialmediaPage = readPage('socialmedia');
assert.match(socialmediaPage, /\/plugin install socialmedia@2389-research/, 'MCP plugin page shows the /plugin install at-form');
assert.doesNotMatch(socialmediaPage, /npx skills add 2389-research\/socialmedia/, 'MCP plugin page must not show npx');

const simmerPage = readPage('simmer');
assert.match(simmerPage, /npx skills add 2389-research\/simmer/, 'expected npx command on simmer page');
assert.match(simmerPage, /\/plugin install simmer@2389-research/, 'expected /plugin install at-form on simmer page');

console.log('generate-site install template test passed');

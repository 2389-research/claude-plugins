// ABOUTME: Tests the marketplace-entry helpers shared by the site generator and the install check
// ABOUTME: Covers the owner/repo behind an entry's npx command and which entries get an npx install

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getRepoName, pluginHasSkills } = require('../scripts/lib/plugin-source');

test('getRepoName reads owner/repo from a GitHub url, with or without .git', () => {
  assert.equal(getRepoName({ name: 'sift', source: { source: 'url', url: 'https://github.com/2389-research/sift.git' } }), '2389-research/sift');
  assert.equal(getRepoName({ name: 'simmer', source: { source: 'url', url: 'https://github.com/2389-research/simmer' } }), '2389-research/simmer');
  assert.equal(getRepoName({ name: 'travel-agent', source: { source: 'url', url: 'https://github.com/harperreed/travel-agent.git' } }), 'harperreed/travel-agent');
});

test('getRepoName falls back to the 2389-research org for older entry shapes', () => {
  assert.equal(getRepoName({ name: 'jam', source: './jam' }), '2389-research/jam');
  assert.equal(getRepoName({ name: 'jam' }), '2389-research/jam');
});

test('pluginHasSkills is false only for MCP-only entries (strict: true)', () => {
  assert.equal(pluginHasSkills({ name: 'journal', strict: true }), false);
  assert.equal(pluginHasSkills({ name: 'simmer', strict: false }), true);
  assert.equal(pluginHasSkills({ name: 'simmer' }), true);
});

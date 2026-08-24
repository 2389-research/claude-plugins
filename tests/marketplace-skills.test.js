// ABOUTME: Verifies newly curated skills are present in the marketplace registry.
// ABOUTME: Locks their source, version, category, and install compatibility metadata.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const marketplace = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '.claude-plugin', 'marketplace.json'), 'utf8')
);

const expectedSkills = [
  {
    name: 'sift',
    category: 'testing',
    source: 'https://github.com/2389-research/sift.git',
    version: '1.2.0',
  },
  {
    name: 'trace',
    category: 'testing',
    source: 'https://github.com/2389-research/trace.git',
    version: '0.2.0',
  },
  {
    name: 'travel-agent',
    category: 'strategy',
    source: 'https://github.com/harperreed/travel-agent.git',
    version: '1.1.0',
  },
];

for (const expected of expectedSkills) {
  test(`marketplace includes ${expected.name}`, () => {
    const matches = marketplace.plugins.filter(plugin => plugin.name === expected.name);

    assert.strictEqual(matches.length, 1, `${expected.name} should appear exactly once`);
    assert.strictEqual(matches[0].category, expected.category);
    assert.deepStrictEqual(matches[0].source, {
      source: 'url',
      url: expected.source,
    });
    assert.strictEqual(matches[0].version, expected.version);
    assert.strictEqual(matches[0].strict, false);
  });
}

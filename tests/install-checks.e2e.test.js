// ABOUTME: End-to-end test of the install check: real npx listing real skills trees on disk
// ABOUTME: npx downloads the skills CLI on first use, so the weekly install-check workflow runs this, not npm test

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { inspectRepo } = require('../scripts/check-plugin-installs');
const { makeTree, skill, removeTrees } = require('./helpers/skill-tree');

after(removeTrees);

const NPX_TIMEOUT = { timeout: 300000 };

test('inspectRepo passes a tree whose skills npx lists in full and whose links resolve', NPX_TIMEOUT, () => {
  const dir = makeTree({
    'skills/alpha/SKILL.md': skill('alpha', 'See [notes](references/notes.md).'),
    'skills/alpha/references/notes.md': 'notes',
    'skills/beta/SKILL.md': skill('beta'),
  });
  const { skillFiles, problems } = inspectRepo(dir, dir);
  assert.deepEqual(skillFiles, ['skills/alpha/SKILL.md', 'skills/beta/SKILL.md']);
  assert.deepEqual(problems, []);
});

test('inspectRepo fails a tree with an unquoted ": " in a description and a broken link', NPX_TIMEOUT, () => {
  const dir = makeTree({
    'skills/alpha/SKILL.md': skill('alpha'),
    'skills/colon/SKILL.md': '---\nname: colon\ndescription: Runs at the handoff: dispatches agents.\n---\n\nBody.\n',
    'skills/linked/SKILL.md': skill('linked', 'See [gone](../references/gone.md).'),
  });
  const { problems } = inspectRepo(dir, dir);
  assert.equal(problems.length, 3, problems.join('\n'));
  assert.match(problems[0], /^npx skipped skills\/colon\/SKILL\.md: /);
  assert.equal(problems[1], 'npx lists 2 of 3 SKILL.md files');
  assert.equal(problems[2], 'skills/linked/SKILL.md:6 links ../references/gone.md, which does not exist');
});

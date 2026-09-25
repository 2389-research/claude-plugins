// ABOUTME: Tests the install-check helpers: reading npx's --list output and resolving SKILL.md links
// ABOUTME: The npx fixtures are real captures; the link cases run on a real temporary skills tree

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  parseNpxList, findSkillFiles, checkSkillLinks, findInstallCollisions, installProblems,
} = require('../scripts/lib/install-checks');
const { makeTree, skill, removeTrees } = require('./helpers/skill-tree');

after(removeTrees);

const fixture = (name) => fs.readFileSync(path.join(__dirname, 'fixtures', 'npx-list', name), 'utf8');

test('parseNpxList reads the listed names and skipped files of a run that skipped two', () => {
  const { listed, skipped } = parseNpxList(fixture('css-development-two-skipped.txt'));
  assert.deepEqual(listed, ['css-development:create-component', 'css-development:validate']);
  assert.deepEqual(skipped.map((s) => s.file), [
    '/tmp/skills-Kb4yG7/skills/css-development/SKILL.md',
    '/tmp/skills-Kb4yG7/skills/refactor/SKILL.md',
  ]);
  assert.match(skipped[0].reason, /^YAML parse error: Nested mappings are not allowed in compact mappings/);
});

test('parseNpxList reads a run that listed every skill', () => {
  const { listed, skipped } = parseNpxList(fixture('firebase-development-all-listed.txt'));
  assert.equal(listed.length, 5);
  assert.deepEqual(skipped, []);
});

test('parseNpxList strips terminal escape codes before reading lines', () => {
  const { listed } = parseNpxList('\x1b[?25h\x1b[?25l│    simmer\n│\n│      Iterative artifact refinement\n');
  assert.deepEqual(listed, ['simmer']);
});

test('findSkillFiles lists SKILL.md files anywhere except .git and node_modules', () => {
  const dir = makeTree({
    'SKILL.md': skill('root'),
    'skills/a/SKILL.md': skill('a'),
    'skills/b/deep/SKILL.md': skill('b'),
    'node_modules/x/SKILL.md': skill('x'),
    '.git/y/SKILL.md': skill('y'),
  });
  assert.deepEqual(findSkillFiles(dir), ['SKILL.md', 'skills/a/SKILL.md', 'skills/b/deep/SKILL.md']);
});

test('checkSkillLinks reports links missing from the repo or from an npx install', () => {
  const dir = makeTree({
    'references/shared.md': 'shared',
    'skills/gathered/references/notes.md': 'notes',
    'skills/gathered/SKILL.md': skill('gathered', [
      'See [notes](references/notes.md#usage) and [shared](../../references/shared.md).',
      'Broken: [gone](../references/gone.md).',
      'Ignored: [site](https://example.com/x.md), [top](#top), [mail](mailto:a@example.com).',
    ].join('\n')),
  });
  assert.deepEqual(checkSkillLinks(dir, findSkillFiles(dir)), [
    { file: 'skills/gathered/SKILL.md', line: 6, target: '../../references/shared.md', problem: 'missing-after-npx' },
    { file: 'skills/gathered/SKILL.md', line: 7, target: '../references/gone.md', problem: 'missing-in-repo' },
  ]);
});

test('checkSkillLinks checks reference-style link definitions, not text that only looks like one', () => {
  const dir = makeTree({
    'skills/a/references/ok.md': 'ok',
    'skills/a/SKILL.md': skill('a', [
      'See [the notes][ok] and [the gone file][gone].',
      '',
      '[ok]: references/ok.md',
      '[gone]: <../shared/gone.md> "A title"',
      '[Step 1]: run the tests first',
    ].join('\n')),
  });
  assert.deepEqual(checkSkillLinks(dir, findSkillFiles(dir)), [
    { file: 'skills/a/SKILL.md', line: 9, target: '../shared/gone.md', problem: 'missing-in-repo' },
  ]);
});

test('checkSkillLinks reads a SKILL.md saved with CRLF line endings', () => {
  const dir = makeTree({
    'skills/a/SKILL.md': skill('a', ['See [gone][g].', '', '[g]: ../shared/gone.md'].join('\n')).replace(/\n/g, '\r\n'),
  });
  assert.deepEqual(checkSkillLinks(dir, findSkillFiles(dir)), [
    { file: 'skills/a/SKILL.md', line: 8, target: '../shared/gone.md', problem: 'missing-in-repo' },
  ]);
});

test('checkSkillLinks knows npx leaves metadata.json and cache folders out of an install', () => {
  const dir = makeTree({
    'skills/a/metadata.json': '{}',
    'skills/a/__pycache__/helper.pyc': '',
    'skills/a/scripts/helper.py': '',
    'skills/a/SKILL.md': skill('a', 'Read [meta](metadata.json), [cache](__pycache__/helper.pyc) and [script](scripts/helper.py).'),
  });
  assert.deepEqual(checkSkillLinks(dir, findSkillFiles(dir)), [
    { file: 'skills/a/SKILL.md', line: 6, target: 'metadata.json', problem: 'missing-after-npx' },
    { file: 'skills/a/SKILL.md', line: 6, target: '__pycache__/helper.pyc', problem: 'missing-after-npx' },
  ]);
});

// npx installs every skill as a sibling folder named after its frontmatter name, so a link into a
// sibling skill survives only when that name, as npx sanitizes it, is the sibling's folder name.
test('checkSkillLinks accepts a link into a sibling skill that npx installs at the same path', () => {
  const dir = makeTree({
    'skills/prepare/SKILL.md': skill('prepare', 'Use the table in [review](../review/SKILL.md).'),
    'skills/review/SKILL.md': skill('review'),
  });
  assert.deepEqual(checkSkillLinks(dir, findSkillFiles(dir)), []);
});

test('checkSkillLinks rejects a link into a sibling skill that npx installs under another name', () => {
  const dir = makeTree({
    'skills/prepare/SKILL.md': skill('prepare', 'Use the table in [review](../review/SKILL.md).'),
    'skills/review/SKILL.md': skill('git-repo-prep:review'),
  });
  assert.deepEqual(checkSkillLinks(dir, findSkillFiles(dir)), [
    { file: 'skills/prepare/SKILL.md', line: 6, target: '../review/SKILL.md', problem: 'missing-after-npx' },
  ]);
});

test('findInstallCollisions names skills that npx would install into one folder', () => {
  const dir = makeTree({
    'skills/a/SKILL.md': skill('foo:bar'),
    'skills/b/SKILL.md': skill('foo-bar'),
    'skills/c/SKILL.md': skill('other'),
  });
  assert.deepEqual(findInstallCollisions(dir, findSkillFiles(dir)), [
    { name: 'foo-bar', files: ['skills/a/SKILL.md', 'skills/b/SKILL.md'] },
  ]);
});

test('installProblems reports skills that npx installs into one folder', () => {
  const problems = installProblems({
    skillFiles: ['skills/a/SKILL.md', 'skills/b/SKILL.md'],
    npx: { listed: ['foo:bar', 'foo-bar'], skipped: [] },
    npxStatus: 0,
    links: [],
    collisions: [{ name: 'foo-bar', files: ['skills/a/SKILL.md', 'skills/b/SKILL.md'] }],
  });
  assert.deepEqual(problems, [
    'npx installs skills/a/SKILL.md and skills/b/SKILL.md into one folder, foo-bar/, so only one survives',
  ]);
});

test('installProblems is empty when npx lists every SKILL.md and all links resolve', () => {
  const problems = installProblems({
    skillFiles: ['skills/a/SKILL.md'], npx: { listed: ['a'], skipped: [] }, npxStatus: 0, links: [],
  });
  assert.deepEqual(problems, []);
});

test('installProblems names each skipped file by its path in the repo', () => {
  const reason = 'YAML parse error: Nested mappings are not allowed in compact mappings at line 2, column 14:';
  const problems = installProblems({
    skillFiles: ['skills/cookoff/SKILL.md', 'skills/judge/SKILL.md'],
    npx: { listed: ['judge'], skipped: [{ file: '/tmp/skills-fWHiQV/skills/cookoff/SKILL.md', reason }] },
    npxStatus: 0,
    links: [],
  });
  assert.deepEqual(problems, [
    `npx skipped skills/cookoff/SKILL.md: ${reason}`,
    'npx lists 1 of 2 SKILL.md files',
  ]);
});

test('installProblems maps a skipped file to its own path, not to a root SKILL.md', () => {
  const problems = installProblems({
    skillFiles: ['SKILL.md', 'skills/a/SKILL.md'],
    npx: { listed: ['root'], skipped: [{ file: '/tmp/skills-x1/skills/a/SKILL.md', reason: 'YAML parse error' }] },
    npxStatus: 0,
    links: [],
  });
  assert.equal(problems[0], 'npx skipped skills/a/SKILL.md: YAML parse error');
});

test('installProblems reports a failed or unfinished npx run and an entry with no skills', () => {
  assert.deepEqual(installProblems({ skillFiles: [], npx: { listed: [], skipped: [] }, npxStatus: 1, links: [] }), [
    'npx exited with status 1',
    'no SKILL.md files, though the site offers an npx install',
  ]);
  assert.deepEqual(installProblems({ skillFiles: ['SKILL.md'], npx: { listed: [], skipped: [] }, npxStatus: null, links: [] }), [
    'npx did not run to completion',
    'npx lists 0 of 1 SKILL.md files',
  ]);
});

test('installProblems explains each bad link', () => {
  const problems = installProblems({
    skillFiles: ['skills/gathered/SKILL.md'],
    npx: { listed: ['gathered'], skipped: [] },
    npxStatus: 0,
    links: [
      { file: 'skills/gathered/SKILL.md', line: 117, target: '../references/gone.md', problem: 'missing-in-repo' },
      { file: 'skills/gathered/SKILL.md', line: 9, target: '../shared/x.md', problem: 'missing-after-npx' },
    ],
  });
  assert.deepEqual(problems, [
    'skills/gathered/SKILL.md:117 links ../references/gone.md, which does not exist',
    'skills/gathered/SKILL.md:9 links ../shared/x.md, which an npx install does not put there',
  ]);
});

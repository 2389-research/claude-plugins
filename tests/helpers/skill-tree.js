// ABOUTME: Test helper that writes throwaway skills trees to temp folders and removes them afterwards
// ABOUTME: Shared by the install-check unit and end-to-end tests

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const made = [];

function makeTree(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-tree-'));
  made.push(dir);
  for (const [rel, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), content);
  }
  return dir;
}

// A SKILL.md with valid frontmatter; the body starts on line 6.
const skill = (name, body = '') => `---\nname: ${name}\ndescription: A skill for tests.\n---\n\n${body}\n`;

function removeTrees() {
  for (const dir of made.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
}

module.exports = { makeTree, skill, removeTrees };

// ABOUTME: Helpers for the install check: read `npx skills add --list` output and resolve SKILL.md links
// ABOUTME: They read files but run no commands; scripts/check-plugin-installs.js runs git and npx

const fs = require('fs');
const path = require('path');

const TERMINAL_ESCAPES = /\x1b\[[0-9;?]*[A-Za-z]/g;

// npx prints each listed skill's name alone on a line, four spaces in from the box rule, and warns
// `⚠ Skipped <file> — <reason>` for each SKILL.md it can't read. It exits 0 either way.
function parseNpxList(output) {
  const text = output.replace(TERMINAL_ESCAPES, '');
  const listed = [...text.matchAll(/^│ {4}(\S+)\s*$/gm)].map((m) => m[1]);
  const skipped = [...text.matchAll(/Skipped (\S+) — (.*)$/gm)].map((m) => ({ file: m[1], reason: m[2].trim() }));
  return { listed, skipped };
}

// Every SKILL.md in a checked-out repo, as sorted repo-relative paths, skipping .git and node_modules.
function findSkillFiles(repoDir) {
  const found = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'SKILL.md') found.push(path.relative(repoDir, full).split(path.sep).join('/'));
    }
  };
  walk(repoDir);
  return found.sort();
}

// A reference-style link definition, `[label]: target "optional title"`, shaped as CommonMark requires:
// text after the target that isn't a quoted title makes the line ordinary text, not a definition.
const LINK_DEFINITION = /^ {0,3}\[[^\]]+\]:[ \t]*<?([^\s<>]+)>?(?:[ \t]+(?:"[^"]*"|'[^']*'|\([^)]*\)))?[ \t]*$/;

// skills CLI 1.7.0's copyDirectory leaves these out of every installed skill folder, at any depth: the
// file name for any entry, the folder names for folders only.
const NPX_SKIPPED_FILES = new Set(['metadata.json']);
const NPX_SKIPPED_DIRS = new Set(['.git', '__pycache__', '__pypackages__']);

function npxCopies(pathInSkill, isDirectory) {
  const parts = pathInSkill.split(path.sep);
  return parts.every((part, i) => !NPX_SKIPPED_FILES.has(part)
    && !((i < parts.length - 1 || isDirectory) && NPX_SKIPPED_DIRS.has(part)));
}

// A stand-in skills directory: only used to compare where paths land after an npx install.
const NPX_SKILLS_DIR = path.join(path.sep, 'npx-skills');

// npx copies each skill's folder to `<skills dir>/<name>/`, every skill a sibling of the others, naming it
// as skills CLI 1.7.0 does: `sanitizeName(skill.name || basename(skill.path))` in its dist/cli.mjs.
function installedName(skillDir) {
  const frontmatter = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const declared = frontmatter && frontmatter[1].match(/^name:\s*(.+?)\s*$/m);
  const name = declared ? declared[1].replace(/^(["'])(.*)\1$/, '$2') : path.basename(skillDir);
  return name.toLowerCase().replace(/[^a-z0-9._]+/g, '-').replace(/^[.-]+|[.-]+$/g, '').substring(0, 255) || 'unnamed-skill';
}

// Relative markdown links in each SKILL.md. A target absent from the repo is `missing-in-repo`. A target
// that isn't at the linked path once npx has installed every skill of the repo is `missing-after-npx`:
// npx copies only skill folders, so files outside them never arrive, and it renames each folder.
function checkSkillLinks(repoDir, skillFiles) {
  const skills = skillFiles.map((file) => {
    const dir = path.dirname(path.join(repoDir, file));
    return { file, dir, installedDir: path.join(NPX_SKILLS_DIR, installedName(dir)) };
  });
  // A file belongs to the innermost skill folder that holds it.
  const ownerOf = (target) => skills
    .filter((s) => target === s.dir || target.startsWith(s.dir + path.sep))
    .sort((a, b) => b.dir.length - a.dir.length)[0];
  const problems = [];
  for (const skill of skills) {
    fs.readFileSync(path.join(repoDir, skill.file), 'utf8').split(/\r?\n/).forEach((text, i) => {
      const hrefs = [...text.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);
      const definition = text.match(LINK_DEFINITION);
      if (definition) hrefs.push(definition[1]);
      for (const href of hrefs) {
        const target = href.split('#')[0];
        if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue; // anchors and URLs
        const resolved = path.resolve(skill.dir, target);
        const exists = fs.existsSync(resolved);
        const owner = ownerOf(resolved);
        const pathInOwner = owner && path.relative(owner.dir, resolved);
        const arrives = exists && owner
          && path.resolve(skill.installedDir, target) === path.join(owner.installedDir, pathInOwner)
          && npxCopies(pathInOwner, fs.statSync(resolved).isDirectory());
        const problem = !exists ? 'missing-in-repo' : !arrives ? 'missing-after-npx' : null;
        if (problem) problems.push({ file: skill.file, line: i + 1, target: href, problem });
      }
    });
  }
  return problems;
}

// Skills that npx would install into the same folder, where each copy overwrites the one before it.
function findInstallCollisions(repoDir, skillFiles) {
  const filesByName = new Map();
  for (const file of skillFiles) {
    const name = installedName(path.dirname(path.join(repoDir, file)));
    filesByName.set(name, [...(filesByName.get(name) || []), file]);
  }
  return [...filesByName].filter(([, files]) => files.length > 1).map(([name, files]) => ({ name, files }));
}

// npx reports skips by the path of its own temporary clone; name the repo file that path ends with.
// The longest match wins, so a root SKILL.md doesn't claim every skipped file.
function repoPathOf(skippedFile, skillFiles) {
  const matches = skillFiles.filter((f) => skippedFile === f || skippedFile.endsWith(`/${f}`));
  return matches.sort((a, b) => b.length - a.length)[0] || skippedFile;
}

// What keeps `npx skills add` from installing a repo's skills intact; an empty list means nothing does.
function installProblems({ skillFiles, npx, npxStatus, links, collisions = [] }) {
  const problems = [];
  if (npxStatus === null) problems.push('npx did not run to completion');
  else if (npxStatus !== 0) problems.push(`npx exited with status ${npxStatus}`);
  if (skillFiles.length === 0) problems.push('no SKILL.md files, though the site offers an npx install');
  for (const { file, reason } of npx.skipped) problems.push(`npx skipped ${repoPathOf(file, skillFiles)}: ${reason}`);
  if (npx.listed.length !== skillFiles.length) {
    problems.push(`npx lists ${npx.listed.length} of ${skillFiles.length} SKILL.md files`);
  }
  for (const { name, files } of collisions) {
    problems.push(`npx installs ${files.join(' and ')} into one folder, ${name}/, so only one survives`);
  }
  for (const { file, line, target, problem } of links) {
    problems.push(problem === 'missing-in-repo'
      ? `${file}:${line} links ${target}, which does not exist`
      : `${file}:${line} links ${target}, which an npx install does not put there`);
  }
  return problems;
}

module.exports = { parseNpxList, findSkillFiles, checkSkillLinks, findInstallCollisions, installProblems };

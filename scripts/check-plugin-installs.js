#!/usr/bin/env node
// ABOUTME: Checks that `npx skills add` installs every skill of each marketplace entry the site offers it for
// ABOUTME: Per entry: runs npx's --list as the site prints it, clones the repo, and compares; exits 1 on any problem

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { getRepoName, pluginHasSkills } = require('./lib/plugin-source');
const { parseNpxList, findSkillFiles, checkSkillLinks, installProblems } = require('./lib/install-checks');

const MARKETPLACE = path.join(__dirname, '..', '.claude-plugin', 'marketplace.json');
const COMMAND_TIMEOUT_MS = 180000;

const USAGE = `usage: node scripts/check-plugin-installs.js [plugin-name ...]

Checks every skill entry in .claude-plugin/marketplace.json, or only the names given. For each,
it runs \`npx skills add <owner/repo> --list\` as the site prints it, clones the repo, and fails
when npx skips or misses a SKILL.md, or when a SKILL.md links a file that is missing from the
repo or that an npx install doesn't put at the linked path (npx copies only skill folders and
renames each after its skill). MCP-only entries (strict: true) get no npx install and are
skipped. Exits 1 if any entry fails, 2 on an unknown name.`;

function run(cmd, args, cwd) {
  return spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    timeout: COMMAND_TIMEOUT_MS,
    maxBuffer: 16 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, DISABLE_TELEMETRY: '1' },
  });
}

// Compares what npx lists from `npxSource` with the SKILL.md files and links in `repoDir`, a checkout of it.
function inspectRepo(repoDir, npxSource) {
  const npxCwd = fs.mkdtempSync(path.join(os.tmpdir(), 'npx-list-'));
  try {
    const listing = run('npx', ['-y', 'skills', 'add', npxSource, '--list'], npxCwd);
    const npx = parseNpxList(`${listing.stdout || ''}\n${listing.stderr || ''}`);
    const skillFiles = findSkillFiles(repoDir);
    const links = checkSkillLinks(repoDir, skillFiles);
    return { skillFiles, problems: installProblems({ skillFiles, npx, npxStatus: listing.status, links }) };
  } finally {
    fs.rmSync(npxCwd, { recursive: true, force: true });
  }
}

function checkPlugin(plugin) {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-install-check-'));
  try {
    const repoDir = path.join(workDir, 'repo');
    const clone = run('git', ['clone', '--depth', '1', '--quiet', plugin.source.url, repoDir], workDir);
    if (clone.status !== 0) {
      const reason = (clone.stderr || '').trim().split('\n').pop() || `status ${clone.status}`;
      return { skillFiles: [], problems: [`git clone ${plugin.source.url} failed: ${reason}`] };
    }
    return inspectRepo(repoDir, getRepoName(plugin));
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

function main(names) {
  if (names.includes('-h') || names.includes('--help')) {
    console.log(USAGE);
    return 0;
  }
  const { plugins } = JSON.parse(fs.readFileSync(MARKETPLACE, 'utf8'));
  const unknown = names.filter((name) => !plugins.some((p) => p.name === name));
  if (unknown.length) {
    console.error(`No marketplace entry named ${unknown.join(', ')}\n\n${USAGE}`);
    return 2;
  }
  let checked = 0;
  let failed = 0;
  for (const plugin of names.length ? plugins.filter((p) => names.includes(p.name)) : plugins) {
    if (!pluginHasSkills(plugin)) {
      console.log(`SKIP ${plugin.name}: MCP server; the site offers no npx install`);
      continue;
    }
    checked++;
    const { skillFiles, problems } = checkPlugin(plugin);
    if (problems.length === 0) {
      console.log(`PASS ${plugin.name}: npx lists all ${skillFiles.length} SKILL.md files`);
      continue;
    }
    failed++;
    console.log(`FAIL ${plugin.name}`);
    for (const problem of problems) console.log(`  - ${problem}`);
  }
  console.log(`\n${checked} checked, ${failed} failed`);
  return failed ? 1 : 0;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { inspectRepo };

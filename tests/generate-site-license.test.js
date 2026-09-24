// ABOUTME: Tests that each plugin page's structured data claims only the licence its repo has
// ABOUTME: Checks the generated JSON-LD against the licence GitHub reports for each repo, live

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

execFileSync('npm', ['run', 'generate:site'], { stdio: 'pipe' });

const marketplace = require('../.claude-plugin/marketplace.json');

// Ask GitHub for every repo's licence in one GraphQL request. GitHub reads it from the
// repo's LICENSE file: spdxId is null when there is none, NOASSERTION when it can't name it.
const selections = marketplace.plugins.map((plugin, i) => {
  const [, owner, name] = plugin.source.url.replace(/\.git$/, '').match(/github\.com\/([^/]+)\/([^/]+)/);
  return `a${i}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { licenseInfo { spdxId } }`;
}).join('\n');
const repos = JSON.parse(execFileSync('gh', ['api', 'graphql', '-f', `query=query {\n${selections}\n}`], {
  encoding: 'utf8',
})).data;

for (const [i, plugin] of marketplace.plugins.entries()) {
  const spdx = repos[`a${i}`].licenseInfo?.spdxId ?? null;
  const html = fs.readFileSync(path.join('docs', 'plugins', plugin.name, 'index.html'), 'utf8');
  const app = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => JSON.parse(m[1]))
    .find((ld) => ld['@type'] === 'SoftwareApplication');
  assert.ok(app, `${plugin.name} page should carry SoftwareApplication structured data`);

  if (spdx === 'MIT') {
    assert.strictEqual(app.license, 'https://opensource.org/licenses/MIT', `${plugin.name}: the repo is MIT, so the page should say so`);
  } else {
    assert.strictEqual(app.license, undefined, `${plugin.name}: the repo reports ${spdx ?? 'no licence'}, so the page must not claim one`);
  }
}

console.log('generate-site license test passed');

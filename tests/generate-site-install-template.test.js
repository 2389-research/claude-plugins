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

function getInstallBlock(html) {
  const match = html.match(/<div class="install-block">[\s\S]*?<\/div>/);
  assert(match, 'expected install block in generated plugin page');
  return match[0];
}

const internalInstallBlock = getInstallBlock(readPage('css-development'));
assert.match(
  internalInstallBlock,
  /\/plugin marketplace add 2389-research\/claude-plugins/,
  'expected internal plugin hero install block to include marketplace add'
);
assert.match(
  internalInstallBlock,
  /\/plugin install css-development@2389-research/,
  'expected internal plugin hero install block to include scoped plugin install'
);

const externalInstallBlock = getInstallBlock(readPage('socialmedia'));
assert.doesNotMatch(
  externalInstallBlock,
  /\/plugin marketplace add 2389-research\/claude-plugins/,
  'expected external plugin hero install block to omit marketplace add'
);
assert.match(
  externalInstallBlock,
  /\/plugin install socialmedia/,
  'expected external plugin hero install block to preserve direct install'
);

const externalPage = readPage('socialmedia');
assert.doesNotMatch(
  externalPage,
  /\/plugin marketplace add 2389-research\/claude-plugins/,
  'expected external plugin page to omit marketplace add instructions'
);

console.log('generate-site install template test passed');

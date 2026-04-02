// ABOUTME: Tests that the site generator produces correct install blocks for plugin pages
// ABOUTME: Validates install command format uses 2389-research/{name} pattern

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

// All plugins now use the same direct install format: /plugin install 2389-research/{name}
const cssInstallBlock = getInstallBlock(readPage('css-development'));
assert.match(
  cssInstallBlock,
  /\/plugin install 2389-research\/css-development/,
  'expected plugin install block to use 2389-research/{name} format'
);

const socialmediaInstallBlock = getInstallBlock(readPage('socialmedia'));
assert.match(
  socialmediaInstallBlock,
  /\/plugin install 2389-research\/socialmedia/,
  'expected external plugin install block to use 2389-research/{name} format'
);

const simmerInstallBlock = getInstallBlock(readPage('simmer'));
assert.match(
  simmerInstallBlock,
  /\/plugin install 2389-research\/simmer/,
  'expected simmer install block to use 2389-research/{name} format'
);

console.log('generate-site install template test passed');

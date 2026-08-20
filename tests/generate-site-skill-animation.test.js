// ABOUTME: Tests each plugin detail page embeds its motion diagram above the install block
// ABOUTME: Covers the MP4/poster markup, ordering, reduced-motion fallback, and scene coverage

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

execFileSync('npm', ['run', 'generate:site'], { stdio: 'pipe' });

const read = (p) => fs.readFileSync(p, 'utf8');
const marketplace = require('../.claude-plugin/marketplace.json');

// Every marketplace entry has an authored scene — a plugin added without one would
// otherwise ship a page with no diagram and nothing would say so.
const sceneDir = path.join(__dirname, '..', 'scripts', 'animations', 'scenes');
const scenes = new Set(fs.readdirSync(sceneDir).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)));
for (const plugin of marketplace.plugins) {
  assert.ok(scenes.has(plugin.name), `${plugin.name} has no scene at scripts/animations/scenes/${plugin.name}.svg`);
}

// Rendered assets are committed per plugin, and the page embeds the MP4, not the SVG
for (const plugin of marketplace.plugins) {
  const dir = path.join('docs', 'plugins', plugin.name);
  assert.ok(fs.existsSync(path.join(dir, 'anim.mp4')), `${plugin.name} is missing anim.mp4`);
  assert.ok(fs.existsSync(path.join(dir, 'anim-poster.png')), `${plugin.name} is missing anim-poster.png`);

  const html = read(path.join(dir, 'index.html'));
  assert.match(html, /<figure class="skill-anim">/, `${plugin.name} page should contain the animation figure`);
  assert.match(html, /<source src="anim\.mp4" type="video\/mp4">/, `${plugin.name} page should embed the mp4`);
  assert.match(html, /poster="anim-poster\.png"/, `${plugin.name} page should set the poster frame`);
  assert.doesNotMatch(html, /src="anim\.svg"/, `${plugin.name} page must not embed the SVG master`);

  // Placement: the diagram comes after the lede and before the install block
  const figureAt = html.indexOf('<figure class="skill-anim">');
  const ledeAt = html.indexOf('class="detail-lede"');
  const installAt = html.indexOf('<section class="detail-install">');
  assert.ok(ledeAt > -1 && figureAt > ledeAt, `${plugin.name}: diagram should follow the lede`);
  assert.ok(installAt > figureAt, `${plugin.name}: diagram should sit before the install block`);

  // A reader who opted out of motion still gets the settled frame as a still
  assert.match(html, /<img class="skill-anim-still"/, `${plugin.name} page should offer a static fallback`);
}

// The fallback is wired up in CSS and the hidden video is actually paused, not just hidden
const css = read('docs/style.css');
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/, 'style.css should carry a reduced-motion rule');
assert.match(css, /\.skill-anim \.skill-anim-still\{display:none;\}/, 'the still is hidden by default');
// Both halves of the swap must be selected at equal weight, or `.skill-anim img` wins
// and the page shows the looping video and the still frame stacked on top of each other.
assert.match(css, /\.skill-anim \.skill-anim-motion\{display:block;\}/, 'the video is shown at matching specificity');
const detail = read('docs/plugins/simmer/index.html');
assert.match(detail, /prefers-reduced-motion: reduce/, 'detail page script should check the motion preference');
assert.match(detail, /anim\.pause\(\)/, 'detail page script should pause the video when motion is reduced');

console.log('skill animation tests passed');

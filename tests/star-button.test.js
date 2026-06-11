// ABOUTME: Unit tests for the per-skill star button (formatStarCount + renderStarButton)
// ABOUTME: Verifies the button links to the skill's OWN repo, not the marketplace repo

const assert = require('assert');
const { formatStarCount, renderStarButton } = require('../scripts/lib/star-button');

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
}

// --- formatStarCount: GitHub-style abbreviations ---
check('zero stays "0"', () => assert.strictEqual(formatStarCount(0), '0'));
check('small ints are exact', () => assert.strictEqual(formatStarCount(42), '42'));
check('999 stays exact', () => assert.strictEqual(formatStarCount(999), '999'));
check('1000 -> 1k', () => assert.strictEqual(formatStarCount(1000), '1k'));
check('1200 -> 1.2k', () => assert.strictEqual(formatStarCount(1200), '1.2k'));
check('1234 truncates to 1.2k', () => assert.strictEqual(formatStarCount(1234), '1.2k'));
check('10000 -> 10k (no decimal)', () => assert.strictEqual(formatStarCount(10000), '10k'));
check('12345 -> 12k', () => assert.strictEqual(formatStarCount(12345), '12k'));
check('1.5M', () => assert.strictEqual(formatStarCount(1500000), '1.5M'));
check('null count -> null', () => assert.strictEqual(formatStarCount(null), null));
check('undefined count -> null', () => assert.strictEqual(formatStarCount(undefined), null));

// --- renderStarButton: card variant with a count ---
const card = renderStarButton({
  repoUrl: 'https://github.com/2389-research/css-development',
  pluginName: 'css-development',
  count: 42,
  variant: 'card',
});
check('card links to the skill repo', () =>
  assert.match(card, /href="https:\/\/github\.com\/2389-research\/css-development"/));
check('card never points at the marketplace repo', () =>
  assert.doesNotMatch(card, /claude-plugins/));
check('card opens in a new tab', () => assert.match(card, /target="_blank"/));
check('card is rel-safe', () => assert.match(card, /rel="noopener noreferrer"/));
check('card uses the card class', () => assert.match(card, /class="plugin-star"/));
check('card shows the formatted count', () =>
  assert.match(card, /<span class="star-count">42<\/span>/));
check('card has an accessible title', () =>
  assert.match(card, /title="Star css-development on GitHub"/));
check('card carries the tinylytics event', () =>
  assert.match(card, /data-tinylytics-event="plugin\.star"/));
check('card tags the event with the plugin name', () =>
  assert.match(card, /data-tinylytics-event-value="css-development"/));
check('card renders the star icon', () => assert.match(card, /<svg/));

// --- renderStarButton: hero variant abbreviates large counts ---
const hero = renderStarButton({
  repoUrl: 'https://github.com/2389-research/simmer',
  pluginName: 'simmer',
  count: 1200,
  variant: 'hero',
});
check('hero uses the hero class', () => assert.match(hero, /class="star-button"/));
check('hero shows the abbreviated count', () =>
  assert.match(hero, /<span class="star-count">1\.2k<\/span>/));
check('hero links to the skill repo', () =>
  assert.match(hero, /href="https:\/\/github\.com\/2389-research\/simmer"/));

// --- renderStarButton: null count degrades to an icon-only button ---
const noCount = renderStarButton({
  repoUrl: 'https://github.com/2389-research/xtool',
  pluginName: 'xtool',
  count: null,
  variant: 'card',
});
check('icon-only still links to the skill repo', () =>
  assert.match(noCount, /href="https:\/\/github\.com\/2389-research\/xtool"/));
check('icon-only omits the count span', () =>
  assert.doesNotMatch(noCount, /star-count/));
check('icon-only still renders the star icon', () => assert.match(noCount, /<svg/));

console.log(`star-button test passed (${passed} cases)`);

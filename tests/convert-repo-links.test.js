// ABOUTME: Unit tests for convertRepoLinks — absolutizes relative README links (issue #43)
// ABOUTME: Covers non-allowlisted dirs, <code> link text, cross-plugin, and untouched absolute/anchor links

const assert = require('assert');
const { convertRepoLinks } = require('../scripts/lib/convert-repo-links');

const REPO = '2389-research/thrifty';
// Fresh deps per call so linkReport bookkeeping never bleeds between cases.
const deps = () => ({
  marketplacePlugins: [{ name: 'thrifty' }, { name: 'simmer' }],
  linkReport: { converted: [], broken: [] },
});

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
}

// 1. Core bug: a link into a non-allowlisted dir must be absolutized to a blob URL.
check('non-allowlisted dir (eval/) is absolutized', () => {
  const html = '<a href="eval/RESULTS.md" rel="noopener noreferrer">results</a>';
  const out = convertRepoLinks(html, 'thrifty', REPO, deps());
  assert.match(
    out,
    /href="https:\/\/github\.com\/2389-research\/thrifty\/blob\/main\/eval\/RESULTS\.md"/,
    'eval/RESULTS.md should become a github.com blob URL'
  );
});

// 2. Root cause #2: backtick link renders <code> inside the anchor text.
check('code-formatted link text is absolutized and preserved', () => {
  const html = '<a href="eval/RESULTS.md" rel="noopener noreferrer"><code>eval/RESULTS.md</code></a>';
  const out = convertRepoLinks(html, 'thrifty', REPO, deps());
  assert.match(
    out,
    /href="https:\/\/github\.com\/2389-research\/thrifty\/blob\/main\/eval\/RESULTS\.md"/,
    '<code>-wrapped link should still be absolutized'
  );
  assert.match(out, /<code>eval\/RESULTS\.md<\/code>/, 'inner <code> text must be preserved');
});

// 3. ./-relative path into another non-allowlisted dir.
check('./experiments/ link is absolutized', () => {
  const html = '<a href="./experiments/README.md" rel="noopener noreferrer">exp</a>';
  const out = convertRepoLinks(html, 'thrifty', REPO, deps());
  assert.match(
    out,
    /href="https:\/\/github\.com\/2389-research\/thrifty\/blob\/main\/experiments\/README\.md"/,
    './experiments/README.md should be absolutized (and ./ stripped)'
  );
});

// 4. Extensionless path → tree URL (directory heuristic preserved).
check('extensionless path uses a tree URL', () => {
  const html = '<a href="lib" rel="noopener noreferrer">lib</a>';
  const out = convertRepoLinks(html, 'thrifty', REPO, deps());
  assert.match(
    out,
    /href="https:\/\/github\.com\/2389-research\/thrifty\/tree\/main\/lib"/,
    'a path with no extension should resolve to a tree URL'
  );
});

// 5-8. Absolute / protocol-relative / anchor / mailto hrefs are left untouched.
check('https:// link is left untouched', () => {
  const html = '<a href="https://example.com" rel="noopener noreferrer">x</a>';
  assert.strictEqual(convertRepoLinks(html, 'thrifty', REPO, deps()), html);
});
check('mailto: link is left untouched', () => {
  const html = '<a href="mailto:hello@2389.ai">mail</a>';
  assert.strictEqual(convertRepoLinks(html, 'thrifty', REPO, deps()), html);
});
check('#anchor link is left untouched', () => {
  const html = '<a href="#install">jump</a>';
  assert.strictEqual(convertRepoLinks(html, 'thrifty', REPO, deps()), html);
});
check('protocol-relative //host link is left untouched', () => {
  const html = '<a href="//cdn.example.com/x.js">cdn</a>';
  assert.strictEqual(convertRepoLinks(html, 'thrifty', REPO, deps()), html);
});

// 9. Regression: an allowlisted dir still works.
check('skills/ link is still absolutized', () => {
  const html = '<a href="skills/foo/SKILL.md" rel="noopener noreferrer">skill</a>';
  const out = convertRepoLinks(html, 'thrifty', REPO, deps());
  assert.match(
    out,
    /href="https:\/\/github\.com\/2389-research\/thrifty\/blob\/main\/skills\/foo\/SKILL\.md"/,
    'skills/ links must keep working'
  );
});

// 10. Cross-plugin link to a known plugin → sibling marketplace page.
check('cross-plugin link to a known plugin points at the sibling page', () => {
  const html = '<a href="../simmer/" rel="noopener noreferrer">simmer</a>';
  const out = convertRepoLinks(html, 'thrifty', REPO, deps());
  assert.match(out, /href="\.\.\/simmer\/"/, 'known cross-plugin link should stay a relative sibling link');
  assert.doesNotMatch(out, /github\.com/, 'cross-plugin link must not be turned into a github URL');
});

// 11. Cross-plugin link to an unknown plugin → broken-link span.
check('cross-plugin link to an unknown plugin renders a broken-link span', () => {
  const html = '<a href="../nope/" rel="noopener noreferrer">nope</a>';
  const out = convertRepoLinks(html, 'thrifty', REPO, deps());
  assert.match(out, /<span class="broken-link"/, 'unknown cross-plugin target should render a broken-link span');
});

// 12. linkReport bookkeeping records the conversion.
check('linkReport records converted links', () => {
  const linkReport = { converted: [], broken: [] };
  convertRepoLinks('<a href="eval/RESULTS.md">r</a>', 'thrifty', REPO, { marketplacePlugins: [], linkReport });
  assert.strictEqual(linkReport.converted.length, 1, 'a converted link should be recorded in linkReport.converted');
});

// 13. Multiple links on one line are converted independently (non-greedy text match).
check('multiple anchors on one line are each handled', () => {
  const html = '<a href="eval/A.md">a</a> and <a href="https://x.com">b</a>';
  const out = convertRepoLinks(html, 'thrifty', REPO, deps());
  assert.match(out, /blob\/main\/eval\/A\.md/, 'first (relative) link should be absolutized');
  assert.match(out, /href="https:\/\/x\.com"/, 'second (absolute) link should be left untouched');
});

console.log(`convert-repo-links test passed (${passed} cases)`);

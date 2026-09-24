// ABOUTME: Unit tests for markdownToHtml, the renderer behind each plugin page's README section
// ABOUTME: Pins line breaks, wrapped list items, headings, emphasis and block boundaries to GitHub's rendering
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { markdownToHtml } = require('../scripts/lib/markdown-to-html');

// Each expected value has the structure GitHub gives the same input (its markdown API in
// 'markdown' mode), written in this renderer's own formatting, with every heading one level
// lower because each plugin page supplies its own h1.

// Line breaks: READMEs are often wrapped at 80 columns, and that wrapping must not show.
test('a single newline inside a paragraph is a soft break, not <br>', () => {
  assert.equal(markdownToHtml('one\ntwo'), '<p>one\ntwo</p>');
});
test('two trailing spaces make a hard break', () => {
  assert.equal(markdownToHtml('one  \ntwo'), '<p>one<br>\ntwo</p>');
});
test('a trailing backslash makes a hard break and is not shown', () => {
  assert.equal(markdownToHtml('one\\\ntwo'), '<p>one<br>\ntwo</p>');
});
test('a long run of spaces inside a paragraph renders in linear time', () => {
  const start = process.hrtime.bigint();
  markdownToHtml('a' + ' '.repeat(100000) + 'b\nc');
  const ms = Number(process.hrtime.bigint() - start) / 1e6;
  assert.ok(ms < 500, `rendering took ${ms.toFixed(0)}ms`);
});
test('a paragraph that runs into an indented code fence keeps its soft breaks', () => {
  assert.equal(
    markdownToHtml('Install it\nlike this:\n  ```\n  npm i\n  ```'),
    '<p>Install it\nlike this:</p>\n<pre><code class="language-">  npm i\n  </code></pre>'
  );
});

// Wrapped list items: an indented line under an item continues that item.
test('an indented line continues the bullet above it', () => {
  assert.equal(markdownToHtml('- one\n  wraps here\n- two'), '<ul><li>one wraps here</li><li>two</li></ul>');
});
test('an indented line continues the numbered item above it', () => {
  assert.equal(markdownToHtml('1. one\n   wraps here\n2. two'), '<ol><li>one wraps here</li>\n<li>two</li></ol>');
});
test('an indented bullet nests rather than continuing, and keeps its own wrapped line', () => {
  assert.equal(
    markdownToHtml('- parent\n  - child\n    wraps\n- sibling'),
    '<ul><li>parent<ul><li>child wraps</li></ul></li><li>sibling</li></ul>'
  );
});
test('blank lines before a list do not push its first item a level deeper', () => {
  assert.equal(markdownToHtml('Text\n\n\n- a\n- b'), '<p>Text</p>\n<ul><li>a</li><li>b</li></ul>');
});

// Headings
test('#### renders as a heading one level below ###', () => {
  assert.equal(markdownToHtml('#### Config'), '<h5>Config</h5>');
});
test('##### and ###### render as the smallest heading', () => {
  assert.equal(markdownToHtml('##### Deep'), '<h6>Deep</h6>');
  assert.equal(markdownToHtml('###### Deeper'), '<h6>Deeper</h6>');
});
test('text right after a heading is a paragraph of its own', () => {
  assert.equal(markdownToHtml('### Setup\nRun the installer.'), '<h4>Setup</h4>\n<p>Run the installer.</p>');
});
test('a heading right after text ends the paragraph', () => {
  assert.equal(markdownToHtml('Some intro.\n### Setup'), '<p>Some intro.</p>\n<h4>Setup</h4>');
});

// Emphasis: a bold phrase may hold an italic one, and no marker pairs across a blank line.
test('an italic inside a bold renders nested', () => {
  assert.equal(markdownToHtml('**a *b* c**'), '<p><strong>a <em>b</em> c</strong></p>');
});
test('an italic inside a bold that wraps renders nested', () => {
  assert.equal(
    markdownToHtml('**one\ntwo *x* three**'),
    '<p><strong>one\ntwo <em>x</em> three</strong></p>'
  );
});
test('bold, italic and bold side by side each pair with their own markers', () => {
  assert.equal(
    markdownToHtml('**a** then *b* then **c**'),
    '<p><strong>a</strong> then <em>b</em> then <strong>c</strong></p>'
  );
});
test('an unclosed ** does not pair with a bold in the next paragraph', () => {
  assert.equal(
    markdownToHtml('**open\n\nlater **bold** text'),
    '<p>**open</p>\n<p>later <strong>bold</strong> text</p>'
  );
});
test('italic markers in two paragraphs do not pair', () => {
  assert.equal(markdownToHtml('a *b\n\nc* d'), '<p>a *b</p>\n<p>c* d</p>');
});

// Block boundaries: where text meets a table, list or code fence, each keeps its own element.
// No block lands inside a <p>, and no text sits outside one.
test('a table right after a line of text is not wrapped in its paragraph', () => {
  assert.equal(
    markdownToHtml('Intro:\n| a | b |\n|---|---|\n| 1 | 2 |'),
    '<p>Intro:</p>\n<div class="table-scroll"><table class="readme-table"><thead><tr><th>a</th><th>b</th></tr></thead>' +
      '<tbody><tr><td>1</td><td>2</td></tr></tbody></table></div>'
  );
});
test('text after a table and a blank line is a paragraph', () => {
  assert.equal(
    markdownToHtml('| a | b |\n|---|---|\n| 1 | 2 |\n\nAfter the table.'),
    '<div class="table-scroll"><table class="readme-table"><thead><tr><th>a</th><th>b</th></tr></thead>' +
      '<tbody><tr><td>1</td><td>2</td></tr></tbody></table></div>\n<p>After the table.</p>'
  );
});
test('text right after a closing code fence is a paragraph', () => {
  assert.equal(
    markdownToHtml('```\n/plugin\n```\nThen select.'),
    '<pre><code class="language-">/plugin\n</code></pre>\n<p>Then select.</p>'
  );
});
test('a task list right after a line of text is not wrapped in its paragraph', () => {
  assert.equal(
    markdownToHtml('Todo:\n- [ ] write tests'),
    '<p>Todo:</p>\n<ul class="task-list"><li class="task-item"><input type="checkbox" disabled> write tests</li></ul>'
  );
});

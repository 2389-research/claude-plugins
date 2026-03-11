# Plugin Page Install Template Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make internal plugin detail pages render a self-contained hero install snippet that includes both marketplace add and plugin install commands.

**Architecture:** Keep the change inside `scripts/generate-site.js` by introducing one shared helper for hero install markup. Cover the behavior with a lightweight integration-style Node test that regenerates the site and inspects generated HTML for one internal plugin and one external plugin.

**Tech Stack:** Node.js, built-in `assert`, existing static site generator

---

### Task 1: Add a failing regression test for generated plugin page install instructions

**Files:**
- Create: `tests/generate-site-install-template.test.js`
- Test: `tests/generate-site-install-template.test.js`

**Step 1: Write the failing test**

```js
const internalPage = fs.readFileSync('docs/plugins/css-development/index.html', 'utf8');
assert.match(internalPage, /<span class="install-label">Install Command<\/span>[\s\S]*\/plugin marketplace add 2389-research\/claude-plugins/);
assert.match(internalPage, /<span class="install-label">Install Command<\/span>[\s\S]*\/plugin install css-development@2389-research/);
```

**Step 2: Run test to verify it fails**

Run: `node tests/generate-site-install-template.test.js`
Expected: FAIL because the current hero install block only contains the plugin install command for internal plugins.

**Step 3: Commit**

```bash
git add tests/generate-site-install-template.test.js
git commit -m "test: add plugin page install template regression"
```

### Task 2: Implement a shared hero install helper in the site generator

**Files:**
- Modify: `scripts/generate-site.js`
- Test: `tests/generate-site-install-template.test.js`

**Step 1: Write minimal implementation**

```js
function generatePrimaryInstallSnippet(plugin, isExternal) {
  if (isExternal) {
    return `<code class="install-command">/plugin install ${plugin.name}</code>`;
  }

  return `<code class="install-command">/plugin marketplace add 2389-research/claude-plugins\n/plugin install ${plugin.name}@2389-research</code>`;
}
```

Use that helper in the hero install block instead of hardcoding the single install command.

**Step 2: Run test to verify it passes**

Run: `node tests/generate-site-install-template.test.js`
Expected: PASS

**Step 3: Commit**

```bash
git add scripts/generate-site.js docs/plugins/css-development/index.html docs/plugins/socialmedia/index.html tests/generate-site-install-template.test.js
git commit -m "fix: show marketplace add in plugin page install template"
```

### Task 3: Regenerate and sanity-check generated site output

**Files:**
- Modify: `docs/plugins/css-development/index.html`
- Modify: `docs/plugins/socialmedia/index.html`
- Modify: other generated files affected by `npm run generate:site`

**Step 1: Regenerate the site**

Run: `npm run generate:site`
Expected: plugin pages regenerate without script errors

**Step 2: Verify generated HTML**

Run: `rg -n "Install Command|/plugin marketplace add|@2389-research" docs/plugins/css-development/index.html docs/plugins/socialmedia/index.html`
Expected:
- `docs/plugins/css-development/index.html` shows marketplace add and `css-development@2389-research` in the hero install block
- `docs/plugins/socialmedia/index.html` keeps its direct install command

**Step 3: Commit**

```bash
git add docs/plugins
git commit -m "build: regenerate plugin pages"
```

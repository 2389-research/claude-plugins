# Plugin Marketplace Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Create a curated Claude Code plugin marketplace with automated site generation from a JSON catalog

**Architecture:** GitHub repository with marketplace.json catalog, Node.js script to generate static HTML, GitHub Actions for automation, and GitHub Pages for hosting

**Tech Stack:** Node.js (site generation), GitHub Actions (automation), GitHub Pages (hosting)

---

## Task 1: Initialize Repository Structure

**Files:**
- Create: `package.json`
- Create: `.gitignore`

**Step 1: Create package.json**

```json
{
  "name": "claude-plugins",
  "version": "1.0.0",
  "description": "Curated plugins for Claude Code",
  "scripts": {
    "generate": "node scripts/generate-site.js"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/2389-research/claude-plugins.git"
  },
  "author": "2389 Research",
  "license": "MIT"
}
```

**Step 2: Create .gitignore**

```
node_modules/
.DS_Store
*.log
```

**Step 3: Commit**

```bash
git init
git add package.json .gitignore
git commit -m "chore: initialize repository"
```

---

## Task 2: Create Marketplace Catalog

**Files:**
- Create: `.claude-plugin/marketplace.json`

**Step 1: Create directory structure**

```bash
mkdir -p .claude-plugin
```

**Step 2: Create marketplace.json with agent-drugs entry**

```json
{
  "name": "2389 Research Plugin Marketplace",
  "description": "Curated plugins for Claude Code",
  "plugins": [
    {
      "name": "agent-drugs",
      "displayName": "Agent Drugs",
      "description": "Digital drugs that modify AI behavior through prompt injection",
      "version": "1.0.0",
      "author": "2389 Research",
      "repository": "https://github.com/2389-research/agent-drugs",
      "homepage": "https://agent-drugs.web.app",
      "installUrl": "https://github.com/2389-research/agent-drugs"
    }
  ]
}
```

**Step 3: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "feat: add marketplace catalog with agent-drugs plugin"
```

---

## Task 3: Create Site Generation Script

**Files:**
- Create: `scripts/generate-site.js`

**Step 1: Create scripts directory**

```bash
mkdir -p scripts
```

**Step 2: Create generation script**

```javascript
const fs = require('fs');
const path = require('path');

// Read marketplace.json
const marketplace = JSON.parse(
  fs.readFileSync('.claude-plugin/marketplace.json', 'utf8')
);

// Generate HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${marketplace.name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>${marketplace.name}</h1>
    <p>${marketplace.description}</p>
    <code>/plugin marketplace add 2389-research/claude-plugins</code>
  </header>

  <main>
    ${marketplace.plugins.map(plugin => `
      <article class="plugin">
        <h2>${plugin.displayName}</h2>
        <p>${plugin.description}</p>
        <div class="meta">
          <span>v${plugin.version}</span>
          <span>by ${plugin.author}</span>
        </div>
        <div class="links">
          <a href="${plugin.repository}">Repository</a>
          ${plugin.homepage ? `<a href="${plugin.homepage}">Homepage</a>` : ''}
        </div>
        <code>/plugin install ${plugin.name}</code>
      </article>
    `).join('')}
  </main>
</body>
</html>`;

// Write to docs/
fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/index.html', html);

console.log('✓ Generated docs/index.html');
```

**Step 3: Test the script**

Run: `node scripts/generate-site.js`
Expected: "✓ Generated docs/index.html" and file should exist

**Step 4: Verify generated HTML**

Run: `cat docs/index.html`
Expected: Valid HTML with agent-drugs plugin card

**Step 5: Commit**

```bash
git add scripts/generate-site.js docs/index.html
git commit -m "feat: add site generation script"
```

---

## Task 4: Create Stylesheet

**Files:**
- Create: `docs/style.css`

**Step 1: Create CSS file**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

header h1 {
  margin-bottom: 0.5rem;
}

header p {
  color: #666;
  margin-bottom: 1rem;
}

code {
  background: #f5f5f5;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  display: inline-block;
  margin: 1rem 0;
  font-size: 0.9rem;
  font-family: 'Monaco', 'Courier New', monospace;
}

.plugin {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.plugin h2 {
  margin-bottom: 0.5rem;
}

.plugin p {
  margin-bottom: 1rem;
  color: #555;
}

.meta {
  color: #666;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.meta span {
  margin-right: 1rem;
}

.links {
  margin: 1rem 0;
}

.links a {
  margin-right: 1rem;
  color: #0066cc;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}
```

**Step 2: Regenerate site to verify styling**

Run: `node scripts/generate-site.js`
Expected: "✓ Generated docs/index.html"

**Step 3: Commit**

```bash
git add docs/style.css
git commit -m "feat: add stylesheet for marketplace site"
```

---

## Task 5: Create GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/generate-site.yml`

**Step 1: Create GitHub workflows directory**

```bash
mkdir -p .github/workflows
```

**Step 2: Create workflow file**

```yaml
name: Generate Plugin Marketplace Site

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Generate site
        run: node scripts/generate-site.js

      - name: Commit generated site
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add docs/
          git diff --quiet && git diff --staged --quiet || \
            (git commit -m "chore: update marketplace site" && git push)
```

**Step 3: Commit**

```bash
git add .github/workflows/generate-site.yml
git commit -m "feat: add GitHub Actions workflow for site generation"
```

---

## Task 6: Create README Documentation

**Files:**
- Create: `README.md`

**Step 1: Create README**

```markdown
# 2389 Research Plugin Marketplace

Curated plugins for Claude Code.

## Using the Marketplace

Add this marketplace to Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
```

Then install any plugin:

```
/plugin install agent-drugs
```

## Available Plugins

Visit [https://2389-research.github.io/claude-plugins](https://2389-research.github.io/claude-plugins) to browse available plugins.

## Submitting a Plugin

1. Fork this repository
2. Add your plugin entry to `.claude-plugin/marketplace.json`
3. Submit a pull request

### Required Fields

```json
{
  "name": "plugin-name",
  "displayName": "Plugin Display Name",
  "description": "One-line description of what the plugin does",
  "version": "1.0.0",
  "author": "Your Name or Organization",
  "repository": "https://github.com/your-org/your-plugin",
  "homepage": "https://your-plugin-site.com",
  "installUrl": "https://github.com/your-org/your-plugin"
}
```

### Review Process

- All submissions are manually reviewed
- Plugins must have a valid `.claude-plugin/plugin.json` file
- Plugins must be publicly accessible
- Plugins must not contain malicious code

## How It Works

1. Plugins are listed in `.claude-plugin/marketplace.json`
2. On merge, GitHub Actions generates a static site from the catalog
3. GitHub Pages serves the site at `/docs`
4. Claude Code reads the marketplace.json to install plugins

## License

MIT
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with usage and submission guide"
```

---

## Task 7: Push to GitHub and Configure Pages

**Step 1: Create GitHub repository**

Create new repository at https://github.com/new:
- Name: `claude-plugins`
- Owner: `2389-research`
- Public repository
- Do not initialize with README (we have one)

**Step 2: Add remote and push**

```bash
git remote add origin https://github.com/2389-research/claude-plugins.git
git branch -M main
git push -u origin main
```

Expected: All commits pushed to GitHub

**Step 3: Enable GitHub Pages**

1. Go to repository Settings
2. Click "Pages" in left sidebar
3. Under "Source", select:
   - Branch: `main`
   - Folder: `/docs`
4. Click "Save"

Expected: Site will be published at https://2389-research.github.io/claude-plugins

**Step 4: Verify site is live**

Wait 1-2 minutes, then visit:
https://2389-research.github.io/claude-plugins

Expected: Marketplace site displays with agent-drugs plugin

**Step 5: Test marketplace with Claude Code**

Run: `/plugin marketplace add 2389-research/claude-plugins`
Expected: Marketplace added successfully

Run: `/plugin install agent-drugs`
Expected: Plugin installed successfully

---

## Completion Checklist

- [ ] Repository structure created
- [ ] Marketplace catalog with agent-drugs entry
- [ ] Site generation script working
- [ ] Stylesheet applied
- [ ] GitHub Actions workflow configured
- [ ] README documentation complete
- [ ] Pushed to GitHub
- [ ] GitHub Pages configured and live
- [ ] Marketplace tested with Claude Code

---

**Notes:**
- Keep it minimal - no over-engineering
- Manual PR review maintains quality
- Easy to add plugins by editing JSON
- Automated regeneration keeps site in sync

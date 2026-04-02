# Monorepo to Multi-Repo Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split 27 plugins from the `2389-research/claude-plugins` monorepo into individual GitHub repos, then transform the monorepo into a marketplace-only hub.

**Architecture:** A bash script automates the per-plugin split (create repo, filter history, push). After all repos are live, the marketplace hub is cleaned up: marketplace.json sources updated, site generator modified to fetch READMEs from GitHub, plugin dirs removed, docs regenerated.

**Tech Stack:** bash, git-filter-repo, gh CLI, jq, Node.js (site generator)

---

## File Structure

```
scripts/
├── split-to-repos.sh              # Create — main automation script
├── update-marketplace-sources.sh   # Create — updates marketplace.json post-split
├── generate-site.js                # Modify — fetch READMEs from GitHub instead of local fs
├── generate-og-images.js           # No change
.claude-plugin/
├── marketplace.json                # Modify — all local sources become GitHub URLs
.github/workflows/
├── generate-site.yml               # Modify — add scheduled trigger, token permissions
CLAUDE.md                           # Modify — scope down to marketplace-only
README.md                           # Modify — scope down to marketplace-only
```

---

### Task 1: Write the split script

**Files:**
- Create: `scripts/split-to-repos.sh`

This is the core automation. It reads marketplace.json, iterates over local plugins, and for each one: creates the GitHub repo, clones the monorepo to a temp dir, runs git-filter-repo to extract just that plugin's history, adds a LICENSE file if missing, pushes to the new repo, and sets GitHub topics.

- [ ] **Step 1: Create the split script**

```bash
#!/usr/bin/env bash
# ABOUTME: Splits monorepo plugins into individual GitHub repos
# ABOUTME: Uses git-filter-repo to preserve history and gh CLI to create repos

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MARKETPLACE_JSON="$REPO_ROOT/.claude-plugin/marketplace.json"
GITHUB_ORG="2389-research"
TEMP_BASE="/tmp/plugin-split-$$"

mkdir -p "$TEMP_BASE"

echo "=== Monorepo to Multi-Repo Split ==="
echo "Temp dir: $TEMP_BASE"
echo ""

# Extract local plugins from marketplace.json (those with string source starting with ./)
PLUGINS=$(jq -r '.plugins[] | select(.source | type == "string") | .name' "$MARKETPLACE_JSON")

TOTAL=$(echo "$PLUGINS" | wc -l | tr -d ' ')
CURRENT=0

for PLUGIN_NAME in $PLUGINS; do
    CURRENT=$((CURRENT + 1))
    echo ""
    echo "=== [$CURRENT/$TOTAL] Processing: $PLUGIN_NAME ==="

    # Get plugin metadata
    DESCRIPTION=$(jq -r --arg name "$PLUGIN_NAME" '.plugins[] | select(.name == $name) | .description' "$MARKETPLACE_JSON")
    KEYWORDS=$(jq -r --arg name "$PLUGIN_NAME" '.plugins[] | select(.name == $name) | .keywords // [] | join(",")' "$MARKETPLACE_JSON")
    SOURCE_DIR=$(jq -r --arg name "$PLUGIN_NAME" '.plugins[] | select(.name == $name) | .source' "$MARKETPLACE_JSON" | sed 's|^\./||')

    # Check if source directory exists
    if [ ! -d "$REPO_ROOT/$SOURCE_DIR" ]; then
        echo "  SKIP: Source directory $SOURCE_DIR does not exist"
        continue
    fi

    # Check if repo already exists
    if gh repo view "$GITHUB_ORG/$PLUGIN_NAME" &>/dev/null; then
        echo "  SKIP: Repo $GITHUB_ORG/$PLUGIN_NAME already exists"
        continue
    fi

    # 1. Create GitHub repo
    echo "  Creating repo $GITHUB_ORG/$PLUGIN_NAME..."
    gh repo create "$GITHUB_ORG/$PLUGIN_NAME" \
        --public \
        --description "$DESCRIPTION" \
        2>/dev/null || {
            echo "  ERROR: Failed to create repo, skipping"
            continue
        }

    # 2. Clone monorepo to temp dir
    TEMP_CLONE="$TEMP_BASE/$PLUGIN_NAME"
    echo "  Cloning monorepo to temp dir..."
    git clone --no-hardlinks "$REPO_ROOT" "$TEMP_CLONE" 2>/dev/null

    # 3. Run git-filter-repo to extract plugin subdirectory
    echo "  Extracting history for $SOURCE_DIR..."
    cd "$TEMP_CLONE"
    git filter-repo --subdirectory-filter "$SOURCE_DIR" --force 2>/dev/null

    # 4. Add MIT LICENSE if missing
    if [ ! -f "$TEMP_CLONE/LICENSE" ]; then
        echo "  Adding MIT LICENSE..."
        cat > "$TEMP_CLONE/LICENSE" << 'LICEOF'
MIT License

Copyright (c) 2025 2389 Research Inc

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
LICEOF
        git add LICENSE
        git commit -m "chore: add MIT LICENSE" 2>/dev/null
    fi

    # 5. Push to new repo
    echo "  Pushing to $GITHUB_ORG/$PLUGIN_NAME..."
    git remote add github "https://github.com/$GITHUB_ORG/$PLUGIN_NAME.git"
    git push -u github main 2>/dev/null

    # 6. Set GitHub topics from keywords
    if [ -n "$KEYWORDS" ] && [ "$KEYWORDS" != "" ]; then
        echo "  Setting topics: $KEYWORDS"
        # Convert comma-separated to JSON array
        TOPICS_JSON=$(echo "$KEYWORDS" | tr ',' '\n' | jq -R . | jq -s '{"names": .}')
        gh api -X PUT "repos/$GITHUB_ORG/$PLUGIN_NAME/topics" \
            --input - <<< "$TOPICS_JSON" >/dev/null 2>&1 || true
    fi

    echo "  DONE: https://github.com/$GITHUB_ORG/$PLUGIN_NAME"

    # Clean up temp clone
    rm -rf "$TEMP_CLONE"

    cd "$REPO_ROOT"
done

echo ""
echo "=== Split complete ==="
echo "Temp dir: $TEMP_BASE (can be removed)"
echo ""
echo "Next steps:"
echo "  1. Run scripts/update-marketplace-sources.sh to update marketplace.json"
echo "  2. Update scripts/generate-site.js to fetch READMEs from GitHub"
echo "  3. Remove plugin directories from monorepo"
echo "  4. Run npm run generate to regenerate site"
echo "  5. Commit the cleaned-up marketplace hub"
```

- [ ] **Step 2: Make script executable**

Run: `chmod +x scripts/split-to-repos.sh`

- [ ] **Step 3: Dry-run validation**

Run the script with a quick sanity check — confirm it parses marketplace.json correctly and lists the expected 27 plugins:

Run: `cd /Users/harper/Public/src/2389/claude-plugins && jq -r '.plugins[] | select(.source | type == "string") | .name' .claude-plugin/marketplace.json | wc -l`
Expected: `27`

Run: `jq -r '.plugins[] | select(.source | type == "string") | .name' .claude-plugin/marketplace.json`
Expected: All 27 plugin names listed

- [ ] **Step 4: Commit**

```bash
git add scripts/split-to-repos.sh
git commit -m "feat: add monorepo-to-multi-repo split script

Automates splitting 27 plugins into individual GitHub repos:
- Creates repos via gh CLI
- Preserves git history via git-filter-repo
- Adds MIT LICENSE where missing
- Sets GitHub topics from marketplace.json keywords
- Idempotent: skips repos that already exist"
```

---

### Task 2: Write the marketplace.json update script

**Files:**
- Create: `scripts/update-marketplace-sources.sh`

This script runs after the split script and transforms all local `"./plugin-name"` source entries into GitHub URL objects matching the format already used by external MCP servers.

- [ ] **Step 1: Create the update script**

```bash
#!/usr/bin/env bash
# ABOUTME: Updates marketplace.json to point to GitHub repos instead of local dirs
# ABOUTME: Run after split-to-repos.sh has created all individual repos

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MARKETPLACE_JSON="$REPO_ROOT/.claude-plugin/marketplace.json"
GITHUB_ORG="2389-research"

echo "=== Updating marketplace.json sources ==="

# Create backup
cp "$MARKETPLACE_JSON" "$MARKETPLACE_JSON.backup"
echo "Backup: $MARKETPLACE_JSON.backup"

# Transform all local sources (string starting with ./) into URL objects
jq --arg org "$GITHUB_ORG" '
    .plugins |= map(
        if (.source | type == "string") then
            .source = {
                "source": "url",
                "url": ("https://github.com/" + $org + "/" + .name)
            }
        else
            .
        end
    )
' "$MARKETPLACE_JSON" > "$MARKETPLACE_JSON.tmp"

mv "$MARKETPLACE_JSON.tmp" "$MARKETPLACE_JSON"

echo "Updated $(jq '[.plugins[] | select(.source.source == "url")] | length' "$MARKETPLACE_JSON") plugins to use GitHub URLs"
echo ""
echo "Verify with: jq '.plugins[] | {name, source}' $MARKETPLACE_JSON"
```

- [ ] **Step 2: Make script executable**

Run: `chmod +x scripts/update-marketplace-sources.sh`

- [ ] **Step 3: Commit**

```bash
git add scripts/update-marketplace-sources.sh
git commit -m "feat: add marketplace.json source updater script

Transforms local ./plugin-name sources into GitHub URL objects
matching the format used by external MCP servers."
```

---

### Task 3: Add meta plugin dependency lists

**Files:**
- Modify: `better-dev/.claude-plugin/plugin.json`
- Modify: `botboard-biz/.claude-plugin/plugin.json`
- Modify: `sysadmin/.claude-plugin/plugin.json`

Add `dependencies` arrays before the split happens so they get included in the extracted repos.

- [ ] **Step 1: Update better-dev/plugin.json**

Replace the contents of `better-dev/.claude-plugin/plugin.json` with:

```json
{
  "name": "better-dev",
  "description": "[meta] better development: CSS workflows, Firebase development, code quality, real testing, parallel exploration, documentation verification, and token-efficient codegen",
  "version": "1.0.0",
  "dependencies": [
    "2389-research/css-development",
    "2389-research/firebase-development",
    "2389-research/fresh-eyes-review",
    "2389-research/scenario-testing",
    "2389-research/test-kitchen",
    "2389-research/documentation-audit",
    "2389-research/speed-run"
  ]
}
```

- [ ] **Step 2: Update botboard-biz/plugin.json**

Replace the contents of `botboard-biz/.claude-plugin/plugin.json` with:

```json
{
  "name": "botboard-biz",
  "description": "[meta] botboard.biz: social media and journaling capabilities for AI agents",
  "version": "1.0.0",
  "dependencies": [
    "2389-research/mcp-socialmedia",
    "2389-research/journal-mcp"
  ]
}
```

- [ ] **Step 3: Update sysadmin/plugin.json**

Replace the contents of `sysadmin/.claude-plugin/plugin.json` with:

```json
{
  "name": "sysadmin",
  "description": "[meta] system administration: structured Linux maintenance and diagnostics",
  "version": "1.0.0",
  "dependencies": [
    "2389-research/remote-system-maintenance",
    "2389-research/terminal-title"
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add better-dev/.claude-plugin/plugin.json botboard-biz/.claude-plugin/plugin.json sysadmin/.claude-plugin/plugin.json
git commit -m "feat: add dependency references to meta plugins

Prepares meta plugins for multi-repo split by listing
their bundled plugins as explicit dependencies."
```

---

### Task 4: Run the split script

**Files:**
- None (creates external repos)

This is the big moment — actually executing the split. Run the script, monitor output, handle any failures.

- [ ] **Step 1: Verify prerequisites**

Run: `which git-filter-repo && echo "OK" || echo "MISSING: brew install git-filter-repo"`
Run: `gh auth status`

Both must succeed.

- [ ] **Step 2: Execute the split**

Run: `cd /Users/harper/Public/src/2389/claude-plugins && bash scripts/split-to-repos.sh 2>&1 | tee /tmp/split-output.log`

Monitor output. Each plugin should show:
```
=== [N/27] Processing: plugin-name ===
  Creating repo 2389-research/plugin-name...
  Cloning monorepo to temp dir...
  Extracting history for plugin-name...
  Adding MIT LICENSE...
  Pushing to 2389-research/plugin-name...
  Setting topics: keyword1,keyword2
  DONE: https://github.com/2389-research/plugin-name
```

- [ ] **Step 3: Verify repos were created**

Run: `gh repo list 2389-research --limit 50 --json name --jq '.[].name' | sort`

Confirm all 27 new repos appear alongside the existing ones (claude-plugins, agent-drugs, mcp-socialmedia, journal-mcp).

- [ ] **Step 4: Spot-check a few repos**

Run: `gh repo view 2389-research/simmer --json description,url`
Run: `gh api repos/2389-research/simmer/topics --jq '.names'`
Run: `gh api repos/2389-research/simmer/commits --jq '.[0].commit.message'`

Verify description, topics, and commit history are present.

---

### Task 5: Update marketplace.json sources

**Files:**
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Run the update script**

Run: `cd /Users/harper/Public/src/2389/claude-plugins && bash scripts/update-marketplace-sources.sh`

Expected: "Updated 27 plugins to use GitHub URLs"

- [ ] **Step 2: Verify the transformation**

Run: `jq '.plugins[] | select(.source | type == "string")' .claude-plugin/marketplace.json`

Expected: No output (no remaining local sources — all should be URL objects now).

Run: `jq '.plugins[0].source' .claude-plugin/marketplace.json`

Expected:
```json
{
  "source": "url",
  "url": "https://github.com/2389-research/botboard-biz"
}
```

- [ ] **Step 3: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "feat: update marketplace.json to use GitHub URLs

All 27 plugin sources now point to their individual GitHub repos
instead of local directories."
```

---

### Task 6: Update site generator to fetch READMEs from GitHub

**Files:**
- Modify: `scripts/generate-site.js`

The `getReadmeContent()` function currently reads from local filesystem. Change it to use `gh api` to fetch from GitHub repos. Also update the `convertRepoLinks()` function to build GitHub URLs from the plugin's own repo (not the monorepo), and update the install command format.

- [ ] **Step 1: Replace the getReadmeContent function**

In `scripts/generate-site.js`, replace the existing `getReadmeContent` function (lines 59-70):

```javascript
// Try to read README.md for a plugin
function getReadmeContent(plugin) {
  if (typeof plugin.source !== 'string') return null;

  const readmePath = path.join(plugin.source.replace('./', ''), 'README.md');
  try {
    const content = fs.readFileSync(readmePath, 'utf8');
    return content;
  } catch {
    return null;
  }
}
```

with:

```javascript
const { execSync } = require('child_process');

// Fetch README.md from GitHub repo for a plugin
function getReadmeContent(plugin) {
  const repoName = getRepoName(plugin);
  if (!repoName) return null;

  try {
    const content = execSync(
      `gh api repos/${repoName}/readme --jq .content 2>/dev/null | base64 -d`,
      { encoding: 'utf8', timeout: 15000 }
    );
    return content || null;
  } catch {
    return null;
  }
}

// Extract GitHub repo name (org/repo) from plugin source
function getRepoName(plugin) {
  if (typeof plugin.source === 'object' && plugin.source.url) {
    // URL source: "https://github.com/2389-research/plugin-name" or .git suffix
    const match = plugin.source.url.match(/github\.com\/([^/]+\/[^/.]+)/);
    return match ? match[1] : null;
  }
  if (typeof plugin.source === 'string') {
    // Local source (legacy): "./plugin-name" -> "2389-research/plugin-name"
    return `2389-research/${plugin.source.replace('./', '')}`;
  }
  return null;
}
```

- [ ] **Step 2: Update convertRepoLinks to use per-repo GitHub URLs**

In `scripts/generate-site.js`, replace the `convertRepoLinks` function. The key change is that links now point to each plugin's own repo (`2389-research/{plugin-name}`) instead of the monorepo.

Replace:

```javascript
// Convert relative repo links to GitHub URLs with validation
function convertRepoLinks(html, pluginName, pluginSourcePath) {
  if (!html || !pluginSourcePath) return html;
```

with:

```javascript
// Convert relative repo links to GitHub URLs
function convertRepoLinks(html, pluginName, pluginSourcePath) {
  if (!html) return html;

  const repoBase = `https://github.com/2389-research/${pluginName}`;
```

And replace any references to `2389-research/claude-plugins/${urlType}/main/${pluginName}/` with `${repoBase}/${urlType}/main/`. The exact edits will depend on the full function body — the implementing agent should read the full function and update all monorepo URL patterns to per-repo URL patterns.

- [ ] **Step 3: Update install command format**

Search `scripts/generate-site.js` for the old install command pattern and update it.

Run: `grep -n 'plugin install' scripts/generate-site.js`

For each occurrence, change the install command from:
```
/plugin install {name}@2389-research
```
to:
```
/plugin install 2389-research/{name}
```

- [ ] **Step 4: Test the site generator**

Run: `cd /Users/harper/Public/src/2389/claude-plugins && node scripts/generate-site.js`

Expected: Generates `docs/index.html` and `docs/plugins/*/index.html` without errors. Some README fetches may take a moment due to GitHub API calls.

- [ ] **Step 5: Spot-check generated pages**

Run: `grep -c 'plugin install' docs/index.html`

Verify install commands appear and use the new `2389-research/{name}` format, not the old `{name}@2389-research` format.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-site.js
git commit -m "feat: update site generator to fetch READMEs from GitHub

- getReadmeContent() now uses gh api instead of local filesystem
- convertRepoLinks() points to per-plugin repos instead of monorepo
- Install commands use new 2389-research/{name} format"
```

---

### Task 7: Update GitHub Actions workflow

**Files:**
- Modify: `.github/workflows/generate-site.yml`

Add a weekly scheduled trigger to pick up README changes in plugin repos, and ensure the workflow has the right token permissions for `gh api` calls.

- [ ] **Step 1: Update the workflow**

Replace the contents of `.github/workflows/generate-site.yml` with:

```yaml
name: Generate Plugin Marketplace Site

on:
  push:
    branches: [main]
  schedule:
    - cron: '23 6 * * 3'  # Weekly on Wednesday at 6:23 AM UTC
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

      - name: Install gh CLI
        run: type gh || (curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null && sudo apt update && sudo apt install gh)

      - name: Generate site
        env:
          GH_TOKEN: ${{ github.token }}
        run: node scripts/generate-site.js

      - name: Commit generated site
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add docs/
          git diff --quiet && git diff --staged --quiet || \
            (git commit -m "chore: update marketplace site" && git push)
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/generate-site.yml
git commit -m "feat: update site workflow for multi-repo architecture

- Add weekly schedule to pick up README changes in plugin repos
- Add gh CLI for fetching README content via GitHub API
- Set GH_TOKEN for API authentication"
```

---

### Task 8: Remove plugin directories from monorepo

**Files:**
- Delete: all 27 plugin directories + `hosted-llm-codegen`

- [ ] **Step 1: Remove all plugin directories**

Run the following to remove all plugin dirs (and hosted-llm-codegen which is unlisted):

```bash
cd /Users/harper/Public/src/2389/claude-plugins

# Remove the 27 marketplace plugins
jq -r '.plugins[] | select(.source | type == "string") | .source' .claude-plugin/marketplace.json | while read source; do
  echo "Removing: $source"
done
```

Wait — at this point, marketplace.json has already been updated to URL sources (Task 5). We need to use the list of known plugin directories instead:

```bash
cd /Users/harper/Public/src/2389/claude-plugins

PLUGIN_DIRS=(
  better-dev botboard-biz sysadmin
  css-development firebase-development fresh-eyes-review documentation-audit
  scenario-testing test-kitchen simmer git-repo-prep prbuddy speed-run
  xtool binary-re remote-system-maintenance terminal-title slack-mcp
  building-multiagent-systems review-squad deliberation
  landing-page-design product-launcher gtm-partner
  ceo-personal-os worldview-synthesis summarize-meetings
  hosted-llm-codegen
)

for dir in "${PLUGIN_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "Removing: $dir"
    rm -rf "$dir"
  fi
done
```

- [ ] **Step 2: Verify only marketplace infrastructure remains**

Run: `ls -1 /Users/harper/Public/src/2389/claude-plugins/`

Expected:
```
.claude-plugin/
.github/
docs/
node_modules/
scripts/
tests/
CLAUDE.md
INSTALL_FIREBASE.md
LICENSE
README.md
install.sh
package-lock.json
package.json
```

No plugin directories should remain.

- [ ] **Step 3: Remove install.sh (references local plugin paths)**

Run: `rm install.sh INSTALL_FIREBASE.md`

These reference local plugin structures that no longer exist.

- [ ] **Step 4: Remove tests/ directory if it only contains monorepo-level tests**

Run: `ls tests/` to check contents. If it contains integration test infrastructure specific to the monorepo layout, remove it. If it contains marketplace-level tests, keep it.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: remove plugin directories after multi-repo split

All 27 plugins now live in their own GitHub repos.
This repo is now the marketplace hub only."
```

---

### Task 9: Update CLAUDE.md and README.md for marketplace-only scope

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`

These files currently describe the monorepo with plugin development instructions. They need to be rewritten to describe a marketplace catalog hub.

- [ ] **Step 1: Rewrite CLAUDE.md**

Replace the contents of `CLAUDE.md` with a marketplace-focused version. Keep the marketplace.json format documentation, site generation instructions, and how to add new plugins (now pointing to external repos). Remove all plugin development instructions, shared conventions, and plugin directory layout docs.

Key sections to retain/adapt:
- Repository Purpose (updated: marketplace hub, not monorepo)
- Marketplace Structure (marketplace.json, scripts, docs)
- Adding a New Plugin (now: create a separate repo, add URL entry to marketplace.json)
- Site Generation (`npm run generate`)
- GitHub Actions
- Available Plugins (table with links to individual repos)
- External MCP Servers

Key sections to remove:
- Plugin Architecture (internal structure docs)
- Shared Conventions (ABOUTME, TodoWrite, etc. — these belong in individual plugin repos)
- Development Commands for local plugin testing
- File Organization showing plugin directory layout

- [ ] **Step 2: Rewrite README.md**

Update README.md to be a concise marketplace landing page pointing users to the generated site and listing how to install plugins from their individual repos.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs: rewrite CLAUDE.md and README.md for marketplace-only hub

Repository is now a catalog + site generator.
Plugin development happens in individual repos."
```

---

### Task 10: Regenerate marketplace site and final verification

**Files:**
- Regenerate: `docs/` (all generated content)

- [ ] **Step 1: Regenerate the site**

Run: `cd /Users/harper/Public/src/2389/claude-plugins && node scripts/generate-site.js`

Expected: Site generates successfully. May take 30-60 seconds due to GitHub API calls for README fetching.

- [ ] **Step 2: Regenerate OG images**

Run: `node scripts/generate-og-images.js`

- [ ] **Step 3: Verify generated site**

Run: `ls docs/plugins/ | wc -l`

Expected: 27+ directories (one per plugin, plus the 3 external MCP servers = 30).

Run: `head -50 docs/index.html`

Verify the page renders the marketplace catalog.

- [ ] **Step 4: Spot-check install commands on generated pages**

Run: `grep -r 'plugin install' docs/plugins/simmer/index.html`

Expected: Contains `/plugin install 2389-research/simmer` (new format).

- [ ] **Step 5: Final commit**

```bash
git add docs/
git commit -m "chore: regenerate marketplace site for multi-repo architecture

All plugin pages now link to individual GitHub repos.
Install commands use 2389-research/{name} format.
READMEs fetched from GitHub at build time."
```

- [ ] **Step 6: Verify the full repo state**

Run: `git status`

Expected: Clean working tree.

Run: `git log --oneline -10`

Expected: Shows all commits from this plan in sequence.

---

## Execution Order & Dependencies

```
Task 1 (split script)      ─┐
Task 2 (update script)      ├─ Can run in parallel (independent scripts)
Task 3 (meta plugin deps)  ─┘
         │
Task 4 (run the split)     ← Depends on Tasks 1 + 3 (script + deps must exist before splitting)
         │
Task 5 (update marketplace.json) ← Depends on Task 4 (repos must exist)
         │
Task 6 (update site generator)   ← Depends on Task 5 (needs URL sources)
Task 7 (update GitHub Actions)   ← Can run parallel with Task 6
         │
Task 8 (remove plugin dirs)      ← Depends on Tasks 5 + 6 (sources updated, generator updated)
         │
Task 9 (update docs)             ← Depends on Task 8 (dirs must be gone)
         │
Task 10 (regenerate + verify)    ← Depends on all above
```

Tasks 1, 2, 3 are independent and can be parallelized.
Tasks 6 and 7 are independent and can be parallelized.
Everything else is sequential.

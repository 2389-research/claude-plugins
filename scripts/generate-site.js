// ABOUTME: Generates the marketplace landing page and individual plugin pages from marketplace.json
// ABOUTME: Outputs 2389-branded design with SEO, structured data, and accessibility

const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const { convertRepoLinks } = require('./lib/convert-repo-links');

// Read marketplace.json
const marketplace = JSON.parse(
  fs.readFileSync('.claude-plugin/marketplace.json', 'utf8')
);

const INTERNAL_MARKETPLACE_COMMAND = '/plugin marketplace add 2389-research/claude-plugins';
// Claude Code registers a marketplace under the top-level `name` field in marketplace.json,
// and `/plugin install` resolves plugins as `<plugin>@<marketplace-name>`. Derive it from the
// manifest so the generated install commands always match the registered marketplace name.
const MARKETPLACE_NAME = marketplace.name;
if (typeof MARKETPLACE_NAME !== 'string' || MARKETPLACE_NAME.trim() === '') {
  throw new Error(
    'marketplace.json is missing a non-empty top-level "name". The generated /plugin install ' +
    'commands resolve as <plugin>@<name>, so an empty name would emit broken docs.'
  );
}
const SITE_URL = 'https://skills.2389.ai';
const BUILD_DATE = new Date().toISOString().slice(0, 10);

// Use git commit dates so generated metadata only changes when content actually changes
function getLastModDate(targetPath) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', targetPath], { encoding: 'utf8' }).trim() || BUILD_DATE;
  } catch {
    return BUILD_DATE;
  }
}

const MARKETPLACE_LASTMOD = getLastModDate('.claude-plugin/marketplace.json');

// Group plugins by category
const categories = {
  development: { title: 'Development', description: 'Workflows for building, testing, and shipping code', plugins: [] },
  infrastructure: { title: 'Infrastructure', description: 'System administration and operational tooling', plugins: [] },
  agents: { title: 'Agent Systems', description: 'Multi-agent architecture and agent capabilities', plugins: [] },
  personal: { title: 'Personal & Strategy', description: 'Reflection frameworks and personal operating systems', plugins: [] }
};

// Categorize plugins
marketplace.plugins.forEach(plugin => {
  const keywords = plugin.keywords || [];
  const desc = plugin.description.toLowerCase();

  if (keywords.includes('linux') || keywords.includes('sysadmin') || keywords.includes('terminal') || keywords.includes('reverse-engineering') || keywords.includes('maintenance')) {
    categories.infrastructure.plugins.push(plugin);
  } else if (keywords.includes('multi-agent') || keywords.includes('agents') || keywords.includes('social') || desc.includes('agent')) {
    categories.agents.plugins.push(plugin);
  } else if (keywords.includes('ceo') || keywords.includes('executive') || keywords.includes('worldview') || keywords.includes('journal') || keywords.includes('reflection')) {
    categories.personal.plugins.push(plugin);
  } else {
    categories.development.plugins.push(plugin);
  }
});

// Get category for a plugin
function getCategoryForPlugin(plugin) {
  const keywords = plugin.keywords || [];
  const desc = plugin.description.toLowerCase();

  if (keywords.includes('linux') || keywords.includes('sysadmin') || keywords.includes('terminal') || keywords.includes('reverse-engineering') || keywords.includes('maintenance')) {
    return categories.infrastructure;
  } else if (keywords.includes('multi-agent') || keywords.includes('agents') || keywords.includes('social') || desc.includes('agent')) {
    return categories.agents;
  } else if (keywords.includes('ceo') || keywords.includes('executive') || keywords.includes('worldview') || keywords.includes('journal') || keywords.includes('reflection')) {
    return categories.personal;
  } else {
    return categories.development;
  }
}

// Extract org/repo from a plugin source URL or fall back to 2389-research/{name}
function getRepoName(plugin) {
  if (plugin.source?.url) {
    const match = plugin.source.url.replace(/\.git$/, '').match(/github\.com\/([^/]+\/[^/]+)/);
    if (match) return match[1];
  }
  if (typeof plugin.source === 'string') {
    return `2389-research/${plugin.source.replace('./', '')}`;
  }
  return `2389-research/${plugin.name}`;
}

// Fetch README.md from GitHub via gh api
function getReadmeContent(plugin) {
  const repo = getRepoName(plugin);
  try {
    const content = execSync(
      `gh api repos/${repo}/readme --jq .content | base64 -d`,
      { encoding: 'utf8', timeout: 15000 }
    );
    return content || null;
  } catch {
    return null;
  }
}

// Track link issues for reporting
const linkReport = {
  converted: [],
  broken: []
};

// convertRepoLinks lives in ./lib/convert-repo-links.js so it can be unit-tested in
// isolation. It absolutizes relative README links against each plugin's GitHub repo;
// marketplace.plugins and linkReport are passed in at the call site below.

// Convert markdown table to HTML
function convertMarkdownTable(tableText) {
  const lines = tableText.trim().split('\n');
  if (lines.length < 2) return tableText;

  // Parse row, handling leading/trailing pipes but preserving empty cells
  const parseRow = (row) => {
    // Remove leading/trailing pipes and split
    const trimmed = row.replace(/^\||\|$/g, '');
    return trimmed.split('|').map(cell => cell.trim());
  };

  // Parse header row
  const headerCells = parseRow(lines[0]);

  // Skip separator row (line with dashes)
  // Parse data rows
  const dataRows = lines.slice(2).map(parseRow);

  let html = '<table class="readme-table"><thead><tr>';
  headerCells.forEach(cell => {
    html += `<th>${cell}</th>`;
  });
  html += '</tr></thead><tbody>';

  dataRows.forEach(row => {
    html += '<tr>';
    row.forEach(cell => {
      html += `<td>${cell}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
}

// Convert markdown to basic HTML
function markdownToHtml(md) {
  if (!md) return '';

  // Strip YAML front matter (--- ... ---)
  md = md.replace(/^---\n[\s\S]*?\n---\n/, '');

  // CRITICAL: Extract code blocks first and protect them from processing
  const codeBlocks = [];
  // Use [^\n`]* to capture language tags like objective-c, c++, etc.
  md = md.replace(/```([^\n`]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const index = codeBlocks.length;
    // Escape HTML entities in code
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    codeBlocks.push(`<pre><code class="language-${lang || ''}">${escapedCode}</code></pre>`);
    return `{{CODE_BLOCK_${index}}}`;
  });

  // Also protect inline code
  const inlineCode = [];
  md = md.replace(/`([^`]+)`/g, (match, code) => {
    const index = inlineCode.length;
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    inlineCode.push(`<code>${escapedCode}</code>`);
    return `{{INLINE_CODE_${index}}}`;
  });

  // Convert tables (before other processing)
  md = md.replace(/^(\|.+\|)\n(\|[-:\s|]+\|)\n((?:\|.+\|\n?)+)/gm, (match) => {
    return convertMarkdownTable(match);
  });

  // Headers
  md = md.replace(/^### (.*$)/gm, '<h4>$1</h4>');
  md = md.replace(/^## (.*$)/gm, '<h3>$1</h3>');
  md = md.replace(/^# (.*$)/gm, '<h2>$1</h2>');

  // Blockquotes
  md = md.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
  md = md.replace(/<\/blockquote>\n<blockquote>/g, '\n');

  // Bold and italic
  md = md.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  md = md.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Links
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');

  // Task lists
  md = md.replace(/^- \[x\] (.*$)/gim, '{{TASK_DONE}}$1{{/TASK_DONE}}');
  md = md.replace(/^- \[ \] (.*$)/gm, '{{TASK}}$1{{/TASK}}');

  // Ordered lists
  md = md.replace(/^\d+\. (.*$)/gm, '{{OLI}}$1{{/OLI}}');

  // Unordered lists (including nested - handle indented items)
  md = md.replace(/^(\s*)\- (.*$)/gm, (match, indent, content) => {
    const level = Math.floor(indent.length / 2); // 2 spaces = 1 level
    return `{{ULI:${level}}}${content}{{/ULI}}`;
  });

  // Convert list placeholders to HTML
  md = md.replace(/({{OLI}}[\s\S]*?{{\/OLI}}\n?)+/g, (match) => {
    const items = match.replace(/{{OLI}}([\s\S]*?){{\/OLI}}/g, '<li>$1</li>');
    return '<ol>' + items.trim() + '</ol>\n';
  });

  // Convert unordered lists with nesting support
  md = md.replace(/({{ULI:\d+}}[\s\S]*?{{\/ULI}}\n?)+/g, (match) => {
    let html = '';
    let currentLevel = 0;
    const lines = match.trim().split('\n');

    // Find minimum indent level to use as base (0)
    let minLevel = Infinity;
    lines.forEach(line => {
      const levelMatch = line.match(/{{ULI:(\d+)}}/);
      if (levelMatch) {
        minLevel = Math.min(minLevel, parseInt(levelMatch[1], 10));
      }
    });
    if (minLevel === Infinity) minLevel = 0;

    lines.forEach(line => {
      const levelMatch = line.match(/{{ULI:(\d+)}}([\s\S]*?){{\/ULI}}/);
      if (levelMatch) {
        // Normalize level relative to minimum
        const level = parseInt(levelMatch[1], 10) - minLevel;
        const content = levelMatch[2];

        // Close lists if going up levels
        while (currentLevel > level) {
          html += '</ul></li>';
          currentLevel--;
        }

        // Open new nested list if going deeper
        if (level > currentLevel) {
          // Remove closing </li> from previous item to nest inside it
          html = html.replace(/<\/li>$/, '');
          while (currentLevel < level) {
            html += '<ul>';
            currentLevel++;
          }
        }

        html += `<li>${content}</li>`;
      }
    });

    // Close any remaining open lists
    while (currentLevel > 0) {
      html += '</ul></li>';
      currentLevel--;
    }

    return '<ul>' + html + '</ul>\n';
  });

  md = md.replace(/({{TASK_DONE}}[\s\S]*?{{\/TASK_DONE}}\n?|{{TASK}}[\s\S]*?{{\/TASK}}\n?)+/g, (match) => {
    const items = match
      .replace(/{{TASK_DONE}}([\s\S]*?){{\/TASK_DONE}}/g, '<li class="task-item task-done"><input type="checkbox" checked disabled> $1</li>')
      .replace(/{{TASK}}([\s\S]*?){{\/TASK}}/g, '<li class="task-item"><input type="checkbox" disabled> $1</li>');
    return '<ul class="task-list">' + items.trim() + '</ul>\n';
  });

  // Before paragraph processing, ensure block elements are separated from preceding text
  // This handles cases like "**What it does:**\n- item" or "text:\n```code```"
  md = md.replace(/([^\n])\n(<(?:ul|ol|table|blockquote)>)/g, '$1\n\n$2');
  md = md.replace(/([^\n])\n({{CODE_BLOCK_\d+}})/g, '$1\n\n$2');

  // Paragraphs - split on double newlines and wrap non-block content
  const blocks = md.split(/\n\n+/);
  md = blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    // Don't wrap if it's already a block element
    if (/^<(h[1-6]|ul|ol|pre|table|blockquote|div)/.test(block)) {
      return block;
    }
    // Don't wrap code block placeholders
    if (/^{{CODE_BLOCK_\d+}}$/.test(block)) {
      return block;
    }
    // Don't wrap if block contains a code block placeholder (mixed content)
    if (/{{CODE_BLOCK_\d+}}/.test(block)) {
      // Split on code block, wrap text parts in <p>, leave code blocks alone
      return block.replace(/^(.+?)({{CODE_BLOCK_\d+}})$/s, (m, text, code) => {
        return '<p>' + text.trim().replace(/\n/g, '<br>') + '</p>\n' + code;
      });
    }
    return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
  }).join('\n');

  // Restore code blocks
  codeBlocks.forEach((code, index) => {
    md = md.replace(`{{CODE_BLOCK_${index}}}`, code);
  });

  // Restore inline code
  inlineCode.forEach((code, index) => {
    md = md.replace(`{{INLINE_CODE_${index}}}`, code);
  });

  // Clean up any wrapped code blocks or empty paragraphs
  md = md.replace(/<p>\s*(<pre>)/g, '$1');
  md = md.replace(/(<\/pre>)\s*<\/p>/g, '$1');
  md = md.replace(/<p>\s*<\/p>/g, '');

  return md;
}

// Helper to get source URL
function getSourceUrl(plugin) {
  if (plugin.source?.url) {
    return plugin.source.url.replace(/\.git$/, '');
  }
  if (typeof plugin.source === 'string') {
    return `https://github.com/2389-research/${plugin.source.replace('./', '')}`;
  }
  return `https://github.com/2389-research/${plugin.name}`;
}

// Clean description
function cleanDescription(desc) {
  return desc.startsWith('[meta]') ? desc.substring(7).trim() : desc;
}

// Common HTML head
function generateHead(title, description, canonicalPath, extraKeywords) {
  const baseKeywords = ['coding agent skills', 'Claude Code', 'MCP servers', 'Codex', 'Cursor', 'AI development', 'Anthropic', '2389 Research'];
  const allKeywords = extraKeywords ? [...new Set([...extraKeywords, ...baseKeywords])] : baseKeywords;
  const escapedTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>${escapedTitle} | 2389 Research</title>
  <meta name="title" content="${escapedTitle} | 2389 Research">
  <meta name="description" content="${description}">
  <meta name="keywords" content="${allKeywords.join(', ')}">
  <meta name="author" content="2389 Research Inc">
  <meta name="robots" content="index, follow">

  <!-- Canonical URL -->
  <link rel="canonical" href="${SITE_URL}/${canonicalPath}">

  <!-- Markdown mirror for AI agents -->
  <link rel="alternate" type="text/markdown" href="${SITE_URL}/${canonicalPath}index.md">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE_URL}/${canonicalPath}">
  <meta property="og:title" content="${escapedTitle} | 2389 Research">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${SITE_URL}/${canonicalPath}og-image.png">
  <meta property="og:site_name" content="2389 Research Plugin Marketplace">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${SITE_URL}/${canonicalPath}">
  <meta property="twitter:title" content="${escapedTitle} | 2389 Research">
  <meta property="twitter:description" content="${description}">
  <meta property="twitter:image" content="${SITE_URL}/${canonicalPath}og-image.png">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔌</text></svg>">

  <!-- Preconnect for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="dns-prefetch" href="https://github.com">

  <!-- Fonts with display=swap for performance -->
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" defer></script>

  <!-- Styles -->
  <link rel="stylesheet" href="${canonicalPath === '' ? '' : '../..'}${canonicalPath === '' ? '' : '/'}style.css">

  <!-- Analytics -->
  <script src="https://tinylytics.app/embed/5QhFsgM-mdxovUNCvS-o.js?events" defer></script>
</head>`;
}

// Common navigation
function generateNav(isPluginPage = false) {
  const homeLink = isPluginPage ? '../../' : '';
  return `<nav class="nav" role="navigation" aria-label="Main navigation">
    <div class="nav-inner">
      <a href="${homeLink || '.'}" class="nav-logo" aria-label="2389 Research Plugin Marketplace">
        <span class="status-indicator" aria-hidden="true"></span>
        2389 Research Inc
      </a>
      <div class="nav-links" role="menubar">
        <a href="${homeLink}#plugins" class="nav-link" role="menuitem">Plugins</a>
        <a href="${homeLink}#about" class="nav-link" role="menuitem">About</a>
        <a href="https://github.com/2389-research/claude-plugins" class="nav-link" role="menuitem" rel="noopener noreferrer" target="_blank" data-tinylytics-event="nav.github">GitHub</a>
        <a href="https://2389.ai" class="nav-link" role="menuitem" rel="noopener noreferrer" target="_blank" data-tinylytics-event="nav.visit-2389">2389.ai</a>
      </div>
      <a href="https://github.com/2389-research/claude-plugins" class="nav-star-btn" rel="noopener noreferrer" target="_blank" title="Star on GitHub" data-tinylytics-event="nav.star-github">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>
        Star
      </a>
    </div>
  </nav>`;
}

// Common footer
function generateFooter(isPluginPage = false) {
  const homeLink = isPluginPage ? '../../' : '';
  return `<footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <a href="${homeLink || '.'}" class="footer-logo">
          <span class="status-indicator"></span>
          2389 Research Inc
        </a>
        <p class="footer-tagline">Building tools for how we actually work.<br>(No matching jumpsuits. Yet.)</p>
      </div>

      <div class="footer-links-grid">
        <div class="footer-column">
          <h5>Company</h5>
          <a href="https://2389.ai" data-tinylytics-event="footer.company" data-tinylytics-event-value="about">About Us</a>
          <a href="https://github.com/2389-research/claude-plugins" data-tinylytics-event="footer.company" data-tinylytics-event-value="github">GitHub</a>
          <a href="mailto:hello@2389.ai" data-tinylytics-event="footer.company" data-tinylytics-event-value="contact">Contact</a>
        </div>
        <div class="footer-column">
          <h5>Resources</h5>
          <a href="https://docs.claude.com/en/docs/claude-code" data-tinylytics-event="footer.resource" data-tinylytics-event-value="claude-code-docs">Claude Code Docs</a>
          <a href="https://docs.claude.com/en/docs/claude-code/skills" data-tinylytics-event="footer.resource" data-tinylytics-event-value="skills-guide">Skills Guide</a>
          <a href="https://docs.claude.com/en/docs/claude-code/plugins" data-tinylytics-event="footer.resource" data-tinylytics-event-value="plugin-dev">Plugin Development</a>
          <a href="${homeLink}glossary/" data-tinylytics-event="footer.resource" data-tinylytics-event-value="glossary">Glossary</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© ${new Date().getFullYear()} 2389 Research Inc. All plugins are open source. (Robots included.)</p>
    </div>
  </footer>`;
}

// CAT_COLOR is already defined at top level in Task 3 — do not redeclare it.
const pad = n => String(n).padStart(2, '0');

function generateSkillRow(plugin, gi, catTitle) {
  const desc = cleanDescription(plugin.description);
  const tags = (plugin.keywords || []).slice(0, 3);
  const isMcp = !pluginHasSkills(plugin);
  const copyCmd = isMcp ? getPluginInstallCommand(plugin) : getNpxInstallCommand(plugin);
  const color = CAT_COLOR[catTitle] || '#e6196e';
  const tagHtml = tags.map(t =>
    `<button type="button" class="tag-btn mono" data-tag="${t}">#${t}</button>`
  ).join(' ');
  return `<a href="plugins/${plugin.name}/" class="skill-row" data-skill-row data-name="${plugin.name}" data-desc="${desc.replace(/"/g, '&quot;')}" data-tags="${tags.join(',')}" data-cat="${catTitle}" data-tinylytics-event="plugin.view-details" data-tinylytics-event-value="${plugin.name}">
              <div class="row-num mono">${pad(gi)}</div>
              <div class="row-body">
                <div class="row-title">
                  <h3 class="skill-name mono">${plugin.name}</h3>
                  ${isMcp ? `<span class="mcp-badge mono">MCP</span>` : ''}
                  <span class="skill-ver mono">v${plugin.version || '1.0.0'}</span>
                </div>
                <p class="skill-desc">${desc}</p>
                <div class="row-tags">${tagHtml}</div>
              </div>
              <div class="row-rail">
                <span class="row-cat mono" style="color:${color}">${catTitle}</span>
                <button type="button" class="row-copy mono" data-copy="${copyCmd}" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}">copy install</button>
                <span class="row-more mono">details →</span>
              </div>
            </a>`;
}

function getPluginInstallCommand(plugin) {
  return `/plugin install ${plugin.name}@${MARKETPLACE_NAME}`;
}

function getNpxInstallCommand(plugin) {
  return `npx skills add ${getRepoName(plugin)}`;
}

// MCP-only entries (strict: true) ship no skills, so npx skills add can't install them.
function pluginHasSkills(plugin) {
  return plugin.strict !== true;
}

// Renders the npx-default / Claude-Code-secondary install tabs.
// group must be unique per page so ARIA ids don't collide.
function renderInstallTabs({ group, npxHtml, ccHtml }) {
  return `<div class="install-tabs" data-install-tabs>
            <div class="install-tab-row" role="tablist" aria-label="Install method">
              <button type="button" class="install-tab active" role="tab" aria-selected="true" data-tab="npx-${group}" aria-controls="panel-npx-${group}" id="tab-npx-${group}">npx (any agent)</button>
              <button type="button" class="install-tab" role="tab" aria-selected="false" data-tab="cc-${group}" aria-controls="panel-cc-${group}" id="tab-cc-${group}">Claude Code</button>
            </div>
            <div class="install-tab-panel" role="tabpanel" id="panel-npx-${group}" aria-labelledby="tab-npx-${group}" data-panel="npx-${group}">${npxHtml}</div>
            <div class="install-tab-panel" role="tabpanel" id="panel-cc-${group}" aria-labelledby="tab-cc-${group}" data-panel="cc-${group}" hidden>${ccHtml}</div>
          </div>`;
}

// Shared interactive <script>: copy-to-clipboard + tab switching.
// Used by both the homepage and every plugin page (plugin pages had no script before).
function generateInteractiveScript() {
  return `<script>
  document.querySelectorAll('.install-command, .plugin-install').forEach(el => {
    el.title = 'Click to copy';
    el.addEventListener('click', () => {
      navigator.clipboard.writeText(el.textContent.trim()).then(() => {
        const orig = el.textContent;
        el.textContent = 'Copied!';
        el.classList.add('copied');
        setTimeout(() => { el.textContent = orig; el.classList.remove('copied'); }, 1500);
      });
    });
  });

  document.querySelectorAll('.install-tabs').forEach(group => {
    group.querySelectorAll('.install-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.tab;
        group.querySelectorAll('.install-tab').forEach(t => {
          const on = t === tab;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        group.querySelectorAll('.install-tab-panel').forEach(p => {
          p.hidden = p.dataset.panel !== key;
        });
      });
    });
  });

  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      navigator.clipboard.writeText(btn.dataset.copy.replace(/&lt;/g,'<').replace(/&gt;/g,'>')).catch(()=>{});
      const orig = btn.textContent;
      const done = /Copy$/.test(orig) ? '✓ Copied' : '✓ copied';
      btn.textContent = done; btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1600);
    });
  });

  const search = document.querySelector('[data-search]');
  if (search) {
    const rows = [...document.querySelectorAll('[data-skill-row]')];
    const countEl = document.querySelector('[data-count]');
    const chips = [...document.querySelectorAll('.chip[data-cat]')];
    const clearTag = document.querySelector('[data-cleartag]');
    let cat = 'all', tag = null;
    const apply = () => {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      rows.forEach(r => {
        const okCat = cat === 'all' || r.dataset.cat === cat;
        const okTag = !tag || (r.dataset.tags || '').split(',').includes(tag);
        const hay = (r.dataset.name + ' ' + r.dataset.desc + ' ' + r.dataset.tags).toLowerCase();
        const okQ = !q || hay.includes(q);
        const show = okCat && okTag && okQ;
        r.style.display = show ? '' : 'none';
        if (show) shown++;
      });
      document.querySelectorAll('[data-cat-section]').forEach(s => {
        const any = [...s.querySelectorAll('[data-skill-row]')].some(r => r.style.display !== 'none');
        s.style.display = any ? '' : 'none';
      });
      const empty = document.querySelector('[data-empty]');
      if (empty) empty.hidden = shown !== 0;
      if (countEl) countEl.textContent = shown + ' of ' + rows.length + ' entries';
    };
    search.addEventListener('input', apply);
    chips.forEach(c => c.addEventListener('click', () => {
      cat = c.dataset.cat; tag = null;
      chips.forEach(x => x.classList.toggle('active', x === c));
      if (clearTag) clearTag.hidden = true;
      apply();
    }));
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-tag]');
      if (!t) return;
      e.preventDefault(); e.stopPropagation();
      tag = t.dataset.tag; cat = 'all';
      chips.forEach(x => x.classList.toggle('active', x.dataset.cat === 'all'));
      if (clearTag) { clearTag.hidden = false; clearTag.textContent = '#' + tag + ' ✕'; }
      window.scrollTo({ top: 360, behavior: 'smooth' });
      apply();
    });
    if (clearTag) clearTag.addEventListener('click', () => { tag = null; clearTag.hidden = true; apply(); });
    const resetBtn = document.querySelector('[data-reset]');
    if (resetBtn) resetBtn.addEventListener('click', () => { search.value=''; cat='all'; tag=null; chips.forEach(x=>x.classList.toggle('active',x.dataset.cat==='all')); if(clearTag) clearTag.hidden=true; apply(); });
  }
  </script>`;
}

function generateQuickInstallSteps(plugin) {
  const step3 = `
          <div class="step">
            <span class="step-number">3</span>
            <div class="step-content">
              <span class="step-label">You're good to go</span>
              <code>Skills auto-trigger when relevant</code>
            </div>
          </div>`;

  const ccSteps = `
          <div class="step">
            <span class="step-number">1</span>
            <div class="step-content">
              <span class="step-label">Add the marketplace</span>
              <code data-tinylytics-event="install.copy-command" data-tinylytics-event-value="${plugin.name}-marketplace">${INTERNAL_MARKETPLACE_COMMAND}</code>
            </div>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <div class="step-content">
              <span class="step-label">Install this plugin</span>
              <code data-tinylytics-event="install.copy-command" data-tinylytics-event-value="${plugin.name}-install">${getPluginInstallCommand(plugin)}</code>
            </div>
          </div>${step3}`;

  if (!pluginHasSkills(plugin)) return `<div class="quick-start-steps">${ccSteps}</div>`;

  const npxSteps = `
          <div class="step">
            <span class="step-number">1</span>
            <div class="step-content">
              <span class="step-label">Run it — works in any agent</span>
              <code data-tinylytics-event="install.copy-command" data-tinylytics-event-value="${plugin.name}-npx">${getNpxInstallCommand(plugin)}</code>
            </div>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <div class="step-content">
              <span class="step-label">Pick your agents when prompted</span>
              <code>Claude Code, Cursor, Codex…</code>
            </div>
          </div>${step3}`;

  return renderInstallTabs({
    group: `qi-${plugin.name}`,
    npxHtml: `<div class="quick-start-steps">${npxSteps}</div>`,
    ccHtml: `<div class="quick-start-steps">${ccSteps}</div>`,
  });
}

// Generate category sections
function generateCategorySections() {
  let gi = 0, si = 0;
  return Object.values(categories)
    .filter(cat => cat.plugins.length > 0)
    .map(cat => {
      si++;
      const color = CAT_COLOR[cat.title] || '#e6196e';
      const rows = cat.plugins.map(p => { gi++; return generateSkillRow(p, gi, cat.title); }).join('\n');
      return `<section class="cat-section" data-cat-section style="animation:fadeIn .3s ease both">
          <div class="cat-head">
            <span class="mono cat-num" style="color:${color}">${pad(si)}</span>
            <h2 class="cat-name">${cat.title}</h2>
            <span class="mono cat-count">${cat.plugins.length} skill${cat.plugins.length !== 1 ? 's' : ''}</span>
            <span class="cat-rule"></span>
          </div>
          <p class="mono cat-blurb">${cat.description}</p>
          ${rows}
        </section>`;
    }).join('\n');
}

// Generate related plugins section for internal linking
function generateRelatedPlugins(plugin, category) {
  const related = category.plugins.filter(p => p.name !== plugin.name).slice(0, 3);
  if (related.length === 0) return '';

  return `
    <section class="section related-section">
      <div class="section-header">
        <span class="section-number">03</span>
        <div class="section-title-group">
          <h2 class="section-title">Related Plugins</h2>
          <p class="section-subtitle">More from ${category.title}</p>
        </div>
      </div>

      <div class="plugins-grid">
${related.map(p => {
  const desc = cleanDescription(p.description);
  const tags = (p.keywords || []).slice(0, 3).map(k =>
    `<span class="tag">${k}</span>`
  ).join('');
  return `
        <article class="plugin-card">
          <div class="plugin-card-header">
            <a href="../${p.name}/" class="plugin-name-link" data-tinylytics-event="related.view-plugin" data-tinylytics-event-value="${p.name}">
              <h4 class="plugin-name">${p.name}</h4>
            </a>
            <span class="plugin-version">v${p.version || '1.0.0'}</span>
          </div>
          <p class="plugin-description">${desc}</p>
          <div class="plugin-tags">${tags}</div>
          <div class="plugin-footer${pluginHasSkills(p) ? ' plugin-footer-tabs' : ''}">
            ${pluginHasSkills(p)
              ? renderInstallTabs({
                  group: `related-${p.name}`,
                  npxHtml: `<code class="plugin-install" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${p.name}-npx">${getNpxInstallCommand(p)}</code>`,
                  ccHtml: `<code class="plugin-install" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${p.name}">${getPluginInstallCommand(p)}</code>`
                })
              : `<code class="plugin-install" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${p.name}">${getPluginInstallCommand(p)}</code>`}
            <a href="../${p.name}/" class="plugin-source" data-tinylytics-event="related.view-plugin" data-tinylytics-event-value="${p.name}">Details →</a>
          </div>
        </article>`;
}).join('\n')}
      </div>
    </section>`;
}

// Generate individual plugin page
function generatePluginPage(plugin) {
  const description = cleanDescription(plugin.description);
  const sourceUrl = getSourceUrl(plugin);
  const category = getCategoryForPlugin(plugin);
  const readme = getReadmeContent(plugin);
  const repo = getRepoName(plugin);
  let readmeHtml = markdownToHtml(readme);
  // Convert relative links to GitHub URLs using per-plugin repo
  readmeHtml = convertRepoLinks(readmeHtml, plugin.name, repo, {
    marketplacePlugins: marketplace.plugins,
    linkReport,
  });
  const isExternal = plugin.strict === true;

  const tags = (plugin.keywords || []).map(k =>
    `<span class="tag">${k}</span>`
  ).join('');

  // Structured data for the plugin
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": plugin.name,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Cross-platform",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "2389 Research Inc",
      "url": "https://2389.ai"
    },
    "description": description,
    "url": `${SITE_URL}/plugins/${plugin.name}/`,
    "downloadUrl": sourceUrl,
    "softwareVersion": plugin.version || "1.0.0",
    "license": "https://opensource.org/licenses/MIT",
    "datePublished": MARKETPLACE_LASTMOD,
    "dateModified": BUILD_DATE
  };

  // Build a descriptive title from the plugin name and category
  const pluginTitle = `${plugin.name} — ${category.title} Plugin for Claude Code`;

  return `<!DOCTYPE html>
<html lang="en">
${generateHead(pluginTitle, description, `plugins/${plugin.name}/`, plugin.keywords)}
<body>
  <div class="grid-overlay" aria-hidden="true"></div>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  ${generateNav(true)}

  <header class="plugin-hero">
    <div class="plugin-hero-inner">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../../">Marketplace</a>
        <span class="breadcrumb-sep">→</span>
        <a href="../../#plugins">${category.title}</a>
        <span class="breadcrumb-sep">→</span>
        <span class="breadcrumb-current">${plugin.name}</span>
      </nav>

      <div class="plugin-hero-header">
        <h1 class="plugin-hero-title">${plugin.name}</h1>
        <span class="plugin-hero-version">v${plugin.version || '1.0.0'}</span>
        ${isExternal ? '<span class="plugin-external-badge">External</span>' : ''}
      </div>

      <p class="plugin-hero-description">${description}</p>

      <div class="plugin-tags-large">${tags}</div>

      <div class="plugin-hero-actions">
        <div class="install-block">
          <span class="install-label">Install</span>
          ${pluginHasSkills(plugin)
            ? renderInstallTabs({
                group: plugin.name,
                npxHtml: `<code class="install-command" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}-npx">${getNpxInstallCommand(plugin)}</code>`,
                ccHtml: `<code class="install-command" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}">${getPluginInstallCommand(plugin)}</code>`
              })
            : `<code class="install-command" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}">${getPluginInstallCommand(plugin)}</code>`}
        </div>
        <a href="${sourceUrl}" class="cta-button" rel="noopener noreferrer" target="_blank" data-tinylytics-event="plugin.view-source" data-tinylytics-event-value="${plugin.name}">
          View Source
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  </header>

  <main id="main-content">
    ${readme ? `
    <section class="section readme-section">
      <div class="section-header">
        <span class="section-number">01</span>
        <div class="section-title-group">
          <h2 class="section-title">Documentation</h2>
          <p class="section-subtitle">Full plugin documentation and usage guide</p>
        </div>
      </div>

      <div class="readme-content">
        ${readmeHtml}
      </div>
    </section>
    ` : `
    <section class="section readme-section">
      <div class="section-header">
        <span class="section-number">01</span>
        <div class="section-title-group">
          <h2 class="section-title">About This Plugin</h2>
          <p class="section-subtitle">What this plugin provides</p>
        </div>
      </div>

      <div class="readme-content">
        <p>${description}</p>
        <p>For full documentation and usage examples, visit the <a href="${sourceUrl}" rel="noopener noreferrer" target="_blank">source repository</a>.</p>
      </div>
    </section>
    `}

    <section class="section quick-install-section">
      <div class="section-header">
        <span class="section-number">02</span>
        <div class="section-title-group">
          <h2 class="section-title">Quick Install</h2>
          <p class="section-subtitle">Get started in seconds</p>
        </div>
      </div>

      <div class="quick-start">
${generateQuickInstallSteps(plugin)}
      </div>
    </section>

    ${generateRelatedPlugins(plugin, category)}

    <section class="section back-section">
      <a href="../../" class="back-link">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to Marketplace
      </a>
    </section>
  </main>

  ${generateFooter(true)}

  <!-- Structured Data - Plugin -->
  <script type="application/ld+json">
  ${JSON.stringify(structuredData, null, 2)}
  </script>

  <!-- Structured Data - Breadcrumbs -->
  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "2389 Research",
        "item": "https://2389.ai"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Plugin Marketplace",
        "item": `${SITE_URL}/`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": plugin.name,
        "item": `${SITE_URL}/plugins/${plugin.name}/`
      }
    ]
  }, null, 2)}
  </script>

  ${generateInteractiveScript()}
</body>
</html>`;
}

// Count totals
const totalPlugins = marketplace.plugins.length;
const mcpServers = marketplace.plugins.filter(p =>
  p.keywords?.includes('mcp') ||
  p.source?.url?.includes('mcp') ||
  p.description?.toLowerCase().includes('mcp server')
).length || 3;

// Step list HTML for the homepage "Get Started in 30 Seconds" install tabs.
// Extracted so the renderInstallTabs call stays readable.
const npxGetStartedSteps = `<div class="quick-start-steps">
            <div class="step">
              <span class="step-number">1</span>
              <div class="step-content">
                <span class="step-label">Run it — works in any agent</span>
                <code>npx skills add 2389-research/better-dev</code>
              </div>
            </div>
            <div class="step">
              <span class="step-number">2</span>
              <div class="step-content">
                <span class="step-label">Pick your agents when prompted</span>
                <code>Claude Code, Cursor, Codex…</code>
              </div>
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <div class="step-content">
                <span class="step-label">That's it. Seriously.</span>
                <code>Skills auto-trigger when relevant</code>
              </div>
            </div>
          </div>`;

const ccGetStartedSteps = `<div class="quick-start-steps">
            <div class="step">
              <span class="step-number">1</span>
              <div class="step-content">
                <span class="step-label">Add the marketplace</span>
                <code>/plugin marketplace add 2389-research/claude-plugins</code>
              </div>
            </div>
            <div class="step">
              <span class="step-number">2</span>
              <div class="step-content">
                <span class="step-label">Grab what you need</span>
                <code>/plugin install better-dev@${MARKETPLACE_NAME}</code>
              </div>
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <div class="step-content">
                <span class="step-label">That's it. Seriously.</span>
                <code>Skills auto-trigger when relevant</code>
              </div>
            </div>
          </div>`;

// One category→hex map for the whole generator. Task 4 (rows/sections) and Task 7 (detail) reuse it.
const CAT_COLOR = { 'Development': '#e6196e', 'Infrastructure': '#c67514', 'Agent Systems': '#7a3fb0', 'Personal & Strategy': '#1f9e6b' };

function generateToolbar() {
  const total = marketplace.plugins.length;
  const chips = [['all', 'All', total, '#171512'],
    ...Object.values(categories).filter(c => c.plugins.length).map(c =>
      [c.title, c.title, c.plugins.length, CAT_COLOR[c.title] || '#e6196e'])];
  const chipHtml = chips.map(([val, label, n, color], i) =>
    `<button type="button" class="chip mono${i === 0 ? ' active' : ''}" data-cat="${val}" style="--chip:${color}">${label} (${n})</button>`
  ).join('\n        ');
  return `<div class="toolbar rule-t rule-b glass" role="search">
      <div class="toolbar-search">
        <span class="mono" aria-hidden="true">⌕</span>
        <input type="search" class="mono" data-search placeholder="Search names, tags, descriptions…" aria-label="Search skills" />
        <span class="mono" data-count>${total} of ${total} entries</span>
      </div>
      <div class="toolbar-chips">
        ${chipHtml}
        <button type="button" class="chip-cleartag mono" data-cleartag hidden></button>
      </div>
    </div>`;
}

function generateMasthead() {
  return `<header class="masthead">
    <div class="mast-bar mono rule-b">
      <span>2389 Research</span>
      <span>Agent Skills · Open Source</span>
      <span>Est. 2026</span>
    </div>
    <div class="hero-panel glass">
      <div class="kicker">A working index of</div>
      <h1 class="hero-head">Coding-agent <em>skills</em> &amp; servers</h1>
      <p class="hero-lede">A library of skills and MCP servers for the coding agents you already use — Claude Code, Codex, Cursor, and friends. Build workflows, testing regimes, agent architectures, and operational tooling. Each one is its own tool, doing one thing well. Install any of them with a single line.</p>
    </div>
    <div class="install-strip">
      <div class="cmd mono"><span class="dollar">$</span> npx skills add 2389-research/<span class="accent">&lt;name&gt;</span>
        <button type="button" class="btn-primary" data-copy="npx skills add 2389-research/&lt;name&gt;" data-tinylytics-event="hero.copy-install">Copy</button>
      </div>
      <a href="https://github.com/2389-research/claude-plugins" target="_blank" rel="noopener noreferrer" class="btn-ghost mono" data-tinylytics-event="nav.star-github">★ Star on GitHub</a>
    </div>
  </header>`;
}

// Generate main index HTML
const indexHtml = `<!DOCTYPE html>
<html lang="en">
${generateHead('Coding-agent Skills & Servers', 'A working index of coding-agent skills and MCP servers from 2389 Research — install any with one line.', '')}
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <canvas id="topo-bg" aria-hidden="true"></canvas>
  <div class="topo-fade" aria-hidden="true"></div>
  <div class="wrap">
    ${generateMasthead()}
    ${generateToolbar()}

    <main id="main-content" class="index-list">
      ${generateCategorySections()}
      <div class="empty-state" data-empty hidden>
        <div class="empty-big">Nothing here.</div>
        <div class="mono empty-sub">No entries match your filters.</div>
        <button type="button" class="mono btn-outline" data-reset>Clear filters</button>
      </div>
    </main>

  ${generateFooter(false)}

  <!-- Structured Data - Organization -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "2389 Research Inc",
    "url": "https://2389.ai",
    "logo": "https://2389.ai/logo.png",
    "description": "Building AI agents that collaborate like your dream team",
    "sameAs": [
      "https://github.com/2389-research",
      "https://www.linkedin.com/company/2389-research"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "hello@2389.ai",
      "contactType": "customer service"
    }
  }
  </script>

  <!-- Structured Data - Software Catalog -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "2389 Claude Code Plugin Marketplace",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Cross-platform",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "2389 Research Inc",
      "url": "https://2389.ai"
    },
    "description": "Open source Claude Code plugins and MCP servers for development workflows, testing, and AI agent capabilities",
    "url": "${SITE_URL}/",
    "downloadUrl": "https://github.com/2389-research/claude-plugins",
    "softwareVersion": "1.0.0",
    "license": "https://opensource.org/licenses/MIT",
    "datePublished": "${MARKETPLACE_LASTMOD}",
    "dateModified": "${BUILD_DATE}"
  }
  </script>

  <!-- Structured Data - Breadcrumbs -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "2389 Research",
        "item": "https://2389.ai"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Plugin Marketplace",
        "item": "${SITE_URL}/"
      }
    ]
  }
  </script>

  <!-- Structured Data - Plugin Catalog (ItemList) -->
  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Claude Code Plugins",
    "description": "Open source Claude Code plugins and MCP servers from 2389 Research",
    "numberOfItems": marketplace.plugins.length,
    "itemListElement": marketplace.plugins.map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": p.name,
      "url": `${SITE_URL}/plugins/${p.name}/`
    }))
  }, null, 2)}
  </script>

  ${generateInteractiveScript()}
</body>
</html>`;

// Write main files
fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/index.html', indexHtml);

// Generate individual plugin pages
fs.mkdirSync('docs/plugins', { recursive: true });
marketplace.plugins.forEach(plugin => {
  const pluginDir = `docs/plugins/${plugin.name}`;
  fs.mkdirSync(pluginDir, { recursive: true });
  fs.writeFileSync(`${pluginDir}/index.html`, generatePluginPage(plugin));
});

// Generate sitemap.xml with all pages (homepage, glossary, every plugin)
const sitemapUrls = [
  { loc: '', priority: '1.0', lastmod: MARKETPLACE_LASTMOD },
  { loc: 'glossary/', priority: '0.6', lastmod: BUILD_DATE },
  ...marketplace.plugins.map(p => ({ loc: `plugins/${p.name}/`, priority: '0.8', lastmod: MARKETPLACE_LASTMOD })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>
    <loc>${SITE_URL}/${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
fs.writeFileSync('docs/sitemap.xml', sitemap);

// Markdown sitemap for AI agents that prefer plain text
const sitemapMd = `# Sitemap

Pages on this site, for AI agents and other tools that prefer markdown over XML.

- [Plugin Marketplace](${SITE_URL}/) — homepage with the full plugin catalog
- [Glossary](${SITE_URL}/glossary/) — terms used across the marketplace
- [AGENTS.md](${SITE_URL}/AGENTS.md) — site overview for AI agents
- [llms.txt](${SITE_URL}/llms.txt) — structured site index per llmstxt.org

## Plugins

${marketplace.plugins.map(p => `- [${p.name}](${SITE_URL}/plugins/${p.name}/) — ${cleanDescription(p.description)}`).join('\n')}
`;
fs.writeFileSync('docs/sitemap.md', sitemapMd);

// robots.txt points at the live host
const robots = `# Robots.txt for 2389 Claude Code Plugin Marketplace
User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
Crawl-delay: 1
`;
fs.writeFileSync('docs/robots.txt', robots);

// llms.txt per the llmstxt.org spec — structured site index for AI agents
const llmsTxt = `# 2389 Research Claude Code Plugin Marketplace

> Open source Claude Code plugins and MCP servers from 2389 Research Inc. Development workflows, testing, system administration, and AI agent capabilities. Install with one command via the Claude Code plugin marketplace.

## Install a plugin

Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

\`\`\`
npx skills add 2389-research/<plugin>
\`\`\`

Or natively in Claude Code:

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
/plugin install <plugin>@${MARKETPLACE_NAME}
\`\`\`

${Object.values(categories).filter(c => c.plugins.length).map(cat =>
`## ${cat.title}

${cat.description}

${cat.plugins.map(p => `- [${p.name}](${SITE_URL}/plugins/${p.name}/): ${cleanDescription(p.description)}`).join('\n')}`
).join('\n\n')}

## Reference

- [Sitemap](${SITE_URL}/sitemap.md)
- [Glossary](${SITE_URL}/glossary/)
- [Source repository](https://github.com/2389-research/claude-plugins)
- [Claude Code documentation](https://docs.claude.com/en/docs/claude-code)
`;
fs.writeFileSync('docs/llms.txt', llmsTxt);

// AGENTS.md — site-level guide for AI agents, plus the a14y config block
const agentsMd = `# Agents guide — 2389 Research Claude Code Plugin Marketplace

This site is the official catalog of Claude Code plugins and MCP servers from 2389 Research Inc. It is generated from \`.claude-plugin/marketplace.json\` in [2389-research/claude-plugins](https://github.com/2389-research/claude-plugins).

## What's here

- The homepage at [${SITE_URL}/](${SITE_URL}/) lists every plugin grouped into Development, Infrastructure, Agent Systems, and Personal & Strategy.
- Each plugin has its own page under \`/plugins/{name}/\` with the full README, install command, and source link.
- A [glossary](${SITE_URL}/glossary/) defines marketplace-specific terms (plugin, skill, MCP server, hook, scorecard).
- Machine-readable index files: [sitemap.xml](${SITE_URL}/sitemap.xml), [sitemap.md](${SITE_URL}/sitemap.md), [llms.txt](${SITE_URL}/llms.txt).
- Every HTML page advertises a markdown mirror via \`<link rel="alternate" type="text/markdown" href="…/index.md">\`. Fetch the \`index.md\` URL directly for the markdown copy.

## Install a plugin

Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

\`\`\`
npx skills add 2389-research/<plugin-name>
\`\`\`

Or natively in Claude Code:

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
/plugin install <plugin-name>@${MARKETPLACE_NAME}
\`\`\`

(MCP servers — ${marketplace.plugins.filter((p) => p.strict === true).map((p) => p.name).join(', ')} — install via Claude Code only; they ship no skills for npx.)

## a14y configuration

- Target URL: ${SITE_URL}/
- Scorecard: 0.2.0
- Mode: site
- Last runs:
  - 2026-05-19 — 82 (scorecard 0.2.0)
  - 2026-05-19 — 67 (scorecard 0.2.0, baseline)
`;
fs.writeFileSync('docs/AGENTS.md', agentsMd);

// Per-page markdown mirrors — homepage + every plugin
function homepageMarkdown() {
  const catBlocks = Object.values(categories).filter(c => c.plugins.length).map(cat =>
`## ${cat.title}

${cat.description}

${cat.plugins.map(p => `- [${p.name}](${SITE_URL}/plugins/${p.name}/) — ${cleanDescription(p.description)}`).join('\n')}`
  ).join('\n\n');

  return `# 2389 Research Claude Code Plugin Marketplace

> Open source Claude Code plugins and MCP servers from 2389 Research Inc.

## Install

Default — any agent via [npx skills](https://github.com/vercel-labs/skills):

\`\`\`
npx skills add 2389-research/<plugin>
\`\`\`

Or natively in Claude Code:

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
\`\`\`

${catBlocks}

## Reference

- [AGENTS.md](${SITE_URL}/AGENTS.md)
- [llms.txt](${SITE_URL}/llms.txt)
- [sitemap.md](${SITE_URL}/sitemap.md)
- [Glossary](${SITE_URL}/glossary/)
- [Source](https://github.com/2389-research/claude-plugins)
`;
}
fs.writeFileSync('docs/index.md', homepageMarkdown());

function pluginMarkdown(plugin) {
  const description = cleanDescription(plugin.description);
  const sourceUrl = getSourceUrl(plugin);
  const readme = getReadmeContent(plugin) || '';
  return `# ${plugin.name}

> ${description}

- **Version:** ${plugin.version || '1.0.0'}
- **Source:** ${sourceUrl}

## Install

${pluginHasSkills(plugin) ? `Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

\`\`\`
${getNpxInstallCommand(plugin)}
\`\`\`

Or natively in Claude Code:

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
${getPluginInstallCommand(plugin)}
\`\`\`` : `This is an MCP server — install it in Claude Code:

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
${getPluginInstallCommand(plugin)}
\`\`\``}

## README

${readme || `See ${sourceUrl} for full documentation.`}
`;
}
marketplace.plugins.forEach(plugin => {
  fs.writeFileSync(`docs/plugins/${plugin.name}/index.md`, pluginMarkdown(plugin));
});

// Glossary page (HTML + markdown mirror) — resolves html.glossary-link site-wide
const GLOSSARY_TERMS = [
  ['Plugin', 'A bundle of skills, slash commands, hooks, and/or MCP servers distributed as a single unit. Installed in Claude Code via <code>/plugin install</code>.'],
  ['Skill', 'A self-contained capability — instructions plus optional supporting files — that Claude can invoke for specific tasks. Lives under <code>skills/</code> in a plugin.'],
  ['Marketplace', 'A catalog of plugins. This site is the marketplace for 2389 Research plugins. Added in Claude Code with <code>/plugin marketplace add &lt;repo&gt;</code>.'],
  ['MCP server', 'Model Context Protocol server. Exposes tools, resources, and prompts to Claude over a standard protocol. Some plugins ship MCP servers; others integrate with existing ones.'],
  ['Hook', 'A shell command Claude Code executes in response to events such as tool calls or session start. Configured in <code>settings.json</code>.'],
  ['Slash command', 'A user-invocable command typed in Claude Code as <code>/&lt;name&gt;</code>. Slash commands are defined inside skills or as standalone files in a plugin.'],
  ['Scorecard', 'A versioned set of automated checks. The a14y scorecard, for example, rates how readable this site is for AI agents.'],
];

const glossaryStructuredData = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "name": "Marketplace Glossary",
  "url": `${SITE_URL}/glossary/`,
  "datePublished": MARKETPLACE_LASTMOD,
  "dateModified": BUILD_DATE,
  "hasDefinedTerm": GLOSSARY_TERMS.map(([term, definition]) => ({
    "@type": "DefinedTerm",
    "name": term,
    "description": definition.replace(/<[^>]+>/g, ''),
  })),
}, null, 2);

const glossaryHtml = `<!DOCTYPE html>
<html lang="en">
${generateHead('Glossary', 'Marketplace-specific terms: plugin, skill, MCP server, hook, slash command, scorecard.', 'glossary/', ['glossary', 'terminology'])}
<body>
  <div class="grid-overlay" aria-hidden="true"></div>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  ${generateNav(true)}

  <header class="plugin-hero">
    <div class="plugin-hero-inner">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../">Marketplace</a>
        <span class="breadcrumb-sep">→</span>
        <span class="breadcrumb-current">Glossary</span>
      </nav>

      <div class="plugin-hero-header">
        <h1 class="plugin-hero-title">Glossary</h1>
      </div>

      <p class="plugin-hero-description">Terms used across the 2389 Research plugin marketplace.</p>
    </div>
  </header>

  <main id="main-content">
    <section class="section readme-section">
      <div class="section-header">
        <span class="section-number">01</span>
        <div class="section-title-group">
          <h2 class="section-title">Definitions</h2>
          <p class="section-subtitle">What things mean on this site</p>
        </div>
      </div>

      <div class="readme-content">
        <dl>
${GLOSSARY_TERMS.map(([term, definition]) => `          <dt><strong>${term}</strong></dt>
          <dd>${definition}</dd>`).join('\n')}
        </dl>
      </div>
    </section>

    <section class="section back-section">
      <a href="../" class="back-link">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to Marketplace
      </a>
    </section>
  </main>

  ${generateFooter(true)}

  <script type="application/ld+json">
  ${glossaryStructuredData}
  </script>
</body>
</html>`;

fs.mkdirSync('docs/glossary', { recursive: true });
fs.writeFileSync('docs/glossary/index.html', glossaryHtml);

const glossaryMd = `# Glossary

Terms used across the 2389 Research plugin marketplace.

${GLOSSARY_TERMS.map(([term, definition]) => `## ${term}\n\n${definition.replace(/<[^>]+>/g, '')}`).join('\n\n')}

[Back to marketplace](${SITE_URL}/)
`;
fs.writeFileSync('docs/glossary/index.md', glossaryMd);

console.log('✓ Generated docs/index.html');
console.log(`✓ Generated ${marketplace.plugins.length} plugin pages in docs/plugins/`);
console.log('✓ Generated docs/glossary/index.html');
console.log('✓ Generated docs/sitemap.xml + sitemap.md');
console.log('✓ Generated docs/llms.txt + AGENTS.md');
console.log('✓ Generated docs/robots.txt');
console.log(`✓ Generated ${marketplace.plugins.length + 2} markdown mirrors (index.md)`);
console.log(`✓ ${totalPlugins} plugins across ${Object.values(categories).filter(c => c.plugins.length > 0).length} categories`);

// Report link conversion results
if (linkReport.converted.length > 0) {
  console.log(`\n✓ Converted ${linkReport.converted.length} relative links to GitHub URLs`);
}

if (linkReport.broken.length > 0) {
  console.log(`\n⚠ Found ${linkReport.broken.length} broken link(s):`);
  linkReport.broken.forEach(({ plugin, path, reason }) => {
    console.log(`  - ${plugin}: ${path}`);
    console.log(`    ${reason}`);
  });
}

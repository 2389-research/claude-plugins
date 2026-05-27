// ABOUTME: Generates the marketplace landing page and individual plugin pages from marketplace.json
// ABOUTME: Outputs 2389-branded design with SEO, structured data, and accessibility

const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

// Read marketplace.json
const marketplace = JSON.parse(
  fs.readFileSync('.claude-plugin/marketplace.json', 'utf8')
);

const INTERNAL_MARKETPLACE_COMMAND = '/plugin marketplace add 2389-research/claude-plugins';
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

// Convert relative repo links to GitHub URLs using per-plugin repos
function convertRepoLinks(html, pluginName, repoName) {
  if (!html) return html;

  const repo = repoName || `2389-research/${pluginName}`;

  // Match <a href="..."> where href is a relative path to .md file or directory
  // Covers: known dirs (skills/, docs/, tests/, hooks/), any root-level .md file
  // (CLAUDE.md, README.md, ROADMAP.md, ARCHITECTURE.md, CONTRIBUTING.md, etc.),
  // and parent-relative paths.
  return html.replace(
    /<a href="(\.?\.?\/?)((?:skills|docs|tests|hooks)(?:\/[^"]+)?|[^"\/]+\.md|\.\.\/?[^"]*)"([^>]*)>([^<]*)<\/a>/g,
    (match, prefix, linkPath, attrs, linkText) => {
      // Normalize the path
      let normalizedPath = linkPath.replace(/^\.\//, '');

      // Handle cross-plugin links (../other-plugin/) by linking to marketplace pages
      if (normalizedPath.startsWith('../')) {
        const crossPluginMatch = normalizedPath.match(/^\.\.\/([^/]+)\/?(.*)$/);
        if (crossPluginMatch) {
          const [, otherPlugin] = crossPluginMatch;
          // Check if the other plugin exists in the marketplace
          const otherExists = marketplace.plugins.some(p => p.name === otherPlugin);
          if (otherExists) {
            linkReport.converted.push({
              plugin: pluginName,
              from: linkPath,
              to: `../${otherPlugin}/`
            });
            return `<a href="../${otherPlugin}/"${attrs}>${linkText}</a>`;
          } else {
            linkReport.broken.push({
              plugin: pluginName,
              path: linkPath,
              reason: 'Cross-plugin target not found in marketplace'
            });
            return `<span class="broken-link" title="Link target not found">${linkText}</span>`;
          }
        }
      }

      // Determine URL type heuristically: paths with extensions are blobs, others are trees
      const hasExtension = /\.\w+$/.test(normalizedPath);
      const urlType = hasExtension ? 'blob' : 'tree';
      const githubUrl = `https://github.com/${repo}/${urlType}/main/${normalizedPath}`;
      linkReport.converted.push({
        plugin: pluginName,
        from: linkPath,
        to: githubUrl
      });
      return `<a href="${githubUrl}"${attrs} target="_blank">${linkText}</a>`;
    }
  );
}

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
  const baseKeywords = ['Claude Code', 'plugins', 'MCP servers', 'AI development', 'Claude', 'Anthropic', 'development tools', '2389 Research'];
  const allKeywords = extraKeywords ? [...new Set([...extraKeywords, ...baseKeywords])] : baseKeywords;
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>${title} | 2389 Research</title>
  <meta name="title" content="${title} | 2389 Research">
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
  <meta property="og:title" content="${title} | 2389 Research">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${SITE_URL}/${canonicalPath}og-image.png">
  <meta property="og:site_name" content="2389 Research Plugin Marketplace">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${SITE_URL}/${canonicalPath}">
  <meta property="twitter:title" content="${title} | 2389 Research">
  <meta property="twitter:description" content="${description}">
  <meta property="twitter:image" content="${SITE_URL}/${canonicalPath}og-image.png">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔌</text></svg>">

  <!-- Preconnect for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="dns-prefetch" href="https://github.com">

  <!-- Fonts with display=swap for performance -->
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">

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

// Helper to generate plugin card HTML
function generatePluginCard(plugin) {
  const sourceUrl = getSourceUrl(plugin);
  const description = cleanDescription(plugin.description);
  const tags = (plugin.keywords || []).slice(0, 3).map(k =>
    `<span class="tag">${k}</span>`
  ).join('');

  return `
            <article class="plugin-card">
              <div class="plugin-card-header">
                <a href="plugins/${plugin.name}/" class="plugin-name-link" data-tinylytics-event="plugin.view-details" data-tinylytics-event-value="${plugin.name}">
                  <h4 class="plugin-name">${plugin.name}</h4>
                </a>
                <span class="plugin-version">v${plugin.version || '1.0.0'}</span>
              </div>
              <p class="plugin-description">${description}</p>
              <div class="plugin-tags">${tags}</div>
              <div class="plugin-footer${pluginHasSkills(plugin) ? ' plugin-footer-tabs' : ''}">
                ${pluginHasSkills(plugin)
                  ? renderInstallTabs({
                      group: `card-${plugin.name}`,
                      npxHtml: `<code class="plugin-install" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}-npx">${getNpxInstallCommand(plugin)}</code>`,
                      ccHtml: `<code class="plugin-install" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}">${getPluginInstallCommand(plugin)}</code>`
                    })
                  : `<code class="plugin-install" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}">${getPluginInstallCommand(plugin)}</code>`}
                <a href="plugins/${plugin.name}/" class="plugin-source" data-tinylytics-event="plugin.view-details" data-tinylytics-event-value="${plugin.name}">Details →</a>
              </div>
            </article>`;
}

function getPluginInstallCommand(plugin) {
  return `/plugin install 2389-research/${plugin.name}`;
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
  return Object.values(categories)
    .filter(cat => cat.plugins.length > 0)
    .map(cat => `
        <div class="category">
          <div class="category-header">
            <h3 class="category-title">
              <span class="category-indicator"></span>
              ${cat.title}
            </h3>
            <span class="category-count">${cat.plugins.length} plugin${cat.plugins.length !== 1 ? 's' : ''}</span>
          </div>
          <p class="category-description">${cat.description}</p>

          <div class="plugins-grid">
${cat.plugins.map(generatePluginCard).join('\n')}
          </div>
        </div>`
    ).join('\n');
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
  readmeHtml = convertRepoLinks(readmeHtml, plugin.name, repo);
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
                <code>/plugin install 2389-research/better-dev</code>
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

// Generate main index HTML
const indexHtml = `<!DOCTYPE html>
<html lang="en">
${generateHead('Claude Code Plugin Marketplace', 'Open source Claude Code plugins and MCP servers from 2389 Research. Development workflows, testing, system administration, and AI agent capabilities. Install with one command.', '')}
<body>
  <div class="grid-overlay" aria-hidden="true"></div>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  ${generateNav(false)}

  <header class="hero">
    <div class="hero-inner">
      <div class="hero-label">
        <span class="label-indicator"></span>
        Welcome, Fellow Builder
      </div>
      <h1 class="hero-title">Plugins that actually<br>get stuff done</h1>
      <p class="hero-subtitle">Open source Claude Code plugins and MCP servers from 2389 Research. The tools we use every day to build, ship, and not lose our minds. No corporate handbook energy here.</p>

      <div class="hero-cta">
        <div class="install-block">
          <span class="install-label">Install</span>
          ${renderInstallTabs({
            group: 'hero',
            npxHtml: `<code class="install-command">npx skills add 2389-research/&lt;plugin&gt;</code>`,
            ccHtml: `<code class="install-command">${INTERNAL_MARKETPLACE_COMMAND}</code>`
          })}
        </div>
        <a href="#plugins" class="cta-button">
          Browse the Goods
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>

      <div class="hero-stats">
        <div class="stat">
          <span class="stat-value">${totalPlugins}</span>
          <span class="stat-label">Plugins</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">${mcpServers}</span>
          <span class="stat-label">MCP Servers</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">100%</span>
          <span class="stat-label">Open Source</span>
        </div>
      </div>
    </div>
  </header>

  <main id="main-content">
    <section id="plugins" class="section plugins-section">
      <div class="section-header">
        <span class="section-number">01</span>
        <div class="section-title-group">
          <h2 class="section-title">Available Plugins</h2>
          <p class="section-subtitle">Install individually or add the full marketplace</p>
        </div>
      </div>
      <div class="plugin-categories">
${generateCategorySections()}
      </div>
    </section>

    <section id="about" class="section about-section">
      <div class="section-header">
        <span class="section-number">02</span>
        <div class="section-title-group">
          <h2 class="section-title">About This Marketplace</h2>
          <p class="section-subtitle">Open source tools from 2389 Research</p>
        </div>
      </div>

      <div class="about-grid">
        <div class="about-content">
          <p>A collection of Claude Code plugins and MCP servers from <a href="https://2389.ai">2389 Research Inc</a>. We're building a world where AI agents collaborate like your dream team — and these are the tools that help us get there.</p>
          <p>All plugins are open source. Use them, fork them, contribute back. We'd love to hear how you're using them. (No corporate fine print, we promise.)</p>

          <div class="about-links">
            <a href="https://github.com/2389-research/claude-plugins" class="about-link" rel="noopener noreferrer" target="_blank">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" fill="currentColor"/>
              </svg>
              View on GitHub
            </a>
            <a href="mailto:hello@2389.ai" class="about-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              hello@2389.ai
            </a>
          </div>
        </div>

        <div class="quick-start">
          <h3 class="quick-start-title">Get Started in 30 Seconds</h3>
          ${renderInstallTabs({
            group: 'getstarted',
            npxHtml: npxGetStartedSteps,
            ccHtml: ccGetStartedSteps
          })}
        </div>
      </div>
    </section>

    <section class="section resources-section">
      <div class="section-header">
        <span class="section-number">03</span>
        <div class="section-title-group">
          <h2 class="section-title">Learn More</h2>
          <p class="section-subtitle">The official docs (for when you want to go deeper)</p>
        </div>
      </div>

      <div class="resources-grid">
        <a href="https://docs.claude.com/en/docs/claude-code" class="resource-card">
          <h4>Claude Code Docs</h4>
          <p>Official documentation for Claude Code CLI</p>
        </a>
        <a href="https://docs.claude.com/en/docs/claude-code/skills" class="resource-card">
          <h4>Skills Guide</h4>
          <p>How to create and use Claude Code skills</p>
        </a>
        <a href="https://docs.claude.com/en/docs/claude-code/plugins" class="resource-card">
          <h4>Plugin Development</h4>
          <p>Build your own Claude Code plugins</p>
        </a>
        <a href="https://docs.claude.com/en/docs/claude-code/mcp" class="resource-card">
          <h4>MCP Servers</h4>
          <p>Model Context Protocol server documentation</p>
        </a>
      </div>
    </section>

    <section class="section star-cta-section">
      <div class="star-cta-card">
        <h3 class="star-cta-title">Found something useful?</h3>
        <p class="star-cta-text">A star helps others discover these tools. It takes one second and means a lot to us.</p>
        <a href="https://github.com/2389-research/claude-plugins" class="cta-button" rel="noopener noreferrer" target="_blank">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>
          Star on GitHub
        </a>
      </div>
    </section>
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

## Install the marketplace

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
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

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
/plugin install 2389-research/<plugin-name>
\`\`\`

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
- **Install:** \`${getPluginInstallCommand(plugin)}\`

## Install via marketplace

\`\`\`
${INTERNAL_MARKETPLACE_COMMAND}
${getPluginInstallCommand(plugin)}
\`\`\`

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

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

// Escape a plain-text string for interpolation into HTML (attributes or text).
// Never apply to Markdown/plain-text mirrors or already-rendered HTML.
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Common HTML head
function generateHead(title, description, canonicalPath, extraKeywords) {
  const baseKeywords = ['coding agent skills', 'Claude Code', 'MCP servers', 'Codex', 'Cursor', 'AI development', 'Anthropic', '2389 Research'];
  const allKeywords = extraKeywords ? [...new Set([...extraKeywords, ...baseKeywords])] : baseKeywords;
  const escapedTitle = escapeHtml(title);
  const escapedDesc = escapeHtml(description);
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>${escapedTitle} | 2389 Research</title>
  <meta name="title" content="${escapedTitle} | 2389 Research">
  <meta name="description" content="${escapedDesc}">
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
  <meta property="og:description" content="${escapedDesc}">
  <meta property="og:image" content="${SITE_URL}/${canonicalPath}og-image.png">
  <meta property="og:site_name" content="2389 Research Plugin Marketplace">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${SITE_URL}/${canonicalPath}">
  <meta property="twitter:title" content="${escapedTitle} | 2389 Research">
  <meta property="twitter:description" content="${escapedDesc}">
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

// Common footer
function generateFooter(homePrefix = '') {
  const home = homePrefix;
  const year = new Date().getFullYear();
  return `<footer class="colophon rule-t glass">
      <span class="mono">© ${year} 2389 Research Inc — all plugins open source</span>
      <span class="colophon-links mono">
        <a href="https://github.com/2389-research/claude-plugins" target="_blank" rel="noopener noreferrer" data-tinylytics-event="footer.company" data-tinylytics-event-value="github">GitHub</a>
        <a href="https://docs.claude.com/en/docs/claude-code/skills" target="_blank" rel="noopener noreferrer" data-tinylytics-event="footer.resource" data-tinylytics-event-value="skills-guide">Skills Guide</a>
        <a href="${home}glossary/" data-tinylytics-event="footer.resource" data-tinylytics-event-value="glossary">Glossary</a>
        <a href="https://2389.ai" target="_blank" rel="noopener noreferrer" data-tinylytics-event="footer.company" data-tinylytics-event-value="about">2389.ai</a>
      </span>
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
  return `<a href="plugins/${plugin.name}/" class="skill-row" data-skill-row data-name="${plugin.name}" data-desc="${escapeHtml(desc)}" data-tags="${tags.join(',')}" data-cat="${catTitle}" data-tinylytics-event="plugin.view-details" data-tinylytics-event-value="${plugin.name}">
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


// Shared interactive <script>: copy-to-clipboard, search/filter, topo background.
// Used by both the homepage and every plugin page.
function generateInteractiveScript() {
  return `<script>
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
  (function topo(){
    var canvas = document.getElementById('topo-bg');
    if (!canvas || !window.THREE) { if (!window.__topoTries) window.__topoTries = 0; if (window.__topoTries++ < 40) setTimeout(topo, 120); return; }
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var THREE = window.THREE, scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 3.2, 10.5);
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 2.05, 3.15); camera.lookAt(0, -0.15, -1.6);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    var SEG = 108, SIZE = 18;
    var geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG); geo.rotateX(-Math.PI/2);
    var base = geo.attributes.position.array.slice();
    scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xe6196e, wireframe: true, transparent: true, opacity: 0.16 })));
    var m2 = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x171512, wireframe: true, transparent: true, opacity: 0.05 })); m2.position.y = 0.012; scene.add(m2);
    var p = [0,1,2,3].map(function(i){ return i * 1.7; });
    var H = function(x,z,t){ return Math.sin(x*0.55+t+p[0])*0.55 + Math.cos(z*0.42-t*0.75+p[1])*0.5 + Math.sin((x+z)*0.30+t*0.6+p[2])*0.42 + Math.sin(x*0.16-z*0.22+t*0.35+p[3])*0.7; };
    var pos = geo.attributes.position;
    function resize(){ var w = canvas.clientWidth||innerWidth, h = canvas.clientHeight||innerHeight; renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
    addEventListener('resize', resize); resize();
    var start = performance.now();
    function frame(){ var t = reduce ? 6.2 : (performance.now()-start)*0.00035; for (var i=0;i<pos.count;i++){ var x=base[i*3], z=base[i*3+2]; var y=H(x,z,t); var edge=1-Math.min(1,(Math.abs(x)+Math.abs(z))/15); pos.array[i*3+1]=y*(0.35+edge*0.9); } pos.needsUpdate=true; renderer.render(scene,camera); if(!reduce) requestAnimationFrame(frame); }
    frame();
  })();
  </script>`;
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
  return `<section class="related rule-t">
      <div class="mono related-label">More from ${category.title}</div>
      <ul class="related-list">
        ${related.map(p => `<li><a href="../${p.name}/" data-tinylytics-event="related.view-plugin" data-tinylytics-event-value="${p.name}"><span class="mono related-name">${p.name}</span><span class="related-desc">${escapeHtml(cleanDescription(p.description))}</span></a></li>`).join('\n        ')}
      </ul>
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

  // `category` is already declared at the top of generatePluginPage — REUSE it (do NOT add `const cat`; correction #2).
  const catColor = CAT_COLOR[category.title] || '#e6196e';
  const isMcp = !pluginHasSkills(plugin);
  const allPlugins = marketplace.plugins;
  const idx = allPlugins.findIndex(p => p.name === plugin.name);
  const prev = idx > 0 ? allPlugins[idx - 1] : null;
  const next = idx < allPlugins.length - 1 ? allPlugins[idx + 1] : null;
  const tagHtml = (plugin.keywords || []).slice(0, 6).map(t =>
    `<a href="../../" class="tag-btn mono" data-tinylytics-event="plugin.tag" data-tinylytics-event-value="${t}">#${t}</a>`
  ).join(' ');
  const npxBlock = isMcp ? '' : `
          <div class="mono install-label">Install — npx (any agent)</div>
          <div class="install-box">
            <code class="mono">${getNpxInstallCommand(plugin)}</code>
            <button type="button" class="btn-primary" data-copy="${getNpxInstallCommand(plugin)}" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}-npx">Copy</button>
          </div>`;

  return `<!DOCTYPE html>
<html lang="en">
${generateHead(plugin.name, description, `plugins/${plugin.name}/`, plugin.keywords)}
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <canvas id="topo-bg" aria-hidden="true"></canvas>
  <div class="topo-fade" aria-hidden="true"></div>
  <div class="wrap detail">
    <div class="detail-topbar mono rule-b">
      <a href="../../" data-tinylytics-event="nav.home">← All skills</a>
      <span>2389 Research · Agent Skills</span>
    </div>
    <header class="detail-head">
      <div class="detail-kicker mono" style="color:${catColor}">${category.title}${isMcp ? ' · <span class="mcp-badge">MCP SERVER</span>' : ''}</div>
      <div class="detail-title-row">
        <h1 class="detail-name mono">${plugin.name}</h1>
        <span class="detail-ver mono">v${plugin.version || '1.0.0'}</span>
      </div>
      <p class="detail-lede">${escapeHtml(description)}</p>
      <div class="row-tags">${tagHtml}</div>
      ${npxBlock}
      <div class="mono install-label">Install — Claude Code</div>
      <div class="install-box">
        <code class="mono">${getPluginInstallCommand(plugin)}</code>
        <button type="button" class="btn-ghost-sm mono" data-copy="${getPluginInstallCommand(plugin)}" data-tinylytics-event="plugin.copy-install" data-tinylytics-event-value="${plugin.name}">Copy</button>
      </div>
    </header>
    <main id="main-content" class="readme-body">
      ${readme ? readmeHtml : `<p>${escapeHtml(description)}</p>`}
    </main>
    <nav class="detail-nav mono rule-t" aria-label="Skill navigation">
      ${prev ? `<a href="../${prev.name}/" data-tinylytics-event="plugin.prev">← ${prev.name}</a>` : '<span></span>'}
      ${next ? `<a href="../${next.name}/" data-tinylytics-event="plugin.next">${next.name} →</a>` : '<span></span>'}
    </nav>
    ${generateRelatedPlugins(plugin, category)}
    ${generateFooter('../../')}
  </div>
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

  ${generateFooter('')}
  </div><!-- /.wrap -->

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
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <canvas id="topo-bg" aria-hidden="true"></canvas>
  <div class="topo-fade" aria-hidden="true"></div>
  <div class="wrap">
    <div class="mast-bar mono rule-b" style="padding-top:52px">
      <a href="../">← All skills</a>
      <span>Glossary · 2389 Research</span>
    </div>
    <header class="glossary-head glass">
      <div class="kicker">Reference</div>
      <h1 class="hero-head" style="font-size:clamp(40px,6vw,72px)">Glossary</h1>
      <p class="hero-lede">Terms you'll meet across coding-agent skills and MCP servers.</p>
    </header>
    <main id="main-content" class="glossary-list">
      ${GLOSSARY_TERMS.map(([term, definition]) => `<section class="glossary-term">
        <h2 class="mono">${term}</h2>
        <p>${definition}</p>
      </section>`).join('\n')}
    </main>
    ${generateFooter('../')}
  </div>
  <script type="application/ld+json">
  ${glossaryStructuredData}
  </script>
  ${generateInteractiveScript()}
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

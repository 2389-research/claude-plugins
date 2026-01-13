// ABOUTME: Generates the marketplace landing page and individual plugin pages from marketplace.json
// ABOUTME: Outputs 2389-branded design with SEO, structured data, and accessibility

const fs = require('fs');
const path = require('path');

// Read marketplace.json
const marketplace = JSON.parse(
  fs.readFileSync('.claude-plugin/marketplace.json', 'utf8')
);

// Group plugins by category
const categories = {
  meta: { title: 'Meta Plugins', description: 'Bundles that combine multiple capabilities into single installs', plugins: [] },
  development: { title: 'Development', description: 'Workflows for building, testing, and shipping code', plugins: [] },
  infrastructure: { title: 'Infrastructure', description: 'System administration and operational tooling', plugins: [] },
  agents: { title: 'Agent Systems', description: 'Multi-agent architecture and agent capabilities', plugins: [] },
  personal: { title: 'Personal & Strategy', description: 'Reflection frameworks and personal operating systems', plugins: [] }
};

// Categorize plugins
marketplace.plugins.forEach(plugin => {
  const keywords = plugin.keywords || [];
  const desc = plugin.description.toLowerCase();

  if (plugin.description.startsWith('[meta]') || keywords.includes('meta')) {
    categories.meta.plugins.push(plugin);
  } else if (keywords.includes('multi-agent') || keywords.includes('agents') || keywords.includes('social') || desc.includes('agent')) {
    categories.agents.plugins.push(plugin);
  } else if (keywords.includes('ceo') || keywords.includes('executive') || keywords.includes('worldview') || keywords.includes('journal') || keywords.includes('reflection')) {
    categories.personal.plugins.push(plugin);
  } else if (keywords.includes('linux') || keywords.includes('sysadmin') || keywords.includes('terminal') || keywords.includes('reverse-engineering') || keywords.includes('maintenance')) {
    categories.infrastructure.plugins.push(plugin);
  } else {
    categories.development.plugins.push(plugin);
  }
});

// Get category for a plugin
function getCategoryForPlugin(plugin) {
  const keywords = plugin.keywords || [];
  const desc = plugin.description.toLowerCase();

  if (plugin.description.startsWith('[meta]') || keywords.includes('meta')) {
    return categories.meta;
  } else if (keywords.includes('multi-agent') || keywords.includes('agents') || keywords.includes('social') || desc.includes('agent')) {
    return categories.agents;
  } else if (keywords.includes('ceo') || keywords.includes('executive') || keywords.includes('worldview') || keywords.includes('journal') || keywords.includes('reflection')) {
    return categories.personal;
  } else if (keywords.includes('linux') || keywords.includes('sysadmin') || keywords.includes('terminal') || keywords.includes('reverse-engineering') || keywords.includes('maintenance')) {
    return categories.infrastructure;
  } else {
    return categories.development;
  }
}

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

// Convert markdown to basic HTML
function markdownToHtml(md) {
  if (!md) return '';

  return md
    // Code blocks first (before inline code)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headers
    .replace(/^### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^## (.*$)/gm, '<h3>$1</h3>')
    .replace(/^# (.*$)/gm, '<h2>$1</h2>')
    // Bold and italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>')
    // Lists
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Paragraphs (simple approach)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[huplo])/gm, '<p>')
    .replace(/(<p>)+/g, '<p>')
    .replace(/(<\/p>)+/g, '</p>')
    // Clean up empty paragraphs
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<p>(<[huplo])/g, '$1')
    .replace(/(<\/[huplo].*>)<\/p>/g, '$1');
}

// Helper to get source URL
function getSourceUrl(plugin) {
  if (typeof plugin.source === 'string') {
    return `https://github.com/2389-research/claude-plugins/tree/main/${plugin.source.replace('./', '')}`;
  } else if (plugin.source?.url) {
    return plugin.source.url;
  }
  return `https://github.com/2389-research/claude-plugins`;
}

// Clean description
function cleanDescription(desc) {
  return desc.startsWith('[meta]') ? desc.substring(7).trim() : desc;
}

// Common HTML head
function generateHead(title, description, canonicalPath) {
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>${title} | 2389 Research</title>
  <meta name="title" content="${title} | 2389 Research">
  <meta name="description" content="${description}">
  <meta name="keywords" content="Claude Code, plugins, MCP servers, AI development, Claude, Anthropic, development tools, 2389 Research">
  <meta name="author" content="2389 Research Inc">
  <meta name="robots" content="index, follow">

  <!-- Canonical URL -->
  <link rel="canonical" href="https://2389-research.github.io/claude-plugins/${canonicalPath}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://2389-research.github.io/claude-plugins/${canonicalPath}">
  <meta property="og:title" content="${title} | 2389 Research">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="https://2389-research.github.io/claude-plugins/og-image.png">
  <meta property="og:site_name" content="2389 Research Plugin Marketplace">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://2389-research.github.io/claude-plugins/${canonicalPath}">
  <meta property="twitter:title" content="${title} | 2389 Research">
  <meta property="twitter:description" content="${description}">
  <meta property="twitter:image" content="https://2389-research.github.io/claude-plugins/og-image.png">

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
  <script src="https://tinylytics.app/embed/5QhFsgM-mdxovUNCvS-o.js" defer></script>
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
        <a href="https://github.com/2389-research/claude-plugins" class="nav-link" role="menuitem" rel="noopener noreferrer" target="_blank">GitHub</a>
        <a href="https://2389.ai" class="nav-link" role="menuitem" rel="noopener noreferrer" target="_blank">2389.ai</a>
      </div>
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
          <a href="https://2389.ai">About Us</a>
          <a href="https://github.com/2389-research/claude-plugins">GitHub</a>
          <a href="mailto:hello@2389.ai">Contact</a>
        </div>
        <div class="footer-column">
          <h5>Resources</h5>
          <a href="https://docs.claude.com/en/docs/claude-code">Claude Code Docs</a>
          <a href="https://docs.claude.com/en/docs/claude-code/skills">Skills Guide</a>
          <a href="https://docs.claude.com/en/docs/claude-code/plugins">Plugin Development</a>
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
                <a href="plugins/${plugin.name}/" class="plugin-name-link">
                  <h4 class="plugin-name">${plugin.name}</h4>
                </a>
                <span class="plugin-version">v${plugin.version || '1.0.0'}</span>
              </div>
              <p class="plugin-description">${description}</p>
              <div class="plugin-tags">${tags}</div>
              <div class="plugin-footer">
                <code class="plugin-install">/plugin install ${plugin.name}</code>
                <a href="plugins/${plugin.name}/" class="plugin-source">Details →</a>
              </div>
            </article>`;
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

// Generate individual plugin page
function generatePluginPage(plugin) {
  const description = cleanDescription(plugin.description);
  const sourceUrl = getSourceUrl(plugin);
  const category = getCategoryForPlugin(plugin);
  const readme = getReadmeContent(plugin);
  const readmeHtml = markdownToHtml(readme);
  const isExternal = typeof plugin.source !== 'string';

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
    "url": `https://2389-research.github.io/claude-plugins/plugins/${plugin.name}/`,
    "downloadUrl": sourceUrl,
    "softwareVersion": plugin.version || "1.0.0",
    "license": "https://opensource.org/licenses/MIT"
  };

  return `<!DOCTYPE html>
<html lang="en">
${generateHead(plugin.name, description, `plugins/${plugin.name}/`)}
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
          <span class="install-label">Install Command</span>
          <code class="install-command">/plugin install ${plugin.name}${isExternal ? '' : '@2389-research'}</code>
        </div>
        <a href="${sourceUrl}" class="cta-button" rel="noopener noreferrer" target="_blank">
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
        <div class="quick-start-steps">
          <div class="step">
            <span class="step-number">1</span>
            <div class="step-content">
              <span class="step-label">Add the marketplace (if not already added)</span>
              <code>/plugin marketplace add 2389-research/claude-plugins</code>
            </div>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <div class="step-content">
              <span class="step-label">Install this plugin</span>
              <code>/plugin install ${plugin.name}</code>
            </div>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <div class="step-content">
              <span class="step-label">You're good to go</span>
              <code>Skills auto-trigger when relevant</code>
            </div>
          </div>
        </div>
      </div>
    </section>

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

  <!-- Structured Data -->
  <script type="application/ld+json">
  ${JSON.stringify(structuredData, null, 2)}
  </script>
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
          <span class="install-label">One Command Install</span>
          <code class="install-command">/plugin marketplace add 2389-research/claude-plugins</code>
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
          <div class="quick-start-steps">
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
                <code>/plugin install better-dev</code>
              </div>
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <div class="step-content">
                <span class="step-label">That's it. Seriously.</span>
                <code>Skills auto-trigger when relevant</code>
              </div>
            </div>
          </div>
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
    "url": "https://2389-research.github.io/claude-plugins/",
    "downloadUrl": "https://github.com/2389-research/claude-plugins",
    "softwareVersion": "1.0.0",
    "license": "https://opensource.org/licenses/MIT"
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
        "item": "https://2389-research.github.io/claude-plugins/"
      }
    ]
  }
  </script>
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

// Generate sitemap with all pages
const sitemapUrls = [
  { loc: '', priority: '1.0' },
  ...marketplace.plugins.map(p => ({ loc: `plugins/${p.name}/`, priority: '0.8' }))
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>
    <loc>https://2389-research.github.io/claude-plugins/${url.loc}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
fs.writeFileSync('docs/sitemap.xml', sitemap);

// Generate robots.txt
const robots = `# Robots.txt for 2389 Claude Code Plugin Marketplace
User-agent: *
Allow: /

Sitemap: https://2389-research.github.io/claude-plugins/sitemap.xml
Crawl-delay: 1
`;
fs.writeFileSync('docs/robots.txt', robots);

console.log('✓ Generated docs/index.html');
console.log(`✓ Generated ${marketplace.plugins.length} plugin pages in docs/plugins/`);
console.log('✓ Generated docs/sitemap.xml');
console.log('✓ Generated docs/robots.txt');
console.log(`✓ ${totalPlugins} plugins across ${Object.values(categories).filter(c => c.plugins.length > 0).length} categories`);

const fs = require('fs');
const path = require('path');

// Read marketplace.json
const marketplace = JSON.parse(
  fs.readFileSync('.claude-plugin/marketplace.json', 'utf8')
);

// Use a clearer display name - split into parts for better layout
const displayName = '2389 Research';
const displaySubtitle = 'Claude Code Plugin Marketplace';

// Get description from metadata if available
const marketplaceDescription = marketplace.metadata?.description || 'Claude Code Plugins';

// Generate HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${displayName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>${displayName}</h1>
      <p class="page-subtitle">${displaySubtitle}</p>
      <p class="subtitle">${marketplaceDescription}</p>
      <div class="header-links">
        <a href="https://2389.ai" class="header-link">About 2389</a>
        <a href="https://github.com/2389-research/claude-plugins" class="header-link">GitHub</a>
        <a href="mailto:hello@2389.ai" class="header-link">Contact</a>
      </div>
      <div class="install-cmd">
        <code>/plugin marketplace add 2389-research/claude-plugins</code>
      </div>
    </header>

    <div class="plugins-grid">
      ${marketplace.plugins.map(plugin => {
        const sourceUrl = plugin.source.url || plugin.source;
        const keywords = plugin.keywords ? `<div class="keywords">${plugin.keywords.map(k => `<span class="keyword">${k}</span>`).join('')}</div>` : '';
        const version = plugin.version ? `<span class="version">v${plugin.version}</span>` : '';

        // Check if description starts with [meta]
        const isMeta = plugin.description.startsWith('[meta]');
        const description = isMeta ? plugin.description.substring(7) : plugin.description;
        const metaTag = isMeta ? '<span class="meta-tag">meta</span>' : '';

        return `
        <article class="plugin">
          <div class="plugin-header">
            <h2>${plugin.name}</h2>
            ${version}
          </div>
          <p class="plugin-description">${metaTag}${description}</p>
          ${keywords}
          <div class="plugin-footer">
            <a href="${sourceUrl}" class="plugin-link">View Source</a>
            <code class="install-code">/plugin install ${plugin.name}</code>
          </div>
        </article>
      `;
      }).join('')}
    </div>

    <section class="about-section">
      <h2>About This Marketplace</h2>
      <p>This is a collection of Claude Code plugins and MCP servers we use at <a href="https://2389.ai">2389 Research</a>. Our plugins focus on development workflows, system administration, testing practices, and agent capabilities.</p>
      <p>All plugins are open source and available on <a href="https://github.com/2389-research/claude-plugins">GitHub</a>. Feel free to use them, modify them, or contribute improvements.</p>
      <div class="cta-box">
        <h3>Want to chat?</h3>
        <p>We'd love to hear how you're using these plugins or discuss Claude Code development.</p>
        <a href="mailto:hello@2389.ai" class="cta-button">Email us at hello@2389.ai</a>
      </div>
    </section>

    <footer>
      <p>&copy; 2024 <a href="https://2389.ai">2389 Research</a> • <a href="https://github.com/2389-research/claude-plugins">GitHub</a> • <a href="mailto:hello@2389.ai">Contact</a></p>
      <p class="footer-links">
        <a href="https://docs.claude.com/en/docs/claude-code">Claude Code Docs</a> •
        <a href="https://docs.claude.com/en/docs/claude-code/skills">Skills Guide</a> •
        <a href="https://docs.claude.com/en/docs/claude-code/plugins">Plugin Development</a>
      </p>
    </footer>
  </div>
</body>
</html>`;

// Write to docs/
fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/index.html', html);

console.log('✓ Generated docs/index.html');

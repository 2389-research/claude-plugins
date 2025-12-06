const fs = require('fs');
const path = require('path');

// Read marketplace.json
const marketplace = JSON.parse(
  fs.readFileSync('.claude-plugin/marketplace.json', 'utf8')
);

// Use a clearer display name
const displayName = '2389 Research Claude Code Plugin Marketplace';

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
      <p class="subtitle">${marketplaceDescription}</p>
      <p class="owner">by ${marketplace.owner.name}</p>
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
  </div>
</body>
</html>`;

// Write to docs/
fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/index.html', html);

console.log('✓ Generated docs/index.html');

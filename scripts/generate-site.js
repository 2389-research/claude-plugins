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

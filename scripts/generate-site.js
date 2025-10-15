const fs = require('fs');
const path = require('path');

// Read marketplace.json
const marketplace = JSON.parse(
  fs.readFileSync('.claude-plugin/marketplace.json', 'utf8')
);

// Format marketplace name for display (convert kebab-case to Title Case)
const displayName = marketplace.name
  .split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

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
  <header>
    <h1>${displayName}</h1>
    <p>by ${marketplace.owner.name}</p>
    <code>/plugin marketplace add 2389-research/claude-plugins</code>
  </header>

  <main>
    ${marketplace.plugins.map(plugin => `
      <article class="plugin">
        <h2>${plugin.name}</h2>
        <p>${plugin.description}</p>
        <div class="links">
          <a href="${plugin.source}">Source</a>
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

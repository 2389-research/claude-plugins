// ABOUTME: Generates Open Graph images (1200x630 PNG) for each plugin and the main marketplace page
// ABOUTME: Uses sharp with SVG overlay for zero system-dependency image generation

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const marketplace = JSON.parse(
  fs.readFileSync('.claude-plugin/marketplace.json', 'utf8')
);

// Category lookup (mirrors generate-site.js logic)
function getCategoryTitle(plugin) {
  const keywords = plugin.keywords || [];
  const desc = plugin.description.toLowerCase();

  if (plugin.description.startsWith('[meta]') || keywords.includes('meta')) {
    return 'Meta Plugin';
  } else if (keywords.includes('linux') || keywords.includes('sysadmin') || keywords.includes('terminal') || keywords.includes('reverse-engineering') || keywords.includes('maintenance')) {
    return 'Infrastructure';
  } else if (keywords.includes('multi-agent') || keywords.includes('agents') || keywords.includes('social') || desc.includes('agent')) {
    return 'Agent Systems';
  } else if (keywords.includes('ceo') || keywords.includes('executive') || keywords.includes('worldview') || keywords.includes('journal') || keywords.includes('reflection')) {
    return 'Personal & Strategy';
  } else {
    return 'Development';
  }
}

function cleanDescription(desc) {
  return desc.startsWith('[meta]') ? desc.substring(7).trim() : desc;
}

// Escape XML special characters for safe SVG embedding
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Word-wrap text to fit within a max character width
function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current);

  // Limit to 3 lines, truncate last with ellipsis if needed
  if (lines.length > 3) {
    lines.length = 3;
    lines[2] = lines[2].slice(0, maxChars - 3) + '...';
  }

  return lines;
}

// Generate SVG for a plugin OG image
function generatePluginSvg(plugin) {
  const name = escapeXml(plugin.name);
  const category = escapeXml(getCategoryTitle(plugin));
  const description = cleanDescription(plugin.description);
  const descLines = wrapText(description, 45);
  const version = plugin.version || '1.0.0';

  // Description lines
  const descSvg = descLines.map((line, i) => {
    return `<text x="80" y="${340 + i * 40}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="28" fill="#a0a0b8">${escapeXml(line)}</text>`;
  }).join('\n      ');

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="1200" height="630" fill="#1a1a2e"/>

    <!-- Subtle grid dots -->
    <circle cx="100" cy="80" r="2" fill="#e8c547" opacity="0.3"/>
    <circle cx="300" cy="50" r="2" fill="#6b8cce" opacity="0.3"/>
    <circle cx="500" cy="90" r="2" fill="#5dd39e" opacity="0.3"/>
    <circle cx="700" cy="60" r="2" fill="#ef6b6b" opacity="0.3"/>
    <circle cx="900" cy="85" r="2" fill="#e8c547" opacity="0.3"/>
    <circle cx="1100" cy="55" r="2" fill="#6b8cce" opacity="0.3"/>
    <circle cx="200" cy="550" r="2" fill="#5dd39e" opacity="0.3"/>
    <circle cx="600" cy="570" r="2" fill="#e8c547" opacity="0.3"/>
    <circle cx="1000" cy="560" r="2" fill="#ef6b6b" opacity="0.3"/>

    <!-- Gold accent line at top -->
    <rect x="0" y="0" width="1200" height="4" fill="#e8c547"/>

    <!-- Category badge -->
    <rect x="80" y="80" width="${category.length * 13 + 32}" height="38" rx="6" fill="rgba(232, 197, 71, 0.15)"/>
    <text x="96" y="106" font-family="monospace" font-size="18" fill="#e8c547" letter-spacing="0.5">${category}</text>

    <!-- Plugin name -->
    <text x="80" y="210" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="72" font-weight="bold" fill="#f5f5f7" letter-spacing="-2">${name}</text>

    <!-- Version -->
    <text x="80" y="260" font-family="monospace" font-size="24" fill="#e8c547" opacity="0.8">v${escapeXml(version)}</text>

    <!-- Divider line -->
    <rect x="80" y="280" width="200" height="2" fill="#3a3a5c" rx="1"/>

    <!-- Description -->
    ${descSvg}

    <!-- Bottom bar -->
    <rect x="0" y="520" width="1200" height="110" fill="#242442"/>
    <rect x="0" y="520" width="1200" height="1" fill="#3a3a5c"/>

    <!-- Status indicator dot -->
    <circle cx="96" cy="572" r="6" fill="#e8c547"/>

    <!-- Branding -->
    <text x="116" y="580" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="24" font-weight="600" fill="#f5f5f7">2389 Research Inc</text>

    <!-- Install command -->
    <text x="1120" y="580" font-family="monospace" font-size="20" fill="#a0a0b8" text-anchor="end">/plugin install ${name}</text>
  </svg>`;
}

// Generate SVG for the main marketplace OG image
function generateMarketplaceSvg() {
  const pluginCount = marketplace.plugins.length;

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="1200" height="630" fill="#1a1a2e"/>

    <!-- Scatter dots -->
    <circle cx="80" cy="60" r="3" fill="#e8c547" opacity="0.4"/>
    <circle cx="250" cy="40" r="2" fill="#6b8cce" opacity="0.4"/>
    <circle cx="450" cy="75" r="3" fill="#5dd39e" opacity="0.4"/>
    <circle cx="650" cy="45" r="2" fill="#ef6b6b" opacity="0.4"/>
    <circle cx="850" cy="70" r="3" fill="#e8c547" opacity="0.4"/>
    <circle cx="1050" cy="50" r="2" fill="#6b8cce" opacity="0.4"/>
    <circle cx="150" cy="520" r="2" fill="#5dd39e" opacity="0.3"/>
    <circle cx="400" cy="540" r="2" fill="#e8c547" opacity="0.3"/>
    <circle cx="750" cy="510" r="3" fill="#ef6b6b" opacity="0.3"/>
    <circle cx="1000" cy="530" r="2" fill="#6b8cce" opacity="0.3"/>

    <!-- Gold accent line at top -->
    <rect x="0" y="0" width="1200" height="4" fill="#e8c547"/>

    <!-- Label -->
    <circle cx="88" cy="110" r="5" fill="#e8c547"/>
    <text x="104" y="116" font-family="monospace" font-size="18" fill="#a0a0b8" letter-spacing="1.5">WELCOME, FELLOW BUILDER</text>

    <!-- Title -->
    <text x="80" y="220" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="76" font-weight="bold" fill="#f5f5f7" letter-spacing="-2">Plugins that actually</text>
    <text x="80" y="305" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="76" font-weight="bold" fill="#f5f5f7" letter-spacing="-2">get stuff done</text>

    <!-- Subtitle -->
    <text x="80" y="370" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="26" fill="#a0a0b8">Open source Claude Code plugins and MCP servers from 2389 Research.</text>
    <text x="80" y="405" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="26" fill="#a0a0b8">The tools we use every day to build, ship, and not lose our minds.</text>

    <!-- Stats -->
    <text x="80" y="480" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="48" font-weight="bold" fill="#f5f5f7">${pluginCount}</text>
    <text x="${90 + String(pluginCount).length * 28}" y="480" font-family="monospace" font-size="18" fill="#a0a0b8" letter-spacing="0.5">PLUGINS</text>

    <rect x="260" y="450" width="1" height="40" fill="#3a3a5c"/>

    <text x="290" y="480" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="48" font-weight="bold" fill="#f5f5f7">100%</text>
    <text x="440" y="480" font-family="monospace" font-size="18" fill="#a0a0b8" letter-spacing="0.5">OPEN SOURCE</text>

    <!-- Bottom bar -->
    <rect x="0" y="520" width="1200" height="110" fill="#242442"/>
    <rect x="0" y="520" width="1200" height="1" fill="#3a3a5c"/>

    <!-- Status indicator dot -->
    <circle cx="96" cy="572" r="6" fill="#e8c547"/>

    <!-- Branding -->
    <text x="116" y="580" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="24" font-weight="600" fill="#f5f5f7">2389 Research Inc</text>

    <!-- URL -->
    <text x="1120" y="580" font-family="monospace" font-size="20" fill="#a0a0b8" text-anchor="end">2389-research.github.io/claude-plugins</text>
  </svg>`;
}

async function generateImages() {
  // Generate main marketplace OG image
  const mainSvg = generateMarketplaceSvg();
  fs.mkdirSync('docs', { recursive: true });
  await sharp(Buffer.from(mainSvg)).png().toFile('docs/og-image.png');
  console.log('  docs/og-image.png');

  // Generate per-plugin OG images
  for (const plugin of marketplace.plugins) {
    const pluginDir = `docs/plugins/${plugin.name}`;
    fs.mkdirSync(pluginDir, { recursive: true });

    const svg = generatePluginSvg(plugin);
    await sharp(Buffer.from(svg)).png().toFile(`${pluginDir}/og-image.png`);
    console.log(`  ${pluginDir}/og-image.png`);
  }
}

generateImages().then(() => {
  console.log(`\nGenerated ${marketplace.plugins.length + 1} OG images`);
}).catch(err => {
  console.error('Failed to generate OG images:', err);
  process.exit(1);
});

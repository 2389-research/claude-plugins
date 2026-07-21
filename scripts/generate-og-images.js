// ABOUTME: Generates Open Graph images (1200x630 PNG) for each plugin and the main marketplace page
// ABOUTME: Uses sharp with SVG overlay for zero system-dependency image generation

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const marketplace = JSON.parse(
  fs.readFileSync('.claude-plugin/marketplace.json', 'utf8')
);

// Category title lookup — reads the explicit category each plugin declares in
// marketplace.json, mapping the key to its display title. Same source of truth
// generate-site.js uses; falls back to Development if a key is ever unknown.
const CATEGORY_TITLES = {
  development: 'Development',
  testing: 'Testing & Review',
  agents: 'Agents & Orchestration',
  infrastructure: 'Infrastructure & Ops',
  strategy: 'Strategy & Reflection'
};

function getCategoryTitle(plugin) {
  return CATEGORY_TITLES[plugin.category] || 'Development';
}

// Editorial OG palette — mirrors the live site masthead: warm paper, near-black
// ink, pink accent, a warm hairline rule. Serif display type (Georgia stands in
// for the site's Newsreader) and a mono (Menlo) for labels, both chosen because
// sharp/librsvg renders them from macOS system fonts. These images are built
// locally and committed; CI never regenerates them (it runs generate-site.js only).
const OG = {
  paper: '#faf9f6',
  ink: '#171512',
  body: '#4a453b',
  accent: '#e6196e',
  rule: '#ddd8cc',
  serif: "Georgia, 'Times New Roman', serif",
  mono: "Menlo, 'Courier New', monospace"
};

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

// Generate SVG for a plugin OG image — editorial layout on warm paper.
function generatePluginSvg(plugin) {
  const name = escapeXml(plugin.name);
  const category = escapeXml(getCategoryTitle(plugin).toUpperCase());
  const description = cleanDescription(plugin.description);
  const descLines = wrapText(description, 52);
  const version = escapeXml(plugin.version || '1.0.0');
  // Long slugs (e.g. building-multiagent-systems) would overrun at display size;
  // step the serif headline down so the name always fits the 1040px text column.
  const nameLen = plugin.name.length;
  const nameSize = nameLen > 20 ? 58 : nameLen > 13 ? 76 : 94;

  const descSvg = descLines.map((line, i) => {
    return `<text x="80" y="${402 + i * 42}" font-family="${OG.serif}" font-size="30" fill="${OG.body}">${escapeXml(line)}</text>`;
  }).join('\n    ');

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="${OG.paper}"/>
    <rect x="0" y="0" width="1200" height="5" fill="${OG.accent}"/>

    <!-- Masthead bar -->
    <text x="80" y="74" font-family="${OG.mono}" font-size="19" fill="${OG.ink}" letter-spacing="1">2389 RESEARCH · AGENT SKILLS</text>
    <text x="1120" y="74" font-family="${OG.mono}" font-size="19" fill="${OG.body}" letter-spacing="1" text-anchor="end">EST. 2026</text>
    <rect x="80" y="96" width="1040" height="1" fill="${OG.rule}"/>

    <!-- Category eyebrow -->
    <text x="80" y="210" font-family="${OG.mono}" font-size="22" fill="${OG.accent}" letter-spacing="3">${category}</text>

    <!-- Plugin name -->
    <text x="80" y="298" font-family="${OG.serif}" font-size="${nameSize}" fill="${OG.ink}">${name}</text>

    <!-- Version -->
    <text x="80" y="346" font-family="${OG.mono}" font-size="22" fill="${OG.body}">v${version}</text>

    <!-- Description -->
    ${descSvg}

    <!-- Footer -->
    <rect x="80" y="556" width="1040" height="1" fill="${OG.rule}"/>
    <text x="80" y="596" font-family="${OG.mono}" font-size="18" fill="${OG.accent}" letter-spacing="0.5">skills.2389.ai/plugins/${name}</text>
    <text x="1120" y="596" font-family="${OG.mono}" font-size="18" fill="${OG.ink}" letter-spacing="1" text-anchor="end">2389 RESEARCH INC</text>
  </svg>`;
}

// Generate SVG for the main marketplace OG image — mirrors the site masthead.
function generateMarketplaceSvg() {
  const pluginCount = marketplace.plugins.length;

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="${OG.paper}"/>
    <rect x="0" y="0" width="1200" height="5" fill="${OG.accent}"/>

    <!-- Masthead bar -->
    <text x="80" y="74" font-family="${OG.mono}" font-size="19" fill="${OG.ink}" letter-spacing="1">2389 RESEARCH · AGENT SKILLS · OPEN SOURCE</text>
    <text x="1120" y="74" font-family="${OG.mono}" font-size="19" fill="${OG.body}" letter-spacing="1" text-anchor="end">EST. 2026</text>
    <rect x="80" y="96" width="1040" height="1" fill="${OG.rule}"/>

    <!-- Kicker -->
    <text x="80" y="216" font-family="${OG.mono}" font-size="22" fill="${OG.accent}" letter-spacing="3">A WORKING INDEX OF</text>

    <!-- Headline (serif, skills set in italic accent, mirroring the site's <em>) -->
    <text x="78" y="322" font-family="${OG.serif}" font-size="98" fill="${OG.ink}">Coding-agent <tspan font-style="italic" fill="${OG.accent}">skills</tspan></text>
    <text x="78" y="420" font-family="${OG.serif}" font-size="98" fill="${OG.ink}">&amp; servers</text>

    <!-- Lede -->
    <text x="80" y="498" font-family="${OG.serif}" font-size="30" fill="${OG.body}">Skills and MCP servers for the coding agents you already use.</text>

    <!-- Footer -->
    <rect x="80" y="556" width="1040" height="1" fill="${OG.rule}"/>
    <text x="80" y="596" font-family="${OG.mono}" font-size="19" fill="${OG.ink}" letter-spacing="1">${pluginCount} SKILLS · 100% OPEN SOURCE</text>
    <text x="1120" y="596" font-family="${OG.mono}" font-size="19" fill="${OG.accent}" letter-spacing="1" text-anchor="end">skills.2389.ai</text>
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

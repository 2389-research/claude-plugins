// ABOUTME: Renders a per-skill "Star on GitHub" button linking to the skill's own repo
// ABOUTME: GitHub disallows one-click starring, so this deep-links to where the user stars

// GitHub's own star icon path, reused from the global nav star button.
const STAR_SVG =
  '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">' +
  '<path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>' +
  '</svg>';

// Abbreviate a star count the way GitHub does: exact below 1k, one decimal in the
// thousands, whole thousands past 10k, and the same shape for millions. Returns null
// for a missing count so the caller can fall back to an icon-only button.
function formatStarCount(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return null;
  if (n < 1000) return String(n);
  if (n < 10000) return `${Math.floor(n / 100) / 10}k`;
  if (n < 1000000) return `${Math.floor(n / 1000)}k`;
  if (n < 10000000) return `${Math.floor(n / 100000) / 10}M`;
  return `${Math.floor(n / 1000000)}M`;
}

// Build the star button anchor. variant 'card' is the compact pill used on grid cards;
// 'hero' is the larger button on plugin pages. The href is the skill's repo, so clicking
// lands on GitHub's native Star control for that project.
function renderStarButton({ repoUrl, pluginName, count = null, variant = 'card' }) {
  const cls = variant === 'hero' ? 'star-button' : 'plugin-star';
  const formatted = formatStarCount(count);
  const countHtml =
    formatted !== null ? `<span class="star-count">${formatted}</span>` : '';
  const label = `Star ${pluginName} on GitHub`;
  return (
    `<a href="${repoUrl}" class="${cls}" rel="noopener noreferrer" target="_blank" ` +
    `title="${label}" aria-label="${label}" ` +
    `data-tinylytics-event="plugin.star" data-tinylytics-event-value="${pluginName}">` +
    `${STAR_SVG}${countHtml}</a>`
  );
}

module.exports = { formatStarCount, renderStarButton };

// ABOUTME: Converts relative repo links in rendered README HTML to absolute GitHub URLs
// ABOUTME: Skips absolute/anchor hrefs; routes cross-plugin links to sibling marketplace pages

// Convert relative repo links to GitHub URLs using per-plugin repos.
// Dependencies are injected so the function stays pure and unit-testable:
//   - marketplacePlugins: array of plugin entries ({ name }) used to resolve cross-plugin links
//   - linkReport: { converted: [], broken: [] } accumulator for build-time reporting
function convertRepoLinks(html, pluginName, repoName, { marketplacePlugins = [], linkReport } = {}) {
  if (!html) return html;

  const repo = repoName || `2389-research/${pluginName}`;
  const report = linkReport || { converted: [], broken: [] };

  // Match every <a href="...">...</a>. The link text uses [\s\S]*? (not [^<]*) so
  // anchors whose text contains nested tags — e.g. a backtick link rendered as
  // <a href="..."><code>eval/RESULTS.md</code></a> — are still matched.
  return html.replace(
    /<a href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/g,
    (match, href, attrs, linkText) => {
      // Leave absolute references untouched: full URLs (http:, https:, mailto:, etc.),
      // protocol-relative (//host), in-page anchors (#frag), and empty hrefs. Everything
      // else is treated as a repo-relative path and absolutized below.
      if (href === '' || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href)) {
        return match;
      }

      // Normalize the path
      let normalizedPath = href.replace(/^\.\//, '');

      // Handle cross-plugin links (../other-plugin/) by linking to marketplace pages
      if (normalizedPath.startsWith('../')) {
        const crossPluginMatch = normalizedPath.match(/^\.\.\/([^/]+)\/?(.*)$/);
        if (crossPluginMatch) {
          const [, otherPlugin] = crossPluginMatch;
          // Check if the other plugin exists in the marketplace
          const otherExists = marketplacePlugins.some(p => p.name === otherPlugin);
          if (otherExists) {
            report.converted.push({
              plugin: pluginName,
              from: href,
              to: `../${otherPlugin}/`
            });
            return `<a href="../${otherPlugin}/"${attrs}>${linkText}</a>`;
          } else {
            report.broken.push({
              plugin: pluginName,
              path: href,
              reason: 'Cross-plugin target not found in marketplace'
            });
            return `<span class="broken-link" title="Link target not found">${linkText}</span>`;
          }
        }
      }

      // Repo-relative path: strip any leading slashes, then resolve against the plugin repo.
      // Determine URL type heuristically: paths with extensions are blobs, others are trees.
      normalizedPath = normalizedPath.replace(/^\/+/, '');
      const hasExtension = /\.\w+$/.test(normalizedPath);
      const urlType = hasExtension ? 'blob' : 'tree';
      const githubUrl = `https://github.com/${repo}/${urlType}/main/${normalizedPath}`;
      report.converted.push({
        plugin: pluginName,
        from: href,
        to: githubUrl
      });
      return `<a href="${githubUrl}"${attrs} target="_blank">${linkText}</a>`;
    }
  );
}

module.exports = { convertRepoLinks };

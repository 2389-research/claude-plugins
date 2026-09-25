// ABOUTME: Marketplace-entry helpers shared by the site generator and the install check
// ABOUTME: Derives an entry's GitHub owner/repo and whether the site offers it an npx install

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

// MCP-only entries (strict: true) ship no skills, so npx skills add can't install them.
function pluginHasSkills(plugin) {
  return plugin.strict !== true;
}

module.exports = { getRepoName, getSourceUrl, pluginHasSkills };

#!/usr/bin/env bash
# ABOUTME: Updates marketplace.json to point to GitHub repos instead of local dirs
# ABOUTME: Run after split-to-repos.sh has created all individual repos

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MARKETPLACE_JSON="$REPO_ROOT/.claude-plugin/marketplace.json"
GITHUB_ORG="2389-research"

echo "=== Updating marketplace.json sources ==="

# Create backup
cp "$MARKETPLACE_JSON" "$MARKETPLACE_JSON.backup"
echo "Backup: $MARKETPLACE_JSON.backup"

# Transform all local sources (string starting with ./) into URL objects
jq --arg org "$GITHUB_ORG" '
    .plugins |= map(
        if (.source | type == "string") then
            .source = {
                "source": "url",
                "url": ("https://github.com/" + $org + "/" + .name)
            }
        else
            .
        end
    )
' "$MARKETPLACE_JSON" > "$MARKETPLACE_JSON.tmp"

mv "$MARKETPLACE_JSON.tmp" "$MARKETPLACE_JSON"

echo "Updated $(jq '[.plugins[] | select(.source.source == "url")] | length' "$MARKETPLACE_JSON") plugins to use GitHub URLs"
echo ""
echo "Verify with: jq '.plugins[] | {name, source}' $MARKETPLACE_JSON"

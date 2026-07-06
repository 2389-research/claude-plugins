#!/usr/bin/env bash
# ABOUTME: Clones every plugin repo listed in .claude-plugin/marketplace.json into a target directory.
# ABOUTME: Used for marketplace-wide maintenance (skill audits, bulk fixes) since plugins live in separate repos.

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: clone-plugins.sh <target-dir>

Clones (or updates) every plugin repo from .claude-plugin/marketplace.json
into <target-dir>/<repo-name>. Existing clones are updated with git pull.

Requires: git, jq. Uses the repo URL from each plugin's source.url field.
EOF
}

if [[ $# -ne 1 || "$1" == "-h" || "$1" == "--help" ]]; then
  usage
  exit 1
fi

TARGET_DIR="$1"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MARKETPLACE_JSON="$REPO_ROOT/.claude-plugin/marketplace.json"

mkdir -p "$TARGET_DIR"

failures=()
while IFS= read -r url; do
  name="$(basename "$url" .git)"
  dest="$TARGET_DIR/$name"
  if [[ -d "$dest/.git" ]]; then
    echo "== updating $name"
    git -C "$dest" pull --ff-only || failures+=("$name (pull failed)")
  else
    echo "== cloning $name"
    git clone --quiet "$url" "$dest" || failures+=("$name (clone failed)")
  fi
done < <(jq -r '.plugins[].source.url' "$MARKETPLACE_JSON")

echo
if [[ ${#failures[@]} -gt 0 ]]; then
  echo "FAILED (${#failures[@]}):"
  printf '  %s\n' "${failures[@]}"
  exit 1
fi
echo "All plugin repos present in $TARGET_DIR"

#!/usr/bin/env bash
# ABOUTME: Splits each local plugin from the monorepo into its own GitHub repository.
# ABOUTME: Reads marketplace.json, uses git-filter-repo to preserve history, and pushes to 2389-research org.

set -euo pipefail

# ---------------------------------------------------------------------------
# Resolve paths relative to the repo root, not the caller's cwd
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MARKETPLACE_JSON="${REPO_ROOT}/.claude-plugin/marketplace.json"
GITHUB_ORG="2389-research"
MIT_LICENSE_YEAR="2025"
MIT_LICENSE_HOLDER="2389 Research Inc"

# ---------------------------------------------------------------------------
# Sanity-check required tools
# ---------------------------------------------------------------------------
for tool in jq gh git git-filter-repo; do
    if ! command -v "${tool}" &>/dev/null; then
        echo "ERROR: required tool '${tool}' not found on PATH" >&2
        exit 1
    fi
done

# ---------------------------------------------------------------------------
# Collect local plugins: those whose source is a plain string (starts with ./)
# ---------------------------------------------------------------------------
PLUGIN_NAMES=()
while IFS= read -r name; do
    PLUGIN_NAMES+=("${name}")
done < <(jq -r '.plugins[] | select(.source | type == "string") | .name' "${MARKETPLACE_JSON}")

TOTAL="${#PLUGIN_NAMES[@]}"
echo "Found ${TOTAL} local plugins to process."
echo ""

# ---------------------------------------------------------------------------
# Helper: build MIT LICENSE content
# ---------------------------------------------------------------------------
mit_license_text() {
    local year="$1"
    local holder="$2"
    cat <<EOF
MIT License

Copyright (c) ${year} ${holder}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
}

# ---------------------------------------------------------------------------
# Process each plugin
# ---------------------------------------------------------------------------
INDEX=0
for PLUGIN_NAME in "${PLUGIN_NAMES[@]}"; do
    INDEX=$((INDEX + 1))
    echo "=== [${INDEX}/${TOTAL}] Processing: ${PLUGIN_NAME} ==="

    # Read plugin metadata from marketplace.json
    PLUGIN_DESC="$(jq -r --arg n "${PLUGIN_NAME}" '.plugins[] | select(.name == $n) | .description' "${MARKETPLACE_JSON}")"
    PLUGIN_DIR="$(jq -r --arg n "${PLUGIN_NAME}" '.plugins[] | select(.name == $n) | .source' "${MARKETPLACE_JSON}" | sed 's|^\./||')"

    REPO_SLUG="${GITHUB_ORG}/${PLUGIN_NAME}"
    REPO_URL="https://github.com/${REPO_SLUG}"

    # ------------------------------------------------------------------
    # Idempotency: skip if repo already exists
    # ------------------------------------------------------------------
    if gh repo view "${REPO_SLUG}" &>/dev/null; then
        echo "  -> Repo ${REPO_SLUG} already exists, skipping."
        echo ""
        continue
    fi

    echo "  -> Creating GitHub repo: ${REPO_SLUG}"
    gh repo create "${REPO_SLUG}" --public --description "${PLUGIN_DESC}"

    # ------------------------------------------------------------------
    # Clone monorepo to a temp dir and filter to just this plugin
    # ------------------------------------------------------------------
    TMPDIR_BASE="$(mktemp -d)"
    CLONE_DIR="${TMPDIR_BASE}/${PLUGIN_NAME}"

    echo "  -> Cloning monorepo to temp dir: ${CLONE_DIR}"
    git clone "${REPO_ROOT}" "${CLONE_DIR}"

    echo "  -> Filtering history to subdirectory: ${PLUGIN_DIR}/"
    cd "${CLONE_DIR}"
    uv run git-filter-repo --subdirectory-filter "${PLUGIN_DIR}" --force
    cd "${REPO_ROOT}"

    # ------------------------------------------------------------------
    # Add MIT LICENSE if missing
    # ------------------------------------------------------------------
    if [[ ! -f "${CLONE_DIR}/LICENSE" ]] && [[ ! -f "${CLONE_DIR}/LICENSE.md" ]] && [[ ! -f "${CLONE_DIR}/LICENSE.txt" ]]; then
        echo "  -> Adding MIT LICENSE"
        mit_license_text "${MIT_LICENSE_YEAR}" "${MIT_LICENSE_HOLDER}" > "${CLONE_DIR}/LICENSE"
        git -C "${CLONE_DIR}" add LICENSE
        git -C "${CLONE_DIR}" commit -m "chore: add MIT LICENSE"
    else
        echo "  -> LICENSE already present, skipping."
    fi

    # ------------------------------------------------------------------
    # Push to the new GitHub repo
    # ------------------------------------------------------------------
    echo "  -> Pushing to ${REPO_URL}"
    git -C "${CLONE_DIR}" remote add origin "https://github.com/${REPO_SLUG}.git"
    git -C "${CLONE_DIR}" push origin --all
    git -C "${CLONE_DIR}" push origin --tags

    # ------------------------------------------------------------------
    # Set GitHub topics from marketplace.json keywords
    # ------------------------------------------------------------------
    KEYWORDS_JSON="$(jq --arg n "${PLUGIN_NAME}" '{"names": [.plugins[] | select(.name == $n) | .keywords[]]}' "${MARKETPLACE_JSON}")"
    echo "  -> Setting GitHub topics"
    echo "${KEYWORDS_JSON}" | gh api --method PUT "repos/${REPO_SLUG}/topics" \
        --input - --silent 2>/dev/null || \
    echo "  [warn] Could not set topics via API — set them manually if needed."

    # ------------------------------------------------------------------
    # Clean up temp clone
    # ------------------------------------------------------------------
    echo "  -> Cleaning up temp dir"
    rm -rf "${TMPDIR_BASE}"

    echo "  -> Done: ${REPO_URL}"
    echo ""
done

# ---------------------------------------------------------------------------
# Summary and next steps
# ---------------------------------------------------------------------------
echo "========================================"
echo "Split complete: ${TOTAL} plugins processed."
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Run scripts/update-marketplace-sources.sh to update marketplace.json"
echo "     with the new GitHub URLs for each split plugin."
echo "  2. Open a PR for those marketplace.json changes and merge to main."
echo "  3. Verify each repo at https://github.com/${GITHUB_ORG}"
echo "  4. Archive or adjust the monorepo as appropriate."
echo ""

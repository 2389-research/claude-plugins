#!/bin/bash
# ABOUTME: Setup script for 2389 skills plugin permissions
# ABOUTME: Configures Claude Code settings to allow terminal-title script without prompts

set -e

CLAUDE_DIR="${HOME}/.claude"
SETTINGS_FILE="${CLAUDE_DIR}/settings.json"

echo "🔐 Configuring 2389 Skills Plugin Permissions..."
echo ""

PERMISSIONS_TO_ADD=(
    'Bash(bash *skills/terminal-title/scripts/set_title.sh:*)'
    'Skill(2389:*)'
    'Skill(superpowers:brainstorming)'
    'Skill(superpowers:writing-plans)'
    'Skill(superpowers:subagent-driven-development)'
    'SlashCommand(/superpowers:write-plan)'
    'mcp__socialmedia__read_posts'
)

if [ ! -f "${SETTINGS_FILE}" ]; then
    echo "   📝 Creating new settings.json with permissions"
    mkdir -p "${CLAUDE_DIR}"

    # Build JSON array of permissions
    PERMS_JSON=$(printf '%s\n' "${PERMISSIONS_TO_ADD[@]}" | jq -R . | jq -s .)

    jq -n --argjson perms "$PERMS_JSON" '{permissions: {allow: $perms}}' > "${SETTINGS_FILE}"
    echo "   ✅ Settings file created with ${#PERMISSIONS_TO_ADD[@]} permissions"
elif command -v jq >/dev/null 2>&1; then
    # Use jq for safe JSON manipulation
    echo "   🔍 Checking existing permissions..."

    # Backup settings
    cp "${SETTINGS_FILE}" "${SETTINGS_FILE}.backup"
    echo "   💾 Backup created: ${SETTINGS_FILE}.backup"

    # Add all permissions that don't already exist
    ADDED_COUNT=0
    CURRENT_FILE="${SETTINGS_FILE}"

    for perm in "${PERMISSIONS_TO_ADD[@]}"; do
        if ! jq -e --arg perm "$perm" '.permissions.allow[]? | select(. == $perm)' "${CURRENT_FILE}" >/dev/null 2>&1; then
            jq --arg perm "$perm" '
                .permissions.allow += [$perm] |
                .permissions.allow |= unique
            ' "${CURRENT_FILE}" > "${CURRENT_FILE}.tmp"
            mv "${CURRENT_FILE}.tmp" "${CURRENT_FILE}"
            ((ADDED_COUNT++))
        fi
    done

    if [ $ADDED_COUNT -eq 0 ]; then
        echo "   ✅ All permissions already configured"
    else
        echo "   ✅ Added ${ADDED_COUNT} new permission(s) to settings.json"
    fi
else
    # Fallback: Manual instruction if jq not available
    echo "   ⚠️  jq not found - manual configuration required"
    echo ""
    echo "   Please add these permissions to ${SETTINGS_FILE}:"
    echo ""
    echo '   "permissions": {'
    echo '     "allow": ['
    for perm in "${PERMISSIONS_TO_ADD[@]}"; do
        echo "       \"${perm}\","
    done | sed '$ s/,$//'
    echo '     ]'
    echo '   }'
    echo ""
    exit 1
fi

echo ""
echo "✨ Permission setup complete!"
echo ""
echo "The terminal-title skill can now update your terminal title silently."
echo ""

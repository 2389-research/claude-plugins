#!/bin/bash
# ABOUTME: SessionStart hook wrapper that detects project name and sets terminal title
# ABOUTME: Called automatically by Claude Code when session starts

# Enable logging for debugging
LOG_FILE="/tmp/claude-2389-session-start.log"
exec 2>> "$LOG_FILE"
echo "=== SessionStart hook fired at $(date) ===" >> "$LOG_FILE"

set -e

# Get current working directory
CWD="${PWD}"
echo "CWD: $CWD" >> "$LOG_FILE"

# Intelligent project name detection (matching terminal-title skill logic)
PROJECT_NAME=""

# Check for package.json name field (Node.js projects)
if [ -f "${CWD}/package.json" ] && command -v jq >/dev/null 2>&1; then
    PACKAGE_NAME=$(jq -r '.name // empty' "${CWD}/package.json" 2>/dev/null)
    if [ -n "$PACKAGE_NAME" ]; then
        # Convert kebab-case to Title Case
        PROJECT_NAME=$(echo "$PACKAGE_NAME" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')
    fi
fi

# Check git remote URL
if [ -z "$PROJECT_NAME" ] && [ -d "${CWD}/.git" ]; then
    GIT_REMOTE=$(git -C "${CWD}" config --get remote.origin.url 2>/dev/null || echo "")
    if [ -n "$GIT_REMOTE" ]; then
        # Extract repo name from URL (e.g., github.com/user/repo.git -> repo)
        PROJECT_NAME=$(basename "$GIT_REMOTE" .git)
        # Convert kebab-case to Title Case
        PROJECT_NAME=$(echo "$PROJECT_NAME" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')
    fi
fi

# Check README.md first heading
if [ -z "$PROJECT_NAME" ] && [ -f "${CWD}/README.md" ]; then
    FIRST_HEADING=$(grep -m 1 '^#' "${CWD}/README.md" 2>/dev/null | sed 's/^#* *//' || echo "")
    if [ -n "$FIRST_HEADING" ]; then
        PROJECT_NAME="$FIRST_HEADING"
    fi
fi

# Fallback: Use directory basename and humanize it
if [ -z "$PROJECT_NAME" ]; then
    DIR_NAME=$(basename "$CWD")
    # Convert kebab-case or snake_case to Title Case
    PROJECT_NAME=$(echo "$DIR_NAME" | sed 's/[-_]/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')
fi

echo "Detected project name: $PROJECT_NAME" >> "$LOG_FILE"

# Find the set_title.sh script (relative to this hook script)
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$HOOK_DIR")"
SET_TITLE_SCRIPT="${PLUGIN_ROOT}/skills/scripts/set_title.sh"

echo "HOOK_DIR: $HOOK_DIR" >> "$LOG_FILE"
echo "PLUGIN_ROOT: $PLUGIN_ROOT" >> "$LOG_FILE"
echo "SET_TITLE_SCRIPT: $SET_TITLE_SCRIPT" >> "$LOG_FILE"

# Call set_title.sh with detected project name and "Claude Code" as topic
if [ -x "$SET_TITLE_SCRIPT" ]; then
    echo "Executing: bash $SET_TITLE_SCRIPT '$PROJECT_NAME' 'Claude Code'" >> "$LOG_FILE"
    if bash "$SET_TITLE_SCRIPT" "$PROJECT_NAME" "Claude Code" 2>> "$LOG_FILE"; then
        echo "✓ set_title.sh succeeded" >> "$LOG_FILE"
    else
        EXIT_CODE=$?
        echo "✗ set_title.sh failed with exit code $EXIT_CODE" >> "$LOG_FILE"
    fi
else
    echo "✗ SET_TITLE_SCRIPT not executable, trying fallback" >> "$LOG_FILE"
    # Fallback: try to find it in Claude's plugin directory
    SET_TITLE_SCRIPT="${HOME}/.claude/plugins/terminal-title/skills/scripts/set_title.sh"
    echo "Fallback script: $SET_TITLE_SCRIPT" >> "$LOG_FILE"
    if [ -x "$SET_TITLE_SCRIPT" ]; then
        echo "Executing fallback: bash $SET_TITLE_SCRIPT '$PROJECT_NAME' 'Claude Code'" >> "$LOG_FILE"
        if bash "$SET_TITLE_SCRIPT" "$PROJECT_NAME" "Claude Code" 2>> "$LOG_FILE"; then
            echo "✓ Fallback set_title.sh succeeded" >> "$LOG_FILE"
        else
            EXIT_CODE=$?
            echo "✗ Fallback set_title.sh failed with exit code $EXIT_CODE" >> "$LOG_FILE"
        fi
    else
        echo "✗ Fallback script not found or not executable" >> "$LOG_FILE"
    fi
fi

echo "=== SessionStart hook completed at $(date) ===" >> "$LOG_FILE"

# Output JSON with additionalContext for Claude Code to inject as system reminder
# This is how command hooks inject prompts into the conversation context
cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<CRITICAL_SESSION_START_INSTRUCTION>\n\nBEFORE responding to the user, you MUST:\n\n1. Use the Skill tool to invoke: terminal-title\n2. This will refine the terminal title from the default set by the command hook\n3. Only THEN respond to the user's message\n\nThis is NOT optional. This is NOT negotiable. The terminal title skill MUST run at session start.\n\nIf you respond to the user without invoking terminal-title first, you have FAILED.\n\n</CRITICAL_SESSION_START_INSTRUCTION>"
  }
}
EOF

exit 0

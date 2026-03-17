#!/bin/bash
# ABOUTME: Sets terminal window title with emoji, project name, and topic
# ABOUTME: Usage: ./set_title.sh "Project Name" "Topic"

# Exit silently if arguments missing (fail-safe behavior)
if [ -z "$1" ] || [ -z "$2" ]; then
    exit 0
fi

PROJECT="$1"
TOPIC="$2"

# Get emoji from environment, default to 🎉
# Sanitize to prevent ANSI escape sequence injection
EMOJI=$(echo "${TERMINAL_TITLE_EMOJI:-🎉}" | tr -d '\000-\037')

# Validate and sanitize inputs (remove control characters, limit length)
PROJECT=$(echo "$PROJECT" | tr -d '\000-\037' | head -c 40)
TOPIC=$(echo "$TOPIC" | tr -d '\000-\037' | head -c 40)

# Ensure values not empty after sanitization
if [ -z "$PROJECT" ] || [ -z "$TOPIC" ]; then
    exit 0
fi

# Set the terminal title using ANSI escape sequences
# Format: "emoji ProjectName - Topic   " (3 spaces compensate for Bash tool truncation)
TITLE_SEQ=$(printf '\033]0;%s %s - %s   \007' "$EMOJI" "$PROJECT" "$TOPIC")

# Find a writable TTY. The Bash tool runs without /dev/tty, so we walk up the
# process tree to find the parent Claude process's TTY device.
find_tty() {
    # Try /dev/tty first (works in hook context and direct shell)
    # Use a test write — [ -w ] can return true even when the device isn't configured
    if (printf '' > /dev/tty) 2>/dev/null; then
        echo "/dev/tty"
        return 0
    fi

    # Walk up process tree to find a parent with a real TTY
    local pid=$$
    while [ "$pid" -gt 1 ] 2>/dev/null; do
        local tty_name
        tty_name=$(ps -o tty= -p "$pid" 2>/dev/null | tr -d ' ')
        if [ -n "$tty_name" ] && [ "$tty_name" != "??" ] && [ -w "/dev/$tty_name" ]; then
            echo "/dev/$tty_name"
            return 0
        fi
        pid=$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ')
    done

    return 1
}

TTY_DEVICE=$(find_tty)
if [ -n "$TTY_DEVICE" ]; then
    printf '%s' "$TITLE_SEQ" > "$TTY_DEVICE"
elif [ -t 1 ]; then
    # Last resort: stdout only when it is an actual terminal
    printf '%s' "$TITLE_SEQ"
fi

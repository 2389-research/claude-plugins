#!/bin/bash
# Check if CEREBRAS_API_KEY is set and warn the user if not

if [ -z "$CEREBRAS_API_KEY" ]; then
    {
        echo "speed-run: CEREBRAS_API_KEY is not set. Speed-run skills will not work without it."
        echo "  Get a free key at: https://cloud.cerebras.ai"
        echo "  Then add to ~/.claude/settings.json: { \"env\": { \"CEREBRAS_API_KEY\": \"your-key\" } }"
    } >&2
fi

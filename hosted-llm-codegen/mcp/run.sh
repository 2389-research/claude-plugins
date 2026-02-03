#!/bin/bash
# Wrapper script to run the MCP server via Docker
# Claude Code calls this script, which runs the Docker container
# with the appropriate volume mounts.
#
# Usage in mcp.json:
#   "command": "/path/to/run.sh",
#   "args": ["/path/to/workspace"]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKSPACE="${1:-$(pwd)}"

# Build if image doesn't exist
if ! docker image inspect hosted-llm-codegen:latest >/dev/null 2>&1; then
    echo "Building hosted-llm-codegen image..." >&2
    docker build -t hosted-llm-codegen:latest "$SCRIPT_DIR" >&2
fi

# Run container with stdio
# -i: interactive (needed for stdio MCP)
# --rm: cleanup after exit
# -e: pass environment variables
# -v: mount workspace for file writing
exec docker run -i --rm \
    -e CEREBRAS_API_KEY \
    -e CEREBRAS_MODEL="${CEREBRAS_MODEL:-gpt-oss-120b}" \
    -e HOST_WORKSPACE="${WORKSPACE}" \
    -e IN_DOCKER=1 \
    -v "${WORKSPACE}:/workspace" \
    hosted-llm-codegen:latest

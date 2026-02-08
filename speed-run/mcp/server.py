#!/usr/bin/env python3
# ABOUTME: MCP Server for hosted LLM code generation via Cerebras API.
# ABOUTME: Provides tools for generating code and writing files directly to disk.
"""
MCP Server for hosted LLM code generation via Cerebras.

Provides tools for generating code with a hosted LLM and writing files directly,
avoiding Claude token usage for generated code.
"""

import json
import os
import re
import sys
import time
from pathlib import Path

import httpx

# MCP SDK imports
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

# Configuration
CEREBRAS_API_KEY = os.environ.get("CEREBRAS_API_KEY")
CEREBRAS_URL = os.environ.get("CEREBRAS_URL", "https://api.cerebras.ai/v1")
CEREBRAS_MODEL = os.environ.get("CEREBRAS_MODEL", "gpt-oss-120b")
GENERATION_TIMEOUT = float(os.environ.get("GENERATION_TIMEOUT", "120"))

# Docker path translation
# When running in Docker, HOST_WORKSPACE is the host path mounted to /workspace
HOST_WORKSPACE = os.environ.get("HOST_WORKSPACE", "")
CONTAINER_WORKSPACE = "/workspace"
IN_DOCKER = os.path.exists("/.dockerenv") or os.environ.get("IN_DOCKER") == "1"

# Create server
server = Server("speed-run")


def _normalize(p: str) -> str:
    """Normalize a path for boundary-safe comparison."""
    return os.path.normpath(os.path.abspath(p))


def translate_path(path: str) -> str:
    """Translate host path to container path when running in Docker."""
    if not IN_DOCKER or not HOST_WORKSPACE:
        return path

    norm_host = _normalize(HOST_WORKSPACE)
    norm_path = _normalize(path)

    # Boundary-aware: match exact dir or dir + separator
    if norm_path == norm_host or norm_path.startswith(norm_host + os.sep):
        return path.replace(HOST_WORKSPACE, CONTAINER_WORKSPACE, 1)

    # If it's a relative path, prepend container workspace
    if not path.startswith("/"):
        return os.path.join(CONTAINER_WORKSPACE, path)

    return path


def translate_path_back(path: str) -> str:
    """Translate container path back to host path for reporting."""
    if not IN_DOCKER or not HOST_WORKSPACE:
        return path

    norm_container = _normalize(CONTAINER_WORKSPACE)
    norm_path = _normalize(path)

    if norm_path == norm_container or norm_path.startswith(norm_container + os.sep):
        return path.replace(CONTAINER_WORKSPACE, HOST_WORKSPACE, 1)

    return path


async def generate_text(
    prompt: str,
    system_prompt: str | None = None,
    max_tokens: int = 4096,
) -> dict:
    """Generate text using Cerebras API."""
    if not CEREBRAS_API_KEY:
        return {
            "status": "error",
            "error": "CEREBRAS_API_KEY not set",
            "setup_hint": "Set CEREBRAS_API_KEY either in ~/.claude/settings.json under \"env\" or export in ~/.zshrc - get free key at https://cloud.cerebras.ai",
        }

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    start_time = time.time()

    try:
        async with httpx.AsyncClient(timeout=GENERATION_TIMEOUT) as client:
            response = await client.post(
                f"{CEREBRAS_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {CEREBRAS_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": CEREBRAS_MODEL,
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": 0.1,
                },
            )
            response.raise_for_status()
            data = response.json()

            choices = data.get("choices")
            if not choices or not isinstance(choices, list) or len(choices) == 0:
                return {"status": "error", "error": f"Unexpected API response: no choices returned. Raw: {json.dumps(data)[:500]}"}

            message = choices[0].get("message", {})
            content = message.get("content")
            if content is None:
                return {"status": "error", "error": f"Unexpected API response: no content in message. Raw: {json.dumps(data)[:500]}"}

            duration_ms = int((time.time() - start_time) * 1000)

            return {
                "status": "ok",
                "response": content,
                "model": CEREBRAS_MODEL,
                "total_duration_ms": duration_ms,
                "usage": data.get("usage", {}),
            }

    except httpx.HTTPStatusError as e:
        return {"status": "error", "error": f"HTTP {e.response.status_code}: {e.response.text}"}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def parse_and_write_files(response_text: str, output_dir: str) -> dict:
    """Parse response for ### FILE: delimiters and write files."""
    # Translate path if running in Docker
    container_dir = translate_path(output_dir)
    output_path = Path(container_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    files_written = []
    errors = []
    total_lines = 0

    # Primary: XML-style <FILE path="...">...</FILE> tags (backtick-safe)
    pattern = r'<FILE\s+path="([^"]+)">\n?(.*?)</FILE>'
    matches = re.findall(pattern, response_text, re.DOTALL)

    # Fallback 1: Legacy ### FILE: with ```code blocks
    if not matches:
        pattern = r'### FILE:\s*(\S+)\s*\n```(?:\w+)?\n(.*?)```'
        matches = re.findall(pattern, response_text, re.DOTALL)

    # Fallback 2: Raw content between FILE markers
    if not matches:
        pattern = r'### FILE:\s*(\S+)\s*\n(.*?)(?=### FILE:|$)'
        matches = re.findall(pattern, response_text, re.DOTALL)

    resolved_output = output_path.resolve()

    for filename, content in matches:
        content = content.strip()
        if not content:
            continue

        # Replace backtick placeholder with actual triple backticks
        content = content.replace("TRIPLE_BACKTICK", "```")

        # Security: reject absolute paths and traversal attempts
        if os.path.isabs(filename) or ".." in filename.split("/"):
            errors.append({"filename": filename, "error": "Path traversal rejected"})
            continue

        # Security: verify resolved path is inside output directory
        file_path = (output_path / filename).resolve()
        if not (file_path == resolved_output or str(file_path).startswith(str(resolved_output) + os.sep)):
            errors.append({"filename": filename, "error": "Path traversal rejected"})
            continue

        file_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            file_path.write_text(content, encoding="utf-8")
            line_count = len(content.splitlines())
            # Report host path back to Claude
            files_written.append({
                "path": translate_path_back(str(file_path)),
                "filename": filename,
                "lines": line_count
            })
            total_lines += line_count
        except Exception as e:
            errors.append({"filename": filename, "error": str(e)})

    return {
        "files_written": files_written,
        "total_files": len(files_written),
        "total_lines": total_lines,
        "errors": errors if errors else None
    }


async def generate_and_write(
    prompt: str,
    output_dir: str,
    system_prompt: str | None = None
) -> dict:
    """Generate code and write files to disk."""
    enhanced_prompt = f"""{prompt}

Output each file using this EXACT format (XML tags, NOT backticks):

<FILE path="filename.py">
[code here]
</FILE>

<FILE path="another_file.py">
[code here]
</FILE>

IMPORTANT RULES:
1. Use <FILE path="..."> and </FILE> tags to delimit files. Do NOT use triple backticks for file output.
2. If your code needs to contain literal triple backticks (e.g. markdown parsers), write TRIPLE_BACKTICK as a placeholder instead. It will be auto-replaced after extraction."""

    if not system_prompt:
        system_prompt = 'You are a senior developer. Output clean, production-ready code. No explanations, just code. Use <FILE path="filename"> and </FILE> XML tags to wrap each file. If code needs literal triple backticks, write TRIPLE_BACKTICK as a placeholder.'

    result = await generate_text(enhanced_prompt, system_prompt, max_tokens=16384)

    if result["status"] != "ok":
        return result

    write_result = parse_and_write_files(result["response"], output_dir)

    return {
        "status": "ok",
        "model": result.get("model"),
        "generation_time_ms": result.get("total_duration_ms"),
        **write_result
    }


# Tool definitions
TOOLS = [
    Tool(
        name="generate",
        description="Generate text/code using hosted LLM (Cerebras). Returns the generated text.",
        inputSchema={
            "type": "object",
            "properties": {
                "prompt": {"type": "string", "description": "The prompt for generation"},
                "system_prompt": {"type": "string", "description": "Optional system prompt"},
                "max_tokens": {"type": "integer", "description": "Max tokens to generate (default: 4096)"},
            },
            "required": ["prompt"]
        }
    ),
    Tool(
        name="generate_and_write_files",
        description="Generate code with hosted LLM and write files directly to disk. Returns only file metadata, not the code itself.",
        inputSchema={
            "type": "object",
            "properties": {
                "prompt": {"type": "string", "description": "What code to generate (include contracts, specs)"},
                "output_dir": {"type": "string", "description": "Directory to write files to"},
                "system_prompt": {"type": "string", "description": "Optional system prompt"},
            },
            "required": ["prompt", "output_dir"]
        }
    ),
    Tool(
        name="check_status",
        description="Check Cerebras API status and configuration.",
        inputSchema={
            "type": "object",
            "properties": {},
            "required": []
        }
    ),
]


@server.list_tools()
async def list_tools():
    """Return list of available tools."""
    return TOOLS


@server.call_tool()
async def call_tool(name: str, arguments: dict):
    """Handle tool calls."""
    try:
        if name == "generate":
            result = await generate_text(
                prompt=arguments["prompt"],
                system_prompt=arguments.get("system_prompt"),
                max_tokens=arguments.get("max_tokens", 4096),
            )
        elif name == "generate_and_write_files":
            result = await generate_and_write(
                prompt=arguments["prompt"],
                output_dir=arguments["output_dir"],
                system_prompt=arguments.get("system_prompt"),
            )
        elif name == "check_status":
            if not CEREBRAS_API_KEY:
                result = {
                    "status": "error",
                    "error": "CEREBRAS_API_KEY not set",
                    "url": CEREBRAS_URL,
                    "model": CEREBRAS_MODEL,
                    "setup_hint": "Set CEREBRAS_API_KEY either in ~/.claude/settings.json under \"env\" or export in ~/.zshrc - get free key at https://cloud.cerebras.ai",
                }
            else:
                # Quick health check
                try:
                    async with httpx.AsyncClient(timeout=10) as client:
                        response = await client.get(
                            f"{CEREBRAS_URL}/models",
                            headers={"Authorization": f"Bearer {CEREBRAS_API_KEY}"},
                        )
                        if response.status_code == 200:
                            models = [
                                mid for m in response.json().get("data", [])
                                if (mid := m.get("id"))
                            ]
                            result = {
                                "status": "ok",
                                "url": CEREBRAS_URL,
                                "model": CEREBRAS_MODEL,
                                "available_models": models,
                            }
                        else:
                            result = {
                                "status": "error",
                                "error": f"HTTP {response.status_code}",
                                "url": CEREBRAS_URL,
                            }
                except Exception as e:
                    result = {"status": "error", "error": str(e), "url": CEREBRAS_URL}
        else:
            result = {"status": "error", "error": f"Unknown tool: {name}"}

        return [TextContent(type="text", text=json.dumps(result, indent=2))]

    except Exception as e:
        return [TextContent(
            type="text",
            text=json.dumps({"status": "error", "error": str(e)}, indent=2)
        )]


async def main():
    """Run the MCP server."""
    if not CEREBRAS_API_KEY:
        print("Warning: CEREBRAS_API_KEY not set", file=sys.stderr)

    print("speed-run MCP server starting", file=sys.stderr)
    print(f"  URL: {CEREBRAS_URL}", file=sys.stderr)
    print(f"  Model: {CEREBRAS_MODEL}", file=sys.stderr)

    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())

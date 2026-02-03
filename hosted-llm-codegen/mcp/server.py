#!/usr/bin/env python3
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
server = Server("hosted-llm-codegen")


def translate_path(path: str) -> str:
    """Translate host path to container path when running in Docker."""
    if not IN_DOCKER or not HOST_WORKSPACE:
        return path

    # If path starts with host workspace, translate to container workspace
    if path.startswith(HOST_WORKSPACE):
        return path.replace(HOST_WORKSPACE, CONTAINER_WORKSPACE, 1)

    # If it's a relative path, prepend container workspace
    if not path.startswith("/"):
        return os.path.join(CONTAINER_WORKSPACE, path)

    return path


def translate_path_back(path: str) -> str:
    """Translate container path back to host path for reporting."""
    if not IN_DOCKER or not HOST_WORKSPACE:
        return path

    if path.startswith(CONTAINER_WORKSPACE):
        return path.replace(CONTAINER_WORKSPACE, HOST_WORKSPACE, 1)

    return path


def generate_text(
    prompt: str,
    system_prompt: str | None = None,
    max_tokens: int = 4096,
) -> dict:
    """Generate text using Cerebras API."""
    if not CEREBRAS_API_KEY:
        return {"status": "error", "error": "CEREBRAS_API_KEY not set"}

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    start_time = time.time()

    try:
        with httpx.Client(timeout=GENERATION_TIMEOUT) as client:
            response = client.post(
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

            content = data["choices"][0]["message"]["content"]
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

    # Try to match ```code blocks first
    pattern = r'### FILE:\s*(\S+)\s*\n```(?:\w+)?\n(.*?)```'
    matches = re.findall(pattern, response_text, re.DOTALL)

    # Fallback to raw content between FILE markers
    if not matches:
        pattern = r'### FILE:\s*(\S+)\s*\n(.*?)(?=### FILE:|$)'
        matches = re.findall(pattern, response_text, re.DOTALL)

    for filename, content in matches:
        content = content.strip()
        if not content:
            continue

        file_path = output_path / filename
        file_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            file_path.write_text(content)
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


def generate_and_write(
    prompt: str,
    output_dir: str,
    system_prompt: str | None = None
) -> dict:
    """Generate code and write files to disk."""
    enhanced_prompt = f"""{prompt}

Output each file using this EXACT format:

### FILE: filename.py
```python
[code here]
```

### FILE: another_file.py
```python
[code here]
```"""

    if not system_prompt:
        system_prompt = "You are a senior developer. Output clean, production-ready code. No explanations, just code. Follow the exact file format specified."

    result = generate_text(enhanced_prompt, system_prompt, max_tokens=4096)

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
            result = generate_text(
                prompt=arguments["prompt"],
                system_prompt=arguments.get("system_prompt"),
                max_tokens=arguments.get("max_tokens", 4096),
            )
        elif name == "generate_and_write_files":
            result = generate_and_write(
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
                }
            else:
                # Quick health check
                try:
                    with httpx.Client(timeout=10) as client:
                        response = client.get(
                            f"{CEREBRAS_URL}/models",
                            headers={"Authorization": f"Bearer {CEREBRAS_API_KEY}"},
                        )
                        if response.status_code == 200:
                            models = [m["id"] for m in response.json().get("data", [])]
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

    print(f"hosted-llm-codegen MCP server starting", file=sys.stderr)
    print(f"  URL: {CEREBRAS_URL}", file=sys.stderr)
    print(f"  Model: {CEREBRAS_MODEL}", file=sys.stderr)

    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())

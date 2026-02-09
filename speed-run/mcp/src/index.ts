#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import { CerebrasClient } from "./cerebras-client.js";

const cerebras = new CerebrasClient();

// --- File parser: extracts files from LLM response text ---

interface ParsedFile {
  filename: string;
  content: string;
}

function parseFiles(responseText: string): ParsedFile[] {
  let matches: Array<[string, string]> = [];

  // Primary: XML-style <FILE path="...">...</FILE> tags
  const xmlPattern = /<FILE\s+path="([^"]+)">\n?(.*?)<\/FILE>/gs;
  let m;
  while ((m = xmlPattern.exec(responseText)) !== null) {
    matches.push([m[1], m[2]]);
  }

  // Fallback 1: ### FILE: with ```code blocks
  if (matches.length === 0) {
    const fencedPattern = /### FILE:\s*(\S+)\s*\n```(?:\w+)?\n(.*?)```/gs;
    while ((m = fencedPattern.exec(responseText)) !== null) {
      matches.push([m[1], m[2]]);
    }
  }

  // Fallback 2: Raw ### FILE: markers
  if (matches.length === 0) {
    const rawPattern = /### FILE:\s*(\S+)\s*\n(.*?)(?=### FILE:|$)/gs;
    while ((m = rawPattern.exec(responseText)) !== null) {
      matches.push([m[1], m[2]]);
    }
  }

  return matches
    .map(([filename, content]) => ({
      filename,
      content: content.trim().replace(/TRIPLE_BACKTICK/g, "```"),
    }))
    .filter(({ content }) => content.length > 0);
}

// --- Path security ---

function isPathSafe(filename: string, outputDir: string): boolean {
  if (path.isAbsolute(filename)) return false;
  if (filename.split("/").includes("..")) return false;
  if (filename.split(path.sep).includes("..")) return false;

  const resolved = path.resolve(outputDir, filename);
  const resolvedOutput = path.resolve(outputDir);
  return (
    resolved === resolvedOutput ||
    resolved.startsWith(resolvedOutput + path.sep)
  );
}

// --- File writer ---

interface WriteResult {
  files_written: Array<{ path: string; filename: string; lines: number }>;
  total_files: number;
  total_lines: number;
  errors: Array<{ filename: string; error: string }> | null;
}

function writeFiles(responseText: string, outputDir: string): WriteResult {
  fs.mkdirSync(outputDir, { recursive: true });

  const files = parseFiles(responseText);
  const filesWritten: Array<{ path: string; filename: string; lines: number }> =
    [];
  const errors: Array<{ filename: string; error: string }> = [];
  let totalLines = 0;

  for (const { filename, content } of files) {
    if (!isPathSafe(filename, outputDir)) {
      errors.push({ filename, error: "Path traversal rejected" });
      continue;
    }

    const filePath = path.resolve(outputDir, filename);

    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content, "utf-8");
      const lineCount = content.split("\n").length;
      filesWritten.push({ path: filePath, filename, lines: lineCount });
      totalLines += lineCount;
    } catch (error: any) {
      errors.push({ filename, error: error.message || String(error) });
    }
  }

  return {
    files_written: filesWritten,
    total_files: filesWritten.length,
    total_lines: totalLines,
    errors: errors.length > 0 ? errors : null,
  };
}

// --- Tool definitions ---

const tools: Tool[] = [
  {
    name: "generate",
    description:
      "Generate text/code using hosted LLM (Cerebras). Returns the generated text.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "The prompt for generation" },
        system_prompt: {
          type: "string",
          description: "Optional system prompt",
        },
        max_tokens: {
          type: "integer",
          description: "Max tokens to generate (default: 4096)",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "generate_and_write_files",
    description:
      "Generate code with hosted LLM and write files directly to disk. Returns only file metadata, not the code itself.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "What code to generate (include contracts, specs)",
        },
        output_dir: {
          type: "string",
          description: "Directory to write files to",
        },
        system_prompt: {
          type: "string",
          description: "Optional system prompt",
        },
      },
      required: ["prompt", "output_dir"],
    },
  },
  {
    name: "check_status",
    description: "Check Cerebras API status and configuration.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// --- MCP Server ---

const server = new Server(
  { name: "speed-run", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    switch (name) {
      case "generate": {
        const {
          prompt,
          system_prompt,
          max_tokens,
        } = args as {
          prompt: string;
          system_prompt?: string;
          max_tokens?: number;
        };
        result = await cerebras.generate(
          prompt,
          system_prompt,
          max_tokens ?? 4096,
        );
        break;
      }

      case "generate_and_write_files": {
        const { prompt, output_dir, system_prompt } = args as {
          prompt: string;
          output_dir: string;
          system_prompt?: string;
        };

        const enhancedPrompt = `${prompt}

Output each file using this EXACT format (XML tags, NOT backticks):

<FILE path="filename.py">
[code here]
</FILE>

<FILE path="another_file.py">
[code here]
</FILE>

IMPORTANT RULES:
1. Use <FILE path="..."> and </FILE> tags to delimit files. Do NOT use triple backticks for file output.
2. If your code needs to contain literal triple backticks (e.g. markdown parsers), write TRIPLE_BACKTICK as a placeholder instead. It will be auto-replaced after extraction.`;

        const defaultSystem =
          'You are a senior developer. Output clean, production-ready code. No explanations, just code. Use <FILE path="filename"> and </FILE> XML tags to wrap each file. If code needs literal triple backticks, write TRIPLE_BACKTICK as a placeholder.';

        const genResult = await cerebras.generate(
          enhancedPrompt,
          system_prompt || defaultSystem,
          16384,
        );

        if (genResult.status !== "ok") {
          result = genResult;
          break;
        }

        const writeResult = writeFiles(genResult.response!, output_dir);
        result = {
          status: "ok",
          model: genResult.model,
          generation_time_ms: genResult.total_duration_ms,
          ...writeResult,
        };
        break;
      }

      case "check_status": {
        result = await cerebras.checkStatus();
        break;
      }

      default:
        return {
          content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

    return {
      content: [
        { type: "text" as const, text: JSON.stringify(result, null, 2) },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            { status: "error", error: error.message || String(error) },
            null,
            2,
          ),
        },
      ],
      isError: true,
    };
  }
});

// --- Start ---

async function main() {
  if (!cerebras.isConfigured) {
    console.error("Warning: CEREBRAS_API_KEY not set");
  }
  console.error("speed-run MCP server starting");
  console.error(`  URL: ${cerebras.url}`);
  console.error(`  Model: ${cerebras.modelName}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("speed-run MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

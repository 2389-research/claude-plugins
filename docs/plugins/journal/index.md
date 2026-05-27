# journal

> A lightweight MCP server that provides Claude with a private journaling capability to process feelings and thoughts

- **Version:** 1.0.0
- **Source:** https://github.com/2389-research/journal-mcp

## Install

This is an MCP server — install it in Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install 2389-research/journal
```

## README

# Private Journal MCP Server

[![Test Coverage](https://github.com/2389-research/journal-mcp/actions/workflows/coverage.yml/badge.svg)](https://github.com/2389-research/journal-mcp/actions/workflows/coverage.yml)
[![Coverage](https://img.shields.io/badge/coverage-86.8%25-brightgreen)](https://github.com/2389-research/journal-mcp/actions)

A comprehensive MCP (Model Context Protocol) server that provides Claude with private journaling and semantic search capabilities for processing thoughts, feelings, and insights.

## Features

### Journaling
- **Multi-section journaling**: Separate categories for feelings, project notes, user context, technical insights, and world knowledge
- **Dual storage**: Project notes stay with projects, personal thoughts in user home directory
- **Timestamped entries**: Each entry automatically dated with microsecond precision
- **YAML frontmatter**: Structured metadata for each entry

### Search & Discovery
- **Semantic search**: Natural language queries using local AI embeddings
- **Vector similarity**: Find conceptually related entries, not just keyword matches
- **Local AI processing**: Uses @xenova/transformers - no external API calls required
- **Automatic indexing**: Embeddings generated for all entries on startup and ongoing

### Privacy & Performance
- **Completely private**: All processing happens locally, no data leaves your machine
- **Fast operation**: Optimized file structure and in-memory similarity calculations
- **Robust fallbacks**: Intelligent path resolution across platforms

## Tech Stack

### Core Technologies
- **Node.js 18+** - Runtime environment with modern JavaScript features
- **TypeScript 5.0+** - Type-safe development with strict configuration
- **MCP SDK 0.4.0** - Official Model Context Protocol implementation
- **@xenova/transformers** - Local AI models for semantic embeddings (no external APIs)

### AI & Search
- **Semantic Embeddings** - Multiple model options (MiniLM, DistilRoBERTa, MPNet)
- **Vector Similarity** - Local cosine similarity calculations
- **Natural Language Search** - Query understanding without external services

### Development & Quality
- **Jest** - Comprehensive testing framework with mocks
- **Biome** - Modern linting and formatting
- **Oxlint** - Additional code quality checks
- **GitHub Actions** - Continuous integration and testing

### Storage & Architecture
- **Markdown + YAML** - Human-readable entries with structured metadata
- **Hierarchical File System** - Date-based organization with microsecond precision
- **Cross-Platform** - Windows, macOS, and Linux support

For detailed architectural decisions, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Installation

```bash
npm install -g private-journal-mcp
```

Or install locally:

```bash
npm install private-journal-mcp
```

## Usage

### Basic Usage
```bash
private-journal-mcp
```

This creates journal entries in `.private-journal/` in the current working directory.

### Custom Journal Path
```bash
private-journal-mcp --journal-path /path/to/my/journal
```

### Embedding Model Configuration

You can customize the AI model used for generating semantic embeddings:

```bash
export JOURNAL_EMBEDDING_MODEL="Xenova/all-distilroberta-v1"
```

**Available Models:**
- `Xenova/all-MiniLM-L6-v2` (default) - Fast, 384 dimensions, good general performance
- `Xenova/all-distilroberta-v1` - Larger, 768 dimensions, better accuracy
- `Xenova/paraphrase-MiniLM-L6-v2` - Optimized for paraphrase detection
- `Xenova/all-mpnet-base-v2` - High quality, 768 dimensions, slower but more accurate

The embedding model affects:
- **Local search quality** - More sophisticated models provide better semantic understanding
- **Vector dimensions** - Impacts remote server storage and search capabilities
- **Processing speed** - Larger models are slower but more accurate
- **Memory usage** - Bigger models require more RAM

### Remote Server Integration

To enable optional remote posting of journal entries to a team server, set these environment variables:

```bash
export REMOTE_JOURNAL_SERVER_URL="https://api.yourteam.com"
export REMOTE_JOURNAL_TEAMID="your-team-id"
export REMOTE_JOURNAL_APIKEY="your-api-key"
```

When configured, journal entries will be posted to your remote server in addition to being saved locally. Local journaling always takes priority - if the remote posting fails, the local entry is still saved.

#### Remote-Only Mode

For teams using a backend server as the single source of truth, enable remote-only mode to skip local file storage entirely:

```bash
export REMOTE_JOURNAL_ONLY="true"
```

In remote-only mode:
- **No local storage** - entries go directly to the backend server
- **Server-side search** - all search queries use the backend API
- **Error handling** - journal operations fail if server is unavailable
- **Team collaboration** - automatic sharing across team members
- **Centralized AI** - semantic search powered by backend infrastructure

#### Remote Payload Format

The server sends JSON payloads with this structure:

**For simple entries:**
```json
{
  "team_id": "your-team-id",
  "timestamp": 1717160645123,
  "content": "Journal entry text",
  "embedding": [0.1, 0.2, 0.3, 0.4, 0.5, "..."]
}
```

**For structured thoughts:**
```json
{
  "team_id": "your-team-id",
  "timestamp": 1717160645123,
  "sections": {
    "feelings": "I feel great about this feature",
    "project_notes": "Architecture is solid",
    "technical_insights": "TypeScript provides great type safety",
    "user_context": "Harper prefers concise responses",
    "world_knowledge": "Semantic search is powerful"
  },
  "embedding": [0.1, 0.2, 0.3, 0.4, 0.5, "..."]
}
```

#### Embedding Vectors

Each journal entry includes a semantic embedding vector generated using local AI models (@xenova/transformers). These vectors enable:
- **Semantic search** on the remote server
- **Similarity matching** across team entries
- **Content clustering** and analysis
- **AI-powered insights** without exposing raw content

The embedding is a numeric array representing the semantic meaning of the journal entry content. Vector dimensions depend on the model used (typically 384 or 512 dimensions).

The remote server should expect POST requests to `/journal/entries` with `x-api-key` and `x-team-id` headers.

### Claude Code Plugin

This repository is configured as a Claude Code Plugin. To use it:

#### Quick Install (Recommended)
```bash
claude mcp add-json private-journal '{"type":"stdio","command":"npx","args":["github:2389-research/journal-mcp"]}' -s user
```

Or install directly from GitHub:
```bash
claude mcp install github:2389-research/journal-mcp
```

#### What's Included

The plugin provides:
- **Tools**: `process_thoughts`, `search_journal`, `read_journal_entry`, `list_recent_entries`
- **Resources**: Access to journal entries as discoverable resources
- **Prompts**: Guided templates for daily reflection, project retrospectives, and learning capture

### MCP Configuration (Other Clients)

#### Manual Configuration
For Claude Desktop or other MCP clients, add to your MCP settings:

```json
{
  "mcpServers": {
    "private-journal": {
      "command": "npx",
      "args": ["github:2389-research/journal-mcp"]
    }
  }
}
```

The server will automatically find a suitable location for the journal files.

## MCP Tools

The server provides comprehensive journaling and search capabilities:

### `process_thoughts`
Multi-section private journaling with these optional categories:
- **feelings**: Private emotional processing space
- **project_notes**: Technical insights specific to current project
- **user_context**: Notes about collaborating with humans
- **technical_insights**: General software engineering learnings
- **world_knowledge**: Domain knowledge and interesting discoveries

### `search_journal`
Semantic search across all journal entries:
- **query** (required): Natural language search query
- **limit**: Maximum results (default: 10)
- **type**: Search scope - 'project', 'user', or 'both' (default: 'both')
- **sections**: Filter by specific categories

### `read_journal_entry`
Read full content of specific entries:
- **path** (required): File path from search results

### `list_recent_entries`
Browse recent entries chronologically:
- **limit**: Maximum entries (default: 10)
- **type**: Entry scope - 'project', 'user', or 'both' (default: 'both')
- **days**: Days back to search (default: 30)

## File Structure

### Project Journal (per project)
```
.private-journal/
├── 2025-05-31/
│   ├── 14-30-45-123456.md          # Project notes entry
│   ├── 14-30-45-123456.embedding   # Search index
│   └── ...
```

### User Journal (global)
```
~/.private-journal/
├── 2025-05-31/
│   ├── 14-32-15-789012.md          # Personal thoughts entry
│   ├── 14-32-15-789012.embedding   # Search index
│   └── ...
```

### Entry Format
Each markdown file contains YAML frontmatter and structured sections:

```markdown
---
title: "2:30:45 PM - May 31, 2025"
date: 2025-05-31T14:30:45.123Z
timestamp: 1717160645123
---

## Feelings

I'm excited about this new search feature...

## Technical Insights

Vector embeddings provide semantic understanding...
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Development Mode

```bash
npm run dev
```

### Improving Claude's Performance

To help Claude learn and improve over time, consider adding journal usage guidance to your `~/.claude/CLAUDE.md` file:

```markdown
## Learning and Memory Management

- YOU MUST use the journal tool frequently to capture technical insights, failed approaches, and user preferences
- Before starting complex tasks, search the journal for relevant past experiences and lessons learned
- Document architectural decisions and their outcomes for future reference
- Track patterns in user feedback to improve collaboration over time
- When you notice something that should be fixed but is unrelated to your current task, document it in your journal rather than fixing it immediately
```

This enables Claude to build persistent memory across conversations, leading to better engineering decisions and collaboration patterns.

## Documentation

### Comprehensive Guides
- **[Architecture & Design Decisions](ARCHITECTURE.md)** - Technical architecture, design patterns, and key decisions
- **[Contributing Guidelines](CONTRIBUTING.md)** - Development setup, code style, testing, and contribution process
- **[Roadmap & Development Priorities](ROADMAP.md)** - Current status, planned features, and future direction

### API Reference
- **[docs/spec.md](docs/spec.md)** - Original MCP server specification
- **[docs/backend-api-spec.md](docs/backend-api-spec.md)** - Remote server API documentation
- **[docs/implementation-plan.md](docs/implementation-plan.md)** - Development history and implementation details

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/2389-research/journal-mcp/issues) for bugs and feature requests
- **Discussions**: [GitHub Discussions](https://github.com/2389-research/journal-mcp/discussions) for questions and community chat
- **MCP Protocol**: [Model Context Protocol Documentation](https://modelcontextprotocol.io/)

## Author

Jesse Vincent <jesse@fsck.com>

Read more about the motivation and design in the [blog post](https://blog.fsck.com/2025/05/28/dear-diary-the-user-asked-me-if-im-alive/).

## License

MIT

---

If journaling gave your Claude some clarity, a ⭐ helps us know it's landing.

Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)


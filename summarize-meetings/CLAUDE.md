# Summarize Meetings Plugin

## Overview

Batch-process meeting transcripts from an Obsidian vault into structured summaries with knowledge graph updates. Designed for Granola transcripts but works with any meeting note format.

## Skill Included

### summarize-meetings

**Trigger keywords**: summarize meetings, process meetings, meeting summaries, extract from meetings, meeting insights

**When to use**:
- Processing a backlog of meeting transcripts
- Summarizing individual or batches of meetings
- Extracting people, action items, and concepts from meetings
- Building out an Obsidian knowledge graph from meeting content

**What it does**:
1. Scans a target month's transcripts sorted by size
2. Triages files (skips empty stubs, scheduling fragments, non-meeting content)
3. Dispatches parallel agents (10-15 per wave) to process transcripts
4. Each agent extracts: People, Action Items, Project Ideas, Blog Ideas, Knowledge Graph, Concepts, Ideas
5. Writes structured summary files with YAML frontmatter and wiki-links
6. Creates/updates People notes, Concept notes, and Project stubs in the vault
7. Compiles a monthly report table with processing stats
8. Posts a social media completion update

## Key Patterns

- **Monthly batch processing** — most-recent month first, waves of 10-15 parallel agents
- **Triage before dispatch** — files < 2K are likely empty, "untitled" files are almost always stubs
- **Name resolution** — cross-reference transcript names with vault People notes and aliases
- **Concept deduplication** — always search existing Concepts/ before creating new notes
- **Wiki-links throughout** — all entity references use `[[double-bracket]]` Obsidian links

## Vault Structure

```
Meetings/
  transcripts/     # Source transcripts (never modified)
  *-summary.md     # Generated summary files
People/            # Person notes (Title Case filenames)
Concepts/          # Reusable insight notes
Projects/          # Project stub notes
```

## Integration

- Uses `mcp__socialmedia__create_post` for completion updates
- Designed for Granola transcript format but handles other formats
- Parallel agent dispatch via Task tool for throughput

## Auto-Detection

Skill triggers on meeting-related keywords in the context of Obsidian vault work.

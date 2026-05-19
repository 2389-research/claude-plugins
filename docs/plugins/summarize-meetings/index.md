# summarize-meetings

> Batch-process meeting transcripts from Obsidian vault into structured summaries with knowledge graph updates, people notes, and concept extraction

- **Version:** 1.0.0
- **Source:** https://github.com/2389-research/summarize-meetings
- **Install:** `/plugin install 2389-research/summarize-meetings`

## Install via marketplace

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install 2389-research/summarize-meetings
```

## README

# Summarize Meetings

Meeting transcripts pile up. The names, the action items, the project ideas, they're all in there but nobody's going back to read them. This skill turns a backlog of Granola transcripts into a connected Obsidian knowledge graph. Processes meetings in monthly batches, extracts the stuff that matters, and wires it all together with wiki-links. We used it to process ~600 meetings into something actually useful: [My Now Immaculate Knowledge Graph of Life](https://harper.blog/2026/03/11/2026-immaculate-knowledge-graph/)

![network-annotated_hu_dc5f11550bad1d72](https://github.com/user-attachments/assets/76a71ed6-018a-4dc6-8aff-79c2d76b86df)
*Obsidian graph view after processing ~600 meetings. Nodes are people and concepts, edges are co-occurrence in the same meeting.*

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install summarize-meetings@2389-research
```

## What it does

Point this at a month of meeting transcripts and it will:

- Read each transcript, skip the junk (empty stubs, scheduling fragments, recording setup chats)
- Dispatch 10-15 parallel agents to process the real meetings
- Write a summary file for each meeting with YAML frontmatter and a narrative recap
- Create or update People notes in `People/` (checks for existing entries and aliases first)
- Pull out concepts worth their own atomic note in `Concepts/`
- Stub out any projects mentioned that don't already exist
- Report back with a table of what got processed and what got skipped

## What gets extracted

From each meeting, agents pull out seven categories: people, action items, project ideas, blog ideas, knowledge graph connections, concepts, and general ideas. The summary file includes all of these plus a 2-4 paragraph narrative that reads like a real meeting recap — what happened, what mattered, what the vibe was.

## Triage

Not everything in `Meetings/transcripts/` is worth a summary. The skill skips files that are empty stubs, have fewer than 20 words of real content, are garbled recordings, or are medical appointments and kid-related content. Sparse but real notes (like bullet points from a fundraising call) still get processed.

## How it works

```
Scan month → Triage → Dispatch agents in waves → Compile report → Post update
```

Agents run in parallel (waves of 10-15) and each one handles a single transcript end-to-end. Large files (50K+) get chunked automatically.

## Documentation

The full workflow, templates, and extraction rules are in [skills/SKILL.md](skills/SKILL.md).

## Like this?

If Summarize Meetings saved you from transcript purgatory, a star ⭐️ helps us know it's landing.


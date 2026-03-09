# Summarize Meetings

Turn a pile of Granola transcripts into an Obsidian knowledge graph. Processes meetings in monthly batches, extracts the stuff that matters, and wires it all together with wiki-links.

## Installation

```bash
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

# Worldview Synthesis Plugin

Surface your beliefs, identify the tensions between them, and generate narrative outputs for personal philosophy documentation.

## Installation

```bash
/plugin install worldview-synthesis@2389-research
```

## What this plugin provides

### Skills

- `worldview-synthesis` -- methodology for articulating personal philosophy through structured interrogation, tension mapping, and narrative generation

### Reference materials

- `interrogation-questions.md` -- 6 rounds of ready-to-use questions covering mortality, body, relationships, emotion, work, ethics, society, and future

## Quick example

Start with: "Help me articulate my worldview"

The skill guides you through:
1. Bootstrap -- create project structure for beliefs and narratives
2. Seed -- extract ideas from your influences (books, people, experiences)
3. Interrogate -- 4-6 rounds of multi-choice questions across 20 domains
4. Capture tensions -- name contradictions, don't resolve them
5. Generate narratives -- mission, thesis, synopsis, full narrative
6. Iterate -- a worldview is living, update as you evolve

## Core principle

A worldview isn't a list of opinions. It's a graph of beliefs with tensions. The goal is to surface what you already believe, name the contradictions, and synthesize into something you can share.

## Output examples

Mission (~100 words):
```
Put people first. Prepare for what's coming. Fight anyway.
Find the cracks. Leave no trace.
```

Idea node:
```yaml
- id: strategic-ruthlessness
  claim: "Sometimes you have to crush opponents"
  confidence: 0.7
  tensions: [collaboration-over-competition]
```

Tension:
```yaml
- id: collaboration-vs-ruthlessness
  status: embraced  # Live in the paradox
```

## When this skill applies

- "I want to articulate my values"
- "Help me figure out what I believe"
- Writing a manifesto or leadership philosophy
- Defining company culture
- Personal philosophy documentation

## Links

- [Plugin CLAUDE.md](./CLAUDE.md) -- development instructions

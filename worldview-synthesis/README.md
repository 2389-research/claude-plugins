# Worldview Synthesis Plugin

Systematic worldview articulation - surface beliefs, identify tensions, and generate narrative outputs for personal philosophy documentation.

## Installation

```bash
/plugin install worldview-synthesis@2389-research
```

## What This Plugin Provides

### Skills

- **worldview-synthesis** - Complete methodology for articulating personal philosophy through structured interrogation, tension mapping, and narrative generation

### Reference Materials

- **interrogation-questions.md** - 6 rounds of ready-to-use questions covering mortality, body, relationships, emotion, work, ethics, society, and future

## Quick Example

Start with: "Help me articulate my worldview"

The skill guides you through:
1. **Bootstrap** - Create project structure for beliefs and narratives
2. **Seed** - Extract ideas from your influences (books, people, experiences)
3. **Interrogate** - 4-6 rounds of multi-choice questions across 20 domains
4. **Capture Tensions** - Name contradictions, don't resolve them
5. **Generate Narratives** - Mission → Thesis → Synopsis → Full Narrative
6. **Iterate** - A worldview is living, update as you evolve

## Core Principle

A worldview isn't a list of opinions—it's a graph of beliefs with tensions. The goal is to surface what you already believe, name the contradictions, and synthesize into something you can share.

## Output Examples

**Mission (~100 words):**
```
Put people first. Prepare for what's coming. Fight anyway.
Find the cracks. Leave no trace.
```

**Idea Node:**
```yaml
- id: strategic-ruthlessness
  claim: "Sometimes you have to crush opponents"
  confidence: 0.7
  tensions: [collaboration-over-competition]
```

**Tension:**
```yaml
- id: collaboration-vs-ruthlessness
  status: embraced  # Live in the paradox
```

## When This Skill Applies

- "I want to articulate my values"
- "Help me figure out what I believe"
- Writing a manifesto or leadership philosophy
- Defining company culture
- Personal philosophy documentation

## Links

- [Plugin CLAUDE.md](./CLAUDE.md) - Development instructions

# Worldview Synthesis Plugin

## Overview

This plugin provides a systematic methodology for helping people articulate, explore, and document their personal worldview, values, and philosophy. It treats a worldview as a graph of beliefs with tensions—not a simple list of opinions.

## Skills Included

### worldview-synthesis (Main Skill)

Auto-detects when someone wants to:
- Articulate their values or beliefs
- Document their personal philosophy
- Write a manifesto or mission statement
- Define leadership philosophy or company culture
- Explore what they believe and why

## Key Patterns

### The Six Phases

1. **Bootstrap Structure** - Create data/ and narrative/ directories
2. **Seed from Sources** - Extract ideas from influences
3. **Interrogation Rounds** - 4-6 rounds of structured questions
4. **Capture Tensions** - Name contradictions, don't resolve them
5. **Generate Narratives** - Ascending scales from mission to full essay
6. **Iterate** - Worldview is living, update over time

### Idea Node Schema

```yaml
- id: kebab-case-unique-id
  title: "Human Readable Title"
  domain: personal | ethics | society | technology | metaphysics
  claim: "The actual belief in one clear sentence"
  confidence: 0.0-1.0
  importance: 0.0-1.0
  tensions: [ideas-this-contradicts]
```

### Tension Statuses

- **embraced** - Both sides true, live in the paradox
- **resolved** - Found synthesis that dissolves tension
- **unresolved** - Genuinely uncertain, honest about it

### Question Design Rules

- 2-4 options per question with label + description
- Use `multiSelect: true` when beliefs can coexist
- Options should be genuinely different, not leading
- Cover hard domains: death, money, conflict, ethics

## Reference Materials

The `skills/references/interrogation-questions.md` file contains 6 rounds of ready-to-use questions:

1. **Foundations** - Death, spirituality, love, children
2. **Body & Pleasure** - Health, vices, money, competition
3. **Relationships & Learning** - Trust, learning, nature, leadership
4. **Emotion & Recognition** - Anger, fame, rest, conflict
5. **Work & Ethics** - Work philosophy, failure, hard lines, politics
6. **Society & Future** - Diagnosis, future orientation, preparation, legacy

## Red Flags to Watch For

- "I don't have a worldview" → Everyone does, start with sources
- No tensions found → Dig deeper, everyone has contradictions
- All high confidence → Push on uncertainty
- Only "should" beliefs → Ask what they actually DO
- Avoiding hard questions → Death, money, conflict—go there

## Output Quality Checklist

- Core thesis is one sentence
- Mission fits on a card
- Tensions are named, not hidden
- Hard lines are clear (non-negotiables)
- Softer truths acknowledged (where grace lives)
- Narrative voice sounds like the person
- Contradictions embraced, not resolved away

## Development Notes

When facilitating worldview exploration:
1. Use AskUserQuestion tool for interrogation rounds
2. Capture all responses in structured YAML
3. Watch for emergent tensions between answers
4. Generate narratives at ascending scales
5. The person's voice should come through in outputs

# Workflows Plugin

## Overview

This plugin establishes workflow conventions used across all 2389 plugins. Other plugins reference these conventions but don't require them.

## Skills Included

### workflows

Meta-skill that establishes:
- Terminal title update conventions
- TodoWrite task tracking patterns
- Skill composition and usage patterns

## Conventions

### Terminal Title Updates

Standard format: `[emoji] [project] > [topic]`

Examples:
- `🔥 firebase-app > authentication setup`
- `⚛️  react-dashboard > user profile component`
- `🎨 design-system > dark mode theming`

### TodoWrite Patterns

Each task should be granular (2-5 minutes):

```javascript
{
  content: "Write the failing test",      // Imperative form
  status: "pending",                       // or "in_progress" or "completed"
  activeForm: "Writing the failing test"   // Present continuous form
}
```

**Task lifecycle:**
1. Create todos for all steps
2. Mark ONE task as in_progress
3. Complete the task
4. Mark as completed
5. Move to next task

**Never:**
- Batch complete multiple tasks
- Have multiple tasks in_progress
- Skip marking tasks completed

### Skill Usage Patterns

**Finding relevant skills:**
1. Check available skills list
2. Match user intent to skill description
3. Invoke appropriate skill or sub-skill

**Composing skills:**
- Skills can reference other skills with `@skill-name` syntax
- Sub-skills use colon notation: `parent-skill:sub-skill`
- Always check skill frontmatter for exact name

## Development Workflow

This is a meta-skill that doesn't perform work directly. It establishes patterns used by other skills:

- `css-development` uses TodoWrite conventions
- `firebase-development` uses TodoWrite conventions
- `terminal-title` follows title format conventions

## Used By

These plugins benefit from workflows conventions:
- css-development
- firebase-development
- terminal-title

## Documentation

See [skills/SKILL.md](skills/SKILL.md) for complete workflow documentation.

## Integration

Other plugins reference workflows conventions but don't require installation. Installing workflows provides:
- Explicit documentation of conventions
- Meta-skill for skill usage guidance
- Centralized pattern reference

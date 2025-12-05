# Workflows Plugin

2389 workflow conventions including terminal title updates and TodoWrite patterns.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install workflows@2389-research
```

## What This Plugin Provides

Establishes workflow conventions used across 2389 projects:

- **Terminal title management**: Standards for terminal title updates
- **TodoWrite patterns**: Granular checklist conventions (2-5 minute tasks)
- **Skill usage patterns**: How to properly invoke and compose skills

## Why Install This Plugin?

Other 2389 plugins reference these conventions but don't require them. Installing the workflows plugin provides:

- Consistent task tracking across all skills
- Terminal title update patterns
- Meta-skill documentation on using 2389 skills effectively

## Used By

These plugins benefit from workflows conventions:
- `css-development` - Uses TodoWrite for task tracking
- `firebase-development` - Uses TodoWrite for task tracking
- `terminal-title` - Follows terminal title standards

## Quick Example

TodoWrite tasks following workflows conventions:

```javascript
{
  content: "Write the failing test",
  status: "in_progress",
  activeForm: "Writing the failing test"
}
```

## Documentation

See [SKILL.md](skills/SKILL.md) for complete workflow conventions.

## License

Internal use only - 2389 Research

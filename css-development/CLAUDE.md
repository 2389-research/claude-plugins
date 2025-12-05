# CSS Development Plugin

## Overview

This plugin provides CSS development workflows with Tailwind composition, semantic naming, and dark mode by default.

## Skills Included

### Main Skill: css-development

Orchestrator skill that routes to specific sub-skills based on user intent:
- Creating new components → `css-development:create-component`
- Validating existing CSS → `css-development:validate`
- Refactoring CSS code → `css-development:refactor`

### Sub-Skills

- **css-development:create-component** - Create new styled components following 2389 patterns
- **css-development:validate** - Validate CSS against semantic naming, Tailwind usage, and dark mode
- **css-development:refactor** - Refactor existing CSS to meet 2389 standards

## Patterns

### Semantic Class Naming

Use descriptive class names that indicate purpose:

```css
✅ .user-profile
✅ .nav-menu
✅ .button-primary

❌ .container-1
❌ .box-blue
❌ .div-wrapper
```

### Tailwind Composition

Compose Tailwind utilities into semantic classes using `@apply`:

```css
.user-profile {
  @apply flex items-center space-x-4 p-4;
  @apply bg-white dark:bg-gray-800;
}
```

### Dark Mode by Default

Every component must include dark mode variants:

```css
.card {
  @apply bg-white dark:bg-gray-800;
  @apply text-gray-900 dark:text-gray-100;
  @apply border-gray-200 dark:border-gray-700;
}
```

## Reference Codebase

Patterns are based on: `/Users/dylanr/work/2389/oneonone/hosting`

This codebase demonstrates:
- Semantic class naming throughout
- Tailwind composition patterns
- Comprehensive dark mode coverage
- Component organization

## Development Workflow

1. **Auto-detection**: Skills auto-detect when CSS work is mentioned
2. **Routing**: Main skill routes to appropriate sub-skill
3. **TodoWrite integration**: Creates granular checklists for tasks
4. **Pattern validation**: Validates against 2389 standards

## Testing

Tests are located in `tests/integration/`:
- `skill-routing.test.md` - Tests skill auto-detection and routing

## Documentation

- [Design Document](docs/plans/2025-11-13-css-development-skill-design.md)
- [Implementation Plan](docs/plans/2025-11-13-css-development-skill-implementation.md)
- [Examples](docs/examples/css-development-examples.md)

## Integration with Workflows Plugin

The workflows plugin provides:
- TodoWrite conventions for task tracking
- Terminal title update patterns
- Meta-skill usage guidance

To install: `/plugin install workflows@2389-research`

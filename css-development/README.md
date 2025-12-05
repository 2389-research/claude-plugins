# CSS Development Plugin

CSS development workflows with Tailwind composition, semantic naming, and dark mode by default.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install css-development@2389-research
```

## What This Plugin Provides

Skills for CSS development following 2389 patterns:

- **css-development** - Main orchestrator skill that routes to specific sub-skills
- **css-development:create-component** - Create new styled components
- **css-development:validate** - Validate CSS against patterns
- **css-development:refactor** - Refactor existing CSS

## Patterns

This plugin enforces:

- **Semantic class naming**: `.user-profile`, `.nav-menu` (not `.container-1`, `.box-blue`)
- **Tailwind composition**: Use `@apply` to compose utilities into semantic classes
- **Dark mode by default**: Every component includes `dark:` variants
- **Test coverage**: Static analysis + component rendering tests

## Reference Codebase

Patterns are based on: `/Users/dylanr/work/2389/oneonone/hosting`

## Quick Example

```css
.user-profile {
  @apply flex items-center space-x-4 p-4 bg-white dark:bg-gray-800;
}

.user-profile__avatar {
  @apply w-12 h-12 rounded-full;
}

.user-profile__name {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100;
}
```

## Optional: Install Workflows Plugin

For enhanced integration with 2389 conventions:
```bash
/plugin install workflows@2389-research
```

## Documentation

- [Design Document](docs/plans/2025-11-13-css-development-skill-design.md)
- [Implementation Plan](docs/plans/2025-11-13-css-development-skill-implementation.md)
- [Examples](docs/examples/css-development-examples.md)

## License

Internal use only - 2389 Research

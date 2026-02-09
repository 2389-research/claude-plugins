# CSS Development Plugin

CSS development workflows with Tailwind composition, semantic naming, and dark mode by default.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install css-development@2389-research
```

## What this plugin provides

Skills for CSS development following 2389 patterns:

- `css-development` -- main orchestrator skill that routes to specific sub-skills
- `css-development:create-component` -- create new styled components
- `css-development:validate` -- validate CSS against patterns
- `css-development:refactor` -- refactor existing CSS

## Patterns

This plugin enforces:

- Semantic class naming -- `.user-profile`, `.nav-menu` (not `.container-1`, `.box-blue`)
- Tailwind composition -- use `@apply` to compose utilities into semantic classes
- Dark mode by default -- every component includes `dark:` variants
- Test coverage -- static analysis + component rendering tests

## Quick example

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

## Documentation

- [Design document](docs/plans/2025-11-13-css-development-skill-design.md)
- [Implementation plan](docs/plans/2025-11-13-css-development-skill-implementation.md)
- [Examples](docs/examples/css-development-examples.md)



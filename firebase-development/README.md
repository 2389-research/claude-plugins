# Firebase development plugin

Firebase project workflows including setup, features, debugging, and validation.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install firebase-development@2389-research
```

## What this plugin provides

Skills for Firebase development following 2389 patterns:

- `firebase-development` -- main orchestrator skill that routes to specific sub-skills
- `firebase-development:project-setup` -- initialize new Firebase projects
- `firebase-development:add-feature` -- add features to existing projects
- `firebase-development:debug` -- debug Firebase issues
- `firebase-development:validate` -- validate project structure

## Patterns

This plugin supports multi-hosting (multiple sites or single), authentication via custom API keys or Firebase Auth or both, Cloud Functions organized as Express apps or domain-grouped or individual files, and server-write-only vs client-write security models.

Development is emulator-first -- always test locally before deploying. Tooling is TypeScript, vitest, and biome.

## Quick example

```typescript
// Cloud Function with domain grouping
export const users = {
  onCreate: onDocumentCreated('users/{userId}', async (event) => {
    // Implementation
  }),
  onUpdate: onDocumentUpdated('users/{userId}', async (event) => {
    // Implementation
  })
};
```

## Documentation

- [Design Document](docs/plans/2025-01-14-firebase-skills-design.md)
- [Implementation Plan](docs/plans/2025-01-14-firebase-skills-implementation.md)
- Examples:
  - [API Key Authentication](docs/examples/api-key-authentication.md)
  - [Emulator Workflow](docs/examples/emulator-workflow.md)
  - [Express Function Architecture](docs/examples/express-function-architecture.md)
  - [Firestore Rules Patterns](docs/examples/firestore-rules-patterns.md)
  - [Multi-Hosting Setup](docs/examples/multi-hosting-setup.md)



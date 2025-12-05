# Firebase Development Plugin

Firebase project workflows including setup, features, debugging, and validation.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install firebase-development@2389-research
```

## What This Plugin Provides

Skills for Firebase development following 2389 patterns:

- **firebase-development** - Main orchestrator skill that routes to specific sub-skills
- **firebase-development:project-setup** - Initialize new Firebase projects
- **firebase-development:add-feature** - Add features to existing projects
- **firebase-development:debug** - Debug Firebase issues
- **firebase-development:validate** - Validate project structure

## Patterns

This plugin supports:

- **Multi-hosting setup**: Multiple sites or single hosting
- **Authentication**: Custom API keys, Firebase Auth, or both
- **Cloud Functions**: Express, domain-grouped, or individual files
- **Security models**: Server-write-only vs client-write with validation
- **Emulator-first development**: Always test locally before deploying
- **Modern tooling**: TypeScript, vitest, biome

## Reference Codebases

Patterns are based on:
- **oneonone**: `/Users/dylanr/work/2389/oneonone` (Express API, custom API keys)
- **bot-socialmedia**: `/Users/dylanr/work/2389/bot-socialmedia-server` (Domain-grouped, Firebase Auth)
- **meme-rodeo**: `/Users/dylanr/work/2389/meme-rodeo` (Individual functions, entitlements)

## Quick Example

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

## Optional: Install Workflows Plugin

For enhanced integration with 2389 conventions:
```bash
/plugin install workflows@2389-research
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

## License

Internal use only - 2389 Research

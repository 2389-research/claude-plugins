# Firebase Development Plugin

## Overview

This plugin provides Firebase project workflows including setup, features, debugging, and validation.

## Skills Included

### Main Skill: firebase-development

Orchestrator skill that routes to specific sub-skills based on user intent:
- New project setup → `firebase-development:project-setup`
- Adding features → `firebase-development:add-feature`
- Debugging issues → `firebase-development:debug`
- Validating structure → `firebase-development:validate`

### Sub-Skills

- **firebase-development:project-setup** - Initialize new Firebase projects with proper structure
- **firebase-development:add-feature** - Add features to existing Firebase projects
- **firebase-development:debug** - Debug Firebase-related issues systematically
- **firebase-development:validate** - Validate Firebase project structure and configuration

## Patterns

### Multi-Hosting Setup

Support both single hosting and multiple sites:

```json
{
  "hosting": [
    {
      "site": "main-site",
      "public": "dist",
      "rewrites": [...]
    },
    {
      "site": "admin-site",
      "public": "admin-dist",
      "rewrites": [...]
    }
  ]
}
```

### Authentication Models

Three authentication patterns:
1. **Custom API keys** - Server-side validation
2. **Firebase Auth** - Client-side authentication
3. **Hybrid** - Both methods for different use cases

### Cloud Functions Organization

Three organizational patterns:

**Express API:**
```typescript
const app = express();
app.get('/api/users', async (req, res) => { ... });
export const api = onRequest(app);
```

**Domain-grouped:**
```typescript
export const users = {
  onCreate: onDocumentCreated(...),
  onUpdate: onDocumentUpdated(...)
};
```

**Individual files:**
```typescript
export const userOnCreate = onDocumentCreated(...);
export const userOnUpdate = onDocumentUpdated(...);
```

### Emulator-First Development

Always develop locally with emulators before deploying:

```bash
firebase emulators:start
```

## Reference Codebases

### oneonone
Path: `/Users/dylanr/work/2389/oneonone`

- Express API architecture
- Custom API key authentication
- Server-write-only security model
- Single hosting configuration

### bot-socialmedia
Path: `/Users/dylanr/work/2389/bot-socialmedia-server`

- Domain-grouped functions
- Firebase Auth integration
- Client-write with validation rules
- Complex security rules

### meme-rodeo
Path: `/Users/dylanr/work/2389/meme-rodeo`

- Individual function files
- Entitlements system
- User permissions
- Fine-grained access control

## Development Workflow

1. **Auto-detection**: Skills auto-detect when Firebase work is mentioned
2. **Routing**: Main skill routes to appropriate sub-skill based on context
3. **TodoWrite integration**: Creates granular checklists for tasks
4. **Emulator testing**: Always test locally before deployment

## Testing

Tests are located in `tests/integration/`:
- `firebase-skill-routing.test.md` - Tests skill auto-detection and routing

## Documentation

### Design & Implementation
- [Design Document](docs/plans/2025-01-14-firebase-skills-design.md)
- [Implementation Plan](docs/plans/2025-01-14-firebase-skills-implementation.md)

### Examples
- [API Key Authentication](docs/examples/api-key-authentication.md)
- [Emulator Workflow](docs/examples/emulator-workflow.md)
- [Express Function Architecture](docs/examples/express-function-architecture.md)
- [Firestore Rules Patterns](docs/examples/firestore-rules-patterns.md)
- [Multi-Hosting Setup](docs/examples/multi-hosting-setup.md)

## Integration with Workflows Plugin

The workflows plugin provides:
- TodoWrite conventions for task tracking
- Terminal title update patterns
- Meta-skill usage guidance

To install: `/plugin install workflows@2389-research`

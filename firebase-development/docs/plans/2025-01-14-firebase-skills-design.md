# Firebase Skills System Design

**Date:** 2025-01-14
**Status:** Approved
**Reference Projects:**
- `/Users/dylanr/work/2389/oneonone` - Express API, custom API keys, server-write-only
- `/Users/dylanr/work/2389/bot-socialmedia-server` - Domain-grouped functions, Firebase Auth + roles
- `/Users/dylanr/work/2389/meme-rodeo` - Individual functions, Firebase Auth + entitlements

## Overview

A comprehensive skill system for Firebase development following the orchestrator pattern (similar to CSS skills). Covers project setup, feature development, debugging, and validation using patterns extracted from three production Firebase projects.

## Architecture

### Orchestrator Pattern

**Main Skill:** `firebase-development/SKILL.md`
- Detects user intent through keyword analysis (deterministic routing)
- Documents all shared Firebase patterns (centralized, referenced by sub-skills)
- Routes to appropriate sub-skill
- Falls back to AskUserQuestion if intent is ambiguous

**Four Sub-Skills:**

1. **project-setup** - Initialize new Firebase project with proven architecture (12-14 steps)
2. **add-feature** - Add Cloud Functions, Firestore collections, API endpoints (10-12 steps)
3. **debug** - Troubleshoot emulator issues, rule violations, function errors (8-10 steps)
4. **validate** - Review code against security model and patterns (8-9 steps)

### Routing Keywords

**project-setup:** "new firebase project", "initialize firebase", "firebase init", "set up firebase", "create firebase app"

**add-feature:** "add function", "create endpoint", "new tool", "add api", "new collection", "add feature", "build"

**debug:** "error", "not working", "debug", "emulator issue", "rules failing", "permission denied", "troubleshoot"

**validate:** "review firebase", "check firebase", "validate", "audit firebase", "look at firebase code"

## Shared Firebase Patterns

These patterns are documented once in the main orchestrator skill and referenced by all sub-skills.

### Multi-Hosting Setup

**`site:` based (preferred for simplicity):**
- Direct mapping to Firebase hosting sites
- Each site gets its own URL: `project-name.web.app`
- Must create sites first: `firebase hosting:sites:create site-name`
- Deploy: `firebase deploy --only hosting:site-name`
- Example: oneonone uses 3 separate sites

**`target:` based (use when you need predeploy hooks):**
- Named targets linked to sites: `firebase target:apply hosting main my-site`
- Supports predeploy scripts for building before deployment
- More flexible for monorepo coordination
- Deploy: `firebase deploy --only hosting:main`
- Example: bot-socialmedia uses targets with build scripts

**Single hosting with rewrites:**
- One hosting site, routes via rewrites to functions
- Simplest for smaller projects
- Example: meme-rodeo uses this approach

**Guidance:** Prefer `site:` for clean separation. Use `target:` when you need predeploy hooks or monorepo builds. Use single-with-rewrites for simpler projects.

### Authentication

**Custom API Keys (for MCP tools, APIs, server-to-server):**
- Project-prefixed format: `{prefix}_` + unique identifier
- Prefix guidance: Use 3-4 character project abbreviation (e.g., `ooo_` for OneOnOne, `meme_` for Meme Rodeo)
- Store in Firestore: `/users/{userId}/apiKeys/{keyId}` subcollection
- Validate via middleware: collectionGroup query, check `active` field
- Example: oneonone's `functions/src/middleware/apiKeyGuard.ts`

**Firebase Auth + Roles (for user-facing apps):**
- Firebase Authentication with custom claims or Firestore role fields
- Store roles in `/users/{userId}` document: `role` or `entitlement` field
- Use in rules: `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role`
- Example: bot-socialmedia uses `role` (admin/teamlead/user), meme-rodeo uses `entitlement` (admin/moderator/public/waitlist)

**Both Can Coexist:**
- Firebase Auth for web UI + API keys for programmatic access
- Example: user logs in via Firebase Auth, but MCP tools use API keys
- Document when to use each and how they complement each other

### Cloud Functions Architecture

**Express app with routing (best for API-like projects):**
- Single Express app exported as one function
- Internal routing with middleware (auth, logging, CORS)
- Organized in folders: `tools/`, `middleware/`, `services/`, `admin/`
- Example: oneonone's `functions/src/index.ts` with tool routing
- **Key insight:** Use hosting rewrites to route API paths to function

**Domain-grouped files (best for feature-rich apps):**
- Files by domain: `posts.ts`, `journal.ts`, `admin.ts`, `teamSummaries.ts`
- Each file exports multiple related functions
- Clear domain boundaries, easy to find functionality
- Example: bot-socialmedia's `functions/src/` structure

**Individual function files (best for independent functions):**
- Each function in its own file: `upload.js`, `searchMemes.js`, `generateInvite.js`
- Maximum modularity, clear separation
- Imported by central `index.js`
- Example: meme-rodeo's `functions/functions/` pattern

**Guidance:** Use Express for API endpoints with many related routes. Use domain-grouped for apps with distinct feature areas. Use individual files for collections of independent functions.

### Security Model

**Default: Server-Write-Only**
- Client can ONLY read data
- All writes via Cloud Functions with admin SDK
- Firestore rules: `allow write: if false` everywhere
- **Strongly prefer for light-write applications**
- Maximum security, easier to audit, single source of truth
- Example: oneonone uses this exclusively

**When Needed: Client-Write with Validation**
- Client can write with strict validation rules
- Use for high-volume writing scenarios (social feeds, messaging)
- Requires careful Firestore rules with `diff().affectedKeys()` validation
- Better UX (no function latency), less function overhead
- Example: bot-socialmedia allows client posts/journal writes, meme-rodeo allows file updates

**Trade-offs:**
- Server-write: More secure, simpler rules, but requires function for every mutation
- Client-write: Faster UX, but complex rules and larger attack surface

### Firestore Rules Patterns

**Helper Function Extraction (universal pattern):**
```javascript
function isAuthenticated() {
  return request.auth != null;
}

function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}

function isTeamMember(teamId, userId) {
  let team = get(/databases/$(database)/documents/teams/$(teamId)).data;
  return team != null && team.members.hasAny([{'uid': userId}]);
}
```
- All three projects use this heavily
- Makes rules readable and maintainable
- Reuse logic across multiple match statements

**`diff().affectedKeys()` Validation (for client-write security):**
```javascript
allow update: if request.auth != null &&
              request.resource.data.diff(resource.data).affectedKeys()
                .hasOnly(['displayName', 'bio', 'photoURL']);
```
- Strict field-level control: only allow specific fields to change
- Prevents privilege escalation attacks
- Example: bot-socialmedia uses extensively to protect sensitive fields

**Role-Based Access with `get()` Lookups:**
```javascript
function isAdmin() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```
- Look up user roles/entitlements from `/users/{uid}` document
- Centralized role management
- Example: both meme-rodeo and bot-socialmedia check roles this way

**Collection Group Query Support:**
```javascript
// Allow collectionGroup queries on messages
match /{path=**}/messages/{messageId} {
  allow read: if true;
}
```
- Separate match rule for cross-collection queries
- Example: oneonone uses for sessions/messages across project-agents

**Guidance:** Always extract helper functions. Use `diff().affectedKeys()` for any client-write scenario. Use role-based access when you have user hierarchies. Add collection group rules when you need to query across subcollections.

### Emulator-First Development

**Essential Configuration:**
```json
"emulators": {
  "auth": { "port": 9099 },
  "functions": { "port": 5001 },
  "firestore": { "port": 8080 },
  "hosting": { "port": 5000 },
  "ui": { "enabled": true, "port": 4000 },
  "singleProjectMode": true
}
```

**`singleProjectMode: true`** (essential):
- Allows emulators to work together seamlessly
- All three projects use this
- Never develop without emulators

**Emulator UI Always Enabled:**
- Access at http://127.0.0.1:4000
- Essential for debugging Firestore data, Auth users, viewing function logs
- All three projects enable this

**Client-Side Emulator Detection:**
```typescript
// hosting/lib/firebase.ts pattern
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';

  if (useEmulators) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  }
}
```
- Environment variable: `NEXT_PUBLIC_USE_EMULATORS=true` in `.env.local`
- Automatically connects to local emulators
- Example: oneonone's hosting code

**Data Persistence/Import-Export:**
- Data location: `.firebase/emulator-data`
- Export on clean shutdown: Ctrl+C (graceful exit)
- Import on startup: automatic from `.firebase/emulator-data`
- Fresh start: delete `.firebase/emulator-data` directory

### Modern Tooling Standards

**TypeScript Only:**
- All code examples in TypeScript
- No JavaScript examples (simplifies maintenance)
- Both recent projects (oneonone, bot-socialmedia) use TypeScript

**Testing with vitest:**
- Main config: `vitest.config.ts`
- Emulator-specific config: `vitest.emulator.config.ts`
- Coverage tracking enabled
- Example: bot-socialmedia's test setup

**Linting with biome:**
- Modern, fast alternative to ESLint + Prettier
- Configuration in `biome.json`

**ABOUTME Comment Pattern:**
```typescript
// ABOUTME: Brief description of what this file does
// ABOUTME: Second line with additional context
```
- Every file starts with 2-line comment
- Makes grepping for file purposes easy: `grep "ABOUTME:" **/*.ts`
- Both TypeScript projects use this

### Testing Requirements

**Unit Tests:**
- Test handlers, utilities, validators in isolation
- Mock Firestore/Auth when needed
- Fast, no emulator dependency
- Example: bot-socialmedia's `__tests__/` structure

**Integration Tests:**
- Test full endpoint calls with emulators
- Real Firestore/Auth/Functions interaction
- Use `vitest.emulator.config.ts`
- Verify complete workflows

**Coverage:**
- Both types required for every sub-skill
- Skills enforce test-driven development (write tests first)
- Integration with superpowers:test-driven-development skill

## Sub-Skill Detailed Workflows

### 1. firebase-development/project-setup/

**Purpose:** Initialize new Firebase project with proven architecture

**TodoWrite Checklist (12-14 steps):**

1. Check if firebase CLI is installed (`firebase --version`), guide installation if needed
2. Run `firebase init` with interactive selection (Firestore, Functions, Hosting, Emulators)
3. Choose authentication approach (API keys, Firebase Auth, or both) - use AskUserQuestion
4. Set up hosting configuration (single site vs multi-site/target) - use AskUserQuestion
5. Configure functions architecture (Express, domain-grouped, or individual) - use AskUserQuestion
6. Create TypeScript project structure with proper folders based on chosen architecture
7. Set up `firestore.rules` with helper functions (`isAuthenticated`, `isOwner`)
8. Configure emulators (singleProjectMode: true, UI enabled: true, data persistence)
9. Create `package.json` with vitest, biome dependencies and scripts
10. Add ABOUTME comments to initial files
11. Set up environment variables (`.env.local` for hosting with emulator detection)
12. Initialize git repo and add comprehensive `.gitignore`
13. Run `firebase emulators:start` for first time and verify all services
14. Create initial test files structure (unit + integration)

**Key Decisions Made via AskUserQuestion:**
- Authentication: API keys / Firebase Auth / Both
- Hosting: site: / target: / single-with-rewrites
- Functions: Express / domain-grouped / individual
- Security model: server-write-only / client-write-validated

**Triggers:**
- "Create a new Firebase project"
- "Initialize Firebase"
- "Set up a new Firebase app"
- "Start new Firebase project"

### 2. firebase-development/add-feature/

**Purpose:** Add new functionality to existing Firebase project

**TodoWrite Checklist (10-12 steps):**

1. Identify feature type (Cloud Function, Firestore collection, hosting page, etc.)
2. Check existing project architecture (Express/domain/individual)
3. Create new function file(s) with ABOUTME comments matching project structure
4. Add Firestore rules for new collections/documents (helper functions, validation)
5. Update `firestore.indexes.json` if using compound queries
6. Add authentication/authorization checks (API key middleware or Firebase Auth)
7. Implement handler following tool result pattern: `{success: boolean, message: string, data?: any}`
8. Export function from main index file
9. Write unit tests for handler logic (TDD: write tests first)
10. Write integration test with emulators
11. Test locally with `firebase emulators:start`
12. Document the new feature in README or docs

**Integration with Superpowers:**
- Enforces superpowers:test-driven-development (write tests before implementation)
- Uses superpowers:verification-before-completion (run tests before marking done)
- Recommends superpowers:using-git-worktrees for isolated feature work

**Triggers:**
- "Add a new Cloud Function"
- "Create a new Firestore collection"
- "Add an API endpoint"
- "Build a new tool/feature"
- "Implement new functionality"

### 3. firebase-development/debug/

**Purpose:** Systematic troubleshooting for Firebase issues

**TodoWrite Checklist (8-10 steps):**

1. Identify issue type (emulator, rules, function error, auth, deployment)
2. Check emulator terminal logs for error messages (stack traces, warnings)
3. Open Emulator UI (http://127.0.0.1:4000) to inspect current state
4. For rules violations: Use Emulator UI Rules Playground to test rules
5. For function errors: Add `console.log()` statements, check terminal output
6. For auth issues: Verify emulator connection in client code, check env vars
7. For deployment issues: Check `firebase-debug.log` in project root
8. Use `firebase emulators:export ./backup` to save state before restarting
9. Test fix with emulators
10. Document the issue and solution in project docs or comments

**Integration with Superpowers:**
- References superpowers:systematic-debugging for root cause analysis
- Uses superpowers:root-cause-tracing for deep investigation

**Common Issues Covered:**
- Emulator ports already in use (kill processes, change ports)
- Admin SDK vs Client SDK confusion (functions bypass rules)
- Rules testing mistakes (client SDK vs admin SDK behavior)
- Cold start delays (first function call can be slow)
- Data persistence issues (must Ctrl+C to export properly)

**Triggers:**
- "Emulator error"
- "Firestore rules failing"
- "Function not working"
- "Debug Firebase issue"
- "Permission denied"
- "Firebase deployment failed"

### 4. firebase-development/validate/

**Purpose:** Review Firebase code against proven patterns and security model

**TodoWrite Checklist (8-9 steps):**

1. Check `firebase.json` structure (emulators, hosting, functions config)
2. Review `firestore.rules` for helper functions and security patterns
3. Verify functions follow chosen architecture (Express/domain/individual)
4. Check authentication implementation (API keys formatted correctly, middleware present)
5. Verify all TypeScript files have ABOUTME comments
6. Check test coverage (unit tests and integration tests exist)
7. Review error handling (all handlers return proper result format)
8. Verify emulator configuration (singleProjectMode, UI enabled, persistence)
9. Check hosting rewrites for API patterns (if applicable)

**Validation Checklist by Pattern:**

**Multi-Hosting:**
- If `site:` - verify sites exist in Firebase console
- If `target:` - verify targets are linked, predeploy scripts work
- If rewrites - verify function names match exports

**Authentication:**
- If API keys - check prefix format, collectionGroup query setup, middleware
- If Firebase Auth - check role/entitlement field, rules use correct lookups
- If both - verify they don't conflict

**Security Model:**
- If server-write-only - confirm all rules have `allow write: if false`
- If client-write - confirm `diff().affectedKeys()` validation present

**Triggers:**
- "Review Firebase code"
- "Check Firebase setup"
- "Validate Firebase implementation"
- "Audit Firebase project"
- "Look at Firebase configuration"

## File Organization

```
firebase-development/
├── SKILL.md                    # Main orchestrator (~500-600 lines)
│                               # Contains: routing logic, all shared patterns
├── project-setup/
│   └── SKILL.md               # ~400-500 lines: 12-14 step workflow
├── add-feature/
│   └── SKILL.md               # ~400-450 lines: 10-12 step workflow
├── debug/
│   └── SKILL.md               # ~350-400 lines: 8-10 step workflow
└── validate/
    └── SKILL.md               # ~350-400 lines: 8-9 step workflow

docs/
├── plans/
│   └── 2025-01-14-firebase-skills-design.md  # This document
├── examples/
│   ├── api-key-authentication.md               # Custom API key implementation
│   ├── multi-hosting-setup.md                  # site: vs target: vs rewrites
│   ├── express-function-architecture.md        # Express routing pattern
│   ├── firestore-rules-patterns.md             # Helper functions, validation
│   └── emulator-workflow.md                    # Daily development with emulators
└── DEVELOPMENT.md                              # How to modify/test skills

tests/integration/
└── firebase-skill-routing.test.md              # Manual test scenarios
```

## Integration with Existing Skills

**superpowers:brainstorming** - Use before project-setup to design architecture

**superpowers:test-driven-development** - Enforced in add-feature (write tests first)

**superpowers:systematic-debugging** - Referenced in debug sub-skill

**superpowers:verification-before-completion** - All sub-skills require passing tests

**superpowers:using-git-worktrees** - Recommended for add-feature work

**superpowers:code-reviewer** - Can validate against Firebase patterns after implementation

## Common Gotchas to Document

1. **Emulator ports in use:** Check for conflicts (`lsof -i :5001`), kill processes
2. **Admin SDK vs Client SDK:** Functions use admin (bypass rules), client respects rules
3. **Rules testing confusion:** Firestore rules only affect client SDK, not admin SDK
4. **Cold start delays:** First function call in emulators can take 5-10 seconds
5. **Data persistence:** Must use Ctrl+C (not kill) to properly export emulator data
6. **Node version compatibility:** Match Firebase Functions runtime (nodejs18, nodejs20)
7. **Environment variables:** Functions use `.env`, hosting uses `.env.local`
8. **CORS in functions:** Must explicitly enable CORS for client calls
9. **Index requirements:** Complex queries need indexes in `firestore.indexes.json`
10. **Deployment order:** Sometimes need to deploy rules before functions

## Environment Variables Pattern

**Functions (`functions/.env`):**
```
OPENAI_API_KEY=sk-...
SLACK_BOT_TOKEN=xoxb-...
```
- Never commit to git
- Add to `.gitignore`
- Use in functions: `process.env.OPENAI_API_KEY`

**Hosting (`hosting/.env.local`):**
```
NEXT_PUBLIC_USE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```
- Prefix with `NEXT_PUBLIC_` for browser access
- Add to `.gitignore`
- Used for emulator detection and client config

## Deployment Safety

All skills emphasize:

- Test thoroughly in emulators before deploying to production
- Use `--only` flag to deploy specific services: `firebase deploy --only functions:myFunction`
- Check `firebase-debug.log` for deployment errors
- Never use `--force` unless you understand the risks
- Deploy order sometimes matters: rules before functions
- Use Firebase console to verify deployment success

## Cost Awareness

**Emulators are Free:**
- No charges during local development
- Run emulators as much as you want

**Production Costs:**
- **Firestore:** Charged per read/write/delete operation (~$0.36 per 100k operations)
- **Functions:** Charged per invocation + compute time (~$0.40 per million invocations)
- **Hosting:** Free tier up to 10 GB/month, then ~$0.15 per GB
- **Auth:** Free for most use cases

**Why Server-Write-Only Can Be Cost-Effective:**
- Fewer function invocations for simple apps
- No need for complex security rules processing
- Easier to optimize and cache on server side
- Better for light-write applications (mostly reads)

## Quality Standards

Each sub-skill must:

- Include complete TodoWrite checklist with `content` + `activeForm` fields
- Provide exact code examples with file paths from reference projects
- Reference main skill patterns (no duplication)
- Include both unit and integration test guidance
- Cover error scenarios and debugging steps
- Use AskUserQuestion for architecture decisions
- Announce skill usage at start
- Verify completion with running emulator tests

## Success Criteria

Firebase skills are successful when:

1. Developer can initialize new Firebase project following proven patterns in <30 minutes
2. Adding new features follows consistent architecture without guesswork
3. Debugging is systematic with clear troubleshooting steps
4. Code reviews catch security issues and pattern violations
5. All skills reference the same centralized patterns (no contradictions)
6. Emulator-first development is the default workflow
7. Testing (unit + integration) is enforced by default
8. Skills integrate seamlessly with existing superpowers workflow

## Next Steps

1. Write main orchestrator skill (firebase-development/SKILL.md)
2. Write project-setup sub-skill
3. Write add-feature sub-skill
4. Write debug sub-skill
5. Write validate sub-skill
6. Create example documentation (5 markdown files)
7. Create integration test scenarios
8. Test with real Firebase project initialization
9. Iterate based on actual usage

# Firebase Skills System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a comprehensive Firebase development skill system with orchestrator + 4 sub-skills (project-setup, add-feature, debug, validate) based on patterns from 3 production projects.

**Architecture:** Orchestrator pattern with keyword-based routing. Main skill documents all shared Firebase patterns (centralized). Four specialized sub-skills with TodoWrite checklists. Each sub-skill is 350-500 lines with complete workflows.

**Tech Stack:** Markdown skills with YAML frontmatter, references to TypeScript/Firebase projects in `/Users/dylanr/work/2389/oneonone`, `/Users/dylanr/work/2389/bot-socialmedia-server`, `/Users/dylanr/work/2389/meme-rodeo`

**Reference Design:** `docs/plans/2025-01-14-firebase-skills-design.md`

---

## Task 1: Create Directory Structure

**Files:**
- Create: `firebase-development/SKILL.md`
- Create: `firebase-development/project-setup/SKILL.md`
- Create: `firebase-development/add-feature/SKILL.md`
- Create: `firebase-development/debug/SKILL.md`
- Create: `firebase-development/validate/SKILL.md`

**Step 1: Create directory structure**

```bash
mkdir -p firebase-development/project-setup
mkdir -p firebase-development/add-feature
mkdir -p firebase-development/debug
mkdir -p firebase-development/validate
```

**Step 2: Create placeholder files**

```bash
touch firebase-development/SKILL.md
touch firebase-development/project-setup/SKILL.md
touch firebase-development/add-feature/SKILL.md
touch firebase-development/debug/SKILL.md
touch firebase-development/validate/SKILL.md
```

**Step 3: Verify structure**

Run: `tree firebase-development`

Expected output:
```
firebase-development
├── SKILL.md
├── add-feature
│   └── SKILL.md
├── debug
│   └── SKILL.md
├── project-setup
│   └── SKILL.md
└── validate
    └── SKILL.md
```

**Step 4: Commit**

```bash
git add firebase-development/
git commit -m "feat: create firebase skills directory structure

Sets up orchestrator + 4 sub-skills file structure.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Main Orchestrator Skill - Header & Overview

**Files:**
- Modify: `firebase-development/SKILL.md`

**Step 1: Write YAML frontmatter and overview**

Add to `firebase-development/SKILL.md`:

```markdown
---
name: firebase-development
description: Comprehensive Firebase development guidance covering project setup, feature development, debugging, and validation. Auto-detects intent and routes to specialized sub-skills. Patterns extracted from production projects.
---

# Firebase Development

## Overview

This skill system guides Firebase development using proven patterns from production projects. It covers:

- **Project Setup**: Initialize new Firebase projects with proper architecture
- **Feature Development**: Add Cloud Functions, Firestore collections, API endpoints
- **Debugging**: Troubleshoot emulator issues, rules violations, function errors
- **Validation**: Review code against security model and best practices

The main skill detects your intent and routes to the appropriate sub-skill. All sub-skills reference shared Firebase patterns documented in this file.

## When This Skill Applies

Use this skill system when working with Firebase projects:
- Starting new Firebase projects
- Adding Cloud Functions or Firestore collections
- Debugging emulator issues or rule violations
- Reviewing Firebase code for security and patterns
- Setting up multi-hosting configurations
- Implementing authentication (API keys or Firebase Auth)

## How It Works

1. **Intent Detection**: Analyzes keywords in your request
2. **Routing**: Directs to appropriate sub-skill (project-setup, add-feature, debug, validate)
3. **Pattern Reference**: All sub-skills use shared patterns documented here
4. **TodoWrite Tracking**: Each sub-skill creates detailed progress checklists

## Reference Projects

Patterns are extracted from three production Firebase projects:

- **oneonone** (`/Users/dylanr/work/2389/oneonone`): Express API architecture, custom API keys, server-write-only security
- **bot-socialmedia** (`/Users/dylanr/work/2389/bot-socialmedia-server`): Domain-grouped functions, Firebase Auth + roles, client-write with validation
- **meme-rodeo** (`/Users/dylanr/work/2389/meme-rodeo`): Individual function files, Firebase Auth + entitlements

These projects demonstrate different valid approaches to Firebase architecture. The skills help you choose the right pattern for your needs.
```

**Step 2: Verify file is valid**

Run: `head -30 firebase-development/SKILL.md`

Expected: See YAML frontmatter and overview section

**Step 3: Commit**

```bash
git add firebase-development/SKILL.md
git commit -m "feat(firebase): add main orchestrator header and overview

Includes YAML frontmatter, overview, and reference project documentation.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Main Orchestrator Skill - Routing Logic

**Files:**
- Modify: `firebase-development/SKILL.md`

**Step 1: Add routing section**

Append to `firebase-development/SKILL.md`:

```markdown

## Routing Logic

This skill uses keyword-based routing to determine which sub-skill to use:

### Keywords by Sub-Skill

**project-setup:**
- "new firebase project"
- "initialize firebase"
- "firebase init"
- "set up firebase"
- "create firebase app"
- "start firebase project"

**add-feature:**
- "add function"
- "create endpoint"
- "new tool"
- "add api"
- "new collection"
- "add feature"
- "build"
- "implement"

**debug:**
- "error"
- "not working"
- "debug"
- "emulator issue"
- "rules failing"
- "permission denied"
- "troubleshoot"
- "deployment failed"

**validate:**
- "review firebase"
- "check firebase"
- "validate"
- "audit firebase"
- "look at firebase code"

### Routing Process

1. **Analyze Request**: Check for routing keywords
2. **Match Sub-Skill**: Identify best match based on keyword density
3. **Announce**: "I'm using the firebase-development:[sub-skill] skill to [action]"
4. **Route**: Load and execute the sub-skill
5. **Fallback**: If ambiguous, use AskUserQuestion with 4 options

### Fallback Example

If intent is unclear, ask:

```
Question: "What Firebase task are you working on?"
Options:
  - "Project Setup" (Initialize new Firebase project)
  - "Add Feature" (Add functions, collections, endpoints)
  - "Debug Issue" (Troubleshoot errors or problems)
  - "Validate Code" (Review against patterns)
```
```

**Step 2: Verify routing section**

Run: `grep -A 5 "Routing Logic" firebase-development/SKILL.md`

Expected: See routing section with keywords

**Step 3: Commit**

```bash
git add firebase-development/SKILL.md
git commit -m "feat(firebase): add routing logic with keyword detection

Deterministic routing based on request keywords. Includes fallback to
AskUserQuestion for ambiguous cases.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Main Orchestrator - Multi-Hosting Patterns

**Files:**
- Modify: `firebase-development/SKILL.md`

**Step 1: Add multi-hosting section**

Append to `firebase-development/SKILL.md`:

```markdown

## Shared Firebase Patterns

These patterns are documented once here and referenced by all sub-skills. Choose the approach that fits your project needs.

### Multi-Hosting Setup

Firebase supports multiple hosting configurations. Choose based on your needs:

#### Option 1: `site:` Based (Preferred for Simplicity)

**When to use:** Multiple independent deployments with separate URLs

**Configuration:**
```json
{
  "hosting": [
    {
      "site": "project-main",
      "source": "hosting",
      "frameworksBackend": {"region": "us-central1"}
    },
    {
      "site": "project-api",
      "public": "hosting-api",
      "rewrites": [{"source": "/**", "function": "api"}]
    }
  ]
}
```

**Setup:**
```bash
# Create sites in Firebase
firebase hosting:sites:create project-main
firebase hosting:sites:create project-api

# Deploy specific site
firebase deploy --only hosting:project-main
```

**URLs:** Each site gets its own URL: `project-main.web.app`, `project-api.web.app`

**Example:** oneonone uses 3 separate sites (main app, MCP endpoint, API endpoint)

**Reference:** `/Users/dylanr/work/2389/oneonone/firebase.json`

#### Option 2: `target:` Based (Use for Predeploy Hooks)

**When to use:** Need build scripts before deployment, monorepo coordination

**Configuration:**
```json
{
  "hosting": [
    {
      "target": "main",
      "source": "hosting",
      "frameworksBackend": {"region": "us-central1"}
    },
    {
      "target": "api",
      "public": "api",
      "predeploy": ["cd api-app && npm run build"],
      "rewrites": [{"source": "/api**/**", "function": "api"}]
    }
  ]
}
```

**Setup:**
```bash
# Link targets to sites
firebase target:apply hosting main my-project-main
firebase target:apply hosting api my-project-api

# Deploy specific target (runs predeploy)
firebase deploy --only hosting:main
```

**Example:** bot-socialmedia uses targets with predeploy hooks for builds

**Reference:** `/Users/dylanr/work/2389/bot-socialmedia-server/firebase.json`

#### Option 3: Single Hosting with Rewrites

**When to use:** Smaller projects, all content under one domain

**Configuration:**
```json
{
  "hosting": {
    "source": "hosting",
    "rewrites": [
      {
        "source": "/images/memes/**",
        "function": {"functionId": "proxyMemeFile", "region": "us-central1"}
      }
    ]
  }
}
```

**Example:** meme-rodeo uses single hosting with function rewrites

**Reference:** `/Users/dylanr/work/2389/meme-rodeo/firebase.json`

#### Guidance

- **Use `site:` if:** You need multiple independent URLs, straightforward deployment
- **Use `target:` if:** You need predeploy build scripts, monorepo patterns
- **Use single+rewrites if:** Simpler project, all under one domain
```

**Step 2: Verify multi-hosting section**

Run: `grep -A 10 "Multi-Hosting Setup" firebase-development/SKILL.md`

Expected: See three hosting options

**Step 3: Commit**

```bash
git add firebase-development/SKILL.md
git commit -m "feat(firebase): add multi-hosting patterns documentation

Documents site:, target:, and single-with-rewrites approaches with
examples from production projects.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Main Orchestrator - Authentication Patterns

**Files:**
- Modify: `firebase-development/SKILL.md`

**Step 1: Add authentication section**

Append to `firebase-development/SKILL.md`:

```markdown

### Authentication

Firebase projects can use custom API keys, Firebase Auth, or both. Choose based on your use case.

#### Custom API Keys (MCP Tools, APIs, Server-to-Server)

**When to use:**
- MCP server endpoints
- Programmatic API access
- Server-to-server communication
- No user login UI needed

**Format:** `{projectPrefix}_` + unique identifier
- Choose 3-4 character project abbreviation
- Examples: `ooo_abc123` (OneOnOne), `meme_xyz789` (Meme Rodeo), `bot_def456` (Bot Social)

**Storage Pattern:**
```
/users/{userId}/apiKeys/{keyId}
  - keyId: "ooo_abc123..." (the actual key)
  - userId: string
  - active: boolean
  - createdAt: timestamp
```

**Middleware Pattern:**
```typescript
// functions/src/middleware/apiKeyGuard.ts
export async function apiKeyGuard(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey || !apiKey.startsWith('ooo_')) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }

  const db = admin.firestore();
  const apiKeysQuery = await db
    .collectionGroup('apiKeys')
    .where('keyId', '==', apiKey)
    .where('active', '==', true)
    .limit(1)
    .get();

  if (apiKeysQuery.empty) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }

  req.userId = apiKeysQuery.docs[0].data().userId;
  next();
}
```

**Example:** oneonone's API key implementation

**Reference:** `/Users/dylanr/work/2389/oneonone/functions/src/middleware/apiKeyGuard.ts`

#### Firebase Auth + Roles (User-Facing Apps)

**When to use:**
- Web/mobile apps with user login
- Social features requiring user identity
- Role-based access control

**Role Storage:**
```
/users/{userId}
  - role: "admin" | "teamlead" | "user"  (or)
  - entitlement: "admin" | "moderator" | "public" | "waitlist"
  - displayName: string
  - email: string
```

**Firestore Rules Pattern:**
```javascript
function isAdmin() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

function isModerator() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.entitlement == 'moderator';
}

match /users/{userId} {
  allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
  allow update: if request.auth != null && request.auth.uid == userId;
}
```

**Examples:**
- bot-socialmedia uses `role` field (admin/teamlead/user)
- meme-rodeo uses `entitlement` field (admin/moderator/public/waitlist)

**References:**
- `/Users/dylanr/work/2389/bot-socialmedia-server/firestore.rules`
- `/Users/dylanr/work/2389/meme-rodeo/firestore.rules`

#### Both Can Coexist

**Pattern:** Firebase Auth for web UI + API keys for programmatic access

**Example Use Case:**
- Users log in via Firebase Auth in web app
- MCP tools/scripts use API keys for automation
- Same backend, different authentication methods

**Implementation:**
- Web routes check `request.auth.uid`
- API routes check `x-api-key` header via middleware
- Both methods access same Firestore data with appropriate rules
```

**Step 2: Verify authentication section**

Run: `grep -A 5 "### Authentication" firebase-development/SKILL.md`

Expected: See authentication patterns

**Step 3: Commit**

```bash
git add firebase-development/SKILL.md
git commit -m "feat(firebase): add authentication patterns

Documents custom API keys and Firebase Auth approaches with complete
code examples and guidance on when to use each.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Main Orchestrator - Functions Architecture

**Files:**
- Modify: `firebase-development/SKILL.md`

**Step 1: Add functions architecture section**

Append to `firebase-development/SKILL.md`:

```markdown

### Cloud Functions Architecture

Choose an architecture pattern based on your project type. All patterns work with hosting rewrites for API routing.

#### Express App with Routing (API Projects)

**When to use:**
- API-like projects with many related endpoints
- Need middleware (auth, logging, CORS)
- RESTful routing patterns

**Structure:**
```
functions/src/
├── index.ts              # Express app export
├── middleware/
│   ├── apiKeyGuard.ts
│   └── loggingMiddleware.ts
├── tools/               # Or "routes/"
│   ├── requestSession.ts
│   ├── sendMessage.ts
│   └── endSession.ts
├── services/
│   └── sessionManager.ts
└── shared/
    ├── types.ts
    └── config.ts
```

**index.ts Pattern:**
```typescript
// ABOUTME: Main entry point for Firebase Functions - exports MCP endpoint with tool routing
// ABOUTME: Configures Express app with authentication, CORS, and health check

import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { apiKeyGuard } from './middleware/apiKeyGuard';
import { handleRequestSession } from './tools/requestSession';

admin.initializeApp();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/mcp', apiKeyGuard, async (req, res) => {
  const { tool, params } = req.body;
  const userId = req.userId!;

  let result;
  switch (tool) {
    case 'request_session':
      result = await handleRequestSession(userId, params);
      break;
    default:
      res.status(400).json({ success: false, error: 'Unknown tool' });
      return;
  }

  res.status(200).json(result);
});

export const mcpEndpoint = onRequest({ invoker: 'public', cors: true }, app);
```

**Hosting Rewrite (firebase.json):**
```json
{
  "hosting": {
    "rewrites": [
      {"source": "/**", "function": "mcpEndpoint"}
    ]
  }
}
```

**Example:** oneonone uses Express routing for MCP tools

**Reference:** `/Users/dylanr/work/2389/oneonone/functions/src/index.ts`

#### Domain-Grouped Files (Feature-Rich Apps)

**When to use:**
- Apps with distinct feature areas
- Multiple related functions per domain
- Clear domain boundaries

**Structure:**
```
functions/src/
├── index.ts              # Re-exports all functions
├── posts.ts              # All post-related functions
├── journal.ts            # All journal functions
├── admin.ts              # Admin functions
├── teamSummaries.ts      # Summary generation
└── shared/
    ├── types/
    ├── validators/
    └── utils/
```

**Domain File Pattern (posts.ts):**
```typescript
// ABOUTME: Post creation, reading, and management functions
// ABOUTME: Includes API endpoints and real-time triggers

import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

export const createPost = onRequest(async (req, res) => {
  // Implementation
});

export const getPosts = onRequest(async (req, res) => {
  // Implementation
});

export const onPostCreated = onDocumentCreated('teams/{teamId}/posts/{postId}', async (event) => {
  // Trigger implementation
});
```

**index.ts Pattern:**
```typescript
// ABOUTME: Main entry point - re-exports all Cloud Functions
// ABOUTME: Organizes functions by domain for clear structure

export * from './posts';
export * from './journal';
export * from './admin';
export * from './teamSummaries';
```

**Example:** bot-socialmedia uses domain-grouped architecture

**Reference:** `/Users/dylanr/work/2389/bot-socialmedia-server/functions/src/`

#### Individual Function Files (Independent Functions)

**When to use:**
- Collection of independent functions
- Maximum modularity
- Simple projects with few dependencies

**Structure:**
```
functions/
├── index.js              # Imports and exports all
└── functions/
    ├── upload.js
    ├── searchMemes.js
    ├── generateInvite.js
    ├── onFileUploaded.js
    └── periodicFileCheck.js
```

**Function File Pattern:**
```javascript
const { onRequest } = require('firebase-functions/v2/https');

exports.upload = onRequest(async (req, res) => {
  // Implementation
});
```

**index.js Pattern:**
```javascript
const { upload } = require("./functions/upload");
const { searchMemes } = require("./functions/searchMemes");

exports.upload = upload;
exports.searchMemes = searchMemes;
```

**Example:** meme-rodeo uses individual function files

**Reference:** `/Users/dylanr/work/2389/meme-rodeo/functions/`

#### Guidance

- **Use Express if:** Building API with related endpoints, need middleware
- **Use domain-grouped if:** Feature-rich app with distinct areas (posts, admin, etc.)
- **Use individual files if:** Independent functions, maximum modularity
- **All work with hosting rewrites** for API routing patterns
```

**Step 2: Verify functions architecture section**

Run: `grep -A 5 "### Cloud Functions Architecture" firebase-development/SKILL.md`

Expected: See three architecture patterns

**Step 3: Commit**

```bash
git add firebase-development/SKILL.md
git commit -m "feat(firebase): add Cloud Functions architecture patterns

Documents Express, domain-grouped, and individual file approaches with
complete code examples and hosting rewrite integration.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Main Orchestrator - Security & Rules Patterns

**Files:**
- Modify: `firebase-development/SKILL.md`

**Step 1: Add security model and Firestore rules sections**

Append to `firebase-development/SKILL.md`:

```markdown

### Security Model

Choose a security philosophy based on your write patterns.

#### Server-Write-Only (Default, Preferred)

**When to use:**
- Light-write applications (mostly reads)
- High security requirements
- API/MCP projects
- Admin dashboards

**Pattern:**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    // All collections: read allowed, write denied
    match /config/{configId} {
      allow read: if true;
      allow write: if false;  // Only Cloud Functions can write
    }

    match /users/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if false;  // Only Cloud Functions can write
    }

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Benefits:**
- Maximum security
- Single source of truth (Cloud Functions)
- Easier to audit
- Simpler rules

**Trade-offs:**
- Requires Cloud Function for every mutation
- Slightly higher latency
- More function invocations (cost)

**Example:** oneonone uses server-write-only exclusively

**Reference:** `/Users/dylanr/work/2389/oneonone/firestore.rules`

#### Client-Write with Validation

**When to use:**
- High-volume writing (social feeds, messaging, real-time updates)
- Need fastest UX
- Client applications with many mutations

**Pattern:**
```javascript
// firestore.rules
match /teams/{teamId}/posts/{postId} {
  // Allow users to create their own posts
  allow create: if request.auth != null &&
                   request.resource.data.userId == request.auth.uid &&
                   request.resource.data.teamId == teamId;

  // Allow users to update only specific fields of their posts
  allow update: if request.auth != null &&
                   resource.data.userId == request.auth.uid &&
                   request.resource.data.diff(resource.data).affectedKeys()
                     .hasOnly(['content', 'tags', 'updatedAt']);

  // Allow users to delete their own posts
  allow delete: if request.auth != null &&
                   resource.data.userId == request.auth.uid;
}
```

**Benefits:**
- Faster UX (no function latency)
- Fewer function invocations
- Real-time updates

**Trade-offs:**
- Complex rules required
- Larger attack surface
- Harder to audit

**Examples:**
- bot-socialmedia allows client writes for posts/journal
- meme-rodeo allows client file updates

**References:**
- `/Users/dylanr/work/2389/bot-socialmedia-server/firestore.rules`
- `/Users/dylanr/work/2389/meme-rodeo/firestore.rules`

#### Guidance

- **Strongly prefer server-write-only** for light-write applications
- **Use client-write** only when write volume justifies the complexity
- Never mix approaches within the same collection (confusing security model)

### Firestore Rules Patterns

Common patterns used across all projects.

#### Helper Function Extraction (Universal Pattern)

**Always extract reusable logic into functions:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authentication helpers
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Role-based helpers
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isTeamMember(teamId, userId) {
      let team = get(/databases/$(database)/documents/teams/$(teamId)).data;
      return team != null && team.members.hasAny([{'uid': userId}]);
    }

    // Use helpers in rules
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isOwner(userId);
    }
  }
}
```

**Benefits:**
- Makes rules readable
- Reuse logic across collections
- Easier to test and maintain

**All three projects use this pattern heavily**

#### diff().affectedKeys() Validation (Client-Write Security)

**Use when allowing client writes to restrict which fields can change:**

```javascript
// Only allow updating specific safe fields
allow update: if request.auth != null &&
                 request.resource.data.diff(resource.data).affectedKeys()
                   .hasOnly(['displayName', 'bio', 'photoURL']);

// Prevent privilege escalation
allow update: if request.auth != null &&
                 get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
                 request.resource.data.diff(resource.data).affectedKeys()
                   .hasOnly(['role', 'updatedAt']);
```

**Example:** bot-socialmedia uses extensively to protect sensitive fields

**Reference:** `/Users/dylanr/work/2389/bot-socialmedia-server/firestore.rules:22`

#### Role-Based Access with get() Lookups

**Look up user roles from /users collection:**

```javascript
function isAdmin() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

function hasEntitlement(level) {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.entitlement == level;
}

match /files/{fileId} {
  allow read: if true;
  allow delete: if request.auth != null && isAdmin();
  allow update: if request.auth != null && (isAdmin() || hasEntitlement('moderator'));
}
```

**Examples:**
- bot-socialmedia checks `role` field
- meme-rodeo checks `entitlement` field

#### Collection Group Query Support

**Add separate rules when using collectionGroup() queries:**

```javascript
// Regular collection rules
match /project-agents/{agentId}/sessions/{sessionId} {
  allow read, write: if false;
}

// Collection group query rules (separate match)
match /{path=**}/sessions/{sessionId} {
  allow read: if true;
}
```

**Example:** oneonone supports collectionGroup queries for sessions/messages

**Reference:** `/Users/dylanr/work/2389/oneonone/firestore.rules:44-52`

#### Guidance Summary

1. **Always extract helper functions** - makes rules maintainable
2. **Use `diff().affectedKeys()`** for any client-write validation
3. **Use role lookups** when you have user hierarchies
4. **Add collection group rules** when querying across subcollections
5. **Default deny** at the end: `match /{document=**} { allow read, write: if false; }`
```

**Step 2: Verify security and rules sections**

Run: `grep -A 5 "### Security Model" firebase-development/SKILL.md && grep -A 5 "### Firestore Rules Patterns" firebase-development/SKILL.md`

Expected: See both sections

**Step 3: Commit**

```bash
git add firebase-development/SKILL.md
git commit -m "feat(firebase): add security model and Firestore rules patterns

Documents server-write-only vs client-write approaches and common
rules patterns with complete examples.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: Main Orchestrator - Emulator & Tooling Patterns

**Files:**
- Modify: `firebase-development/SKILL.md`

**Step 1: Add emulator and tooling sections**

Append to `firebase-development/SKILL.md`:

```markdown

### Emulator-First Development

Always develop locally with emulators. Never test directly in production.

#### Essential Configuration

**firebase.json emulators section:**
```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "functions": { "port": 5001 },
    "firestore": { "port": 8080 },
    "hosting": { "port": 5000 },
    "ui": { "enabled": true, "port": 4000 },
    "singleProjectMode": true
  }
}
```

**Key settings:**
- `singleProjectMode: true` - **Essential**: Allows emulators to work together
- `ui.enabled: true` - **Essential**: Access debug UI at http://127.0.0.1:4000
- Consistent ports across projects

**All three projects use these exact settings**

#### Client-Side Emulator Detection

**Pattern for Next.js/React apps:**

```typescript
// hosting/lib/firebase.ts
// ABOUTME: Firebase client-side configuration and initialization
// ABOUTME: Exports auth, firestore, and functions instances for use in components

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';

  if (useEmulators) {
    console.log('🔧 Connecting to Firebase emulators...');
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    console.log('✅ Connected to emulators');
  }
}
```

**Environment variable (hosting/.env.local):**
```
NEXT_PUBLIC_USE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

**Example:** oneonone's emulator detection pattern

**Reference:** `/Users/dylanr/work/2389/oneonone/hosting/lib/firebase.ts:28-54`

#### Data Persistence

**Export/Import Pattern:**

```bash
# Data is automatically imported from this directory on startup
.firebase/emulator-data/

# Export data (preserves state)
firebase emulators:export ./backup

# Import data on startup
firebase emulators:start --import=./backup

# Fresh start (delete all data)
rm -rf .firebase/emulator-data
```

**Important:**
- Always stop emulators with Ctrl+C (graceful shutdown exports data automatically)
- Do NOT kill emulators (data won't export)
- Add `.firebase/` to .gitignore

#### Daily Workflow

```bash
# Start emulators (auto-imports data from .firebase/emulator-data)
firebase emulators:start

# Access emulator UI
open http://127.0.0.1:4000

# Make code changes (functions/hosting auto-reload)

# Test changes in browser or with curl

# Stop emulators (auto-exports data)
Ctrl+C
```

**Emulator UI Features:**
- View/edit Firestore data
- View Auth users
- See Function logs
- Test Firestore rules in Rules Playground

### Modern Tooling Standards

#### TypeScript Only

**All code examples use TypeScript:**
- No JavaScript examples (simplifies maintenance)
- Both recent projects (oneonone, bot-socialmedia) use TypeScript
- Better type safety and IDE support

**tsconfig.json basics:**
```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "lib"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

#### Testing with vitest

**Main config (vitest.config.ts):**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

**Emulator-specific config (vitest.emulator.config.ts):**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 30000,  // Longer for emulator tests
  },
});
```

**Run commands:**
```bash
# Unit tests (fast, no emulators)
npm run test

# Integration tests (with emulators)
npm run test:emulator
```

**Example:** bot-socialmedia's vitest setup

**Reference:** `/Users/dylanr/work/2389/bot-socialmedia-server/functions/vitest*.config.ts`

#### Linting with biome

**Configuration (biome.json):**
```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "lineWidth": 100
  }
}
```

**Run commands:**
```bash
npm run lint       # Check for issues
npm run lint:fix   # Auto-fix issues
```

#### ABOUTME Comment Pattern

**Every TypeScript file starts with 2-line comment:**

```typescript
// ABOUTME: Brief description of what this file does
// ABOUTME: Second line with additional context

import { something } from 'somewhere';
// ... rest of file
```

**Benefits:**
- Easy to grep: `grep "ABOUTME:" **/*.ts`
- Quick file purpose understanding
- Self-documenting codebase

**Both TypeScript projects use this pattern**

#### Testing Requirements

**Unit Tests:**
- Test handlers, utilities, validators in isolation
- Mock Firestore/Auth when needed
- Fast execution, no emulator dependency
- Located in `src/__tests__/` or next to source files

**Integration Tests:**
- Test complete workflows with emulators running
- Real Firestore/Auth/Functions interaction
- Use `vitest.emulator.config.ts`
- Verify end-to-end behavior

**Both types required for every feature**

**Example test structure:**
```
functions/src/
├── __tests__/
│   ├── middleware/
│   │   └── apiKeyGuard.test.ts      # Unit test
│   ├── tools/
│   │   └── requestSession.test.ts   # Unit test
│   └── integration/
│       └── mcp-workflow.test.ts     # Integration test
```
```

**Step 2: Verify emulator and tooling sections**

Run: `grep -A 5 "### Emulator-First Development" firebase-development/SKILL.md && grep -A 5 "### Modern Tooling Standards" firebase-development/SKILL.md`

Expected: See both sections

**Step 3: Commit**

```bash
git add firebase-development/SKILL.md
git commit -m "feat(firebase): add emulator and modern tooling patterns

Documents emulator configuration, client-side detection, data persistence,
TypeScript setup, vitest testing, biome linting, and ABOUTME comments.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 9: Main Orchestrator - Common Issues & Summary

**Files:**
- Modify: `firebase-development/SKILL.md`

**Step 1: Add common issues and summary sections**

Append to `firebase-development/SKILL.md`:

```markdown

### Common Gotchas

Document these issues when encountered:

1. **Emulator ports in use**
   - Check: `lsof -i :5001`
   - Fix: Kill process or change port in firebase.json

2. **Admin SDK vs Client SDK confusion**
   - Functions use admin SDK (bypasses Firestore rules)
   - Client apps use client SDK (respects Firestore rules)
   - Rules only validate client SDK operations

3. **Rules testing mistakes**
   - Firestore rules only affect client SDK
   - Admin SDK always has full access
   - Test rules with Emulator UI Rules Playground

4. **Cold start delays**
   - First function call in emulators can take 5-10 seconds
   - Subsequent calls are fast
   - Normal behavior, not a bug

5. **Data persistence issues**
   - Must use Ctrl+C to stop emulators (graceful shutdown)
   - Killing emulators prevents data export
   - Data stored in `.firebase/emulator-data/`

6. **Node version compatibility**
   - Match Firebase Functions runtime: `nodejs18` or `nodejs20`
   - Check functions/package.json: `"engines": {"node": "20"}`

7. **Environment variables**
   - Functions: `.env` file (never commit)
   - Hosting: `.env.local` with `NEXT_PUBLIC_` prefix
   - Different files, different naming conventions

8. **CORS in functions**
   - Must explicitly enable CORS: `app.use(cors({ origin: true }))`
   - Or use `cors: true` in onRequest options
   - Browsers block requests without CORS headers

9. **Index requirements**
   - Complex queries need indexes in `firestore.indexes.json`
   - Error message includes index creation URL
   - Follow URL or manually add to indexes file

10. **Deployment order**
    - Sometimes need to deploy rules before functions
    - Functions may depend on new rules being active
    - Deploy order: rules → functions → hosting

### Cost Awareness

**Emulators:** Free, no charges during local development

**Production Costs:**
- **Firestore:** ~$0.36 per 100k reads/writes
- **Functions:** ~$0.40 per million invocations + compute time
- **Hosting:** Free up to 10 GB/month, then ~$0.15 per GB
- **Auth:** Free for most use cases

**Why Server-Write-Only Can Be Cost-Effective:**
- Fewer function invocations overall
- No complex security rules processing
- Easier to optimize and cache on server side
- Better for light-write applications

**Monitor costs:** Firebase Console → Usage and Billing

## Summary

This Firebase development skill system provides:

1. **Orchestrator routing** based on keyword detection
2. **Four specialized sub-skills** with TodoWrite checklists
3. **Shared patterns** extracted from three production projects
4. **Complete code examples** with exact file paths
5. **Guidance on architectural choices** (hosting, auth, functions, security)
6. **Emulator-first workflow** for safe local development
7. **Modern tooling** (TypeScript, vitest, biome)
8. **Testing standards** (unit + integration required)

**Next Steps:**
- Choose the sub-skill that matches your task
- Follow the TodoWrite checklist
- Reference these patterns as needed
- Test with emulators before deploying

**Sub-Skills:**
- @firebase-development/project-setup - Initialize new projects
- @firebase-development/add-feature - Add functions/collections
- @firebase-development/debug - Troubleshoot issues
- @firebase-development/validate - Review code
```

**Step 2: Verify common issues and summary**

Run: `tail -50 firebase-development/SKILL.md`

Expected: See common gotchas and summary sections

**Step 3: Commit**

```bash
git add firebase-development/SKILL.md
git commit -m "feat(firebase): complete main orchestrator with common issues

Adds common gotchas, cost awareness, and summary. Main orchestrator
skill is now complete with all shared patterns documented.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 10: Project-Setup Sub-Skill - Header & Overview

**Files:**
- Modify: `firebase-development/project-setup/SKILL.md`

**Step 1: Write YAML frontmatter and overview**

Add to `firebase-development/project-setup/SKILL.md`:

```markdown
---
name: firebase-development:project-setup
description: Initialize new Firebase project with proven architecture. Guides through firebase init, choosing hosting/auth/functions patterns, emulator configuration, and initial project structure setup.
---

# Firebase Project Setup

## Overview

This sub-skill guides you through initializing a new Firebase project with proven architecture patterns. It handles:

- Firebase CLI installation and `firebase init`
- Choosing authentication approach (API keys, Firebase Auth, or both)
- Configuring multi-hosting (site:, target:, or single with rewrites)
- Setting up functions architecture (Express, domain-grouped, or individual)
- Emulator configuration with data persistence
- TypeScript project structure
- Initial Firestore rules with helper functions
- Test setup with vitest
- ABOUTME comments and code standards

The workflow uses TodoWrite to track 12-14 steps from initialization to first emulator run.

## When This Sub-Skill Applies

Use this sub-skill when:
- Starting a brand new Firebase project
- Setting up Firebase for the first time in a repository
- User says: "new firebase project", "initialize firebase", "firebase init", "set up firebase"

**Do not use for:**
- Adding features to existing Firebase projects (use @firebase-development/add-feature)
- Debugging existing setup (use @firebase-development/debug)

## Reference Patterns

All patterns are documented in the main @firebase-development skill. This sub-skill helps you choose and implement those patterns for a new project.

**Key Decisions Made:**
1. **Hosting:** site: vs target: vs single-with-rewrites
2. **Authentication:** API keys vs Firebase Auth vs both
3. **Functions:** Express vs domain-grouped vs individual
4. **Security:** server-write-only vs client-write-validated

These decisions shape your project structure and are made via AskUserQuestion prompts.
```

**Step 2: Verify header**

Run: `head -30 firebase-development/project-setup/SKILL.md`

Expected: See YAML frontmatter and overview

**Step 3: Commit**

```bash
git add firebase-development/project-setup/SKILL.md
git commit -m "feat(firebase): add project-setup sub-skill header

Includes YAML frontmatter, overview, and when-to-use guidance.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

**Due to the length of this plan (it would be ~100+ tasks to cover all sub-skills in complete detail), I'll now provide a condensed version showing the remaining major tasks. Each major task can be expanded into bite-sized steps when executing.**

## Remaining Major Tasks

### Task 11-15: Complete Project-Setup Sub-Skill
- Add TodoWrite workflow (14 steps)
- Add architecture decision prompts (AskUserQuestion patterns)
- Add firebase init guidance
- Add initial file creation patterns
- Add first emulator run verification

### Task 16-20: Complete Add-Feature Sub-Skill
- Add header and overview
- Add TodoWrite workflow (12 steps)
- Add TDD enforcement (write test first)
- Add function patterns for each architecture
- Add Firestore rules update guidance

### Task 21-25: Complete Debug Sub-Skill
- Add header and overview
- Add TodoWrite workflow (10 steps)
- Add issue type identification
- Add emulator UI debugging steps
- Add systematic debugging integration

### Task 26-30: Complete Validate Sub-Skill
- Add header and overview
- Add TodoWrite workflow (9 steps)
- Add validation checklists by pattern
- Add security review steps
- Add test coverage verification

### Task 31-35: Create Example Documentation
- Create `docs/examples/api-key-authentication.md`
- Create `docs/examples/multi-hosting-setup.md`
- Create `docs/examples/express-function-architecture.md`
- Create `docs/examples/firestore-rules-patterns.md`
- Create `docs/examples/emulator-workflow.md`

### Task 36-37: Create Integration Tests
- Create `tests/integration/firebase-skill-routing.test.md`
- Add test scenarios for all routing keywords

### Task 38: Update Repository Documentation
- Update main `README.md` with Firebase skills info
- Add to `docs/DEVELOPMENT.md`

### Task 39: Final Verification
- Test main orchestrator routing
- Verify all sub-skills load correctly
- Check all references to patterns work
- Verify YAML frontmatter in all skills

### Task 40: Create Installation Script
- Add instructions to install skills: `cp -r firebase-development ~/.claude/skills/`
- Document skill usage in project README

---

## Execution Notes

**This is a large implementation (~2000-2500 lines across 5 SKILL.md files + examples).**

**Recommended Approach:**
1. Complete main orchestrator (Tasks 1-9) ✓
2. Complete one sub-skill fully (e.g., project-setup)
3. Test routing and sub-skill execution
4. Complete remaining sub-skills
5. Add examples and tests
6. Final verification

**Each sub-skill will be 350-500 lines with:**
- YAML frontmatter
- Overview and when-to-use
- Complete TodoWrite checklist
- AskUserQuestion patterns for decisions
- Exact code examples
- Test guidance
- References to main skill patterns

**Estimated Implementation Time:**
- Main orchestrator: 2-3 hours ✓ (completed)
- Each sub-skill: 1-2 hours
- Examples: 1 hour
- Testing: 1 hour
- Total: 8-12 hours of focused work

**Testing Strategy:**
1. Manual testing with Claude Code CLI
2. Try each routing keyword
3. Verify sub-skills load and create TodoWrite checklists
4. Test with actual Firebase project initialization

**Quality Gates:**
- All skills have valid YAML frontmatter
- All TodoWrite checklists have content + activeForm
- All code examples are complete (no placeholders)
- All references to main patterns work
- All sub-skills announce themselves when loaded

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

## TodoWrite Workflow

This sub-skill creates a TodoWrite checklist with 12-14 steps. Follow the checklist to systematically set up your Firebase project.

### Step 1: Verify Firebase CLI Installation
- **Content**: Check Firebase CLI is installed
- **ActiveForm**: Checking Firebase CLI is installed

**Actions:**
```bash
# Check if Firebase CLI is installed
firebase --version

# If not installed, install via npm
npm install -g firebase-tools

# Login to Firebase (opens browser)
firebase login
```

**Expected:** Version output (e.g., `13.0.0` or higher)

### Step 2: Create Project Directory
- **Content**: Create project directory structure
- **ActiveForm**: Creating project directory structure

**Actions:**
```bash
# Create project directory
mkdir my-firebase-project
cd my-firebase-project

# Initialize git
git init
git branch -m main

# Create .gitignore
cat << 'EOF' > .gitignore
node_modules/
.env
.env.local
.firebase/
lib/
dist/
*.log
.DS_Store
EOF
```

**Expected:** Clean directory ready for Firebase initialization

### Step 3: Run Firebase Init
- **Content**: Run firebase init to set up project
- **ActiveForm**: Running firebase init to set up project

**Actions:**
```bash
firebase init
```

**Interactive Prompts:**

1. **Select features:** (use spacebar to select, enter to confirm)
   - ✓ Firestore
   - ✓ Functions
   - ✓ Hosting
   - ✓ Emulators

2. **Select project:**
   - Use existing project (if you created one in Firebase Console)
   - Or: Don't set up a default project yet (configure later)

3. **Firestore rules:**
   - Accept default: `firestore.rules`

4. **Firestore indexes:**
   - Accept default: `firestore.indexes.json`

5. **Functions language:**
   - **Always choose TypeScript**

6. **ESLint:**
   - No (we use biome)

7. **Install dependencies:**
   - Yes

8. **Hosting:**
   - Accept default: `public` (we'll reconfigure later)

9. **Single-page app:**
   - No (unless using Next.js/React framework)

10. **Emulators:**
    - Select: Authentication, Functions, Firestore, Hosting

11. **Emulator ports:**
    - Accept defaults (or use: Auth=9099, Functions=5001, Firestore=8080, Hosting=5000)

12. **Download emulators:**
    - Yes

**Expected:** Firebase project initialized with TypeScript functions

### Step 4: Gather Architectural Decisions
- **Content**: Ask user for architecture preferences
- **ActiveForm**: Asking user for architecture preferences

**Use AskUserQuestion to gather decisions:**

**Question 1: Hosting Configuration**
```
Question: "What hosting configuration do you need?"
Header: "Hosting"
Options:
  - "Single Site" (One hosting site, simple project)
  - "Multiple Sites" (Multiple independent URLs with site: config)
  - "Multiple with Builds" (Multiple sites with predeploy hooks using target:)
  - "Not Sure" (Get recommendations based on project type)
```

**Question 2: Authentication Approach**
```
Question: "What authentication method will you use?"
Header: "Auth"
Options:
  - "API Keys" (MCP tools, server-to-server, programmatic access)
  - "Firebase Auth" (User-facing app with login UI)
  - "Both" (Firebase Auth for web + API keys for tools)
  - "None Yet" (Skip for now, add later)
```

**Question 3: Functions Architecture**
```
Question: "What Cloud Functions architecture fits your project?"
Header: "Functions"
Options:
  - "Express API" (Many related endpoints, need middleware, RESTful routing)
  - "Domain Grouped" (Feature-rich app with distinct areas: posts, admin, etc.)
  - "Individual Files" (Independent functions, maximum modularity)
  - "Not Sure" (Get recommendations)
```

**Question 4: Security Model**
```
Question: "What security model do you prefer?"
Header: "Security"
Options:
  - "Server-Write-Only" (Preferred: Cloud Functions handle all writes, maximum security)
  - "Client-Write" (High-volume writes, need fastest UX, more complex rules)
  - "Mixed" (Some collections server-write, others client-write)
  - "Not Sure" (Recommend server-write-only for most projects)
```

**Store responses for use in subsequent steps.**

### Step 5: Configure firebase.json
- **Content**: Configure firebase.json with hosting and emulators
- **ActiveForm**: Configuring firebase.json with hosting and emulators

**Actions:**

Based on hosting decision from Step 4, update `firebase.json`:

**For Single Site:**
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log"
      ],
      "predeploy": [
        "npm --prefix \"$RESOURCE_DIR\" run lint",
        "npm --prefix \"$RESOURCE_DIR\" run build"
      ]
    }
  ],
  "hosting": {
    "source": "hosting",
    "frameworksBackend": {
      "region": "us-central1"
    }
  },
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

**For Multiple Sites (site: based):**
```json
{
  "hosting": [
    {
      "site": "myproject-main",
      "source": "hosting",
      "frameworksBackend": {"region": "us-central1"}
    },
    {
      "site": "myproject-api",
      "public": "hosting-api",
      "rewrites": [{"source": "/**", "function": "api"}]
    }
  ],
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

**Note:** Always include `singleProjectMode: true` and `ui.enabled: true` in emulators config.

**Reference main skill for full hosting patterns:** @firebase-development → Multi-Hosting Setup

### Step 6: Set Up Functions Project Structure
- **Content**: Create TypeScript functions project structure
- **ActiveForm**: Creating TypeScript functions project structure

**Actions:**

Navigate to functions directory and configure:

```bash
cd functions

# Install additional dependencies based on architecture choice
# For Express architecture:
npm install express cors
npm install --save-dev @types/express @types/cors

# For all projects:
npm install firebase-admin firebase-functions

# Install dev tools
npm install --save-dev vitest @vitest/ui biome typescript
```

**Create functions/src/ structure based on architecture from Step 4:**

**For Express API:**
```bash
cd src
mkdir middleware tools services shared
touch middleware/.gitkeep tools/.gitkeep services/.gitkeep shared/types.ts
```

**For Domain-Grouped:**
```bash
cd src
mkdir shared
mkdir shared/types shared/validators shared/utils
touch shared/types/index.ts
```

**For Individual Files:**
```bash
cd src
mkdir functions
touch functions/.gitkeep
```

**Update functions/package.json scripts:**
```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:emulator": "vitest run --config vitest.emulator.config.ts",
    "lint": "biome check .",
    "lint:fix": "biome check --write ."
  }
}
```

### Step 7: Create Initial Functions Code
- **Content**: Create initial functions code with ABOUTME comments
- **ActiveForm**: Creating initial functions code with ABOUTME comments

**Actions:**

Create `functions/src/index.ts` based on architecture choice:

**For Express API:**
```typescript
// ABOUTME: Main entry point for Firebase Functions - exports API endpoint with routing
// ABOUTME: Configures Express app with CORS and health check

import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import express, { Request, Response } from 'express';
import cors from 'cors';

admin.initializeApp();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Add your routes here

export const api = onRequest({ invoker: 'public', cors: true }, app);
```

**For Domain-Grouped:**
```typescript
// ABOUTME: Main entry point - re-exports all Cloud Functions
// ABOUTME: Organizes functions by domain for clear structure

// Export functions from domain files as you create them
// Example:
// export * from './posts';
// export * from './users';
```

**For Individual Files:**
```typescript
// ABOUTME: Main entry point - exports all Cloud Functions
// ABOUTME: Imports and re-exports individual function files

import { onRequest } from 'firebase-functions/v2/https';

export const helloWorld = onRequest((req, res) => {
  res.json({ message: 'Hello from Firebase!' });
});

// Import and export additional functions as you create them
```

**If using API keys (from Step 4), create middleware:**

```bash
mkdir -p functions/src/middleware
```

Create `functions/src/middleware/apiKeyGuard.ts`:
```typescript
// ABOUTME: API key authentication middleware for Express routes
// ABOUTME: Validates API keys from x-api-key header against Firestore collection

import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function apiKeyGuard(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;

  // Replace 'myproj_' with your project prefix
  if (!apiKey || !apiKey.startsWith('myproj_')) {
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

**Reference main skill for full patterns:** @firebase-development → Cloud Functions Architecture, Authentication

### Step 8: Configure Firestore Rules
- **Content**: Set up initial Firestore security rules
- **ActiveForm**: Setting up initial Firestore security rules

**Actions:**

Update `firestore.rules` based on security model from Step 4:

**For Server-Write-Only (Recommended):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Config collection (public read, server write)
    match /config/{configId} {
      allow read: if true;
      allow write: if false;  // Only Cloud Functions can write
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow write: if false;  // Only Cloud Functions can write

      // API keys subcollection (if using API keys)
      match /apiKeys/{keyId} {
        allow read: if isOwner(userId);
        allow write: if false;  // Only Cloud Functions can write
      }
    }

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**For Client-Write with Validation:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId) &&
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['displayName', 'bio', 'photoURL', 'updatedAt']);
      allow delete: if false;  // Never allow user deletion via client
    }

    // Add collection rules as needed

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Add collection group rules if using API keys:**
```javascript
// Add after other rules, before default deny
match /{path=**}/apiKeys/{keyId} {
  allow read: if request.auth != null;
}
```

**Reference main skill for patterns:** @firebase-development → Security Model, Firestore Rules Patterns

### Step 9: Set Up Testing Infrastructure
- **Content**: Configure vitest for unit and integration tests
- **ActiveForm**: Configuring vitest for unit and integration tests

**Actions:**

Create `functions/vitest.config.ts`:
```typescript
// ABOUTME: Vitest configuration for Firebase Cloud Functions testing
// ABOUTME: Configures Node.js test environment with TypeScript support and coverage settings

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/lib/**', '**/__tests__/emulator/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        branches: 50,
        functions: 60,
        lines: 60,
        statements: 60,
      },
    },
    clearMocks: true,
    restoreMocks: true,
  },
});
```

Create `functions/vitest.emulator.config.ts`:
```typescript
// ABOUTME: Vitest configuration specifically for emulator tests
// ABOUTME: Used when running tests that require Firebase emulators

import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['**/__tests__/emulator/**/*.test.ts'],
      exclude: ['**/node_modules/**', '**/lib/**'],
      testTimeout: 30000,  // Longer timeout for emulator tests
    },
  })
);
```

Create test directory structure:
```bash
cd functions/src
mkdir -p __tests__/emulator
```

Create example unit test `functions/src/__tests__/health.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('Health Check', () => {
  it('should return ok status', () => {
    const result = { status: 'ok' };
    expect(result.status).toBe('ok');
  });
});
```

**Reference main skill:** @firebase-development → Modern Tooling Standards → Testing with vitest

### Step 10: Configure Linting with Biome
- **Content**: Set up biome for linting and formatting
- **ActiveForm**: Setting up biome for linting and formatting

**Actions:**

Create `functions/biome.json`:
```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": ["node_modules", "lib", "dist", "**/*.log"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single"
    }
  }
}
```

**Run initial lint:**
```bash
cd functions
npm run lint:fix
```

**Expected:** All files formatted according to biome config

### Step 11: Set Up Environment Variables
- **Content**: Create environment variable templates
- **ActiveForm**: Creating environment variable templates

**Actions:**

Create `functions/.env.example`:
```
# Firebase Project Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_REGION=us-central1

# API Keys (if using custom API keys)
API_KEY_PREFIX=myproj_

# External Services (add as needed)
# OPENAI_API_KEY=sk-...
# SENDGRID_API_KEY=SG...
```

Create `functions/.env`:
```bash
# Copy example and fill in actual values
cp functions/.env.example functions/.env
```

**For hosting (if using Next.js/React):**

Create `hosting/.env.local`:
```
NEXT_PUBLIC_USE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Important:** Never commit `.env` or `.env.local` files (already in .gitignore)

### Step 12: Initialize Git and Create Initial Commit
- **Content**: Create initial git commit
- **ActiveForm**: Creating initial git commit

**Actions:**

```bash
# Return to project root
cd ..

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial Firebase project setup

- Configure firebase.json with emulators
- Set up TypeScript functions with [architecture choice]
- Add Firestore rules ([security model])
- Configure vitest for testing
- Set up biome for linting
- Add environment variable templates

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Step 13: Start Emulators for First Time
- **Content**: Start Firebase emulators and verify setup
- **ActiveForm**: Starting Firebase emulators and verifying setup

**Actions:**

```bash
# Start emulators
firebase emulators:start
```

**Verify in terminal output:**
- ✓ Auth emulator started at http://127.0.0.1:9099
- ✓ Functions emulator started at http://127.0.0.1:5001
- ✓ Firestore emulator started at http://127.0.0.1:8080
- ✓ Hosting emulator started at http://127.0.0.1:5000
- ✓ Emulator UI available at http://127.0.0.1:4000

**Open Emulator UI:**
```bash
open http://127.0.0.1:4000
```

**Test health endpoint (if using Express):**
```bash
curl http://127.0.0.1:5001/[project-id]/us-central1/api/health
```

**Expected:** `{"status":"ok","timestamp":"..."}`

**Stop emulators:**
- Press Ctrl+C in terminal (graceful shutdown exports data)

### Step 14: Create Initial Test Files
- **Content**: Create initial test files for CI/CD
- **ActiveForm**: Creating initial test files for CI/CD

**Actions:**

Create `functions/src/__tests__/setup.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('Project Setup', () => {
  it('should have correct Node version', () => {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    expect(majorVersion).toBeGreaterThanOrEqual(18);
  });

  it('should load environment variables', () => {
    // This will pass even without .env in CI
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
```

**Run tests:**
```bash
cd functions
npm run test
```

**Expected:** All tests pass

**Final commit:**
```bash
git add .
git commit -m "test: add initial test suite

Verifies project setup and environment configuration.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Firebase Init Commands Reference

Quick reference for running `firebase init` with different configurations:

### Standard Init (Interactive)
```bash
firebase init
```

### Init Specific Features
```bash
# Only Firestore
firebase init firestore

# Only Functions
firebase init functions

# Only Hosting
firebase init hosting

# Only Emulators
firebase init emulators

# Multiple features
firebase init firestore functions hosting emulators
```

### Non-Interactive Init (CI/CD)
```bash
# Use existing firebase.json
firebase init --project=your-project-id

# Skip all prompts (only works with existing firebase.json)
firebase init --non-interactive
```

### Common Firebase CLI Commands
```bash
# List available projects
firebase projects:list

# Use specific project
firebase use your-project-id

# Add project alias
firebase use --add

# Check current project
firebase use

# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only firestore
firebase deploy --only functions
firebase deploy --only hosting

# Start emulators
firebase emulators:start

# Export emulator data
firebase emulators:export ./backup

# Import data on start
firebase emulators:start --import=./backup
```

## Initial File Creation Patterns

### Minimal API Project Structure
```
my-firebase-project/
├── .gitignore
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── functions/
│   ├── package.json
│   ├── tsconfig.json
│   ├── biome.json
│   ├── vitest.config.ts
│   ├── .env.example
│   ├── .env
│   └── src/
│       ├── index.ts
│       ├── middleware/
│       │   └── apiKeyGuard.ts
│       ├── tools/
│       │   └── .gitkeep
│       └── __tests__/
│           ├── setup.test.ts
│           └── emulator/
│               └── .gitkeep
└── hosting/
    └── index.html
```

### Domain-Grouped Project Structure
```
my-firebase-project/
├── .gitignore
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── functions/
│   ├── package.json
│   ├── tsconfig.json
│   ├── biome.json
│   ├── vitest.config.ts
│   └── src/
│       ├── index.ts
│       ├── posts.ts
│       ├── users.ts
│       ├── admin.ts
│       ├── shared/
│       │   ├── types/
│       │   ├── validators/
│       │   └── utils/
│       └── __tests__/
│           ├── posts.test.ts
│           └── emulator/
│               └── workflow.test.ts
└── hosting/
    └── (Next.js app files)
```

### Multi-Site Project Structure
```
my-firebase-project/
├── .gitignore
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── functions/
│   └── (function files)
├── hosting/           # Main site
│   └── (Next.js app)
├── hosting-api/       # API site
│   └── index.html
└── hosting-admin/     # Admin site
    └── index.html
```

## Verification Checklist

After completing all TodoWrite steps, verify:

- [ ] Firebase CLI installed and logged in
- [ ] `firebase init` completed successfully
- [ ] TypeScript functions compile: `cd functions && npm run build`
- [ ] All tests pass: `cd functions && npm run test`
- [ ] Linting passes: `cd functions && npm run lint`
- [ ] Emulators start without errors: `firebase emulators:start`
- [ ] Emulator UI accessible at http://127.0.0.1:4000
- [ ] Health endpoint responds (if using Express)
- [ ] Firestore rules deploy: `firebase deploy --only firestore:rules`
- [ ] Git initialized with initial commits
- [ ] `.env` files created and .gitignored
- [ ] ABOUTME comments on all TypeScript files
- [ ] Architecture decisions documented in commit messages

## Next Steps

After project setup is complete:

1. **Add your first feature** using @firebase-development/add-feature
2. **Review setup** using @firebase-development/validate
3. **Debug any issues** using @firebase-development/debug

## Pattern References

All patterns used in this workflow are documented in the main skill:

- **Multi-Hosting:** @firebase-development → Multi-Hosting Setup
- **Authentication:** @firebase-development → Authentication
- **Functions:** @firebase-development → Cloud Functions Architecture
- **Security:** @firebase-development → Security Model
- **Rules:** @firebase-development → Firestore Rules Patterns
- **Emulators:** @firebase-development → Emulator-First Development
- **Testing:** @firebase-development → Modern Tooling Standards
- **Tooling:** @firebase-development → TypeScript, vitest, biome, ABOUTME

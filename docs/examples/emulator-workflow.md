# Firebase Emulator Development Workflow - Complete Guide

Daily development workflow using Firebase emulators for safe, fast local development.

## Overview

This guide shows the complete day-to-day workflow using Firebase emulators:

1. **Essential configuration** - firebase.json setup
2. **Client-side emulator detection** - Connecting Next.js/React to emulators
3. **Data persistence** - Managing emulator data across sessions
4. **Daily development workflow** - Start, develop, test, stop
5. **Testing patterns** - Unit tests vs emulator tests
6. **Debugging techniques** - Using Emulator UI effectively
7. **Common issues** - Troubleshooting guide

**Key principle:** Always develop locally with emulators. Never test directly in production.

---

## Part 1: Essential Configuration

### firebase.json Emulator Setup

**Critical settings for all projects:**

```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true,
      "port": 4000
    },
    "singleProjectMode": true
  }
}
```

**Required settings explained:**

- `singleProjectMode: true` - **ESSENTIAL**: Allows emulators to work together
- `ui.enabled: true` - **ESSENTIAL**: Access debug UI at http://127.0.0.1:4000
- Consistent ports - Use same ports across all projects for muscle memory

**All three production projects use these exact settings.**

### Complete firebase.json Example

```json
{
  "hosting": {
    "source": "hosting",
    "frameworksBackend": {
      "region": "us-central1"
    }
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "runtime": "nodejs20"
    }
  ],
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
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

---

## Part 2: Client-Side Emulator Detection

### Next.js / React Pattern

**hosting/lib/firebase.ts:**
```typescript
// ABOUTME: Firebase client-side configuration and initialization
// ABOUTME: Exports auth, firestore, and functions instances for use in components

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Get service instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';

  if (useEmulators) {
    console.log('🔧 Connecting to Firebase emulators...');

    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', {
      disableWarnings: true // Suppress "already connected" warnings
    });

    // Connect to Firestore emulator
    connectFirestoreEmulator(db, '127.0.0.1', 8080);

    // Connect to Functions emulator
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);

    console.log('✅ Connected to emulators');
  } else {
    console.log('📡 Using production Firebase');
  }
}
```

**Key details:**
- Only runs in browser (`typeof window !== 'undefined'`)
- Checks `NODE_ENV === 'development'`
- Controlled by `NEXT_PUBLIC_USE_EMULATORS` env var
- `disableWarnings: true` prevents duplicate connection warnings
- Logs connection status for debugging

### Environment Variables

**hosting/.env.local:**
```bash
# Emulator control
NEXT_PUBLIC_USE_EMULATORS=true

# Firebase config (same for dev and prod)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**hosting/.env.production:**
```bash
# Production uses real Firebase (no emulators)
NEXT_PUBLIC_USE_EMULATORS=false

# Same Firebase config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... etc
```

**Switching modes:**
```bash
# Use emulators (default for local dev)
export NEXT_PUBLIC_USE_EMULATORS=true
npm run dev

# Test against production Firebase locally (rare)
export NEXT_PUBLIC_USE_EMULATORS=false
npm run dev
```

**Example from:** `/Users/dylanr/work/2389/oneonone/hosting/lib/firebase.ts:28-54`

---

## Part 3: Data Persistence

### How Emulator Data Works

**Automatic export on shutdown:**
```
.firebase/emulator-data/
├── auth_export/
│   └── accounts.json
├── firestore_export/
│   ├── all_namespaces/
│   └── firestore_export.overall_export_metadata
└── firebase-export-metadata.json
```

**Data lifecycle:**

1. **Start emulators** → Auto-imports from `.firebase/emulator-data/`
2. **Make changes** → Stored in emulator memory
3. **Stop with Ctrl+C** → Auto-exports to `.firebase/emulator-data/`
4. **Kill emulators** → ⚠️ Data NOT exported (data lost!)

### Manual Export/Import

**Export data manually:**
```bash
# While emulators are running
firebase emulators:export ./backup

# Creates ./backup/ directory with snapshot
```

**Import data on startup:**
```bash
# Start with specific export
firebase emulators:start --import=./backup

# Start with data from another project
firebase emulators:start --import=../other-project/.firebase/emulator-data
```

**Start fresh (delete all data):**
```bash
# Stop emulators first
Ctrl+C

# Delete persisted data
rm -rf .firebase/emulator-data

# Restart emulators (empty state)
firebase emulators:start
```

### Gitignore Setup

**Never commit emulator data:**

```bash
# .gitignore
.firebase/
firebase-debug.log
firestore-debug.log
ui-debug.log
```

### Seed Data Pattern

**Create seed script for consistent test data:**

**scripts/seed-emulator.ts:**
```typescript
// ABOUTME: Script to seed Firebase emulators with test data
// ABOUTME: Run with: npm run seed-emulator (emulators must be running)

import * as admin from 'firebase-admin';

// Connect to emulators
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

admin.initializeApp({ projectId: 'demo-project' });

async function seed() {
  const db = admin.firestore();
  const auth = admin.auth();

  console.log('🌱 Seeding emulator data...');

  // Create test users
  const testUser = await auth.createUser({
    uid: 'test-user-1',
    email: 'test@example.com',
    password: 'password123',
    displayName: 'Test User',
  });
  console.log('✅ Created user:', testUser.uid);

  // Create user document
  await db.collection('users').doc(testUser.uid).set({
    userId: testUser.uid,
    email: testUser.email,
    displayName: testUser.displayName,
    role: 'user',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('✅ Created user document');

  // Create test API key
  await db
    .collection('users')
    .doc(testUser.uid)
    .collection('apiKeys')
    .doc('ooo_test123')
    .set({
      keyId: 'ooo_test123',
      userId: testUser.uid,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      name: 'Test key',
    });
  console.log('✅ Created API key');

  console.log('🎉 Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
```

**package.json:**
```json
{
  "scripts": {
    "seed-emulator": "tsx scripts/seed-emulator.ts"
  }
}
```

**Workflow:**
```bash
# Start emulators
firebase emulators:start

# In another terminal: seed data
npm run seed-emulator

# Now emulators have consistent test data
```

---

## Part 4: Daily Development Workflow

### Morning: Start Development

**Terminal 1 - Start emulators:**
```bash
cd /path/to/project
firebase emulators:start

# Output:
# ┌─────────────┬────────────────┬─────────────────────────────────┐
# │ Emulator    │ Host:Port      │ View in Emulator UI             │
# ├─────────────┼────────────────┼─────────────────────────────────┤
# │ Auth        │ 127.0.0.1:9099 │ http://127.0.0.1:4000/auth      │
# │ Functions   │ 127.0.0.1:5001 │ http://127.0.0.1:4000/functions │
# │ Firestore   │ 127.0.0.1:8080 │ http://127.0.0.1:4000/firestore │
# │ Hosting     │ 127.0.0.1:5000 │ n/a                             │
# └─────────────┴────────────────┴─────────────────────────────────┘
#
# 📱 View Emulator UI at http://127.0.0.1:4000
```

**Terminal 2 - Start Next.js dev server:**
```bash
cd hosting
npm run dev

# Output:
# ✓ Ready on http://localhost:3000
# 🔧 Connecting to Firebase emulators...
# ✅ Connected to emulators
```

**Terminal 3 - Watch functions compilation:**
```bash
cd functions
npm run dev  # Runs: tsc --watch

# Output:
# [12:00:00 PM] Starting compilation in watch mode...
# [12:00:03 PM] Found 0 errors. Watching for file changes.
```

### During Development: Make Changes

**Scenario: Add new Cloud Function**

**1. Write function code:**
```typescript
// functions/src/tools/getStatus.ts
export async function handleGetStatus(userId: string) {
  return {
    success: true,
    data: { status: 'ok', userId }
  };
}
```

**2. Wire up route:**
```typescript
// functions/src/index.ts
import { handleGetStatus } from './tools/getStatus';

app.post('/mcp', apiKeyGuard, async (req, res) => {
  const { tool, params } = req.body;
  const userId = req.userId!;

  switch (tool) {
    case 'get_status':
      result = await handleGetStatus(userId);
      break;
    // ... other cases
  }
});
```

**3. TypeScript recompiles automatically (Terminal 3):**
```
[12:05:23 PM] File change detected. Starting incremental compilation...
[12:05:24 PM] Found 0 errors. Watching for file changes.
```

**4. Functions emulator reloads automatically (Terminal 1):**
```
⚠  functions: Function code has changed, reloading...
✔  functions: Loaded functions definitions from source
```

**5. Test immediately:**
```bash
# Terminal 4
curl -X POST http://127.0.0.1:5001/your-project/us-central1/mcpEndpoint/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: ooo_test123" \
  -d '{"tool": "get_status", "params": {}}'

# Response: {"success": true, "data": {"status": "ok", "userId": "test-user-1"}}
```

**6. Test in browser:**
- Visit http://localhost:3000
- Click button that calls new endpoint
- See result immediately

### Mid-Day: Debug an Issue

**Scenario: API call returns "Permission denied"**

**1. Check Emulator UI:**
- Open http://127.0.0.1:4000
- Click "Firestore" tab
- Click "Requests" tab → See failed request
- Click request → See error: "Missing required key: userId"

**2. Check function logs (Terminal 1):**
```
i  functions: Beginning execution of "mcpEndpoint"
>  POST /mcp
>  {"tool": "create_session", "params": {"partnerId": "user-456"}}
!  Error: Missing required key: userId
i  functions: Finished "mcpEndpoint" in ~1s
```

**3. Add debug logging:**
```typescript
// functions/src/tools/createSession.ts
export async function handleCreateSession(userId: string, params: any) {
  console.log('createSession called:', { userId, params }); // Debug log
  // ... rest of function
}
```

**4. Test again → See debug output (Terminal 1):**
```
>  createSession called: { userId: 'test-user-1', params: { partnerId: 'user-456' } }
```

**5. Fix issue → Test again → Works!**

### Afternoon: Test Firestore Rules

**1. Open Rules Playground:**
- Visit http://127.0.0.1:4000
- Click "Firestore"
- Click "Rules" tab
- Click "Rules Playground"

**2. Test rule:**
```javascript
// Rule to test:
match /users/{userId} {
  allow read: if request.auth.uid == userId;
}

// Test case:
Service: cloud.firestore
Location: /users/test-user-1
Method: get
Auth: { uid: 'test-user-1' }

// Result: ✅ ALLOWED
```

**3. Test failure case:**
```javascript
// Test case:
Service: cloud.firestore
Location: /users/other-user
Method: get
Auth: { uid: 'test-user-1' }

// Result: ❌ DENIED
```

**4. Edit rules → Auto-reload:**
```javascript
// firestore.rules (edit and save)
match /users/{userId} {
  allow read: if request.auth.uid == userId || isAdmin();
}

// Emulator reloads rules automatically:
✔  firestore: Rules updated
```

**5. Test again in playground → New behavior!**

### Evening: Clean Up and Stop

**Stop emulators gracefully (Terminal 1):**
```bash
Ctrl+C

# Output:
# Stopping emulators...
# Exporting data to .firebase/emulator-data
# ✔  Export complete
# ✔  All emulators stopped
```

**Data is saved to `.firebase/emulator-data/`**

**Tomorrow morning:**
```bash
firebase emulators:start
# Automatically imports yesterday's data
```

---

## Part 5: Testing Patterns

### Unit Tests (No Emulators)

**functions/src/__tests__/middleware/apiKeyGuard.test.ts:**
```typescript
// ABOUTME: Unit tests for API key authentication middleware
// ABOUTME: Mocks Firestore, tests logic in isolation

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { apiKeyGuard } from '../../middleware/apiKeyGuard';
import * as admin from 'firebase-admin';

// Mock Firebase Admin
vi.mock('firebase-admin', () => ({
  firestore: vi.fn(() => ({
    collectionGroup: vi.fn(() => ({
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      get: vi.fn(),
    })),
  })),
}));

describe('apiKeyGuard', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should reject request with no API key', async () => {
    await apiKeyGuard(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Invalid or missing API key' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject API key with wrong prefix', async () => {
    req.headers = { 'x-api-key': 'wrong_prefix' };

    await apiKeyGuard(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
```

**Run unit tests:**
```bash
cd functions
npm run test

# Output:
# ✓ src/__tests__/middleware/apiKeyGuard.test.ts (2 tests) 45ms
# Test Files  1 passed (1)
#      Tests  2 passed (2)
```

**Advantages:**
- Fast (no emulator startup)
- Isolated (tests logic only)
- Good for TDD (red-green-refactor)

### Integration Tests (With Emulators)

**functions/src/__tests__/integration/mcp-workflow.test.ts:**
```typescript
// ABOUTME: Integration tests for MCP workflow using Firebase emulators
// ABOUTME: Tests complete end-to-end flow with real Firestore and Auth

import { describe, it, expect, beforeAll } from 'vitest';
import * as admin from 'firebase-admin';
import axios from 'axios';

// Connect to emulators
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

beforeAll(() => {
  admin.initializeApp({ projectId: 'demo-test' });
});

describe('MCP Workflow', () => {
  it('should create session and send message', async () => {
    const db = admin.firestore();
    const auth = admin.auth();

    // 1. Create test user
    const user = await auth.createUser({
      uid: 'integration-test-user',
      email: 'integration@test.com',
    });

    // 2. Create API key
    const apiKey = 'ooo_integration_test';
    await db
      .collection('users')
      .doc(user.uid)
      .collection('apiKeys')
      .doc(apiKey)
      .set({
        keyId: apiKey,
        userId: user.uid,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // 3. Call create session endpoint
    const sessionResponse = await axios.post(
      'http://127.0.0.1:5001/demo-test/us-central1/mcpEndpoint/mcp',
      {
        tool: 'request_session',
        params: { partnerId: 'partner-123' },
      },
      {
        headers: { 'x-api-key': apiKey },
      }
    );

    expect(sessionResponse.data.success).toBe(true);
    const sessionId = sessionResponse.data.data.sessionId;

    // 4. Verify session created in Firestore
    const sessionDoc = await db.collection('sessions').doc(sessionId).get();
    expect(sessionDoc.exists).toBe(true);
    expect(sessionDoc.data()?.userId).toBe(user.uid);

    // 5. Send message
    const messageResponse = await axios.post(
      'http://127.0.0.1:5001/demo-test/us-central1/mcpEndpoint/mcp',
      {
        tool: 'send_message',
        params: { sessionId, content: 'Test message' },
      },
      {
        headers: { 'x-api-key': apiKey },
      }
    );

    expect(messageResponse.data.success).toBe(true);

    // Cleanup
    await auth.deleteUser(user.uid);
  });
});
```

**vitest.emulator.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000, // Longer timeout for emulator tests
  },
});
```

**Run integration tests:**
```bash
# Terminal 1: Start emulators
firebase emulators:start

# Terminal 2: Run integration tests
cd functions
npm run test:emulator

# Output:
# ✓ src/__tests__/integration/mcp-workflow.test.ts (1 test) 2.3s
# Test Files  1 passed (1)
#      Tests  1 passed (1)
```

**Advantages:**
- Tests real behavior
- Catches integration bugs
- Verifies Firestore rules
- Confidence for deployment

---

## Part 6: Debugging Techniques

### Using Emulator UI

**Firestore Tab:**
- View all collections and documents
- Add/edit/delete data manually
- See real-time updates as code runs
- Test queries interactively

**Auth Tab:**
- View all users
- See user tokens
- Add test users manually
- Reset passwords

**Functions Tab:**
- See all deployed functions
- View request logs
- See execution time
- Check for errors

**Logs Tab:**
- Combined logs from all emulators
- Filter by level (info, warn, error)
- Search logs
- Export logs

### Adding Debug Logging

**Functions:**
```typescript
// Use console.log (appears in emulator terminal)
console.log('Debug:', { userId, params });

// Use structured logging
console.log(JSON.stringify({ level: 'debug', userId, params }));
```

**Client:**
```typescript
// Use console.log (appears in browser console)
console.log('Calling API:', { tool, params });

// Firebase has debug mode
import { setLogLevel } from 'firebase/app';
setLogLevel('debug'); // Shows all Firebase SDK logs
```

### Network Debugging

**Functions emulator has built-in logging:**
```
i  functions: Beginning execution of "mcpEndpoint"
>  GET /health
<  200 {"status": "ok"}
i  functions: Finished "mcpEndpoint" in ~150ms
```

**Use curl for raw requests:**
```bash
# Test with verbose output
curl -v -X POST http://127.0.0.1:5001/project/us-central1/mcpEndpoint/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: ooo_test" \
  -d '{"tool": "get_status"}'

# Shows full headers, timing, response
```

---

## Part 7: Common Issues

### Issue 1: Port Already in Use

**Symptom:**
```
Error: Port 5001 is already in use
```

**Solution:**
```bash
# Find process using port
lsof -i :5001

# Kill process
kill -9 <PID>

# Or change port in firebase.json
```

### Issue 2: Data Not Persisting

**Symptom:** Data disappears when restarting emulators

**Solution:**
- Always stop with `Ctrl+C` (not kill)
- Check `.firebase/emulator-data/` exists
- Manually export: `firebase emulators:export ./backup`

### Issue 3: Rules Not Updating

**Symptom:** Changed rules but behavior unchanged

**Solution:**
- Save `firestore.rules` file
- Emulator auto-reloads (watch for "✔ Rules updated")
- If not working: restart emulators

### Issue 4: Functions Not Reloading

**Symptom:** Code changes not reflected

**Solution:**
```bash
# Check TypeScript compilation (Terminal 3)
# Should show: "File change detected..."

# If not, restart watch:
cd functions
npm run dev

# If still broken, restart emulators
```

### Issue 5: Cold Start Delays

**Symptom:** First function call takes 5-10 seconds

**Solution:**
- This is normal (function cold start)
- Subsequent calls are fast
- Not a bug, just emulator startup time

### Issue 6: Can't Connect to Emulators from Client

**Symptom:**
```
FirebaseError: Failed to get document because the client is offline
```

**Solution:**
```typescript
// Check environment variables
console.log('USE_EMULATORS:', process.env.NEXT_PUBLIC_USE_EMULATORS);

// Check connection code runs
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Should connect to emulators');
}

// Verify emulators are running
// Visit http://127.0.0.1:4000
```

---

## Summary: Daily Checklist

**Morning:**
- [ ] Start emulators: `firebase emulators:start`
- [ ] Start dev server: `npm run dev`
- [ ] Start watch mode: `npm run dev` (in functions/)
- [ ] Open Emulator UI: http://127.0.0.1:4000

**During development:**
- [ ] Make code changes
- [ ] Check auto-reload in emulator terminal
- [ ] Test changes immediately
- [ ] Use Emulator UI for debugging
- [ ] Check logs for errors
- [ ] Test Firestore rules in Rules Playground

**Before committing:**
- [ ] Run unit tests: `npm run test`
- [ ] Run integration tests: `npm run test:emulator`
- [ ] Test in browser manually
- [ ] Check for console errors

**Evening:**
- [ ] Stop emulators with Ctrl+C (data auto-exports)
- [ ] Never kill emulators (data won't save)

**Never:**
- [ ] ❌ Test directly in production
- [ ] ❌ Kill emulators without Ctrl+C
- [ ] ❌ Commit `.firebase/` directory
- [ ] ❌ Skip testing before deployment

## References

- **Emulator config:** All projects use same firebase.json emulator settings
- **Client detection:** `/Users/dylanr/work/2389/oneonone/hosting/lib/firebase.ts:28-54`
- **Main skill:** `firebase-development/SKILL.md` → Emulator-First Development section

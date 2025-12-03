---
name: firebase-development:add-feature
description: Add new Cloud Functions, Firestore collections, or API endpoints to Firebase project following TDD. Guides through test-first development, architecture patterns, security rules, and emulator verification.
---

# Firebase Add Feature

## Overview

This sub-skill guides you through adding new features to an existing Firebase project using Test-Driven Development (TDD). It handles:

- Identifying feature type (Cloud Function, Firestore collection, API endpoint)
- Checking existing project architecture patterns
- Writing tests FIRST (TDD requirement)
- Creating function files with ABOUTME comments
- Adding Firestore security rules
- Updating indexes if needed
- Implementing authentication checks
- Using {success, message, data?} response pattern
- Exporting functions properly
- Testing with emulators
- Documentation and verification

The workflow uses TodoWrite to track 12 steps from feature identification to emulator verification.

## When This Sub-Skill Applies

Use this sub-skill when:
- Adding a new Cloud Function to an existing Firebase project
- Creating a new Firestore collection with rules
- Adding an API endpoint to Express app
- Building a new MCP tool backed by Firebase
- User says: "add function", "create endpoint", "new tool", "add api", "new collection", "implement"

**Do not use for:**
- Initial project setup (use @firebase-development/project-setup)
- Debugging existing features (use @firebase-development/debug)
- Reviewing existing code (use @firebase-development/validate)

## Integration with Superpowers Skills

This sub-skill integrates with superpowers skills for quality enforcement:

**TDD Integration:**
- Automatically follows superpowers:test-driven-development workflow
- Write failing test ’ Make it pass ’ Refactor
- Tests MUST be written before implementation code
- If implementation exists without tests, tests are written first

**Verification Integration:**
- Uses superpowers:verification-before-completion
- Requires running tests and emulators before claiming completion
- Evidence (test output, emulator logs) required before marking done

**Pattern Integration:**
- Follows superpowers:defense-in-depth for validation at every layer
- Uses {success, message, data?} response pattern for all handlers

## Reference Patterns

All patterns are documented in the main @firebase-development skill. This sub-skill helps you implement those patterns for new features.

**Key Patterns Referenced:**
1. **Functions Architecture:** Express vs domain-grouped vs individual files
2. **Authentication:** API keys vs Firebase Auth validation
3. **Security Model:** Server-write-only vs client-write-validated
4. **Response Pattern:** {success, message, data?} for all handlers
5. **ABOUTME Comments:** Every file starts with 2-line description

## TodoWrite Workflow

This sub-skill creates a TodoWrite checklist with 12 steps. Follow the checklist to systematically add your feature using TDD.

### Step 1: Identify Feature Type
- **Content**: Identify what type of feature is being added
- **ActiveForm**: Identifying what type of feature is being added

**Actions:**

Analyze the user's request to determine feature type:

**Feature Types:**
1. **HTTP Endpoint** - New API route (GET/POST/etc.)
2. **Firestore Trigger** - Function runs on document create/update/delete
3. **Scheduled Function** - Runs on a schedule (cron job)
4. **Callable Function** - Called directly from client SDKs
5. **New Collection** - New Firestore collection with rules

**Use AskUserQuestion if unclear:**

```
Question: "What type of Firebase feature are you adding?"
Header: "Feature Type"
Options:
  - "HTTP Endpoint" (API route for Express app or standalone)
  - "Firestore Trigger" (Runs when documents change)
  - "Scheduled Function" (Cron job or periodic task)
  - "Callable Function" (Direct client SDK calls)
```

**Store the feature type for use in subsequent steps.**

### Step 2: Check Existing Architecture
- **Content**: Analyze existing project architecture
- **ActiveForm**: Analyzing existing project architecture

**Actions:**

Examine the existing project to understand patterns:

```bash
# Check functions architecture
ls -la functions/src/

# Look for existing patterns
grep -r "onRequest" functions/src/
grep -r "export" functions/src/index.ts

# Check if Express is used
grep "express" functions/package.json

# Check authentication patterns
ls -la functions/src/middleware/
grep -r "request.auth" functions/src/
grep -r "x-api-key" functions/src/
```

**Determine:**
- Architecture style: Express app, domain-grouped, or individual files?
- Auth method: API keys, Firebase Auth, or both?
- Security model: Server-write-only or client-write?
- Existing patterns: How are similar features implemented?

**Reference main skill:** @firebase-development ’ Cloud Functions Architecture, Authentication

### Step 3: Write Failing Test First (TDD)
- **Content**: Write test that fails before implementation exists
- **ActiveForm**: Writing test that fails before implementation exists

**Actions:**

Following TDD: Write the test FIRST, watch it fail.

**Create test file based on architecture:**

**For Express API (functions/src/__tests__/tools/yourFeature.test.ts):**
```typescript
// ABOUTME: Unit tests for [feature name] functionality
// ABOUTME: Tests [what the feature does] with various input scenarios

import { describe, it, expect, vi } from 'vitest';
import { handleYourFeature } from '../../tools/yourFeature';

describe('handleYourFeature', () => {
  it('should return success when given valid input', async () => {
    const userId = 'test-user-123';
    const params = {
      // Your expected parameters
      name: 'test',
      value: 42
    };

    const result = await handleYourFeature(userId, params);

    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
    expect(result.data).toBeDefined();
  });

  it('should return error when given invalid input', async () => {
    const userId = 'test-user-123';
    const params = {
      // Invalid parameters
      name: '',  // Empty name should fail
    };

    const result = await handleYourFeature(userId, params);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid');
  });

  it('should validate authentication', async () => {
    const userId = '';  // Empty userId should fail
    const params = { name: 'test', value: 42 };

    const result = await handleYourFeature(userId, params);

    expect(result.success).toBe(false);
    expect(result.message).toContain('authentication');
  });
});
```

**For Domain-Grouped (functions/src/__tests__/domainName.test.ts):**
```typescript
// ABOUTME: Unit tests for [domain] functionality
// ABOUTME: Tests all functions in [domain] file

import { describe, it, expect } from 'vitest';
import { yourFunction } from '../domainName';
import * as admin from 'firebase-admin';

describe('Domain: yourFunction', () => {
  it('should handle valid requests', async () => {
    // Mock request/response
    const mockReq = {
      auth: { uid: 'test-user' },
      body: { data: 'test' }
    };
    const mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    await yourFunction(mockReq as any, mockRes as any);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.any(String),
      })
    );
  });
});
```

**For Firestore Trigger:**
```typescript
// ABOUTME: Tests for [collection] Firestore triggers
// ABOUTME: Verifies trigger behavior on document create/update/delete

import { describe, it, expect, beforeAll } from 'vitest';
import * as admin from 'firebase-admin';

describe('Firestore Trigger: onDocumentCreated', () => {
  beforeAll(() => {
    if (admin.apps.length === 0) {
      admin.initializeApp({ projectId: 'test-project' });
    }
  });

  it('should process new document correctly', async () => {
    // This will fail until implementation exists
    const testDoc = {
      id: 'test-123',
      name: 'Test Document',
      createdAt: new Date(),
    };

    // Test your trigger logic
    expect(true).toBe(false);  // Intentional failure - implement this!
  });
});
```

**Run test to confirm it fails:**
```bash
cd functions
npm run test
```

**Expected:** Test fails because implementation doesn't exist yet. This confirms TDD process.

**Reference:** superpowers:test-driven-development

### Step 4: Create Function File with ABOUTME
- **Content**: Create new function file with proper structure
- **ActiveForm**: Creating new function file with proper structure

**Actions:**

Create the function file based on architecture pattern:

**For Express API (functions/src/tools/yourFeature.ts):**
```typescript
// ABOUTME: Implements [feature name] functionality for [purpose]
// ABOUTME: Handles [what it does] and returns {success, message, data?} response

import * as admin from 'firebase-admin';

/**
 * Response type for handler functions
 */
export interface HandlerResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Parameters for this feature
 */
export interface YourFeatureParams {
  name: string;
  value: number;
  // Add your parameters
}

/**
 * Handles [feature name]
 *
 * @param userId - Authenticated user ID
 * @param params - Feature parameters
 * @returns Promise with {success, message, data?}
 */
export async function handleYourFeature(
  userId: string,
  params: YourFeatureParams
): Promise<HandlerResponse> {
  try {
    // Validate authentication
    if (!userId) {
      return {
        success: false,
        message: 'Authentication required',
      };
    }

    // Validate input
    if (!params.name || params.name.trim() === '') {
      return {
        success: false,
        message: 'Invalid input: name is required',
      };
    }

    // Get Firestore instance
    const db = admin.firestore();

    // Implement your feature logic here
    // Example: Create a document
    const docRef = db.collection('yourCollection').doc();
    await docRef.set({
      userId,
      name: params.name,
      value: params.value,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Feature executed successfully',
      data: {
        id: docRef.id,
        name: params.name,
        value: params.value,
      },
    };
  } catch (error) {
    console.error('Error in handleYourFeature:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
```

**For Domain-Grouped (functions/src/yourDomain.ts):**
```typescript
// ABOUTME: [Domain name] functions for [purpose]
// ABOUTME: Handles [list main responsibilities]

import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

export const yourFunction = onRequest(async (req, res) => {
  try {
    // Validate authentication
    if (!req.auth) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Validate input
    const { data } = req.body;
    if (!data) {
      res.status(400).json({
        success: false,
        message: 'Invalid input',
      });
      return;
    }

    // Implement logic
    const result = {
      success: true,
      message: 'Operation successful',
      data: { /* your response data */ },
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in yourFunction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// If adding Firestore trigger
export const onYourTrigger = onDocumentCreated(
  'yourCollection/{docId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }

    const data = snapshot.data();
    console.log('Processing:', data);

    // Implement trigger logic
  }
);
```

**For Individual Files (functions/functions/yourFeature.js):**
```javascript
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

exports.yourFeature = onRequest(async (req, res) => {
  try {
    // Implementation
    res.json({
      success: true,
      message: 'Feature executed successfully',
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error occurred',
    });
  }
});
```

**Reference main skill:** @firebase-development ’ Cloud Functions Architecture

### Step 5: Add Firestore Security Rules
- **Content**: Update firestore.rules for new collections
- **ActiveForm**: Updating firestore.rules for new collections

**Actions:**

Add rules for any new Firestore collections:

**For Server-Write-Only Pattern:**
```javascript
// Add to firestore.rules

match /yourCollection/{docId} {
  allow read: if request.auth != null;  // Authenticated users can read
  allow write: if false;  // Only Cloud Functions can write
}

// If documents are user-specific
match /users/{userId}/yourCollection/{docId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if false;  // Only Cloud Functions can write
}
```

**For Client-Write Pattern:**
```javascript
// Add to firestore.rules

match /yourCollection/{docId} {
  // Allow authenticated users to create their own documents
  allow create: if request.auth != null &&
                   request.resource.data.userId == request.auth.uid &&
                   request.resource.data.createdAt == request.time;

  // Allow users to read their own documents
  allow read: if request.auth != null &&
                 resource.data.userId == request.auth.uid;

  // Allow users to update only specific safe fields
  allow update: if request.auth != null &&
                   resource.data.userId == request.auth.uid &&
                   request.resource.data.diff(resource.data).affectedKeys()
                     .hasOnly(['name', 'value', 'updatedAt']);

  // Allow users to delete their own documents
  allow delete: if request.auth != null &&
                   resource.data.userId == request.auth.uid;
}
```

**For Admin-Only Collections:**
```javascript
// Add helper function if not exists
function isAdmin() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

// Add collection rules
match /adminCollection/{docId} {
  allow read: if request.auth != null && isAdmin();
  allow write: if request.auth != null && isAdmin();
}
```

**Test rules in Emulator UI:**
- Open http://127.0.0.1:4000
- Navigate to Firestore ’ Rules Playground
- Test read/write operations with different auth states

**Reference main skill:** @firebase-development ’ Firestore Rules Patterns

### Step 6: Update Firestore Indexes if Needed
- **Content**: Add composite indexes for complex queries
- **ActiveForm**: Adding composite indexes for complex queries

**Actions:**

If your feature uses complex queries, add indexes to `firestore.indexes.json`:

**Check if indexes are needed:**
- Queries with multiple `where` clauses
- Queries with `orderBy` + `where`
- Queries on array fields with filters

**Example firestore.indexes.json:**
```json
{
  "indexes": [
    {
      "collectionGroup": "yourCollection",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "yourCollection",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "updatedAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**If no complex queries:** Skip this step, single-field indexes are automatic.

**Note:** When you run a query that needs an index, Firebase will provide a URL to create it automatically.

### Step 7: Add Authentication Checks
- **Content**: Implement authentication validation
- **ActiveForm**: Implementing authentication validation

**Actions:**

Add authentication based on project pattern:

**For API Keys (Express Middleware):**

Update `functions/src/index.ts` to use middleware:
```typescript
import { apiKeyGuard } from './middleware/apiKeyGuard';

// Apply to specific route
app.post('/your-endpoint', apiKeyGuard, async (req, res) => {
  const userId = req.userId!;  // Set by middleware
  // Your handler code
});
```

**For Firebase Auth (Express):**
```typescript
// Add auth middleware
async function authGuard(req: Request, res: Response, next: NextFunction) {
  if (!req.auth || !req.auth.uid) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }
  next();
}

// Apply to route
app.post('/your-endpoint', authGuard, async (req, res) => {
  const userId = req.auth!.uid;
  // Your handler code
});
```

**For Callable Functions:**
```typescript
import { onCall } from 'firebase-functions/v2/https';

export const yourCallable = onCall(async (request) => {
  // Auth automatically provided
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const userId = request.auth.uid;
  // Your logic
});
```

**For Domain-Grouped/Individual:**
```typescript
// Check auth in each function
export const yourFunction = onRequest(async (req, res) => {
  if (!req.auth) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }
  const userId = req.auth.uid;
  // Your logic
});
```

**Reference main skill:** @firebase-development ’ Authentication

### Step 8: Implement Handler with Response Pattern
- **Content**: Implement feature logic with {success, message, data?} pattern
- **ActiveForm**: Implementing feature logic with {success, message, data?} pattern

**Actions:**

Ensure all handlers use consistent response pattern:

**Response Pattern (Universal):**
```typescript
interface HandlerResponse {
  success: boolean;    // Required: true if successful, false if error
  message: string;     // Required: human-readable message
  data?: any;         // Optional: response payload when successful
}
```

**Success Response:**
```typescript
return {
  success: true,
  message: 'Operation completed successfully',
  data: {
    id: docId,
    // ... your data
  },
};
```

**Error Response:**
```typescript
return {
  success: false,
  message: 'Error: Invalid input provided',
  // No data field on errors
};
```

**For Express Routes:**
```typescript
app.post('/endpoint', apiKeyGuard, async (req, res) => {
  const result = await handleYourFeature(req.userId!, req.body);

  const statusCode = result.success ? 200 : 400;
  res.status(statusCode).json(result);
});
```

**Validation Checks (Defense in Depth):**
```typescript
// 1. Validate authentication
if (!userId) {
  return { success: false, message: 'Authentication required' };
}

// 2. Validate required parameters
if (!params.name || !params.value) {
  return { success: false, message: 'Missing required parameters' };
}

// 3. Validate business logic
if (params.value < 0) {
  return { success: false, message: 'Value must be positive' };
}

// 4. Execute with error handling
try {
  // Your logic
  return { success: true, message: 'Success', data: {...} };
} catch (error) {
  return { success: false, message: `Error: ${error.message}` };
}
```

**Reference:** superpowers:defense-in-depth

### Step 9: Export Function Properly
- **Content**: Export function from index.ts
- **ActiveForm**: Exporting function from index.ts

**Actions:**

Export your new function based on architecture:

**For Express API (functions/src/index.ts):**
```typescript
import { handleYourFeature } from './tools/yourFeature';

app.post('/mcp', apiKeyGuard, async (req, res) => {
  const { tool, params } = req.body;
  const userId = req.userId!;

  let result;
  switch (tool) {
    case 'your_feature':  // Add your case
      result = await handleYourFeature(userId, params);
      break;
    // ... existing cases
    default:
      res.status(400).json({ success: false, error: 'Unknown tool' });
      return;
  }

  res.status(200).json(result);
});

// Or add as separate route
app.post('/your-endpoint', apiKeyGuard, async (req, res) => {
  const result = await handleYourFeature(req.userId!, req.body);
  res.status(result.success ? 200 : 400).json(result);
});
```

**For Domain-Grouped (functions/src/index.ts):**
```typescript
export * from './yourDomain';
```

**For Individual Files (functions/index.js):**
```javascript
const { yourFeature } = require("./functions/yourFeature");
exports.yourFeature = yourFeature;
```

**Verify export:**
```bash
cd functions
npm run build

# Check compiled output
ls -la lib/
```

**Expected:** Function appears in compiled output

### Step 10: Make Tests Pass (TDD Green Phase)
- **Content**: Run tests and verify they pass
- **ActiveForm**: Running tests and verifying they pass

**Actions:**

Now that implementation exists, verify tests pass:

```bash
cd functions
npm run test
```

**Expected:** All tests pass 

**If tests fail:**
- Review error messages
- Fix implementation bugs
- Do NOT change tests to match buggy implementation
- Tests define correct behavior

**Add additional test cases:**
```typescript
// Test edge cases
it('should handle empty input gracefully', async () => {
  const result = await handleYourFeature('user-123', {} as any);
  expect(result.success).toBe(false);
});

// Test error handling
it('should handle Firestore errors', async () => {
  // Mock Firestore to throw error
  vi.spyOn(admin.firestore(), 'collection').mockImplementation(() => {
    throw new Error('Firestore error');
  });

  const result = await handleYourFeature('user-123', { name: 'test', value: 42 });
  expect(result.success).toBe(false);
  expect(result.message).toContain('Error');
});

// Test success path with data
it('should return data on success', async () => {
  const result = await handleYourFeature('user-123', { name: 'test', value: 42 });
  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
  expect(result.data.id).toBeDefined();
});
```

**Run linting:**
```bash
npm run lint:fix
```

**Reference:** superpowers:test-driven-development (GREEN phase)

### Step 11: Write Integration Test
- **Content**: Create integration test with emulators
- **ActiveForm**: Creating integration test with emulators

**Actions:**

Create integration test that runs against emulators:

**Create functions/src/__tests__/emulator/yourFeature.test.ts:**
```typescript
// ABOUTME: Integration test for [feature name] using Firebase emulators
// ABOUTME: Tests complete workflow from HTTP request to Firestore persistence

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

describe('Integration: yourFeature', () => {
  let testUserId: string;
  let testApiKey: string;

  beforeAll(async () => {
    // Initialize admin SDK for emulator
    if (admin.apps.length === 0) {
      admin.initializeApp({
        projectId: 'demo-test-project',
      });
    }

    // Connect to Firestore emulator
    const db = admin.firestore();
    db.settings({
      host: '127.0.0.1:8080',
      ssl: false,
    });

    // Create test user and API key
    testUserId = 'integration-test-user';
    testApiKey = 'myproj_integration_test_key';

    await db
      .collection('users')
      .doc(testUserId)
      .collection('apiKeys')
      .doc(testApiKey)
      .set({
        keyId: testApiKey,
        userId: testUserId,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  });

  afterAll(async () => {
    // Cleanup test data
    const db = admin.firestore();
    await db
      .collection('users')
      .doc(testUserId)
      .collection('apiKeys')
      .doc(testApiKey)
      .delete();
  });

  it('should create document via HTTP endpoint', async () => {
    const response = await fetch(
      'http://127.0.0.1:5001/demo-test-project/us-central1/api/your-endpoint',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': testApiKey,
        },
        body: JSON.stringify({
          name: 'integration-test',
          value: 42,
        }),
      }
    );

    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.id).toBeDefined();

    // Verify document was created in Firestore
    const db = admin.firestore();
    const doc = await db.collection('yourCollection').doc(result.data.id).get();
    expect(doc.exists).toBe(true);
    expect(doc.data()?.name).toBe('integration-test');
    expect(doc.data()?.value).toBe(42);
  });

  it('should reject invalid API key', async () => {
    const response = await fetch(
      'http://127.0.0.1:5001/demo-test-project/us-central1/api/your-endpoint',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'invalid-key',
        },
        body: JSON.stringify({ name: 'test', value: 42 }),
      }
    );

    expect(response.status).toBe(401);
  });
});
```

**Run integration tests (requires emulators running):**
```bash
# Terminal 1: Start emulators
firebase emulators:start

# Terminal 2: Run integration tests
cd functions
npm run test:emulator
```

**Expected:** Integration tests pass 

### Step 12: Test with Emulators and Verify
- **Content**: Manually test feature in emulators
- **ActiveForm**: Manually testing feature in emulators

**Actions:**

Start emulators and test your feature:

```bash
# Start emulators
firebase emulators:start
```

**Open Emulator UI:**
```bash
open http://127.0.0.1:4000
```

**Test your endpoint with curl:**

**For Express API:**
```bash
# Replace with your actual endpoint and API key
curl -X POST http://127.0.0.1:5001/[project-id]/us-central1/api/your-endpoint \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_test_api_key" \
  -d '{"name":"test","value":42}'
```

**For Callable Functions:**
```typescript
// In your client app
const yourCallable = httpsCallable(functions, 'yourCallable');
const result = await yourCallable({ name: 'test', value: 42 });
console.log(result.data);
```

**Verify in Emulator UI:**
1. Navigate to Firestore tab
2. Check that documents were created correctly
3. Verify field values match expectations
4. Check Function logs for any errors

**Test Firestore Rules:**
1. Open Rules Playground in Emulator UI
2. Test read operations with different auth states
3. Test write operations (should fail if server-write-only)
4. Verify rules are working as expected

**Verify Success Criteria:**
- [ ] Endpoint returns 200 status code
- [ ] Response follows {success, message, data?} pattern
- [ ] Documents appear in Firestore with correct data
- [ ] Authentication is enforced (401 for invalid keys)
- [ ] Validation works (400 for invalid input)
- [ ] Function logs show no errors
- [ ] Firestore rules prevent unauthorized access

**Reference:** superpowers:verification-before-completion

## Response Pattern Reference

All handlers MUST use this response pattern:

```typescript
interface HandlerResponse {
  success: boolean;
  message: string;
  data?: any;
}
```

**Examples:**

```typescript
// Success
{
  success: true,
  message: "Document created successfully",
  data: { id: "abc123", name: "example" }
}

// Error
{
  success: false,
  message: "Invalid input: name is required"
}

// Success without data
{
  success: true,
  message: "Document deleted successfully"
}
```

## Trigger Keywords

This sub-skill responds to:
- "add function"
- "create endpoint"
- "new tool"
- "add api"
- "new collection"
- "add feature"
- "build"
- "implement"

## Common Patterns by Architecture

### Express API Pattern
1. Create handler in `tools/` directory
2. Export handler function with HandlerResponse type
3. Add route to index.ts with middleware
4. Test with curl/Postman

### Domain-Grouped Pattern
1. Add function to existing domain file (e.g., posts.ts)
2. Or create new domain file if it's a new area
3. Export function from index.ts
4. Test with direct HTTP request

### Individual Files Pattern
1. Create new file in `functions/` directory
2. Export function in module.exports
3. Import and export in index.js
4. Test with direct HTTP request

## Firestore Collection Patterns

### User-Specific Collections
```
/users/{userId}/yourCollection/{docId}
  - userId: string (redundant but useful)
  - createdAt: timestamp
  - updatedAt: timestamp
  - active: boolean
```

### Top-Level Collections
```
/yourCollection/{docId}
  - userId: string (owner)
  - createdAt: timestamp
  - updatedAt: timestamp
  - status: string
```

### Nested Collections
```
/teams/{teamId}/members/{userId}
  - role: string
  - joinedAt: timestamp
```

## Authentication Patterns

### API Key Pattern
```typescript
// Middleware validates and sets req.userId
app.post('/endpoint', apiKeyGuard, async (req, res) => {
  const userId = req.userId!;
  // ...
});
```

### Firebase Auth Pattern
```typescript
// Check req.auth.uid
export const yourFunction = onRequest(async (req, res) => {
  if (!req.auth) {
    res.status(401).json({ success: false, message: 'Auth required' });
    return;
  }
  const userId = req.auth.uid;
  // ...
});
```

### Callable Functions Pattern
```typescript
export const yourCallable = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Auth required');
  }
  const userId = request.auth.uid;
  // ...
});
```

## Verification Checklist

After completing all TodoWrite steps, verify:

- [ ] Feature type identified correctly
- [ ] Existing architecture analyzed and followed
- [ ] Test written FIRST (TDD)
- [ ] Test failed initially (RED phase)
- [ ] Function file created with ABOUTME comments
- [ ] Firestore rules added/updated for new collections
- [ ] Indexes added if needed (complex queries)
- [ ] Authentication checks implemented
- [ ] Handler uses {success, message, data?} pattern
- [ ] Function exported properly from index.ts
- [ ] All unit tests pass (GREEN phase)
- [ ] Integration test created and passes
- [ ] Manual testing in emulators successful
- [ ] Emulator UI shows correct data
- [ ] Firestore rules tested and working
- [ ] Code linted with biome (no errors)
- [ ] Function logs show no errors
- [ ] Ready to commit

## Next Steps

After feature is complete and verified:

1. **Commit your work:**
```bash
git add .
git commit -m "feat: add [feature name]

Implements [what the feature does] with TDD.

- Write failing tests first
- Implement handler with {success, message, data?} pattern
- Add Firestore rules for [collection]
- Verify with emulator testing

> Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

2. **Consider code review:** Use @superpowers/requesting-code-review

3. **Deploy when ready:**
```bash
# Deploy just functions
firebase deploy --only functions

# Deploy functions + rules
firebase deploy --only functions,firestore:rules

# Deploy everything
firebase deploy
```

## Pattern References

All patterns used in this workflow are documented in the main skill:

- **Functions Architecture:** @firebase-development ’ Cloud Functions Architecture
- **Authentication:** @firebase-development ’ Authentication
- **Security:** @firebase-development ’ Security Model
- **Rules:** @firebase-development ’ Firestore Rules Patterns
- **Testing:** @firebase-development ’ Modern Tooling Standards
- **Emulators:** @firebase-development ’ Emulator-First Development

# Firebase API Key Authentication - Complete Example

Real-world implementation of custom API keys for MCP servers and programmatic access.

## Overview

This example demonstrates implementing custom API keys for Firebase projects, based on the oneonone project pattern. Use this approach for:
- MCP server endpoints requiring authentication
- Programmatic API access (scripts, tools, automation)
- Server-to-server communication
- Projects where users don't need login UI

## Complete Implementation

### Scenario

You're building an MCP server that needs secure authentication without requiring users to log in via a web UI. Users will authenticate using API keys in the format `ooo_abc123...`.

### Step 1: Define API Key Storage Pattern

**Firestore structure:**
```
/users/{userId}/apiKeys/{keyId}
  - keyId: "ooo_abc123..." (the actual key - also the document ID)
  - userId: string (owner's user ID)
  - active: boolean (whether key is valid)
  - createdAt: timestamp
  - lastUsed: timestamp (optional, updated on use)
  - name: string (optional, user-friendly name like "My laptop")
```

**Why subcollection?**
- Natural organization: keys belong to users
- Enables collectionGroup queries across all users
- Easy to list keys per user
- Clear ownership model

**Why keyId as document ID?**
- O(1) lookup performance
- No duplicate keys possible
- Simple query pattern

### Step 2: Choose Project Prefix

Pick 3-4 character abbreviation for your project:
- `ooo_` for OneOnOne
- `meme_` for Meme Rodeo
- `bot_` for Bot Social
- `proj_` for your project

**Generate key pattern:**
```typescript
// functions/src/utils/generateApiKey.ts
// ABOUTME: API key generation utility with project prefix and cryptographic randomness
// ABOUTME: Generates keys in format {prefix}_{randomString} for project identification

import { randomBytes } from 'crypto';

export function generateApiKey(projectPrefix: string = 'ooo'): string {
  const randomPart = randomBytes(32).toString('base64url'); // 43 characters
  return `${projectPrefix}_${randomPart}`;
}

// Example output: "ooo_xJ8hK9sLmN2pQ3rT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3"
```

### Step 3: Implement Middleware Guard

**functions/src/middleware/apiKeyGuard.ts:**
```typescript
// ABOUTME: Express middleware for API key authentication using Firestore collection group
// ABOUTME: Validates x-api-key header, checks active status, attaches userId to request

import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function apiKeyGuard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const apiKey = req.headers['x-api-key'] as string;

  // Check header exists and has correct prefix
  if (!apiKey || !apiKey.startsWith('ooo_')) {
    res.status(401).json({
      success: false,
      error: 'Invalid or missing API key',
      hint: 'Include x-api-key header with format: ooo_xxxxx'
    });
    return;
  }

  // Query collectionGroup to find key across all users
  const db = admin.firestore();
  const apiKeysQuery = await db
    .collectionGroup('apiKeys')
    .where('keyId', '==', apiKey)
    .where('active', '==', true)
    .limit(1)
    .get();

  // Key not found or inactive
  if (apiKeysQuery.empty) {
    res.status(401).json({
      success: false,
      error: 'Invalid API key',
      hint: 'Key may be inactive or deleted'
    });
    return;
  }

  // Extract userId and attach to request
  const apiKeyDoc = apiKeysQuery.docs[0];
  req.userId = apiKeyDoc.data().userId;

  // Optional: Update lastUsed timestamp (async, don't await)
  apiKeyDoc.ref.update({ lastUsed: admin.firestore.FieldValue.serverTimestamp() })
    .catch(err => console.error('Failed to update lastUsed:', err));

  next();
}
```

**Key design decisions:**
- Uses `collectionGroup('apiKeys')` to search across all users
- Checks both keyId match AND active status in single query
- Returns helpful error hints for debugging
- Attaches `userId` to request for downstream handlers
- Updates `lastUsed` asynchronously (doesn't block request)

### Step 4: Configure Firestore Rules

**firestore.rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper: Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper: Check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      // Users can read their own data
      allow read: if isOwner(userId);
      // Only Cloud Functions can write (server-write-only)
      allow write: if false;

      // API keys subcollection
      match /apiKeys/{keyId} {
        // Users can read their own API keys
        allow read: if isOwner(userId);
        // Only Cloud Functions can create/update/delete keys
        allow write: if false;
      }
    }

    // Collection group query support for middleware
    match /{path=**}/apiKeys/{keyId} {
      // Allow collectionGroup queries (used by middleware)
      // Admin SDK bypasses rules anyway, but this documents intent
      allow read: if false; // Only admin SDK can query
    }

    // Default deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Why server-write-only for API keys?**
- Maximum security: only Cloud Functions can create/revoke keys
- Prevents users from escalating privileges
- Single source of truth (functions control key lifecycle)
- Simpler audit trail

### Step 5: Create API Key Management Endpoints

**functions/src/tools/createApiKey.ts:**
```typescript
// ABOUTME: Handler for creating new API keys with optional name
// ABOUTME: Validates user authentication and stores key in Firestore

import * as admin from 'firebase-admin';
import { generateApiKey } from '../utils/generateApiKey';

export interface CreateApiKeyParams {
  name?: string; // Optional user-friendly name
}

export interface CreateApiKeyResult {
  success: boolean;
  keyId?: string;
  error?: string;
}

export async function handleCreateApiKey(
  userId: string,
  params: CreateApiKeyParams
): Promise<CreateApiKeyResult> {
  try {
    const db = admin.firestore();
    const keyId = generateApiKey('ooo');

    // Store in Firestore
    await db
      .collection('users')
      .doc(userId)
      .collection('apiKeys')
      .doc(keyId)
      .set({
        keyId,
        userId,
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        name: params.name || 'Unnamed key',
      });

    return {
      success: true,
      keyId, // Return key to user ONCE (never shown again)
    };
  } catch (error) {
    console.error('Failed to create API key:', error);
    return {
      success: false,
      error: 'Failed to create API key',
    };
  }
}
```

**functions/src/tools/listApiKeys.ts:**
```typescript
// ABOUTME: Handler for listing user's API keys (without exposing full key)
// ABOUTME: Returns partial keys for security, full metadata for management

import * as admin from 'firebase-admin';

export interface ApiKeyInfo {
  keyId: string; // Partially obscured
  name: string;
  active: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface ListApiKeysResult {
  success: boolean;
  keys?: ApiKeyInfo[];
  error?: string;
}

export async function handleListApiKeys(
  userId: string
): Promise<ListApiKeysResult> {
  try {
    const db = admin.firestore();
    const keysSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('apiKeys')
      .orderBy('createdAt', 'desc')
      .get();

    const keys: ApiKeyInfo[] = keysSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        // Show only prefix and last 8 chars for security
        keyId: obscureApiKey(data.keyId),
        name: data.name,
        active: data.active,
        createdAt: data.createdAt?.toDate().toISOString() || '',
        lastUsed: data.lastUsed?.toDate().toISOString(),
      };
    });

    return {
      success: true,
      keys,
    };
  } catch (error) {
    console.error('Failed to list API keys:', error);
    return {
      success: false,
      error: 'Failed to list API keys',
    };
  }
}

function obscureApiKey(keyId: string): string {
  // "ooo_xJ8hK9s...H1iJ2kL3" (show prefix + last 8)
  const parts = keyId.split('_');
  if (parts.length !== 2) return keyId;
  const prefix = parts[0];
  const secret = parts[1];
  return `${prefix}_${secret.slice(0, 3)}...${secret.slice(-8)}`;
}
```

**functions/src/tools/revokeApiKey.ts:**
```typescript
// ABOUTME: Handler for revoking (deactivating) API keys
// ABOUTME: Sets active flag to false instead of deleting for audit trail

import * as admin from 'firebase-admin';

export interface RevokeApiKeyParams {
  keyId: string; // Full or partial key ID
}

export interface RevokeApiKeyResult {
  success: boolean;
  error?: string;
}

export async function handleRevokeApiKey(
  userId: string,
  params: RevokeApiKeyParams
): Promise<RevokeApiKeyResult> {
  try {
    const db = admin.firestore();
    const keyRef = db
      .collection('users')
      .doc(userId)
      .collection('apiKeys')
      .doc(params.keyId);

    const keyDoc = await keyRef.get();
    if (!keyDoc.exists) {
      return {
        success: false,
        error: 'API key not found',
      };
    }

    // Deactivate instead of delete (audit trail)
    await keyRef.update({
      active: false,
      revokedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to revoke API key:', error);
    return {
      success: false,
      error: 'Failed to revoke API key',
    };
  }
}
```

### Step 6: Wire Up Express Routes

**functions/src/index.ts:**
```typescript
// ABOUTME: Main entry point for Firebase Functions - exports MCP endpoint with tool routing
// ABOUTME: Configures Express app with authentication, CORS, and health check

import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { apiKeyGuard } from './middleware/apiKeyGuard';
import { handleCreateApiKey } from './tools/createApiKey';
import { handleListApiKeys } from './tools/listApiKeys';
import { handleRevokeApiKey } from './tools/revokeApiKey';

admin.initializeApp();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Health check (no auth required)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// MCP endpoint (auth required)
app.post('/mcp', apiKeyGuard, async (req, res) => {
  const { tool, params } = req.body;
  const userId = req.userId!; // Guaranteed by apiKeyGuard

  let result;
  switch (tool) {
    case 'create_api_key':
      result = await handleCreateApiKey(userId, params);
      break;
    case 'list_api_keys':
      result = await handleListApiKeys(userId);
      break;
    case 'revoke_api_key':
      result = await handleRevokeApiKey(userId, params);
      break;
    default:
      res.status(400).json({ success: false, error: 'Unknown tool' });
      return;
  }

  res.status(200).json(result);
});

export const mcpEndpoint = onRequest(
  {
    invoker: 'public',
    cors: true,
    region: 'us-central1',
  },
  app
);
```

### Step 7: Configure Hosting Rewrite

**firebase.json:**
```json
{
  "hosting": {
    "site": "project-mcp",
    "public": "hosting-mcp",
    "rewrites": [
      {
        "source": "/**",
        "function": "mcpEndpoint"
      }
    ]
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

### Step 8: Test with Emulators

**Terminal 1 - Start emulators:**
```bash
firebase emulators:start
```

**Terminal 2 - Test health check:**
```bash
curl http://127.0.0.1:5000/health
# Expected: {"status":"ok"}
```

**Terminal 3 - Create test data:**
```bash
# Manually create a test user with API key via Emulator UI
# Visit http://127.0.0.1:4000
# Go to Firestore → users → [userId] → apiKeys → Add Document
# Document ID: "ooo_test123"
# Fields:
#   - keyId: "ooo_test123"
#   - userId: "[userId]"
#   - active: true
#   - createdAt: (now)
```

**Test authenticated endpoint:**
```bash
curl -X POST http://127.0.0.1:5000/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: ooo_test123" \
  -d '{"tool": "list_api_keys", "params": {}}'

# Expected: {"success": true, "keys": [...]}
```

**Test missing key:**
```bash
curl -X POST http://127.0.0.1:5000/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "list_api_keys", "params": {}}'

# Expected: 401 {"success": false, "error": "Invalid or missing API key"}
```

**Test invalid key:**
```bash
curl -X POST http://127.0.0.1:5000/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: ooo_invalid" \
  -d '{"tool": "list_api_keys", "params": {}}'

# Expected: 401 {"success": false, "error": "Invalid API key"}
```

## Production Usage

### MCP Server Integration

**Example MCP server (Python):**
```python
import os
import requests

API_KEY = os.environ.get("ONEONONE_API_KEY")  # ooo_xxxxx
ENDPOINT = "https://project-mcp.web.app/mcp"

def call_tool(tool: str, params: dict):
    response = requests.post(
        ENDPOINT,
        json={"tool": tool, "params": params},
        headers={"x-api-key": API_KEY}
    )
    return response.json()

# Usage
result = call_tool("create_api_key", {"name": "My laptop"})
print(f"Created key: {result['keyId']}")
```

### User Workflow

1. **User creates account** (via Firebase Auth or other means)
2. **User requests API key** (via web UI or CLI)
3. **Function generates key** using `handleCreateApiKey`
4. **Key shown ONCE** to user (they must save it)
5. **User configures MCP server** with key in environment variable
6. **MCP server authenticates** using `x-api-key` header
7. **User can list/revoke keys** via web UI or API

### Security Best Practices

1. **Never log API keys** - redact from logs
2. **Show keys only once** - at creation time
3. **Obscure in list view** - show prefix + last chars
4. **Deactivate, don't delete** - maintain audit trail
5. **Rate limit endpoints** - prevent brute force
6. **Rotate keys periodically** - encourage users to refresh
7. **Monitor usage** - track lastUsed timestamps

## Complete File Structure

```
functions/
├── src/
│   ├── index.ts                    # Express app + routing
│   ├── middleware/
│   │   └── apiKeyGuard.ts          # Authentication middleware
│   ├── tools/
│   │   ├── createApiKey.ts         # Create key handler
│   │   ├── listApiKeys.ts          # List keys handler
│   │   └── revokeApiKey.ts         # Revoke key handler
│   └── utils/
│       └── generateApiKey.ts       # Key generation utility
├── package.json
└── tsconfig.json

firestore.rules                      # Security rules
firebase.json                        # Hosting + emulator config
```

## Testing Checklist

- [ ] API key generation creates unique keys
- [ ] Keys stored in correct Firestore path
- [ ] Middleware validates prefix correctly
- [ ] Middleware rejects missing keys (401)
- [ ] Middleware rejects invalid keys (401)
- [ ] Middleware accepts valid active keys
- [ ] Middleware rejects inactive keys (401)
- [ ] userId attached to request correctly
- [ ] Create endpoint returns key once
- [ ] List endpoint obscures full keys
- [ ] Revoke endpoint deactivates keys
- [ ] Firestore rules prevent client writes
- [ ] Emulator workflow works end-to-end
- [ ] Production deployment works
- [ ] Rate limiting configured (optional)

## References

- **Production example:** `/Users/dylanr/work/2389/oneonone`
- **Middleware:** `/Users/dylanr/work/2389/oneonone/functions/src/middleware/apiKeyGuard.ts`
- **Main skill:** `firebase-development/SKILL.md` → Authentication section

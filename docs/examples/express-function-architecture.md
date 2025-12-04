# Express Function Architecture - Complete Implementation

Complete example of Express-based Cloud Functions with routing, middleware, and tool organization.

## Overview

This pattern uses Express.js to build API-like Cloud Functions with:
- Middleware for authentication, logging, CORS
- Tool-based routing (MCP pattern)
- RESTful endpoint support
- Service layer for business logic
- Shared types and utilities

**Best for:** API projects, MCP servers, projects with many related endpoints

**Example:** oneonone project MCP endpoint

## Complete Implementation

### Scenario

You're building an MCP server for a 1:1 meeting application. It needs:
- API key authentication
- Multiple tools (request_session, send_message, end_session)
- Session management logic
- Type safety with TypeScript
- Health check endpoint
- Request logging

### Step 1: Project Structure

```
functions/
├── src/
│   ├── index.ts                    # Main entry point with Express app
│   ├── middleware/
│   │   ├── apiKeyGuard.ts          # Authentication middleware
│   │   └── loggingMiddleware.ts    # Request logging
│   ├── tools/
│   │   ├── requestSession.ts       # Tool: request_session
│   │   ├── sendMessage.ts          # Tool: send_message
│   │   └── endSession.ts           # Tool: end_session
│   ├── services/
│   │   └── sessionManager.ts       # Business logic
│   ├── shared/
│   │   ├── types.ts                # Shared TypeScript types
│   │   └── config.ts               # Configuration
│   └── __tests__/
│       ├── middleware/
│       ├── tools/
│       └── integration/
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Step 2: Shared Types

**functions/src/shared/types.ts:**
```typescript
// ABOUTME: Shared TypeScript types and interfaces for MCP tools and sessions
// ABOUTME: Central source of truth for data structures used across functions

// MCP request/response types
export interface McpRequest {
  tool: string;
  params: Record<string, any>;
}

export interface McpResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Session types
export interface Session {
  sessionId: string;
  userId: string;
  partnerId: string;
  status: 'pending' | 'active' | 'completed';
  createdAt: Date;
  completedAt?: Date;
}

// Message types
export interface Message {
  messageId: string;
  sessionId: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

// Tool-specific params
export interface RequestSessionParams {
  partnerId: string;
}

export interface SendMessageParams {
  sessionId: string;
  content: string;
}

export interface EndSessionParams {
  sessionId: string;
}
```

**functions/src/shared/config.ts:**
```typescript
// ABOUTME: Configuration constants and environment variable management
// ABOUTME: Centralized config to avoid magic strings and enable easy updates

export const CONFIG = {
  API_KEY_PREFIX: 'ooo_',
  REGION: 'us-central1',
  CORS_ORIGINS: ['http://localhost:3000', 'https://oneonone-main.web.app'],
  MAX_MESSAGE_LENGTH: 1000,
  SESSION_TIMEOUT_MINUTES: 30,
} as const;
```

### Step 3: Authentication Middleware

**functions/src/middleware/apiKeyGuard.ts:**
```typescript
// ABOUTME: Express middleware for API key authentication using Firestore collection group
// ABOUTME: Validates x-api-key header, checks active status, attaches userId to request

import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';
import { CONFIG } from '../shared/config';

// Extend Express Request to include userId
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

  // Validate header format
  if (!apiKey || !apiKey.startsWith(CONFIG.API_KEY_PREFIX)) {
    res.status(401).json({
      success: false,
      error: 'Invalid or missing API key',
      hint: `Include x-api-key header with format: ${CONFIG.API_KEY_PREFIX}xxxxx`
    });
    return;
  }

  try {
    // Query collectionGroup for API key
    const db = admin.firestore();
    const apiKeysQuery = await db
      .collectionGroup('apiKeys')
      .where('keyId', '==', apiKey)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (apiKeysQuery.empty) {
      res.status(401).json({
        success: false,
        error: 'Invalid API key',
        hint: 'Key may be inactive or deleted'
      });
      return;
    }

    // Attach userId to request
    req.userId = apiKeysQuery.docs[0].data().userId;

    // Update lastUsed timestamp (async, don't block)
    apiKeysQuery.docs[0].ref.update({
      lastUsed: admin.firestore.FieldValue.serverTimestamp()
    }).catch(err => console.error('Failed to update lastUsed:', err));

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
}
```

### Step 4: Logging Middleware

**functions/src/middleware/loggingMiddleware.ts:**
```typescript
// ABOUTME: Express middleware for request/response logging
// ABOUTME: Logs method, path, userId, duration, and status for debugging

import { Request, Response, NextFunction } from 'express';

export function loggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    userId: req.userId || 'unauthenticated',
    body: req.body,
  });

  // Capture original send
  const originalSend = res.send;

  // Override send to log response
  res.send = function (body: any): Response {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode}`, {
      userId: req.userId || 'unauthenticated',
      duration: `${duration}ms`,
      status: res.statusCode,
    });
    return originalSend.call(this, body);
  };

  next();
}
```

### Step 5: Service Layer

**functions/src/services/sessionManager.ts:**
```typescript
// ABOUTME: Business logic for session management (create, end, validate)
// ABOUTME: Encapsulates Firestore operations and session state transitions

import * as admin from 'firebase-admin';
import { Session } from '../shared/types';

export class SessionManager {
  private db: admin.firestore.Firestore;

  constructor() {
    this.db = admin.firestore();
  }

  async createSession(userId: string, partnerId: string): Promise<Session> {
    // Validate users exist
    const userDoc = await this.db.collection('users').doc(userId).get();
    const partnerDoc = await this.db.collection('users').doc(partnerId).get();

    if (!userDoc.exists || !partnerDoc.exists) {
      throw new Error('User or partner not found');
    }

    // Check for existing active session
    const existingSession = await this.db
      .collection('sessions')
      .where('userId', '==', userId)
      .where('partnerId', '==', partnerId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (!existingSession.empty) {
      throw new Error('Active session already exists');
    }

    // Create new session
    const sessionRef = this.db.collection('sessions').doc();
    const session: Session = {
      sessionId: sessionRef.id,
      userId,
      partnerId,
      status: 'pending',
      createdAt: new Date(),
    };

    await sessionRef.set(session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const sessionDoc = await this.db.collection('sessions').doc(sessionId).get();

    if (!sessionDoc.exists) {
      return null;
    }

    return sessionDoc.data() as Session;
  }

  async endSession(sessionId: string, userId: string): Promise<void> {
    const sessionRef = this.db.collection('sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      throw new Error('Session not found');
    }

    const session = sessionDoc.data() as Session;

    // Verify user is participant
    if (session.userId !== userId && session.partnerId !== userId) {
      throw new Error('Not authorized to end this session');
    }

    // Update session status
    await sessionRef.update({
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async addMessage(sessionId: string, senderId: string, content: string): Promise<void> {
    // Verify session exists and is active
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    if (session.status !== 'active') {
      throw new Error('Session is not active');
    }

    // Verify sender is participant
    if (session.userId !== senderId && session.partnerId !== senderId) {
      throw new Error('Not authorized to send messages in this session');
    }

    // Add message
    const messageRef = this.db
      .collection('sessions')
      .doc(sessionId)
      .collection('messages')
      .doc();

    await messageRef.set({
      messageId: messageRef.id,
      sessionId,
      senderId,
      content,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}
```

### Step 6: Tool Handlers

**functions/src/tools/requestSession.ts:**
```typescript
// ABOUTME: Handler for request_session tool - creates new 1:1 session
// ABOUTME: Validates partnerId and returns session details

import { McpResponse, RequestSessionParams } from '../shared/types';
import { SessionManager } from '../services/sessionManager';

export async function handleRequestSession(
  userId: string,
  params: RequestSessionParams
): Promise<McpResponse> {
  try {
    const sessionManager = new SessionManager();
    const session = await sessionManager.createSession(userId, params.partnerId);

    return {
      success: true,
      data: {
        sessionId: session.sessionId,
        status: session.status,
        partnerId: session.partnerId,
      },
    };
  } catch (error: any) {
    console.error('Failed to request session:', error);
    return {
      success: false,
      error: error.message || 'Failed to create session',
    };
  }
}
```

**functions/src/tools/sendMessage.ts:**
```typescript
// ABOUTME: Handler for send_message tool - adds message to active session
// ABOUTME: Validates session status and sender authorization

import { McpResponse, SendMessageParams } from '../shared/types';
import { SessionManager } from '../services/sessionManager';
import { CONFIG } from '../shared/config';

export async function handleSendMessage(
  userId: string,
  params: SendMessageParams
): Promise<McpResponse> {
  try {
    // Validate message content
    if (!params.content || params.content.trim().length === 0) {
      return {
        success: false,
        error: 'Message content cannot be empty',
      };
    }

    if (params.content.length > CONFIG.MAX_MESSAGE_LENGTH) {
      return {
        success: false,
        error: `Message exceeds maximum length of ${CONFIG.MAX_MESSAGE_LENGTH} characters`,
      };
    }

    const sessionManager = new SessionManager();
    await sessionManager.addMessage(params.sessionId, userId, params.content);

    return {
      success: true,
      data: {
        messageId: 'generated-by-firestore', // Would come from sessionManager
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error('Failed to send message:', error);
    return {
      success: false,
      error: error.message || 'Failed to send message',
    };
  }
}
```

**functions/src/tools/endSession.ts:**
```typescript
// ABOUTME: Handler for end_session tool - marks session as completed
// ABOUTME: Validates user is participant before allowing completion

import { McpResponse, EndSessionParams } from '../shared/types';
import { SessionManager } from '../services/sessionManager';

export async function handleEndSession(
  userId: string,
  params: EndSessionParams
): Promise<McpResponse> {
  try {
    const sessionManager = new SessionManager();
    await sessionManager.endSession(params.sessionId, userId);

    return {
      success: true,
      data: {
        sessionId: params.sessionId,
        status: 'completed',
      },
    };
  } catch (error: any) {
    console.error('Failed to end session:', error);
    return {
      success: false,
      error: error.message || 'Failed to end session',
    };
  }
}
```

### Step 7: Main Express App

**functions/src/index.ts:**
```typescript
// ABOUTME: Main entry point for Firebase Functions - exports MCP endpoint with tool routing
// ABOUTME: Configures Express app with authentication, CORS, logging, and health check

import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { apiKeyGuard } from './middleware/apiKeyGuard';
import { loggingMiddleware } from './middleware/loggingMiddleware';
import { handleRequestSession } from './tools/requestSession';
import { handleSendMessage } from './tools/sendMessage';
import { handleEndSession } from './tools/endSession';
import { CONFIG } from './shared/config';
import type { McpRequest, McpResponse } from './shared/types';

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: CONFIG.CORS_ORIGINS }));
app.use(express.json());
app.use(loggingMiddleware);

// Health check endpoint (no auth required)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// MCP endpoint (auth required)
app.post('/mcp', apiKeyGuard, async (req: Request, res: Response) => {
  const { tool, params } = req.body as McpRequest;
  const userId = req.userId!; // Guaranteed by apiKeyGuard

  // Validate request format
  if (!tool || typeof tool !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Missing or invalid tool parameter',
    });
    return;
  }

  // Route to appropriate tool handler
  let result: McpResponse;
  switch (tool) {
    case 'request_session':
      result = await handleRequestSession(userId, params);
      break;

    case 'send_message':
      result = await handleSendMessage(userId, params);
      break;

    case 'end_session':
      result = await handleEndSession(userId, params);
      break;

    default:
      result = {
        success: false,
        error: `Unknown tool: ${tool}`,
        hint: 'Available tools: request_session, send_message, end_session',
      };
  }

  // Return result
  res.status(result.success ? 200 : 400).json(result);
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    hint: 'Available endpoints: GET /health, POST /mcp',
  });
});

// Export as Cloud Function
export const mcpEndpoint = onRequest(
  {
    invoker: 'public',
    cors: true,
    region: CONFIG.REGION,
  },
  app
);
```

### Step 8: Configuration Files

**functions/package.json:**
```json
{
  "name": "functions",
  "private": true,
  "engines": {
    "node": "20"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "deploy": "firebase deploy --only functions",
    "lint": "biome lint ./src",
    "lint:fix": "biome lint --apply ./src",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:emulator": "vitest run --config vitest.emulator.config.ts"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.5.0",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3",
    "vitest": "^1.2.0"
  }
}
```

**functions/tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "lib": ["ES2019"],
    "outDir": "lib",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "lib", "**/*.test.ts"]
}
```

### Step 9: Testing

**functions/src/__tests__/middleware/apiKeyGuard.test.ts:**
```typescript
// ABOUTME: Unit tests for API key authentication middleware
// ABOUTME: Tests validation, error cases, and userId attachment

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { apiKeyGuard } from '../../middleware/apiKeyGuard';

describe('apiKeyGuard', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
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
      expect.objectContaining({
        success: false,
        error: 'Invalid or missing API key',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject API key with wrong prefix', async () => {
    req.headers = { 'x-api-key': 'wrong_prefix_key' };

    await apiKeyGuard(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  // Integration tests with emulators would go in vitest.emulator.config.ts
});
```

**functions/src/__tests__/tools/requestSession.test.ts:**
```typescript
// ABOUTME: Unit tests for request_session tool handler
// ABOUTME: Tests session creation, validation, and error handling

import { describe, it, expect, vi } from 'vitest';
import { handleRequestSession } from '../../tools/requestSession';
import { SessionManager } from '../../services/sessionManager';

vi.mock('../../services/sessionManager');

describe('handleRequestSession', () => {
  it('should create session successfully', async () => {
    const mockSession = {
      sessionId: 'session-123',
      userId: 'user-1',
      partnerId: 'user-2',
      status: 'pending',
      createdAt: new Date(),
    };

    vi.mocked(SessionManager.prototype.createSession).mockResolvedValue(mockSession);

    const result = await handleRequestSession('user-1', { partnerId: 'user-2' });

    expect(result.success).toBe(true);
    expect(result.data?.sessionId).toBe('session-123');
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(SessionManager.prototype.createSession).mockRejectedValue(
      new Error('User not found')
    );

    const result = await handleRequestSession('user-1', { partnerId: 'invalid' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('User not found');
  });
});
```

### Step 10: Local Development

**Start emulators:**
```bash
# Terminal 1: Start emulators
firebase emulators:start

# Terminal 2: Watch TypeScript compilation
cd functions && npm run dev
```

**Test endpoints:**
```bash
# Health check (no auth)
curl http://127.0.0.1:5001/your-project/us-central1/mcpEndpoint/health

# Request session (with auth)
curl -X POST http://127.0.0.1:5001/your-project/us-central1/mcpEndpoint/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: ooo_test123" \
  -d '{"tool": "request_session", "params": {"partnerId": "user-456"}}'

# Send message
curl -X POST http://127.0.0.1:5001/your-project/us-central1/mcpEndpoint/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: ooo_test123" \
  -d '{"tool": "send_message", "params": {"sessionId": "session-123", "content": "Hello!"}}'
```

## Key Design Patterns

### 1. Middleware Chain
- CORS → JSON parser → Logging → Auth → Route handler
- Each middleware has single responsibility
- Middleware can short-circuit with errors

### 2. Service Layer Separation
- Business logic in services (SessionManager)
- Tool handlers are thin wrappers
- Easy to test services independently
- Can reuse services across multiple endpoints

### 3. Type Safety
- Shared types in `shared/types.ts`
- Express Request extended with `userId`
- All handlers return typed `McpResponse`
- TypeScript catches errors at compile time

### 4. Error Handling
- Try/catch in all async handlers
- Helpful error messages with hints
- Consistent error response format
- Never expose internal errors to clients

### 5. Configuration Management
- Centralized in `shared/config.ts`
- No magic strings in code
- Easy to update across project
- Type-safe with `as const`

## Advantages

✅ Familiar Express patterns
✅ Middleware for cross-cutting concerns
✅ Easy to add new endpoints
✅ Good separation of concerns
✅ Testable in isolation
✅ Type-safe with TypeScript
✅ Scales well for API projects

## When to Use

**Use Express pattern when:**
- Building API with multiple related endpoints
- Need middleware (auth, logging, CORS)
- Familiar with Express ecosystem
- Want RESTful routing patterns
- Project has 5+ endpoints

**Don't use when:**
- Project has 1-2 simple functions
- No shared middleware needed
- Prefer individual function files
- Maximum modularity required

## References

- **Production example:** `/Users/dylanr/work/2389/oneonone/functions/src/index.ts`
- **Main skill:** `firebase-development/SKILL.md` → Cloud Functions Architecture section

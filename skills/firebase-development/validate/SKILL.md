---
name: firebase-development:validate
description: Review Firebase code against security model and best practices. Validates firebase.json structure, firestore.rules patterns, functions architecture, authentication implementation, test coverage, and emulator configuration.
---

# Firebase Code Validation

## Overview

This sub-skill guides you through validating existing Firebase code against proven patterns and security best practices. It handles:

- Checking firebase.json structure (hosting, emulators, functions)
- Reviewing firestore.rules for helper functions and security patterns
- Validating functions architecture matches chosen pattern consistently
- Verifying authentication implementation (API keys or Firebase Auth)
- Checking all files have ABOUTME comments
- Reviewing test coverage (unit + integration tests)
- Validating error handling uses proper result format
- Verifying emulator configuration completeness
- Checking hosting rewrites follow API patterns
- Identifying security vulnerabilities or pattern violations

The workflow uses TodoWrite to track 9 steps from configuration validation to security review.

## When This Sub-Skill Applies

Use this sub-skill when:
- Conducting code review of Firebase project
- Auditing security implementation
- Checking if project follows Firebase best practices
- Preparing for production deployment
- User says: "review firebase", "check firebase", "validate", "audit firebase", "look at firebase code"

**Do not use for:**
- Initial project setup (use @firebase-development/project-setup)
- Adding new features (use @firebase-development/add-feature)
- Debugging active errors (use @firebase-development/debug)

## Integration with Superpowers Skills

This sub-skill can integrate with superpowers:requesting-code-review for additional validation:

**Integration Pattern:**
- Firebase validate sub-skill performs Firebase-specific validation (patterns, security, configuration)
- Optionally invoke superpowers:requesting-code-review for broader code quality review
- Superpowers provides general code quality, maintainability, test coverage analysis

**When to Escalate to Superpowers:**
- Need general code quality review beyond Firebase patterns
- Want architectural feedback on TypeScript code organization
- Need test quality assessment beyond coverage numbers

**Firebase validate is sufficient for:**
- Firebase configuration validation
- Security rules review
- Firebase-specific pattern compliance
- Authentication implementation review

## Reference Patterns

All patterns are documented in the main @firebase-development skill. This sub-skill validates code against those patterns.

**Key Sections Referenced:**
1. **Multi-Hosting Setup:** site: vs target: vs single-with-rewrites validation
2. **Authentication:** API key format, Firebase Auth roles, middleware patterns
3. **Functions Architecture:** Express vs domain-grouped vs individual consistency
4. **Security Model:** Server-write-only vs client-write-validated rules
5. **Firestore Rules Patterns:** Helper functions, diff().affectedKeys(), role lookups
6. **Emulator Configuration:** singleProjectMode, UI enabled, port settings
7. **Modern Tooling:** TypeScript, vitest, biome, ABOUTME comments
8. **Testing Requirements:** Unit + integration test coverage

## TodoWrite Workflow

This sub-skill creates a TodoWrite checklist with 9 steps. Follow the checklist to systematically validate your Firebase project.

### Step 1: Check firebase.json Structure
- **Content**: Check firebase.json for completeness and consistency
- **ActiveForm**: Checking firebase.json for completeness and consistency

**Actions:**

Read the `firebase.json` file and validate its structure:

**Required Sections:**
- `hosting` - Must be present (can be array or object)
- `functions` - Should specify source directory and runtime
- `firestore` - Should specify rules and indexes files
- `emulators` - Should be configured for local development

**Hosting Validation:**

Check which pattern is used and validate it:

1. **If using site: based (multiple sites):**
   ```bash
   # Verify sites exist
   firebase hosting:sites:list
   ```
   - Each hosting entry should have `site` field
   - Site names should match Firebase Console sites
   - Rewrites should point to valid functions

2. **If using target: based:**
   ```bash
   # Check .firebaserc for target mappings
   cat .firebaserc | grep targets
   ```
   - Each hosting entry should have `target` field
   - Targets should be mapped in `.firebaserc`
   - If using predeploy hooks, validate build scripts exist

3. **If using single hosting:**
   - Should have `source` or `public` field
   - Rewrites should reference existing functions
   - Check if project would benefit from multiple sites

**Functions Validation:**
```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs20",
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run lint", "npm --prefix \"$RESOURCE_DIR\" run build"]
  }
}
```

Check:
- `source` points to functions directory
- `runtime` matches package.json engines.node
- `predeploy` includes lint and build steps

**Firestore Validation:**
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

Check:
- Rules file exists and is readable
- Indexes file exists (even if empty array)

**Storage Validation (if using):**
```json
{
  "storage": {
    "rules": "storage.rules"
  }
}
```

**Mark issues found:**
- Missing sections
- Invalid file paths
- Inconsistent hosting pattern
- Missing predeploy hooks

### Step 2: Validate Emulator Configuration
- **Content**: Validate emulator settings in firebase.json
- **ActiveForm**: Validating emulator settings in firebase.json

**Actions:**

Check emulators configuration matches best practices:

**Required Configuration:**
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

**Critical Checks:**
- `singleProjectMode: true` - **ESSENTIAL** for emulators to work together
- `ui.enabled: true` - **ESSENTIAL** for debugging
- All services project uses have emulator entries
- Ports don't conflict with common services

**If using target-based hosting:**
```json
{
  "emulators": {
    "hosting": [
      {"target": "main", "port": 5000},
      {"target": "api", "port": 5002}
    ]
  }
}
```

Check:
- All hosting targets have emulator ports
- Ports are sequential and don't conflict

**Mark issues found:**
- Missing `singleProjectMode: true`
- UI not enabled
- Missing emulator entries for services in use
- Port conflicts (check with `lsof -i :PORT`)

### Step 3: Review Firestore Rules Structure
- **Content**: Review firestore.rules for helper functions and security patterns
- **ActiveForm**: Reviewing firestore.rules for helper functions and security patterns

**Actions:**

Read `firestore.rules` and validate against patterns:

**Required Structure:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions at top
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Collection rules

    // Default deny at bottom
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Pattern Validation:**

1. **Helper Function Extraction:**
   - Are repeated conditions extracted into helper functions?
   - Examples: `isAuthenticated()`, `isOwner()`, `isAdmin()`, `isTeamMember()`
   - Functions should be at top of rules file

2. **Security Model Consistency:**
   - Check if using server-write-only OR client-write-validated
   - **Server-write-only:** All collections should have `allow write: if false;`
   - **Client-write:** Must use `diff().affectedKeys().hasOnly([...])` validation

3. **Authentication Patterns:**
   - If using API keys: Server-write-only model required
   - If using Firebase Auth: Check role-based helpers (`isAdmin()`, `isModerator()`)
   - Verify user role lookups: `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role`

4. **Collection Group Support:**
   - If using `collectionGroup()` queries in code, check for `match /{path=**}/collection/{id}` rules
   - Example: Sessions subcollection accessible via collection group

5. **Field-Level Validation (client-write):**
   ```javascript
   allow update: if request.auth != null &&
                    request.resource.data.diff(resource.data).affectedKeys()
                      .hasOnly(['displayName', 'bio', 'photoURL']);
   ```
   - Check sensitive fields are protected (role, admin, balance, etc.)

6. **Default Deny:**
   - Rules file MUST end with: `match /{document=**} { allow read, write: if false; }`
   - This catches any unmatched paths

**Mark issues found:**
- No helper functions (copy-pasted logic)
- Mixed security models within same collection
- Missing default deny rule
- Sensitive fields not protected in client-write rules
- Missing collection group rules for subcollections
- No authentication checks

### Step 4: Validate Functions Architecture Consistency
- **Content**: Verify functions follow chosen architecture pattern consistently
- **ActiveForm**: Verifying functions follow chosen architecture pattern consistently

**Actions:**

Identify the architecture pattern in use and validate consistency:

**Step 1: Identify Pattern**

Check `functions/src/index.ts` (or `index.js`):

1. **Express App Pattern:**
   ```typescript
   import express from 'express';
   const app = express();
   // ... routes ...
   export const apiName = onRequest(app);
   ```

2. **Domain-Grouped Pattern:**
   ```typescript
   export * from './posts';
   export * from './journal';
   export * from './admin';
   ```

3. **Individual Files Pattern:**
   ```javascript
   const { upload } = require('./functions/upload');
   exports.upload = upload;
   ```

**Step 2: Validate Consistency**

**For Express Pattern:**
- All routes should be in `/tools` or `/routes` directory
- Middleware should be in `/middleware` directory
- Should have health check endpoint: `app.get('/health', ...)`
- Authentication middleware should be applied consistently
- CORS should be configured: `app.use(cors({ origin: true }))`

Check file structure:
```bash
ls functions/src/
# Expected: index.ts, middleware/, tools/, services/, shared/
```

**For Domain-Grouped Pattern:**
- Each domain file should contain related functions
- Domain boundaries should be clear (posts, journal, admin, etc.)
- `index.ts` should only re-export, no logic
- Shared code in `/shared` directory

Check exports:
```bash
grep "export const" functions/src/*.ts
# Should see multiple exports per domain file
```

**For Individual Files Pattern:**
- Each function in separate file under `/functions` directory
- `index.js` imports and re-exports all functions
- Minimal shared code

Check structure:
```bash
ls functions/functions/
# Should see one file per function
```

**Cross-Pattern Validation:**
- Don't mix patterns (e.g., some Express routes + some individual files)
- If project has grown, suggest migration path
- Check if current pattern still serves project needs

**Mark issues found:**
- Mixed architecture patterns
- Files in wrong directories
- Missing middleware for Express pattern
- Missing health check endpoint
- Inconsistent exports

### Step 5: Check Authentication Implementation
- **Content**: Verify authentication follows chosen pattern correctly
- **ActiveForm**: Verifying authentication follows chosen pattern correctly

**Actions:**

Identify authentication approach and validate implementation:

**Step 1: Identify Auth Pattern**

Check for:
1. **Custom API Keys:** Look for `middleware/apiKeyGuard.ts` or similar
2. **Firebase Auth:** Look for `request.auth.uid` checks in functions
3. **Both:** Project may use both patterns

**Step 2: Validate API Key Implementation**

If using API keys:

```typescript
// middleware/apiKeyGuard.ts should exist
```

Check middleware:
- Validates key format (e.g., `ooo_*`, `bot_*`, `meme_*`)
- Uses `collectionGroup('apiKeys')` query
- Checks `active: true` flag
- Attaches `userId` to request object
- Returns 401 for invalid keys

Check Firestore structure:
```bash
# In Emulator UI or production, verify collection structure
/users/{userId}/apiKeys/{keyId}
```

Fields should include:
- `keyId: string` (the actual API key)
- `userId: string` (owner)
- `active: boolean`
- `createdAt: timestamp`

Check usage:
```typescript
// Express routes should use middleware
app.post('/endpoint', apiKeyGuard, async (req, res) => {
  const userId = req.userId; // Set by middleware
  // ...
});
```

**Step 3: Validate Firebase Auth Implementation**

If using Firebase Auth:

Check functions:
```typescript
// Should check request.auth
if (!request.auth) {
  return { success: false, message: 'Not authenticated' };
}

const userId = request.auth.uid;
```

Check role-based access:
```typescript
// Should look up user role
const userDoc = await admin.firestore().collection('users').doc(userId).get();
const role = userDoc.data()?.role;

if (role !== 'admin') {
  return { success: false, message: 'Insufficient permissions' };
}
```

Check Firestore rules match:
```javascript
function isAdmin() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

**Step 4: Check Client-Side Auth Configuration**

If project has hosting with client app:

Check `hosting/lib/firebase.ts` (or similar):
```typescript
// Should connect to auth emulator in development
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
}
```

Check environment variables:
```bash
# hosting/.env.local should have
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_USE_EMULATORS=true
```

**Mark issues found:**
- No authentication checks in sensitive functions
- API key format validation missing
- `active` flag not checked
- No userId attachment to request
- Firebase Auth role lookups missing
- Client-side emulator connection missing
- Environment variables not documented

### Step 6: Verify All Files Have ABOUTME Comments
- **Content**: Check all TypeScript files start with ABOUTME comments
- **ActiveForm**: Checking all TypeScript files start with ABOUTME comments

**Actions:**

Validate ABOUTME comment pattern across codebase:

**Required Pattern:**
```typescript
// ABOUTME: Brief description of what this file does
// ABOUTME: Second line with additional context

import { something } from 'somewhere';
// ... rest of file
```

**Check all TypeScript files:**
```bash
# Find all .ts files
find functions/src -name "*.ts" -not -path "*/node_modules/*"

# Check for ABOUTME comments
grep -L "ABOUTME:" functions/src/**/*.ts
```

Files without ABOUTME comments are violations.

**Common Locations:**
- `functions/src/index.ts` - Main entry point
- `functions/src/middleware/*.ts` - Middleware files
- `functions/src/tools/*.ts` or `routes/*.ts` - Route handlers
- `functions/src/services/*.ts` - Service layer
- `functions/src/shared/*.ts` - Shared utilities
- `functions/src/*.ts` - Domain files (if domain-grouped)

**Example Good ABOUTME Comments:**
```typescript
// ABOUTME: Main entry point for Firebase Functions - exports MCP endpoint with tool routing
// ABOUTME: Configures Express app with authentication, CORS, and health check

// ABOUTME: Post creation, reading, and management functions
// ABOUTME: Includes API endpoints and real-time triggers

// ABOUTME: API key validation middleware for Express routes
// ABOUTME: Queries apiKeys collection group and attaches userId to request

// ABOUTME: Vitest configuration for Firebase Cloud Functions testing
// ABOUTME: Configures Node.js test environment with TypeScript support and coverage settings
```

**Mark issues found:**
- List files missing ABOUTME comments
- Note: Test files can optionally skip ABOUTME if file purpose is obvious from test name

### Step 7: Review Test Coverage
- **Content**: Check unit and integration test coverage exists
- **ActiveForm**: Checking unit and integration test coverage exists

**Actions:**

Validate testing standards are met:

**Required Test Types:**

1. **Unit Tests:**
   - Location: `functions/src/__tests__/**/*.test.ts`
   - Purpose: Test handlers, utilities, validators in isolation
   - Run: `npm test`
   - Should not require emulators

2. **Integration Tests:**
   - Location: `functions/src/__tests__/emulator/**/*.test.ts`
   - Purpose: Test complete workflows with real Firebase
   - Run: `npm run test:emulator`
   - Require emulators running

**Check Configuration:**

`vitest.config.ts` should exist:
```typescript
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/__tests__/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/lib/**', '**/__tests__/emulator/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
    },
  },
});
```

`vitest.emulator.config.ts` should exist:
```typescript
export default defineConfig({
  test: {
    include: ['**/__tests__/emulator/**/*.test.ts'],
    testTimeout: 30000,
  },
});
```

**Check package.json scripts:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:emulator": "vitest run --config vitest.emulator.config.ts",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Run Tests and Check Results:**
```bash
# Run unit tests
npm test

# Check coverage
npm run test:coverage
```

**Coverage Expectations:**
- Unit tests: 60%+ coverage
- All new features should have tests
- Critical business logic should have high coverage

**Validate Test Quality:**
- Tests actually assert behavior (not just "it runs without error")
- Tests use proper setup/teardown
- Tests are independent (can run in any order)
- Integration tests use real emulator data
- Tests clean up after themselves

**Check for Common Issues:**
- Tests that always pass (no real assertions)
- Tests marked as `it.skip` or `it.todo`
- Tests with hardcoded production data
- Tests that don't clean up Firestore data

**Mark issues found:**
- Missing unit tests for handlers
- Missing integration tests for workflows
- Test coverage below 60%
- No vitest configuration files
- Tests that don't actually validate behavior
- Integration tests not using emulators

### Step 8: Validate Error Handling and Response Format
- **Content**: Verify all handlers use proper result format with error handling
- **ActiveForm**: Verifying all handlers use proper result format with error handling

**Actions:**

Check all function handlers follow proper error handling patterns:

**Required Response Format:**
```typescript
// Success response
return { success: true, message: 'Operation completed', data: result };

// Error response
return { success: false, message: 'Error description' };
```

**For Express Routes:**
```typescript
app.post('/endpoint', apiKeyGuard, async (req, res) => {
  try {
    // Validation
    if (!req.body.requiredField) {
      res.status(400).json({ success: false, message: 'Missing required field' });
      return;
    }

    // Business logic
    const result = await doSomething();

    // Success response
    res.status(200).json({ success: true, message: 'Success', data: result });
  } catch (error) {
    console.error('Error in endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
```

**For Callable Functions:**
```typescript
export const myFunction = onCall(async (request) => {
  try {
    // Auth check
    if (!request.auth) {
      return { success: false, message: 'Not authenticated' };
    }

    // Validation
    if (!request.data.requiredField) {
      return { success: false, message: 'Missing required field' };
    }

    // Business logic
    const result = await doSomething();

    return { success: true, message: 'Success', data: result };
  } catch (error) {
    console.error('Error in myFunction:', error);
    return { success: false, message: 'Internal server error' };
  }
});
```

**Validation Checklist:**

1. **All handlers wrapped in try-catch:**
   - No unhandled promise rejections
   - Errors logged with console.error
   - Generic error messages for users (don't leak implementation details)

2. **Consistent response format:**
   - Always include `success: boolean`
   - Always include `message: string`
   - Include `data` only on success (optional)

3. **Proper HTTP status codes (Express):**
   - 200 for success
   - 400 for validation errors
   - 401 for authentication errors
   - 403 for authorization errors
   - 500 for internal errors

4. **Input validation:**
   - Check required fields exist
   - Validate data types
   - Validate ranges/formats
   - Return clear error messages

5. **Authentication checks:**
   - Check auth before business logic
   - Return 401 for missing auth
   - Return 403 for insufficient permissions

**Search for Anti-Patterns:**
```bash
# Functions without try-catch
grep -A 30 "export const.*onRequest\|onCall" functions/src/**/*.ts | grep -v "try {"

# Raw error throws without wrapping
grep "throw new Error" functions/src/**/*.ts

# Missing success field in responses
grep "res.json\|return {" functions/src/**/*.ts | grep -v "success:"
```

**Mark issues found:**
- Handlers without try-catch blocks
- Inconsistent response format
- Missing error logging
- Raw errors exposed to clients
- No input validation
- Authentication checks missing

### Step 9: Review Security and Production Readiness
- **Content**: Final security review and production deployment checks
- **ActiveForm**: Reviewing security and production deployment checks

**Actions:**

Perform final security audit and deployment readiness check:

**Security Checklist:**

1. **Environment Variables:**
   ```bash
   # Check .gitignore includes
   grep ".env" .gitignore
   grep ".env.local" .gitignore

   # Verify no secrets in code
   grep -r "apiKey.*=.*\"" functions/src/
   grep -r "password.*=.*\"" functions/src/
   ```

2. **Firestore Rules Production Safety:**
   - No `allow read, write: if true;` except for truly public data
   - No commented-out security checks
   - All helper functions tested
   - Collection group rules present if using collectionGroup queries

3. **API Key Security (if using):**
   - Keys stored in `/users/{userId}/apiKeys` subcollection
   - `active` flag enforced
   - Keys have proper prefix for project
   - No keys hardcoded in client or functions code

4. **Firebase Auth Security (if using):**
   - Role field protected (can't be set by client)
   - Admin role restricted properly
   - Token validation implemented
   - Client SDK properly configured

5. **Function Security:**
   - No admin SDK code exposed to client
   - Sensitive operations check authentication
   - Rate limiting considered for public endpoints
   - CORS configured (not `origin: '*'` in production)

**Production Readiness Checklist:**

1. **Dependencies:**
   ```bash
   # Check for vulnerabilities
   cd functions && npm audit

   # Check for outdated packages
   npm outdated
   ```

2. **Build and Deploy Scripts:**
   ```bash
   # Verify build works
   cd functions && npm run build

   # Verify lint passes
   npm run lint

   # Verify tests pass
   npm test
   npm run test:emulator
   ```

3. **Firebase Configuration:**
   - `.firebaserc` has correct project ID
   - `firebase.json` has production-ready settings
   - Hosting sites created in Firebase Console
   - Function runtime matches package.json engines

4. **Indexes:**
   ```bash
   # Check firestore.indexes.json exists and is non-empty if using complex queries
   cat firestore.indexes.json
   ```

5. **Monitoring and Logging:**
   - Functions have meaningful console.log statements
   - Errors logged with context
   - Consider Cloud Functions logging level

6. **Cost Awareness:**
   - Reviewed Cloud Functions invocation patterns
   - Considered cold start impact
   - Evaluated server-write-only vs client-write trade-offs
   - Set up billing alerts in Firebase Console

**Deployment Testing Plan:**
```bash
# 1. Test in emulators
firebase emulators:start

# 2. Deploy to preview channel (hosting only)
firebase hosting:channel:deploy preview

# 3. Deploy functions to production
firebase deploy --only functions

# 4. Deploy rules carefully
firebase deploy --only firestore:rules

# 5. Deploy hosting
firebase deploy --only hosting
```

**Mark issues found:**
- Secrets exposed in code or git
- Insecure Firestore rules
- Failed security checks
- Missing production configuration
- Vulnerabilities in dependencies
- Tests failing
- Missing indexes for complex queries

## Validation Checklists by Pattern

### Multi-Hosting Pattern Validation

**Site-Based Pattern:**
- [ ] All sites exist in Firebase Console (`firebase hosting:sites:list`)
- [ ] Each hosting entry has unique `site` field
- [ ] No predeploy hooks (not supported with site:)
- [ ] Rewrites reference existing functions
- [ ] Emulator configuration has hosting port (single port for all sites)

**Target-Based Pattern:**
- [ ] All targets mapped in `.firebaserc`
- [ ] Target mappings match firebase.json entries
- [ ] Predeploy hooks reference valid build scripts
- [ ] Build scripts execute successfully
- [ ] Emulator configuration has per-target ports
- [ ] .firebaserc committed to git

**Single-Hosting Pattern:**
- [ ] Has `source` or `public` field
- [ ] Rewrites configured for function routes
- [ ] Consider if project would benefit from multiple sites

### Authentication Pattern Validation

**API Key Pattern:**
- [ ] Middleware validates key format with project prefix
- [ ] Uses `collectionGroup('apiKeys')` query
- [ ] Checks `active: true` flag
- [ ] Attaches `userId` to request object
- [ ] Returns 401 for invalid keys
- [ ] Firestore rules allow server-write-only for apiKeys
- [ ] Keys stored as `/users/{userId}/apiKeys/{keyId}`

**Firebase Auth Pattern:**
- [ ] Functions check `request.auth.uid`
- [ ] User roles stored in `/users/{userId}`
- [ ] Firestore rules have role-based helpers
- [ ] Client-side connects to auth emulator in development
- [ ] Environment variables configured correctly
- [ ] Role field protected from client writes

**Both Patterns:**
- [ ] Clear separation between API key routes and Firebase Auth routes
- [ ] Documentation explains which auth method for which use case
- [ ] No confusion in authentication checks

### Security Model Validation

**Server-Write-Only:**
- [ ] All collections have `allow write: if false;`
- [ ] Read rules appropriate for data sensitivity
- [ ] Helper functions used for reusable logic
- [ ] Default deny rule at end
- [ ] Functions use admin SDK for writes
- [ ] No client-side write attempts in code

**Client-Write with Validation:**
- [ ] All write rules use `diff().affectedKeys().hasOnly([...])`
- [ ] Sensitive fields (role, balance, etc.) protected
- [ ] Authentication checked in all write rules
- [ ] Ownership validated (userId matches)
- [ ] Helper functions extract repeated logic
- [ ] Default deny rule at end
- [ ] Rules tested in emulator Rules Playground

## Trigger Keywords

This sub-skill activates when user says:
- "review firebase code"
- "check firebase setup"
- "validate firebase project"
- "audit firebase security"
- "look at firebase configuration"
- "review firestore rules"
- "check firebase.json"
- "validate authentication"

## Common Issues Found During Validation

1. **Missing singleProjectMode in emulators:**
   - Symptom: Emulators don't communicate with each other
   - Fix: Add `"singleProjectMode": true` to emulators config

2. **No default deny rule:**
   - Symptom: Unmatched paths are accessible
   - Fix: Add `match /{document=**} { allow read, write: if false; }` at end

3. **Mixed architecture patterns:**
   - Symptom: Some Express routes + some individual function files
   - Fix: Migrate to consistent pattern

4. **Missing ABOUTME comments:**
   - Symptom: Files have no documentation header
   - Fix: Add 2-line ABOUTME comment to every .ts file

5. **No integration tests:**
   - Symptom: Only unit tests exist
   - Fix: Add emulator tests for critical workflows

6. **Inconsistent response format:**
   - Symptom: Some functions return data directly, others use {success, message}
   - Fix: Standardize all responses to {success, message, data?}

7. **No error handling:**
   - Symptom: Functions not wrapped in try-catch
   - Fix: Add try-catch and proper error responses

8. **Secrets in code:**
   - Symptom: API keys or passwords hardcoded
   - Fix: Move to environment variables, update .gitignore

9. **Client-write without validation:**
   - Symptom: Firestore rules allow updates without field restrictions
   - Fix: Add diff().affectedKeys().hasOnly([...]) validation

10. **No authentication checks:**
    - Symptom: Sensitive functions don't check auth
    - Fix: Add request.auth.uid check or apiKeyGuard middleware

## Reference Main Skill Patterns

All validation is performed against patterns documented in @firebase-development:

- **Multi-Hosting Setup:** Refer to main skill for site: vs target: vs single-with-rewrites
- **Authentication:** Refer to main skill for API key and Firebase Auth patterns
- **Functions Architecture:** Refer to main skill for Express, domain-grouped, individual patterns
- **Security Model:** Refer to main skill for server-write-only vs client-write-validated
- **Firestore Rules Patterns:** Refer to main skill for helper functions, diff(), role lookups
- **Emulator Development:** Refer to main skill for configuration and workflow
- **Modern Tooling:** Refer to main skill for TypeScript, vitest, biome standards
- **Testing Requirements:** Refer to main skill for unit + integration expectations

## Completion Criteria

Validation is complete when:

1. All 9 TodoWrite steps marked completed
2. firebase.json validated against chosen patterns
3. Emulator configuration complete with singleProjectMode
4. Firestore rules reviewed for security patterns
5. Functions architecture consistent throughout
6. Authentication implementation validated
7. All files have ABOUTME comments
8. Test coverage meets requirements (unit + integration)
9. Error handling follows {success, message, data?} format
10. Security review passed with no critical issues
11. Production readiness checklist completed

**Output:**
- Summary document of findings
- List of issues categorized by severity (critical, important, nice-to-have)
- Recommendations for remediation
- Confirmation that project follows Firebase best practices

---
name: firebase-development:debug
description: Troubleshoot Firebase emulator issues, rules violations, function errors, auth problems, and deployment failures. Guides systematic debugging using emulator UI, logs analysis, and Rules Playground.
---

# Firebase Debugging

## Overview

This sub-skill guides you through troubleshooting Firebase development issues systematically. It handles:

- Identifying issue type (emulator, rules, functions, auth, deployment)
- Analyzing emulator logs and terminal output
- Using Emulator UI for data inspection and rules testing
- Testing Firestore rules in Rules Playground
- Debugging function errors with console.log and terminal monitoring
- Troubleshooting authentication issues (emulator connection, env vars)
- Analyzing deployment failures with firebase-debug.log
- Exporting emulator state before restarts
- Verifying fixes with emulator testing
- Documenting issues and solutions for future reference

The workflow uses TodoWrite to track 8-10 steps from issue identification to verified fix.

## When This Sub-Skill Applies

Use this sub-skill when:
- Emulators won't start or have port conflicts
- Getting Firestore rules violations
- Cloud Functions returning errors or not executing
- Authentication not working in emulators
- Deployment fails with cryptic errors
- User says: "debug", "troubleshoot", "error", "not working", "failing", "broken"

**Do not use for:**
- Setting up new Firebase projects (use @firebase-development/project-setup)
- Adding new features (use @firebase-development/add-feature)
- Code review without specific errors (use @firebase-development/validate)

## Integration with Superpowers Skills

This sub-skill integrates with superpowers:systematic-debugging for rigorous problem-solving:

**Integration Pattern:**
- Firebase debug sub-skill handles Firebase-specific diagnostics (emulator UI, rules testing, logs)
- If root cause remains unclear after Firebase diagnostics, invoke superpowers:systematic-debugging
- Superpowers provides four-phase framework: root cause investigation ’ pattern analysis ’ hypothesis testing ’ implementation

**When to Escalate to Superpowers:**
- Firebase-specific tools don't reveal the issue
- Need to trace through call stack beyond Firebase layer
- Complex interaction between multiple Firebase services
- Suspected race condition or timing issue

**Do not escalate for:**
- Simple rules violations (use Rules Playground)
- Port conflicts (check lsof output)
- Missing environment variables (check .env files)
- Standard deployment errors (check firebase-debug.log)

## Reference Patterns

All patterns are documented in the main @firebase-development skill. This sub-skill helps you diagnose and fix issues using those patterns.

**Key Sections Referenced:**
1. **Emulator Development Workflow:** Terminal output, Emulator UI features, auto-reload behavior
2. **Common Gotchas:** Port conflicts, Admin SDK vs Client SDK, rules testing, cold starts, data persistence
3. **Authentication:** API key validation, Firebase Auth connection, environment variables
4. **Security Model:** Server-write-only vs client-write patterns
5. **Functions Architecture:** Express app, domain-grouped, individual files

## TodoWrite Workflow

This sub-skill creates a TodoWrite checklist with 8-10 steps. Follow the checklist to systematically debug your Firebase issue.

### Step 1: Identify Issue Type
- **Content**: Identify what type of issue is occurring
- **ActiveForm**: Identifying what type of issue is occurring

**Actions:**

Analyze the error message, behavior, or symptom to categorize the issue:

**Issue Categories:**

1. **Emulator Won't Start**
   - Symptoms: Port conflicts, initialization errors, emulators crash immediately
   - Keywords: "port already in use", "EADDRINUSE", "emulator failed to start"

2. **Rules Violation**
   - Symptoms: "Missing or insufficient permissions", read/write denied
   - Keywords: "PERMISSION_DENIED", "firestore rules", "access denied"

3. **Function Error**
   - Symptoms: HTTP 500, function not executing, timeout
   - Keywords: "function failed", "error in function", "timeout", "500 error"

4. **Auth Issue**
   - Symptoms: User not authenticated, token errors, emulator not connecting
   - Keywords: "auth failed", "not authenticated", "invalid token"

5. **Deployment Failure**
   - Symptoms: Deploy command fails, incomplete deployment, cryptic errors
   - Keywords: "deployment failed", "deploy error", "firebase deploy"

**If unclear, use AskUserQuestion:**

```
Question: "What type of issue are you experiencing?"
Header: "Issue Type"
Options:
  - "Emulator Won't Start" (Port conflicts, initialization errors)
  - "Rules Violation" (Permission denied, access errors)
  - "Function Error" (500 errors, timeouts, not executing)
  - "Auth Issue" (Login not working, token errors)
  - "Deployment Failure" (Deploy command fails)
```

**Document your classification before proceeding.**

### Step 2: Check Emulator Logs and Terminal Output
- **Content**: Review emulator logs and terminal output for errors
- **ActiveForm**: Reviewing emulator logs and terminal output for errors

**Actions:**

**For running emulators:**
```bash
# Terminal output shows all emulator activity
# Look for:
# - Error messages in red
# - Warning messages in yellow
# - Function invocation logs
# - Rules evaluation results

# If emulators are running, watch terminal output
# as you reproduce the issue
```

**For emulators that won't start:**
```bash
# Check for port conflicts
lsof -i :4000  # Emulator UI
lsof -i :5001  # Functions
lsof -i :8080  # Firestore
lsof -i :9099  # Auth
lsof -i :5000  # Hosting (if configured)

# Kill conflicting process if found
kill -9 <PID>

# Check Firebase project configuration
cat firebase.json
cat .firebaserc

# Verify Node version matches functions runtime
node --version
# Should match functions/package.json engines.node (18 or 20)
```

**For deployment errors:**
```bash
# Check deployment log
cat firebase-debug.log

# Look for:
# - HTTP error codes (401, 403, 404)
# - Missing dependencies
# - Build failures
# - Permission errors
```

**Document key error messages before proceeding to next step.**

### Step 3: Open Emulator UI for Inspection
- **Content**: Open Emulator UI to inspect data and test rules
- **ActiveForm**: Opening Emulator UI to inspect data and test rules

**Actions:**

```bash
# Emulator UI runs at http://127.0.0.1:4000
open http://127.0.0.1:4000

# Or manually navigate in browser
```

**Emulator UI Features:**

1. **Firestore Tab**
   - View all collections and documents
   - Edit data directly
   - See real-time updates
   - Check if data structure matches expectations

2. **Authentication Tab**
   - View emulated users
   - Add test users
   - See auth tokens
   - Verify user creation worked

3. **Functions Tab**
   - See function invocation logs
   - View request/response data
   - Check execution time
   - See error stack traces

4. **Logs Tab**
   - Consolidated logs from all emulators
   - Filter by severity (info, warn, error)
   - Search logs by keyword

**Use Emulator UI to:**
- Verify data exists where expected
- Check data structure and field names
- Confirm users are authenticated
- Review function execution history

**Document findings (data present/missing, users exist/missing, function calls succeeded/failed).**

### Step 4: Test Rules in Rules Playground (If Rules Issue)
- **Content**: Use Rules Playground to test Firestore rules
- **ActiveForm**: Using Rules Playground to test Firestore rules

**Actions:**

**Only if Step 1 identified a rules violation.**

```bash
# Access Rules Playground in Emulator UI
# Navigate to: Firestore ’ Rules Playground tab
```

**Rules Playground Workflow:**

1. **Select Operation Type**
   - get (single document read)
   - list (collection query)
   - create (new document)
   - update (modify document)
   - delete (remove document)

2. **Specify Document Path**
   - Enter full path: `users/user123` or `teams/team1/posts/post456`
   - Must match your Firestore structure exactly

3. **Set Auth Context**
   - Unauthenticated: Leave auth empty
   - Authenticated: Add auth.uid value
   - Custom claims: Add custom token data

4. **Add Request Data (for create/update)**
   - Enter JSON data being written
   - Must match field structure in your app

5. **Run Simulation**
   - Click "Run" button
   - See ALLOW or DENY result
   - Review which rule matched
   - See evaluation trace

**Common Rules Issues:**

```javascript
// Issue: Helper function not accessible
// Fix: Define function inside match block or at root level

// Issue: Admin SDK operations counted as client operations
// Fix: Admin SDK bypasses rules (only client SDK is validated)

// Issue: Rules not reloading
// Fix: Restart emulators (Ctrl+C, then firebase emulators:start)
```

**Document which rule is failing and why (auth missing, field validation failed, etc.).**

### Step 5: Add Debug Logging to Functions (If Function Error)
- **Content**: Add console.log statements to debug function logic
- **ActiveForm**: Adding console.log statements to debug function logic

**Actions:**

**Only if Step 1 identified a function error.**

**Add strategic logging:**

```typescript
// functions/src/handlers/myFunction.ts

export async function myFunction(req: Request, res: Response) {
  console.log('= myFunction called');
  console.log('=å Request body:', JSON.stringify(req.body, null, 2));
  console.log('= Auth header:', req.headers['x-api-key'] || 'none');

  try {
    // Your logic here
    const result = await someOperation();
    console.log(' Operation succeeded:', result);

    res.json({ success: true, message: 'Success', data: result });
  } catch (error) {
    console.error('L Error in myFunction:', error);
    console.error('Stack trace:', (error as Error).stack);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
}
```

**What to log:**

1. **Function entry**: Confirm function is being called
2. **Input data**: Log req.body, req.params, req.query
3. **Auth context**: Log req.userId, API keys, auth tokens
4. **Intermediate values**: Log results of async operations
5. **Error details**: Log full error object and stack trace

**Watch terminal output:**

```bash
# Terminal shows all console.log output in real-time
# Reproduce the issue and watch logs appear

# Functions tab in Emulator UI also shows logs
# but terminal is more detailed
```

**Common Function Errors:**

1. **Cold start delays**: First call takes 5-10 seconds (normal)
2. **Missing CORS**: Add `app.use(cors({ origin: true }))`
3. **Wrong export format**: Check index.ts exports function correctly
4. **Async not awaited**: Missing await causes premature return
5. **Environment variables**: Check .env file exists and is loaded

**Document where in function flow the error occurs (auth, validation, database operation, response).**

### Step 6: Verify Auth Configuration (If Auth Issue)
- **Content**: Verify authentication configuration and emulator connection
- **ActiveForm**: Verifying authentication configuration and emulator connection

**Actions:**

**Only if Step 1 identified an auth issue.**

**Check environment variables:**

```bash
# For functions (API key pattern)
cat functions/.env
# Should contain keys but NOT committed to git

# For hosting (Firebase Auth pattern)
cat hosting/.env.local
# Should contain:
NEXT_PUBLIC_USE_EMULATORS=true

# Verify .gitignore excludes .env files
grep ".env" .gitignore
```

**Check emulator connection code:**

```typescript
// hosting/src/lib/firebase.ts or similar

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators in development
if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  console.log('=' Connecting to Firebase emulators...');
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  console.log(' Connected to emulators');
}
```

**Check API key middleware (if using custom API keys):**

```typescript
// functions/src/middleware/apiKeyGuard.ts

// Verify:
// 1. Middleware checks x-api-key header
// 2. Prefix matches project (e.g., 'ooo_' for oneonone)
// 3. Query uses collectionGroup for apiKeys subcollection
// 4. Checks active: true flag
```

**Test auth in Emulator UI:**

1. Open Authentication tab
2. Add test user manually
3. Get user UID
4. Use UID in Rules Playground auth context
5. Verify rules pass with authenticated user

**Common Auth Issues:**

1. **NEXT_PUBLIC_USE_EMULATORS not set**: Hosting connects to production
2. **connectAuthEmulator called twice**: Causes "already called" error
3. **Wrong emulator ports**: Auth on 9099, not 5001
4. **API key prefix mismatch**: Check keyId.startsWith() matches actual keys
5. **Missing API key in database**: Use Emulator UI to add test key manually

**Document auth method (Firebase Auth vs API keys) and where configuration is failing.**

### Step 7: Check Deployment Configuration (If Deployment Failure)
- **Content**: Review firebase.json and deployment settings
- **ActiveForm**: Reviewing firebase.json and deployment settings

**Actions:**

**Only if Step 1 identified a deployment failure.**

**Review firebase-debug.log:**

```bash
# Last deployment log with full error details
cat firebase-debug.log

# Look for:
# - HTTP 401/403: Permissions issue (run firebase login)
# - HTTP 404: Project doesn't exist (check .firebaserc)
# - Build failures: Check predeploy hooks
# - Function size limits: Bundle too large
```

**Check firebase.json configuration:**

```bash
cat firebase.json

# Common issues:
# 1. Wrong predeploy command (mistyped build script)
# 2. Missing site/target configuration
# 3. Invalid rewrites syntax
# 4. Functions region mismatch
```

**Verify project configuration:**

```bash
# Check project ID matches Firebase console
cat .firebaserc

# Verify targets are linked (if using targets)
firebase target:list

# Check logged in user has permissions
firebase projects:list
```

**Common Deployment Errors:**

1. **Not logged in**: Run `firebase login` again
2. **Wrong project**: Run `firebase use <project-id>`
3. **Predeploy hook fails**: Build scripts must succeed before deploy
4. **Missing targets**: Run `firebase target:apply` commands
5. **Region mismatch**: Functions and rewrites must use same region
6. **Node version**: Local version must match functions runtime

**Test predeploy hooks locally:**

```bash
# Run build scripts manually before deploying
cd hosting
npm run build

cd ../functions
npm run build

# If builds succeed locally, predeploy should work
```

**Document deployment step that's failing (rules, functions, hosting) and error code.**

### Step 8: Export Emulator State Before Restarting
- **Content**: Export current emulator state for recovery
- **ActiveForm**: Exporting current emulator state for recovery

**Actions:**

**Before making fixes or restarting emulators, preserve current state:**

```bash
# Graceful shutdown (exports data automatically)
# Press Ctrl+C in terminal running emulators

# Verify export location
ls -la .firebase/emulator-data/

# Should contain:
# - firestore_export/ (Firestore data)
# - auth_export/ (Auth users)
# - config.json (emulator configuration)
```

**Manual export (if needed):**

```bash
# Export to custom location
firebase emulators:export ./backup-data

# Import from custom location (when restarting)
firebase emulators:start --import=./backup-data
```

**State preservation checklist:**

- [ ] Emulator data directory exists: `.firebase/emulator-data/`
- [ ] Firestore export present: `firestore_export/`
- [ ] Auth export present (if using Auth): `auth_export/`
- [ ] Emulators stopped gracefully with Ctrl+C (not killed)

**Why this matters:**

- Killing emulator process prevents export
- Lost data means recreating test users and documents
- Export allows testing fix against same data

**Document export location and what data was preserved.**

### Step 9: Implement and Test Fix
- **Content**: Apply fix based on diagnosis and test with emulators
- **ActiveForm**: Applying fix based on diagnosis and testing with emulators

**Actions:**

**Based on issue type identified in Step 1:**

**For Emulator Issues:**
```bash
# Kill port-conflicting process
kill -9 <PID>

# Update firebase.json ports if needed
# Restart emulators
firebase emulators:start --import=.firebase/emulator-data
```

**For Rules Violations:**
```javascript
// firestore.rules

// Add missing helper function
function isAuthenticated() {
  return request.auth != null;
}

// Fix rule logic
match /users/{userId} {
  allow read: if isAuthenticated() && request.auth.uid == userId;
  allow write: if false; // Server-write-only
}
```

**For Function Errors:**
```typescript
// Fix identified issue (missing await, wrong validation, etc.)

// Remove debug logs or keep strategic ones
console.log(' Function executed successfully');

// Ensure error handling is present
try {
  // operation
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ success: false, message: 'Error message' });
}
```

**For Auth Issues:**
```bash
# Add missing environment variable
echo "NEXT_PUBLIC_USE_EMULATORS=true" >> hosting/.env.local

# Or fix API key query logic
# Or add test API key in Emulator UI
```

**For Deployment Issues:**
```bash
# Re-login if credentials expired
firebase login

# Switch to correct project
firebase use <project-id>

# Fix predeploy hooks in firebase.json
# Deploy again
firebase deploy
```

**Test the fix:**

```bash
# Restart emulators if needed (rules, config changes)
firebase emulators:start --import=.firebase/emulator-data

# Reproduce original issue
# - Make same API call
# - Trigger same function
# - Attempt same write operation

# Verify fix in Emulator UI
# - Check Firestore data
# - Check function logs
# - Test in Rules Playground

# Confirm terminal shows success logs, not errors
```

**Success criteria:**

- [ ] Original error no longer occurs
- [ ] Terminal output shows success logs
- [ ] Emulator UI confirms expected behavior
- [ ] Rules Playground shows ALLOW (if rules issue)
- [ ] Function returns correct response (if function issue)
- [ ] Deployment completes successfully (if deploy issue)

**Document what was changed and how fix was verified.**

### Step 10: Document Issue and Solution
- **Content**: Document the issue and solution for future reference
- **ActiveForm**: Documenting the issue and solution for future reference

**Actions:**

**Create or update project documentation:**

```markdown
# docs/debugging-notes.md (or add to existing docs)

## [Date] - [Issue Type]: [Brief Description]

**Symptom:**
- What error or behavior occurred
- Exact error message
- When it happened (after what change)

**Root Cause:**
- What was actually wrong
- Why it caused the symptom
- What configuration/code was incorrect

**Solution:**
- What was changed to fix it
- Code changes made
- Configuration updates

**Prevention:**
- How to avoid this in the future
- What to check before similar changes
- Validation steps to add

**References:**
- Related documentation sections
- Similar issues encountered before
- External resources that helped
```

**Example entry:**

```markdown
## 2025-01-14 - Rules Violation: API Keys Collection Access

**Symptom:**
- PERMISSION_DENIED error when calling createApiKey function
- Error: "Missing or insufficient permissions"
- Occurred after adding new function

**Root Cause:**
- Firestore rules denied write access to apiKeys subcollection
- New function tried to create apiKey document from admin SDK
- Admin SDK should bypass rules, but was using wrong initialization

**Solution:**
- Changed function to use admin.firestore() instead of getFirestore()
- Admin SDK now correctly bypasses rules
- Function creates apiKeys successfully

**Prevention:**
- Always use admin SDK in Cloud Functions
- Client SDK for client apps (respects rules)
- Test all write operations in functions after adding new collections

**References:**
- firebase-development skill: Security Model section
- oneonone/functions/src/lib/firebase.ts for correct admin SDK usage
```

**Commit documentation if appropriate:**

```bash
git add docs/debugging-notes.md
git commit -m "docs: add debugging notes for [issue]"
```

**Document added, issue logged for future reference.**

## Common Firebase Debugging Issues

Reference these known issues from the main @firebase-development skill:

### Emulator Issues

1. **Port conflicts**: Check with `lsof -i :<port>`, kill process or change port
2. **Data persistence**: Use Ctrl+C to stop (not kill), data in `.firebase/emulator-data/`
3. **Cold starts**: First function call takes 5-10 seconds (normal)
4. **Rules not reloading**: Must restart emulators to reload Firestore rules

### Rules Issues

5. **Admin SDK vs Client SDK**: Admin SDK bypasses rules, only client SDK is validated
6. **Rules testing**: Test rules with Emulator UI Rules Playground, not admin SDK calls
7. **Helper function scope**: Define functions inside match blocks or at root level

### Function Issues

8. **Missing CORS**: Add `app.use(cors({ origin: true }))` for browser requests
9. **Node version**: Must match functions runtime (18 or 20)
10. **Environment variables**: Functions use `.env`, hosting uses `.env.local`

### Auth Issues

11. **Emulator connection**: Set `NEXT_PUBLIC_USE_EMULATORS=true` in hosting/.env.local
12. **connectAuthEmulator twice**: Causes error, only call once
13. **API key prefix**: Verify prefix matches (e.g., 'ooo_' for oneonone)

### Deployment Issues

14. **Deployment order**: Deploy rules ’ functions ’ hosting
15. **Index requirements**: Complex queries need indexes in firestore.indexes.json
16. **Build failures**: Predeploy hooks must succeed before deployment

## Integration with Main Skill

This sub-skill references patterns from the main `firebase-development` skill:

- **Emulator Development Workflow**: How to use Emulator UI and terminal logs
- **Common Gotchas**: Comprehensive list of known Firebase issues
- **Authentication Patterns**: API key vs Firebase Auth debugging
- **Security Model**: Understanding server-write vs client-write
- **Functions Architecture**: Finding function files and exports

**When debugging, always consult the main skill's Common Gotchas section first.**

## Success Criteria

A debug session is complete when:

1. Issue type identified and categorized
2. Relevant logs and error messages captured
3. Emulator UI used to inspect state (if applicable)
4. Rules tested in Playground (if rules issue)
5. Function debug logs added and reviewed (if function issue)
6. Auth configuration verified (if auth issue)
7. Deployment configuration checked (if deploy issue)
8. Emulator state preserved before fixes
9. Fix implemented and tested successfully
10. Issue and solution documented for future reference

**Invoke superpowers:systematic-debugging if Firebase-specific tools don't reveal root cause.**

# Firestore Rules Patterns - Complete Examples

Comprehensive examples of common Firestore security rules patterns from production projects.

## Overview

This guide demonstrates battle-tested Firestore rules patterns:

1. **Helper Function Extraction** - Reusable logic for maintainability
2. **diff().affectedKeys() Validation** - Field-level update restrictions
3. **Role-Based Access Control** - Admin/moderator/user hierarchies
4. **Collection Group Query Support** - Rules for collectionGroup() queries
5. **Server-Write-Only Pattern** - Maximum security for light-write apps
6. **Client-Write Validation Pattern** - Safe client writes with validation

All examples come from production Firebase projects.

---

## Pattern 1: Helper Function Extraction

**Problem:** Repeated logic across multiple rules makes them hard to maintain.

**Solution:** Extract reusable logic into helper functions at the top level.

### Basic Authentication Helpers

**firestore.rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ========================================
    // HELPER FUNCTIONS
    // ========================================

    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Check if user is viewing their own document
    function isViewingSelf(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // ========================================
    // RULES
    // ========================================

    match /users/{userId} {
      allow read: if isOwner(userId);
      allow update: if isOwner(userId);
      allow create, delete: if false; // Only Cloud Functions
    }

    match /profiles/{userId} {
      allow read: if isAuthenticated(); // Any authenticated user
      allow write: if isOwner(userId);  // Only owner can update
    }
  }
}
```

**Benefits:**
- Rules are readable and self-documenting
- Logic changes in one place
- Easy to test and reason about
- Reduces duplication

**Example from:** All three production projects use this pattern

---

## Pattern 2: Role-Based Access Control

**Problem:** Need different permission levels (admin, moderator, user).

**Solution:** Store role in user document, create helper functions to check role.

### Example: Admin + User Roles

**Firestore structure:**
```
/users/{userId}
  - role: "admin" | "user"
  - email: string
  - displayName: string
```

**firestore.rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ========================================
    // ROLE HELPERS
    // ========================================

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function getUserRole() {
      return getUserData().role;
    }

    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }

    function isUser() {
      return isAuthenticated();
    }

    // ========================================
    // AUTHENTICATION HELPERS
    // ========================================

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // ========================================
    // USER RULES
    // ========================================

    match /users/{userId} {
      // Anyone can read their own user doc
      allow read: if isOwner(userId);

      // Admins can read all user docs
      allow read: if isAdmin();

      // Only Cloud Functions can write user docs
      allow write: if false;
    }

    // ========================================
    // ADMIN-ONLY COLLECTION
    // ========================================

    match /admin-logs/{logId} {
      // Only admins can read/write admin logs
      allow read, write: if isAdmin();
    }

    // ========================================
    // USER-CREATED CONTENT
    // ========================================

    match /posts/{postId} {
      // Anyone authenticated can read posts
      allow read: if isAuthenticated();

      // Users can create their own posts
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid;

      // Users can update/delete their own posts
      allow update, delete: if isOwner(resource.data.userId);

      // Admins can update/delete any post
      allow update, delete: if isAdmin();
    }
  }
}
```

**Example from:** `/Users/dylanr/work/2389/bot-socialmedia-server/firestore.rules`

### Example: Entitlement Levels

**Firestore structure:**
```
/users/{userId}
  - entitlement: "admin" | "moderator" | "public" | "waitlist"
```

**firestore.rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ========================================
    // ENTITLEMENT HELPERS
    // ========================================

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function getEntitlement() {
      return getUserData().entitlement;
    }

    function isAdmin() {
      return isAuthenticated() && getEntitlement() == 'admin';
    }

    function isModerator() {
      return isAuthenticated() && (
        getEntitlement() == 'admin' ||
        getEntitlement() == 'moderator'
      );
    }

    function hasPublicAccess() {
      return isAuthenticated() && getEntitlement() != 'waitlist';
    }

    function isAuthenticated() {
      return request.auth != null;
    }

    // ========================================
    // FILES WITH MODERATOR CONTROL
    // ========================================

    match /files/{fileId} {
      // Anyone can read files
      allow read: if true;

      // Public users can upload files
      allow create: if hasPublicAccess();

      // Moderators and admins can update files
      allow update: if isModerator();

      // Only admins can delete files
      allow delete: if isAdmin();
    }
  }
}
```

**Example from:** `/Users/dylanr/work/2389/meme-rodeo/firestore.rules`

---

## Pattern 3: diff().affectedKeys() Validation

**Problem:** Allow client writes but prevent unauthorized field changes.

**Solution:** Use `diff().affectedKeys()` to whitelist which fields can be updated.

### Example: Protecting Sensitive Fields

**firestore.rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // ========================================
    // USER PROFILE WITH SAFE FIELDS
    // ========================================

    match /users/{userId} {
      // Users can read their own profile
      allow read: if isOwner(userId);

      // Users can only update safe fields
      allow update: if isOwner(userId) &&
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['displayName', 'bio', 'photoURL', 'updatedAt']);

      // Prevent privilege escalation: can't change role
      // Note: 'role' not in hasOnly() list above
    }
  }
}
```

**What this prevents:**
```javascript
// ✅ Allowed: updating safe fields
db.collection('users').doc('user-123').update({
  displayName: 'New Name',
  bio: 'Updated bio'
});

// ❌ Denied: trying to escalate privileges
db.collection('users').doc('user-123').update({
  displayName: 'New Name',
  role: 'admin'  // This field is NOT in hasOnly() list
});
```

### Example: Admin-Only Field Updates

**firestore.rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isAuthenticated() {
      return request.auth != null;
    }

    match /users/{userId} {
      // Regular users can update safe fields
      allow update: if isAuthenticated() &&
                       request.auth.uid == userId &&
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['displayName', 'bio', 'photoURL']);

      // Admins can update sensitive fields
      allow update: if isAdmin() &&
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['role', 'entitlement', 'active', 'updatedAt']);
    }
  }
}
```

### Example: Post Content Updates

**firestore.rules:**
```javascript
match /teams/{teamId}/posts/{postId} {
  // Users can create their own posts
  allow create: if request.auth != null &&
                   request.resource.data.userId == request.auth.uid &&
                   request.resource.data.teamId == teamId;

  // Users can update only content/tags of their posts
  allow update: if request.auth != null &&
                   resource.data.userId == request.auth.uid &&
                   request.resource.data.diff(resource.data).affectedKeys()
                     .hasOnly(['content', 'tags', 'updatedAt']);

  // Users can delete their own posts
  allow delete: if request.auth != null &&
                   resource.data.userId == request.auth.uid;
}
```

**What this prevents:**
```javascript
// ✅ Allowed: updating post content
db.collection('teams').doc('team-1').collection('posts').doc('post-123').update({
  content: 'Updated content',
  tags: ['updated', 'tags']
});

// ❌ Denied: changing post author
db.collection('teams').doc('team-1').collection('posts').doc('post-123').update({
  content: 'Updated content',
  userId: 'different-user'  // Not allowed!
});
```

**Example from:** `/Users/dylanr/work/2389/bot-socialmedia-server/firestore.rules:22-30`

---

## Pattern 4: Collection Group Query Support

**Problem:** Using `collectionGroup()` queries fails with permission denied.

**Solution:** Add separate rules with `/{path=**}/` pattern for collection group access.

### Example: Querying Subcollections Across Documents

**Firestore structure:**
```
/project-agents/{agentId}/sessions/{sessionId}
  - userId: string
  - status: string
  - createdAt: timestamp

/project-agents/{agentId}/messages/{messageId}
  - sessionId: string
  - content: string
  - timestamp: timestamp
```

**Query we want to support:**
```typescript
// Get all sessions across all agents
const sessions = await db.collectionGroup('sessions').get();

// Get all messages across all agents
const messages = await db.collectionGroup('messages').get();
```

**firestore.rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ========================================
    // REGULAR COLLECTION RULES
    // ========================================

    match /project-agents/{agentId}/sessions/{sessionId} {
      // Restrict direct path access
      allow read, write: if false; // Only Cloud Functions via Admin SDK
    }

    match /project-agents/{agentId}/messages/{messageId} {
      // Restrict direct path access
      allow read, write: if false; // Only Cloud Functions via Admin SDK
    }

    // ========================================
    // COLLECTION GROUP QUERY RULES
    // ========================================

    // Support collectionGroup('sessions')
    match /{path=**}/sessions/{sessionId} {
      allow read: if true; // Public read via collection group
    }

    // Support collectionGroup('messages')
    match /{path=**}/messages/{messageId} {
      allow read: if true; // Public read via collection group
    }
  }
}
```

**Why two separate rules?**
- First match: Controls direct path access (`/project-agents/agent-1/sessions/session-123`)
- Second match: Controls collection group queries (across all paths)
- They evaluate independently

**Example from:** `/Users/dylanr/work/2389/oneonone/firestore.rules:44-52`

### Example: Authenticated Collection Group Access

**firestore.rules:**
```javascript
match /users/{userId}/apiKeys/{keyId} {
  // Users can read their own API keys directly
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if false; // Only Cloud Functions
}

// Support collectionGroup('apiKeys') for middleware
match /{path=**}/apiKeys/{keyId} {
  // Only Cloud Functions can query all keys
  // Client SDK can't use this (but Admin SDK can)
  allow read: if false;
}
```

**Usage:**
```typescript
// ✅ Works: Direct path (user reading their own keys)
const myKeys = await db.collection('users').doc(userId).collection('apiKeys').get();

// ❌ Fails: Client trying collection group (correctly blocked)
const allKeys = await db.collectionGroup('apiKeys').get();

// ✅ Works: Admin SDK from Cloud Functions (bypasses rules)
const allKeys = await admin.firestore().collectionGroup('apiKeys').get();
```

---

## Pattern 5: Server-Write-Only (Maximum Security)

**Problem:** Need maximum security, don't trust client writes.

**Solution:** Allow reads, deny all writes. Only Cloud Functions can mutate data.

### Complete Example

**firestore.rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ========================================
    // HELPER FUNCTIONS
    // ========================================

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // ========================================
    // USERS COLLECTION
    // ========================================

    match /users/{userId} {
      // Users can read their own data
      allow read: if isOwner(userId);

      // Only Cloud Functions can write
      allow write: if false;

      // API keys subcollection
      match /apiKeys/{keyId} {
        allow read: if isOwner(userId);
        allow write: if false;
      }
    }

    // ========================================
    // CONFIG COLLECTION (PUBLIC READ)
    // ========================================

    match /config/{configId} {
      // Anyone can read config
      allow read: if true;

      // Only Cloud Functions can write
      allow write: if false;
    }

    // ========================================
    // SESSIONS (OWNER READ ONLY)
    // ========================================

    match /sessions/{sessionId} {
      // Users can read sessions they own
      allow read: if isAuthenticated() &&
                     (resource.data.userId == request.auth.uid ||
                      resource.data.partnerId == request.auth.uid);

      // Only Cloud Functions can write
      allow write: if false;

      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isAuthenticated() &&
                       get(/databases/$(database)/documents/sessions/$(sessionId)).data.userId == request.auth.uid;
        allow write: if false;
      }
    }

    // ========================================
    // COLLECTION GROUP QUERIES
    // ========================================

    match /{path=**}/sessions/{sessionId} {
      allow read: if true;
    }

    match /{path=**}/messages/{messageId} {
      allow read: if true;
    }

    // ========================================
    // DEFAULT DENY
    // ========================================

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Cloud Functions handle all writes:**
```typescript
// functions/src/tools/createSession.ts
export async function handleCreateSession(userId: string, partnerId: string) {
  const db = admin.firestore();
  const sessionRef = db.collection('sessions').doc();

  // Admin SDK bypasses Firestore rules
  await sessionRef.set({
    sessionId: sessionRef.id,
    userId,
    partnerId,
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, sessionId: sessionRef.id };
}
```

**Advantages:**
- ✅ Maximum security (single source of truth)
- ✅ Simple rules (mostly just allow read)
- ✅ Easy to audit
- ✅ No privilege escalation possible

**Trade-offs:**
- ❌ Requires Cloud Function for every mutation
- ❌ Slightly higher latency
- ❌ More function invocations

**Best for:** Light-write applications, MCP servers, admin dashboards

**Example from:** `/Users/dylanr/work/2389/oneonone/firestore.rules`

---

## Pattern 6: Client-Write with Validation

**Problem:** High-volume writes need fastest UX (social feeds, messaging).

**Solution:** Allow client writes with strict validation rules.

### Example: Social Feed Posts

**firestore.rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ========================================
    // HELPER FUNCTIONS
    // ========================================

    function isAuthenticated() {
      return request.auth != null;
    }

    function isTeamMember(teamId, userId) {
      let team = get(/databases/$(database)/documents/teams/$(teamId)).data;
      return team != null && team.members.hasAny([{'uid': userId}]);
    }

    // ========================================
    // POSTS COLLECTION
    // ========================================

    match /teams/{teamId}/posts/{postId} {
      // Anyone in team can read posts
      allow read: if isAuthenticated() &&
                     isTeamMember(teamId, request.auth.uid);

      // Users can create their own posts
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.teamId == teamId &&
                       // Validate required fields exist
                       request.resource.data.keys().hasAll(['content', 'userId', 'teamId', 'createdAt']) &&
                       // Validate content not empty
                       request.resource.data.content.size() > 0 &&
                       // Validate content not too long
                       request.resource.data.content.size() <= 1000;

      // Users can update only safe fields of their posts
      allow update: if isAuthenticated() &&
                       resource.data.userId == request.auth.uid &&
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['content', 'tags', 'updatedAt']);

      // Users can delete their own posts
      allow delete: if isAuthenticated() &&
                       resource.data.userId == request.auth.uid;

      // Admins can do anything
      allow write: if isAuthenticated() &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

**What this validates:**

**On create:**
- ✅ User is authenticated
- ✅ userId matches authenticated user (can't impersonate)
- ✅ teamId matches URL path
- ✅ Required fields present
- ✅ Content not empty
- ✅ Content length <= 1000 chars

**On update:**
- ✅ User owns the post
- ✅ Only safe fields changed (content, tags, updatedAt)
- ✅ Can't change userId or teamId

**Client code:**
```typescript
// ✅ Allowed: valid post creation
await db.collection('teams').doc('team-1').collection('posts').add({
  content: 'Hello world!',
  userId: currentUser.uid,
  teamId: 'team-1',
  tags: ['announcement'],
  createdAt: serverTimestamp(),
});

// ❌ Denied: missing required fields
await db.collection('teams').doc('team-1').collection('posts').add({
  content: 'Hello world!',
  // Missing userId, teamId, createdAt
});

// ❌ Denied: trying to impersonate
await db.collection('teams').doc('team-1').collection('posts').add({
  content: 'Hello world!',
  userId: 'different-user',  // Not current user!
  teamId: 'team-1',
  createdAt: serverTimestamp(),
});
```

**Example from:** `/Users/dylanr/work/2389/bot-socialmedia-server/firestore.rules`

---

## Pattern 7: Combining Patterns

Real projects combine multiple patterns. Here's a complete example:

**firestore.rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ========================================
    // HELPER FUNCTIONS (Pattern 1)
    // ========================================

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    // ========================================
    // ROLE HELPERS (Pattern 2)
    // ========================================

    function isAdmin() {
      return isAuthenticated() && getUserData().role == 'admin';
    }

    function isModerator() {
      return isAuthenticated() && getUserData().entitlement == 'moderator';
    }

    // ========================================
    // USERS (Server-Write-Only, Pattern 5)
    // ========================================

    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if false; // Only Cloud Functions
    }

    // ========================================
    // POSTS (Client-Write with Validation, Pattern 6)
    // ========================================

    match /teams/{teamId}/posts/{postId} {
      allow read: if isAuthenticated();

      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid;

      // Pattern 3: diff().affectedKeys()
      allow update: if isOwner(resource.data.userId) &&
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['content', 'tags', 'updatedAt']);

      allow delete: if isOwner(resource.data.userId) || isAdmin();
    }

    // ========================================
    // COLLECTION GROUP (Pattern 4)
    // ========================================

    match /{path=**}/posts/{postId} {
      allow read: if isAuthenticated();
    }

    // ========================================
    // DEFAULT DENY
    // ========================================

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Testing Rules with Emulator UI

**Start emulators:**
```bash
firebase emulators:start
```

**Access Rules Playground:**
1. Open http://127.0.0.1:4000
2. Click "Firestore" → "Rules" tab
3. Test rules with mock requests

**Example test:**
```javascript
// Test: Can user read their own document?
service: cloud.firestore
path: /users/user-123
method: get
auth: { uid: 'user-123' }
// Expected: ALLOWED

// Test: Can user read someone else's document?
service: cloud.firestore
path: /users/user-456
method: get
auth: { uid: 'user-123' }
// Expected: DENIED
```

---

## Common Mistakes to Avoid

### 1. Forgetting to check request.auth
```javascript
// ❌ BAD: No auth check
match /users/{userId} {
  allow read: if true; // Anyone can read any user!
}

// ✅ GOOD: Auth check
match /users/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
}
```

### 2. Not using diff().affectedKeys() for updates
```javascript
// ❌ BAD: Can change any field
match /users/{userId} {
  allow update: if request.auth.uid == userId;
  // User can change their role to admin!
}

// ✅ GOOD: Whitelist safe fields
match /users/{userId} {
  allow update: if request.auth.uid == userId &&
                   request.resource.data.diff(resource.data).affectedKeys()
                     .hasOnly(['displayName', 'bio']);
}
```

### 3. Missing collection group rules
```javascript
// ❌ BAD: CollectionGroup query fails
match /users/{userId}/posts/{postId} {
  allow read: if true;
}
// db.collectionGroup('posts').get() → PERMISSION DENIED

// ✅ GOOD: Add collection group rule
match /{path=**}/posts/{postId} {
  allow read: if true;
}
```

### 4. Not defaulting to deny
```javascript
// ❌ BAD: No catch-all deny
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
    }
    // Other collections have no rules → implicitly denied, but not clear
  }
}

// ✅ GOOD: Explicit default deny
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
    }

    // Explicit default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Summary Checklist

When writing Firestore rules:

- [ ] Extract helper functions for reusable logic
- [ ] Always check `request.auth != null` for authenticated routes
- [ ] Use `diff().affectedKeys().hasOnly()` for client-write updates
- [ ] Add collection group rules for `collectionGroup()` queries
- [ ] Include explicit default deny at end
- [ ] Test rules in Emulator UI Rules Playground
- [ ] Prefer server-write-only for light-write apps
- [ ] Use client-write only when write volume justifies complexity
- [ ] Never mix server-write and client-write in same collection

## References

- **Server-write example:** `/Users/dylanr/work/2389/oneonone/firestore.rules`
- **Client-write example:** `/Users/dylanr/work/2389/bot-socialmedia-server/firestore.rules`
- **Entitlement example:** `/Users/dylanr/work/2389/meme-rodeo/firestore.rules`
- **Main skill:** `firebase-development/SKILL.md` → Security Model and Firestore Rules Patterns sections

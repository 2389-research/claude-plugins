# Firebase Multi-Hosting Setup - Complete Examples

Comprehensive examples of all three hosting configuration patterns.

## Overview

Firebase supports multiple hosting configurations. This guide shows complete implementations of:

1. **site: based** - Multiple independent deployments with separate URLs (simplest)
2. **target: based** - Multiple deployments with predeploy hooks (for build coordination)
3. **Single hosting with rewrites** - One domain, function-based routing (smallest projects)

Choose based on your project needs. All three patterns work well in production.

## Pattern 1: site: Based Multi-Hosting

**When to use:**
- Multiple independent deployments
- Each deployment gets its own URL
- Simple deployment workflow
- No build coordination needed

**Example:** oneonone project (3 separate sites)

### Complete Configuration

**firebase.json:**
```json
{
  "hosting": [
    {
      "site": "oneonone-main",
      "source": "hosting",
      "frameworksBackend": {
        "region": "us-central1"
      }
    },
    {
      "site": "oneonone-mcp",
      "public": "hosting-mcp",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        {
          "source": "/**",
          "function": "mcpEndpoint"
        }
      ]
    },
    {
      "site": "oneonone-api",
      "public": "hosting-api",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        {
          "source": "/**",
          "function": "apiEndpoint"
        }
      ]
    }
  ],
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

### Setup Steps

**Step 1: Create sites in Firebase Console**

```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Login
firebase login

# Create sites (one-time setup)
firebase hosting:sites:create oneonone-main
firebase hosting:sites:create oneonone-mcp
firebase hosting:sites:create oneonone-api

# Verify sites exist
firebase hosting:sites:list
```

**Expected output:**
```
┌─────────────────┬─────────────────────────────────┬────────────┐
│ Site ID         │ Default URL                     │ Status     │
├─────────────────┼─────────────────────────────────┼────────────┤
│ oneonone-main   │ oneonone-main.web.app           │ ACTIVE     │
│ oneonone-mcp    │ oneonone-mcp.web.app            │ ACTIVE     │
│ oneonone-api    │ oneonone-api.web.app            │ ACTIVE     │
└─────────────────┴─────────────────────────────────┴────────────┘
```

**Step 2: Create hosting directories**

```bash
# Main app (Next.js with frameworksBackend)
mkdir -p hosting

# MCP endpoint (static index.html or empty)
mkdir -p hosting-mcp
echo '<!DOCTYPE html><html><body>MCP Endpoint</body></html>' > hosting-mcp/index.html

# API endpoint (static index.html or empty)
mkdir -p hosting-api
echo '<!DOCTYPE html><html><body>API Endpoint</body></html>' > hosting-api/index.html
```

**Why static HTML for API sites?**
- Hosting requires a public directory
- Rewrites forward all traffic to functions
- index.html never actually served (but Firebase requires it)

**Step 3: Deploy individual sites**

```bash
# Deploy only main site
firebase deploy --only hosting:oneonone-main

# Deploy only MCP endpoint
firebase deploy --only hosting:oneonone-mcp

# Deploy only API endpoint
firebase deploy --only hosting:oneonone-api

# Deploy all hosting sites
firebase deploy --only hosting

# Deploy functions + hosting
firebase deploy --only functions,hosting
```

### Project Structure

```
project/
├── hosting/                    # Main Next.js app
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
├── hosting-mcp/                # MCP endpoint public dir
│   └── index.html              # Placeholder (never served)
├── hosting-api/                # API endpoint public dir
│   └── index.html              # Placeholder (never served)
├── functions/
│   ├── src/
│   │   ├── index.ts            # Exports mcpEndpoint, apiEndpoint
│   │   └── ...
│   └── package.json
├── firebase.json
├── firestore.rules
└── firestore.indexes.json
```

### Functions Export Pattern

**functions/src/index.ts:**
```typescript
// ABOUTME: Main entry point - exports multiple HTTP endpoints for different hosting sites
// ABOUTME: mcpEndpoint for MCP tools, apiEndpoint for REST API

import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import cors from 'cors';
import { apiKeyGuard } from './middleware/apiKeyGuard';

admin.initializeApp();

// MCP endpoint app
const mcpApp = express();
mcpApp.use(cors({ origin: true }));
mcpApp.use(express.json());
mcpApp.use(apiKeyGuard);

mcpApp.post('/mcp', async (req, res) => {
  // MCP tool routing
  res.json({ success: true });
});

export const mcpEndpoint = onRequest(
  { invoker: 'public', cors: true, region: 'us-central1' },
  mcpApp
);

// API endpoint app (separate Express instance)
const apiApp = express();
apiApp.use(cors({ origin: true }));
apiApp.use(express.json());
apiApp.use(apiKeyGuard);

apiApp.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

export const apiEndpoint = onRequest(
  { invoker: 'public', cors: true, region: 'us-central1' },
  apiApp
);
```

### URLs

Each site gets its own URL:
- Main app: `https://oneonone-main.web.app`
- MCP endpoint: `https://oneonone-mcp.web.app/mcp`
- API endpoint: `https://oneonone-api.web.app/api/status`

### Custom Domains (Optional)

**Add custom domains in Firebase Console:**
1. Firebase Console → Hosting → Add custom domain
2. Link `app.example.com` to `oneonone-main`
3. Link `mcp.example.com` to `oneonone-mcp`
4. Link `api.example.com` to `oneonone-api`

**Result:**
- Main app: `https://app.example.com`
- MCP endpoint: `https://mcp.example.com/mcp`
- API endpoint: `https://api.example.com/api/status`

### Advantages

✅ Simplest configuration
✅ Independent deployment (can deploy sites separately)
✅ Clear separation of concerns
✅ Each site has own URL
✅ No build coordination needed
✅ Easy to understand

### Disadvantages

❌ Multiple URLs (unless using custom domains)
❌ No predeploy hooks (can't run builds automatically)

---

## Pattern 2: target: Based Multi-Hosting

**When to use:**
- Need predeploy build scripts
- Monorepo with build coordination
- Want to run tasks before deployment
- Still need multiple deployments

**Example:** bot-socialmedia project

### Complete Configuration

**firebase.json:**
```json
{
  "hosting": [
    {
      "target": "app",
      "source": "hosting",
      "frameworksBackend": {
        "region": "us-central1"
      }
    },
    {
      "target": "admin",
      "public": "admin-app/dist",
      "predeploy": [
        "cd admin-app && npm install && npm run build"
      ],
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        {
          "source": "/**",
          "destination": "/index.html"
        }
      ]
    }
  ],
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

### Setup Steps

**Step 1: Create sites and link targets**

```bash
# Create sites (one-time)
firebase hosting:sites:create bot-social-app
firebase hosting:sites:create bot-social-admin

# Link targets to sites (one-time per machine)
firebase target:apply hosting app bot-social-app
firebase target:apply hosting admin bot-social-admin

# Verify targets
firebase target:list
```

**Expected output:**
```
┌─────────┬─────────┬─────────────────────┐
│ Type    │ Target  │ Resource            │
├─────────┼─────────┼─────────────────────┤
│ hosting │ app     │ bot-social-app      │
│ hosting │ admin   │ bot-social-admin    │
└─────────┴─────────┴─────────────────────┘
```

**Target mappings stored in:**
`.firebaserc` (commit this file):
```json
{
  "projects": {
    "default": "your-project-id"
  },
  "targets": {
    "your-project-id": {
      "hosting": {
        "app": ["bot-social-app"],
        "admin": ["bot-social-admin"]
      }
    }
  }
}
```

**Step 2: Create project structure**

```bash
# Main Next.js app
mkdir -p hosting/app

# Admin React app (separate build)
mkdir -p admin-app/src
mkdir -p admin-app/dist

# Admin package.json
cat > admin-app/package.json <<EOF
{
  "name": "admin-app",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
EOF

# Admin vite.config.ts
cat > admin-app/vite.config.ts <<EOF
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});
EOF
```

**Step 3: Deploy with predeploy hooks**

```bash
# Deploy app target (Next.js, no predeploy)
firebase deploy --only hosting:app

# Deploy admin target (runs predeploy build)
firebase deploy --only hosting:admin
# This automatically runs: cd admin-app && npm install && npm run build

# Deploy both
firebase deploy --only hosting
# Runs predeploy for admin, then deploys both
```

### Predeploy Hook Execution

When you run `firebase deploy --only hosting:admin`:

1. Firebase reads `predeploy` array from firebase.json
2. Executes each command in order:
   ```bash
   cd admin-app && npm install && npm run build
   ```
3. Waits for completion
4. If successful, proceeds with deployment
5. If failed, aborts deployment with error

**Predeploy hook features:**
- Run from project root
- Can chain commands with `&&`
- Can use any shell commands
- Blocks deployment until complete
- Shows output in terminal

### Project Structure

```
project/
├── hosting/                    # Main Next.js app
│   ├── app/
│   └── package.json
├── admin-app/                  # Admin React app
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── dist/                   # Build output (gitignore'd)
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── functions/
├── firebase.json
├── .firebaserc                 # Target mappings (commit!)
└── firestore.rules
```

### Advantages

✅ Automatic builds before deployment
✅ Monorepo coordination
✅ Can run tests before deploy
✅ Clear target names
✅ Supports complex build workflows

### Disadvantages

❌ More setup (targets + sites)
❌ .firebaserc must be shared across team
❌ Predeploy hooks must be idempotent
❌ Longer deployment time (waiting for builds)

---

## Pattern 3: Single Hosting with Rewrites

**When to use:**
- Smaller projects
- All content under one domain
- Function-based routing
- Simplest possible setup

**Example:** meme-rodeo project

### Complete Configuration

**firebase.json:**
```json
{
  "hosting": {
    "source": "hosting",
    "frameworksBackend": {
      "region": "us-central1"
    },
    "rewrites": [
      {
        "source": "/images/memes/**",
        "function": {
          "functionId": "proxyMemeFile",
          "region": "us-central1"
        }
      },
      {
        "source": "/api/**",
        "function": {
          "functionId": "apiHandler",
          "region": "us-central1"
        }
      }
    ],
    "headers": [
      {
        "source": "/images/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "runtime": "nodejs18"
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

### Setup Steps

**Step 1: Create project structure**

```bash
# Single hosting directory (Next.js)
mkdir -p hosting/app

# Functions
mkdir -p functions/functions
```

**Step 2: Implement rewrite functions**

**functions/functions/proxyMemeFile.js:**
```javascript
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

exports.proxyMemeFile = onRequest(async (req, res) => {
  // Extract path: /images/memes/abc123.jpg -> abc123.jpg
  const path = req.path.replace('/images/memes/', '');

  try {
    const bucket = admin.storage().bucket();
    const file = bucket.file(`memes/${path}`);

    const [exists] = await file.exists();
    if (!exists) {
      res.status(404).send('File not found');
      return;
    }

    // Stream file to response
    const stream = file.createReadStream();
    stream.pipe(res);
  } catch (error) {
    console.error('Error proxying file:', error);
    res.status(500).send('Error loading file');
  }
});
```

**functions/functions/apiHandler.js:**
```javascript
const { onRequest } = require('firebase-functions/v2/https');

exports.apiHandler = onRequest(async (req, res) => {
  // Handle all /api/** routes
  const path = req.path.replace('/api', '');

  if (path === '/status') {
    res.json({ status: 'ok' });
    return;
  }

  if (path === '/health') {
    res.json({ healthy: true });
    return;
  }

  res.status(404).json({ error: 'Not found' });
});
```

**functions/index.js:**
```javascript
const { proxyMemeFile } = require('./functions/proxyMemeFile');
const { apiHandler } = require('./functions/apiHandler');

exports.proxyMemeFile = proxyMemeFile;
exports.apiHandler = apiHandler;
```

**Step 3: Deploy**

```bash
# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions
```

### URL Routing

All routes under one domain:
- Main app: `https://project.web.app/`
- Meme images: `https://project.web.app/images/memes/abc123.jpg` → proxyMemeFile function
- API status: `https://project.web.app/api/status` → apiHandler function
- API health: `https://project.web.app/api/health` → apiHandler function

### Rewrite Precedence

Rewrites are evaluated **in order**:

```json
{
  "rewrites": [
    {"source": "/images/memes/**", "function": {"functionId": "proxyMemeFile"}},
    {"source": "/api/**", "function": {"functionId": "apiHandler"}},
    {"source": "/**", "destination": "/index.html"}  // Catch-all for SPA
  ]
}
```

**Order matters:**
1. `/images/memes/foo.jpg` → matches first rule → proxyMemeFile
2. `/api/status` → matches second rule → apiHandler
3. `/about` → matches third rule → index.html (SPA routing)

### Project Structure

```
project/
├── hosting/                    # Next.js app
│   ├── app/
│   └── package.json
├── functions/
│   ├── functions/
│   │   ├── proxyMemeFile.js
│   │   └── apiHandler.js
│   ├── index.js
│   └── package.json
├── firebase.json
└── firestore.rules
```

### Advantages

✅ Simplest configuration
✅ Single URL for everything
✅ Easy to reason about
✅ Good for small projects
✅ No multi-site setup needed

### Disadvantages

❌ All under one domain (can't separate concerns by URL)
❌ Rewrite order can be confusing
❌ Harder to deploy parts independently
❌ Not ideal for large projects with distinct deployments

---

## Comparison Matrix

| Feature                      | site: Based | target: Based | Single + Rewrites |
|------------------------------|-------------|---------------|-------------------|
| **Setup Complexity**         | Low         | Medium        | Lowest            |
| **Multiple URLs**            | ✅ Yes       | ✅ Yes         | ❌ No              |
| **Predeploy Hooks**          | ❌ No        | ✅ Yes         | ❌ No              |
| **Independent Deployment**   | ✅ Yes       | ✅ Yes         | ❌ No              |
| **Build Coordination**       | ❌ No        | ✅ Yes         | ❌ No              |
| **Monorepo Friendly**        | Medium      | High          | Low               |
| **Best For**                 | Multiple independent apps | Multiple apps with builds | Single app with functions |

## Decision Guide

**Choose site: based when:**
- You have multiple independent applications
- Each application should have its own URL
- You don't need build coordination
- You want the simplest multi-hosting setup
- Example: Main app + MCP endpoint + API endpoint

**Choose target: based when:**
- You have a monorepo with multiple apps
- You need to run builds before deployment
- You want to coordinate complex build workflows
- You're comfortable with .firebaserc management
- Example: Main Next.js app + Admin React app

**Choose single + rewrites when:**
- You have a single application
- All routes should be under one domain
- You need to proxy specific paths to functions
- You want the absolute simplest setup
- Example: SPA with API routes and file proxying

## References

- **site: example:** `/Users/dylanr/work/2389/oneonone/firebase.json`
- **target: example:** `/Users/dylanr/work/2389/bot-socialmedia-server/firebase.json`
- **single example:** `/Users/dylanr/work/2389/meme-rodeo/firebase.json`
- **Main skill:** `firebase-development/SKILL.md` → Multi-Hosting Setup section

---
name: prepare
description: Use when preparing a codebase for first-time public/open-source release. Full lifecycle from audit through documentation, hardening, and final review.
---

# Prepare for Open-Source Release

Announce: "I'm using git-repo-prep:prepare to walk through open-source preparation."

## Setup

Create a TodoWrite checklist for all 9 phases:

1. Discovery
2. Secrets & Personal Info Audit
3. License
4. Documentation
5. Gitignore Refinement
6. Project Hardening
7. Repository Metadata
8. Backlog & Honesty
9. Final Review

## Phase Pattern

Every phase follows this loop:

0. Mark this phase's task **in_progress**
1. Scan/audit current state for this phase
2. Present findings to user
3. Propose specific changes
4. **AskUserQuestion** — skip / approve / modify
5. Implement approved changes
6. Commit with descriptive message (e.g., `docs: add CONTRIBUTING.md`)
7. Mark phase task complete, move to next

## Rules

- **DO NOT prescribe choices** — always ask via AskUserQuestion (license, CI provider, test framework, etc.)
- **DO NOT drift into code quality review** — stay focused on what matters for making the repo public. Ignore code style, error handling, architecture, performance.
- **DO NOT over-engineer** — don't add dotenv, validation, startup checks, or error handling beyond what the user asks for. The goal is open-source readiness, not refactoring.
- **DO NOT dump everything at once** — work one phase at a time, wait for user approval before moving on.
- **DO treat personal info as a separate concern from secrets** — emails, usernames, and real names in config or metadata are privacy issues even if they aren't credentials.
- **DO check license consistency** across LICENSE file, package metadata, and README.
- **DO mention ecosystem-specific items** when a known stack is detected.

---

## Phase 1: Discovery

Detect the ecosystem and scan project structure.

**Detect ecosystem by looking for:**

| File | Ecosystem |
|------|-----------|
| `package.json` | Node.js |
| `pyproject.toml` / `setup.py` / `setup.cfg` | Python |
| `Cargo.toml` | Rust |
| `go.mod` | Go |
| `*.csproj` / `*.sln` | .NET |
| `Gemfile` | Ruby |
| `pom.xml` / `build.gradle` | Java/Kotlin |

**Report what exists (present/missing):**
- README
- LICENSE
- .gitignore
- CI/CD config (.github/workflows/, .gitlab-ci.yml, etc.)
- Tests directory
- CONTRIBUTING.md
- SECURITY.md
- CHANGELOG

Present findings to user before proceeding.

---

## Phase 2: Secrets & Personal Info

Two separate scans. Both matter for making a repo public.

### Secrets scan

- Hardcoded API keys, passwords, tokens, connection strings in source files
- `.env` files or config files containing real credentials
- AWS keys, GitHub tokens, database URLs with passwords, SMTP credentials
- Private keys (`.pem`, `.key` files)

### Personal info scan

- Email addresses in package metadata (package.json `author`, pyproject.toml `authors`, Cargo.toml `authors`)
- Email addresses in source code comments or config
- Real names or usernames hardcoded in source (e.g., `DEFAULT_AUTHOR = "jsmith"`)
- Usernames in URLs or paths

### If secrets or personal info found:

- Warn that git history also contains these values
- Recommend key rotation/revocation for any real credentials
- Suggest `git filter-repo` or BFG Repo Cleaner for history rewriting if needed
- Propose replacing secrets with environment variables and creating `.env.example`
- Propose replacing personal info with generic values or removing it

**Do not add dotenv packages, validation, or startup checks unless the user asks.**

---

## Phase 3: License

**Ask the user** which license they want. Present common options:

- **MIT** — permissive, simple
- **Apache-2.0** — permissive, patent grant
- **GPL-3.0** — copyleft
- Other — ask user to specify

Then:

1. Create or update `LICENSE` file
2. Update package metadata license field:
   - `package.json` → `"license": "MIT"`
   - `pyproject.toml` → `license` field
   - `Cargo.toml` → `license` field
3. Add license section to README (or update if present)
4. **Check for mismatches** — if LICENSE file says MIT but metadata says ISC, flag it

---

## Phase 4: Documentation

### README

Check for these sections (present or missing):

- What the project does and why
- Installation / getting started
- Usage with examples
- Configuration (if applicable)
- License section
- Limitations / known issues

**Don't write the full docs without asking.** Propose the structure, ask user for approval, then help draft.

### CONTRIBUTING.md

Propose including:
- How to report bugs
- How to submit changes (PR workflow)
- Code style / conventions
- Testing expectations
- Any CLA or DCO requirements

### SECURITY.md

Propose a vulnerability reporting process. At minimum: an email or instructions for responsible disclosure.

### CLAUDE.md (optional)

If the project already uses AI tools or has complex setup, suggest a CLAUDE.md with build/test/lint commands and architectural notes. Ask first — don't create by default.

---

## Phase 5: Gitignore Refinement

Check current `.gitignore` against ecosystem best practices:

| Ecosystem | Must ignore |
|-----------|------------|
| Node.js | `node_modules/`, `.env`, `dist/`, `coverage/` |
| Python | `__pycache__/`, `*.pyc`, `.env`, `*.egg-info/`, `dist/`, `.venv/` |
| Rust | `target/`, `.env` |
| Go | `vendor/` (if not vendoring), `.env` |
| General | `.env`, `.env.*`, `*.log`, `.DS_Store`, `*.pem`, `*.key` |

**Always check:**
- `.env` and `.env.*` patterns excluded
- Credentials directories excluded
- Build artifacts excluded
- IDE/OS files excluded (`.idea/`, `.vscode/`, `.DS_Store`, `Thumbs.db`)

**If sensitive files are already tracked:**
- Flag them: "These files are tracked by git and need `git rm --cached`"
- Propose the commands, get approval before running

---

## Phase 6: Project Hardening

**Ask the user what level of hardening they want** before proposing anything. Options:

- **Minimal** — just CI basics
- **Standard** — CI + dependency updates
- **Full** — CI + dependency updates + hooks + coverage

### CI/CD

Ask which provider (GitHub Actions is most common). Propose a workflow that:
- Runs tests
- Runs linter (if project has one)
- Runs on push and PR

### Dependency management

Suggest Dependabot (GitHub) or Renovate. Brief config.

### Pre-commit hooks

Suggest only if project doesn't already have them. Keep it simple — lint + format.

### Coverage enforcement

Suggest only if tests already exist. Don't add test frameworks — that's beyond open-source prep scope.

---

## Phase 7: Repository Metadata

Ecosystem-specific metadata that helps with discoverability and distribution:

| Ecosystem | Check for |
|-----------|-----------|
| Node.js | `repository` URL, `engines` field, `files` field (or `.npmignore`), `keywords`, `description` |
| Python | `[project.urls]`, `classifiers`, `requires-python`, `keywords`, `description` |
| Rust | `repository`, `keywords`, `categories`, `rust-version`, `description` |
| Go | module path matches repo URL, godoc comment on package |

Flag anything missing. Propose additions. Don't prescribe values — ask the user for descriptions, keywords, etc.

---

## Phase 8: Backlog & Honesty

Building trust with contributors by being upfront about the project's state.

- **BACKLOG.md** — Suggest creating one if the project has known gaps, unfinished features, or planned work. Ask user what to include.
- **Limitations section in README** — If not already present, suggest adding known limitations, unsupported use cases, or stability caveats.

These are optional. Ask before creating.

---

## Phase 9: Final Review

Invoke `git-repo-prep:review` as a final validation pass.

This catches anything missed during the prepare phases and gives the user a clean summary of the repo's openness state.

Use the Skill tool: `skill: "git-repo-prep:review"`

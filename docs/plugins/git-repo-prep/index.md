# git-repo-prep

> Prepare codebases for public/open-source release and audit them for openness - full lifecycle prep or standalone review

- **Version:** 1.0.0
- **Source:** https://github.com/2389-research/git-repo-prep
- **Install:** `/plugin install 2389-research/git-repo-prep`

## Install via marketplace

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install 2389-research/git-repo-prep
```

## README

# git-repo-prep

Prepare codebases for public/open-source release and audit them for openness.

## Installation

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install git-repo-prep@2389-research
```

## What This Plugin Does

Two modes:

**Prepare** — Full lifecycle walking through 9 phases interactively:
1. Discovery (detect ecosystem, scan structure)
2. Secrets & personal info audit
3. License selection and consistency
4. Documentation (README, CONTRIBUTING, SECURITY)
5. Gitignore refinement
6. Project hardening (CI/CD, dependabot, hooks)
7. Repository metadata
8. Backlog & honesty
9. Final review

**Review** — Standalone openness audit, re-runnable anytime. Scans for secrets, personal info, license issues, missing docs, gitignore gaps, CI/CD, and metadata. Presents findings by severity (critical/recommended/nice-to-have) and offers to fix each issue.

## Usage

```
"Prepare this repo for open-source release"    → full lifecycle
"Review this repo for openness"                → standalone audit
```

## Ecosystem Support

Agnostic core with specific hints for Node.js, Python, Rust, Go, .NET, Ruby, and Java/Kotlin.

## Skills

| Skill | Description |
|-------|-------------|
| `git-repo-prep` | Router — detects intent, dispatches |
| `git-repo-prep:prepare` | Full 9-phase open-source prep lifecycle |
| `git-repo-prep:review` | Standalone openness audit |

---

If Git Repo Prep caught something before you went public, a ⭐ helps us know it's landing.

Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)


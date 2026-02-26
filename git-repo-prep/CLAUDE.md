# git-repo-prep

## Overview

Plugin with two skills for open-source readiness: `prepare` (full lifecycle) and `review` (standalone audit). Router in `skills/SKILL.md` dispatches based on user intent.

## Skills Included

### Main Skill: git-repo-prep

Routes to specific sub-skills based on context:
- Preparing for release → `git-repo-prep:prepare`
- Reviewing/auditing → `git-repo-prep:review`
- Ambiguous → AskUserQuestion to clarify

### Sub-Skills

- **git-repo-prep:prepare** — 9-phase interactive workflow (discovery, secrets, license, docs, gitignore, hardening, metadata, backlog, final review). Each phase: scan → present → propose → approve → implement → commit.
- **git-repo-prep:review** — Category-by-category audit with severity table (Critical/Recommended/Nice-to-have). Conversational output, offers to fix each issue.

**When to invoke:**
- Making a private repo public
- Preparing a project for open-source release
- Auditing a repo for secrets, missing docs, or openness gaps
- Re-checking after making changes (review mode)

## Patterns

### Core Philosophy

- **Ask, don't prescribe** — License choice, CI provider, hardening level all go through AskUserQuestion
- **Personal info ≠ secrets** — Emails, usernames, and real names are privacy issues separate from credential exposure
- **License consistency** — Check all three locations: LICENSE file, package metadata, README section
- **Openness focus** — Stay on topic; no code quality, architecture, or performance review
- **Phase-by-phase** — Never dump everything at once; work interactively one phase at a time

### Ecosystem Awareness

| Indicator | Ecosystem |
|-----------|-----------|
| `package.json` | Node.js |
| `pyproject.toml` | Python |
| `Cargo.toml` | Rust |
| `go.mod` | Go |
| `*.csproj` / `*.sln` | .NET |
| `Gemfile` | Ruby |
| `pom.xml` / `build.gradle` | Java/Kotlin |

Core checklist is universal. Ecosystem-specific hints (files field, classifiers, engine requirements) added when a known stack is detected.

## Development Workflow

Skills were developed using TDD for documentation:
1. Baseline tests (pressure scenarios without skill)
2. Document failures (what agents miss without guidance)
3. Write skill addressing specific failures
4. Test with skill (verify improvement)
5. Close loopholes (severity drift, missing categories)

Test scenarios and results are in the companion development repo (`skills-dev/git-repo-prep/tests/`).

# sift

> Read-only whole-codebase audit for material simplifications in structure, state, control flow, algorithms, lifecycle, and ownership boundaries

- **Version:** 1.2.0
- **Source:** https://github.com/2389-research/sift

## Install

Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

```
npx skills add 2389-research/sift
```

Or natively in Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install sift@2389-research
```

## README

# SIFT Codebase Audit Agent Skill

A portable Agent Skill for **SIFT — Structural Inspection for Technical Simplification**: a complete, read-only codebase audit focused on material simplifications in data structures, state representation, algorithms, control flow, schemas, lifecycle/concurrency, and ownership.

The skill creates a coverage contract, partitions the repository into non-overlapping subsystem reviews, validates every finding, rejects abstraction churn, audits its own coverage, and returns a prioritized implementation plan. It does not edit the repository or run tests; its only write is the final report artifact, `docs/sift-audit-<date>.md` by default.

## Install

```sh
npx skills add 2389-research/sift
```

This installs the skill project-local for the agents it detects. Add `-g` for a user-wide install.

### Manual install

Clone and copy. The installed directory must be named `sift-codebase-audit` to match the skill's `name` field:

```sh
git clone https://github.com/2389-research/sift.git
cp -R sift ~/.claude/skills/sift-codebase-audit
```

## Invoke

```text
/sift-codebase-audit
```

Or ask naturally:

```text
Run SIFT on the complete repository. Exclude vendored dependencies and generated output.
```

The skill defaults to the current repository and whole-application coverage unless the request states a narrower scope.

## Package contents

```text
sift-codebase-audit/
├── SKILL.md
├── README.md
├── LICENSE
└── references/
    ├── finding-schema.md
    ├── report-template.md
    └── worker-brief.md
```

## License

MIT — see [LICENSE](LICENSE).


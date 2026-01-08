# Skill Quality Remediation Plan

**Date:** 2025-01-08
**Status:** In Progress

## Overview

Systematic fix of skill quality issues across 13 plugins (28 skills) in the 2389 marketplace.

## Review Results

| Rating | Count | Plugins |
|--------|-------|---------|
| PASS | 4 | binary-re, documentation-audit, terminal-title, test-kitchen (partial) |
| NEEDS IMPROVEMENT | 8 | building-multiagent-systems, ceo-personal-os, css-development, fresh-eyes-review, remote-system-maintenance, scenario-testing, worldview-synthesis, xtool |
| NEEDS MAJOR REVISION | 1 | firebase-development |

## Ground Rules

- **Structure only** - no content improvements, no new features
- Each plugin gets: extraction pass → compliance pass → verification
- Sign-off checklist before marking complete
- Word count targets: ~2,500 for main skills, ~2,000 for sub-skills

## Phase 1: Heavy Restructuring

### 1.1 firebase-development
- **Current:** 36k words total (main skill 11,800)
- **Target:** ~12k words total
- **Work:**
  - Extract code templates to references/ for each sub-skill
  - Create canonical reference files (no duplication)
  - Fix all 5 descriptions to third-person format

**Target structure:**
```
skills/
├── SKILL.md (~2,500 words)
├── references/
│   ├── hosting-patterns.md
│   ├── auth-patterns.md
│   ├── functions-architecture.md
│   └── security-model.md
├── add-feature/
│   ├── SKILL.md (~2,000 words)
│   └── references/code-templates.md
├── debug/
│   ├── SKILL.md (~2,000 words)
│   └── references/common-commands.md
├── project-setup/
│   ├── SKILL.md (~2,000 words)
│   └── references/config-templates.md
└── validate/
    ├── SKILL.md (~2,000 words)
    └── references/validation-checklists.md
```

### 1.2 ceo-personal-os
- **Current:** 5,367 words
- **Target:** ~2,500 words (SKILL.md) + references
- **Work:**
  - Split 10 frameworks into references/frameworks/
  - Split interview scripts into references/interviews/
  - Fix description

**Target structure:**
```
skills/
├── SKILL.md (~1,500 words)
└── references/
    ├── frameworks/
    │   ├── gustin-annual-review.md
    │   ├── ferriss-lifestyle-costing.md
    │   ├── robbins-vivid-vision.md
    │   ├── lieberman-life-map.md
    │   ├── campbell-coaching.md
    │   ├── eisenmann-failure-patterns.md
    │   ├── collins-good-to-great.md
    │   ├── martell-buyback-time.md
    │   ├── gerber-emyth.md
    │   └── blank-customer-development.md
    └── interviews/
        └── interview-scripts.md
```

### 1.3 building-multiagent-systems
- **Current:** 4,800 words
- **Target:** ~2,500 words + references
- **Work:**
  - Extract MAKER pattern to references/
  - Extract coordination patterns to references/
  - Fix description

**Target structure:**
```
skills/
├── SKILL.md (~2,500 words)
└── references/
    ├── coordination-patterns.md
    ├── maker-pattern.md
    ├── tool-coordination.md
    └── production-hardening.md
```

## Phase 2: Medium Fixes

| Order | Plugin | Work |
|-------|--------|------|
| 2.1 | fresh-eyes-review | Add detail (~430 → ~1,200 words), add checklists |
| 2.2 | css-development | Fix 4 descriptions to third-person + triggers |
| 2.3 | test-kitchen | Trim omakase-off (<3k), fix descriptions |
| 2.4 | worldview-synthesis | Fix description format |
| 2.5 | xtool | Fix description format |

## Phase 3: Quick Fixes

| Order | Plugin | Work |
|-------|--------|------|
| 3.1 | binary-re | Fix `binary-re-X` → `binary-re:X` notation |
| 3.2 | remote-system-maintenance | Fix description to third-person |
| 3.3 | scenario-testing | Fix description to third-person |
| 3.4 | documentation-audit | Add trigger phrases to description |
| 3.5 | terminal-title | Minor style consistency |

## Verification Checklist (per plugin)

- [ ] All descriptions third-person with trigger phrases
- [ ] No SKILL.md exceeds 3,000 words
- [ ] References/ created where needed
- [ ] No broken internal links
- [ ] Git commit with clear message

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Link rot from file moves | Grep/replace pass after extraction |
| Duplicated content | Single canonical reference files |
| Scope creep | Explicit "structure only" rule |
| Review fatigue | Rotate reviewers for Phase 3 |

## Progress Tracking

### Phase 1
- [ ] 1.1 firebase-development
- [ ] 1.2 ceo-personal-os
- [ ] 1.3 building-multiagent-systems

### Phase 2
- [ ] 2.1 fresh-eyes-review
- [ ] 2.2 css-development
- [ ] 2.3 test-kitchen
- [ ] 2.4 worldview-synthesis
- [ ] 2.5 xtool

### Phase 3
- [ ] 3.1 binary-re
- [ ] 3.2 remote-system-maintenance
- [ ] 3.3 scenario-testing
- [ ] 3.4 documentation-audit
- [ ] 3.5 terminal-title

# Tier 2 + Tier 3 Batch Plan — Lightweight Basics

> Goal: Get all remaining repos to minimum viable state. No launch campaigns. Scriptable where possible.

## Tier 2: Utility Plugins (README polish + basics)

These solve real problems but don't have standalone stories. They ride the halo of Tier 1 plugins.

| # | Repo | Stars | Has License | Needs README Work |
|---|------|-------|-------------|-------------------|
| 1 | speed-run | 0 | No | Minor — strong README, just add CTA + marketplace step |
| 2 | fresh-eyes-review | 2 | No | Moderate — underselling itself, best section buried |
| 3 | scenario-testing | 0 | No | Minor — add CTA + marketplace step |
| 4 | documentation-audit | 0 | No | Minor — add CTA + marketplace step |
| 5 | prbuddy | 0 | No | Minor — add CTA + marketplace step |
| 6 | git-repo-prep | 0 | No | Minor — add CTA + marketplace step |
| 7 | css-development | 0 | No | Minor — add CTA + marketplace step |
| 8 | firebase-development | 1 | No | Minor — add CTA + marketplace step |
| 9 | terminal-title | 0 | No | Minor — add CTA + marketplace step |
| 10 | slack-mcp | 0 | No | Minor — add CTA + marketplace step |
| 11 | remote-system-maintenance | 0 | No | Minor — add CTA + marketplace step |
| 12 | landing-page-design | 0 | No | Minor — add CTA + marketplace step |
| 13 | xtool | 0 | No | Minor — add CTA + marketplace step |

### Per-repo checklist (Tier 2)

1. Add MIT license (same text for all)
2. Add GitHub topics: `claude-code`, `ai-agents`, `automation` (on top of existing)
3. Set homepage URL → marketplace plugin page: `https://2389-research.github.io/claude-plugins/#plugin-name`
4. README: Add marketplace install step before plugin install command
5. README: Add star CTA at bottom (tailored verb per plugin)
6. README: Add attribution footer: `Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)`

### Star CTAs (pre-written, tailored per plugin)

| Repo | CTA |
|------|-----|
| speed-run | "If Speed Run saved you tokens and time, a star helps us know it's landing." |
| fresh-eyes-review | "If Fresh Eyes caught something your tests didn't, a star helps us know it's landing." |
| scenario-testing | "If real-dependency testing saved you from a mock-induced false positive, a star helps us know it's landing." |
| documentation-audit | "If Documentation Audit caught a lie in your docs, a star helps us know it's landing." |
| prbuddy | "If PRBuddy got your PR to green faster, a star helps us know it's landing." |
| git-repo-prep | "If Git Repo Prep caught something before you went public, a star helps us know it's landing." |
| css-development | "If these CSS workflows saved you from fighting Tailwind, a star helps us know it's landing." |
| firebase-development | "If these Firebase workflows saved you from emulator hell, a star helps us know it's landing." |
| terminal-title | "If Terminal Title helps you keep track of 12 open sessions, a star helps us know it's landing." |
| slack-mcp | "If Slack MCP saved you from context-switching out of your terminal, a star helps us know it's landing." |
| remote-system-maintenance | "If this saved you from SSH guesswork, a star helps us know it's landing." |
| landing-page-design | "If this helped you ship a page that doesn't look like every other AI-generated landing page, a star helps us know it's landing." |
| xtool | "If xtool freed you from Xcode, a star helps us know it's landing." |

### Special note: fresh-eyes-review

DX committee member flagged this one: "The 'resistance patterns to reject' section is the most interesting part and it's buried at the bottom." Consider moving the resistance patterns higher — that's the hook that differentiates it from generic code review.

---

## Tier 3: Internal / Hard to Position (basics only)

These are internally valuable but don't have an obvious external audience. No promotion. Just minimum viable open-source hygiene.

| # | Repo | Stars | Action |
|---|------|-------|--------|
| 1 | ceo-personal-os | 0 | License + topics only |
| 2 | worldview-synthesis | 0 | License + topics only |
| 3 | gtm-partner | 0 | License + topics only |
| 4 | product-launcher | 2 | License + topics only |
| 5 | summarize-meetings | 2 | Already done ✓ |
| 6 | better-dev (meta) | 0 | License + topics only |
| 7 | botboard-biz (meta) | 0 | License + topics only |
| 8 | sysadmin (meta) | 0 | License + topics only |

### Per-repo checklist (Tier 3)

1. Add MIT license
2. Add GitHub topics: `claude-code`, `ai-agents`, `automation`
3. Set homepage URL → marketplace page
4. That's it. No README changes. No CTA. No campaigns.

---

## Batch Execution Script

```bash
#!/bin/bash
# Run from the monorepo root after committing LICENSE files

ALL_REPOS="simmer deliberation test-kitchen binary-re review-squad speed-run fresh-eyes-review scenario-testing documentation-audit prbuddy git-repo-prep css-development firebase-development terminal-title slack-mcp remote-system-maintenance landing-page-design xtool ceo-personal-os worldview-synthesis gtm-partner product-launcher better-dev botboard-biz sysadmin"

MARKETPLACE_URL="https://2389-research.github.io/claude-plugins"

for repo in $ALL_REPOS; do
  echo "Processing $repo..."

  # Add shared topics
  gh repo edit "2389-research/$repo" \
    --add-topic claude-code \
    --add-topic ai-agents \
    --add-topic automation

  # Set homepage to marketplace (override later for Tier 1 with blog posts)
  gh repo edit "2389-research/$repo" \
    --homepage "$MARKETPLACE_URL"

  echo "Done: $repo"
done

# Tier 1 homepage overrides (blog posts)
gh repo edit 2389-research/simmer --homepage "https://2389.ai/posts/simmer-skill/"
gh repo edit 2389-research/deliberation --homepage "https://2389.ai/posts/deliberation-perspectives-not-answers/"
gh repo edit 2389-research/test-kitchen --homepage "https://2389.ai/posts/cookoff-same-spec-different-code/"
```

## Execution Order

1. Run batch script (topics + homepage for all 25 repos) — 5 minutes
2. Add MIT license to all 25 repos — scriptable, 10 minutes
3. Tier 1 README rewrites (per tier1-repo-plans.md) — manual, do simmer first
4. Tier 2 README additions (CTA + marketplace step + backlink) — semi-scriptable, 30 minutes
5. Tier 3 — already done after steps 1-2

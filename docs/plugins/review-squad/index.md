# review-squad

> Multi-angle project review covering expert audits, visitor comprehension testing, task-completion smoke tests, and adversarial nitpick passes.

- **Version:** 1.0.0
- **Source:** https://github.com/2389-research/review-squad

## Install

Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

```
npx skills add 2389-research/review-squad
```

Or natively in Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install review-squad@2389-research
```

## README

# Review Squad

Your project is about to ship. Instead of one reviewer catching what they catch, Review Squad dispatches a panel — security analyst, UX critic, performance specialist, pedantic nitpicker — each doing deep parallel analysis and reporting back.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install review-squad@2389-research
```

## Skills

| Skill | What it does | When to use it |
|-------|-------------|----------------|
| `review-squad:experts` | Expert audit panel (SEO, a11y, security, perf, etc.) | Before launch — catch what you missed |
| `review-squad:normies` | First-time visitors across a sophistication spectrum | When you can't tell if your site makes sense to outsiders |
| `review-squad:regulars` | Task-oriented users verifying real flows work | Smoke test signup, checkout, search — the flows that matter |
| `review-squad:well-actually` | Pedantic nitpickers finding what pros skip | Before posting to HN — find the nits before they do |

## Quick Examples

**Expert audit before launch:**
```
User: "Run a review-squad:experts audit on my site before we go live"

Claude: I'd suggest this panel for your site:
- Security analyst — auth flows, data handling, headers
- Performance specialist — load times, bundle size, caching
- SEO reviewer — meta tags, structured data, crawlability
- Accessibility auditor — screen readers, contrast, keyboard nav

Approve this panel, or swap anyone out?

[After approval, 4 agents dispatch in parallel]
[Each returns a focused report with specific findings]
[Consolidated into a single prioritized action list]
```

**First impressions check:**
```
User: "Use review-squad:normies to see if people can tell what my site is about"

Claude: I'll send these visitors to your site:
- Tech-savvy developer (comfortable with jargon)
- Non-technical manager (skims, needs clear value prop)
- Skeptical senior engineer (assumes everything is overhyped)

Each lands cold on your homepage and reports: what they think it does,
where they got confused, and whether they'd explore further.
```

**Get roasted:**
```
User: "Hit my site with review-squad:well-actually before I post it to HN"

Claude: Dispatching the pedants — typography snobs, grammar hawks,
standards purists, and "um actually" engineers. They'll find the
things professional reviewers skip because they're too polite.
```

## How It Works

1. You pick a skill (experts, normies, regulars, or well-actually)
2. Claude proposes a panel — you approve or customize it
3. Agents dispatch (parallel for experts, sequential for the others)
4. Each agent reviews independently using their specific lens
5. Results consolidate into a single report with actionable findings

Three of the four skills (normies, regulars, well-actually) use browser MCP tools, so you'll need a dev server running for those.

## Documentation

- [Plugin details](CLAUDE.md)
- [Expert Panel skill](skills/experts/SKILL.md)
- [Normies skill](skills/normies/SKILL.md)
- [Regulars skill](skills/regulars/SKILL.md)
- [Well Actually skill](skills/well-actually/SKILL.md)

---

If Review Squad caught something your tests didn't, a ⭐ helps us know it's landing.

Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)


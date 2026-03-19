# Review Squad

Dispatch panels of specialized subagents to review your project from multiple angles.

## Installation

```bash
/plugin install review-squad@2389-research
```

## Skills

| Skill | What it does | Dispatch |
|-------|-------------|----------|
| `review-squad:experts` | Expert audit panel (SEO, a11y, security, perf, etc.) | Parallel |
| `review-squad:normies` | First-time visitors across a sophistication spectrum | Sequential |
| `review-squad:regulars` | Task-oriented users verifying real flows work | Sequential |
| `review-squad:well-actually` | Pedantic nitpickers finding what pros skip | Sequential |

## Quick Examples

**Expert audit before launch:**
> "Run a review-squad:experts audit on my site before we go live"

**First impressions check:**
> "Use review-squad:normies to see if people can tell what my site is about"

**Smoke test user flows:**
> "Run review-squad:regulars to check if the signup and checkout flows work"

**Get roasted:**
> "Hit my site with review-squad:well-actually before I post it to HN"

## How It Works

Each skill dispatches a panel of subagents — you approve (and optionally customize) the panel before they're sent out. Agents review independently, then results are consolidated into a single report with actionable findings.

Three of the four skills (normies, regulars, well-actually) use browser MCP tools, so you'll need a dev server running for those.

## Links

- [Plugin details](CLAUDE.md)
- [Expert Panel skill](skills/experts/SKILL.md)
- [Normies skill](skills/normies/SKILL.md)
- [Regulars skill](skills/regulars/SKILL.md)
- [Well Actually skill](skills/well-actually/SKILL.md)

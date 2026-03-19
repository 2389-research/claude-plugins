# Review Squad Plugin

## Overview

Dispatch panels of specialized subagents to review projects from multiple angles. Each skill sends a different type of reviewer at your project — experts, everyday users, task-oriented visitors, or insufferable pedants.

## Skills Included

### review-squad:experts
Multi-perspective expert audit. Dispatches parallel specialist agents (SEO, accessibility, security, performance, etc.) with project-type-specific default panels. Results consolidated into severity-ranked report.

**Trigger keywords**: review, audit, launch review, health check, pre-launch, post-refactor

### review-squad:normies
First-time visitor experience testing. Dispatches personas across a sophistication spectrum (senior dev → grandparent) who land on the site cold and report confusion, friction, and first impressions.

**Trigger keywords**: first impressions, do people understand, newcomer experience, landing page clarity

### review-squad:regulars
Task-completion verification. Dispatches personas with specific goals (find pricing, subscribe, checkout) who navigate the site like real users and report pass/fail on each flow.

**Trigger keywords**: smoke test, does it work, user flows, end-to-end, task completion

### review-squad:well-actually
Pedantic nitpick review. Dispatches insufferable personas (Typographer, Grammarian, HN Commenter, Pixel Cop, etc.) who find the things professional reviewers skip but opinionated people on the internet will roast you for.

**Trigger keywords**: nitpick, polish, roast, what did I miss, hacker news, pedantic

## Shared Patterns

### Browser MCP
Three of the four skills (normies, regulars, well-actually) use browser MCP tools to interact with a running site. Ensure a dev server is running before dispatching these agents.

### Sequential vs Parallel Dispatch
- **experts**: Parallel dispatch (agents read code independently)
- **normies**: Sequential (shared browser instance)
- **regulars**: Sequential (shared browser instance)
- **well-actually**: Sequential for browser-using agents; code-only agents can run in parallel

### Panel Customization
All skills present a default panel to the user and ask for adjustments before dispatching. The user always gets to add, remove, or modify reviewers.

### No-Code Guards
Normies and regulars agents must NOT read source code — they're visitors, not developers. Experts agents must NOT write code — they report only. Well-actually agents have per-persona access rules.

## Relationship to Other Plugins

- **fresh-eyes-review**: Pre-commit code audit (single agent, reads code). Complementary — fresh-eyes checks your code, review-squad checks your product.
- **scenario-testing**: Automated test scenarios with real dependencies. Review-squad is human-behavior simulation, not test automation.

## Development Workflow

Skills are invoked directly by name (no orchestrator routing):
- `review-squad:experts`
- `review-squad:normies`
- `review-squad:regulars`
- `review-squad:well-actually`

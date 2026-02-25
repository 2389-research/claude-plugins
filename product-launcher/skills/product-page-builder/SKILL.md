---
name: product-launcher:product-page-builder
description: Use when creating or updating a product page for the 2389.ai website. Triggers on "product page", "add to site", "write up for the site", "create product entry".
---

# Product Page Builder

Generate a complete `content/products/{slug}/index.md` for the 2389.ai Hugo site — frontmatter and body in one artifact.

This skill runs in a **product repo** but writes to the **2389.ai site repo**.

## Cross-Repo Setup

Before Phase 1, locate the 2389.ai site repo. Check in order:

1. `~/Public/src/2389/2389.ai`
2. `~/workspace/2389/2389.ai`

If neither exists, ask the user for the path. Store it as `SITE_REPO` for the session.

## Phase 1: Gather Context

If a README exists in the current directory, read it and pre-fill as much as possible. Confirm with the user — don't interrogate.

**Required:**

| Field | Notes |
|-------|-------|
| Product name | |
| What it does | 1-2 sentences |
| Who it's for | |
| Key features | 3-5 bullets |
| Install method | Command, brew, URL, etc. |
| Status | Skill, Tool, Platform, Alpha, Beta |
| GitHub repo URL | |
| Demo/docs URL | If exists |
| Tags | Lowercase |

**Optional:** Requirements/dependencies, architecture notes, known limitations.

## Phase 2: Generate

Produce the full `index.md` in one pass.

### Frontmatter schema

```yaml
title: "Product Name"
description: "One sentence. What it does and who it's for."
date: YYYY-MM-DD
status: "Skill|Tool|Platform|Alpha|Beta"
tags: ["relevant", "lowercase", "tags"]
github: "https://github.com/2389-research/repo"
demo: "https://url-if-exists"
weight: N
image_prompt: "..."
```

### Image prompt rules

Every `image_prompt` follows this formula — only the subject metaphor changes:

- **Subject:** A metaphorical visual representing the product's function
- **Medium:** Heavy charcoal ink on warm cream paper
- **Accent:** Burnt orange ink highlights the key element
- **Style:** Flat perspective, no shadows, no depth, no photorealism, no gradients
- **Texture:** Risograph grain, high contrast ink work
- **Composition:** Brutalist editorial, inspired by vintage technical illustration (1960s industrial diagrams, tool catalogs, modular grids)

**Example** (for a parallel test runner):
> A radial diagram of five identical circular vessels arranged in a pinwheel pattern, each containing a different abstract stage of the same process rendered as geometric patterns, drawn in heavy charcoal ink on warm cream paper. One vessel filled with burnt orange ink marks the winning variant. Bold ruled lines connect each vessel to a central decision node. Flat perspective, no depth, risograph grain texture, brutalist editorial composition inspired by 1960s industrial process diagrams. No photorealism, no gradients, high contrast ink work.

### Body content structure

```markdown
[Opening paragraph — what it is and why you'd care. 2-3 sentences. No throat-clearing.]

## Install

[Exact commands. No prose unless there are prerequisites.]

## What it does

[Core functionality. Explain like showing a colleague.
Specific features, not marketing bullets.
**Bold** for feature categories if there are several.]

## How it works

[Architecture or workflow. Skip for simple tools.]

## Requirements

[Dependencies, API keys, system requirements. Skip if none.]
```

**Rules:**
- Opening paragraph does the heavy lifting — no `## Overview` header
- `## Install` always present, always first after opener
- `## What it does` always present
- `## How it works` and `## Requirements` only when they add value
- No `## Conclusion` — page ends when content ends
- 300-800 words total body content
- Tone: casual, technically credible, specific over abstract, contractions OK

## Phase 3: De-AI Edit (HARD GATE)

Full sweep against known AI writing patterns. Fix every match before presenting.

| Pattern | Look for | Fix |
|---------|----------|-----|
| Inflated significance | "revolutionary", "game-changing", "powerful" | State the fact plainly |
| Promotional language | "seamless", "robust", "elegant", "cutting-edge" | Cut or replace with specific detail |
| AI vocabulary | "delve", "leverage", "navigate", "foster", "landscape" | Use plain words |
| Copula avoidance | "serves as", "stands as", "boasts" | Just say "is" |
| Filler phrases | "In order to", "It's worth noting" | Delete |
| Excessive hedging | "could potentially", "might arguably" | Commit or cut |
| Throat-clearing | "In today's world of..." | Start with substance |
| Fake specificity | "a wide range of", "numerous" | Actual numbers or cut |
| Em dash overuse | More than 2-3 per page | Vary punctuation |
| Buzzword stacking | Three+ adjectives before a noun | Pick the one that matters |

**Product-page checks:**
- Does the opening paragraph work without a heading above it?
- Could someone install this from the page alone?
- Is every feature described with enough specificity to be useful?
- Would this page make sense to someone who's never heard of the product?
- Does it end cleanly or trail off?

**HARD GATE:** Present the edited version with a summary of changes. Wait for user approval before Phase 4.

## Phase 4: Output

1. Save to `{SITE_REPO}/content/products/{slug}/index.md`
2. Run `hugo` in the site repo to verify build
3. Present the file path and confirm success

## What This Skill Does NOT Do

- **No launch materials** — that's `product-launcher:launch-materials`
- **No origin stories or motivation** — humans add the soul
- **No vibe discovery** — visual language is established
- **No landing page HTML** — these are Hugo markdown pages

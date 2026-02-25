---
name: product-launcher
description: Use when creating product pages for 2389.ai or generating launch materials (email, blog post, tweet thread). Triggers on "product page", "launch", "announce", "write up a product", "add to site".
---

# Product Launcher

Two skills for shipping products:

| Skill | Purpose | Trigger |
|-------|---------|---------|
| `product-launcher:product-page-builder` | Generate product page for 2389.ai | "product page", "add to site", "write up for the site", "create product entry" |
| `product-launcher:launch-materials` | Generate email + blog + tweets | "launch", "announce", "GTM", "tweet thread" |

## Routing

- "Write a product page" / "Add this to 2389.ai" → `product-page-builder`
- "Launch this" / "Write launch materials" / "Announce to subscribers" → `launch-materials`
- "Launch this product" (ambiguous) → Ask which: page, materials, or both

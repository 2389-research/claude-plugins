# Plugin Page Install Template Design

## Goal

Make descendant plugin pages show the marketplace add command alongside the plugin install command in the primary install snippet, so the first install instructions are self-contained for internal plugins.

## Problem

Generated plugin detail pages currently show two different install patterns:

- The hero install block only shows `/plugin install <plugin>@2389-research`
- The lower Quick Install section shows the full two-step flow with marketplace add first

That mismatch makes the first install snippet misleading. The plugin install command only works once the user has already added the marketplace.

## Scope

This change applies to generated descendant plugin pages for internal plugins in this repository.

Out of scope:

- Marketplace homepage install instructions
- External plugin entries that are not installed from this marketplace
- Broader content rewrites across every plugin README

## Design

Add a shared install-template helper in `scripts/generate-site.js` and route the hero install block through it.

Behavior:

- Internal plugins render a two-line install snippet:

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install <plugin>@2389-research
```

- External plugins continue to render their existing direct install command

The Quick Install section remains unchanged in this pass. The goal is to fix the misleading top-of-page snippet without broadening the scope into a larger layout rewrite.

## Validation

Add a regression test that regenerates the site and checks:

- An internal plugin page hero block contains both marketplace add and the scoped install command
- An external plugin page hero block does not incorrectly gain the marketplace add command

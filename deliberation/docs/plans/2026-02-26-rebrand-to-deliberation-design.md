# Rebrand QBP → Deliberation

## Context

The QBP skill is deeply inspired by Quaker Business Practice, but framing it as explicitly "Quaker" raises concerns about applying spiritual/communal traditions to AI agents. The goal is to soften the branding so it's clearly "inspired by" rather than "this is" Quaker practice.

## Decision

Rename from `qbp` to `deliberation`. Keep all Quaker-origin process vocabulary (clerk, discernment, clearness, gathered, threshing, seasoning, etc.) but reframe explicit "Quaker" references to "inspired by" language.

## Scope

### Changes

- **Directory**: `qbp/` → `deliberation/`
- **Plugin name**: `qbp` → `deliberation` in `plugin.json`
- **Description**: "Decision-making through deliberation — seeking unity through discernment rather than consensus through debate"
- **Skill names**: `qbp` → `deliberation`, `qbp:discernment` → `deliberation:discernment`, `qbp:clearness` → `deliberation:clearness`, `qbp:gathered` → `deliberation:gathered`
- **Marketplace entry**: Updated name, description, keywords (remove "quaker", add "deliberation")
- **Language across all files**:
  - "Quaker Business Practice" → "deliberative decision-making"
  - "Quaker discipline" → "deliberative discipline"
  - "Quaker practice" → "contemplative practice" or "this practice"
  - Anti-principles header: "What looks like Quaker practice but isn't" → "What looks like deliberation but isn't"
- **Attribution**: Single "inspired by" line in main SKILL.md and README

### No changes

- Process vocabulary: clerk, discernment, clearness, gathered, threshing, seasoning, sense of the meeting, standing aside, blocking, way opens
- Process flows and routing logic
- Shared reference file structure
- Sub-skill architecture

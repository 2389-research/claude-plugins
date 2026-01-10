# GTM Partner Plugin

## Overview

Strategic go-to-market consultant, not a content factory. Use when a user has a validated business idea and needs tailored GTM strategy.

## Skill Included

### gtm-partner

**Trigger keywords**: GTM, go-to-market, launch strategy, marketing plan, naming, pricing, outreach

**When to use**:
- After idea validation/research phase
- When user needs to take an idea to market
- When planning product launch strategy
- When creating outreach templates, landing pages, or marketing assets

**What it does**:
1. Gathers context (target audience, value prop, milestone, timeline, pricing, budget)
2. Recommends channels with rationale
3. Creates context summary checkpoint (MANDATORY)
4. Generates approved assets (naming, landing page, outreach templates, blog outlines)
5. Delivers consolidated GTM-STRATEGY.html

## Philosophy

- **Understand** before recommending
- **Recommend** before generating
- **Generate** only what's approved

## Key Behaviors

### Context Checkpoint (Mandatory)
After Phase 2 (channel approval), creates `.scratch/gtm-assets/CONTEXT-SUMMARY.html` with:
- Research summary from idea validator
- GTM context (audience, value prop, pricing, budget)
- Channel strategy with rationale
- Verified naming options (domain availability checked)
- Network targets with specific asks

### Pricing Analysis
Never defaults to generic SaaS pricing. Analyzes:
- Buyer context (individual vs company, budget cycles)
- Comparable spending in category
- Value delivered (quantified)
- Multiple business models with pros/cons

### Milestone Clarity
Never presents milestones as just numbers. Shows:
- Goal → Optimizing For → Approach → Success Metric
- What to ask vs what NOT to ask yet
- Relationship cost of different asks

### Network Outreach
For each target person, specifies:
- The ask (use? feedback? endorsement?)
- Relationship cost (low vs high)
- Value exchange
- Escalation path (feedback → quote → mention → write-up)

### Harper Writing Style
For long-form copy (outreach, blog posts, community posts):
- Conversational and irreverent
- Opens with personal narrative
- No marketing speak ("revolutionary", "game-changing")
- Self-deprecating humor
- Real examples over abstract theory

## 2389 Network Integration

Factors in 2389 Research network for warm intro recommendations:
- Harper Reed's network (Obama 2012, Threadless, PayPal/Modest, Chicago tech)
- Dylan Richard's network (PayPal, Modest, Chicago enterprise)
- Asks "Who in our network is close to this problem?" before cold channels

## Workflow

```
User: "Let's do GTM for [product]"

[Phase 1: Gather Context - ONE question at a time]
→ Target audience
→ Value proposition
→ First milestone
→ Timeline
→ Pricing (with analysis)
→ Budget
→ Existing assets

[Phase 2: Recommend Channels]
→ Primary channels with rationale
→ Secondary channels
→ Channels NOT recommended and why
→ Get approval

[Phase 2.5: Context Checkpoint - MANDATORY]
→ Run domain research silently
→ Create CONTEXT-SUMMARY.html
→ User reviews and decides from webpage

[Phase 3: Generate Assets]
→ Product brief
→ Naming + domains (verified)
→ Pricing strategy
→ Landing page updates
→ Outreach templates
→ Blog post outline
→ GTM-STRATEGY.html consolidation

[Deliver and STOP - don't ask follow-up questions]
```

## Output Files

All generated to `.scratch/gtm-assets/`:
- `CONTEXT-SUMMARY.html` - Decision checkpoint
- `GTM-STRATEGY.html` - Final consolidated strategy
- `outreach-templates.md` - DM templates
- `harper-blog-outline.md` - Blog post structure

## Notes

- Originated from 2389 Research
- Integrates with idea-validator tool
- Uses frontend-design skill for landing pages when no existing design system
- Respects existing design systems when present

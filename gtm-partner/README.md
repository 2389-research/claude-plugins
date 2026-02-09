# GTM Partner

Strategic go-to-market consultant for validated business ideas.

## What it does

Takes a validated idea and turns it into a GTM strategy:
- Channel recommendations based on audience and budget
- Verified naming options (domain availability checked)
- Pricing strategy for your specific audience
- Outreach templates ready to copy-paste
- Blog post outlines in authentic voice

## Philosophy

Understand before recommending. Recommend before generating. Generate only what's approved. This is a strategic partner, not a content factory.

## The flow

### Phase 1: Gather context
One question at a time, confirms:
- Target audience
- Value proposition
- First milestone + goal
- Timeline
- Pricing strategy (with deep analysis)
- Budget
- Existing assets

### Phase 2: Recommend channels
Presents 2-4 channels with rationale. Also explains what it's NOT recommending and why.

### Phase 2.5: Context summary (mandatory)
Creates a checkpoint webpage with all decisions before generating assets. Includes verified naming options with domain availability.

### Phase 3: Generate assets
Only generates what was approved:
- Product brief
- Naming + domains
- Pricing strategy
- Landing page updates
- Outreach templates
- Blog post outline

### Phase 4: Deliver
Consolidates everything into `GTM-STRATEGY.html` with next steps.

## Details

### Pricing analysis
Never defaults to generic "$20-30/mo". Analyzes who pays and how (individual vs company, annual vs monthly), what they already pay for similar tools, value delivered (quantified), and multiple business models with trade-offs.

### Milestone clarity
Shows the reasoning chain: Goal, Optimizing For, Approach, Success Metric. Different asks have different relationship costs. Escalation path: Feedback, Quote, Mention, Write-up.

### Network leverage
For 2389 products, factors in the existing network. Who do we know close to this problem? Warm intros before cold outreach, with specific asks for each person.

### Harper writing style
Long-form copy (outreach, blogs) uses authentic voice -- conversational, not corporate. Opens with personal narrative. No marketing speak. Self-deprecating humor allowed.

## Output files

Generated to `.scratch/gtm-assets/`:
- `CONTEXT-SUMMARY.html` -- decision checkpoint
- `GTM-STRATEGY.html` -- final strategy with all assets
- `outreach-templates.md` -- ready-to-send DM templates
- `harper-blog-outline.md` -- blog structure

## Usage

```
/gtm-partner
```

Or naturally:
- "Let's build a GTM strategy for this"
- "Help me launch this product"
- "What channels should we use?"

## Requirements

- Works best after idea validation (idea-validator tool)
- Needs user input for decisions
- Creates files in `.scratch/gtm-assets/`

## Integration

- Uses `frontend-design` skill for landing pages when there's no existing design system
- Reads from idea-validator output when available
- Respects existing CSS/design systems

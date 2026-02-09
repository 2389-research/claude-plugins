# Landing Page Design Plugin

Build landing pages that don't look like every other AI-generated page.

## Installation

```bash
/plugin install landing-page-design@2389-research
```

## What this plugin provides

### Main skill: `landing-page-design`

A workflow for building landing pages worth $50-100. Forces unique design direction through the Vibe Discovery process so you don't end up with generic AI-slop.

## Quick example

```
User: "Build a landing page for my productivity app"

Claude: Before writing any code, let's run Vibe Discovery.

Q1: What's one real-world place or object this brand would be?
Q2: What's the ONE emotion someone should feel in the first 3 seconds?
Q3: Pick TWO unexpected influences to collide:
Q4: What should this page NEVER be mistaken for?

[After answers, Claude creates a unique Vibe Spec and builds a distinctive page]
```

## The problem this solves

AI-generated landing pages converge on the same patterns: purple gradients, Inter/Roboto, Lucide icons, generic bento grids, the same animations everywhere. This plugin forces a unique aesthetic direction for every project.

## How it works

### Vibe discovery
4 context questions generate a unique direction. Colors, typography, and layout are invented from scratch (not looked up from a template). Anti-convergence rules prevent generic output, and a freshness check runs before any coding starts.

### The 50% rule
Half your effort goes to the hero section. It's the social media preview and the first impression. Everything else flows from the hero.

### Anti-AI-slop principles
- Fonts -- kill Inter/Roboto. Use Newsreader, Playfair Display, Clash Display, etc.
- Icons -- avoid Lucide. Use Iconify Solar, Heroicons, Phosphor.
- Colors -- no purple gradients. Derive from real-world references.
- Layouts -- break the grid. Overlapping elements, diagonal sections, asymmetry.

### Animation vocabulary
Full animation system for entrances, continuous effects, interactions, and decorative elements.

## Section composition

1. Hero -- the make-or-break element (50% of effort)
2. Features/Benefits -- bento grids, alternating rows, icon grids
3. Social proof -- logo marquee, testimonials, stats
4. How it works -- numbered steps, timeline, flowchart
5. Pricing -- tier comparison with recommended highlight
6. Final CTA -- repeat value prop, single focused action
7. Footer -- navigation, social, legal

## Resources

- [superhero.design](https://superhero.design) -- hero section gallery
- [H1 Gallery](https://h1gallery.com) -- headline inspiration
- [Iconify](https://iconify.design) -- unified icon API
- [Google Fonts](https://fonts.google.com) -- typography
- [Fontshare](https://fontshare.com) -- free quality fonts

## Documentation

- [CLAUDE.md](./CLAUDE.md) -- full plugin instructions for Claude
- [skills/SKILL.md](./skills/SKILL.md) -- skill reference

## License

MIT - Part of the [2389 Research Claude Plugins Marketplace](https://github.com/2389-research/claude-plugins)

# The marketplace binding

This site's answers to the slots in `mechanic.md`. The mechanic names no colour; everything
concrete lives here. `scripts/animations/palette.js` is the executable copy of the token
table below — it is what `--check` reads, so edit it there and treat this file as prose
around it.

## Frame

| slot | value |
|---|---|
| viewBox | `0 0 1200 400` |
| cycle | `8s`, `repeatCount="indefinite"`, on every animation in the scene |
| grid | 20px for placement; stroke widths and radii stay optical |
| type | `Menlo, 'IBM Plex Mono', monospace` at 11–13px, letter-spaced 1.2–2.2 |
| poster | shot at 0.94 of the cycle |

IBM Plex Mono is not installed on the render host, and an `<img>`-embedded SVG could not
load a webfont anyway. Menlo is what actually renders and the raster bakes it in.

## Tokens

Ground is `#faf9f6` (paper), painted as the scene's first element.

**Type** — all clear 4.5:1 on paper:

| token | hex | on paper |
|---|---|---|
| ink | `#171512` | 17.31:1 |
| strong | `#33302a` | 12.49:1 |
| body | `#4a453b` | 9.04:1 |
| muted | `#767168` | 4.60:1 |

`muted` is the dimmest legal label. There is no fifth, lighter step: nothing above it clears
the floor on this ground. The old `#8a857a` (3.49:1) and `#b5b0a4` (2.05:1) both failed and
collapsed into `muted`, so the grey type ladder is three steps, not five. That is a finding
about the palette, not a gap to fill by inventing a colour.

**Category accents** — one per scene, chosen by the plugin's marketplace category:

| category | mark | ink |
|---|---|---|
| Development | `#e6196e` | `#da1868` |
| Testing & Review | `#2f7d8c` | `#2e7b8a` |
| Agents & Orchestration | `#7a3fb0` | `#7a3fb0` |
| Infrastructure & Ops | `#c67514` | `#a56111` |
| Strategy & Reflection | `#1f9e6b` | `#198158` |

`mark` is the brand colour, for strokes, dashed routes, travelling dots and low-opacity
washes — marks that carry meaning need 3:1 and all five clear it. `ink` is the darkened
sibling for the two jobs needing 4.5:1: accent-coloured type, and solid blocks carrying
white type. Darkening improves both at once, which is why one extra token covers both.
Purple already clears the text floor, so its mark and ink are the same value.

**Structure** — `#e2ddd2` hairline, `#d8d3c8` dashed route. Both below 3:1 deliberately:
they carry no meaning alone, they only show where something is about to go.

## Treatments

| thing | drawn as |
|---|---|
| an artifact or document | white rect, 1.5px ink stroke, centred label |
| an agent, judge, or worker | white rect in a stack of siblings, evenly spaced |
| a finished or claimed state | solid `ink` block, white label |
| a flagged or selected item | `mark` stroke at 3px plus a `mark` wash at 0.12 |
| a route not yet taken | `#d8d3c8`, `stroke-dasharray="2 6"`, drawn from frame one |
| a route taken | same path in `mark`, revealed by `stroke-dashoffset` |
| a unit of work in transit | `circle` filled `mark`, on `animateMotion` |
| an accumulating quantity | rect with an animated `width` inside a hairline track |

## The beat pattern

Reveals are opacity on a wrapping `<g>`, holding until the 0.95 fade:

```xml
<g opacity="0">
  <animate attributeName="opacity" dur="8s" repeatCount="indefinite" calcMode="spline"
           keySplines="0.22 0.9 0.3 1;0.22 0.9 0.3 1;0.22 0.9 0.3 1;0.22 0.9 0.3 1"
           keyTimes="0;{in};{in+0.10};0.95;1" values="0;0;1;1;0"/>
</g>
```

Routes draw on with the travel curve, `values="{len};{len};0;0;{len}"` over the same shape
of `keyTimes`. Easing is only ever `0.42 0 0.16 1` (travel) or `0.22 0.9 0.3 1` (settle).

Scenes run roughly: title and standing structure by 0.10, first transit 0.12–0.22, the thing
that changes 0.30–0.50, consequence 0.60–0.80, and everything holds to 0.95.

## Mechanics already in use

Reuse one of these before inventing a shape — consistency across scenes is the point.

| mechanic | says | used by |
|---|---|---|
| fan-out and gather | one thing becomes many, results merge back | building-multiagent-systems, review-squad, jam |
| pipeline of stations | a thing travels and is transformed at each stop | firebase-development, css-development, socialmedia |
| loop and refine | the output re-enters, better each pass | simmer, ceo-personal-os |
| scan and flag | a sweep crosses a corpus, some items are marked | fresh-eyes-review, documentation-audit, git-repo-prep |
| resolve in place | an opaque block becomes legible section by section | summarize-meetings, binary-re |
| converge | separate positions travel to a meeting point | deliberation |
| sort into lanes | arrivals are allocated to fixed categories | ceo-personal-os |
| accumulate | a quantity climbs as work completes | simmer, speed-run |

## Where this project departs from `mechanic.md`

Both were decided deliberately; neither is drift.

- **Two outputs, not three, and the SVG is not one of them.** The page embeds `anim.mp4`
  with `anim-poster.png`, and the test suite asserts the SVG master is never embedded. The
  poster doubles as the reduced-motion still, which needs a real `<video>`/`<img>` pair.
- **No component library with `{{token}}` slots.** Scenes are authored bespoke against the
  token table above. The consistency the mechanic layer would have enforced structurally is
  enforced here by `--check` plus the mechanics table, and the trade is real: a second design
  system would mean rewriting scenes, not filling in a binding.

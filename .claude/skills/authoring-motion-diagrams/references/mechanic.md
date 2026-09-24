# Declarative SVG motion

> The portable layer, vendored verbatim so the skill works on a machine that does not have
> the original. It depends on nothing in this repo and names no colour. This marketplace's
> answers — tokens, palette, cycle length, treatments — live in `binding.md`, along with
> the two places this project deliberately departs from the text below.

Animated diagrams that survive being embedded as an image.

The constraint that shapes everything here: an SVG referenced with `<img src="x.svg">` or as
a CSS `background-image` renders in a restricted mode. JavaScript is disabled and external
resources do not load. Every JS animation library — GSAP, anime.js, Motion — is inert in that
context. SMIL and inlined CSS keep running.

So the animation is declared inside the file, and the file is the whole artifact. No runtime,
no player, no build step. One `.svg` plays in a markdown note, in a static site, and in a
browser tab.

## Three outputs, one source

The SVG is authored. The other two are generated from it and are never hand-edited.

| output | size (10s scene) | where it works | where it does not |
|---|---|---|---|
| **`.svg`** | ~14 KB | any browser, markdown notes, static sites, resolution-independent | email clients, Slack previews, Instagram |
| **`.mp4`** | ~80 KB | social, decks, Keynote, anywhere video plays | needs a player, no transparency |
| **`.gif`** | ~130 KB | chat, email, previews, no player needed | 64-colour palette, fixed resolution, largest file |

The vector master is the smallest of the three by roughly 6×. It is also the only one that
stays sharp at any zoom, so it is the default and the other two exist for contexts that
refuse it.

Regenerating is a single command per scene: render frames by scrubbing the clock, then encode
twice. Both derived files are disposable — change the SVG, re-run, and they are rebuilt. Never
patch an MP4 or a GIF, and never let one drift out of sync with its source.

One authoring choice differs between them. A loop is right for an embed on a page:
`repeatCount="indefinite"`. A single playthrough that ends in the final state and stays there
is right for a run trace: `repeatCount="1"` with `fill="freeze"`. Same file, one attribute.

## How the pieces depend on each other

This is a component library with a hard separation in it, and the separation is the only
reason it survives contact with a second project.

```
design system  ────────────┐
  tokens, type, palette,   │
  grid unit, contrast      │
                           ▼
static diagram spec ───▶ binding ◀─── motion mechanic
  already generates        │            rules + components
  SVG from those tokens    │            with {{token}} slots
                           ▼            names no colour, ever
                        scenes
                          compose components, supply geometry
                                    │
                                    ▼
                        svg (master) ──▶ mp4 ──▶ gif
```

**Dependencies point one way.** The mechanic depends on nothing. The binding depends on both
the mechanic and a design system. Scenes depend on the binding. Nothing depends on scenes.

The test for whether the separation is real: **a component that names a colour has inverted an
arrow.** If `#E2FF00` appears anywhere in the mechanic, that mechanic now depends on one design
system and cannot be pointed at another. The `{{token}}` placeholders exist to make that
violation impossible to write by accident.

| layer | holds | never holds |
|---|---|---|
| design system | tokens, typeface, palette, grid unit, contrast ladder | anything about motion |
| motion mechanic | timing rules, easing curves, component geometry, the export pipeline | colours, fonts, sizes |
| binding | this system's answers: token values, opacity ladder, object treatments | new rules |
| scene | composition, geometry, which components, what order | token values |

### If you already generate static SVG

Most design systems that produce diagrams already have this: a spec saying what a box looks
like, what a connector looks like, which colours carry which meaning, all read from the same
tokens as the rest of the system.

Motion is an **extension of that lane, not a parallel one.** The moving version reads the same
tokens as the still version, sits in the same document container, and obeys the same palette.
The only additions are timing and the rules that govern it. A reader should not be able to tell
that a still diagram and a moving one came from different code.

Concretely: put the motion binding beside the static diagram spec, cross-reference them, and
have whatever loads one load the other. Two files that answer for the same design system, one
covering shape and one covering time. Starting a separate motion system with its own palette
guarantees drift, and the drift shows up as two diagrams on one page that do not look related.

### What a binding has to answer

A new design system is onboarded by filling slots, not by writing code:

- **tokens** — every `{{name}}` the components reference
- **opacity ladder** — tuned per ground; the values are not portable (see below)
- **object treatments** — what each kind of thing in your domain is drawn as
- **cycle length** — one default for the system

If a slot cannot be filled without inventing something, that is a finding about the design
system, not a gap in the mechanic. A palette with three accents cannot colour-code six
categories. The honest response is to cap the categories at three, not to invent a fourth
colour — a closed vocabulary extended by inference stops being a design system.

## One cycle, keyTimes, no chaining

Every animation in a scene shares one `dur`. Events are placed as fractions of that cycle in
`keyTimes` rather than sequenced with `begin="other.end"`.

```xml
<circle r="2.8" fill="currentColor" opacity="0">
  <animate attributeName="opacity" dur="8.5s" repeatCount="indefinite"
           calcMode="spline"
           keySplines="0.42 0 0.16 1;0.42 0 0.16 1;0.42 0 0.16 1;0.42 0 0.16 1;0.42 0 0.16 1"
           keyTimes="0;0.29;0.30;0.46;0.48;1"
           values="0;0;1;1;0;0"/>
  <animateMotion dur="8.5s" repeatCount="indefinite" calcMode="spline"
                 keySplines="0.42 0 0.16 1;0.42 0 0.16 1;0.42 0 0.16 1"
                 path="M40,120 Q180,60 320,140"
                 keyTimes="0;0.30;0.46;1" keyPoints="0;0;1;1"/>
</circle>
```

Chained `begin` attributes drift out of sync and cannot be scrubbed to an arbitrary frame.
A shared cycle can: set the clock to any `t` and the whole scene is deterministic there.
That property is what makes frame export possible at all.

Three counts must agree or the browser silently disables the animation:

| attribute | count |
|---|---|
| `keyTimes` | n |
| `values` | n |
| `keySplines` | n − 1 |
| `keyPoints` | n |

A disabled animation is not an error anywhere. The element simply keeps its authored
attribute value, which is usually `opacity="0"` or a full-brightness default. Validate
mechanically:

```python
import re, glob
for f in glob.glob("*.svg"):
    for m in re.finditer(r'<(animate|animateMotion)\b[^>]*?/>', open(f).read()):
        t = m.group(0)
        kt = re.search(r'keyTimes="([^"]+)"', t)
        n = len(kt.group(1).split(";")) if kt else 0
        for label, pat, want in (("keySplines", r'keySplines="([^"]+)"', n - 1),
                                 ("values", r'values="([^"]+)"', n),
                                 ("keyPoints", r'keyPoints="([^"]+)"', n)):
            mm = re.search(pat, t)
            if mm and len(mm.group(1).split(";")) != want:
                print(f"{f}: {label} {len(mm.group(1).split(';'))} != {want}")
```

## Easing

`calcMode="linear"` reads as mechanical at any frame rate. Two named curves cover everything:

```
travel   0.42 0 0.16 1     leaves fast, arrives soft — anything crossing distance
settle   0.22 0.9 0.3 1    slight overshoot into rest — anything coming to a stop
```

One documented exception: a trail that records the route of an eased element stays linear.
Eased, it becomes a second moving thing competing with the first. Linear, it reads as a
record of where the first one went.

## Tokens

Components are SVG fragments with `{{token}}` placeholders and no colours of their own:

```xml
<rect x="{{x}}" y="{{y}}" width="{{w}}" height="{{h}}" fill="{{accent}}" opacity="0">
  <animate attributeName="opacity" dur="{{cycle}}s" repeatCount="indefinite"
           calcMode="spline" keySplines="0.22 0.9 0.3 1;0.22 0.9 0.3 1;0.22 0.9 0.3 1;0.22 0.9 0.3 1"
           keyTimes="0;{{t0}};{{t1}};0.92;1" values="0;0;{{o_peak}};{{o_rest}};0"/>
</rect>
```

A binding file supplies the values. Separating them keeps one geometry across design systems
and stops the same idea being redrawn differently every time it is needed.

Opacity belongs in the binding, not the component. Values tuned for light marks on a dark
ground invert in meaning on a light one: a 0.12 fill reads as *less* present than the 0.07
dashed placeholder it replaces, so "this section was filled in" renders as "this section was
emptied". The rule that catches it: after any change, the affected element must read as more
present than before, checked by looking at the before and after frames rather than at the
numbers.

## Exporting to video

Frame-accurate stills require scrubbing the SMIL clock. Verified on Chrome 151:

| technique | inline SVG | inside `<img>` | reproducible |
|---|---|---|---|
| `--virtual-time-budget` | advances correctly | frozen at t=0 | no — sub-pixel jitter between runs |
| `pauseAnimations()` + `setCurrentTime()` | advances correctly | n/a | yes — byte-identical |

Inline the SVG in a page that scrubs on load:

```html
<script>
  const s = document.querySelector('svg');
  const t = parseFloat(new URLSearchParams(location.search).get('t') || '0');
  s.pauseAnimations();
  s.setCurrentTime(t);
</script>
```

Shoot one frame per timestamp:

```sh
#!/bin/sh
# shoot.sh — one frame. $1 is the frame index.
t=$(echo "$1" | awk '{printf "%.4f", $1 / 30.0}')       # 30 fps
n=$(printf "%04d" "$1")
chrome --headless --disable-gpu \
  --screenshot="frames/f$n.png" --window-size=1200,520 --hide-scrollbars \
  --default-background-color=0A0A0AFF "file://$PWD/frame.html?t=$t"
```

```sh
seq 0 329 | xargs -P 8 -n 1 ./shoot.sh          # 11s at 30fps, 8 at a time
md5 -q frames/*.png | sort -u | wc -l           # MUST be well above 1
```

Then encode the same frames twice — once for video, once for the GIF:

```sh
ffmpeg -y -framerate 30 -i frames/f%04d.png \
  -c:v libx264 -pix_fmt yuv420p -crf 19 -movflags +faststart scene.mp4

ffmpeg -y -framerate 30 -i frames/f%04d.png -vf \
  "fps=20,scale=900:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=none" \
  -loop 0 scene.gif
```

The GIF drops to 20fps and generates its own palette from the actual frames. `dither=none`
matters for line art: dithering on flat backgrounds produces visible noise that costs file
size and buys nothing.

**Check frame uniqueness before encoding, and fail the build if it is low.** A GIF or MP4
built from near-identical frames looks static, and nothing in the pipeline reports a problem —
`ffmpeg` encodes 330 copies of one image without complaint. This is the failure mode that
wastes the most time, because the output exists and plays.

```sh
UNIQ=$(md5 -q frames/*.png | sort -u | wc -l | tr -d ' ')
[ "$UNIQ" -gt 20 ] || { echo "FAILED uniqueness check: $UNIQ"; exit 1; }
```

## Two things that do not survive `<img>`

Both fail silently.

**Fonts.** An `<img>`-embedded SVG does not inherit the host page's `@font-face`. Labels fall
back to a system default. Embed the font as a data URI, convert text to paths, or choose a
stack that degrades acceptably.

**Background.** The SVG composites onto whatever the host provides. Marks drawn in white-alpha
disappear on a light page. Paint a ground rect inside the file as its first element.

Inline SVG has neither problem. Use `<img>` when the file must travel; inline it when the page
is yours.

## Rules that turned out to matter

Each was earned by a version that broke without it.

1. **Placement sits on a grid.** One unit, every placement coordinate a multiple of it. Stroke
   widths and radii stay optical. Any length that varies between two elements must mean
   something — seeded jitter and leftover measurement-driven sizing read as sloppiness.
2. **No motion is linear.** Two curves, named above.
3. **Every change is two beats.** Transit says something arrived. Settlement says the thing is
   now different. One beat alone reads as decoration. The changed state must hold — roughly a
   quarter of the cycle — or the animation shows a transition and communicates no outcome.
4. **Nothing crosses the frame of its container.** An element outside its box reads as broken
   layout before it reads as meaning, and that first impression does not recover. Direction and
   origin are carried by motion, never by position outside the frame.
5. **Type has a contrast floor.** 4.5:1 for text, 3:1 for marks that carry meaning, computed
   rather than judged. Low-alpha grey looks refined on the screen of whoever chose it.
6. **A fragment does not cross what it is not addressing.** A path to object C that passes
   through object B reads as having entered B. Route through the gaps.
7. **Position is pre-allocated when an object grows.** If layout is recomputed as parts arrive,
   the object reflows, and reflow reads as rewriting rather than extending.

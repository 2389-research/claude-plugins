# Skill motion diagrams

One animated diagram per marketplace entry, shown near the top of that plugin's detail
page. Each scene says what the skill actually does — what moves, in what order, and what
is different at the end.

## Layout

```
scenes/<plugin>.svg      authored master, one per marketplace.json entry
render.js                scrubs each scene and encodes it
docs/plugins/<plugin>/
  anim.mp4               committed, embedded by the page
  anim-poster.png        committed, the settled frame
```

The SVG is the only thing edited by hand. `anim.mp4` and `anim-poster.png` are
derived — change the scene and re-render; never patch the video.

## Rendering

```bash
npm run generate:anim                              # all scenes (~75s each)
node scripts/animations/render.js simmer prbuddy   # just these
node scripts/animations/render.js --poster-only    # reshoot posters, keep the videos
```

While iterating on geometry, shoot a single frame instead — about a second per scene
rather than seventy-five, and it catches the mistakes that actually happen (a label
sitting on a connector, a box crossing its frame, a path ending in mid-air):

```bash
node scripts/animations/preview.js simmer            # the settled frame, 0.85 of the cycle
AT=0.3 node scripts/animations/preview.js simmer     # any other moment
```

Requires Chrome (override with `CHROME_BIN`) and `ffmpeg`. Rendering runs locally and
the output is committed; CI only runs `generate-site.js`, which emits the embed markup
when both files are present and nothing when they are not.

The renderer scrubs the SMIL clock frame by frame — `pauseAnimations()` plus
`setCurrentTime()`, inlined in a page — because an SVG inside `<img>` is frozen at
`t=0`. It fails the build if fewer than 20 frames are unique, which is what a scene
whose animation was silently disabled looks like.

## Scene contract

`render.js` validates these; a scene that breaks one does not render.

- One shared cycle: every `dur` is `8s`, `repeatCount="indefinite"`, and events are
  placed as fractions in `keyTimes`. No `begin="other.end"` chaining — a shared cycle
  is what makes an arbitrary frame reproducible.
- Counts agree: `keySplines` = n−1, `values` = n, `keyPoints` = n, for n `keyTimes`.
  A mismatch disables the animation silently and reports nothing.
- A `#faf9f6` ground rect is the first element, or the scene composites onto the page.
- `keyTimes` start at 0, end at 1, and never go backwards.

## Conventions the scenes share

- 1200×400 viewBox, placement on a 20px grid, nothing crossing the frame.
- Palette from `docs/style.css`: paper `#faf9f6`, ink `#171512`, body `#4a453b`,
  muted `#8a857a`, hairline `#e2ddd2`. The one accent per scene is its category
  colour — Development `#e6196e`, Testing & Review `#2f7d8c`, Agents & Orchestration
  `#7a3fb0`, Infrastructure & Ops `#c67514`, Strategy & Reflection `#1f9e6b`.
- Two easing curves only: travel `0.42 0 0.16 1` for anything crossing distance,
  settle `0.22 0.9 0.3 1` for anything coming to rest. Nothing linear.
- Every change is two beats — something arrives, then something is different — and the
  changed state holds until 0.95 of the cycle, where everything fades out. The poster is
  shot at 0.94: late enough that even the slowest-settling scene has finished drawing,
  which matters because that frame is the whole diagram for a reduced-motion reader. A
  poster caught mid-draw shows a half-drawn line and reads as a broken diagram.
- Routes are drawn as faint dashed guides from the first frame, so the layout never
  reflows as parts land.
- Labels are Menlo (IBM Plex Mono is not installed on the render host, and an
  `<img>`-embedded SVG would not load a webfont anyway — the raster bakes it in).

The page scales the diagram to whatever width its container has, down to a phone,
where the labels end up too small to read. That is accepted: the diagram is
supporting material and the README beside it carries the meaning. Keep authoring at
1200×400 against the grid — don't inflate the type to survive a narrow viewport, and
don't add a scroller to rescue it.

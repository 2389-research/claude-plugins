# Skills Library — editorial redesign

**Date:** 2026-07-19
**Status:** Design approved, ready for implementation plan
**Source design:** `Claude code skills library.zip` (design-canvas comp exported from the `dc` tool)

## Summary

Reskin the marketplace site (`skills.2389.ai`) to match the editorial "Skills Library"
comp. The comp is a new visual language and browse experience over the data and logic
the site already has — same 28 entries, same four categories, same install commands. So
this work reuses the generator's data layer untouched and replaces what it *emits*: the
index page, the per-plugin pages, the glossary, the stylesheet, and the client script.

The design-tool React runtime (`support.js`) is a comp artifact and is not shipped. Its
interactions (search, filter, detail routing, the animated background) are reimplemented
in vanilla JS as progressive enhancement over static HTML.

## Goals

- Index page matches the comp: editorial masthead, install strip, sticky search/filter
  toolbar, numbered category index of skill rows, animated topographic background,
  colophon footer.
- Per-plugin pages restyled to the same language: comp-style detail header, then the full
  fetched README rendered in the editorial type system, then prev/next nav and footer.
- Glossary page restyled to match.
- New capability: client-side search and category/tag filtering on the index.
- Adopt the "skills" framing fully (title, headline, labels, OG); keep `/plugin install`
  where it is the real Claude Code command.
- No regressions to SEO artifacts, analytics, or install logic.

## Non-goals

- No change to `marketplace.json`, the plugin repos, or the install mechanism.
- No new information architecture — the four categories and their descriptions already
  exist in `getCategoryForPlugin()` and are reused as-is.
- No client-side rendering of the skill list (see Approach).

## Approach: static-first, progressive enhancement

The generator emits every skill row and every per-plugin page as fully-rendered static
HTML (full SEO, works with JS disabled). A small vanilla-JS layer then adds:

- search over name + description + tags (show/hide rows, live result count),
- category filter chips and tag filtering (show/hide),
- the three.js topographic canvas,
- copy-to-clipboard on install commands (already present; keep).

Rejected alternative: ship skill data as JSON and render the list client-side like the
comp. Worse SEO and more JS for no benefit on a marketing/catalog site.

## Design system

Translate the comp's inline styles into a class-based token system in `docs/style.css`
(substantial rewrite of the existing 1,596-line file — expected for a redesign).

**Type**
- Newsreader (serif) — headlines, lede, body. Replaces Plus Jakarta Sans.
- IBM Plex Mono — kickers, labels, skill names, code, nav, footer.
- Google Fonts import updated in `generateHead()`.

**Color tokens**
- ink `#171512`; body `#4a453b` / `#33302a`; muted `#8a857a` / `#b5b0a4`;
  hairline `#e2ddd2` / `#e7e3da` / `#d8d3c8`; paper `#faf9f6`; page white `#ffffff`.
- accent magenta `#e6196e`, hover `#b81259`; selection `rgba(230,25,110,0.14)`.
- category colors: Development `#e6196e`, Infrastructure `#c67514`,
  Agent Systems `#7a3fb0`, Personal & Strategy `#1f9e6b`.
- MCP badge purple `#7a3fb0`.

**Motifs**
- heavy `1.5px solid #171512` rules top and bottom of major bands.
- glass panels: `background: rgba(255,255,255,0.62); backdrop-filter: blur(7px)`.
- numbered sections (`01`–`04`), mono uppercase kickers in magenta, `max-width: 1120px`
  centered column with `clamp(20px,4vw,44px)` gutters.

**Motion**
- `fadeIn` on sections; keep it subtle.
- three.js topo animation gated behind `prefers-reduced-motion: reduce` — render one
  static frame and stop the RAF loop when the user prefers reduced motion.

## Index page (`docs/index.html`)

1. **Masthead** — top rule bar (`2389 Research · Agent Skills · Open Source · Est. 2026`);
   glass hero panel with magenta kicker "A working index of", headline
   *Coding-agent skills & servers* (serif, italic "skills"), lede paragraph.
2. **Install strip** — `$ npx skills add 2389-research/<name>` with copy button, and a
   `★ Star on GitHub` link.
3. **Sticky toolbar** — search input with `⌕` glyph and live "N of M entries" count;
   filter chips `All / Development / Infrastructure / Agent Systems / Personal & Strategy`
   with counts; active-tag chip with clear control.
4. **Index** — one numbered `<section>` per non-empty category (kicker number in category
   color, name, count, blurb), containing skill rows. Each row is a grid:
   `NN` · body (mono name + optional MCP badge + `v<version>`, description, #tag buttons) ·
   right rail (category label, **copy-install** button, `details →`). The whole row links
   to the per-plugin page; the copy button and tag buttons stop propagation.
   MCP-only entries (`strict: true`) copy the `/plugin install` command, not npx.
5. **Empty state** — "Nothing here." with "No entries match …" and a Clear-filters button.
6. **Colophon footer** — copyright + GitHub / Skills Guide / 2389.ai.

## Per-plugin pages (`docs/plugins/<name>/index.html`)

Restyle `generatePluginPage()` to the editorial language:

- **Detail header** (from the comp): back link "← All skills"; `NN · Category` in category
  color; MCP-server badge when applicable; mono name + `v<version>`; lede description;
  #tag buttons (link back to the index filtered by tag); two install blocks —
  "Install — npx (any agent)" and "Install — Claude Code" — each with copy button
  (npx block omitted for MCP-only entries, which ship no skills).
- **README body** — the existing fetched-and-converted README, rendered through the
  editorial type system (Newsreader body, mono code, magenta links, hairline rules).
  `markdownToHtml()` logic is unchanged; only the CSS around it changes.
- **Related / prev-next** — keep related-plugins linking; add prev/next skill nav in the
  comp's style.
- **Footer** — same colophon.

Topographic background present here too (reduced-motion aware), per the full-consistency
decision.

## Glossary page (`docs/glossary/`)

Full restyle to the editorial language — masthead, type system, footer — consistent with
the index and detail pages.

## Files touched

- `docs/style.css` — rewrite to the token system (largest change).
- `scripts/generate-site.js`:
  - `generateHead()` — Newsreader font import; "skills" title/OG copy; keep canonical,
    markdown-alternate, Tinylytics, favicon, per-page OG image.
  - `generateNav()` → editorial masthead top bar.
  - `generateFooter()` → colophon.
  - index assembly → masthead + install strip + sticky toolbar + numbered index.
  - `generateCategorySections()` / `generatePluginCard()` → editorial category sections
    and skill rows.
  - `generatePluginPage()` → editorial detail header + README body + prev/next.
  - `generateInteractiveScript()` → add search/filter + three.js topo (keep copy logic).
  - glossary generation → editorial restyle.
- three.js loaded from cdnjs (`r128`) via `generateHead()` on all pages.

## Preserved — no regressions

Category inference; `getNpxInstallCommand` / `getPluginInstallCommand` / `pluginHasSkills`;
README fetching; `/plugin marketplace add`; Tinylytics events (`data-tinylytics-event*`);
`sitemap.xml`, `sitemap.md`, `robots.txt`, `llms.txt`, `AGENTS.md`, `index.md` and
per-plugin `.md` mirrors; og-images. Canonical URLs and the markdown-alternate links stay.

## Testing

- Existing generator tests stay green: `convert-repo-links`, `generate-site-install-template`,
  `generate-site-npx-install`.
- Add tests: search/filter markup is present and wired; every skill in `marketplace.json`
  renders exactly one index row; MCP-only entries expose the Claude Code command (not npx);
  the four category sections render with correct counts.
- Manual: `npm run generate`, open the site, verify search, category chips, tag filter,
  empty state, copy buttons, the topo canvas (and its reduced-motion freeze), and two or
  three per-plugin pages plus the glossary.

## Risks

- **three.js weight / battery** — mitigated by the reduced-motion freeze; it is the comp's
  signature, kept deliberately.
- **`style.css` rewrite blast radius** — every page reads this file; verify all page types
  (index, plugin, glossary) after the rewrite.
- **Readability of long READMEs in a serif system** — validate line length and code-block
  contrast on a content-heavy plugin page (e.g. `simmer`, `ceo-personal-os`).

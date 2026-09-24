# Gotchas

## Site build (verified 2026-09-24)

- CI never rebuilds the OG share cards. `.github/workflows/generate-site.yml` runs `npm test` and `scripts/generate-site.js`, not `scripts/generate-og-images.js`. After changing a plugin's version or description, run `npm run generate` and commit the PNGs, or the card goes stale.
- `npm test` rewrites `docs/`, because `tests/generate-site-redesign.test.js` runs the generator when it loads.
- The OG card wraps a description at 52 characters and cuts it at three lines. Keep `description` under about 150 characters.
- A listing row shows only a plugin's first three `keywords`, and the tag filter reads only those; detail pages show six. Lead with the distinctive ones, and don't spend a slot repeating the category.

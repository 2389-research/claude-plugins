# Gotchas

## Site build (verified 2026-09-24)

- CI never rebuilds the OG share cards. `.github/workflows/generate-site.yml` runs `npm test` and `scripts/generate-site.js`, not `scripts/generate-og-images.js`. After changing a plugin's version or description, run `npm run generate` and commit the PNGs, or the card goes stale.
- `npm test` rewrites `docs/`, because `tests/generate-site-redesign.test.js` runs the generator when it loads.
- The OG card wraps a description at 52 characters and cuts it at three lines. Keep `description` under about 150 characters.
- A listing row shows only a plugin's first three `keywords`, and the tag filter reads only those; detail pages show six. Lead with the distinctive ones, and don't spend a slot repeating the category.

## README rendering (verified 2026-09-24)

- Plugin pages render each README with the site's own regex renderer, which covers only part of GitHub-flavoured markdown. Check any new markdown shape against GitHub: `gh api markdown --input -` with `{"text": "...", "mode": "markdown"}`. Mode `gfm` is comment mode and turns every newline into `<br>`, so its answers are wrong for a README.
- The READMEs share templates, so a rendering bug on one page is usually on many: the `---` footer rule printed as text on 24 of 31 pages. Count it across every `docs/plugins/*/index.html` before saying how far it reaches.
- After a CSS change, compare each page's README height at 375px, not only whether the page scrolls sideways. `overflow-wrap:break-word` split a word inside review-squad's table without any overflow; only the height change showed it.

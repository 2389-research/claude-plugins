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

## Plugin install paths (verified 2026-09-24)

- Give every skill its own folder, `skills/<name>/SKILL.md`. When a plugin has `skills/SKILL.md` and also `skills/<sub>/SKILL.md`, Claude Code loads only the top one (`claude plugin details <name>` shows `Skills (1)`), while `npx skills add` loads them all. A router skill that invokes `<plugin>:<sub>` then names skills Claude Code never loaded.
- Claude Code installs a plugin's packages with `npm ci --ignore-scripts`, so no build step runs. An MCP server whose command points into a gitignored `dist/` fails after `/plugin install`. Commit the build output, as speed-run does with `mcp/dist/`.
- `npx skills add` copies SKILL.md folders only: no hooks, MCP servers, commands or agents. A plugin that needs a hook or a server works in full only through `/plugin install`.
- `/plugin install <name>@2389-research` on a machine without the marketplace fails with "not found in marketplace … your local copy may be out of date". The fix is `/plugin marketplace add 2389-research/claude-plugins`, not an update.
- To test installs without touching your own setup, point `CLAUDE_CONFIG_DIR` at a fresh folder. `DISABLE_TELEMETRY=1 npx -y skills add <owner/repo> --list` shows what npx would install without installing it.

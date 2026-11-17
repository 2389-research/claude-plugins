# about-us-optimizer

> Write or audit company About pages from supplied sources, with checkable facts, clear offerings, and buyer-focused FAQs

- **Version:** 2.0.0
- **Source:** https://github.com/2389-research/about-us-optimizer

## Install

Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

```
npx skills add 2389-research/about-us-optimizer
```

Or natively in Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install about-us-optimizer@2389-research
```

## README

<!-- ABOUTME: Installation and usage for the About Us Optimizer skill. -->
<!-- ABOUTME: Describes the source-based workflow and optional page checker. -->

# About Us Optimizer

Write or audit a company's About page using the sources you supply.
Keep every claim checkable, explain the offerings, and answer buyers' questions.
Missing facts stay out of the page and come back as questions.

## Install

For Codex, Claude Code, Cursor, and other agents:

```sh
npx skills add 2389-research/about-us-optimizer
```

For Claude Code's plugin system:

```text
/plugin marketplace add 2389-research/claude-plugins
/plugin install about-us-optimizer@2389-research
```

## Use

```text
Use about-us-optimizer to rewrite our About page from the notes and files in this folder.
Keep every claim sourced and tell me what you couldn't confirm.
```

Ask for an audit to get findings without a rewrite.
Name one section to limit the work to that section.
The skill returns Markdown or HTML, as requested.

## Package

| Path | Purpose |
| --- | --- |
| `SKILL.md` | Sourcing rules, page structure, and response format |
| `agents/openai.yaml` | Display metadata and invocation prompt |
| `references/page-spec.md` | Section details and key-facts fields |
| `scripts/check_about.py` | Optional checker for a drafted page |
| `tests/` | Tests for the checker |

The workflow needs no executable helper.
The optional checker uses Python 3.9 or later and only its standard library.
Resolve helper paths relative to the installed skill directory.

## Check a page

```sh
uv run python scripts/check_about.py draft.md
uv run python scripts/check_about.py draft.html --draft
```

The checker catches placeholders, missing headings, and mixed Markdown and HTML.
It lists figures so you can trace them to their sources.
It cannot verify whether claims are true or supported by a source.

## Development

Run `scripts/check` to test the checker.
Evaluation fixtures and their history are excluded from this public package.

## License

MIT. See [LICENSE](LICENSE).


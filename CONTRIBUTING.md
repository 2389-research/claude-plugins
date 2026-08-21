# Contributing

We welcome contributions! Here's how to get involved.

## Adding a New Plugin

1. Create a GitHub repo under `2389-research/` with the standard plugin structure:
   ```
   my-plugin/
   ├── .claude-plugin/
   │   └── plugin.json
   ├── skills/
   │   └── my-skill/
   │       └── SKILL.md
   ├── CLAUDE.md
   └── README.md
   ```

   Every skill lives in its own directory: `skills/<skill-name>/SKILL.md`. Add
   more directories under `skills/` for more skills.

   **Do not put a `SKILL.md` directly in `skills/`.** A top-level
   `skills/SKILL.md` is not a valid skill location, and when one is present
   Claude Code registers only that file and silently drops every nested skill in
   the plugin — they never appear in the available-skills list and cannot be
   invoked by name.

2. Add an entry to `.claude-plugin/marketplace.json` in this repo

3. Regenerate the marketplace site:
   ```bash
   npm run generate
   ```

4. Submit a pull request

## Improving an Existing Plugin

Each plugin lives in its own repo under [2389-research](https://github.com/2389-research). Open issues or PRs directly on the plugin's repo.

## Reporting Issues

- **Plugin bug?** Open an issue on the plugin's repo
- **Marketplace site issue?** Open an issue here
- **Feature request?** Start a [Discussion](https://github.com/2389-research/claude-plugins/discussions)

## Code Style

- Keep it simple — no over-engineering
- Match existing style within files
- Start code files with a 2-line `ABOUTME` comment

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

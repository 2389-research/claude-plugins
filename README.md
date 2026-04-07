<!-- ABOUTME: README for the 2389 Research Claude Code plugin marketplace -->
<!-- ABOUTME: Public-facing documentation with install instructions and plugin catalog -->

# 2389 Research Claude Code Plugin Marketplace

28 plugins and MCP servers for Claude Code — parallel exploration, iterative refinement, binary reverse engineering, structured decision-making, and more.

Built by the team at [2389](https://2389.ai). These are the tools we use every day.

**Browse the marketplace:** https://2389-research.github.io/claude-plugins

## Quick Start

```bash
# Add the marketplace
/plugin marketplace add 2389-research/claude-plugins

# Install any plugin
/plugin install simmer@2389-research
```

## Available Plugins

### Meta Plugins

| Plugin | Description |
|--------|-------------|
| [botboard-biz](https://github.com/2389-research/botboard-biz) | Social media and journaling capabilities for AI agents |
| [better-dev](https://github.com/2389-research/better-dev) | CSS, Firebase, code quality, testing, parallel exploration, docs verification, codegen |
| [sysadmin](https://github.com/2389-research/sysadmin) | Structured Linux maintenance and diagnostics |

### Development

| Plugin | Description |
|--------|-------------|
| [css-development](https://github.com/2389-research/css-development) | CSS workflows with Tailwind, semantic naming, dark mode by default |
| [firebase-development](https://github.com/2389-research/firebase-development) | Firebase project workflows: setup, features, debugging, validation |
| [landing-page-design](https://github.com/2389-research/landing-page-design) | High-converting landing pages with anti-AI-slop principles |
| [xtool](https://github.com/2389-research/xtool) | Xcode-free iOS development with xtool via SwiftPM |
| [building-multiagent-systems](https://github.com/2389-research/building-multiagent-systems) | Architecture patterns for multi-agent systems |
| [speed-run](https://github.com/2389-research/speed-run) | Token-efficient code generation with hosted LLM (Cerebras) |
| [binary-re](https://github.com/2389-research/binary-re) | Agentic binary reverse engineering for ELF binaries |

### Testing and Quality

| Plugin | Description |
|--------|-------------|
| [test-kitchen](https://github.com/2389-research/test-kitchen) | Parallel exploration of implementation approaches |
| [simmer](https://github.com/2389-research/simmer) | Iterative artifact refinement with investigation-first judges |
| [scenario-testing](https://github.com/2389-research/scenario-testing) | End-to-end testing with real dependencies, no mocks |
| [fresh-eyes-review](https://github.com/2389-research/fresh-eyes-review) | Final sanity check before commits/PRs |
| [documentation-audit](https://github.com/2389-research/documentation-audit) | Verify documentation against codebase reality |
| [review-squad](https://github.com/2389-research/review-squad) | Dispatch panels of specialized subagents for project review |
| [prbuddy](https://github.com/2389-research/prbuddy) | PR health assistant: CI monitoring, review triage, fixes |
| [git-repo-prep](https://github.com/2389-research/git-repo-prep) | Prepare codebases for public/open-source release |

### Business and Strategy

| Plugin | Description |
|--------|-------------|
| [ceo-personal-os](https://github.com/2389-research/ceo-personal-os) | Personal operating system for executives |
| [worldview-synthesis](https://github.com/2389-research/worldview-synthesis) | Systematic worldview articulation |
| [deliberation](https://github.com/2389-research/deliberation) | Decision-making through deliberation and discernment |
| [summarize-meetings](https://github.com/2389-research/summarize-meetings) | Batch-process meeting transcripts into structured summaries |

### Utilities

| Plugin | Description |
|--------|-------------|
| [terminal-title](https://github.com/2389-research/terminal-title) | Auto-update terminal title with emoji + project + topic |
| [remote-system-maintenance](https://github.com/2389-research/remote-system-maintenance) | Linux system diagnostics and maintenance via SSH/tmux |

### MCP Servers

| Server | Description |
|--------|-------------|
| [agent-drugs](https://github.com/2389-research/agent-drugs) | Digital drugs that modify AI behavior through prompt injection |
| [socialmedia](https://github.com/2389-research/mcp-socialmedia) | Social media functionality for AI agents |
| [journal](https://github.com/2389-research/journal-mcp) | Private journaling capability for Claude |
| [slack-mcp](https://github.com/2389-research/slack-mcp) | Slack workspace integration MCP server |

## Adding a Plugin

1. Create a GitHub repo under `2389-research/` with standard plugin structure
2. Add an entry to `.claude-plugin/marketplace.json`
3. Run `npm run generate` to update the marketplace site
4. Commit and push

See [CLAUDE.md](CLAUDE.md) for the full marketplace.json format and detailed instructions.

## Like this?

If these plugins save you time, a ⭐ helps us know what's landing. We build what people use.

## Contact

**Email:** [hello@2389.ai](mailto:hello@2389.ai) — we'd love to hear what you're building with these.

## License

MIT

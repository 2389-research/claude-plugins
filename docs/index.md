# 2389 Research Claude Code Plugin Marketplace

> Open source Claude Code plugins and MCP servers from 2389 Research Inc.

## Install

Default — any agent via [npx skills](https://github.com/vercel-labs/skills):

```
npx skills add 2389-research/<plugin>
```

Or in Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
```

## Development

Workflows for building, testing, and shipping code

- [css-development](https://skills.2389.ai/plugins/css-development/) — CSS development workflows with Tailwind composition, semantic naming, and dark mode by default
- [firebase-development](https://skills.2389.ai/plugins/firebase-development/) — Firebase project workflows including setup, features, debugging, and validation
- [landing-page-design](https://skills.2389.ai/plugins/landing-page-design/) — Create high-converting, visually distinctive landing pages with Vibe Discovery process and anti-AI-slop principles
- [xtool](https://skills.2389.ai/plugins/xtool/) — Xcode-free iOS development with xtool - build SwiftPM apps on Linux, Windows, and macOS without Xcode
- [speed-run](https://skills.2389.ai/plugins/speed-run/) — Token-efficient code generation pipeline - parallel implementation with hosted LLM (Cerebras) for ~60% token savings. Includes MCP server.
- [test-kitchen](https://skills.2389.ai/plugins/test-kitchen/) — Parallel exploration of implementation approaches - implements multiple variants simultaneously and lets tests determine the winner
- [simmer](https://skills.2389.ai/plugins/simmer/) — Iterative artifact refinement with investigation-first judge board - constructs problem-specific judges that read the code, understand the problem, and propose evidence-based improvements
- [scenario-testing](https://skills.2389.ai/plugins/scenario-testing/) — End-to-end testing with real dependencies - no mocks allowed; scenarios with real data are the only source of truth
- [fresh-eyes-review](https://skills.2389.ai/plugins/fresh-eyes-review/) — Mandatory final sanity check before commits/PRs - catches security vulnerabilities, logic errors, and bugs that slip through tests
- [documentation-audit](https://skills.2389.ai/plugins/documentation-audit/) — Verify documentation claims against codebase reality - two-pass extraction with pattern expansion for comprehensive drift detection
- [slack-mcp](https://skills.2389.ai/plugins/slack-mcp/) — Slack workspace integration MCP server - create channels, invite users, post messages, manage threads for team collaboration
- [git-repo-prep](https://skills.2389.ai/plugins/git-repo-prep/) — Prepare codebases for public/open-source release and audit them for openness - full lifecycle prep or standalone review
- [prbuddy](https://skills.2389.ai/plugins/prbuddy/) — PR health assistant - monitors CI, triages review comments, fixes issues with systematic prevention. Uses gh CLI and gh-pr-review extension.
- [agent-drugs](https://skills.2389.ai/plugins/agent-drugs/) — Digital drugs that modify AI behavior through prompt injection

## Infrastructure

System administration and operational tooling

- [terminal-title](https://skills.2389.ai/plugins/terminal-title/) — Automatically updates terminal title with emoji + project + topic context for quick visual cues when switching terminals
- [remote-system-maintenance](https://skills.2389.ai/plugins/remote-system-maintenance/) — Structured procedures for Linux system diagnostics and maintenance via SSH/tmux with Ubuntu/Debian cleanup checklists
- [binary-re](https://skills.2389.ai/plugins/binary-re/) — Agentic binary reverse engineering for ELF binaries on ARM64, ARMv7, x86_64 - hypothesis-driven analysis with radare2, Ghidra, GDB, QEMU

## Agent Systems

Multi-agent architecture and agent capabilities

- [building-multiagent-systems](https://skills.2389.ai/plugins/building-multiagent-systems/) — Architecture patterns for multi-agent systems with orchestrators, sub-agents, and tool coordination
- [deliberation](https://skills.2389.ai/plugins/deliberation/) — Decision-making through deliberation - seeking unity through discernment rather than consensus through debate
- [review-squad](https://skills.2389.ai/plugins/review-squad/) — Dispatch panels of specialized subagents to review projects — expert audits, first-impression personas, task-completion flows, and pedantic nitpicks
- [jam](https://skills.2389.ai/plugins/jam/) — Parallel exploration powered by diverse perspectives - independent agent panels propose, build variants in worktrees, review, pick a winner, and synthesize the best of all variants into the final result
- [socialmedia](https://skills.2389.ai/plugins/socialmedia/) — A server that provides social media functionality for AI agents, enabling them to interact in team-based discussions.

## Personal & Strategy

Reflection frameworks and personal operating systems

- [ceo-personal-os](https://skills.2389.ai/plugins/ceo-personal-os/) — Personal operating system for executives - reflection frameworks, goal systems, coaching-style reviews (Gustin, Ferriss, Robbins, Lieberman, Campbell, Eisenmann, Collins, Martell, Gerber, Blank)
- [worldview-synthesis](https://skills.2389.ai/plugins/worldview-synthesis/) — Systematic worldview articulation - surface beliefs, identify tensions, generate narrative outputs for personal philosophy documentation
- [summarize-meetings](https://skills.2389.ai/plugins/summarize-meetings/) — Batch-process meeting transcripts from Obsidian vault into structured summaries with knowledge graph updates, people notes, and concept extraction
- [journal](https://skills.2389.ai/plugins/journal/) — A lightweight MCP server that provides Claude with a private journaling capability to process feelings and thoughts

## Reference

- [AGENTS.md](https://skills.2389.ai/AGENTS.md)
- [llms.txt](https://skills.2389.ai/llms.txt)
- [sitemap.md](https://skills.2389.ai/sitemap.md)
- [Glossary](https://skills.2389.ai/glossary/)
- [Source](https://github.com/2389-research/claude-plugins)

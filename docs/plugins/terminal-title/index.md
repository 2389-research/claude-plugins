# terminal-title

> Automatically updates terminal title with emoji + project + topic context for quick visual cues when switching terminals

- **Version:** 1.1.2
- **Source:** https://github.com/2389-research/terminal-title

## Install

Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

```
npx skills add 2389-research/terminal-title
```

Or natively in Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install 2389-research/terminal-title
```

## README

# Terminal title

Automatically updates your terminal title with emoji + project + topic context. Works on Windows, macOS, and Linux.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install terminal-title@2389-research
```

### Environment variables

Add these to your `.bashrc`, `.zshrc`, or shell profile:

```bash
# Set to 1 to disable automatic terminal title updates
export CLAUDE_CODE_DISABLE_TERMINAL_TITLE=0

# Optional: set an emoji prefix for your terminal title.
# Useful for distinguishing work vs personal terminals at a glance.
export TERMINAL_TITLE_EMOJI=💼
```

If `TERMINAL_TITLE_EMOJI` is not set, the plugin defaults to 🎉.

### Platform-specific setup

Windows users need PowerShell 7+ (`pwsh`) installed and on PATH. The plugin picks it up automatically.

Unix/Linux/macOS users don't need to do anything extra.

## Use with other agent harnesses (Codex, etc.)

The skill itself is harness-neutral — only the install path differs. For non-Claude-Code harnesses:

1. Clone this repo somewhere stable (the install path is baked into the wrapper).
2. Run `bin/install.sh`. This creates `~/.local/bin/set-terminal-title` pointing at the bundled script.
3. Make sure `~/.local/bin` is on your `PATH`.
4. Register `skills/SKILL.md` with your harness's skill discovery (mechanism is harness-specific).
5. Approve the wrapper in your harness's command allowlist. For Codex, that looks like:

   ```json
   ["/Users/<you>/.local/bin/set-terminal-title"]
   ```

   The wrapper path is stable across plugin updates, so the approval doesn't need to change when the skill's internals move.

The agent invokes `set-terminal-title "Project" "Topic"`. If the wrapper isn't installed or isn't approved, the skill instructs the agent to skip silently.

## What this plugin does

One skill: `terminal-title` -- manages your terminal title based on project and topic context.

The title updates automatically at session start, and again whenever the topic changes. The emoji prefix gives you a quick visual cue when switching between terminal windows.

## How it works

A session start hook fires the terminal-title skill, which:

1. Detects your OS (Windows, macOS, Linux)
2. Figures out the current project from the working directory, git repo, or package.json
3. Infers the topic from conversation context
4. Reads `TERMINAL_TITLE_EMOJI` from the environment (or defaults to 🎉)
5. Updates the terminal title via a platform-specific script (`.ps1` on Windows, `.sh` everywhere else)

The title format is: `$EMOJI ProjectName - Topic`

## Examples

```text
💼 OneOnOne - Firebase Config
💼 Claude Plugins - Terminal Title
🎉 dotfiles - zsh config
```

## Documentation

- [Design document](docs/2025-11-14-terminal-title-skill-design.md)
- [Implementation plan](docs/2025-11-14-terminal-title-implementation.md)

---

If Terminal Title helps you keep track of 12 open sessions, a ⭐ helps us know it's landing.

Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)


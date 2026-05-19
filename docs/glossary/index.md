# Glossary

Terms used across the 2389 Research plugin marketplace.

## Plugin

A bundle of skills, slash commands, hooks, and/or MCP servers distributed as a single unit. Installed in Claude Code via /plugin install.

## Skill

A self-contained capability — instructions plus optional supporting files — that Claude can invoke for specific tasks. Lives under skills/ in a plugin.

## Marketplace

A catalog of plugins. This site is the marketplace for 2389 Research plugins. Added in Claude Code with /plugin marketplace add &lt;repo&gt;.

## MCP server

Model Context Protocol server. Exposes tools, resources, and prompts to Claude over a standard protocol. Some plugins ship MCP servers; others integrate with existing ones.

## Hook

A shell command Claude Code executes in response to events such as tool calls or session start. Configured in settings.json.

## Slash command

A user-invocable command typed in Claude Code as /&lt;name&gt;. Slash commands are defined inside skills or as standalone files in a plugin.

## Scorecard

A versioned set of automated checks. The a14y scorecard, for example, rates how readable this site is for AI agents.

[Back to marketplace](https://skills.2389.ai/)

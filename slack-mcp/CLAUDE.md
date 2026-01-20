# Slack MCP Server

## Overview

MCP server that provides Slack workspace integration. Use when you need to share content with a team, create channels for collaboration, or post messages programmatically.

## Available Tools

| Tool | Description |
|------|-------------|
| `slack_create_channel` | Create a public or private channel |
| `slack_invite_to_channel` | Add users to a channel by email or ID |
| `slack_post_message` | Post a message (markdown supported) |
| `slack_post_thread` | Reply in a thread |
| `slack_pin_message` | Pin a message to a channel |
| `slack_list_users` | List workspace users for ID lookup |

## Common Workflows

### Create a GTM Review Channel

When user says "push to slack" after generating materials:

```
1. slack_create_channel(name: "gtm-[product]", is_private: true, description: "GTM review for [product]")
2. slack_invite_to_channel(channel_id: "...", users: ["harper@2389.ai", "dylan@2389.ai"])
3. slack_post_message(channel_id: "...", text: "## GTM Materials: [Product]\n\n...")
4. slack_pin_message(channel_id: "...", message_ts: "...")
5. slack_post_message(channel_id: "...", text: "## Email\n\n...")
6. slack_post_message(channel_id: "...", text: "## Blog Post\n\n...")
7. slack_post_message(channel_id: "...", text: "## Tweet Thread\n\n...")
```

### Post Updates to Existing Channel

```
1. slack_post_message(channel_id: "...", text: "Updated draft:\n\n...")
```

### Discuss in Thread

```
1. slack_post_thread(channel_id: "...", thread_ts: "...", text: "What about this angle?")
```

## Message Formatting

Slack uses its own markdown variant:

- `*bold*` for bold
- `_italic_` for italic
- `` `code` `` for inline code
- ``` for code blocks
- `>` for quotes
- `• ` for bullet points

## 2389 Default Users

When creating GTM review channels, always invite:
- `harper@2389.ai` (Harper Reed)
- `dylan@2389.ai` (Dylan Richard)

## Error Handling

Common errors:
- `channel_not_found` - Channel ID is invalid
- `already_in_channel` - User already in channel (not a failure)
- `user_not_found` - Email not found in workspace
- `not_in_channel` - Bot not in channel (needs to be invited first)

## Environment

Requires `SLACK_BOT_TOKEN` environment variable with a valid bot token.

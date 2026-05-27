# slack-mcp

> Slack workspace integration MCP server - create channels, invite users, post messages, manage threads for team collaboration

- **Version:** 1.0.0
- **Source:** https://github.com/2389-research/slack-mcp

## Install

This is an MCP server — install it in Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install 2389-research/slack-mcp
```

## README

# Slack MCP server

MCP server for Slack workspace integration. Handles channel creation, user invites, message posting, and thread management.

## Setup

### 1. Create a Slack app

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name it (e.g., "Claude MCP") and select your workspace

### 2. Add OAuth scopes

Under "OAuth & Permissions", add these Bot Token Scopes:

```
channels:manage        # create public channels
groups:write           # create private channels
channels:read          # list channels
groups:read            # read private channels
chat:write             # post messages
pins:write             # pin messages
users:read             # list users
users:read.email       # lookup users by email
```

### 3. Install to workspace

Click "Install to Workspace" and authorize the app.

### 4. Get bot token

Copy the "Bot User OAuth Token" (starts with `xoxb-`).

### 5. Configure environment

```bash
export SLACK_BOT_TOKEN="xoxb-your-token-here"
```

Or add to your Claude config:

```json
{
  "mcpServers": {
    "slack": {
      "command": "node",
      "args": ["/path/to/slack-mcp/dist/index.js"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token-here"
      }
    }
  }
}
```

### 6. Build and run

```bash
npm install
npm run build
npm start
```

## Tools

### slack_create_channel

Create a new Slack channel.

```json
{
  "name": "gtm-jeff",
  "is_private": true,
  "description": "GTM materials for Jeff launch"
}
```

### slack_invite_to_channel

Invite users by email or user ID.

```json
{
  "channel_id": "C123ABC",
  "users": ["harper@2389.ai", "dylan@2389.ai"]
}
```

### slack_post_message

Post a message to a channel.

```json
{
  "channel_id": "C123ABC",
  "text": "## Email

**Subject:** meet jeff..."
}
```

### slack_post_thread

Reply to a message in a thread.

```json
{
  "channel_id": "C123ABC",
  "thread_ts": "1234567890.123456",
  "text": "Updated the subject line"
}
```

### slack_pin_message

Pin a message to a channel.

```json
{
  "channel_id": "C123ABC",
  "message_ts": "1234567890.123456"
}
```

### slack_list_users

List all users in the workspace.

```json
{}
```

## Usage with product launcher

After generating GTM materials, say "push to slack":

1. Creates `#gtm-[product]` private channel
2. Invites Harper and Dylan
3. Posts each output (email, blog, tweets) as separate messages
4. Pins the summary message

## License

MIT

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install slack-mcp@2389-research
```

---

If Slack MCP saved you from context-switching out of your terminal, a ⭐ helps us know it's landing.

Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)


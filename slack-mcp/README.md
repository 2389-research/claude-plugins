# Slack MCP Server

MCP server for Slack workspace integration. Create channels, invite users, post messages, and manage threads.

## Features

- Create public or private channels
- Invite users by email or user ID
- Post messages with markdown formatting
- Reply in threads
- Pin messages
- List workspace users

## Setup

### 1. Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name it (e.g., "Claude MCP") and select your workspace

### 2. Add OAuth Scopes

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

### 3. Install to Workspace

Click "Install to Workspace" and authorize the app.

### 4. Get Bot Token

Copy the "Bot User OAuth Token" (starts with `xoxb-`).

### 5. Configure Environment

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

### 6. Build and Run

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
  "text": "## Email\n\n**Subject:** meet jeff..."
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

## Usage with Product Launcher

After generating GTM materials, say "push to slack":

1. Creates `#gtm-[product]` private channel
2. Invites Harper and Dylan
3. Posts each output (email, blog, tweets) as separate messages
4. Pins the summary message

## License

MIT

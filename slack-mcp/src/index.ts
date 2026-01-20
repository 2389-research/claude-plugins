#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { SlackClient } from "./slack-client.js";

// Initialize Slack client
const slackToken = process.env.SLACK_BOT_TOKEN;
if (!slackToken) {
  console.error("Error: SLACK_BOT_TOKEN environment variable is required");
  process.exit(1);
}

const slack = new SlackClient(slackToken);

// Define tools
const tools: Tool[] = [
  {
    name: "slack_create_channel",
    description: "Create a new Slack channel (public or private)",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Channel name (lowercase, no spaces). Will be normalized automatically.",
        },
        is_private: {
          type: "boolean",
          description: "Whether the channel is private (default: true)",
          default: true,
        },
        description: {
          type: "string",
          description: "Channel purpose/description (optional)",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "slack_invite_to_channel",
    description: "Invite users to a Slack channel by email or user ID",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: {
          type: "string",
          description: "The channel ID to invite users to",
        },
        users: {
          type: "array",
          items: { type: "string" },
          description: "Array of user emails or user IDs to invite",
        },
      },
      required: ["channel_id", "users"],
    },
  },
  {
    name: "slack_post_message",
    description: "Post a message to a Slack channel. Supports markdown formatting.",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: {
          type: "string",
          description: "The channel ID to post to",
        },
        text: {
          type: "string",
          description: "Message content (markdown supported)",
        },
      },
      required: ["channel_id", "text"],
    },
  },
  {
    name: "slack_post_thread",
    description: "Reply to a message in a thread",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: {
          type: "string",
          description: "The channel ID containing the thread",
        },
        thread_ts: {
          type: "string",
          description: "Timestamp of the parent message to reply to",
        },
        text: {
          type: "string",
          description: "Reply content (markdown supported)",
        },
      },
      required: ["channel_id", "thread_ts", "text"],
    },
  },
  {
    name: "slack_pin_message",
    description: "Pin a message to a channel",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: {
          type: "string",
          description: "The channel ID containing the message",
        },
        message_ts: {
          type: "string",
          description: "Timestamp of the message to pin",
        },
      },
      required: ["channel_id", "message_ts"],
    },
  },
  {
    name: "slack_list_users",
    description: "List all users in the Slack workspace for user ID lookup",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// Create MCP server
const server = new Server(
  {
    name: "slack-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "slack_create_channel": {
        const { name: channelName, is_private = true, description } = args as {
          name: string;
          is_private?: boolean;
          description?: string;
        };

        const channel = await slack.createChannel(channelName, is_private, description);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                channel_id: channel.id,
                channel_name: channel.name,
                message: `Created ${is_private ? "private" : "public"} channel #${channel.name}`,
              }, null, 2),
            },
          ],
        };
      }

      case "slack_invite_to_channel": {
        const { channel_id, users } = args as {
          channel_id: string;
          users: string[];
        };

        const result = await slack.inviteToChannel(channel_id, users);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                invited: result.invited,
                failed: result.failed,
                message: `Invited ${result.invited.length} user(s) to channel`,
              }, null, 2),
            },
          ],
        };
      }

      case "slack_post_message": {
        const { channel_id, text } = args as {
          channel_id: string;
          text: string;
        };

        const message = await slack.postMessage(channel_id, text);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message_ts: message.ts,
                channel_id: message.channel,
                message: "Message posted successfully",
              }, null, 2),
            },
          ],
        };
      }

      case "slack_post_thread": {
        const { channel_id, thread_ts, text } = args as {
          channel_id: string;
          thread_ts: string;
          text: string;
        };

        const message = await slack.postThread(channel_id, thread_ts, text);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message_ts: message.ts,
                channel_id: message.channel,
                message: "Thread reply posted successfully",
              }, null, 2),
            },
          ],
        };
      }

      case "slack_pin_message": {
        const { channel_id, message_ts } = args as {
          channel_id: string;
          message_ts: string;
        };

        const success = await slack.pinMessage(channel_id, message_ts);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success,
                message: success ? "Message pinned successfully" : "Failed to pin message",
              }, null, 2),
            },
          ],
        };
      }

      case "slack_list_users": {
        const users = await slack.listUsers();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                count: users.length,
                users: users.map((u) => ({
                  id: u.id,
                  email: u.email,
                  name: u.name,
                  real_name: u.real_name,
                })),
              }, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error.message || String(error),
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Slack MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

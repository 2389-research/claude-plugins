import { WebClient } from "@slack/web-api";

export interface SlackUser {
  id: string;
  email: string;
  name: string;
  real_name: string;
}

export interface ChannelInfo {
  id: string;
  name: string;
}

export interface MessageInfo {
  ts: string;
  channel: string;
}

export class SlackClient {
  private client: WebClient;
  private userCache: Map<string, SlackUser> = new Map();

  constructor(token: string) {
    if (!token) {
      throw new Error("SLACK_BOT_TOKEN environment variable is required");
    }
    this.client = new WebClient(token);
  }

  /**
   * Create a new channel (public or private)
   */
  async createChannel(
    name: string,
    isPrivate: boolean = true,
    description?: string
  ): Promise<ChannelInfo> {
    // Normalize channel name: lowercase, replace spaces with hyphens
    const normalizedName = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");

    const result = await this.client.conversations.create({
      name: normalizedName,
      is_private: isPrivate,
    });

    if (!result.ok || !result.channel) {
      throw new Error(`Failed to create channel: ${result.error}`);
    }

    const channelId = result.channel.id as string;

    // Set channel description/purpose if provided
    if (description) {
      await this.client.conversations.setPurpose({
        channel: channelId,
        purpose: description,
      });
    }

    return {
      id: channelId,
      name: normalizedName,
    };
  }

  /**
   * Invite users to a channel by email or user ID
   */
  async inviteToChannel(
    channelId: string,
    users: string[]
  ): Promise<{ invited: string[]; failed: string[] }> {
    const invited: string[] = [];
    const failed: string[] = [];

    // Resolve emails to user IDs if needed
    const userIds: string[] = [];
    for (const user of users) {
      if (user.includes("@")) {
        // It's an email, look up the user ID
        const userId = await this.getUserIdByEmail(user);
        if (userId) {
          userIds.push(userId);
        } else {
          failed.push(user);
        }
      } else {
        // Assume it's already a user ID
        userIds.push(user);
      }
    }

    // Invite users to channel
    if (userIds.length > 0) {
      try {
        await this.client.conversations.invite({
          channel: channelId,
          users: userIds.join(","),
        });
        invited.push(...userIds);
      } catch (error: any) {
        // Handle case where some users are already in channel
        if (error.data?.error === "already_in_channel") {
          invited.push(...userIds);
        } else {
          failed.push(...userIds);
        }
      }
    }

    return { invited, failed };
  }

  /**
   * Post a message to a channel
   */
  async postMessage(
    channelId: string,
    text: string,
    blocks?: any[]
  ): Promise<MessageInfo> {
    const result = await this.client.chat.postMessage({
      channel: channelId,
      text,
      blocks,
      mrkdwn: true,
    });

    if (!result.ok || !result.ts) {
      throw new Error(`Failed to post message: ${result.error}`);
    }

    return {
      ts: result.ts,
      channel: channelId,
    };
  }

  /**
   * Reply to a message in a thread
   */
  async postThread(
    channelId: string,
    threadTs: string,
    text: string
  ): Promise<MessageInfo> {
    const result = await this.client.chat.postMessage({
      channel: channelId,
      thread_ts: threadTs,
      text,
      mrkdwn: true,
    });

    if (!result.ok || !result.ts) {
      throw new Error(`Failed to post thread reply: ${result.error}`);
    }

    return {
      ts: result.ts,
      channel: channelId,
    };
  }

  /**
   * Pin a message to a channel
   */
  async pinMessage(channelId: string, messageTs: string): Promise<boolean> {
    const result = await this.client.pins.add({
      channel: channelId,
      timestamp: messageTs,
    });

    return result.ok === true;
  }

  /**
   * List all users in the workspace
   */
  async listUsers(): Promise<SlackUser[]> {
    const users: SlackUser[] = [];
    let cursor: string | undefined;

    do {
      const result = await this.client.users.list({
        cursor,
        limit: 200,
      });

      if (result.members) {
        for (const member of result.members) {
          if (!member.deleted && !member.is_bot && member.id) {
            const user: SlackUser = {
              id: member.id,
              email: member.profile?.email || "",
              name: member.name || "",
              real_name: member.real_name || member.profile?.real_name || "",
            };
            users.push(user);

            // Cache for email lookups
            if (user.email) {
              this.userCache.set(user.email.toLowerCase(), user);
            }
          }
        }
      }

      cursor = result.response_metadata?.next_cursor;
    } while (cursor);

    return users;
  }

  /**
   * Look up a user ID by email
   */
  async getUserIdByEmail(email: string): Promise<string | null> {
    const normalizedEmail = email.toLowerCase();

    // Check cache first
    if (this.userCache.has(normalizedEmail)) {
      return this.userCache.get(normalizedEmail)!.id;
    }

    // Try direct lookup
    try {
      const result = await this.client.users.lookupByEmail({
        email: normalizedEmail,
      });

      if (result.ok && result.user?.id) {
        const user: SlackUser = {
          id: result.user.id,
          email: normalizedEmail,
          name: result.user.name || "",
          real_name: result.user.real_name || "",
        };
        this.userCache.set(normalizedEmail, user);
        return result.user.id;
      }
    } catch (error) {
      // User not found
    }

    return null;
  }
}

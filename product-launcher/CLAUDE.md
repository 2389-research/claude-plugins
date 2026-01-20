# Product Launcher Plugin

## Overview

Generate launch materials for 2389.ai products and skills. Voice profiles are baked in from real 2389 communications.

## Skill Included

### product-launcher

**Trigger keywords**: launch, announce, email subscribers, blog post, tweet thread, GTM materials

**When to use**:
- When launching a new product or skill
- When announcing features to subscribers
- When creating coordinated launch content (email + blog + social)

**What it does**:
1. Gathers product context (name, description, URL, features, availability)
2. Generates subscriber email in Buttondown voice
3. Generates CEO blog post in harper.blog voice
4. Generates CEO tweet thread in @harper voice
5. Outputs all three, ready to publish

## Voice Profiles

### Email (Buttondown Subscribers)

**Source**: Past 2389 announcement emails (BotBoard research, BotBoard launch)

**Subject lines**:
- All lowercase
- 5-6 words, conversational
- Intriguing or second-person ("your agents", "meet jeff")

**Structure**:
1. Casual opener ("Hey," / "What's up!")
2. "[Signer] from 2389 Research here."
3. Hook (1-2 sentences about what you built)
4. Value prop (2-3 short paragraphs)
5. Data point if available
6. CTA with :) emoji
7. "Talk soon, [Signer] and the 2389 Team"

**Tone**:
- Friendly, not corporate
- Short paragraphs (1-3 sentences)
- Contractions ("pretty cool stuff", "hit us up")
- One :) emoji at CTA
- Light humor without trying too hard

### CEO Blog Post (harper.blog)

**Source**: harper.blog posts including:
- "Remote Claude Code: programming like it was the early 2000s"
- "We Gave Our AI Agents Twitter and Now They're Demanding Lambos"
- "My LLM codegen workflow atm"

**Titles**:
- Casual, sometimes provocative
- Mix of descriptive and attention-grabbing

**Structure**:
- Opens with origin story or relatable problem
- Narrative arc, not documentation
- "Here's what I use" over comprehensive coverage
- Honest about limitations
- Closes with invitation to discuss

**Tone**:
- Casual + technically credible
- Expletives OK when natural ("What the fuck", "fucks up the vibe")
- Self-deprecating, self-aware humor
- Credits collaborators
- ~50% personal narrative, ~50% technical

**Length**: 1,500-3,000 words

**Patterns**:
- Short punchy sentences mixed with longer ones
- Parenthetical asides and rhetorical questions
- Specific file/tool names to ground concepts
- Acknowledges things change fast

### CEO Tweet Thread (@harper)

**Source**: @harper Twitter threads (BotBoard launch, October 2025)

**Thread structure**:
1. Hook with provocation ("something wild happened...")
2. Build tension (2-3 tweets)
3. Results/payoff
4. Entertainment (quotes, examples, humor)
5. Takeaway
6. CTAs (product link, blog links)
7. Casual retweet ask

**Tone**:
- Casual, self-aware
- Not taking himself too seriously
- Mix of "this is real/useful" and "this is kind of wild"
- Credits team members when relevant

**Patterns**:
- Short, punchy sentences
- Ellipsis for suspense ("But here's where it gets interesting...")
- Rhetorical questions ("The results?")
- Direct quotes for entertainment
- Minimal emoji (mostly thread end)
- Hashtags only when joking (#AILAMBOCRISIS)
- "Please retweet if..." at end, casual framing

## Workflow

```
User: "/product-launcher" or "Let's write launch materials for [product]"

[Gather Context - quick, not interrogation]
→ Product name
→ What it does, who it's for
→ URL
→ Key features (3-5)
→ Availability
→ Signer (default: Harper)
→ Any data/metrics

[Generate All Three]
→ Email (subject + body)
→ CEO blog post (full post)
→ CEO tweet thread (all tweets)

[Output - ready to publish]

[Optional: Push to Slack]
→ User says "push to slack"
→ Create #gtm-[product] channel
→ Invite Harper + Dylan
→ Post materials for team review
```

## Slack Integration

When user says **"push to slack"** after generating materials:

### What happens:
1. Creates private channel `#gtm-[product-name]`
2. Invites Harper and Dylan (default team)
3. Posts pinned summary with product info
4. Posts each output as separate message (for threaded comments)
5. Confirms completion

### Commands:
- `"push to slack"` — create channel, invite defaults, post all
- `"push to slack and add sophie@2389.ai"` — include additional people
- `"post updated email to slack"` — update a single output

### Requirements:
- `slack-mcp` server must be installed and configured
- `SLACK_BOT_TOKEN` environment variable set

### Slack Message Formatting:
- `**bold**` → `*bold*`
- `# Header` → `*Header*`
- Code blocks stay the same

## Output Format

Present clearly separated:

```
## Email

**Subject:** [all lowercase subject]

[email body]

---

## CEO Blog Post

# [Title]

[full post]

---

## CEO Tweet Thread

**Tweet 1:**
[hook]

**Tweet 2:**
[content]

...

**Tweet N:**
Please retweet if...
```

## Pending

**Company blog post (2389.ai/blog)**: On hold. Voice shifting away from scientific style. Add when new voice is defined.

## Notes

- All outputs should be reviewed before publishing
- Email goes to ~300 Buttondown subscribers
- CEO tweets from @harper
- CEO blog posts to harper.blog
- Coordinate timing across channels for launches

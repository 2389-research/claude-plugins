# Product launcher

Generate launch materials for 2389.ai products and skills with voice profiles derived from real communications.

## What it does

Takes a product and generates ready-to-publish GTM materials:
- Subscriber email -- Buttondown announcement (~300 subscribers)
- CEO blog post -- harper.blog style, full post ready to publish
- CEO tweet thread -- @harper voice, thread format

## Philosophy

Voice profiles are baked in, not templated. Each output matches the actual tone and style of past 2389 communications. Emails match the casual, direct Buttondown style. Blog posts match Harper's narrative, technically-credible voice. Tweets match @harper's punchy, self-aware thread style.

## Usage

```
/product-launcher
```

Or naturally:
- "Let's write launch materials for Jeff"
- "Draft the email and blog post for this launch"
- "Create the tweet thread for announcing this"

## Required inputs

The skill will gather:
- Product name
- What it does / who it's for
- URL for the CTA
- Key features (3-5 bullets)
- Availability (open, waitlist, invite-only)
- Who signs the email (default: Harper)
- Any metrics/data to cite

## Outputs

All three outputs generated in one pass:

### Email
- Subject line: all lowercase, 5-6 words, conversational
- Body: casual opener, short paragraphs, :) at CTA
- Sign-off: "Talk soon, [Signer] and the 2389 Team"

### CEO blog post
- Title: casual, sometimes provocative
- Structure: origin story, what it does, how I use it, try it
- Tone: 50% personal narrative, 50% technical substance
- Length: 1,500-3,000 words
- Honest about limitations

### CEO tweet thread
- Hook tweet with provocation
- Build tension over 2-3 tweets
- Results/examples
- CTAs to product and blog
- Casual retweet ask at end

## Pending

Company blog post (2389.ai/blog) is on hold pending new voice direction (shifting away from scientific style).

## Voice sources

Profiles derived from:
- Past Buttondown emails (BotBoard announcements)
- harper.blog posts (Claude Code, AI agents social media, LLM codegen workflow)
- @harper Twitter threads (BotBoard launch thread)

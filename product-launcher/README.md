# Product Launcher

Generate product pages for the 2389.ai site and coordinated launch materials with voice profiles derived from real communications.

## Skills

### product-page-builder

Creates a complete Hugo product page (`content/products/{slug}/index.md`) for the 2389.ai website.

**Invocation:**

```
/product-launcher
```

Or naturally:
- "Create a product page for this project for the 2389.ai site"
- "Add this to the 2389.ai products page"
- "Write up a product entry for this"

**Workflow (4 phases):**

1. **Gather** — Reads the current repo's README and collects product info (name, description, features, install method, status, tags). Pre-fills what it can, confirms the rest.
2. **Generate** — Produces frontmatter (title, description, status, tags, GitHub URL, image prompt) and body content (opening paragraph, install, what it does, how it works, requirements). 300-800 words.
3. **De-AI Edit** — Hard gate. Sweeps for AI writing patterns (inflated significance, promotional language, filler phrases, buzzword stacking) and fixes them before presenting. Waits for user approval.
4. **Output** — Saves the file to the 2389.ai site repo and runs `hugo` to verify the build passes.

**Cross-repo note:** This skill runs in a product repo but writes to the 2389.ai site repo. It looks for the site at `~/Public/src/2389/2389.ai` or `~/workspace/2389/2389.ai`.

### launch-materials

Takes a product and generates ready-to-publish GTM materials:
- Subscriber email -- Buttondown announcement (~300 subscribers)
- CEO blog post -- harper.blog style, full post ready to publish
- CEO tweet thread -- @harper voice, thread format

**Invocation:**

```
/product-launcher
```

Or naturally:
- "Let's write launch materials for Jeff"
- "Draft the email and blog post for this launch"
- "Create the tweet thread for announcing this"

## Philosophy

Voice profiles are baked in, not templated. Each output matches the actual tone and style of past 2389 communications. Emails match the casual, direct Buttondown style. Blog posts match Harper's narrative, technically-credible voice. Tweets match @harper's punchy, self-aware thread style. Product pages are specific, technically grounded, and free of AI writing patterns.

## Required inputs

### For product pages

The skill will gather:
- Product name
- What it does / who it's for
- Key features (3-5 bullets)
- Install method (command, brew, URL, etc.)
- Status (Skill, Tool, Platform, Alpha, Beta)
- GitHub repo URL
- Tags (lowercase)
- Demo/docs URL (if exists)

### For launch materials

The skill will gather:
- Product name
- What it does / who it's for
- URL for the CTA
- Key features (3-5 bullets)
- Availability (open, waitlist, invite-only)
- Who signs the email (default: Harper)
- Any metrics/data to cite

## Outputs

### Product page

Single markdown file written to `{site-repo}/content/products/{slug}/index.md` with frontmatter and body content. Verified against Hugo build.

### Launch materials

All three outputs generated in one pass:

#### Email
- Subject line: all lowercase, 5-6 words, conversational
- Body: casual opener, short paragraphs, :) at CTA
- Sign-off: "Talk soon, [Signer] and the 2389 Team"

#### CEO blog post
- Title: casual, sometimes provocative
- Structure: origin story, what it does, how I use it, try it
- Tone: 50% personal narrative, 50% technical substance
- Length: 1,500-3,000 words
- Honest about limitations

#### CEO tweet thread
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

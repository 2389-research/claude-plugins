# Tier 1 Repo Plans — 5 Flagship Plugins

> Goal: Apply the summarize-meetings playbook (adapted) to the 5 repos with the strongest standalone stories.

**Template from summarize-meetings (adapted):**
1. README: Problem framing linked to blog post (where available)
2. README: Star CTA
3. README: Marketplace install step
4. README: Attribution footer — `Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)`
5. MIT license
6. GitHub topics (add: claude-code, ai-agents, automation)
7. Homepage URL → blog post (or marketplace page if no blog post)

**What the clearness committee changed:** For dev tools, the primary anchor is a concrete example interaction, not a blog post. Blog posts are supporting evidence, not the hook. The README should stand alone.

---

## 1. Simmer

**Stars:** 0 | **Blog post:** https://2389.ai/blog/simmer | **README:** 192 lines, strong

**Current state:** Best README of the five. Has problem framing, two detailed examples with scoring trajectories, "when to use" comparison table. Missing: star CTA, marketplace install step, license.

### Plan

1. **README: Add problem framing opener** — Before the current opening line, add a paragraph grounding the problem: "You wrote a prompt. It works. But is it good? Simmer runs your artifact through multiple rounds of criteria-driven refinement — each round, a panel of judges reads your code, understands the problem, and proposes specific improvements." Link to Harper's blog post as "Read the story behind Simmer."

2. **README: Add star CTA** — Bottom of README: "If Simmer helped you ship something better than your first draft, a star helps us know it's landing."

3. **README: Add marketplace install step** — Before the install command, add: `/plugin marketplace add 2389-research/claude-plugins`

4. **MIT license** — Standard MIT, Copyright (c) 2026 2389 Research, Inc.

5. **GitHub topics** — Add: `claude-code`, `ai-agents`, `automation` (on top of existing 12 topics)

6. **README: Attribution footer** — `Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)`

7. **GitHub homepage** — Set to: `https://2389.ai/blog/simmer`

---

## 2. Deliberation

**Stars:** 0 | **Blog post:** https://2389.ai/posts/deliberation-perspectives-not-answers/ | **README:** 77 lines, solid but short

**Current state:** Good structure with three sub-skills explained, principles table, quick example. Missing: star CTA, marketplace install step, license. The Quaker framing is the unique hook but needs a concrete "why should I care" opener.

### Plan

1. **README: Add problem framing opener** — "Most AI tools give you answers. Deliberation gives you perspectives. When you're facing a decision with real weight — architecture choices, ethical trade-offs, competing approaches — this skill convenes voices that seek clarity instead of racing to conclusions." Link to blog post as "Read how we built this."

2. **README: Add star CTA** — "If Deliberation helped you make a better decision (or avoid a bad one), a star helps us know it's landing."

3. **README: Add marketplace install step** — Before the install command.

4. **MIT license** — Standard MIT.

5. **GitHub topics** — Add: `claude-code`, `ai-agents`, `automation`

6. **README: Attribution footer** — `Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)`

7. **GitHub homepage** — Set to: `https://2389.ai/posts/deliberation-perspectives-not-answers/`

---

## 3. Test Kitchen

**Stars:** 0 | **Blog posts:** https://2389.ai/posts/cookoff-same-spec-different-code/ + https://2389.ai/posts/omakase-show-me/ | **README:** 150 lines, decent

**Current state:** Has two sub-skills (omakase-off and cookoff) with examples and flow diagrams. Missing: star CTA, marketplace install step, license. The opener is too technical — jumps straight into "Parallel implementation framework with two gate skills."

### Plan

1. **README: Add problem framing opener** — "You have a spec. Three valid approaches exist. Instead of guessing which one to build, Test Kitchen builds all of them in parallel git worktrees and lets your tests pick the winner." Link to both blog posts.

2. **README: Add star CTA** — "If Test Kitchen saved you from building the wrong approach first, a star helps us know it's landing."

3. **README: Add marketplace install step** — Before the install command.

4. **MIT license** — Standard MIT.

5. **GitHub topics** — Add: `claude-code`, `ai-agents`, `automation`

6. **README: Attribution footer** — `Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)`

7. **GitHub homepage** — Set to: `https://2389.ai/posts/cookoff-same-spec-different-code/`

---

## 4. Binary RE

**Stars:** 0 | **Blog post:** None | **README:** 101 lines, strong for the niche

**Current state:** Clear opener, supported architectures table, example session with hypothesis-driven analysis, philosophy section. This is the strongest "no blog post needed" case — the README IS the practitioner walkthrough. Missing: star CTA, marketplace install step, license.

### Plan

1. **README: Add problem framing opener** — "You pulled a binary off an embedded device. It's an ELF, probably ARM, and you need to figure out what it does. Binary RE gives Claude the tools to help — radare2 for disassembly, Ghidra for decompilation, GDB for dynamic analysis, QEMU for emulation — driven by hypothesis-testing, not blind exploration." No blog post link needed. The opener IS the anchor.

2. **README: Add star CTA** — "If Binary RE helped you crack a firmware blob, a star helps us know it's landing."

3. **README: Add marketplace install step** — Before the install command.

4. **MIT license** — Standard MIT.

5. **GitHub topics** — Add: `claude-code`, `ai-agents`, `automation`, `ctf`, `security`

6. **README: Attribution footer** — `Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)`

7. **GitHub homepage** — Set to the marketplace plugin page (no blog post exists).

---

## 5. Review Squad

**Stars:** 0 | **Blog post:** None | **README:** 47 lines, shortest of the five

**Current state:** Briefest README. Has the concept (dispatch panels of reviewers) and quick examples for 4 sub-skills, but no detailed walkthrough. Missing: star CTA, marketplace install step, license. Needs the most README work of the five.

### Plan

1. **README: Expand significantly** — This needs more than a problem framing paragraph. Add:
   - Opener: "Your project is about to ship. Instead of one reviewer catching what they catch, Review Squad dispatches a panel — security analyst, UX critic, performance specialist, pedantic nitpicker — each doing deep parallel analysis and reporting back."
   - A full example showing what the output actually looks like (agent reports coming back)
   - "When to use which skill" comparison table (experts vs normies vs regulars vs well-actually)

2. **README: Add star CTA** — "If Review Squad caught something your tests didn't, a star helps us know it's landing."

3. **README: Add marketplace install step**

4. **MIT license** — Standard MIT.

5. **GitHub topics** — Add: `claude-code`, `ai-agents`, `automation`, `code-review`

6. **README: Attribution footer** — `Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)`

7. **GitHub homepage** — Set to marketplace plugin page.

---

## Execution Order

1. **Simmer first** — strongest story, blog post exists, most viewed plugin
2. **Deliberation second** — most unique concept, blog post exists
3. **Test Kitchen third** — two blog posts, strong developer appeal
4. **Binary RE fourth** — niche but passionate audience, no blog dependency
5. **Review Squad fifth** — needs most README work, benefits from demo creation

## Common Steps (batch before individual work)

```bash
# MIT license for all 5 (same text, run once)
for repo in simmer deliberation test-kitchen binary-re review-squad; do
  # Add LICENSE file to each repo
done

# Add shared topics to all 5
for repo in simmer deliberation test-kitchen binary-re review-squad; do
  gh repo edit 2389-research/$repo --add-topic claude-code --add-topic ai-agents --add-topic automation
done
```

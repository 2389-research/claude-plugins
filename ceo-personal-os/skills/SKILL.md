---
name: ceo-personal-os
description: Use when building a personal productivity or operating system for a CEO, founder, or executive - when user mentions annual reviews, personal OS, life planning, goal setting systems, or executive coaching frameworks
---

# CEO Personal Operating System

## Overview

Build a **reflection system**, not a task manager. This is a private, single-user operating system for executives that combines thoughtful frameworks with coaching-style prompts. Output should feel like an executive coach, chief of staff, and accountability partner - calm, direct, insightful.

**Core principle:** Clarity over productivity theater. No hustle culture. No corporate jargon.

## When to Use

- User wants a "personal operating system" or "personal productivity system"
- Building annual review or goal-setting system for an executive
- Creating reflection frameworks for a CEO/founder
- User mentions frameworks: Gustin, Ferriss Lifestyle Costing, Vivid Vision, Life Map

## Required Structure

**MANDATORY: Use TodoWrite to create todos for each folder/file.**

Create this exact structure in `ceo-personal-os/`:

```
ceo-personal-os/
├── README.md                    # How to use (personalize in 15 min)
├── principles.md                # User's core operating principles
├── memory.md                    # Extracted patterns & insights
├── frameworks/
│   ├── annual_review.md         # Gustin-style reflection
│   ├── vivid_vision.md          # Robbins-style future visualization
│   ├── ideal_life_costing.md    # Ferriss lifestyle design
│   └── life_map.md              # Lieberman 6-domain model
├── interviews/
│   ├── past_year_reflection.md  # Coach-style year review
│   ├── identity_and_values.md   # Who am I becoming?
│   └── future_self_interview.md # 10-year visualization
├── reviews/
│   ├── daily/                   # 5-min daily check-ins
│   ├── weekly/                  # Weekly strategic reviews
│   ├── quarterly/               # Quarterly goal reviews
│   └── annual/                  # Annual comprehensive reviews
├── goals/
│   ├── 1_year.md               # This year's priorities
│   ├── 3_year.md               # Medium-term vision
│   └── 10_year.md              # Long-term life design
└── uploads/
    ├── past_annual_reviews/     # Historical reviews for analysis
    └── notes/                   # Miscellaneous documents
```

## Framework Requirements

### 1. Dr. Anthony Gustin Annual Review

Credit: [@dranthonygustin](https://x.com/dranthonygustin)

Include these reflection categories:
- Wins and celebrations
- Lessons and failures
- Relationships (nurtured/neglected)
- Energy patterns (what gave/drained)
- Growth areas identified
- Unfinished business
- Narrative synthesis of the year

### 2. Tim Ferriss Ideal Lifestyle Costing

Credit: [@tferruss](https://x.com/tferruss)

Include:
- Monthly lifestyle cost calculation
- "Dreamlines" - specific lifestyle goals with costs
- Target Monthly Income (TMI) calculation
- Gap analysis: current vs. ideal
- Concrete steps to close the gap

### 3. Tony Robbins Vivid Vision

Include:
- Write in present tense, 3 years from now
- Describe a typical ideal day in detail
- Include all life domains
- Make it emotionally compelling
- Revisit and refine quarterly

### 4. Alex Lieberman Life Map

Credit: [@businessbarista](https://x.com/businessbarista)

Track these 6 domains:
- **Career**: Role, impact, growth
- **Relationships**: Family, friends, community
- **Health**: Physical, mental, energy
- **Meaning**: Purpose, contribution, legacy
- **Finances**: Security, freedom, generosity
- **Fun**: Play, adventure, creativity

Rate each 1-10 quarterly. Identify imbalances.

## Additional Frameworks to Include

- **CEO Energy Management**: Track energy, not just time
- **Personal Board of Directors**: 5 advisors for key life areas
- **Regret Minimization**: Bezos framework for decisions
- **Leverage vs. Effort**: Where does input create disproportionate output?

## Interview Script Requirements

Coach-style questions (non-judgmental, reflective):

```markdown
## Past Year Reflection
- "Tell me about the last year -- highlights first."
- "What drained you the most?"
- "Where did you avoid hard decisions?"
- "What are you proud of that no one else sees?"
- "What would you not repeat under any circumstances?"
- "If this year repeated ten times, would you be satisfied?"
```

```markdown
## Identity & Values
- "What do you believe that most people don't?"
- "When do you feel most alive?"
- "What would you do if you couldn't fail?"
- "Who do you want to become?"
```

```markdown
## Future Self Interview
- "It's 10 years from now. Describe your day."
- "What did you have to give up to get here?"
- "What do you wish you had started sooner?"
- "What advice would future-you give present-you?"
```

## Review Cadence Specifications

### Daily Check-in (5 minutes max)
- Energy level (1-10)
- One meaningful win
- One friction point
- One thing to let go of
- One priority for tomorrow

### Weekly Review (30-45 minutes)
- What moved the needle?
- What was noise?
- Where did time leak?
- One strategic insight
- One adjustment for next week

### Quarterly Review
- Goal progress vs. plan
- Misalignment detection
- Energy vs. output analysis
- Course correction decisions

### Annual Review
- Gustin-style full reflection
- Life Map update (all 6 domains)
- Ideal Lifestyle Costing refresh
- Vivid Vision revision
- Past year narrative
- Next year intent document

## Required Placeholders

Every template MUST include these for personalization:
- `[YOUR COMPANY]`
- `[YOUR ROLE]`
- `[YOUR STAGE OF LIFE]`
- `[YOUR CURRENT PRIORITIES]`
- `[YOUR PRIMARY RELATIONSHIP]`

## Memory & Pattern Extraction

The `memory.md` file must:
- Store extracted insights from uploaded documents
- Track repeated themes across years
- Note recurring goals (achieved/not achieved)
- Identify blind spots and patterns
- Generate "Executive Pattern Summary" when documents uploaded

When user uploads to `uploads/`:
1. Summarize the document
2. Extract patterns (goals, failures, strengths, themes)
3. Append key insights to `memory.md`
4. Reference in future reviews

## Tone Requirements

**DO:**
- Calm, executive-level
- Direct and clear
- Insightful questions
- Psychologically safe
- Simple explanations

**DON'T:**
- Hustle culture ("crush it", "grind")
- Therapy speak ("holding space")
- Corporate jargon ("synergize")
- Productivity porn ("10x your output")
- Overwhelming complexity

## README Requirements

The README.md must explain:
1. How to use the system daily (1 paragraph)
2. How to use weekly (1 paragraph)
3. How to use quarterly (1 paragraph)
4. How to use annually (1 paragraph)
5. How to personalize in under 15 minutes
6. How to upload past documents
7. Quick-start for day one

## Completion Checklist

- [ ] All folders and files created per structure
- [ ] All 4 frameworks documented with credits
- [ ] All 3 interview scripts with coaching questions
- [ ] All 4 review cadences with templates
- [ ] All goal files (1/3/10 year) populated
- [ ] memory.md initialized with pattern tracking structure
- [ ] Placeholders throughout for personalization
- [ ] README explains daily/weekly/quarterly/annual usage
- [ ] Tone is calm, direct, insightful throughout
- [ ] No generic productivity advice substituted for specified frameworks

## Review Templates Required

Each review folder MUST contain a template file:
- `reviews/daily/template.md` - 5-question daily check-in
- `reviews/weekly/template.md` - Strategic weekly review
- `reviews/quarterly/template.md` - Goal & alignment review
- `reviews/annual/template.md` - Comprehensive annual review

These are the TEMPLATES users copy to create dated entries.

## Assumptions to Document

Include an `assumptions.md` section in README.md documenting:
- User is a CEO/founder/executive (non-technical is fine)
- Single user, private system (not shared)
- Uses markdown-compatible editor (Obsidian, VS Code, etc.)
- 15-30 min/week commitment minimum
- Annual review takes 4-6 hours

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "I'll use Eisenhower instead" | Skill specifies Gustin, Ferriss, Robbins, Lieberman. Use those. |
| "Memory.md is optional" | It's required for pattern extraction across years |
| "Daily check-in is too simple" | 5 minutes max is intentional. Simplicity is the feature. |
| "I'll add more productivity frameworks" | Less is more. Four specific frameworks, not twelve generic ones. |
| "The tone can be more motivational" | Calm and direct. No hustle culture. |
| "Templates aren't needed in review folders" | Each review folder needs its template.md |

## Red Flags - STOP

If you catch yourself doing any of these:

- Using generic frameworks (Eisenhower, 80/20) instead of specified ones
- Creating a task manager instead of a reflection system
- Skipping memory.md or uploads structure
- Using hustle culture language
- Making it feel like a productivity app
- Substituting your own frameworks for the required ones
- Skipping template.md files in review folders

**All of these mean: Re-read this skill. Follow the specifications.**

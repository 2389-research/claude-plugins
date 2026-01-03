---
name: ceo-personal-os
description: Use when building a personal productivity or operating system for a CEO, founder, or executive - when user mentions annual reviews, personal OS, life planning, goal setting systems, executive coaching frameworks, Bill Campbell / Trillion Dollar Coach, startup failure patterns, Good to Great / Level 5 Leadership, Buy Back Your Time, E-Myth / work ON not IN your business, or Customer Development / Steve Blank / get out of the building
---

# CEO Personal Operating System

## Overview

Build a **reflection system**, not a task manager. This is a private, single-user operating system for executives that combines thoughtful frameworks with coaching-style prompts. Output should feel like an executive coach, chief of staff, and accountability partner - calm, direct, insightful.

**Core principle:** Clarity over productivity theater. No hustle culture. No corporate jargon.

## First Run: Onboarding Flow

**When this skill is triggered, immediately do this:**

### Step 1: Welcome & Detect State

Check if `ceo-personal-os/` directory exists in the current workspace.

**If NO directory exists**, say:

> "I'll help you build your personal operating system. This is a reflection system - think executive coach, not task manager.
>
> It includes 10 frameworks from people like Bill Campbell, Jim Collins, Steve Blank, and Dan Martell, plus 10 coaching-style interview scripts.
>
> **Ready to set it up?** I'll create the full structure and walk you through personalizing it."

Then immediately start building using TodoWrite to track every file.

**If directory EXISTS**, say:

> "Welcome back. What would you like to do?"
>
> 1. **Run a review** (daily, weekly, quarterly, or annual)
> 2. **Run an interview** (stress patterns, time audit, failure detection, etc.)
> 3. **Update goals** (1-year, 3-year, or 10-year)
> 4. **Explore a framework** (Campbell, Collins, Martell, Blank, etc.)
> 5. **Extract patterns** from past reviews

Wait for user choice, then execute.

### Step 2: Build or Execute

**If building fresh:**
1. Create TodoWrite todos for every folder and file in Required Structure
2. Build each file with proper framework content
3. Pause after structure is complete and say:
   > "Structure is ready. Let's personalize it. Which do you want to start with?"
   > - **Principles** - Define your core operating principles
   > - **Vivid Vision** - Describe your 3-year future
   > - **Life Map** - Assess your 6 life domains
   > - **Skip for now** - I'll explore on my own

**If running a review or interview:**
1. Load the appropriate template/script
2. Run through the questions conversationally
3. Save responses to the appropriate file
4. Offer to extract patterns to memory.md

## When to Use

- User wants a "personal operating system" or "personal productivity system"
- Building annual review or goal-setting system for an executive
- Creating reflection frameworks for a CEO/founder
- User mentions frameworks: Gustin, Ferriss Lifestyle Costing, Vivid Vision, Life Map
- User mentions Bill Campbell, Trillion Dollar Coach, or coaching principles
- User wants to develop their people or build better teams
- User mentions startup failure patterns, "Why Startups Fail", or Eisenmann
- User is evaluating venture health or considering when to pivot/quit
- User mentions Good to Great, Level 5 Leadership, Hedgehog Concept, or Jim Collins
- User mentions Buy Back Your Time, Buyback Principle, or Dan Martell
- User mentions E-Myth, working ON vs IN the business, or Michael Gerber
- User is stuck doing technical work instead of strategic work
- User mentions Customer Development, Steve Blank, or "get out of the building"
- User mentions pivot, MVP, product-market fit, or business model canvas
- User mentions earlyvangelists, customer validation, or search vs execute

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
│   ├── life_map.md              # Lieberman 6-domain model
│   ├── campbell_coaching.md     # Bill Campbell people-first principles
│   ├── startup_failure_patterns.md # Eisenmann failure pattern detection
│   ├── good_to_great.md         # Collins Level 5 Leadership & Hedgehog
│   ├── buyback_time.md          # Martell time reclamation system
│   ├── emyth_business.md        # Gerber work ON not IN your business
│   └── customer_development.md  # Blank Customer Development Model
├── interviews/
│   ├── past_year_reflection.md  # Coach-style year review
│   ├── identity_and_values.md   # Who am I becoming?
│   ├── future_self_interview.md # 10-year visualization
│   ├── team_people_reflection.md # Campbell-style people development
│   ├── failure_pattern_detection.md # Eisenmann-style venture health check
│   ├── time_audit.md            # Martell-style time reclamation
│   ├── business_role_assessment.md # Gerber Entrepreneur/Manager/Technician
│   ├── customer_development_check.md # Blank Customer Development check
│   └── leadership_stress_patterns.md # McWilliams-informed self-awareness
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

### 5. Bill Campbell Coaching Principles

Credit: "Trillion Dollar Coach" by Eric Schmidt, Jonathan Rosenberg, Alan Eagle

**Core Principles:**

| Principle | Description |
|-----------|-------------|
| **It's The People** | Your top priority is the well-being and success of your people. Support, respect, trust. |
| **Work The Team, Then The Problem** | When facing any problem, first ensure the right team is in place. |
| **Only Coach The Coachable** | Look for honesty, humility, perseverance, and openness to learning. |
| **The Lovely Reset** | Start meetings with personal check-ins (weekend, family). Creates better decisions. |
| **Free-Form Listening** | Full attention, Socratic questions, no distractions. |
| **Team First** | Commit to the cause, not just personal success. |

**Four Characteristics to Seek in People:**
1. **Smart** - Ability to make "far analogies" across domains
2. **Hard Work** - Willingness to put in the effort
3. **Integrity** - Honest with others and themselves
4. **Grit** - Passion and perseverance to get back up

**The Campbell Yardstick:**
> "I count up how many people I've helped become great leaders. That's how I measure success."

Include in quarterly reviews:
- Who did I develop this quarter?
- Who needs more support?
- Is the right team in place for each challenge?
- Am I creating psychological safety?

**The "What Next?" Framework (Post-50):**
- Be creative - your most creative years are ahead
- Don't be a dilettante - have accountability in everything
- Find people with vitality - often younger
- Apply your unique gifts
- Don't waste time worrying about the future

### 6. Eisenmann Startup Failure Patterns

Credit: "Why Startups Fail" by Tom Eisenmann (Harvard Business School)

**The Six Failure Patterns:**

| Pattern | Stage | Description |
|---------|-------|-------------|
| **Bad Bedfellows** | Early | Wrong team, investors, or partners sink the venture despite a good idea |
| **False Starts** | Early | "Fail fast" taken too far—launching before researching customer needs |
| **False Positives** | Early | Early adopter success misleads about mainstream market demand |
| **Speed Traps** | Late | Hypergrowth leads to disaster as CAC rises and margins erode |
| **Help Wanted** | Late | Financing risk + management gaps during rapid scaling |
| **Cascading Miracles** | Late | Too many "do or die" things must go right—betting on improbable outcomes |

**The Diamond-and-Square Framework:**

Use this to assess venture health. All eight elements must align:

*Diamond (Opportunity):*
- **Customer Value Proposition** - Strong, unmet need + sustainable differentiation
- **Technology & Operations** - Can you build and deliver it?
- **Marketing** - Can you reach customers cost-effectively?
- **Profit Formula** - Unit economics, LTV/CAC > 3, path to break-even

*Square (Resources):*
- **Founders** - Right skills, experience, temperament (not too headstrong or tentative)
- **Team** - Balance of attitude and skill
- **Investors** - Aligned interests, patient capital, value-add beyond money
- **Partners** - Reliable strategic relationships

**Four Types of Entrepreneurial Risk:**

1. **Demand Risk** - Will customers actually want this?
2. **Technological Risk** - Can we build what we envision?
3. **Execution Risk** - Can we attract and manage the right people?
4. **Financing Risk** - Can we raise capital when we need it?

**Key Metrics to Monitor:**

| Metric | Target | Warning Sign |
|--------|--------|--------------|
| Unit Economics | Positive gross profit per unit | Losing money on every transaction |
| LTV/CAC Ratio | > 3.0 | Below 1.0 = doomed |
| Cash Runway | 12-18 months | Less than 6 months |
| Customer Acquisition Cost | Stable or declining | Rising faster than LTV |

**Running on Empty Pattern:**

The hardest decision: When to quit vs. persevere. Warning signs:
- Burning capital investors will never recover
- Team members investing time in doomed venture
- Persisting past point where turnaround odds are minuscule
- "Hope springs eternal" rationalization overriding data

**Include in Quarterly Reviews:**
- Which failure patterns might we be vulnerable to right now?
- Is our Diamond-Square alignment strong?
- What are our current risk levels across the four types?
- Are we tracking toward our key metrics targets?
- If we're struggling, is this a smart bet that hasn't paid off, or are we Running on Empty?

### 7. Jim Collins Good to Great

Credit: "Good to Great" by Jim Collins

**Level 5 Leadership:**

| Level | Description |
|-------|-------------|
| **Level 5** | Executive who builds enduring greatness through a blend of personal humility and professional will |
| **Level 4** | Effective Leader - catalyzes commitment to and pursuit of a clear, compelling vision |
| **Level 3** | Competent Manager - organizes people and resources toward efficient pursuit of objectives |
| **Level 2** | Contributing Team Member - contributes to achievement of group objectives |
| **Level 1** | Highly Capable Individual - makes productive contributions through talent and knowledge |

**Level 5 Paradox:** Ambitious for the cause, not themselves. Ferociously determined yet humble.

**First Who, Then What:**
- Get the right people on the bus
- Get the wrong people off the bus
- Get the right people in the right seats
- THEN figure out where to drive

**The Hedgehog Concept (Three Circles):**

What lies at the intersection of:
1. **Passion** - What are you deeply passionate about?
2. **Best At** - What can you be the best in the world at?
3. **Economic Engine** - What drives your resource engine? (For non-profits: Time, Money, Brand)

**Confront the Brutal Facts (Stockdale Paradox):**
> "You must maintain unwavering faith that you can and will prevail in the end, regardless of the difficulties, AND at the same time have the discipline to confront the most brutal facts of your current reality."

**The Flywheel:**
- No single breakthrough moment
- Consistent pushing in an intelligent direction
- Momentum builds turn by turn
- Results attract resources → stronger organization → better results → more resources

**Culture of Discipline:**
- Disciplined people (don't need hierarchy)
- Disciplined thought (confront brutal facts)
- Disciplined action (aligned to Hedgehog Concept)

**Include in Quarterly Reviews:**
- Am I operating at Level 5 (humble + determined)?
- Do I have the right people on the bus?
- Am I clear on my Hedgehog Concept?
- Am I confronting brutal facts while maintaining faith?
- Is the flywheel building momentum?

### 8. Dan Martell Buy Back Your Time

Credit: "Buy Back Your Time" by Dan Martell

**The Buyback Principle:**
> "Don't hire to grow your business. Hire to buy back your time."

**The Buyback Loop (Audit-Transfer-Fill):**
1. **Audit** - What tasks drain you that are easy/inexpensive to delegate?
2. **Transfer** - Who can take these over (better suited, enjoys them)?
3. **Fill** - What high-value work should you do instead?

Repeat continuously to upgrade your time throughout your entrepreneurial journey.

**The Pain Line:**

The point where growth becomes impossible because:
- More business growth = more pain
- You'll subconsciously sabotage growth to avoid pain

**Three Ways Entrepreneurs Self-Destruct at the Pain Line:**

| Response | Description |
|----------|-------------|
| **Sell** | Desperate to exit, sell on bad terms |
| **Sabotage** | Subconsciously make bad decisions to stay small |
| **Stall** | Consciously decide not to grow (slow death) |

**The DRIP Matrix:**

| | Low $ Value | High $ Value |
|---|---|---|
| **Draining** | Delegate | Replace |
| **Energizing** | Invest | Production |

Focus on the **Production Quadrant**: High value + Energizing work.

**Calculate Your Buyback Rate:**
- Take your effective hourly rate
- Anything below that rate should be delegated
- Example: If you make $200/hr effective, delegate anything that can be done for $50/hr

**The 5 Time Assassins:**
1. The Staller (perfectionism)
2. The Speed Demon (rushing without thinking)
3. The Supervisor (micromanaging)
4. The Saver (hoarding tasks)
5. The Self-Medicator (vices to cope)

**Perfect Week Design:**
- Design your ideal week in advance
- Block time for high-value activities
- Protect creative/strategic time
- Build in recovery

**Include in Weekly Reviews:**
- Am I doing $10/hr work when I'm worth $200/hr?
- What can I audit-transfer-fill this week?
- Am I hitting my Pain Line? How do I know?
- Am I in my Production Quadrant enough?

### 9. Michael Gerber E-Myth

Credit: "The E-Myth Revisited" by Michael E. Gerber

**The E-Myth (Entrepreneurial Myth):**
> The fatal assumption: "If you understand the technical work of a business, you understand a business that does that technical work."

This is FALSE. A great baker does not necessarily make a great bakery owner.

**Three Personas in Every Business Owner:**

| Persona | Focus | Wants |
|---------|-------|-------|
| **The Entrepreneur** | Future vision, dreams | Change, innovation |
| **The Manager** | Order, systems, control | Predictability, planning |
| **The Technician** | Present work, doing | Getting things done |

Most small business owners are 10% Entrepreneur, 20% Manager, 70% Technician.

**The Entrepreneurial Seizure:**

The moment when a technician thinks: "Why am I working for this person? I could do this myself!"

Then starts a business and immediately becomes enslaved by it—because they're still just a technician, now with 10 more jobs they don't know how to do.

**Work ON Your Business, Not IN It:**

| Working IN | Working ON |
|------------|------------|
| Doing the technical work | Building systems |
| Reacting to problems | Designing processes |
| Being indispensable | Creating replaceability |
| Trading time for money | Building scalable value |

**The Turn-Key Revolution (Franchise Prototype):**

Build your business as if you were going to franchise it:
- Systems run the business
- People run the systems
- Document everything
- Make it work without you

**Business Development Process:**
1. **Innovation** - Continuous improvement
2. **Quantification** - Measure everything important
3. **Orchestration** - Eliminate discretion at operating level

**The Three Phases of Business:**

| Phase | Description | Problem |
|-------|-------------|---------|
| **Infancy** | Technician's phase, owner does everything | Burns out |
| **Adolescence** | Gets help but abdicates management | Chaos when growth hits |
| **Maturity** | Entrepreneurial perspective, systems-driven | Sustainable |

**Include in Quarterly Reviews:**
- Am I working ON or IN the business?
- What's my Entrepreneur/Manager/Technician balance?
- Could someone run this business from a manual?
- What systems need to be built or documented?
- Am I building a business or just creating a job?

### 10. Steve Blank Customer Development

Credit: "The Startup Owner's Manual" by Steve Blank & Bob Dorf

**Core Insight:**
> "A startup is a temporary organization designed to search for a repeatable and scalable business model."

**Startups ≠ Small Versions of Big Companies:**
- Startups are SEARCHING for a business model
- Existing companies are EXECUTING a known business model
- Different rules apply to each

**The Customer Development Model (4 Steps):**

| Step | Phase | Description |
|------|-------|-------------|
| **1. Customer Discovery** | Search | Turn hypotheses into facts by talking to customers |
| **2. Customer Validation** | Search | Prove repeatable, scalable business model exists |
| **3. Customer Creation** | Execute | Build end-user demand, scale acquisition |
| **4. Company Building** | Execute | Transition from startup to company |

**The #1 Rule: Get Out of the Building**
> "Facts live outside the building, where future customers live and work."

Founders must do this personally—cannot be delegated to employees or consultants.

**The 9 Deadly Sins of Product Introduction:**
1. Assuming "I know what the customer wants"
2. The "I know what features to build" flaw
3. Focus on launch date over customer learning
4. Emphasis on execution instead of hypothesis testing
5. Business plans presume no trial and no errors
6. Confusing job titles with what a startup needs
7. Sales and marketing execute to a plan (no iteration)
8. Presumption of success leads to premature scaling
9. Management by crisis leads to a death spiral

**Search vs Execute:**

| Search Mode | Execute Mode |
|-------------|--------------|
| Hypotheses, testing, learning | Plans, forecasts, metrics |
| Customer Development Team | Functional departments |
| "Learning and discovery" culture | "Fear of failure" culture |
| Pivot when hypotheses wrong | Fire people when plans fail |

**Key Concepts:**

| Concept | Definition |
|---------|------------|
| **Pivot** | Substantive change to one or more business model components |
| **Iteration** | Minor adjustment to business model |
| **MVP** | Minimum Viable Product - smallest feature set to learn from |
| **Earlyvangelists** | Visionary customers who buy unfinished products |
| **Product/Market Fit** | Business model matches customer segment needs |

**The Business Model Canvas (9 Boxes):**
1. Value Proposition
2. Customer Segments
3. Channels
4. Customer Relationships
5. Revenue Streams
6. Key Resources
7. Key Activities
8. Key Partners
9. Cost Structure

**4 Market Types (Changes Everything):**

| Market Type | Strategy |
|-------------|----------|
| **Existing Market** | Compete on features, faster/better/cheaper |
| **New Market** | Create demand, educate customers |
| **Re-segmented (Low-cost)** | "Good enough" at lower price |
| **Re-segmented (Niche)** | Specialized for underserved segment |
| **Clone** | Copy successful model from another country |

**Startup Metrics That Matter:**
- Cash burn rate
- Months of cash left
- Customer acquisition cost validated?
- Hypotheses tested and validated?
- Is the business model repeatable?
- Is it scalable?

**The Customer Development Manifesto (14 Rules):**
1. No facts inside the building—get outside
2. Pair Customer Development with Agile Development
3. Failure is integral to the search
4. Make continuous iterations and pivots
5. No business plan survives first contact with customers
6. Design experiments and test hypotheses
7. Agree on market type—it changes everything
8. Startup metrics differ from existing companies
9. Fast decision-making, speed, and tempo
10. It's all about passion
11. Startup job titles are different
12. Preserve cash until needed, then spend
13. Communicate and share learning
14. Success begins with buy-in

**Include in Quarterly Reviews:**
- Are we searching or executing? (Be honest)
- What hypotheses have we tested this quarter?
- How much time did founders spend outside the building?
- Have we achieved product/market fit?
- What did we learn from failures?
- Are we pivoting based on data or gut feelings?
- What market type are we in?

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

```markdown
## Team & People Reflection (Campbell-style)
- "Who are you most proud of developing this year?"
- "Who on your team needs more support right now?"
- "Is the right team in place for your biggest challenge?"
- "What keeps you up at night about your people?"
- "Who have you helped become a great leader?"
- "Are you creating psychological safety? How do you know?"
- "Who do you need to have a hard conversation with?"
```

```markdown
## Failure Pattern Detection (Eisenmann-style)
- "Which of the six failure patterns might you be vulnerable to right now?"
- "Is your Diamond (opportunity) and Square (resources) aligned?"
- "Are you chasing false positives from early adopters?"
- "Are you growing faster than your unit economics support?"
- "Do you have the right senior team for this stage of growth?"
- "How many 'miracles' need to happen for your vision to succeed?"
- "Are you persisting past the point of reasonable hope?"
- "What would make you decide to pull the plug?"
- "If you shut down today, would that be a smart bet that didn't pay off, or a failure to face reality?"
```

```markdown
## Time Audit (Martell-style)
- "What did you spend your time on this week? List the top 10 activities."
- "For each activity: Is it draining or energizing? Low or high value?"
- "What's your current Buyback Rate? What should it be?"
- "What $10/hr tasks are you still doing?"
- "What would you do with 10 extra hours per week?"
- "Are you hitting your Pain Line? What are the symptoms?"
- "What's the next thing you can audit-transfer-fill?"
- "Are you in your Production Quadrant enough?"
- "Which of the 5 Time Assassins is attacking you most?"
```

```markdown
## Business Role Assessment (Gerber-style)
- "What percentage of your time is spent as Entrepreneur/Manager/Technician?"
- "Are you working ON your business or IN it this week?"
- "Could someone run your business from a manual right now?"
- "What systems desperately need to be documented?"
- "Are you building a business or just creating a job for yourself?"
- "If you were hit by a bus, what would break immediately?"
- "What technical work are you still doing that someone else should do?"
- "Are you enslaved by your business or freed by it?"
- "What would need to change for this business to run without you?"
```

```markdown
## Good to Great Assessment (Collins-style)
- "Are you operating at Level 5 (humble yet fiercely determined)?"
- "Do you have the right people on the bus? Wrong people off?"
- "What is your Hedgehog Concept? (Passion + Best At + Economic Engine)"
- "Are you confronting the brutal facts while maintaining faith?"
- "Is your flywheel building momentum or stalling?"
- "Where are you lacking disciplined people, thought, or action?"
- "Are you 'telling time' or 'building a clock'?"
```

```markdown
## Customer Development Check (Blank-style)
- "Are you in search mode or execute mode right now? Be honest."
- "When was the last time you talked to a customer outside the building?"
- "What hypotheses have you tested this month? What did you learn?"
- "What's your MVP? Is it truly minimal?"
- "Have you found earlyvangelists? Are they paying or just being polite?"
- "Have you achieved product/market fit? How do you know?"
- "What market type are you in? Are you sure?"
- "What would cause you to pivot? Have you defined the triggers?"
- "Are you committing the 9 Deadly Sins? Which ones?"
- "Is your burn rate appropriate for search mode or are you spending like you're executing?"
- "What did you learn from your last failure?"
```

```markdown
## Leadership Stress Patterns (McWilliams-informed)

Credit: Adapted from "Psychoanalytic Diagnosis" by Nancy McWilliams

**Purpose:** Surface unconscious patterns that emerge under pressure. Self-awareness improves how you lead and develop others.

**Denial Check:**
- "This quarter, what uncomfortable truth did I avoid looking at?"
- "Where am I being optimistic in ways disconnected from evidence?"
- "What data am I dismissing because it doesn't fit my narrative?"

**Control Check:**
- "Where did I micromanage instead of delegate?"
- "Did I believe 'only I can do this right' about anything?"
- "Am I trying to control outcomes that aren't controllable?"

**Idealization/Devaluation Check:**
- "Did I put anyone on a pedestal this quarter? Are they still there?"
- "Who did I write off completely? Was that fair?"
- "Am I having extreme swings in my judgment of people?"

**Projection Check:**
- "When I felt frustrated with someone, was I seeing my own issue in them?"
- "Am I attributing motives to others that might actually be mine?"
- "Where am I blaming the team for feelings I'm having?"

**Splitting Check:**
- "Am I using all-or-nothing thinking about any team, department, or person?"
- "Where am I seeing 'us vs them' when it's really just 'us'?"
- "What nuance am I missing by oversimplifying?"

**Stress Response Check:**
- "How is my body responding to stress? (sleep, appetite, health)"
- "Am I working more hours but accomplishing less?"
- "What am I doing to actually process stress vs. avoid it?"

**Integration:**
- "What pattern do I notice in my stress responses?"
- "How are these patterns affecting my team?"
- "What's one thing I could do differently next quarter?"
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
- Campbell check: "Who have I developed?"
- Eisenmann check: "Which failure patterns am I vulnerable to?"
- Collins check: "Is the flywheel building momentum?"
- Martell check: "Am I in my Production Quadrant?"
- Gerber check: "Am I working ON or IN the business?"
- Blank check: "Am I searching or executing? Have I been outside the building?"
- McWilliams check: "What stress patterns showed up this quarter?"
- Diamond-Square alignment review (for founders)

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
- [ ] All 10 frameworks documented with credits (Gustin, Ferriss, Robbins, Lieberman, Campbell, Eisenmann, Collins, Martell, Gerber, Blank)
- [ ] All 10 interview scripts with coaching questions (includes McWilliams-informed stress patterns)
- [ ] All 4 review cadences with templates
- [ ] All goal files (1/3/10 year) populated
- [ ] memory.md initialized with pattern tracking structure
- [ ] Placeholders throughout for personalization
- [ ] README explains daily/weekly/quarterly/annual usage
- [ ] Tone is calm, direct, insightful throughout
- [ ] No generic productivity advice substituted for specified frameworks
- [ ] Campbell check in quarterly reviews ("Who have I developed?")
- [ ] Eisenmann check in quarterly reviews ("Which patterns are we vulnerable to?")
- [ ] Collins check in quarterly reviews ("Is the flywheel building momentum?")
- [ ] Martell check in quarterly reviews ("Am I in my Production Quadrant?")
- [ ] Gerber check in quarterly reviews ("Am I working ON or IN the business?")
- [ ] Blank check in quarterly reviews ("Am I searching or executing?")
- [ ] McWilliams check in quarterly reviews ("What stress patterns showed up?")

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

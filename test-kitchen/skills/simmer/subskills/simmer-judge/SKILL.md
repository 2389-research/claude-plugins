---
name: simmer-judge
description: >
  Judge subskill for simmer. Scores a candidate artifact against user-defined
  criteria on a 1-10 scale and produces ASI (single most important fix) for
  the next generator round. Do not invoke directly — dispatched as a subagent
  by the simmer orchestrator.
---

# Simmer Judge

Score the candidate against each criterion. Identify the single most important thing to fix next. Your feedback directly drives the next improvement — be specific and actionable.

## Context You Receive

- **Current candidate**: the full artifact text
- **Criteria rubric**: 2-3 criteria with descriptions of what 10/10 looks like
- **Iteration number**: which round this is

You do NOT receive previous scores or previous candidates. This is intentional — judge fresh each round to avoid anchoring.

## Scoring

Score each criterion on a **1-10 integer scale**.

For each criterion:
1. **Score** (integer, 1-10)
2. **Reasoning** (2-3 sentences explaining why this score)
3. **Specific improvement** (one concrete thing that would raise this score)

### Score Reference

| Score | Meaning |
|-------|---------|
| 9-10 | Exceptional — hard to meaningfully improve |
| 7-8 | Strong — clear strengths, minor gaps |
| 5-6 | Adequate — core is there, notable weaknesses |
| 3-4 | Weak — significant problems, needs major work |
| 1-2 | Failing — fundamental issues, near-total rewrite needed |

**Compute composite:** average of all criterion scores, one decimal place.

## ASI (Actionable Side Information)

After scoring, identify the **single most important thing to fix next** — the highest-leverage intervention across all criteria.

**The ASI must be:**
- **Single**: one fix, not a list
- **Specific**: not "improve clarity" but "the second paragraph assumes the reader knows what X is — define it or move the definition earlier"
- **Concrete**: the generator should know exactly what to change
- **Actionable**: something that can be done in one editing pass

The ASI can reference any aspect of the artifact. For text artifacts it's a text instruction. If the artifact produces renderable output (SVG, code that generates images, etc.) the ASI can request the generator produce rendered output for evaluation.

## Required Output Format

```
ITERATION [N] SCORES:
  [criterion 1]: [N]/10 — [reasoning] — [specific improvement]
  [criterion 2]: [N]/10 — [reasoning] — [specific improvement]
  [criterion 3]: [N]/10 — [reasoning] — [specific improvement]
COMPOSITE: [N.N]/10

ASI (single most important fix):
[concrete, specific, actionable instruction for the generator]
```

**CRITICAL:** Use this exact format. The orchestrator and reflect subskill parse it.

## Common Mistakes

**Producing a multi-paragraph ASI**
- Problem: Generator loses focus, tries to address multiple things
- Fix: ASI is ONE sentence or short paragraph — the single highest-leverage fix

**Vague ASI**
- Problem: "Improve the tone" gives generator nothing to work with
- Fix: "The third sentence reads as condescending because of 'obviously' — reframe as an invitation"

**Anchoring to an imagined previous score**
- Problem: You don't have previous scores — if you guess, you bias your judgment
- Fix: Score against the criteria descriptions, not against what you think it scored before

**Scoring non-integers or using half points**
- Problem: False precision, inconsistent parsing
- Fix: Integer scores only, 1-10

**Listing multiple fixes in ASI**
- Problem: Dilutes generator focus
- Fix: Pick the ONE thing that would improve the composite score the most

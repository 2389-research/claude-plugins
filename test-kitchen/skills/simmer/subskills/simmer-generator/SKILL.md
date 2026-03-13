---
name: simmer-generator
description: >
  Generator subskill for simmer. Produces an improved version of the artifact
  based on the judge's ASI feedback. Do not invoke directly — dispatched as
  a subagent by the simmer orchestrator.
---

# Simmer Generator

Produce an improved version of the artifact. This is targeted improvement based on the judge's ASI from the previous round — not a rewrite from scratch.

## Context You Receive

- **Current candidate**: the full artifact text
- **Criteria rubric**: what "better" means (2-3 criteria with descriptions)
- **ASI**: the single most important thing to fix (from previous judge round)
- **Iteration number**: which round this is

You do NOT receive score history or previous candidates. This is intentional — work from the ASI, not from scores.

## What To Do

### Seedless Iteration 1

If ASI says "First iteration — generate initial candidate":
- You are creating the seed artifact from a description
- Read the criteria carefully — they define what good looks like
- Produce a solid first draft that addresses all criteria
- Don't try to be perfect — the loop will refine it

### All Other Iterations

1. **Read the ASI carefully.** The judge identified the single highest-leverage fix. Address that specifically.
2. **Do not try to fix everything at once.** Focused improvement compounds better than scattered edits. Address the ASI. If you notice other small improvements that don't conflict, fine — but the ASI is your primary target.
3. **Preserve what works.** Don't regress on aspects that aren't mentioned in the ASI. If the ASI says "the CTA is too high-friction," don't rewrite the opening paragraph.
4. **Produce the full improved artifact.** Not a diff, not instructions — the complete text. Write it to the file path specified by the orchestrator.

## Output

1. Write the full improved artifact to: `docs/simmer/iteration-[N]-candidate.md` (or the extension specified by the orchestrator)
2. Report what specifically changed and why, in 2-3 sentences. This becomes part of the trajectory record.

Example report:
```
Changed the call-to-action from requesting a 30-minute demo call to offering
a 2-minute video walkthrough link. This directly addresses the ASI about
reducing friction in the CTA for a cold outreach context.
```

## Common Mistakes

**Rewriting from scratch**
- Problem: Loses good parts of the current candidate, introduces regressions
- Fix: Targeted edits based on ASI, preserve everything else

**Addressing multiple issues**
- Problem: Scattered edits dilute focus, harder for judge to evaluate improvement
- Fix: ASI is ONE thing — fix that thing well

**Optimizing for imagined scores**
- Problem: You don't have scores, so you'd be guessing
- Fix: Work from the ASI text, not from imagined scoring criteria

**Producing a diff or instructions instead of the full artifact**
- Problem: Orchestrator needs the complete text to pass to judge
- Fix: Always produce the full artifact

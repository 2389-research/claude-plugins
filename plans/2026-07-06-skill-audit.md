# Marketplace-wide skill audit — 2026-07-06

## Goal

Every skill in every 2389-research plugin is "very very good": the description
accurately states what the skill does and when to fire it, the body follows
skill-writing best practices (superpowers:writing-skills + Anthropic guidance),
and nothing is stale, broken, or misleading.

## Method

One Fable audit agent per plugin repo (clones in `/tmp/plugin-skill-audit/`,
re-creatable via `scripts/clone-plugins.sh`). Each agent audited every SKILL.md
against: description accuracy, description format, naming, body quality
(token efficiency, examples, form-matches-failure), structural integrity
(referenced files exist, cross-refs resolve), and plugin coherence
(plugin.json / README / marketplace.json consistency). Orchestrator
spot-checked the six highest-severity claims directly — all confirmed (one
reframed, see Corrections).

Severity: **critical** = broken or actively misleading. **major** = violates
core guidance, hurts discovery/compliance/context budget. **minor** = polish.

## Description formula (decision for the fix phase)

Doctor Biz: "the skill desc should be what the skill does."
superpowers:writing-skills: "description = triggers only, never workflow."
These get merged as:

> `<What it does, one truthful clause>. Use when <concrete triggers/symptoms>.`

Accurate what-it-does statement: yes. Step-by-step workflow enumeration
("first X, then Y, then Z" / "Routes to A, B, or C"): no — tested evidence
shows agents execute the description and skip the body. Some agent-proposed
descriptions below strip all what-it-does content; adjust them to the formula
when applying.

## Audit status

All 23 plugin repos audited (64 skills). MCP-server repos without skills
(agent-drugs, journal-mcp, mcp-socialmedia, slack-mcp): nothing to audit.

- [x] binary-re · building-multiagent-systems · ceo-personal-os ·
  css-development · deliberation · documentation-audit · firebase-development ·
  fresh-eyes-review · git-repo-prep · jam · landing-page-design · prbuddy ·
  remote-system-maintenance · review-squad · scenario-testing · simmer ·
  speed-run · summarize-meetings · terminal-title · test-kitchen · thrifty ·
  worldview-synthesis · xtool

## Corrections applied to raw agent reports

- `AskUserQuestion` and `TodoWrite` ARE real Claude Code tools. Batch-1 agents
  flagged them as nonexistent in css-development, firebase-development, and
  documentation-audit — those findings are DROPPED. (Batches 2–3 were
  inoculated.)
- terminal-title: `CLAUDE_CODE_DISABLE_TERMINAL_TITLE` is a Claude Code core
  env var, not a plugin killswitch, so "scripts don't read it" is not the bug.
  The real bug: README example sets `=0` while CLAUDE.md says `=1` is
  *required* so the built-in updater doesn't fight the plugin. Contradictory
  guidance — reframed below.

## Cross-cutting patterns (fix these as sweeps, not per-file one-offs)

- **P1 — Workflow summaries inside descriptions.** ~40 of 64 skills end the
  description with a process summary ("Routes to…", "Dispatches…",
  "Enforces…", "Guides…"). Known failure mode: agents execute the summary and
  skip the body. Fix: apply the description formula above everywhere.
- **P2 — "This skill should be used when/as" opener** instead of "Use when…"
  (~15 skills: binary-re, building-multiagent-systems, ceo-personal-os,
  css-development, documentation-audit, firebase-development,
  fresh-eyes-review, remote-system-maintenance, scenario-testing,
  test-kitchen×3, worldview-synthesis, xtool, speed-run×5…). Same sweep as P1.
- **P3 — Personal environment leaked into published skills** (CRITICAL):
  firebase-development router has `/Users/dylanr/work/2389/*` paths;
  summarize-meetings hardcodes `/Users/harper/Public/Notes/Harper Notes/` and
  "Doctor Biz" into its agent prompt template. Any other installer silently
  gets broken paths / a stranger's name. Fix: placeholders + setup notes.
- **P4 — Broken/wrong cross-references:** binary-re router+subskills reference
  `binary-re-triage` etc. (hyphen) while real names are `binary-re:triage`
  (colon) — 6+ occurrences; test-kitchen cookoff references
  `fresh-eyes-review:skills` / `scenario-testing:skills` (bogus `:skills`
  suffix); speed-run any-percent lists unqualified superpowers deps
  (`writing-plans`, `git-worktrees`) inconsistent with showdown.
- **P5 — Undocumented hard dependencies:** prbuddy calls `mcp__pal__chat` in
  two skills with zero install/fallback docs (CRITICAL); binary-re invokes
  `episodic-memory:search-conversations` with no prerequisite note;
  review-squad normies/regulars need browser MCP + running dev server but
  descriptions don't say so.
- **P6 — Body bloat, templates inline:** worst offenders (words): simmer 3422
  + judge-board 3298, landing-page-design 3345, thrifty 3096, jam 2469,
  simmer-setup 2591, simmer-judge 2159, dynamic-analysis 2008,
  summarize-meetings 1939, cookoff 1886, thrifty-plan 1787. Standard fix:
  extract prompt templates / scorecards / reference catalogs to
  `references/*.md`, keep the skill as the process spec. (simmer orchestrator
  + tk judge partially justified as orchestration/scoring contracts — trim
  judiciously.)
- **P7 — Intra-plugin doc drift (docs lie about the code/skills):**
  speed-run CLAUDE.md: `GENERATION_TIMEOUT` documented as ms/30000 but code
  reads *seconds* (default 120) — a user setting 30000 gets an 8.3-hour
  timeout (CRITICAL); default model documented as `llama-4-scout-17b-16e`
  but code uses `gpt-oss-120b`; savings claim 60% vs 90% inconsistency.
  ceo-personal-os says "10 framework files" ×3 while 11 exist (agents stop at
  10). building-multiagent-systems CLAUDE.md says six patterns, plugin has
  seven (MAKER missing). simmer README says four subskills, has five.
  test-kitchen omakase-off line 12 says cookoff = "same plan" — cookoff
  explicitly does per-agent plans (CRITICAL mental-model error).
  terminal-title README `=0` vs CLAUDE.md "`=1` required" contradiction.
- **P8 — Copy-paste duplication across skills:** css-development pattern
  block ×4 files; git-repo-prep ecosystem table ×2; prbuddy prevention
  hierarchy ×3; binary-re "Compare Known I/O" block in router + static
  (static-analysis shouldn't run binaries at all — boundary violation).
  Fix: one canonical location + cross-reference.
- **P9 — Over-generic triggers (wrong-time firing):** jam + jam-router both
  fire on bare "build/create/implement" (confirmed live: both load with
  near-identical descriptions); test-kitchen router+omakase-off also claim
  every "build X" (intentional entry-gate? decide policy); fresh-eyes-review
  fires on conversational "done/finished/complete"; firebase debug/validate
  fire on bare "error"/"validate" with no Firebase qualifier;
  scenario-testing lists "mock"/"unit test" as if in-scope when the skill
  exists to intercept them.
- **P10 — Metadata gaps:** `keywords` missing from plugin.json in
  deliberation, scenario-testing, summarize-meetings, terminal-title,
  worldview-synthesis (+ others); README install syntax
  `/plugin install X@2389-research` used across repos — verify against
  current Claude Code docs once, then sweep-fix all READMEs.

## Per-plugin findings

### binary-re (6 skills)
| Skill | Verdict | Key findings |
|---|---|---|
| router `binary-re` (1416w) | MISLEADING | [maj] desc summarizes routing workflow (P1) + "This skill should…" (P2); [maj] desc promises pyc/bytecode/marshal but body has only a doc pointer — add content or drop triggers; [maj] 6× hyphen cross-refs → colon names (P4); [maj] undocumented `episodic-memory:search-conversations` dep (P5); [min] I/O-compare block duplicated in static (P8) |
| triage (916w) | ACCURATE | [maj] hyphen refs in Next Steps (P4) |
| static-analysis (1371w) | ACCURATE | [maj] "Pre-Analysis: run the binary" block is dynamic-analysis content in the static skill — remove (P8); [maj] hyphen refs (P4) |
| dynamic-analysis (2008w) | ACCURATE | [maj] split Frida/Docker/on-device options to reference file (P6); [maj] hyphen ref (P4) |
| synthesis (1318w) | ACCURATE | [min] STIX/TAXII niche section → reference file |
| tool-setup (1593w) | ACCURATE | [min] note gef.blah.cat is the canonical GEF upstream |

Plugin-level: README hides the 5 sub-skills; plugin.json "structured" vs
marketplace "hypothesis-driven"; marketplace arch list omits MIPS/RISC-V.

### building-multiagent-systems (1 skill)
- (1215w) FORMAT-ONLY. [maj] P2 opener + quoted trigger-list style; [maj]
  MAKER trade-off row says "5× cost" contradicting maker-pattern.md's
  cost-parity math — fix to per-subtask framing; [min] trim checklist/pitfalls
  duplication (~230w); [min] YOLO/Safety-First jargon needs pointer; [min]
  two-hop reference chain. Plugin: CLAUDE.md six-vs-seven drift (P7);
  marketplace desc could add MAKER/hardening keywords.

### ceo-personal-os (1 skill)
- (860w) DRIFTED. [maj] desc says "productivity" — body explicitly rejects
  that framing; use "reflection system" language; [maj] "10 framework files"
  ×3 vs 11 actual (P7 — agents will underbuild); [min] P2 opener; [min]
  McWilliams check has no referenced content pointer. Plugin: plugin.json
  names 4/11 frameworks; README table missing Schumacher entirely.

### css-development (4 skills)
- router (766w) DRIFTED: [maj] "Routes to…" desc (P1); [min] P2 opener; [min]
  body warns against duplication the plugin itself commits.
- create-component (1404w), refactor (1522w), validate (1369w) — all DRIFTED:
  [maj] workflow-summary desc tails (P1); [maj] bloat: 9× "Mark as completed"
  boilerplate, mock reports with invented metrics ("Removed 247 lines") →
  replace with compact output contracts (P6); [min] "Announce Usage" sections
  are token-noise → remove; [min] pattern block duplicated ×4 (P8).

### deliberation (4 skills)
- router (556w) DRIFTED: [maj] "Routes to…" desc (P1); [min] Quick Reference
  duplicates sub-skills.
- clearness (1154w), discernment (1005w), gathered (1227w) — all DRIFTED:
  [maj] process-clause desc tails (P1); [maj] comparison tables duplicate the
  router's routing table (P8); flowchart nitpicks (clearness chart is 3
  diamonds → same leaf; gathered chart bypasses the offer step); gathered's
  behavior-scripts → supporting file. Plugin: stray `skills/plans/` dev
  artifacts inside skills tree; keywords missing (P10).

### documentation-audit (1 skill)
- (490w) DRIFTED: [maj] "Uses two-pass extraction…" desc tail (P1); [maj]
  "always check" patterns are fossilized from the origin project
  (`ai-radio-*.service`, `RADIO_*`) in SKILL.md + checklist.md +
  extraction-patterns.md → generalize to placeholders (agents on other
  codebases run meaningless greps); [min] P2 opener; [min] `claude-sonnet-4-5`
  sample value → generic placeholder.

### firebase-development (5 skills)
- router (831w) FORMAT-ONLY: [CRIT] `/Users/dylanr/...` reference-project
  paths (P3) → GitHub URLs or remove; [maj] Summary section duplicates
  Overview verbatim; [maj] Pattern Summaries duplicate docs/examples (P6/P8);
  [min] P2 opener.
- project-setup (779w), add-feature (853w) DRIFTED: [maj] "Guides…" desc
  tails (P1); [min] `NEXT_PUBLIC_USE_EMULATORS` needs "(Next.js)" qualifier.
- debug (766w) DRIFTED: [CRIT] Step 10 writes to `docs/debugging-notes.md`
  which doesn't exist → create or drop; [maj] bare "error/not working"
  triggers (P9).
- validate (808w) DRIFTED: [maj] bare "validate" trigger (P9); [maj] desc
  tail (P1).

### fresh-eyes-review (1 skill)
- (942w) DRIFTED: [maj] fires on conversational "done/finished/complete"
  (P9) → symptom-based triggers ("about to run git commit / create a PR /
  declare implementation complete"); [maj] P2 opener; [maj] narrative example
  dialogue + time table → compress (~160w); [min] desc omits the performance
  checklist the body has. Plugin: README pre-split install syntax (P10).

### git-repo-prep (3 skills)
- router (138w) ACCURATE: [min] fold keyword list into prose.
- prepare (1196w) DRIFTED: [maj] "Full lifecycle from audit through…" desc
  (P1); [maj] ecosystem table duplicated with review (P8); [min] drop
  "first-time" qualifier.
- review (816w) ACCURATE: [maj] same duplicated table (P8); [min]
  "Re-runnable at any point" is property-not-trigger.
Plugin: CLAUDE.md references nonexistent `skills-dev/git-repo-prep/tests/`;
install syntax verify (P10).

### jam (2 skills)
- jam-router (53w) DRIFTED: [maj] near-duplicate of jam's description — both
  fire on the same generic verbs, double-loading 53w + 2469w for zero routing
  value (confirmed live in this session's skill list). Decide: delete router
  OR make it the sole discovery surface and de-generify (P9).
- jam (2469w) DRIFTED: [maj] workflow-summary sentence (P1); [maj] generic
  build/create/implement triggers (P9); [maj] 5× word budget — extract Phase
  templates (agent prompt, scorecard, result.md) to references/ (P6); [maj]
  dot-flowchart for a strictly linear flow → numbered list; [min] duplicate
  second example (blog post) → cut; [min] "Why This Exists" restates README.

### landing-page-design (1 skill)
- (3345w) DRIFTED: [maj] imperative first sentence + "Guides section-by-
  section…" tail (P1/P2 — note: current desc format is what shipped to the
  live skill list); [maj] 3345w → extract Inspiration Starters, Design
  Resources, Prompt Patterns (~450w) to reference.md (P6); [min] "vibe
  discovery"/"anti-slop" — its own brand keywords — absent from desc.
  Plugin: plugin.json omits Vibe Discovery; CLAUDE.md phase-name drift (P7).

### prbuddy (3 skills)
- ALL three FORMAT-ONLY, workflow-summary-first descs (P1).
- [CRIT ×2] ci Step 6 + reviews Step 4b call `mcp__pal__chat` with no
  prerequisite docs and no fallback (P5) → add PAL prereq section + "if PAL
  unavailable" fallback lines.
- [CRIT] README is install-block-only — no description of what prbuddy does
  (this is what the marketplace site renders).
- [min] prevention hierarchy ×3 (P8); `--not_outdated` flag underscore —
  verify against gh-pr-review --help.

### remote-system-maintenance (1 skill)
- (424w) DRIFTED: [maj] "Provides structured three-phase checklists…" desc
  tail (P1); [min] P2 opener + quoted keyword-list style. Otherwise clean —
  smallest fix in the set.

### review-squad (4 skills)
- experts (1303w), normies (1225w), regulars (1425w) DRIFTED, well-actually
  (1102w) minor: [maj] "Dispatches…" workflow descs (P1); [maj]
  normies/regulars: browser-MCP + running-dev-server prereqs invisible in
  descs (P5); [min] panel tables could move to references (P6). Boundaries
  between the four are otherwise clean. Plugin: install syntax verify (P10).

### scenario-testing (1 skill)
- (453w) DRIFTED: [maj] "Enforces scenario-driven testing in .scratch/…"
  desc tail (P1); [maj] "mock"/"unit test" listed as flat keywords reading as
  in-scope uses — reframe as interception conditions ("when tempted to mock")
  (P9); [min] P2 opener; [min] "Why This Matters" duplicates Truth Hierarchy;
  [min] self-referential quote. Plugin: keywords missing (P10).

### simmer (6 skills)
- simmer (3422w) DRIFTED: [maj] desc is a full workflow summary (P1); body
  length largely justified as orchestration spec — note only.
- simmer-judge-board (3298w) DRIFTED: [maj] desc = three-phase workflow dump
  (P1); [maj] Judge Primitive Library (~650w) → judge-primitives.md (P6).
- simmer-judge (2159w): [min] desc workflow summary; [min] "do not invoke
  directly" imprecise — board panelists DO invoke it → "not from user
  context".
- setup (2591w) / generator (1229w) / reflect (1243w) FORMAT-ONLY: [min]
  desc format; low risk (dispatched by exact name).
- Plugin: README "four subskills" vs five (P7); JUDGE_PANEL field missing
  from setup's output-brief template while orchestrator+board expect it —
  real contract gap.

### speed-run (5 skills)
- [CRIT] CLAUDE.md `GENERATION_TIMEOUT` ms-vs-seconds doc bug (P7 — verified
  against cerebras-client.ts:33).
- [maj] CLAUDE.md default-model drift (`llama-4-scout` vs code's
  `gpt-oss-120b`); [min] 60% vs 90% savings inconsistency.
- router (381w), turbo (545w), showdown (1271w), judge (1089w) DRIFTED +
  any-percent (1217w) FORMAT-ONLY: [maj] routing/workflow desc tails (P1);
  [maj] runner/agent prompt blocks + scorecard template → reference files
  (P6); [min] unqualified superpowers deps in any-percent (P4).

### summarize-meetings (1 skill)
- (1939w) desc ACCURATE, body has the set's worst P3: [CRIT] agent prompt
  template hardcodes Harper's vault path — every spawned agent on another
  install writes to the wrong vault silently; [CRIT] "Relationship to Doctor
  Biz" in extraction rules → "vault owner"; [maj] 4 YAML templates +
  transcript format → reference files (P6); [min] linear flowchart → list;
  [min] keyword-quote desc style.

### terminal-title (1 skill)
- (348w) MISLEADING: [maj] desc is enforcement language ("MANDATORY",
  "MUST") not triggers — move enforcement to body (it's already there);
  [maj] `<skill-base-dir>` placeholder in fallback path is unexpandable by
  agents → concrete path or find instruction; [maj] README `=0` example vs
  CLAUDE.md "`=1` required" contradiction (see Corrections) → decide the
  truth, align README+CLAUDE.md+skill; [min] ps1 not executable; keywords
  missing (P10).

### test-kitchen (4 skills)
- [CRIT] omakase-off:12 says cookoff = "same plan, multiple implementations"
  — cookoff's whole point is per-agent plans (verified). Fix the line.
- router (610w), cookoff (1886w), omakase-off (694w) DRIFTED: [maj]
  routing/workflow desc tails (P1); [min] P2 openers; [maj] cookoff bloat →
  references (P6); [min] cookoff dual dependency tables → merge; [min]
  `fresh-eyes-review:skills` / `scenario-testing:skills` bogus refs (P4);
  [min] omakase-off summary table omits judge dep.
- judge (986w) ACCURATE — length justified as scoring contract; [min] qualify
  caller names.
- Plugin: catalog descs omit the design-exploration entry gate; README deps
  omit test-kitchen:judge.

### thrifty (6 skills)
- ALL six DRIFTED: descriptions carry workflow summaries (P1) — orchestrator
  worst (5 lines of architecture narrative); subskills should lead with "Do
  not invoke directly" + one context line (thrifty-plan currently lacks the
  marker entirely).
- Plugin: [maj] plugin.json claims Haiku executes "in parallel" — SKILL.md
  explicitly forbids per-unit fan-out in the subagent flow → scope the claim
  to dispatch; [min] "~64% cheaper" headline lacks the eval's own caveat
  (drifted to ~43% on large tasks) → date-qualify + link eval/RESULTS.md;
  [min] "sprints" vs "units" vocabulary conflation; [min] "an thrifty" typo;
  [min] undated "Confirmed working as of this writing".

### worldview-synthesis (1 skill)
- (1030w) DRIFTED: [maj] "Surfaces beliefs… generates narrative outputs"
  desc tail (P1); [maj] body never mentions its own references/
  (interrogation-questions.md, schema.yaml are orphaned — agents can't find
  them) → add pointer section + trim inline duplication; [min] P2 opener;
  [min] inline schema enum missing `epistemology` vs schema.yaml; keywords
  missing (P10).

### xtool (1 skill)
- `using-xtool` (890w) DRIFTED (mildest in the set): [min] P2 opener; [min]
  topic-list tail → convert to trigger; length fine for a reference skill.
  Plugin: label nickyramone/xtool link as third-party upstream.

## Fix phase (after Doctor Biz reviews this doc)

Order of attack:
1. **Criticals** (small, surgical): P3 personal-data leaks (firebase paths,
   summarize-meetings vault/name); speed-run timeout-units doc bug;
   test-kitchen omakase-off cookoff mischaracterization; firebase debug
   missing file ref; prbuddy PAL prereq + empty README; binary-re colon refs.
2. **Description sweep** (all 64 skills): apply the description formula;
   fix P1/P2/P9 in one pass per repo; sync plugin.json + marketplace.json
   descriptions to match; regenerate site.
3. **Structural**: dedup shared blocks (P8), extract heavy templates to
   references/ (P6), doc-drift fixes (P7), metadata/keywords + install
   syntax after verifying the correct form once (P10).
4. Each repo: branch → fix → PR. Description-only changes are exempt from
   skill-TDD; behavior-affecting edits (trigger scope changes, router
   deletions like jam-router) get a baseline/verify pass per
   superpowers:writing-skills.

Open questions for Doctor Biz:
- jam-router: delete it, or keep as sole discovery surface? (Currently both
  load and double-fire.)
- test-kitchen/omakase-off intentionally claims EVERY "build/create" request
  — keep that aggressive entry-gate posture or narrow it like jam?
- thrifty "~64% cheaper" headline: date-qualify, or re-run the eval and
  publish the current number?

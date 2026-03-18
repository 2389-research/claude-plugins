# Test 1: Single-File Judge-Only (v1 Backward Compatibility)

## What this tests
Classic simmer v1 behavior: single text artifact, judge-only evaluation, no evaluator command.
Validates that the v2 upgrade didn't break anything.

## Instructions

Run simmer on the extraction prompt below. Use these exact parameters:

```
ARTIFACT: (paste the prompt text below)
ARTIFACT_TYPE: single-file
CRITERIA:
  - instruction precision: 10/10 = every instruction is unambiguous, no room for interpretation, examples cover edge cases
  - output predictability: 10/10 = any LLM following this prompt produces identically structured output regardless of input
  - edge case coverage: 10/10 = handles all transcript styles (tutorials, challenges, reviews, vlogs) without hallucinating or missing entities
ITERATIONS: 3
MODE: from-paste
OUTPUT_DIR: /tmp/simmer-test-1
```

## The Artifact (Extraction Prompt)

```
Extract hobby entities from this miniature painting video transcript chunk.

IGNORE: clothing, food, furniture, pets, room setup, cameras, YouTube/social media, subscriber counts, generic single words ("warm", "bright", "dark", "edges", "water", "sun", "shoes", "rectangular shape"), body parts unless on a miniature.

PRIORITY — Painting theory and concepts:
Pay special attention to painting THEORY discussed in the transcript. These are ideas about HOW and WHY to paint a certain way, not just what paint or tool to use.

EXTRACT theory concepts like: "color temperature", "value contrast", "focal point", "light placement", "reflection placement", "color harmony", "warm shadows", "cool highlights", "contrast ratio", "saturation control", "hue shifting"

YES extract: "he explains that placing highlights closer together increases perceived shininess" → {"name": "reflection placement", "type": "concept"}
YES extract: "using warm tones in the shadows and cool in the highlights" → {"name": "color temperature", "type": "concept"}
NO skip: "I put a highlight here" — just describing an action, not teaching theory
NO skip: "it looks really bright" — generic observation, not a named concept

For all other entities, return name (lowercase) and type from this list:

| type | what to extract | examples |
|------|----------------|----------|
| technique | painting/finishing methods | wet blend, edge highlight, glazing, drybrush, non-metallic metal, zenithal prime, oil wash, stippling, feathering, layering, basecoat, osl |
| paint | specific paint product names | rhinox hide, mephiston red, ice yellow, skeleton horde, dark sea blue, steel legion drab |
| paint_brand | paint/product manufacturers | vallejo, citadel, army painter, ak interactive, scale75, green stuff world, kimera |
| color | abstract color references (no specific product named) | dark brown, warm gold, desaturated yellow, cold gold, neutral gray |
| tool | physical tools and equipment | airbrush, wet palette, hobby knife, sanding strips, silicon sculpting tool, q-tip |
| medium | paint/material categories | contrast paint, oil paint, texture paste, primer, varnish, ink, thinner, pigment powder |
| model | specific miniature kits or units | hive tyrant, intercessor, imperial knight, vangorian lord, fell bat |
| faction | army-level groupings | black templars, tyranids, stormcast eternals, soulblight gravelords |
| game_system | game system names | warhammer 40k, age of sigmar, kill team |
| aesthetic | visual style or quality target | grimdark, parade ready, weathered, high contrast, tabletop standard |
| skill_level | difficulty context | beginner friendly, advanced, competition level |
| body_area | part of miniature being painted | carapace, cloak, base, face, weapon, armor, tabard, shoulder pad |
| assembly | building/construction techniques | kitbashing, converting, 3d printing, gap filling, sub-assembly, magnetizing |
| basing | base-specific materials and techniques | texture paint, cork rock, tufts, rust pigment |
| topic | project type or meta-context | speed painting, display piece, army project, batch painting, golden demon, 24-hour challenge |
| person | painters, sculptors, YouTubers mentioned by name | |
| award | competitions or awards | best in show, golden demon, everchosen |
| concept | painting theory (see PRIORITY section above) | color temperature, value contrast, reflection placement, focal point |

Return JSON:
{
  "entities": [
    {"name": "entity name lowercase", "type": "<type from table>"},
    ...
  ]
}

Transcript chunk:
{chunk_text}
```

## What to report back

1. Did setup correctly detect single-file mode and skip evaluator/background questions?
2. Did the judge produce useful, specific ASI each round?
3. Did the generator follow ASI without rewriting from scratch?
4. Was iteration counting correct (iter 0 = seed judge, then 3 generate rounds)?
5. Final trajectory table
6. Any confusing, broken, or unexpected behavior

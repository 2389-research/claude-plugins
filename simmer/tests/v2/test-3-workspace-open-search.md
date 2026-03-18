# Test 3: Workspace with Open-Ended Search (v2 Full Feature)

## What this tests
Full workspace mode with evaluator and background constraints. The generator can change models, prompt strategy, call topology — whatever it thinks will improve results. This is the autoresearch-style open-ended optimization.

## Setup

Create a workspace for this test:

```bash
mkdir -p /tmp/simmer-test-3/pipeline
cd /tmp/simmer-test-3/pipeline
git init

# Create the pipeline config
cat > config.json << 'EOF'
{
  "ollama_url": "http://localhost:11434/api/chat",
  "model": "qwen3.5:4b",
  "strategy": "single-call",
  "chunk_seconds": 300,
  "overlap_seconds": 30,
  "temperature": 0.3,
  "max_tokens": 2000
}
EOF

# Create the extraction prompt
cat > prompt.md << 'EOF'
Extract hobby entities from this miniature painting video transcript chunk.

Return name (lowercase) and type.

Types: technique, paint, paint_brand, color, tool, medium, model, faction, game_system, aesthetic, skill_level, body_area, assembly, basing, topic, person, award, concept

Return JSON:
{
  "entities": [
    {"name": "entity name", "type": "<type>"},
    ...
  ]
}

Transcript chunk:
{chunk_text}
EOF

# Create the evaluation script
cat > evaluate.sh << 'EVALEOF'
#!/bin/bash
# Reads config.json for model/strategy, runs extraction on 3 test videos,
# compares against Sonnet ground truth, reports results.

set -e
cd /Users/michaelsugimura/Documents/GitHub/DS-scratch/warhammer_mini_sizes

CONFIG_DIR="/tmp/simmer-test-3/pipeline"
MODEL=$(python3 -c "import json; print(json.load(open('$CONFIG_DIR/config.json'))['model'])")
PROMPT_FILE="$CONFIG_DIR/prompt.md"

echo "=== Pipeline Evaluation ==="
echo "Model: $MODEL"
echo "Prompt: $(wc -l < $PROMPT_FILE) lines"
echo ""

# Run extraction with the workspace's prompt and model
OLLAMA_URL=http://localhost:11434/api/chat OLLAMA_MODEL=$MODEL python3 -c "
import json, sys
sys.path.insert(0, '.')
from local_extract_test import build_chunks, extract_chunk, flatten_entities, load_ground_truth

prompt = open('$PROMPT_FILE').read()
test_videos = ['ozXhzdjT8tU', 'DRqUWtnXEXA', 'RcrM5MLNyAM']

total_gt = 0
total_found = 0
total_extra = 0
total_tokens = 0
total_time = 0

for vid in test_videos:
    with open(f'miner_output/transcripts/{vid}.json') as f:
        trans = json.load(f)
    chunks = build_chunks(trans['segments'])
    all_entities = set()
    vid_tokens = 0
    vid_time = 0
    for chunk in chunks:
        result = extract_chunk(chunk['text'], prompt)
        entities = flatten_entities(result['parsed'])
        all_entities.update(entities)
        vid_tokens += result['tokens']
        vid_time += result['time_s']

    gt = load_ground_truth(vid)
    found = all_entities & gt
    missed = gt - all_entities
    extra = all_entities - gt

    print(f'Video {vid}:')
    print(f'  Ground truth: {len(gt)} entities')
    print(f'  Extracted: {len(all_entities)} entities')
    print(f'  Matched: {len(found)}/{len(gt)} ({100*len(found)/max(len(gt),1):.0f}%)')
    print(f'  Missed: {len(missed)} — {sorted(missed)[:10]}')
    print(f'  Extra: {len(extra)} — {sorted(extra)[:10]}')
    print(f'  Tokens: {vid_tokens}, Time: {vid_time:.1f}s')
    print()

    total_gt += len(gt)
    total_found += len(found)
    total_extra += len(extra)
    total_tokens += vid_tokens
    total_time += vid_time

print(f'=== TOTALS ===')
print(f'Coverage: {total_found}/{total_gt} ({100*total_found/max(total_gt,1):.0f}%)')
print(f'Extra entities: {total_extra}')
print(f'Total tokens: {total_tokens}')
print(f'Total time: {total_time:.1f}s')
print(f'Model: \$MODEL')
"
EVALEOF
chmod +x evaluate.sh

git add -A && git commit -m "initial pipeline setup"
```

## Simmer Parameters

```
ARTIFACT: /tmp/simmer-test-3/pipeline
ARTIFACT_TYPE: workspace
CRITERIA:
  - coverage: 10/10 = matches 95%+ of Sonnet ground truth entities across all 3 test videos
  - efficiency: 10/10 = lowest token count and wall-clock time while maintaining coverage
  - noise: 10/10 = zero false positives — extra entities are genuinely hobby-relevant things Sonnet missed, not hallucinations
EVALUATOR: cd /tmp/simmer-test-3/pipeline && ./evaluate.sh
BACKGROUND: |
  Available models via local Ollama: qwen3.5:4b, qwen3.5:9b, qwen3.5:27b, qwen3:32b, gemma3:27b, llama4:16x17b, gpt-oss:20b.
  The pipeline extracts hobby entities from miniature painting video transcripts.
  Transcripts are chunked (5min chunks, 30s overlap) and each chunk is processed independently.
  Patterns to explore: single-call extraction, multi-call (extract-then-structure), different chunk sizes, different models, different prompt strategies.
  The seed uses qwen3.5:4b with a minimal prompt — lots of room to improve.
  Cost is not a real constraint (local inference), but efficiency matters for batch processing 600+ videos.
  The evaluator compares against Sonnet (Claude) ground truth enrichments.
ITERATIONS: 5
MODE: from-workspace
OUTPUT_DIR: /tmp/simmer-test-3/pipeline/docs/simmer
```

## What to report back

1. Did setup detect workspace mode and ask about evaluator + background?
2. Did the generator make strategic moves (model swaps, topology changes) or just tweak the prompt?
3. Was the ASI a coherent direction (e.g., "switch to 27b AND adjust prompt") or fragmented?
4. Did the evaluator actually run each iteration? Results?
5. Did the generator use the background constraints (try different available models)?
6. How did workspace tracking work (git commits per iteration)?
7. Regression handling — did it roll back when a move made things worse?
8. Final trajectory table
9. What was the winning configuration vs the seed?

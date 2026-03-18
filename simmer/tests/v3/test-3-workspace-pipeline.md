# Test 3: Workspace + Pipeline Optimization (Pipeline/Engineering Path)

## What this tests
Full workspace loop: validation before expensive runs, output contract enforcement, search space exploration, git tracking, regression rollback. Exercises every v2/v3 contract.

## Workspace Setup

Create the workspace before dispatching the subagent:

```bash
mkdir -p /tmp/simmer-test-3/pipeline/strategies
cd /tmp/simmer-test-3/pipeline
git init

# Pipeline runner — reads config.json, runs extraction, writes output
cat > run_pipeline.py << 'PYEOF'
#!/usr/bin/env python3
"""
Pipeline runner. Reads config.json for model/strategy, prompt.md for the prompt,
runs extraction on a transcript, outputs JSON matching the output contract.

Supports single-call and multi-call topologies via config.json "strategy" field.
"""
import json
import os
import sys
from pathlib import Path
from urllib.request import urlopen, Request

def load_config():
    with open("config.json") as f:
        return json.load(f)

def ollama_chat(url, model, messages, temperature=0.3, max_tokens=2000):
    payload = json.dumps({
        "model": model,
        "messages": messages,
        "stream": False,
        "think": False,
        "options": {"temperature": temperature, "num_predict": max_tokens},
    }).encode()
    req = Request(url, data=payload, headers={"Content-Type": "application/json"})
    with urlopen(req, timeout=300) as resp:
        result = json.load(resp)
    content = result.get("message", {}).get("content", "")
    if content.startswith("```"):
        lines = content.split("\n")
        content = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
    return content, result.get("eval_count", 0)

def build_chunks(segments, chunk_s=300, overlap_s=30):
    if not segments:
        return []
    total_duration = segments[-1]["start"] + segments[-1].get("duration", 0)
    chunks = []
    start = 0
    while start < total_duration:
        end = start + chunk_s
        chunk_segs = [s for s in segments if s["start"] >= start - overlap_s and s["start"] < end]
        if chunk_segs:
            text_lines = []
            for s in chunk_segs:
                mins = int(s["start"] // 60)
                secs = int(s["start"] % 60)
                text_lines.append(f"[{mins:02d}:{secs:02d}] {s['text']}")
            chunks.append({"text": "\n".join(text_lines)})
        start = end
    return chunks

def run_single_call(config, prompt_template, chunk_text):
    prompt = prompt_template.replace("{chunk_text}", chunk_text)
    messages = [
        {"role": "system", "content": "You are a structured data extractor for miniature painting hobby content. Return only valid JSON."},
        {"role": "user", "content": prompt},
    ]
    content, tokens = ollama_chat(config["ollama_url"], config["model"], messages,
                                   config.get("temperature", 0.3), config.get("max_tokens", 2000))
    return content, tokens

def run_pipeline(config, prompt_template, chunk_text):
    """Route to the right strategy."""
    strategy = config.get("strategy", "single-call")
    if strategy == "single-call":
        return run_single_call(config, prompt_template, chunk_text)
    else:
        strategy_file = Path(f"strategies/{strategy}.py")
        if strategy_file.exists():
            import importlib.util
            spec = importlib.util.spec_from_file_location(strategy, strategy_file)
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)
            return mod.run(config, prompt_template, chunk_text, ollama_chat)
        else:
            print(f"Unknown strategy: {strategy}, falling back to single-call", file=sys.stderr)
            return run_single_call(config, prompt_template, chunk_text)

def main():
    config = load_config()
    prompt = open("prompt.md").read()
    transcript_dir = "/Users/michaelsugimura/Documents/GitHub/DS-scratch/warhammer_mini_sizes/miner_output/transcripts"

    video_id = sys.argv[1] if len(sys.argv) > 1 else None
    test_videos = ["ozXhzdjT8tU", "DRqUWtnXEXA", "RcrM5MLNyAM"]
    if video_id:
        test_videos = [video_id]

    all_results = {}
    total_tokens = 0
    for vid in test_videos:
        with open(f"{transcript_dir}/{vid}.json") as f:
            trans = json.load(f)
        chunks = build_chunks(trans["segments"])
        vid_entities = set()
        vid_tokens = 0
        for chunk in chunks:
            content, tokens = run_pipeline(config, prompt, chunk["text"])
            vid_tokens += tokens
            try:
                parsed = json.loads(content)
                for ent in parsed.get("entities", []):
                    if isinstance(ent, dict) and "name" in ent:
                        vid_entities.add(ent["name"].lower().strip())
            except json.JSONDecodeError:
                print(f"JSON parse error on {vid}", file=sys.stderr)
        all_results[vid] = sorted(vid_entities)
        total_tokens += vid_tokens

    output = {"entities": []}
    seen = set()
    for vid, entities in all_results.items():
        for name in entities:
            if name not in seen:
                output["entities"].append({"name": name, "type": "unknown"})
                seen.add(name)
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
PYEOF

cat > config.json << 'EOF'
{
  "ollama_url": "http://localhost:11434/api/chat",
  "model": "qwen3.5:4b",
  "strategy": "single-call",
  "temperature": 0.3,
  "max_tokens": 2000
}
EOF

cat > prompt.md << 'EOF'
Extract hobby entities from this miniature painting video transcript.

Return JSON:
{
  "entities": [
    {"name": "entity name", "type": "technique|paint|tool|model|concept"},
    ...
  ]
}

Transcript chunk:
{chunk_text}
EOF

cat > evaluate.sh << 'EVALEOF'
#!/bin/bash
set -e
PIPELINE_DIR="/tmp/simmer-test-3/pipeline"
GT_DIR="/Users/michaelsugimura/Documents/GitHub/DS-scratch/warhammer_mini_sizes/miner_output/enrichment"

cd "$PIPELINE_DIR"

echo "=== Pipeline Evaluation ==="
echo "Config: $(cat config.json | python3 -c 'import json,sys; c=json.load(sys.stdin); print(f"model={c[\"model\"]}, strategy={c[\"strategy\"]}")')"
echo "Prompt: $(wc -l < prompt.md) lines"
echo ""

python3 -c "
import json, sys, os
sys.path.insert(0, '$PIPELINE_DIR')
from run_pipeline import build_chunks, run_pipeline, load_config

config = load_config()
prompt = open('prompt.md').read()
transcript_dir = '/Users/michaelsugimura/Documents/GitHub/DS-scratch/warhammer_mini_sizes/miner_output/transcripts'
gt_dir = '$GT_DIR'

test_videos = ['ozXhzdjT8tU', 'DRqUWtnXEXA', 'RcrM5MLNyAM']
total_gt = 0
total_found = 0
total_extra = 0
total_tokens = 0

for vid in test_videos:
    with open(f'{transcript_dir}/{vid}.json') as f:
        trans = json.load(f)
    chunks = build_chunks(trans['segments'])

    all_entities = set()
    vid_tokens = 0
    parse_errors = 0
    for chunk in chunks:
        content, tokens = run_pipeline(config, prompt, chunk['text'])
        vid_tokens += tokens
        try:
            parsed = json.loads(content)
            for ent in parsed.get('entities', []):
                if isinstance(ent, dict) and 'name' in ent:
                    all_entities.add(ent['name'].lower().strip())
        except json.JSONDecodeError:
            parse_errors += 1

    gt_path = f'{gt_dir}/{vid}.json'
    gt = set()
    if os.path.exists(gt_path):
        with open(gt_path) as f:
            data = json.load(f)
        concepts = [c for c in data.get('concepts', []) if c.get('timestamp_approx') is not None]
        gt = {c['concept_name'].lower() for c in concepts}

    found = all_entities & gt
    missed = gt - all_entities
    extra = all_entities - gt

    print(f'Video {vid}:')
    print(f'  Ground truth: {len(gt)} entities')
    print(f'  Extracted: {len(all_entities)} entities')
    print(f'  Matched: {len(found)}/{len(gt)} ({100*len(found)/max(len(gt),1):.0f}%)')
    print(f'  Missed ({len(missed)}): {sorted(missed)[:10]}')
    print(f'  Extra ({len(extra)}): {sorted(extra)[:10]}')
    print(f'  Parse errors: {parse_errors}')
    print(f'  Tokens: {vid_tokens}')
    print()

    total_gt += len(gt)
    total_found += len(found)
    total_extra += len(extra)
    total_tokens += vid_tokens

precision = total_found / max(total_found + total_extra, 1)
recall = total_found / max(total_gt, 1)

print(f'=== TOTALS ===')
print(f'Coverage: {total_found}/{total_gt} ({100*recall:.0f}%')
print(f'Precision: {100*precision:.0f}%')
print(f'Extra entities: {total_extra}')
print(f'Total tokens: {total_tokens}')
print(f'Model: {config[\"model\"]}')
print(f'Strategy: {config[\"strategy\"]}')
"
EVALEOF
chmod +x evaluate.sh

cat > validate.sh << 'VALEOF'
#!/bin/bash
set -e
cd /tmp/simmer-test-3/pipeline
OUTPUT=$(python3 run_pipeline.py ozXhzdjT8tU 2>/dev/null)
echo "$OUTPUT" | python3 -c "
import json, sys
data = json.load(sys.stdin)
entities = data.get('entities', [])
if not isinstance(entities, list):
    print('FAIL: entities is not a list')
    sys.exit(1)
for e in entities[:3]:
    if not isinstance(e, dict) or 'name' not in e:
        print(f'FAIL: entity missing name field: {e}')
        sys.exit(1)
print(f'OK: {len(entities)} entities extracted, format valid')
" || { echo "FAIL: Pipeline produced invalid output"; exit 1; }
VALEOF
chmod +x validate.sh

git add -A && git commit -m "initial pipeline setup"
```

## Subagent Prompt

Dispatch a subagent with the following. The subagent just runs simmer — no meta-knowledge.

```
You are running a simmer refinement loop. Use the simmer skill.

Here is the setup brief — skip setup and proceed directly to the refinement loop.

ARTIFACT: /tmp/simmer-test-3/pipeline
ARTIFACT_TYPE: workspace
CRITERIA:
  - coverage: extracts 90%+ of Sonnet ground truth entities — 10/10 means 100% recall across all test videos
  - efficiency: lowest token count and time while maintaining coverage — 10/10 means minimum tokens with no coverage loss
  - noise: minimal false positives — 10/10 means zero extra entities beyond ground truth
PRIMARY: coverage
EVALUATOR: cd /tmp/simmer-test-3/pipeline && ./evaluate.sh
BACKGROUND: Local Ollama at localhost:11434. Available models: qwen3.5:4b, qwen3.5:9b (both pulled). Evaluator runs take 2-10 min depending on model size. Validation takes ~1 min.
OUTPUT_CONTRACT: JSON object with 'entities' array, each element has 'name' (string, lowercase) and 'type' (string)
VALIDATION_COMMAND: cd /tmp/simmer-test-3/pipeline && ./validate.sh
SEARCH_SPACE: Models: qwen3.5:4b, qwen3.5:9b. Topologies: single-call (current), multi-call (generator can add strategy files to strategies/ dir). Prompt changes: unlimited. The pipeline must produce output matching the output contract regardless of topology.
ITERATIONS: 5
MODE: from-workspace
OUTPUT_DIR: /tmp/simmer-test-3/output
```

## Evaluation Criteria (for inner loop agent)

After the subagent finishes, read its output and the files at `/tmp/simmer-test-3/output/` and the git log at `/tmp/simmer-test-3/pipeline/`. Assess:

1. Did the generator run validate.sh before model/topology changes?
2. Did the generator explore multi-call topology (not just model swaps + prompt tweaks)?
3. When a model failed validation, did it skip or waste a full evaluator run?
4. Did the judge check evaluator output against the output contract?
5. Did best-so-far track by PRIMARY (coverage), not composite?
6. Were raw metrics noted when integer scores tied?
7. Git history: one commit per iteration? Selective rollback preserved trajectory?
8. Trajectory table: clean format, Config column, evaluator details separate?
9. What topologies were explored? What was the winning configuration?

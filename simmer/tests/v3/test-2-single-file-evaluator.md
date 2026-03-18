# Test 2: Single-File + Evaluator (Code/Testable Path)

## What this tests
Evaluator integration: judge receives evaluator output, output contract gets checked, primary criterion drives best-so-far. Single-file mode with a runnable evaluator.

## Subagent Prompt

Dispatch a subagent with the following. The subagent just runs simmer — no meta-knowledge.

```
You are running a simmer refinement loop. Use the simmer skill.

Here is the setup brief — skip setup and proceed directly to the refinement loop.

ARTIFACT: /Users/michaelsugimura/Documents/GitHub/DS-scratch/warhammer_mini_sizes/local_extract_test.py (the PROMPT_V4_FULL variable)
ARTIFACT_TYPE: single-file
CRITERIA:
  - coverage: extracts every entity from Sonnet ground truth — 10/10 means 100% recall
  - noise: zero false positives — 10/10 means 100% precision
  - conceptual depth: captures painting theory concepts (color theory, layering principles) not just concrete items (paint names, brush types) — 10/10 means theory concepts are extracted alongside concrete items
PRIMARY: coverage
EVALUATOR: cd /Users/michaelsugimura/Documents/GitHub/DS-scratch/warhammer_mini_sizes && OLLAMA_URL=http://localhost:11434/api/chat OLLAMA_MODEL=qwen3.5:4b python3 local_extract_test.py v4_full
BACKGROUND: Local Ollama at localhost:11434. Model: qwen3.5:4b. Scores may be low — the point is evaluator integration, not high performance.
OUTPUT_CONTRACT: JSON object with 'entities' array, each element has 'name' (string, lowercase) and 'type' (string from the taxonomy table in the prompt)
ITERATIONS: 3
MODE: from-file
OUTPUT_DIR: /tmp/simmer-test-2
```

## Evaluation Criteria (for inner loop agent)

After the subagent finishes, read its output and the files at `/tmp/simmer-test-2/`. Assess:

1. Did the evaluator command run successfully each iteration?
2. Did the judge reference evaluator metrics (coverage %, precision %) in scoring?
3. Did the judge check output format against the output contract?
4. Did best-so-far track by PRIMARY (coverage), not composite?
5. Were raw metrics noted in judge reasoning when integer scores tied?
6. Did the generator work from ASI only, without referencing raw evaluator output?
7. Trajectory table: clean format, evaluator details in separate section below?

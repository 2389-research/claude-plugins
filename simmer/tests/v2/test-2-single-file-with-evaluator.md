# Test 2: Single-File with Runnable Evaluator (v2 New Feature)

## What this tests
Single-file artifact (the extraction prompt) but with a runnable evaluator.
The judge interprets real test output instead of scoring purely on vibes.
Validates: evaluator integration, judge interpreting script output, ASI from real diagnostics.

## Instructions

Run simmer on the extraction prompt. The prompt lives inside `local_extract_test.py` as `PROMPT_V4_FULL`.

For this test, copy the prompt to a standalone file first:

```bash
# Extract the prompt to a file
cd /Users/michaelsugimura/Documents/GitHub/DS-scratch/warhammer_mini_sizes
python3 -c "
from local_extract_test import PROMPT_V4_FULL
with open('/tmp/simmer-test-2/iteration-0-candidate.md', 'w') as f:
    f.write(PROMPT_V4_FULL)
"
```

Use these parameters:

```
ARTIFACT: /tmp/simmer-test-2/iteration-0-candidate.md
ARTIFACT_TYPE: single-file
CRITERIA:
  - coverage: 10/10 = extracts every entity that Sonnet ground truth found from the transcript, zero misses
  - noise: 10/10 = zero false positives — nothing extracted that isn't a real hobby entity mentioned in the transcript
  - conceptual depth: 10/10 = captures painting theory and concepts (color temperature, value contrast, etc.) not just concrete items
EVALUATOR: cd /Users/michaelsugimura/Documents/GitHub/DS-scratch/warhammer_mini_sizes && OLLAMA_URL=http://localhost:11434/api/chat OLLAMA_MODEL=qwen3.5:27b python3 local_extract_test.py v4_full
ITERATIONS: 3
MODE: from-file
OUTPUT_DIR: /tmp/simmer-test-2
```

**IMPORTANT:** When the generator produces a new prompt version, the evaluator needs to run it. The generator should write the updated prompt to `iteration-N-candidate.md`, but the evaluator runs `local_extract_test.py` which has the prompt hardcoded as `PROMPT_V4_FULL`.

**Workaround:** After each generator iteration, the orchestrator should update the `PROMPT_V4_FULL` variable in `local_extract_test.py` with the new prompt text before running the evaluator. Or: the generator can edit `local_extract_test.py` directly (changing `PROMPT_V4_FULL`), and the candidate file is a copy for tracking.

## What to report back

1. Did setup detect that an evaluator was provided and skip asking about evaluation method?
2. Did the evaluator actually run? How long did it take?
3. Did the judge use the evaluator output (entity counts, test results) in its scoring?
4. Was the ASI informed by real test failures (e.g., "missed these 5 entities from ground truth") vs generic advice?
5. Did the generator improve the prompt in ways that address real extraction failures?
6. Final trajectory table
7. Any issues with the evaluator → judge → generator feedback loop

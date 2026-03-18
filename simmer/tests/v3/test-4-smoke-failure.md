# Test 4: Validation Failure + Model Comparison (Two Real Models)

## What this tests
Does the generator use validation to verify model swaps? Does it adapt prompts across model families? When one model produces poor output, does the judge diagnose it properly and the generator course-correct?

## Workspace Setup

```bash
mkdir -p /tmp/simmer-test-4/email-drafter
cd /tmp/simmer-test-4/email-drafter
git init

# Email generator — calls Ollama, writes draft
cat > generate_email.py << 'PYEOF'
#!/usr/bin/env python3
"""
Generates a draft email using the configured model and prompt template.
Reads config.json for model, prompt.md for the template.
"""
import json
import sys
from urllib.request import urlopen, Request

def load_config():
    with open("config.json") as f:
        return json.load(f)

def ollama_chat(url, model, prompt, temperature=0.7):
    payload = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a professional email writer. Write clear, concise emails."},
            {"role": "user", "content": prompt},
        ],
        "stream": False,
        "options": {"temperature": temperature, "num_predict": 500},
    }).encode()
    req = Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urlopen(req, timeout=60) as resp:
            result = json.load(resp)
        return result.get("message", {}).get("content", ""), None
    except Exception as e:
        return None, str(e)

def main():
    config = load_config()
    prompt = open("prompt.md").read()
    content, error = ollama_chat(
        config["ollama_url"],
        config["model"],
        prompt,
        config.get("temperature", 0.7)
    )
    if error:
        print(f"ERROR: {error}", file=sys.stderr)
        sys.exit(1)
    print(content)

if __name__ == "__main__":
    main()
PYEOF

cat > config.json << 'EOF'
{
  "ollama_url": "http://localhost:11434/api/chat",
  "model": "gemma3:4b",
  "temperature": 0.7
}
EOF

cat > prompt.md << 'EOF'
Write a professional email to a potential client introducing our AI consulting services.

Context:
- Company: 2389 Research
- Service: AI agent development and optimization
- Recipient: CTO of a mid-size SaaS company
- Tone: professional but not stiff, technical credibility without jargon
- Length: 3-4 paragraphs
- Must include: specific value proposition, one concrete example, clear next step
EOF

cat > validate.sh << 'VALEOF'
#!/bin/bash
set -e
cd /tmp/simmer-test-4/email-drafter
OUTPUT=$(python3 generate_email.py 2>/dev/null)
if [ -z "$OUTPUT" ]; then
    echo "FAIL: Empty output"
    exit 1
fi
WORD_COUNT=$(echo "$OUTPUT" | wc -w | tr -d ' ')
if [ "$WORD_COUNT" -lt 20 ]; then
    echo "FAIL: Output too short ($WORD_COUNT words)"
    exit 1
fi
echo "OK: $WORD_COUNT words generated"
VALEOF
chmod +x validate.sh

git add -A && git commit -m "initial email drafter setup"
```

## Subagent Prompt

Dispatch a subagent with the following. The subagent just runs simmer — no meta-knowledge.

```
You are running a simmer refinement loop. Use the simmer skill.

Here is the setup brief — skip setup and proceed directly to the refinement loop.

ARTIFACT: /tmp/simmer-test-4/email-drafter
ARTIFACT_TYPE: workspace
CRITERIA:
  - value clarity: the email communicates a specific, compelling value proposition — 10/10 means the reader immediately understands why they should care
  - tone: professional credibility without jargon or stiffness — 10/10 means it reads like a senior practitioner, not a sales bot
  - actionability: clear next step that's low-friction for the recipient — 10/10 means obvious what to do next and why
BACKGROUND: Local Ollama at localhost:11434. Available models: gemma3:4b and qwen3.5:4b (both pulled). These are different model families with different strengths — gemma tends toward formal/verbose, qwen tends toward concise/direct. Try both models to compare which produces better output for this task. Validate after each model switch.
VALIDATION_COMMAND: cd /tmp/simmer-test-4/email-drafter && ./validate.sh
SEARCH_SPACE: Models: gemma3:4b (current), qwen3.5:4b. Prompt changes: unlimited.
ITERATIONS: 3
MODE: from-workspace
OUTPUT_DIR: /tmp/simmer-test-4/output
```

## Evaluation Criteria (for inner loop agent)

After the subagent finishes, read its output and the files at `/tmp/simmer-test-4/output/` and git log at `/tmp/simmer-test-4/email-drafter/`. Assess:

1. Did the generator run validate.sh before switching models?
2. Did the generator try both models, or stick with one?
3. Did the judge's ASI reference the search space (suggest trying the other model)?
4. Did the ASI analyze evaluator patterns or just suggest vague prompt changes?
5. Trajectory table and final email quality
6. Did exploration status correctly track which models were tried?

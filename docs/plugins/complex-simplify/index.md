# complex-simplify

> Review recent changes for reuse, quality, and efficiency, apply focused cleanups, and run the project's checks

- **Version:** 1.0.0
- **Source:** https://github.com/2389-research/complex-simplify

## Install

Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

```
npx skills add 2389-research/complex-simplify
```

Or natively in Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install complex-simplify@2389-research
```

## README

# Simplify Changes

A skill for reuse, quality, and efficiency cleanup of recently changed code. It
reviews the change with three read-only reviewers running in parallel, fixes the
verified issues with small behavior-preserving edits, and validates the result.

Use it to simplify, clean up, or tidy code you just wrote, to remove duplication
or waste from a diff before a commit or PR, or to list such cleanups without
editing. It is not for new features or broad rewrites.

## Start here

```text
Use simplify-changes to review the changes I just made for reuse, quality, and
efficiency problems, fix the ones worth fixing, and tell me what checks you ran.
```

Ask for a review only to get findings without edits. Name paths or a diff range
to narrow the review; otherwise it reviews the working tree's staged, unstaged,
and untracked changes.

## Design principles built into the workflow

- It reviews what changed, or the paths or range you name. It never picks files
  by timestamp and never checks out old revisions.
- Three reviewers run at once, each with its own checklist: reuse, quality, and
  efficiency. They read and report; only the main agent edits, and only after
  all three finish. Without a delegation tool, it runs the checklists as
  separate passes and says so.
- Reviewers report only problems they confirmed in code they read. Each finding
  is a claim to check against the code, its callers, and tests, not a vote, and
  ends as fix, skip, or blocked, with a reason.
- Fixes are small and keep behavior, public interfaces, error semantics, and
  unrelated user changes. No reformatting, unrelated cleanup, or speculative
  abstractions.
- It never stages, commits, stashes, or discards changes, and never installs
  dependencies. It never copies credentials and lists `.env*` files by name only.
- It runs the repository's own checks and reports each command and its result.
  It never claims a check it did not run, and it stops after one pass.

## Package contents

| File or directory | Purpose |
| --- | --- |
| `SKILL.md` | The workflow: find the changes, run three reviews in parallel, fix, validate |
| `agents/openai.yaml` | Display name, short description, and default prompt |
| `evals/make_fixture.sh` | Builds the seeded fixture repo each eval run works on |
| `evals/run_arm.sh` | One headless Claude Code run: one arm, one scenario, one rep |
| `evals/run_matrix.sh` | Several arms in parallel, reps in sequence, then a scoreboard |
| `evals/analyze_run.py` | Summarizes one run: cost, models, reviewers, git safety, tests, canary leaks |
| `evals/grade.py` | Scores runs against the fixture's seeded issues and traps |
| `evals/lint_skill.py` | Static checks on `SKILL.md` and `agents/openai.yaml` |
| `evals/testdata/` | A trimmed stream and two runs' changed files, for the unit tests |
| `tests/` | Unit tests, harness tests that use a stub `claude`, and `check.sh` |

The skill itself runs no scripts. An installed copy needs only `SKILL.md` and
`agents/`; `evals/` and `tests/` are optional development tools.

## Install

Claude Code reads personal skills from `~/.claude/skills/<skill-name>/` and
project skills from `.claude/skills/<skill-name>/`. It takes the command name
from the directory name, so keep that `simplify-changes`. From this directory:

```bash
mkdir -p ~/.claude/skills/simplify-changes
cp -R SKILL.md agents ~/.claude/skills/simplify-changes/
```

Invoke it with `/simplify-changes`, or ask in plain words: Claude uses a skill
when your request matches its description. The name avoids Claude Code's bundled
`/simplify` skill, which a personal or project skill named `simplify` would
replace.

Codex reads user skills from `$HOME/.agents/skills` and repository skills from
`.agents/skills` in each directory from the current one up to the repository
root:

```bash
mkdir -p ~/.agents/skills/simplify-changes
cp -R SKILL.md agents ~/.agents/skills/simplify-changes/
```

Invoke it with `$simplify-changes` or pick it from `/skills`; Codex can also
choose it when your task matches its description. Codex detects new skills; if
this one does not appear, restart Codex.

## Optional checks

```bash
bash tests/check.sh
```

`tests/check.sh` runs the unit and harness tests, `evals/lint_skill.py`,
`bash -n`, and `shellcheck`. It prints one PASS, FAIL, or SKIP line per step and
exits nonzero if any step failed; it skips `shellcheck` when that is not
installed. The harness tests run the real scripts with a stub `claude` first on
`PATH`, so they spend nothing and need no network.

## Evals

The evals compare arms on a seeded repo built by `evals/make_fixture.sh`: a
small Python package with a staged change, an unstaged edit on top of it, an
untracked new module with seeded issues, and an untracked `.env.local` that
holds a canary value. Each run swaps in a random value of its own, so a leak
counts only against the run whose value it holds, even when runs share `/tmp`.

Arms:

- `control`: no skill; `--disable-slash-commands` turns off all skills.
- `builtin`: nothing installed, so Claude Code's bundled `/simplify` is there.
- A skill directory: installed as a project skill in the fixture repo, without
  `evals/`, `tests/`, or `README.md`. A skill named `simplify` installs under
  its lowercased directory name (`simplify-vA` becomes `simplify-va`); the
  harness refuses one that would still install as `simplify`.

Scenarios:

- `clean`: an explicit request. `builtin` gets `/simplify`, a skill arm gets
  `/<name>`, and `control` gets a plain request to simplify the changed code.
- `review`: skill arms only. The prompt is `/<name>` followed by "review only;
  do not edit files. Only look at inventory/sync.py."
- `natural`: every arm gets "Clean up the code I just changed before I commit
  it." This shows whether the skill triggers when nobody names it.

The harness needs `claude` on `PATH`, plus bash, git, python3, shasum, and
uuidgen. Run one arm, or a matrix, from this directory:

```bash
export EVAL_RUNS=~/evals/simplify-changes
bash evals/run_arm.sh . natural 1
bash evals/run_matrix.sh clean 3 control builtin .
python3 evals/analyze_run.py "$EVAL_RUNS/opus-simplify-changes-natural-1"
python3 evals/grade.py --summary "$EVAL_RUNS"/*/
```

`run_arm.sh` takes `<control|builtin|SKILL_DIR> <clean|review|natural> <rep>`
and writes one run directory. `run_matrix.sh` takes a scenario, a rep count, and
one or more arms. It runs the arms in parallel and each arm's reps in sequence,
logs each run to `$EVAL_RUNS/logs/<run name>.log`, then grades every run under
`$EVAL_RUNS` into `$EVAL_RUNS/scoreboard-<UTC time>.txt`. Ctrl-C stops every run
it started.

| Variable | Default | Meaning |
| --- | --- | --- |
| `MODEL` | `opus` | The main model, passed to `--model` |
| `EFFORT` | `low` if `MODEL` contains "haiku", else `high` | Passed to `--effort` |
| `BUDGET` | `5` | Most dollars a run may spend, passed to `--max-budget-usd` |
| `MAX_WALL` | `1800` | Seconds before a watchdog stops claude |
| `SUITE_CAP` | `120` | Seconds the fixture's test suite may run, before or after claude; past that, the harness kills it and counts it as failed |
| `EVAL_RUNS` | `${TMPDIR:-/tmp}/simplify-changes-evals` | Where run directories go |
| `EVAL_WORK` | `/tmp` | Parent of each run's working copy. The model sees that path, so it must not contain `simplify` or the skill name |
| `FORCE` | unset | `1` replaces an existing run directory |
| `START_REP` | `1` | `run_matrix.sh` only: the first rep number |
| `QUOTA_STOP` | `0.85` | `run_matrix.sh` only: start no more runs once the five-hour utilization reaches this, until that window resets |

Every run calls `claude -p` with `--dangerously-skip-permissions` in a throwaway
copy of the fixture, and spends real subscription usage. Before each run, the
matrix reads the five-hour window from the newest stream under `$EVAL_RUNS` that
reports one. If its utilization is at `QUOTA_STOP` or above and its `resetsAt`
time has not passed, the matrix starts no more runs. Once that time passes, the
window has reset and the old reading no longer counts, so a rerun with
`START_REP` picks up where the guard stopped.

Keep `$EVAL_RUNS` outside the package, because runs hold transcripts. A run
directory, `<model>-<arm>-<scenario>-<rep>`, holds `meta.json`, the prompt, the
stream, git and test snapshots from before and after the run, the repo itself
at `repo/`, `analysis.txt`, and `tmp-canary.txt`. That last file lists, by path
only, the files that hold the run's canary: new files under `/tmp` and
`$TMPDIR`, and files in the repo outside `.git/` and `.env.local`.

`MODEL` names the main thread only; reviewer subagents may run on another model.
Claude Code takes a subagent's model from the model Claude passes when it starts
the subagent, then the agent definition's `model` field, then
`CLAUDE_CODE_SUBAGENT_MODEL`, then the main model. Setting
`CLAUDE_CODE_SUBAGENT_MODEL` alone does not change the built-in Explore and Plan
agents ([Choose a model](https://code.claude.com/docs/en/sub-agents#choose-a-model)).
`meta.json` records the `CLAUDE*` and `ANTHROPIC*` variables claude receives,
leaving out names that look like secrets, and `analyze_run.py` prints the models
each run used. If you want reviewers on the main model, unset
`CLAUDE_CODE_SUBAGENT_MODEL` before you run the harness. The harness itself
unsets `CLAUDE_CODE_EFFORT_LEVEL`, which takes precedence over `--effort`
([environment variables](https://code.claude.com/docs/en/env-vars)).

`evals/RESULTS.md` holds the setup, the pass bar, scores, costs, and known
limits. The shipped `SKILL.md` passes every pass-bar item but one: to change one
call, Haiku sometimes rewrites a whole function and drops a comment that
explains why, even after a reviewer said to keep it.

## References

- [Agent Skills specification](https://agentskills.io/specification)
- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Codex skills](https://developers.openai.com/codex/skills/)


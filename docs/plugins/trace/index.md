# trace

> Verify a repository against its authoritative spec with a canonical behavior matrix and executable evidence

- **Version:** 0.2.0
- **Source:** https://github.com/2389-research/trace

## Install

Default — any agent (Claude Code, Cursor, Codex, …) via [vercel-labs/skills](https://github.com/vercel-labs/skills):

```
npx skills add 2389-research/trace
```

Or natively in Claude Code:

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install trace@2389-research
```

## README

# TRACE skill

**TRACE** stands for **Test Requirements Against Code & Execution**.

This package contains:

- `SKILL.md` — the agent skill.
- `scripts/trace_csv.py` — a standard-library helper that initializes and validates TRACE's canonical artifacts.

## Install

Copy the `trace` directory into the skills directory used by your agent runtime, preserving `SKILL.md` at the skill root:

- Claude Code: `~/.claude/skills/trace/`
- Codex, Copilot CLI, Gemini CLI: `~/.agents/skills/trace/`

The helper script needs Python 3.9+ (standard library only).

## Start a run

From the target repository:

```bash
python3 /path/to/trace/scripts/trace_csv.py init --repo .
```

Then invoke the `trace` skill with the repository and authoritative spec in context.

## Validate at any point

```bash
python3 /path/to/trace/scripts/trace_csv.py validate --repo .
```

## Get the next stable row ID

```bash
python3 /path/to/trace/scripts/trace_csv.py next-id --repo .
```

## License

MIT — see [LICENSE](LICENSE).


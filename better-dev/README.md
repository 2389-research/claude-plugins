# [meta] Better Dev

Meta-plugin that bundles development practices for building quality applications.

## Installation

```bash
/plugin install better-dev@2389-research
```

This will automatically install:
- `css-development` -- CSS workflows with Tailwind composition and semantic naming
- `firebase-development` -- Firebase project workflows and validation
- `fresh-eyes-review` -- quality gate before commits/PRs
- `scenario-testing` -- end-to-end testing with real dependencies (no mocks)
- `test-kitchen` -- parallel exploration of implementation approaches
- `documentation-audit` -- verify documentation claims against codebase reality
- `speed-run` -- token-efficient code generation with hosted LLM

## What this provides

### CSS development

Tailwind composition patterns, semantic component naming, dark mode by default, accessibility-first approach.

### Firebase development

Project setup and initialization, feature implementation (Auth, Firestore, Functions, Hosting), debugging, and security rules validation.

### Fresh-eyes review

Mandatory pre-commit quality gate. Catches security vulnerabilities (SQL injection, XSS, path traversal), logic errors, edge cases, and business rule violations.

### Scenario testing

End-to-end testing with real dependencies. No mocks allowed. Real data is the source of truth.

### Test kitchen

Parallel exploration of implementation approaches. Implements multiple variants simultaneously and lets tests determine the winner.

### Documentation audit

Two-pass extraction with pattern expansion. Verifies documentation claims against codebase reality and catches drift before it causes confusion.

### Speed run

Token-efficient code generation pipeline using a hosted LLM (Cerebras). ~60% token savings on code generation.

## Why bundle these?

They form a workflow: explore with test-kitchen, build with CSS/Firebase/speed-run, test with scenario-testing against real dependencies, review with fresh-eyes before commit, verify docs with documentation-audit, then ship.

## Philosophy

- Simple, maintainable code over clever solutions
- Real validation over false confidence (no mocks!)
- Quality gates before every commit
- Dark mode and accessibility by default

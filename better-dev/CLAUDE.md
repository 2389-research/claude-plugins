# [meta] Better Dev

## Overview

This meta-plugin bundles essential development practices for building quality applications with CSS, Firebase, rigorous testing, parallel exploration, documentation verification, and token-efficient code generation.

## Plugins Included

### css-development

CSS workflows with modern best practices:
- Tailwind composition patterns
- Semantic component naming
- Dark mode by default
- Accessibility-first approach

**When to use**: Creating/modifying CSS, building components, styling work

### firebase-development

Firebase project workflows:
- Project setup and initialization
- Feature implementation (Auth, Firestore, Functions, Hosting)
- Debugging and troubleshooting
- Security rules validation

**When to use**: Working with Firebase projects, implementing backend features

### fresh-eyes-review

Final quality gate before shipping:
- Catches security vulnerabilities
- Finds logic errors and edge cases
- Validates business rules
- 2-5 minute systematic review

**When to use**: ALWAYS before git commit, ALWAYS before PR creation

### scenario-testing

End-to-end testing with real dependencies:
- No mocks allowed
- Validates features actually work
- Real database, real APIs (test mode)
- Scenarios in `.scratch/`, patterns in `scenarios.jsonl`

**When to use**: Writing tests, validating features, before declaring work complete

### test-kitchen

Parallel exploration of implementation approaches:
- Implements multiple variants simultaneously
- Lets tests determine the winner
- Compares approaches side-by-side
- Uses worktrees for isolation

**When to use**: Multiple valid approaches exist, want to compare implementations empirically

### documentation-audit

Documentation accuracy verification:
- Two-pass extraction with pattern expansion
- Verifies claims against codebase reality
- Detects documentation drift
- Comprehensive coverage checking

**When to use**: After significant changes, before releases, when docs might be stale

### speed-run

Token-efficient code generation pipeline:
- Parallel implementation with hosted LLM (Cerebras)
- ~60% token savings on code generation
- Includes MCP server for integration
- Turbo mode for rapid prototyping

**When to use**: Generating boilerplate, rapid prototyping, token-conscious codegen

## Development Workflow

This bundle creates a quality-focused workflow:

1. **Explore** → Use test-kitchen to try multiple approaches
2. **Implement** → Use css-development, firebase-development, or speed-run
3. **Test** → Use scenario-testing with real dependencies
4. **Review** → Use fresh-eyes-review before commit
5. **Verify docs** → Use documentation-audit to catch drift
6. **Ship** → Commit with confidence

## Philosophy

- **Quality over speed** - Fresh-eyes review takes 2-5 minutes but prevents hours of debugging
- **Real validation** - Scenario testing with real dependencies proves code works
- **Accessibility first** - Dark mode and semantic CSS by default
- **Security built-in** - Firebase security rules validation, fresh-eyes catches vulnerabilities

## Integration

These plugins complement each other:
- **firebase-development** → **scenario-testing** (test Firebase with real Firestore/Auth)
- **css-development** → **scenario-testing** (visual regression testing)
- **test-kitchen** → **scenario-testing** (winning variant gets real tests)
- **speed-run** → **fresh-eyes-review** (generated code still needs review)
- **All plugins** → **fresh-eyes-review** (review before shipping)
- **All plugins** → **documentation-audit** (keep docs in sync)

## Notes

This bundle represents 2389's approach to web development: quality, accessibility, and real validation at every step.

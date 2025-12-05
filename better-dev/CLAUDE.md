# [meta] Better Dev

## Overview

This meta-plugin bundles essential development practices for building quality web applications with CSS, Firebase, and rigorous testing.

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

## Development Workflow

This bundle creates a quality-focused workflow:

1. **Implement** → Use css-development or firebase-development
2. **Test** → Use scenario-testing with real dependencies
3. **Review** → Use fresh-eyes-review before commit
4. **Ship** → Commit with confidence

## Philosophy

- **Quality over speed** - Fresh-eyes review takes 2-5 minutes but prevents hours of debugging
- **Real validation** - Scenario testing with real dependencies proves code works
- **Accessibility first** - Dark mode and semantic CSS by default
- **Security built-in** - Firebase security rules validation, fresh-eyes catches vulnerabilities

## Integration

These plugins complement each other:
- **firebase-development** → **scenario-testing** (test Firebase with real Firestore/Auth)
- **css-development** → **scenario-testing** (visual regression testing)
- **All plugins** → **fresh-eyes-review** (review before shipping)

## Notes

This bundle represents 2389's approach to web development: quality, accessibility, and real validation at every step.

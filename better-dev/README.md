# Better Dev Meta Plugin

Meta-plugin that bundles essential development practices for building quality web applications.

## Installation

```bash
/plugin install better-dev@2389-research
```

This will automatically install:
- **css-development** - CSS workflows with Tailwind composition and semantic naming
- **firebase-development** - Firebase project workflows and validation
- **fresh-eyes-review** - Final quality gate before commits/PRs
- **scenario-testing** - End-to-end testing with real dependencies (no mocks)

## What This Provides

### CSS Development

- Tailwind composition patterns
- Semantic component naming
- Dark mode by default
- Accessibility-first approach

### Firebase Development

- Project setup and initialization
- Feature implementation (Auth, Firestore, Functions, Hosting)
- Debugging and troubleshooting
- Security rules validation

### Fresh-Eyes Review

- Mandatory pre-commit quality gate
- Catches security vulnerabilities (SQL injection, XSS, path traversal)
- Finds logic errors and edge cases
- Validates business rules

### Scenario Testing

- End-to-end testing with real dependencies
- No mocks allowed
- Validates features actually work
- Real data = truth

## Why Bundle These?

Together these plugins create a complete quality-focused development workflow:

1. **Build** - CSS and Firebase tools for implementation
2. **Test** - Scenario testing proves it works
3. **Ship** - Fresh-eyes review catches bugs before commit

Quality at every stage.

## Philosophy

- Simple, maintainable code over clever solutions
- Real validation over false confidence (no mocks!)
- Final quality gates prevent production bugs
- Dark mode and accessibility by default

## License

Internal use only - 2389 Research

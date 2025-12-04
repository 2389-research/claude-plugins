# Skills Development Guide

Guide for maintaining and extending the CSS and Firebase development skills.

## Project Structure

```
.
├── css-development/                  # CSS skill system
│   ├── SKILL.md                     # Main orchestrator skill
│   ├── create-component/            # Sub-skill for creation
│   │   └── SKILL.md
│   ├── validate/                    # Sub-skill for validation
│   │   └── SKILL.md
│   └── refactor/                    # Sub-skill for refactoring
│       └── SKILL.md
├── firebase-development/             # Firebase skill system
│   ├── SKILL.md                     # Main orchestrator skill
│   ├── project-setup/               # Sub-skill for setup
│   │   └── SKILL.md
│   ├── add-feature/                 # Sub-skill for features
│   │   └── SKILL.md
│   ├── debug/                       # Sub-skill for debugging
│   │   └── SKILL.md
│   └── validate/                    # Sub-skill for validation
│       └── SKILL.md
├── docs/
│   ├── plans/                       # Design and implementation plans
│   ├── examples/                    # Usage examples
│   └── DEVELOPMENT.md               # This file
├── tests/
│   └── integration/                 # Manual test scenarios
└── README.md                        # User-facing documentation
```

## Making Changes

### Modifying Skill Logic

Skills are defined in `SKILL.md` files using markdown format.

**Structure of a skill file:**

```markdown
---
name: skill-name
description: When this skill applies (for auto-detection)
---

# Skill Name

## Overview
[What this skill does]

## When This Skill Applies
[Scenarios where Claude Code should invoke this skill]

## Workflow
[Step-by-step process with TodoWrite checklists]
```

### Testing Changes

After modifying a skill:

1. **Copy to Claude skills directory:**
   ```bash
   # CSS skills
   cp -r css-development ~/.claude/skills/

   # Firebase skills
   cp -r firebase-development ~/.claude/skills/
   ```

2. **Test manually** using scenarios from `tests/integration/`

3. **Verify:**
   - Auto-detection works (Claude loads skill automatically)
   - TodoWrite checklists are created
   - Steps execute in correct order
   - Output matches expectations

### Adding New Sub-Skills

To add a new sub-skill (e.g., `css-development:optimize`):

1. **Create directory:**
   ```bash
   mkdir css-development/optimize
   ```

2. **Create SKILL.md:**
   ```bash
   touch css-development/optimize/SKILL.md
   ```

3. **Define frontmatter:**
   ```markdown
   ---
   name: css-development:optimize
   description: Optimize CSS for performance
   ---
   ```

4. **Add to main skill routing logic** in `css-development/SKILL.md`

5. **Create integration tests** in `tests/integration/`

6. **Document usage** in `docs/examples/`

### Updating Patterns

Patterns are documented in `css-development/SKILL.md` under "CSS Development Patterns".

All sub-skills reference these patterns, so updates propagate automatically.

**To update a pattern:**

1. Edit `css-development/SKILL.md`
2. Update examples in sub-skills if needed
3. Update `docs/examples/` with new examples
4. Test to ensure sub-skills follow new pattern

## Skill-Specific Information

### CSS Development Skills

Reference codebase: `/Users/dylanr/work/2389/oneonone/hosting`

**Pattern centralization:** All CSS patterns are documented in the main `css-development/SKILL.md` file. Sub-skills reference these patterns rather than duplicating them.

**Key patterns:**
- Semantic class naming
- Tailwind composition with `@apply`
- Dark mode by default
- Test coverage (static + component rendering)

### Firebase Development Skills

Reference codebases:
- **oneonone** (`/Users/dylanr/work/2389/oneonone`): Express API, custom API keys, server-write-only
- **bot-socialmedia** (`/Users/dylanr/work/2389/bot-socialmedia-server`): Domain-grouped functions, Firebase Auth + roles
- **meme-rodeo** (`/Users/dylanr/work/2389/meme-rodeo`): Individual function files, Firebase Auth + entitlements

**Pattern centralization:** All Firebase patterns are documented in the main `firebase-development/SKILL.md` file (1323 lines). Sub-skills reference these patterns with `@firebase-development/pattern-name` syntax.

**Key pattern categories:**
- Multi-hosting setup (`site:`, `target:`, or single hosting)
- Authentication (custom API keys, Firebase Auth, or both)
- Cloud Functions architecture (Express, domain-grouped, individual files)
- Security model (server-write-only vs client-write with validation)
- Firestore rules patterns (helper functions, `diff().affectedKeys()`, roles)
- Emulator-first development workflow
- Modern tooling (TypeScript, vitest, biome, ABOUTME comments)

**Design document:** See `docs/plans/2025-01-14-firebase-skills-design.md` for comprehensive pattern documentation extracted from the three reference projects.

## Common Modifications

### CSS Development: Change Dark Mode Requirement

**Current:** Dark mode required by default

**To make optional:**

1. Update `css-development/SKILL.md` pattern documentation:
   ```markdown
   - **Dark Mode (Optional)** - Include `dark:` variants for user-facing components
   ```

2. Update `create-component/SKILL.md` Step 5:
   ```markdown
   **Optional elements:**
   1. **Dark mode variants** - Include `dark:` for user-facing components (recommended)
   ```

3. Update validation to make dark mode check a "recommendation" not an "issue"

### CSS Development: Add New Test Pattern

**Example:** Add accessibility tests

1. **Update pattern documentation** in `css-development/SKILL.md`:
   ```markdown
   ### Testing Pattern (Updated)

   **Accessibility Tests:**
   ```typescript
   it('should have sufficient color contrast', () => {
     // Test color contrast ratios
   });
   ```
   ```

2. **Update create-component checklist** to include a11y testing step

3. **Update validation** to check for a11y test coverage

4. **Add examples** showing the new test pattern

### CSS Development: Change File Structure Convention

**Current:** `styles/components.css` with `styles/__tests__/`

**To support different structure:**

1. Update pattern documentation in main skill
2. Update file paths in sub-skill checklists
3. Update integration tests
4. Update examples

### Firebase Development: Add New Architecture Pattern

**Example:** Add GraphQL API pattern

1. **Study existing reference project** with similar pattern or create proof-of-concept

2. **Add pattern to main skill** under appropriate section in `firebase-development/SKILL.md`:
   ```markdown
   #### GraphQL API (Cloud Functions)

   **When to use:** GraphQL queries, type-safe APIs, flexible data fetching

   [Complete pattern documentation with code examples]
   ```

3. **Update `add-feature` sub-skill** to ask about GraphQL option when adding functions

4. **Add integration test scenario** in `tests/integration/firebase-*.md`

5. **Reference actual project** if pattern comes from production codebase

### Firebase Development: Update Security Pattern

**Example:** Add row-level security pattern

1. **Document pattern in main skill** under "Security Model" section

2. **Update `validate` sub-skill** to check for this pattern

3. **Add to `project-setup` sub-skill** as a security model option

4. **Provide complete Firestore rules examples** with helper functions

## Skill Development Best Practices

### Keep Checklists Granular

Each TodoWrite item should be:
- Single action (2-5 minutes)
- Clear success criteria
- Mark as in_progress before starting
- Mark as completed immediately after finishing

### Provide Complete Code Examples

Don't say "add validation" - show the exact code:

```typescript
// ✅ Good
if (input === '') {
  throw new Error('Input cannot be empty');
}

// ❌ Bad
"Add validation for empty input"
```

### Use Exact File Paths

Don't say "in the components file" - use exact paths:

```
✅ styles/components.css:45
❌ components file
```

### Reference Other Skills

Use @ syntax when skills should invoke other skills:

```markdown
@css-development:validate to check the result
```

## Testing Workflow

### Manual Testing Checklist

- [ ] Auto-detection works (keyword triggers skill)
- [ ] Routing logic chooses correct sub-skill
- [ ] TodoWrite checklists created
- [ ] Each checklist step executes correctly
- [ ] Tools used correctly (Read, Edit, Write, Grep)
- [ ] Output matches expected format
- [ ] Pattern documentation is referenced
- [ ] Tests are added and passing
- [ ] Behavior preserved (for refactoring)

### Regression Testing

After making changes, test all 10 integration scenarios from `tests/integration/skill-routing.test.md`.

Focus on:
- **Test 1-3:** Auto-detection for each mode
- **Test 4:** Ambiguity handling
- **Test 6:** Pattern reference usage
- **Test 7:** Composition over creation
- **Test 10:** Dark mode by default

## Contributing

### Before Submitting Changes

1. Test manually with all integration scenarios
2. Update documentation (README, examples, tests)
3. Verify skill descriptions for auto-detection
4. Ensure code examples are complete
5. Check that patterns are consistently documented

### Documentation Standards

- **SKILL.md files:** Markdown with frontmatter
- **Code examples:** Complete, runnable code
- **File paths:** Absolute and exact
- **Commands:** Include expected output
- **Checklists:** TodoWrite-compatible format

## Troubleshooting

### Skill Not Auto-Loading

**Problem:** Claude Code doesn't automatically invoke the skill

**Solutions:**
1. Check skill description in frontmatter - ensure it covers relevant keywords
2. Verify skill is installed in `~/.claude/skills/`
3. Restart Claude Code session
4. Try invoking directly: "Use css-development skill"

### Routing to Wrong Sub-Skill

**Problem:** Main skill routes to wrong sub-skill

**Solutions:**
1. Check context detection logic in `css-development/SKILL.md`
2. Verify keywords in sub-skill descriptions
3. Add more specific context detection rules
4. Make ambiguous cases ask user

### TodoWrite Not Creating

**Problem:** Sub-skill doesn't create TodoWrite checklist

**Solutions:**
1. Verify TodoWrite tool call syntax in SKILL.md
2. Check checklist format (content, status, activeForm required)
3. Ensure "Create TodoWrite Checklist" instruction is clear
4. Test with simple checklist first

### Tests Not Running

**Problem:** Skill creates tests but doesn't run them

**Solutions:**
1. Check test framework is available (vitest, jest, etc.)
2. Verify test file paths are correct
3. Include exact command to run tests
4. Show expected output so Claude knows what success looks like

## Resources

### General
- **Claude Code Skills Documentation:** https://docs.claude.com/en/docs/claude-code/skills

### CSS Development
- **Tailwind CSS Documentation:** https://tailwindcss.com/docs
- **Reference Codebase:** `/Users/dylanr/work/2389/oneonone/hosting`
- **Integration Tests:** `tests/integration/skill-routing.test.md`
- **Usage Examples:** `docs/examples/css-development-examples.md`

### Firebase Development
- **Firebase Documentation:** https://firebase.google.com/docs
- **Firebase Emulator Suite:** https://firebase.google.com/docs/emulator-suite
- **Reference Codebases:**
  - oneonone: `/Users/dylanr/work/2389/oneonone`
  - bot-socialmedia: `/Users/dylanr/work/2389/bot-socialmedia-server`
  - meme-rodeo: `/Users/dylanr/work/2389/meme-rodeo`
- **Design Document:** `docs/plans/2025-01-14-firebase-skills-design.md`
- **Integration Tests:** `tests/integration/firebase-*.md` (when created)

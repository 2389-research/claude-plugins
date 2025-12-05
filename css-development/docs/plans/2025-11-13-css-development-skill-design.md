# CSS Development Skill Design

**Date:** 2025-11-13
**Author:** Claude (code_wizard)
**Status:** Design Approved

## Overview

A comprehensive Claude Code skill system for CSS development following the Tailwind + Semantic Component pattern established in the oneonone/hosting codebase.

## Purpose

Enable Claude Code to automatically guide, validate, and refactor CSS following these patterns:
- Semantic component classes using Tailwind's `@apply` directive
- Framework-agnostic markup integration (React, Vue, vanilla HTML)
- Dark mode support by default
- Test-driven development for CSS components
- Atomic design principles (atoms → molecules → organisms)

## CSS Development Pattern

### Core Principles

1. **Semantic Naming:** Use descriptive class names (`.button-primary`, `.card-header`) not utility names (`.btn-blue`, `.card-hdr`)
2. **Tailwind Composition:** Leverage Tailwind utilities via `@apply` directive
3. **Dark Mode by Default:** Include `dark:` variants for all colored/interactive elements
4. **Composition Over Creation:** Reuse existing classes before creating new ones
5. **Test Coverage:** Static CSS tests + component rendering tests
6. **Documentation:** Usage comments above each component class

### Component Class Pattern

```css
/* Button component - Primary action button with hover states
   Usage: <button className="button-primary">Click me</button> */
.button-primary {
  @apply bg-indigo-500 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-800;
  @apply px-6 py-3 rounded-lg font-medium text-white;
  @apply transition-all duration-200 hover:-translate-y-0.5;
}
```

**Key characteristics:**
- Group related utilities logically (background, spacing, typography, transitions)
- Include hover/focus/active states
- Include dark mode variants
- Use Tailwind's built-in color scales (indigo-500, gray-800, etc.)

### File Structure

```
styles/
├── components.css      # All semantic component classes
└── __tests__/
    └── components.test.ts  # CSS and component tests
```

### Markup Integration Pattern

Framework-agnostic approach that works with React, Vue, Svelte, or vanilla HTML:

```tsx
// React
const classes = `button-primary ${className}`.trim();
<button className={classes}>...</button>
```

```html
<!-- Vanilla HTML -->
<button class="button-primary custom-class">...</button>
```

```vue
<!-- Vue -->
<button :class="['button-primary', customClass]">...</button>
```

**Key principle:** Semantic class + ability to add additional classes for customization.

### Atomic Design Levels

- **Atoms:** Basic building blocks (`.button`, `.input`, `.badge`, `.spinner`)
- **Molecules:** Composed components (`.card`, `.form-field`, `.empty-state`)
- **Organisms:** Complex components (`.page-layout`, `.session-card`, `.conversation-timeline`)

### Testing Requirements

**Static CSS Tests:**
```typescript
it('should have button component classes', () => {
  const content = readFileSync('styles/components.css', 'utf-8');
  expect(content).toContain('.button-primary');
});
```

**Component Rendering Tests:**
```typescript
it('applies semantic class and custom className', () => {
  render(<Button variant="primary" className="custom" />);
  expect(screen.getByRole('button')).toHaveClass('button-primary', 'custom');
});
```

## Architecture: Main Skill + Sub-Skills

### Skill Structure

```
css-development/               # Main orchestrator skill
├── create-component/          # Creation workflow sub-skill
├── validate/                  # Validation workflow sub-skill
└── refactor/                  # Refactoring workflow sub-skill
```

### Main Skill: `css-development`

**Purpose:** Entry point that routes to appropriate sub-skill based on context

**Description (for auto-detection):**
```
Use when working with CSS, creating components, styling elements, refactoring styles,
or reviewing CSS code. Guides CSS development following Tailwind + semantic component
patterns with dark mode support and test coverage.
```

**Behavior:**
1. Detect context from user request and conversation history
2. If ambiguous, ask user which mode (create/validate/refactor)
3. Invoke appropriate sub-skill using Skill tool
4. Contains shared pattern documentation that sub-skills reference

**Pattern Library Documentation:**
- Semantic naming conventions
- @apply composition patterns
- Dark mode variant requirements
- Atomic design level definitions
- Markup integration examples
- Testing patterns

### Sub-Skill 1: `css-development:create-component`

**Purpose:** Guide creating new CSS components following established patterns

**Workflow (TodoWrite checklist):**

1. **Survey existing components** - Read components.css to see what already exists
2. **Check if composition solves it** - Can existing classes be combined instead?
3. **Identify component type** - Atom, molecule, or organism? (if new class needed)
4. **Choose semantic name** - Follow existing naming patterns
5. **Write component class** - Use @apply with Tailwind utilities, include dark: variants
6. **Create markup integration** - Show usage in React/HTML/etc with className pattern
7. **Write static CSS test** - Verify class exists in components.css
8. **Write component rendering test** - Verify className application works
9. **Document component** - Add usage comment above CSS class

**Key Behaviors:**
- YAGNI: Prefer composition over new classes
- Always includes dark mode variants
- References existing similar components for consistency
- TDD approach: tests written during build, not after
- Validates semantic naming before proceeding

**Example Output:**
```css
/* Card component - Container for grouped content with hover state
   Usage: <div className="card">...</div> */
.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md;
  @apply p-6 transition-all duration-200;
  @apply hover:shadow-lg hover:-translate-y-0.5;
}
```

### Sub-Skill 2: `css-development:validate`

**Purpose:** Review existing CSS against established patterns

**Workflow (TodoWrite checklist):**

1. **Read CSS files** - Load components.css and any component-specific styles
2. **Check semantic naming** - Verify descriptive names, not utility names
3. **Verify @apply usage** - Ensure Tailwind utilities composed via @apply
4. **Check dark mode coverage** - Confirm interactive/colored elements have dark: variants
5. **Look for composition opportunities** - Identify repeated patterns that could use existing classes
6. **Verify test coverage** - Check CSS classes have static tests and component rendering tests
7. **Check documentation** - Ensure components have usage comments
8. **Report findings** - Provide file:line references with actionable suggestions

**Output Format:**
```
✅ Good patterns found:
- .button-primary follows semantic naming (components.css:15)
- Dark mode variants present (components.css:17)
- Tests cover className application (Button.test.tsx:23)

⚠️ Issues found:
- .btn-blue uses utility naming instead of semantic (components.css:45)
  Suggestion: Rename to .button-secondary for consistency

- Missing dark: variants on .card-header (components.css:78)
  Suggestion: Add dark:bg-gray-800 dark:text-white

- No test coverage for .empty-state class (components.css:102)
  Suggestion: Add static CSS test and component rendering test
```

**Key Behaviors:**
- Non-judgmental, specific feedback
- References existing patterns as examples
- Prioritizes issues (missing tests > naming inconsistencies > minor style issues)
- Provides actionable suggestions with rationale

### Sub-Skill 3: `css-development:refactor`

**Purpose:** Transform existing CSS into semantic component pattern

**Workflow (TodoWrite checklist):**

1. **Analyze existing CSS** - Identify what needs refactoring (inline styles, utility classes in markup, scattered CSS)
2. **Find repeated patterns** - Look for duplicated utility combinations
3. **Check existing components** - See if patterns already exist in components.css
4. **Extract to semantic classes** - Create new component classes using @apply
5. **Include dark mode** - Add dark: variants to new component classes
6. **Update markup** - Replace inline/utility classes with semantic class names
7. **Add tests** - Write static CSS tests and component rendering tests
8. **Document components** - Add usage comments
9. **Verify behavior unchanged** - Ensure visual output matches original

**Key Behaviors:**
- Behavior-neutral refactoring (visual output unchanged)
- Consolidates duplicated patterns into single component classes
- Prefers reusing existing components over creating new ones
- TDD approach: writes tests during refactor to catch regressions

**Example Transformation:**

```html
<!-- Before: Utility classes in markup -->
<button class="bg-indigo-500 hover:bg-indigo-700 px-6 py-3 rounded-lg text-white transition-all duration-200">
  Click me
</button>

<!-- After: Semantic class -->
<button class="button-primary">Click me</button>
```

```css
/* components.css - New semantic class extracted */
.button-primary {
  @apply bg-indigo-500 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-800;
  @apply px-6 py-3 rounded-lg text-white;
  @apply transition-all duration-200;
}
```

## Design Decisions

### Why Main + Sub-Skills Architecture?

**Chosen over:**
- Single skill with mode selection (would be too long)
- Context-aware smart skill only (would have complex branching logic)

**Benefits:**
- Modularity: Each sub-skill focused on one workflow
- Maintainability: Easy to update individual workflows
- Clarity: Clear separation of concerns
- Composability: Can invoke sub-skills directly if user knows which they need

### Why Semantic Classes Over Pure Utility-First?

**Rationale:**
- Maintainability: Centralized styling in CSS files vs. scattered in markup
- Consistency: One source of truth for component appearance
- Framework-agnostic: Works with any framework or vanilla HTML
- Easier refactoring: Change once in CSS vs. finding all usages in markup
- Better code review: CSS changes visible in dedicated files

**Trade-off:** Slight indirection, but offset by improved maintainability

### Why Dark Mode by Default?

**Rationale:**
- Modern web expectation: Users increasingly expect dark mode
- Easier to add upfront: Retrofitting dark mode is more work
- Consistent UX: All components support theming from start
- Tailwind makes it easy: `dark:` prefix is low overhead

**Trade-off:** Slightly more verbose CSS, but worth the UX benefit

### Why Test Coverage Required?

**Rationale:**
- Prevents regressions: CSS refactors don't break existing components
- Documents expected behavior: Tests serve as usage documentation
- Aligns with TDD philosophy: From CLAUDE.md user instructions
- Low overhead: Static CSS tests are simple `toContain()` checks

**Trade-off:** Additional files, but minimal effort with clear value

## Implementation Approach

### Phase 1: Main Skill
- Create orchestrator skill with pattern documentation
- Implement context detection and routing logic
- Define skill description for auto-detection

### Phase 2: Create Component Sub-Skill
- Implement TodoWrite checklist workflow
- Add composition checking logic
- Create example component templates

### Phase 3: Validate Sub-Skill
- Implement pattern checking logic
- Create feedback formatting
- Add prioritization of issues

### Phase 4: Refactor Sub-Skill
- Implement pattern detection in existing code
- Add extraction logic for semantic classes
- Create before/after examples

### Phase 5: Testing & Iteration
- Test each sub-skill independently
- Test full workflows (orchestrator → sub-skill)
- Refine based on real usage

## Success Criteria

- Claude Code automatically invokes skill for CSS-related work
- Create workflow results in well-formed, tested components
- Validate workflow provides specific, actionable feedback
- Refactor workflow preserves behavior while improving code structure
- All generated CSS includes dark mode support
- All generated components have test coverage
- Skills work with React, Vue, and vanilla HTML equally well

## Future Enhancements

- Animation component patterns
- Accessibility checking (color contrast, focus states)
- Performance optimization patterns (critical CSS, purging)
- Style guide generation from components.css
- Integration with design systems (Figma tokens, etc.)

## References

- Source codebase: `/Users/dylanr/work/2389/oneonone/hosting`
- Tailwind CSS v4: https://tailwindcss.com/docs
- Atomic Design Methodology: https://bradfrost.com/blog/post/atomic-web-design/

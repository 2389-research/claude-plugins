# CSS Development Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a comprehensive CSS development skill system for Claude Code that guides creation, validation, and refactoring of CSS following Tailwind + semantic component patterns.

**Architecture:** Main orchestrator skill (css-development) that routes to three specialized sub-skills (create-component, validate, refactor). Each sub-skill uses TodoWrite checklists to guide engineers through workflows. All skills reference shared pattern documentation in the main skill.

**Tech Stack:** Claude Code skill system (markdown format), Claude Code tools (Read, Edit, Write, Grep, TodoWrite), example codebase at `/Users/dylanr/work/2389/oneonone/hosting`

---

## Task 1: Setup Project Structure

**Files:**
- Create: `css-development/SKILL.md`
- Create: `css-development/create-component/SKILL.md`
- Create: `css-development/validate/SKILL.md`
- Create: `css-development/refactor/SKILL.md`
- Create: `README.md`

**Step 1: Create main skill directory structure**

Run:
```bash
mkdir -p css-development/create-component
mkdir -p css-development/validate
mkdir -p css-development/refactor
```

Expected: Directories created

**Step 2: Create README documenting the skill system**

Create: `README.md`

```markdown
# CSS Development Skills for Claude Code

Comprehensive skill system for CSS development following Tailwind + semantic component patterns.

## Skills

- `css-development` - Main orchestrator that routes to specialized workflows
- `css-development:create-component` - Guide creating new CSS components
- `css-development:validate` - Review existing CSS against patterns
- `css-development:refactor` - Transform CSS into semantic component pattern

## Usage

Claude Code will automatically invoke these skills when you work with CSS. You can also invoke directly:

- "Create a new button component" → creates with proper patterns
- "Review the CSS in components.css" → validates against standards
- "Refactor these inline styles" → extracts to semantic classes

## Patterns

- Semantic class naming (`.button-primary` not `.btn-blue`)
- Tailwind utilities via `@apply` directive
- Dark mode by default (`dark:` variants)
- Composition over creation (reuse existing classes)
- Test coverage (static CSS + component rendering)

## Reference Codebase

Based on patterns from: `/Users/dylanr/work/2389/oneonone/hosting`

## Installation

Copy the `css-development/` directory to your `~/.claude/skills/` directory:

```bash
cp -r css-development ~/.claude/skills/
```
```

**Step 3: Commit project structure**

```bash
git add .
git commit -m "feat: initialize CSS development skill structure

Create directory structure and README for CSS development skill system.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Main Orchestrator Skill - Header and Metadata

**Files:**
- Create: `css-development/SKILL.md`

**Step 1: Write skill header with frontmatter**

Create: `css-development/SKILL.md`

```markdown
---
name: css-development
description: Use when working with CSS, creating components, styling elements, refactoring styles, or reviewing CSS code. Guides CSS development following Tailwind + semantic component patterns with dark mode support and test coverage.
---

# CSS Development Skill

## Overview

Comprehensive workflow for CSS development using Tailwind + semantic component patterns. This skill automatically routes you to the appropriate specialized workflow based on context.

**This skill will invoke one of three sub-skills:**
- `css-development:create-component` - Creating new CSS components
- `css-development:validate` - Reviewing existing CSS
- `css-development:refactor` - Transforming CSS to semantic patterns

## When This Skill Applies

Claude Code will automatically load this skill when you:
- Create new CSS components or styles
- Review or validate existing CSS code
- Refactor inline styles or utility classes
- Work with component styling in any framework
- Need to add dark mode support
- Write CSS tests
```

**Step 2: Commit skill header**

```bash
git add css-development/SKILL.md
git commit -m "feat: add css-development skill header and metadata

Add frontmatter and overview section for main orchestrator skill.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Main Skill - Pattern Documentation

**Files:**
- Modify: `css-development/SKILL.md`

**Step 1: Add shared pattern reference documentation**

Append to: `css-development/SKILL.md`

```markdown

## CSS Development Patterns

All sub-skills follow these core patterns. Reference this section when working with CSS.

### Core Principles

1. **Semantic Naming** - Use descriptive class names (`.button-primary`, `.card-header`) not utility names (`.btn-blue`, `.card-hdr`)
2. **Tailwind Composition** - Leverage Tailwind utilities via `@apply` directive
3. **Dark Mode by Default** - Include `dark:` variants for all colored/interactive elements
4. **Composition Over Creation** - Reuse existing classes before creating new ones
5. **Test Coverage** - Static CSS tests + component rendering tests
6. **Documentation** - Usage comments above each component class

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
- Include dark mode variants using `dark:` prefix
- Use Tailwind's built-in scales (indigo-500, gray-800, etc.)

### File Structure Convention

```
styles/
├── components.css      # All semantic component classes
└── __tests__/
    └── components.test.ts  # CSS and component tests
```

### Markup Integration (Framework-Agnostic)

Works with React, Vue, Svelte, or vanilla HTML:

**React:**
```tsx
const classes = `button-primary ${className}`.trim();
<button className={classes}>...</button>
```

**Vanilla HTML:**
```html
<button class="button-primary custom-class">...</button>
```

**Vue:**
```vue
<button :class="['button-primary', customClass]">...</button>
```

**Key principle:** Apply semantic class + allow additional classes for customization.

### Atomic Design Levels

- **Atoms:** Basic building blocks (`.button`, `.input`, `.badge`, `.spinner`)
- **Molecules:** Composed components (`.card`, `.form-field`, `.empty-state`)
- **Organisms:** Complex components (`.page-layout`, `.session-card`, `.conversation-timeline`)

### Testing Pattern

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
```

**Step 2: Commit pattern documentation**

```bash
git add css-development/SKILL.md
git commit -m "feat: add pattern documentation to main skill

Document core principles, component patterns, file structure, and testing
patterns that all sub-skills will reference.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Main Skill - Routing Logic

**Files:**
- Modify: `css-development/SKILL.md`

**Step 1: Add context detection and routing workflow**

Append to: `css-development/SKILL.md`

```markdown

## Workflow: Context Detection and Routing

When this skill is invoked, follow these steps to route to the appropriate sub-skill:

### Step 1: Analyze Context

Look at the user's request and recent conversation to determine intent:

**Creating new components?**
- Keywords: "create", "add", "new component", "build a", "make a"
- Files: Mention of components.css or new component names
- Intent: User wants to add new CSS

**Validating existing CSS?**
- Keywords: "review", "validate", "check", "audit", "look at"
- Files: Reference to existing CSS files or components
- Intent: User wants feedback on existing CSS

**Refactoring CSS?**
- Keywords: "refactor", "clean up", "extract", "improve", "convert"
- Code: Inline styles or utility classes in markup visible
- Intent: User wants to transform existing CSS patterns

### Step 2: Choose Sub-Skill

Based on context analysis:

**If creating:** Use the Skill tool to invoke `css-development:create-component`

**If validating:** Use the Skill tool to invoke `css-development:validate`

**If refactoring:** Use the Skill tool to invoke `css-development:refactor`

**If ambiguous:** Ask the user using AskUserQuestion tool:

```
Question: "What would you like to do with CSS?"
Options:
  - "Create new component" (Guide creating new semantic CSS component classes)
  - "Validate existing CSS" (Review CSS against established patterns)
  - "Refactor CSS" (Transform inline/utility styles to semantic components)
```

### Step 3: Invoke Sub-Skill

Use the Skill tool to invoke the chosen sub-skill:

**Example:**
```
I'm routing you to the create-component workflow.
[Invoke Skill tool with skill: "css-development:create-component"]
```

### Step 4: Hand Off Control

Once the sub-skill is invoked, it takes over. The main skill's job is complete.

## Important Notes

- **Don't skip routing:** Always analyze context and choose the right sub-skill
- **Don't duplicate sub-skill logic:** Let sub-skills handle their workflows
- **Reference pattern documentation:** Sub-skills will reference the patterns documented above
- **User can invoke directly:** User can call sub-skills directly (e.g., "use css-development:validate")
```

**Step 2: Commit routing logic**

```bash
git add css-development/SKILL.md
git commit -m "feat: add routing logic to main css-development skill

Implement context detection and sub-skill routing workflow with
clear decision criteria and invocation patterns.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Create Component Sub-Skill - Header and Overview

**Files:**
- Create: `css-development/create-component/SKILL.md`

**Step 1: Write sub-skill header**

Create: `css-development/create-component/SKILL.md`

```markdown
---
name: css-development:create-component
description: Guide creating new CSS components following Tailwind + semantic component patterns with dark mode support and test coverage
---

# CSS Development: Create Component

## Overview

Guides you through creating new CSS components following established patterns:
- Semantic class naming
- Tailwind utility composition via `@apply`
- Dark mode support by default
- Test coverage (static CSS + component rendering)
- Composition over creation (reuse existing classes)

**This is a sub-skill of `css-development`** - typically invoked automatically via the main skill.

## When This Skill Applies

Use when:
- Creating a new styled component (button, card, form field, etc.)
- Adding new semantic CSS classes to components.css
- Building reusable UI patterns
- Need to ensure dark mode support and test coverage

## Pattern Reference

This skill follows the patterns documented in the main `css-development` skill. Key patterns:

**Semantic naming:** `.button-primary` not `.btn-blue`
**Tailwind composition:** Use `@apply` to compose utilities
**Dark mode:** Include `dark:` variants by default
**Composition first:** Check if existing classes can be combined
**Test coverage:** Static CSS tests + component rendering tests
```

**Step 2: Commit sub-skill header**

```bash
git add css-development/create-component/SKILL.md
git commit -m "feat: add create-component sub-skill header

Add frontmatter, overview, and pattern reference for the
create-component workflow.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Create Component Sub-Skill - Workflow Checklist

**Files:**
- Modify: `css-development/create-component/SKILL.md`

**Step 1: Add TodoWrite checklist workflow**

Append to: `css-development/create-component/SKILL.md`

```markdown

## Workflow

When this skill is invoked, create a TodoWrite checklist and work through it step-by-step.

### Announce Usage

First, announce that you're using this skill:

"I'm using the css-development:create-component skill to guide creating this new CSS component."

### Create TodoWrite Checklist

Use the TodoWrite tool to create this checklist:

```
Creating CSS Component:
- [ ] Survey existing components (read components.css)
- [ ] Check if composition solves it (can existing classes combine?)
- [ ] Identify component type (atom/molecule/organism if new class needed)
- [ ] Choose semantic name (follow existing naming patterns)
- [ ] Write component class (use @apply, include dark: variants)
- [ ] Create markup integration (show React/HTML usage)
- [ ] Write static CSS test (verify class exists)
- [ ] Write component rendering test (verify className application)
- [ ] Document component (add usage comment)
```

### Step-by-Step Details

#### Step 1: Survey Existing Components

**Action:** Use the Read tool to read `styles/components.css`

**Purpose:** Understand what already exists to ensure consistency and identify reuse opportunities

**What to look for:**
- Similar components that could be composed
- Existing naming patterns to follow
- Common patterns (button variants, card styles, etc.)

**Mark as in_progress** before starting, **mark as completed** when done.

---

#### Step 2: Check if Composition Solves It

**Action:** Analyze if combining existing classes achieves the goal

**Examples:**
- Want a "primary button with icon"? → Combine `.button-primary` + spacing utilities
- Want a "card with shadow"? → Use `.card` if it exists, add utility class if needed
- Want a "highlighted badge"? → Combine `.badge` + color utilities

**YAGNI principle:** Only create a new class if composition doesn't work or creates excessive duplication in markup.

**Decision:**
- **If composition works:** Document the combination and SKIP remaining steps (no new class needed)
- **If new class needed:** Continue to Step 3

**Mark as completed** when decision is made.

---

#### Step 3: Identify Component Type

**Action:** Determine atomic design level (if creating new class)

**Atoms** - Basic building blocks:
- Single-purpose elements
- Examples: `.button`, `.input`, `.badge`, `.spinner`, `.link`

**Molecules** - Composed components:
- Combine multiple atoms
- Examples: `.card`, `.form-field`, `.empty-state`, `.alert`

**Organisms** - Complex components:
- Multiple molecules + atoms
- Examples: `.page-layout`, `.navigation`, `.session-card`, `.conversation-timeline`

**Why this matters:** Helps scope complexity and dependencies

**Mark as completed** when type is identified.

---

#### Step 4: Choose Semantic Name

**Action:** Choose a descriptive, semantic class name following existing patterns

**Naming patterns from reference codebase:**
- **Base + variant:** `.button-primary`, `.button-secondary`, `.button-danger`
- **Component + sub-element:** `.card-title`, `.card-description`, `.form-field`
- **Context + component:** `.session-card`, `.marketing-hero`, `.dashboard-layout`
- **State modifiers:** `.session-card-active`, `.button-disabled`

**Anti-patterns (avoid):**
- Utility names: `.btn-blue`, `.card-sm`, `.text-big`
- Abbreviations: `.btn`, `.hdr`, `.desc`
- Generic: `.component`, `.item`, `.thing`

**Validation:** Name should clearly indicate purpose and fit existing patterns

**Mark as completed** when name is chosen.

---

#### Step 5: Write Component Class

**Action:** Create the CSS class in `styles/components.css` using Edit tool

**Template:**
```css
/* [Component name] - [Brief description]
   Usage: <[element] className="[class-name]">[content]</[element]> */
.[class-name] {
  @apply [background-utilities] [dark-variants];
  @apply [spacing-utilities];
  @apply [typography-utilities];
  @apply [transition-utilities];
}
```

**Required elements:**
1. **Documentation comment** - What it is, how to use it
2. **Dark mode variants** - Include `dark:` for colors/backgrounds
3. **Logical grouping** - Group related utilities (background, spacing, typography, transitions)
4. **Interactive states** - Include hover/focus/active if applicable

**Example:**
```css
/* Primary button - Main call-to-action button with hover lift effect
   Usage: <button className="button-primary">Click me</button> */
.button-primary {
  @apply bg-indigo-500 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-800;
  @apply px-6 py-3 rounded-lg font-medium text-white;
  @apply transition-all duration-200 hover:-translate-y-0.5;
  @apply focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2;
}
```

**Use Edit tool to add to existing file** (don't overwrite entire file)

**Mark as completed** when class is written to file.

---

#### Step 6: Create Markup Integration

**Action:** Document how to use the component in different frameworks

**Show usage examples for:**
- React (if project uses React)
- Vanilla HTML (always show this)
- Vue or other frameworks (if project uses them)

**Example documentation:**

```markdown
## Using the button-primary Component

**React:**
```tsx
const Button = ({ variant = 'primary', className = '', children, ...props }) => {
  const classes = `button-${variant} ${className}`.trim();
  return <button className={classes} {...props}>{children}</button>;
};

// Usage
<Button variant="primary">Click me</Button>
<Button variant="primary" className="w-full">Full width</Button>
```

**Vanilla HTML:**
```html
<button class="button-primary">Click me</button>
<button class="button-primary custom-class">With custom class</button>
```
```

**Where to put this:** In project documentation, README, or as a comment in the component file

**Mark as completed** when markup examples are documented.

---

#### Step 7: Write Static CSS Test

**Action:** Add test to `styles/__tests__/components.test.ts` (or create if doesn't exist)

**Purpose:** Verify the CSS class exists in the components.css file

**Test pattern:**
```typescript
import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('components.css', () => {
  const content = readFileSync('styles/components.css', 'utf-8');

  it('should have button-primary component class', () => {
    expect(content).toContain('.button-primary');
  });

  it('should have button-primary dark mode variants', () => {
    expect(content).toContain('dark:bg-indigo');
  });
});
```

**Key checks:**
- Class exists in file
- Dark mode variants present (search for `dark:`)
- Documentation comment exists (optional but good)

**Run test:**
```bash
npm test styles/__tests__/components.test.ts
# or
vitest styles/__tests__/components.test.ts
```

**Expected:** Test passes (green)

**Mark as completed** when test is written and passing.

---

#### Step 8: Write Component Rendering Test

**Action:** Add component rendering test (framework-specific)

**Purpose:** Verify className application works in actual components

**React example:**
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/atoms/Button';

describe('Button component', () => {
  it('applies button-primary class', () => {
    render(<Button variant="primary">Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('button-primary');
  });

  it('accepts and applies custom className', () => {
    render(<Button variant="primary" className="custom-class">Click</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('button-primary', 'custom-class');
  });
});
```

**Key checks:**
- Semantic class is applied
- Custom className can be added
- Classes don't conflict

**Run test:**
```bash
npm test components/atoms/Button.test.tsx
# or
vitest components/atoms/Button.test.tsx
```

**Expected:** Test passes (green)

**Mark as completed** when test is written and passing.

---

#### Step 9: Document Component

**Action:** Ensure component has usage documentation

**Documentation should include:**
1. **Comment in CSS** - Already done in Step 5
2. **Markup examples** - Already done in Step 6
3. **Component API** (for framework components) - Props, variants, etc.

**Additional documentation (optional but recommended):**
- Add to component style guide if project has one
- Add to Storybook if project uses it
- Add visual examples or screenshots

**Minimum requirement:** CSS comment + markup examples exist

**Mark as completed** when documentation is verified.

---

### Completion

When all checklist items are completed:

1. **Run all tests** to ensure everything passes:
   ```bash
   npm test
   ```

2. **Show summary** of what was created:
   - Component class name and file location
   - Test file locations
   - Documentation locations

3. **Suggest next steps:**
   - Commit the changes
   - Create related variants if needed
   - Use the component in actual UI

**Example summary:**
```
✅ Created button-primary component!

Files created/modified:
- styles/components.css (added .button-primary)
- styles/__tests__/components.test.ts (added static CSS test)
- components/atoms/Button.test.tsx (added rendering test)
- components/atoms/Button.tsx (markup integration)

Next steps:
- Commit these changes: git add . && git commit -m "feat: add button-primary component"
- Use in your UI: <Button variant="primary">Click me</Button>
- Create variants if needed: button-secondary, button-danger, etc.
```
```

**Step 2: Commit workflow checklist**

```bash
git add css-development/create-component/SKILL.md
git commit -m "feat: add workflow checklist to create-component skill

Add comprehensive TodoWrite checklist with detailed step-by-step
instructions for creating new CSS components following patterns.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Validate Sub-Skill - Header and Workflow

**Files:**
- Create: `css-development/validate/SKILL.md`

**Step 1: Write validate sub-skill header**

Create: `css-development/validate/SKILL.md`

```markdown
---
name: css-development:validate
description: Review existing CSS against established Tailwind + semantic component patterns, checking naming, dark mode, tests, and documentation
---

# CSS Development: Validate

## Overview

Reviews existing CSS code against established patterns and provides specific, actionable feedback:
- Semantic naming conventions
- Tailwind `@apply` composition
- Dark mode variant coverage
- Test coverage (static + rendering)
- Documentation quality
- Composition opportunities

**This is a sub-skill of `css-development`** - typically invoked automatically via the main skill.

## When This Skill Applies

Use when:
- Reviewing existing CSS code
- Auditing component styles for consistency
- Checking if patterns are being followed
- Before merging CSS changes
- Refactoring prep (identify issues first)

## Pattern Reference

This skill validates against patterns documented in the main `css-development` skill:

**Semantic naming:** `.button-primary` not `.btn-blue`
**Tailwind composition:** Use `@apply` to compose utilities
**Dark mode:** Include `dark:` variants
**Test coverage:** Static CSS + component rendering tests
**Documentation:** Usage comments above classes
```

**Step 2: Add workflow with TodoWrite checklist**

Append to: `css-development/validate/SKILL.md`

```markdown

## Workflow

When this skill is invoked, create a TodoWrite checklist and work through validation systematically.

### Announce Usage

"I'm using the css-development:validate skill to review this CSS against established patterns."

### Create TodoWrite Checklist

Use the TodoWrite tool:

```
Validating CSS:
- [ ] Read CSS files (load components.css and related styles)
- [ ] Check semantic naming (verify descriptive class names)
- [ ] Verify @apply usage (ensure Tailwind composition)
- [ ] Check dark mode coverage (confirm dark: variants present)
- [ ] Look for composition opportunities (identify reusable patterns)
- [ ] Verify test coverage (check static and rendering tests exist)
- [ ] Check documentation (ensure usage comments present)
- [ ] Report findings (provide file:line references and suggestions)
```

### Validation Checklist Details

#### Step 1: Read CSS Files

**Action:** Use Read tool to load CSS files for review

**Files to check:**
- `styles/components.css` (main semantic components)
- Any component-specific CSS files mentioned
- Inline styles in component files (if applicable)

**What to capture:**
- All class definitions
- Usage of `@apply` vs. inline utilities
- Presence of dark mode variants
- Documentation comments

**Mark as completed** when files are loaded and understood.

---

#### Step 2: Check Semantic Naming

**Action:** Review all class names for semantic, descriptive naming

**Good patterns:**
- `.button-primary`, `.card-header`, `.form-field`, `.empty-state`
- Context + component: `.session-card`, `.marketing-hero`
- Base + variant: `.badge-success`, `.button-danger`

**Bad patterns (report these):**
- Utility names: `.btn-blue`, `.card-sm`, `.text-big`
- Abbreviations: `.btn`, `.hdr`, `.desc`
- Generic: `.component`, `.item`, `.thing`
- Random: `.style1`, `.custom`, `.special`

**For each issue:**
- Note file and line number
- Show the problematic class name
- Suggest semantic alternative based on usage context

**Mark as completed** when all class names reviewed.

---

#### Step 3: Verify @apply Usage

**Action:** Check that Tailwind utilities are composed via `@apply`, not scattered in markup

**Good patterns:**
```css
.button-primary {
  @apply bg-indigo-500 hover:bg-indigo-700 px-6 py-3 rounded-lg;
}
```

**Bad patterns (report these):**
```html
<!-- Utilities in markup instead of semantic class -->
<button class="bg-indigo-500 hover:bg-indigo-700 px-6 py-3 rounded-lg">
  Click me
</button>
```

**Check:**
- Are utilities composed into semantic classes via `@apply`?
- Are there repeated utility combinations in markup that should be extracted?
- Are semantic classes actually being used in components?

**For each issue:**
- Show the problematic markup or CSS
- Explain why it should use `@apply`
- Suggest extraction to semantic class

**Mark as completed** when @apply usage is reviewed.

---

#### Step 4: Check Dark Mode Coverage

**Action:** Verify colored and interactive elements have `dark:` variants

**What needs dark mode:**
- Background colors (bg-*)
- Text colors (text-*)
- Border colors (border-*)
- Interactive states (hover, focus)
- Shadows that affect visibility

**What typically doesn't need dark mode:**
- Spacing utilities (p-*, m-*, gap-*)
- Layout utilities (flex, grid, etc.)
- Pure structural styles

**Pattern to check:**
```css
/* Good - has dark mode */
.card {
  @apply bg-white dark:bg-gray-800 text-gray-900 dark:text-white;
}

/* Bad - missing dark mode */
.card {
  @apply bg-white text-gray-900;
}
```

**For each issue:**
- Note which class is missing dark mode variants
- Show the current CSS
- Suggest specific `dark:` utilities to add

**Mark as completed** when dark mode coverage is checked.

---

#### Step 5: Look for Composition Opportunities

**Action:** Identify repeated patterns that could use existing classes or be extracted

**Look for:**
- Same utility combinations repeated in multiple classes
- Similar patterns that could share a base class
- Inline utilities that could reference semantic classes

**Example issue:**
```css
/* Repeated pattern */
.card-primary {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-6;
}

.card-secondary {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-6;
  @apply border-2 border-gray-200;
}

/* Suggestion: Extract base .card class, add variants */
.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-6;
}

.card-secondary {
  @apply border-2 border-gray-200;
}
```

**For each opportunity:**
- Show the repeated pattern
- Suggest base class + composition
- Estimate impact (how many places benefit)

**Mark as completed** when composition opportunities are identified.

---

#### Step 6: Verify Test Coverage

**Action:** Check that CSS classes have test coverage

**Static CSS tests** - Check `styles/__tests__/components.test.ts`:
```typescript
it('should have button-primary class', () => {
  expect(content).toContain('.button-primary');
});
```

**Component rendering tests** - Check component test files:
```typescript
it('applies button-primary class', () => {
  render(<Button variant="primary">Click</Button>);
  expect(screen.getByRole('button')).toHaveClass('button-primary');
});
```

**For classes without tests:**
- List the class name
- Note which test is missing (static, rendering, or both)
- Provide test template to add

**Mark as completed** when test coverage is checked.

---

#### Step 7: Check Documentation

**Action:** Verify components have usage documentation

**Required documentation:**
- Comment above CSS class explaining purpose
- Usage example in comment

**Example:**
```css
/* Button component - Primary action button with hover lift effect
   Usage: <button className="button-primary">Click me</button> */
.button-primary {
  ...
}
```

**For classes without documentation:**
- List the class name and location
- Suggest documentation to add based on class purpose

**Mark as completed** when documentation is checked.

---

#### Step 8: Report Findings

**Action:** Compile all findings into structured report

**Report format:**

```markdown
## CSS Validation Report

### ✅ Good Patterns Found

- `.button-primary` follows semantic naming (components.css:15)
- Dark mode variants present on interactive elements (components.css:17-19)
- Tests cover className application (Button.test.tsx:23)
- Documentation comments present (components.css:14)

### ⚠️ Issues Found

#### Semantic Naming Issues

**components.css:45** - `.btn-blue` uses utility naming
- Current: `.btn-blue`
- Suggestion: Rename to `.button-secondary` for consistency with `.button-primary`
- Impact: Update 3 component files

**components.css:67** - `.card-sm` uses size in name
- Current: `.card-sm`
- Suggestion: Extract size to utility or rename to `.card-compact` for semantic meaning
- Impact: Update 5 usages

#### Missing Dark Mode Variants

**components.css:78** - `.card-header` missing dark mode
- Current: `@apply bg-gray-100 text-gray-900`
- Suggestion: Add `dark:bg-gray-800 dark:text-white`
- Impact: Visual bug in dark mode

**components.css:92** - `.badge` missing dark mode
- Current: `@apply bg-indigo-100 text-indigo-800`
- Suggestion: Add `dark:bg-indigo-900 dark:text-indigo-200`
- Impact: Low contrast in dark mode

#### Missing Test Coverage

**components.css:102** - `.empty-state` has no tests
- Missing: Both static CSS test and component rendering test
- Suggestion: Add tests to verify class exists and renders correctly

#### Missing Documentation

**components.css:115** - `.session-card` lacks usage comment
- Suggestion: Add comment explaining purpose and usage example

### 📊 Summary

- **Total classes reviewed:** 12
- **Issues found:** 7
- **Priority:** 2 high (dark mode bugs), 3 medium (naming), 2 low (docs)

### 🎯 Recommended Actions

1. **High priority:** Add dark mode variants to `.card-header` and `.badge` (visual bugs)
2. **Medium priority:** Rename `.btn-blue` → `.button-secondary` for consistency
3. **Medium priority:** Add test coverage for `.empty-state`
4. **Low priority:** Add documentation comments to undocumented classes

Would you like me to fix these issues, or would you prefer to address them manually?
```

**Mark as completed** when report is generated and presented.

---

### Completion

After generating the validation report:

1. **Ask user what they want to do next:**
   - Fix issues automatically?
   - Fix specific issues only?
   - Just wanted the report?

2. **Offer to invoke refactor skill** if there are structural issues that need refactoring

3. **Suggest committing** any fixes made
```

**Step 3: Commit validate sub-skill**

```bash
git add css-development/validate/SKILL.md
git commit -m "feat: add validate sub-skill with comprehensive workflow

Add CSS validation skill that reviews code against patterns and
provides structured feedback with actionable suggestions.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: Refactor Sub-Skill - Header and Workflow

**Files:**
- Create: `css-development/refactor/SKILL.md`

**Step 1: Write refactor sub-skill**

Create: `css-development/refactor/SKILL.md`

```markdown
---
name: css-development:refactor
description: Transform existing CSS (inline styles, utility classes in markup, scattered CSS) into semantic component patterns with dark mode support and tests
---

# CSS Development: Refactor

## Overview

Transforms existing CSS into semantic component patterns:
- Extract inline styles to semantic classes
- Consolidate utility classes from markup into `@apply` compositions
- Add dark mode variants
- Add test coverage
- Preserve existing functionality (behavior-neutral refactoring)

**This is a sub-skill of `css-development`** - typically invoked automatically via the main skill.

## When This Skill Applies

Use when:
- Converting inline styles to semantic classes
- Extracting repeated utility combinations from markup
- Migrating from pure utility-first to semantic components
- Adding dark mode to existing CSS
- Cleaning up scattered or duplicated CSS

## Pattern Reference

This skill refactors toward patterns documented in the main `css-development` skill:

**Semantic naming:** `.button-primary` not `.btn-blue`
**Tailwind composition:** Use `@apply` to compose utilities
**Dark mode:** Include `dark:` variants
**Composition first:** Reuse existing classes before creating new
**Test coverage:** Static CSS + component rendering tests

## Workflow

When this skill is invoked, create a TodoWrite checklist and refactor systematically.

### Announce Usage

"I'm using the css-development:refactor skill to transform this CSS into semantic component patterns."

### Create TodoWrite Checklist

Use the TodoWrite tool:

```
Refactoring CSS:
- [ ] Analyze existing CSS (identify what needs refactoring)
- [ ] Find repeated patterns (look for duplicated utility combinations)
- [ ] Check existing components (see if patterns already exist)
- [ ] Extract to semantic classes (create new classes using @apply)
- [ ] Include dark mode (add dark: variants to new classes)
- [ ] Update markup (replace inline/utility classes with semantic names)
- [ ] Add tests (write static CSS and rendering tests)
- [ ] Document components (add usage comments)
- [ ] Verify behavior unchanged (ensure visual output matches original)
```

### Refactoring Checklist Details

#### Step 1: Analyze Existing CSS

**Action:** Read and understand the CSS that needs refactoring

**Look for:**
- Inline styles in component files
- Repeated utility class combinations in markup
- CSS scattered across multiple files
- Missing dark mode support
- Lack of semantic class names

**Example patterns to refactor:**

```tsx
// Inline styles
<button style={{ background: 'indigo', padding: '1.5rem 2rem' }}>Click</button>

// Repeated utilities in markup
<button class="bg-indigo-500 hover:bg-indigo-700 px-6 py-3 rounded-lg text-white">
  Click me
</button>
<button class="bg-indigo-500 hover:bg-indigo-700 px-6 py-3 rounded-lg text-white">
  Submit
</button>

// Non-semantic CSS
.btn-blue {
  background: blue;
  padding: 12px 24px;
}
```

**Capture:**
- File locations
- Pattern frequency (how many times repeated)
- Current approach (inline, utilities, old CSS)

**Mark as completed** when analysis is done.

---

#### Step 2: Find Repeated Patterns

**Action:** Identify duplicated utility combinations that should become semantic classes

**Use Grep tool** to search for repeated patterns:

```bash
# Search for common utility combinations
grep -r "bg-indigo-500 hover:bg-indigo-700 px-6 py-3" .
grep -r "rounded-lg shadow-md p-6" .
```

**Categorize patterns:**
- **High frequency** (5+ occurrences): Definitely extract
- **Medium frequency** (2-4 occurrences): Probably extract
- **Low frequency** (1 occurrence): Keep as-is or compose existing classes

**For each pattern:**
- Count occurrences
- List file locations
- Identify semantic purpose (is this a button? card? badge?)

**Mark as completed** when patterns are cataloged.

---

#### Step 3: Check Existing Components

**Action:** Read `styles/components.css` to see if patterns already exist

**Before creating new classes, check:**
- Does a similar class already exist?
- Can existing classes be composed?
- Would a variant of an existing class work?

**Example:**
```
Pattern found: bg-indigo-500 hover:bg-indigo-700 px-6 py-3 rounded-lg text-white
Check: Does .button-primary already exist? YES
Solution: Use .button-primary instead of creating new class
```

**Decision for each pattern:**
- ✅ Use existing class as-is
- ✅ Compose existing classes
- ✅ Create variant of existing class
- ⚠️ Create new class (only if no existing solution)

**Mark as completed** when reuse opportunities are identified.

---

#### Step 4: Extract to Semantic Classes

**Action:** Create new semantic classes in `styles/components.css` for patterns that need extraction

**For each pattern being extracted:**

1. **Choose semantic name** following existing patterns
2. **Write CSS class** using `@apply`
3. **Include dark mode** variants
4. **Add documentation** comment

**Example extraction:**

**Before (in markup):**
```tsx
<button class="bg-indigo-500 hover:bg-indigo-700 px-6 py-3 rounded-lg text-white transition-all duration-200">
  Click me
</button>
```

**After (in components.css):**
```css
/* Primary button - Main call-to-action button with hover states
   Usage: <button className="button-primary">Click me</button> */
.button-primary {
  @apply bg-indigo-500 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-800;
  @apply px-6 py-3 rounded-lg text-white;
  @apply transition-all duration-200;
}
```

**Use Edit tool** to add each new class to components.css

**Mark as completed** when all semantic classes are created.

---

#### Step 5: Include Dark Mode

**Action:** Ensure all new/refactored classes have `dark:` variants

**For each class created in Step 4:**
- Add `dark:` variants for backgrounds
- Add `dark:` variants for text colors
- Add `dark:` variants for borders
- Test in dark mode (if possible)

**Pattern:**
```css
.component {
  @apply bg-white dark:bg-gray-800;
  @apply text-gray-900 dark:text-white;
  @apply border-gray-200 dark:border-gray-700;
}
```

**Mark as completed** when dark mode coverage is added.

---

#### Step 6: Update Markup

**Action:** Replace inline styles and utility classes with semantic class names

**For each file using the old pattern:**

1. **Read the file** with Read tool
2. **Use Edit tool** to replace old pattern with semantic class
3. **Verify** the replacement is correct

**Example:**

**Before:**
```tsx
<button class="bg-indigo-500 hover:bg-indigo-700 px-6 py-3 rounded-lg text-white">
  Click me
</button>
```

**After:**
```tsx
<button class="button-primary">
  Click me
</button>
```

**Handle custom classes:**
```tsx
<!-- If there were additional custom classes, preserve them -->
<button class="button-primary w-full mt-4">
  Click me
</button>
```

**Track changes:**
- Count files updated
- Count instances replaced
- Note any edge cases

**Mark as completed** when all markup is updated.

---

#### Step 7: Add Tests

**Action:** Add test coverage for refactored components

**Static CSS test** in `styles/__tests__/components.test.ts`:
```typescript
it('should have button-primary class', () => {
  const content = readFileSync('styles/components.css', 'utf-8');
  expect(content).toContain('.button-primary');
});

it('should have dark mode variants in button-primary', () => {
  const content = readFileSync('styles/components.css', 'utf-8');
  expect(content).toContain('dark:bg-indigo');
});
```

**Component rendering test** (if applicable):
```typescript
it('applies button-primary class after refactor', () => {
  render(<Button variant="primary">Click</Button>);
  expect(screen.getByRole('button')).toHaveClass('button-primary');
});
```

**Run tests** to ensure they pass:
```bash
npm test
```

**Mark as completed** when tests are added and passing.

---

#### Step 8: Document Components

**Action:** Ensure all refactored classes have documentation

**Documentation includes:**
- Comment in CSS explaining purpose
- Usage example
- Migration notes (if helpful)

**Example:**
```css
/* Primary button - Main CTA button (refactored from inline utilities)
   Usage: <button className="button-primary">Click me</button>
   Replaces: bg-indigo-500 hover:bg-indigo-700 px-6 py-3 rounded-lg text-white */
.button-primary {
  @apply bg-indigo-500 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-800;
  @apply px-6 py-3 rounded-lg text-white;
  @apply transition-all duration-200;
}
```

**Mark as completed** when documentation is added.

---

#### Step 9: Verify Behavior Unchanged

**Action:** Ensure visual output and behavior match the original

**Verification steps:**

1. **Run tests** (if project has them):
   ```bash
   npm test
   ```

2. **Visual inspection** (if possible):
   - Start dev server
   - Check refactored components look the same
   - Test in light and dark mode
   - Test interactive states (hover, focus, active)

3. **Check for regressions:**
   - Compare before/after screenshots (if available)
   - Verify no console errors
   - Check responsive behavior

**If behavior changed:**
- Identify the difference
- Fix the semantic class to match original behavior
- Re-test

**Behavior must be preserved** - refactoring should be visually neutral

**Mark as completed** when behavior is verified unchanged.

---

### Completion

When all checklist items are completed:

1. **Generate summary** of refactoring work:

```markdown
## CSS Refactoring Summary

### Changes Made

**Semantic classes created:**
- `.button-primary` (extracted from 8 instances across 5 files)
- `.card` (extracted from 12 instances across 7 files)
- `.badge-success` (extracted from 4 instances across 3 files)

**Files modified:**
- `styles/components.css` (+45 lines, 3 new classes)
- `components/Button.tsx` (replaced utilities with .button-primary)
- `components/Card.tsx` (replaced utilities with .card)
- `components/Badge.tsx` (replaced utilities with .badge-success)
- `styles/__tests__/components.test.ts` (+12 lines, 3 new tests)

**Dark mode support:**
- ✅ All refactored classes include dark: variants
- ✅ Tested in both light and dark mode

**Test coverage:**
- ✅ Static CSS tests added for all new classes
- ✅ Component rendering tests updated
- ✅ All tests passing

**Behavior verification:**
- ✅ Visual output matches original
- ✅ No console errors
- ✅ Interactive states work correctly

### Impact

**Code reduction:**
- Removed 247 lines of repeated utility classes from markup
- Added 45 lines of semantic CSS
- Net reduction: 202 lines

**Maintainability:**
- Styling centralized in components.css
- Changes now made in one place instead of many
- Consistent component appearance

**Dark mode:**
- Added dark mode support that didn't exist before
- All components now work in light and dark themes
```

2. **Suggest next steps:**
   - Commit the refactoring
   - Document the new patterns for the team
   - Continue refactoring other components

3. **Offer validation:**
   "Would you like me to validate the refactored CSS using the css-development:validate skill?"

**Mark as completed** when summary is presented.
```

**Step 2: Commit refactor sub-skill**

```bash
git add css-development/refactor/SKILL.md
git commit -m "feat: add refactor sub-skill with comprehensive workflow

Add CSS refactoring skill that transforms inline/utility styles
into semantic component patterns with dark mode and tests.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 9: Integration Testing

**Files:**
- Create: `tests/integration/skill-routing.test.md`

**Step 1: Create manual test scenarios for skill routing**

Create: `tests/integration/skill-routing.test.md`

```markdown
# CSS Development Skills - Integration Test Scenarios

## Test 1: Auto-Detection for Creation

**Scenario:** User asks Claude Code to create a new CSS component

**User input:** "Create a primary button component with hover effects"

**Expected behavior:**
1. `css-development` skill auto-loads (based on "create" + "component" keywords)
2. Main skill analyzes context → routes to `create-component`
3. `create-component` creates TodoWrite checklist
4. Walks through: survey existing → choose name → write class → add tests → document

**Success criteria:**
- ✅ Main skill loads automatically
- ✅ Routes to create-component without asking
- ✅ TodoWrite checklist created
- ✅ All 9 steps executed
- ✅ Results in semantic class with dark mode and tests

---

## Test 2: Auto-Detection for Validation

**Scenario:** User asks Claude Code to review CSS

**User input:** "Review the CSS in styles/components.css"

**Expected behavior:**
1. `css-development` skill auto-loads (based on "review" + "CSS" keywords)
2. Main skill analyzes context → routes to `validate`
3. `validate` creates TodoWrite checklist
4. Walks through: read files → check naming → verify dark mode → report findings

**Success criteria:**
- ✅ Main skill loads automatically
- ✅ Routes to validate without asking
- ✅ TodoWrite checklist created
- ✅ All 8 validation steps executed
- ✅ Generates structured report with findings

---

## Test 3: Auto-Detection for Refactoring

**Scenario:** User asks Claude Code to refactor inline styles

**User input:** "Refactor these inline styles to semantic classes"

**Expected behavior:**
1. `css-development` skill auto-loads (based on "refactor" + "styles" keywords)
2. Main skill analyzes context → routes to `refactor`
3. `refactor` creates TodoWrite checklist
4. Walks through: analyze → find patterns → extract classes → update markup → add tests

**Success criteria:**
- ✅ Main skill loads automatically
- ✅ Routes to refactor without asking
- ✅ TodoWrite checklist created
- ✅ All 9 refactoring steps executed
- ✅ Behavior preserved, tests added

---

## Test 4: Ambiguous Context - Ask User

**Scenario:** User mentions CSS but intent unclear

**User input:** "I want to work on the button styles"

**Expected behavior:**
1. `css-development` skill auto-loads (based on "styles" keyword)
2. Main skill analyzes context → ambiguous (could be create, validate, or refactor)
3. Main skill uses AskUserQuestion tool with three options
4. User selects option
5. Main skill routes to chosen sub-skill

**Success criteria:**
- ✅ Main skill loads automatically
- ✅ Detects ambiguity
- ✅ Asks user with structured question (3 options)
- ✅ Routes to correct sub-skill after user selection

---

## Test 5: Direct Sub-Skill Invocation

**Scenario:** User directly invokes sub-skill

**User input:** "Use css-development:validate to check my CSS"

**Expected behavior:**
1. `css-development:validate` loads directly (bypassing main skill)
2. Validate creates TodoWrite checklist
3. Executes validation workflow

**Success criteria:**
- ✅ Sub-skill loads directly
- ✅ TodoWrite checklist created
- ✅ Validation workflow executes

---

## Test 6: Pattern Reference Usage

**Scenario:** Sub-skill references patterns from main skill

**User input:** "Create a new card component"

**Expected behavior:**
1. Main skill routes to create-component
2. Create-component references patterns from main skill documentation
3. Uses semantic naming pattern
4. Uses @apply composition pattern
5. Includes dark mode by default

**Success criteria:**
- ✅ Semantic naming follows documented pattern
- ✅ Uses @apply correctly
- ✅ Includes dark: variants
- ✅ Follows atomic design levels
- ✅ Creates tests per documented pattern

---

## Test 7: Composition Over Creation

**Scenario:** User asks to create component that could use existing classes

**User input:** "Create a secondary button"

**Expected behavior:**
1. Routes to create-component
2. Step 1: Reads components.css, finds .button-primary exists
3. Step 2: Checks if composition works → determines new variant needed (not just composition)
4. Step 4: Names it .button-secondary (following existing pattern)
5. Creates semantic class following .button-primary structure

**Success criteria:**
- ✅ Surveys existing components first
- ✅ Identifies existing .button-primary pattern
- ✅ Creates .button-secondary as variant (consistent naming)
- ✅ Structure matches existing button classes

---

## Test 8: Validation Finds Issues

**Scenario:** User asks to validate CSS with actual issues

**User input:** "Validate styles/components.css" (file has issues)

**Expected behavior:**
1. Routes to validate
2. Reads file, identifies issues:
   - Non-semantic name (.btn-blue)
   - Missing dark mode on .card
   - No tests for .badge
3. Generates structured report with:
   - ✅ Good patterns section
   - ⚠️ Issues section with file:line references
   - 🎯 Recommended actions
4. Asks what user wants to do next

**Success criteria:**
- ✅ Identifies actual issues
- ✅ Provides specific file:line references
- ✅ Suggests concrete fixes
- ✅ Prioritizes issues (high/medium/low)
- ✅ Offers to fix or hand off to refactor

---

## Test 9: Refactor Preserves Behavior

**Scenario:** User asks to refactor working component

**User input:** "Refactor the button utilities to semantic classes"

**Expected behavior:**
1. Routes to refactor
2. Analyzes existing utilities in markup
3. Extracts to semantic class with @apply
4. Updates all instances in markup
5. Adds tests
6. **Step 9:** Runs tests to verify behavior unchanged

**Success criteria:**
- ✅ Extracts utilities correctly
- ✅ Updates all markup instances
- ✅ Tests added and passing
- ✅ Visual output matches original (behavior preserved)
- ✅ Summary shows impact (files changed, lines reduced)

---

## Test 10: Dark Mode by Default

**Scenario:** User creates component without mentioning dark mode

**User input:** "Create a card component"

**Expected behavior:**
1. Routes to create-component
2. Step 5: Writes component class
3. **Automatically includes dark: variants** (per pattern documentation)
4. Step 7: Static CSS test checks for dark: variants
5. Result includes both light and dark mode support

**Success criteria:**
- ✅ Component has dark: variants without user asking
- ✅ Test verifies dark mode present
- ✅ Documentation mentions light/dark support

---

## Manual Testing Instructions

To run these tests manually:

1. **Install skills:**
   ```bash
   cp -r css-development ~/.claude/skills/
   ```

2. **For each test:**
   - Start new Claude Code session
   - Provide the "User input" exactly as written
   - Observe Claude Code's behavior
   - Check against "Success criteria"

3. **Document results:**
   - Note which tests pass
   - Note which tests fail and how
   - Identify skill improvements needed

4. **Iterate:**
   - Fix issues in skill files
   - Re-test failed scenarios
   - Verify fixes don't break passing tests
```

**Step 2: Commit integration test scenarios**

```bash
git add tests/integration/skill-routing.test.md
git commit -m "feat: add integration test scenarios for CSS skills

Define 10 test scenarios covering skill routing, auto-detection,
pattern usage, and workflow execution for manual testing.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 10: Example Usage Documentation

**Files:**
- Create: `docs/examples/css-development-examples.md`

**Step 1: Create examples document**

Create: `docs/examples/css-development-examples.md`

```markdown
# CSS Development Skills - Usage Examples

Real-world examples of using the CSS development skills.

## Example 1: Creating a New Button Component

**Scenario:** You need a primary button for your app.

**What you say:**
```
"Create a primary button component with hover effects and dark mode support"
```

**What happens:**
1. Claude Code loads `css-development` skill automatically
2. Routes to `css-development:create-component`
3. Creates TodoWrite checklist
4. Walks through each step:
   - Reads existing components.css
   - Checks if .button already exists
   - Chooses name: .button-primary
   - Writes CSS with @apply and dark: variants
   - Creates React component wrapper
   - Adds static CSS test
   - Adds component rendering test
   - Documents with usage comment

**Result:**

**styles/components.css:**
```css
/* Primary button - Main call-to-action button with hover effects
   Usage: <button className="button-primary">Click me</button> */
.button-primary {
  @apply bg-indigo-500 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-800;
  @apply px-6 py-3 rounded-lg font-medium text-white;
  @apply transition-all duration-200 hover:-translate-y-0.5;
  @apply focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2;
}
```

**components/atoms/Button.tsx:**
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  const classes = `button-${variant} ${className}`.trim();
  return <button className={classes} {...props}>{children}</button>;
};
```

**styles/__tests__/components.test.ts:**
```typescript
it('should have button-primary class', () => {
  const content = readFileSync('styles/components.css', 'utf-8');
  expect(content).toContain('.button-primary');
  expect(content).toContain('dark:bg-indigo');
});
```

**Usage:**
```tsx
<Button variant="primary">Click me</Button>
<Button variant="primary" className="w-full">Full width</Button>
```

---

## Example 2: Validating Existing CSS

**Scenario:** You want to check if your CSS follows the established patterns.

**What you say:**
```
"Review the CSS in styles/components.css"
```

**What happens:**
1. Claude Code loads `css-development` skill
2. Routes to `css-development:validate`
3. Creates TodoWrite checklist
4. Executes validation:
   - Reads components.css
   - Checks semantic naming
   - Verifies @apply usage
   - Checks dark mode coverage
   - Looks for composition opportunities
   - Verifies test coverage
   - Checks documentation
   - Generates report

**Result:**

```markdown
## CSS Validation Report

### ✅ Good Patterns Found

- `.button-primary` follows semantic naming (components.css:15)
- Dark mode variants present (components.css:17)
- Tests cover className application (Button.test.tsx:23)

### ⚠️ Issues Found

#### Missing Dark Mode Variants

**components.css:78** - `.card-header` missing dark mode
- Current: `@apply bg-gray-100 text-gray-900`
- Suggestion: Add `dark:bg-gray-800 dark:text-white`
- Impact: Visual bug in dark mode

#### Missing Test Coverage

**components.css:102** - `.empty-state` has no tests
- Missing: Both static CSS test and component rendering test
- Suggestion: Add tests to verify class exists and renders correctly

### 📊 Summary

- **Total classes reviewed:** 8
- **Issues found:** 2
- **Priority:** 1 high (dark mode bug), 1 medium (missing tests)

### 🎯 Recommended Actions

1. **High priority:** Add dark mode variants to `.card-header`
2. **Medium priority:** Add test coverage for `.empty-state`

Would you like me to fix these issues?
```

**Next steps:** You can ask Claude to fix the issues, or fix them manually.

---

## Example 3: Refactoring Inline Styles

**Scenario:** Your component has repeated utility classes in markup that should be extracted.

**What you say:**
```
"Refactor the button utilities in LoginPage.tsx to semantic classes"
```

**What happens:**
1. Claude Code loads `css-development` skill
2. Routes to `css-development:refactor`
3. Creates TodoWrite checklist
4. Executes refactoring:
   - Analyzes LoginPage.tsx
   - Finds repeated pattern: `bg-indigo-500 hover:bg-indigo-700 px-6 py-3 rounded-lg text-white`
   - Checks if .button-primary exists → it doesn't
   - Extracts to .button-primary in components.css
   - Adds dark mode variants
   - Updates all button instances in LoginPage.tsx
   - Adds tests
   - Verifies behavior unchanged

**Before (LoginPage.tsx):**
```tsx
<button className="bg-indigo-500 hover:bg-indigo-700 px-6 py-3 rounded-lg text-white transition-all duration-200">
  Sign In
</button>
<button className="bg-indigo-500 hover:bg-indigo-700 px-6 py-3 rounded-lg text-white transition-all duration-200">
  Create Account
</button>
```

**After (LoginPage.tsx):**
```tsx
<Button variant="primary">Sign In</Button>
<Button variant="primary">Create Account</Button>
```

**Created (components.css):**
```css
.button-primary {
  @apply bg-indigo-500 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-800;
  @apply px-6 py-3 rounded-lg text-white;
  @apply transition-all duration-200;
}
```

**Summary:**
```
- Removed 94 characters per button instance
- Updated 2 instances in LoginPage.tsx
- Created 1 semantic class in components.css
- Added dark mode support
- Added test coverage
- Behavior preserved ✅
```

---

## Example 4: Adding Dark Mode to Existing Component

**Scenario:** You have a card component without dark mode.

**What you say:**
```
"Add dark mode support to the card component"
```

**What happens:**
1. Claude Code loads `css-development` skill
2. Routes to `css-development:refactor` (modifying existing)
3. Reads current .card class
4. Adds dark: variants for bg, text, border
5. Updates tests to verify dark mode
6. Shows before/after

**Before:**
```css
.card {
  @apply bg-white rounded-lg shadow-md p-6;
  @apply text-gray-900 border border-gray-200;
}
```

**After:**
```css
.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-6;
  @apply text-gray-900 dark:text-white;
  @apply border border-gray-200 dark:border-gray-700;
}
```

**Test added:**
```typescript
it('should have dark mode variants in card', () => {
  const content = readFileSync('styles/components.css', 'utf-8');
  expect(content).toContain('dark:bg-gray-800');
  expect(content).toContain('dark:text-white');
});
```

---

## Example 5: Creating Variants of Existing Component

**Scenario:** You have .button-primary and need a secondary variant.

**What you say:**
```
"Create a secondary button variant"
```

**What happens:**
1. Claude Code loads `css-development` skill
2. Routes to `css-development:create-component`
3. Step 1: Surveys existing → finds .button-primary
4. Step 2: Checks composition → needs variant (not just composition)
5. Step 4: Names it .button-secondary (consistent with .button-primary)
6. Step 5: Creates class following .button-primary structure
7. Adds tests and documentation

**Result:**
```css
/* Secondary button - Alternative action button
   Usage: <button className="button-secondary">Cancel</button> */
.button-secondary {
  @apply bg-gray-500 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-800;
  @apply px-6 py-3 rounded-lg font-medium text-white;
  @apply transition-all duration-200 hover:-translate-y-0.5;
  @apply focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2;
}
```

**Usage:**
```tsx
<Button variant="primary">Submit</Button>
<Button variant="secondary">Cancel</Button>
```

---

## Example 6: Composition Instead of New Class

**Scenario:** You want a full-width primary button.

**What you say:**
```
"Create a full-width primary button"
```

**What happens:**
1. Claude Code loads `css-development` skill
2. Routes to `css-development:create-component`
3. Step 1: Surveys existing → finds .button-primary
4. Step 2: Checks composition → YES, can compose
5. **Doesn't create new class** → suggests composition

**Suggestion:**
```
Instead of creating a new class, you can compose existing classes:

<Button variant="primary" className="w-full">Click me</Button>

This combines .button-primary with Tailwind's w-full utility.
No new CSS class needed!
```

**Why:** YAGNI principle - don't create unnecessary classes when composition works.

---

## Tips for Using the Skills

### Let Auto-Detection Work

Just describe what you want in natural language:
- "Create a badge component" → auto-routes to create
- "Review my CSS" → auto-routes to validate
- "Refactor these styles" → auto-routes to refactor

### Trust the Checklist

The TodoWrite checklists ensure you don't skip important steps:
- Survey existing (avoid duplicates)
- Include dark mode (always)
- Add tests (prevent regressions)
- Document (help future you)

### Composition Over Creation

The skills will push you to reuse existing classes before creating new ones. This keeps your CSS lean and maintainable.

### Tests Prevent Regressions

Every component gets tests. This means refactoring later won't break things.

### Framework-Agnostic

The patterns work with React, Vue, Svelte, or vanilla HTML. The semantic classes are the source of truth, not the framework.
```

**Step 2: Commit examples documentation**

```bash
git add docs/examples/css-development-examples.md
git commit -m "docs: add comprehensive usage examples for CSS skills

Include 6 real-world examples showing creation, validation,
refactoring, dark mode, variants, and composition.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 11: Final Documentation and Wrap-Up

**Files:**
- Modify: `README.md`
- Create: `docs/DEVELOPMENT.md`

**Step 1: Enhance README with installation and quick start**

Update: `README.md`

Add to end of file:

```markdown

## Installation

### Option 1: Copy to Claude Skills Directory

```bash
cp -r css-development ~/.claude/skills/
```

### Option 2: Symlink (for development)

```bash
ln -s $(pwd)/css-development ~/.claude/skills/css-development
```

### Verify Installation

1. Start Claude Code
2. Say "create a button component"
3. Claude Code should automatically load the css-development skill

## Quick Start

### Creating a Component

```
You: "Create a primary button component"
```

Claude will:
- Guide you through the creation process
- Ensure semantic naming, dark mode, and tests
- Generate complete CSS + component + tests

### Validating CSS

```
You: "Review the CSS in styles/components.css"
```

Claude will:
- Check naming conventions
- Verify dark mode coverage
- Check test coverage
- Provide structured feedback

### Refactoring

```
You: "Refactor these inline styles to semantic classes"
```

Claude will:
- Extract repeated patterns
- Create semantic classes
- Add dark mode and tests
- Update markup

## Pattern Quick Reference

**Semantic naming:**
```css
.button-primary  /* ✅ Good */
.btn-blue        /* ❌ Bad */
```

**Tailwind composition:**
```css
.button-primary {
  @apply bg-indigo-500 px-6 py-3 rounded-lg;
}
```

**Dark mode by default:**
```css
.card {
  @apply bg-white dark:bg-gray-800;
  @apply text-gray-900 dark:text-white;
}
```

**Test coverage:**
```typescript
// Static CSS test
expect(content).toContain('.button-primary');

// Component rendering test
expect(button).toHaveClass('button-primary');
```

## Examples

See [docs/examples/css-development-examples.md](docs/examples/css-development-examples.md) for detailed usage examples.

## Development

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for information about developing and testing these skills.

## Reference Codebase

These patterns are based on: `/Users/dylanr/work/2389/oneonone/hosting`

You can study that codebase to see the patterns in action.

## License

MIT
```

**Step 2: Create development documentation**

Create: `docs/DEVELOPMENT.md`

```markdown
# CSS Development Skills - Development Guide

Guide for maintaining and extending the CSS development skills.

## Project Structure

```
.
├── css-development/                  # Main skill directory
│   ├── SKILL.md                     # Main orchestrator skill
│   ├── create-component/            # Sub-skill for creation
│   │   └── SKILL.md
│   ├── validate/                    # Sub-skill for validation
│   │   └── SKILL.md
│   └── refactor/                    # Sub-skill for refactoring
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
   cp -r css-development ~/.claude/skills/
   ```

2. **Test manually** using scenarios from `tests/integration/skill-routing.test.md`

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

## Common Modifications

### Change Dark Mode Requirement

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

### Add New Test Pattern

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

### Change File Structure Convention

**Current:** `styles/components.css` with `styles/__tests__/`

**To support different structure:**

1. Update pattern documentation in main skill
2. Update file paths in sub-skill checklists
3. Update integration tests
4. Update examples

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

- **Claude Code Skills Documentation:** https://docs.claude.com/en/docs/claude-code/skills
- **Tailwind CSS Documentation:** https://tailwindcss.com/docs
- **Reference Codebase:** `/Users/dylanr/work/2389/oneonone/hosting`
- **Integration Tests:** `tests/integration/skill-routing.test.md`
- **Usage Examples:** `docs/examples/css-development-examples.md`
```

**Step 3: Commit final documentation**

```bash
git add README.md docs/DEVELOPMENT.md
git commit -m "docs: add installation, quick start, and development guide

Complete README with installation instructions, quick start guide,
and pattern reference. Add comprehensive development guide for
maintaining and extending the skills.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Summary

This implementation plan provides:

- **11 tasks** broken into bite-sized steps (2-5 minutes each)
- **Complete code examples** for every skill file
- **Exact file paths** for all files to create/modify
- **Git commits** after each logical chunk
- **Integration tests** to verify the system works
- **Usage examples** for documentation
- **Development guide** for maintenance

Each task follows TDD principles where applicable and includes frequent commits to track progress.

The plan is designed for an engineer with zero context about the codebase - all patterns, file structures, and code are explicitly documented.

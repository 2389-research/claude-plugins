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

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

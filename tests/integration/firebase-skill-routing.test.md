# Firebase Development Skills - Integration Test Scenarios

## Test 1: Auto-Detection for Project Setup

**Scenario:** User asks Claude Code to initialize a new Firebase project

**User input:** "Create a new Firebase project for a blog platform"

**Expected behavior:**
1. `firebase-development` skill auto-loads (based on "create" + "Firebase project" keywords)
2. Main skill analyzes context → routes to `project-setup`
3. `project-setup` creates TodoWrite checklist
4. Walks through: gather requirements → choose architecture → init Firebase → set up emulators → configure tests

**Success criteria:**
- ✅ Main skill loads automatically
- ✅ Routes to project-setup without asking
- ✅ TodoWrite checklist created with 10 steps
- ✅ All initialization steps executed
- ✅ Results in working Firebase project with emulators configured

---

## Test 2: Auto-Detection for Add Feature

**Scenario:** User asks Claude Code to add a Cloud Function

**User input:** "Add a function to handle user registration"

**Expected behavior:**
1. `firebase-development` skill auto-loads (based on "add function" keywords)
2. Main skill analyzes context → routes to `add-feature`
3. `add-feature` creates TodoWrite checklist
4. Walks through: gather requirements → choose architecture → implement function → add tests → document

**Success criteria:**
- ✅ Main skill loads automatically
- ✅ Routes to add-feature without asking
- ✅ TodoWrite checklist created with 9 steps
- ✅ All feature development steps executed
- ✅ Includes unit tests and integration tests

---

## Test 3: Auto-Detection for Debug

**Scenario:** User reports an emulator error

**User input:** "I'm getting permission denied errors in the Firestore emulator"

**Expected behavior:**
1. `firebase-development` skill auto-loads (based on "permission denied" + "emulator" keywords)
2. Main skill analyzes context → routes to `debug`
3. `debug` creates TodoWrite checklist
4. Walks through: isolate issue → check rules → test hypothesis → verify fix

**Success criteria:**
- ✅ Main skill loads automatically
- ✅ Routes to debug without asking
- ✅ TodoWrite checklist created with 8 steps
- ✅ Systematic debugging workflow executed
- ✅ Root cause identified and fixed

---

## Test 4: Auto-Detection for Validate

**Scenario:** User asks Claude Code to review Firebase code

**User input:** "Review my Firestore rules for security issues"

**Expected behavior:**
1. `firebase-development` skill auto-loads (based on "review" + "Firestore rules" keywords)
2. Main skill analyzes context → routes to `validate`
3. `validate` creates TodoWrite checklist
4. Walks through: read files → check security model → verify patterns → test rules → report findings

**Success criteria:**
- ✅ Main skill loads automatically
- ✅ Routes to validate without asking
- ✅ TodoWrite checklist created with 9 steps
- ✅ All validation steps executed
- ✅ Generates structured report with security findings

---

## Test 5: Multiple Keywords - Project Setup

**Scenario:** User uses multiple project setup keywords

**User input:** "Initialize Firebase for my new app and set up the emulators"

**Expected behavior:**
1. Main skill detects "initialize Firebase" + "set up" keywords
2. Routes to `project-setup` based on keyword density
3. Executes full setup workflow

**Success criteria:**
- ✅ Correctly identifies project-setup intent
- ✅ Routes without user confirmation
- ✅ Completes initialization workflow

---

## Test 6: Multiple Keywords - Add Feature

**Scenario:** User uses multiple feature development keywords

**User input:** "Build a new API endpoint to create blog posts"

**Expected behavior:**
1. Main skill detects "build" + "new" + "api" keywords
2. Routes to `add-feature` based on keyword match
3. Executes feature development workflow

**Success criteria:**
- ✅ Correctly identifies add-feature intent
- ✅ Routes without user confirmation
- ✅ Completes feature development workflow

---

## Test 7: Ambiguous Context - Fallback to AskUserQuestion

**Scenario:** User mentions Firebase but intent is unclear

**User input:** "I need help with my Firebase functions"

**Expected behavior:**
1. `firebase-development` skill auto-loads (based on "Firebase functions" keywords)
2. Main skill analyzes context → ambiguous (could be add-feature, debug, or validate)
3. Main skill uses AskUserQuestion tool with 4 options:
   - "Project Setup" (Initialize new Firebase project)
   - "Add Feature" (Add functions, collections, endpoints)
   - "Debug Issue" (Troubleshoot errors or problems)
   - "Validate Code" (Review against patterns)
4. User selects option
5. Main skill routes to chosen sub-skill

**Success criteria:**
- ✅ Main skill loads automatically
- ✅ Detects ambiguity
- ✅ Asks user with structured question (4 options matching documentation)
- ✅ Routes to correct sub-skill after user selection

---

## Test 8: Direct Sub-Skill Invocation

**Scenario:** User directly invokes specific sub-skill

**User input:** "Use firebase-development:debug to troubleshoot my deployment"

**Expected behavior:**
1. `firebase-development:debug` loads directly (bypassing main skill routing)
2. Debug creates TodoWrite checklist
3. Executes debugging workflow

**Success criteria:**
- ✅ Sub-skill loads directly
- ✅ TodoWrite checklist created
- ✅ Debugging workflow executes

---

## Test 9: Pattern Reference - Architecture Decisions

**Scenario:** User asks to add feature and needs architecture guidance

**User input:** "Add authentication using API keys"

**Expected behavior:**
1. Main skill routes to add-feature
2. Add-feature references authentication patterns from main skill
3. Uses custom API key pattern from reference projects
4. Includes middleware implementation
5. Follows format: `{projectPrefix}_` + unique identifier
6. Creates collection structure per documented pattern

**Success criteria:**
- ✅ References documented API key pattern
- ✅ Creates proper storage structure (/users/{userId}/apiKeys/{keyId})
- ✅ Implements middleware correctly
- ✅ Uses collectionGroup query pattern
- ✅ Includes both unit and integration tests

---

## Test 10: Pattern Reference - Security Model Selection

**Scenario:** User sets up new project and needs security guidance

**User input:** "Set up Firebase for a social media app with lots of user posts"

**Expected behavior:**
1. Main skill routes to project-setup
2. Project-setup asks about write patterns (high volume)
3. References security model patterns from main skill
4. Recommends client-write with validation (due to high volume)
5. Implements proper Firestore rules with diff().affectedKeys()
6. Sets up Firebase Auth + roles pattern

**Success criteria:**
- ✅ Asks about write patterns during setup
- ✅ Recommends appropriate security model
- ✅ References documented patterns for chosen approach
- ✅ Implements security rules correctly
- ✅ Includes rules testing with emulator

---

## Manual Testing Instructions

To run these tests manually:

1. **Install skills:**
   ```bash
   cp -r firebase-development ~/.claude/skills/
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

## Keyword Reference

For debugging routing issues, here are the documented keywords by sub-skill:

### project-setup
- "new firebase project"
- "initialize firebase"
- "firebase init"
- "set up firebase"
- "create firebase app"
- "start firebase project"

### add-feature
- "add function"
- "create endpoint"
- "new tool"
- "add api"
- "new collection"
- "add feature"
- "build"
- "implement"

### debug
- "error"
- "not working"
- "debug"
- "emulator issue"
- "rules failing"
- "permission denied"
- "troubleshoot"
- "deployment failed"

### validate
- "review firebase"
- "check firebase"
- "validate"
- "audit firebase"
- "look at firebase code"

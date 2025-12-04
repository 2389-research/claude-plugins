# Firebase Skills Installation Guide

This guide explains how to install and use the Firebase Development Skills for Claude Code.

## What You're Installing

The Firebase Development Skills system provides comprehensive guidance for Firebase projects:

- **firebase-development** - Main orchestrator skill with routing logic
- **firebase-development:project-setup** - Initialize new Firebase projects
- **firebase-development:add-feature** - Add Cloud Functions, Firestore collections, API endpoints
- **firebase-development:debug** - Troubleshoot emulator issues, rules violations, function errors
- **firebase-development:validate** - Review code against security model and best practices

**Total**: 5,341 lines of Firebase development guidance extracted from 3 production projects.

## Prerequisites

- Claude Code CLI installed
- Git (for cloning the skills repository)
- Access to `/Users/dylanr/Dropbox (Personal)/work/2389/skills` or the published repository

## Installation Methods

### Method 1: Copy to Claude Skills Directory (Recommended)

Copy the firebase-development directory to your Claude Code skills directory:

```bash
# Create skills directory if it doesn't exist
mkdir -p ~/.claude/skills

# Copy firebase skills
cp -r /Users/dylanr/Dropbox\ \(Personal\)/work/2389/skills/firebase-development ~/.claude/skills/

# Verify installation
ls -la ~/.claude/skills/firebase-development
```

Expected output:
```
firebase-development/
├── SKILL.md
├── add-feature/
│   └── SKILL.md
├── debug/
│   └── SKILL.md
├── project-setup/
│   └── SKILL.md
└── validate/
    └── SKILL.md
```

### Method 2: Symlink for Development (Advanced)

If you're actively modifying the skills, create a symlink instead:

```bash
# Remove existing installation if present
rm -rf ~/.claude/skills/firebase-development

# Create symlink
ln -s /Users/dylanr/Dropbox\ \(Personal\)/work/2389/skills/firebase-development ~/.claude/skills/firebase-development

# Verify symlink
ls -la ~/.claude/skills/ | grep firebase-development
```

**Benefits**: Changes to source files immediately available in Claude Code
**Drawbacks**: Dependent on source directory location

## Verification

Test that the skills are properly installed:

### 1. Start Claude Code

```bash
claude
```

### 2. Test Routing with Example Phrases

Try these phrases to verify each sub-skill:

**Project Setup:**
```
User: I want to initialize a new Firebase project
Expected: Routes to firebase-development:project-setup
```

**Add Feature:**
```
User: Add a Cloud Function to handle user authentication
Expected: Routes to firebase-development:add-feature
```

**Debug:**
```
User: I'm getting Firestore rules violations, can you help debug?
Expected: Routes to firebase-development:debug
```

**Validate:**
```
User: Review my Firebase security rules for best practices
Expected: Routes to firebase-development:validate
```

### 3. Check Skill Loading

If Claude Code doesn't detect the skills:

1. Restart Claude Code
2. Check file permissions: `ls -l ~/.claude/skills/firebase-development/SKILL.md`
3. Verify YAML frontmatter: `head -5 ~/.claude/skills/firebase-development/SKILL.md`

Expected first lines:
```markdown
---
name: firebase-development
description: Comprehensive Firebase development guidance...
---
```

## Usage Examples

### Initialize a New Firebase Project

```
User: Set up a new Firebase project for an MCP server

Claude will:
1. Route to firebase-development:project-setup
2. Create TodoWrite with 14 steps
3. Ask architectural decisions via AskUserQuestion
4. Guide through firebase init, structure creation, emulator setup
```

### Add a New Feature

```
User: Add a Cloud Function for sending welcome emails

Claude will:
1. Route to firebase-development:add-feature
2. Create TodoWrite with 12 steps
3. Enforce TDD (write test first)
4. Generate function code following project architecture
5. Add Firestore rules if needed
6. Create integration tests
```

### Debug an Issue

```
User: My emulators won't start, error says port 5001 is already in use

Claude will:
1. Route to firebase-development:debug
2. Create TodoWrite with 10 steps
3. Identify issue type (emulator port conflict)
4. Provide diagnostic commands (lsof -i :5001)
5. Suggest fixes (kill process or change port)
```

### Validate Code

```
User: Review my Firebase setup to ensure I'm following best practices

Claude will:
1. Route to firebase-development:validate
2. Create TodoWrite with 9 steps
3. Check firebase.json, rules, functions, auth, tests
4. Validate against patterns from main skill
5. Report findings with recommendations
```

## Troubleshooting

### Skills Not Loading

**Symptom**: Claude Code doesn't recognize "firebase" keywords

**Solution**:
1. Check installation path: `ls ~/.claude/skills/firebase-development`
2. Verify YAML frontmatter is valid
3. Restart Claude Code: `exit` then `claude`

### Wrong Sub-Skill Routing

**Symptom**: Claude routes to wrong sub-skill

**Solution**:
1. Check routing keywords in firebase-development/SKILL.md (lines 52-91)
2. Use more specific keywords:
   - "initialize firebase" → project-setup
   - "add function" → add-feature
   - "debug error" → debug
   - "review code" → validate

### Fallback to AskUserQuestion

**Symptom**: Claude asks which sub-skill to use instead of auto-routing

**Solution**: This is normal for ambiguous input. Claude will ask:
```
Question: "What Firebase task are you working on?"
Options:
  - Project Setup
  - Add Feature
  - Debug Issue
  - Validate Code
```

## Updating Skills

To update to a new version:

```bash
# Method 1: Copy (no symlink)
rm -rf ~/.claude/skills/firebase-development
cp -r /path/to/new/firebase-development ~/.claude/skills/

# Method 2: Symlink (automatically updates)
# No action needed - symlink tracks source changes
```

## Uninstallation

To remove Firebase skills:

```bash
# Remove directory (copy method)
rm -rf ~/.claude/skills/firebase-development

# Remove symlink (symlink method)
unlink ~/.claude/skills/firebase-development
```

## Additional Resources

- **Design Document**: `docs/plans/2025-01-14-firebase-skills-design.md`
- **Implementation Plan**: `docs/plans/2025-01-14-firebase-skills-implementation.md`
- **Example Documentation**: `docs/examples/` (5 comprehensive examples)
- **Integration Tests**: `tests/integration/firebase-skill-routing.test.md`
- **Reference Projects**:
  - `/Users/dylanr/work/2389/oneonone` - Express API, custom API keys
  - `/Users/dylanr/work/2389/bot-socialmedia-server` - Domain-grouped functions
  - `/Users/dylanr/work/2389/meme-rodeo` - Individual function files

## Support

If you encounter issues:

1. Check the integration tests: `tests/integration/firebase-skill-routing.test.md`
2. Review the design document for architecture decisions
3. Examine reference projects for working examples
4. Check Claude Code logs for skill loading errors

## Next Steps

After installation:

1. Test routing with example phrases (see Verification section)
2. Try initializing a test Firebase project
3. Review example documentation in `docs/examples/`
4. Run through integration test scenarios manually

## Version Information

- **Skills Version**: 1.0.0
- **Total Lines**: 5,341 lines (main orchestrator + 4 sub-skills)
- **Reference Projects**: 3 production Firebase projects
- **Patterns Documented**: 20+ Firebase development patterns
- **Test Scenarios**: 10 integration test scenarios

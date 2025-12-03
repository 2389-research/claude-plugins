---
name: using-2389-skills
description: Use at start of every conversation - establishes mandatory workflows for 2389 skills including terminal title updates on topic changes
---

<!-- ABOUTME: Mandatory workflow for 2389 skills - ensures terminal title updates on topic changes -->
<!-- ABOUTME: Loaded automatically to remind Claude about 2389-specific patterns and practices -->

# Using 2389 Skills

## Overview

This skill establishes mandatory workflows when working in projects with 2389 skills installed. It ensures Claude actively monitors for situations that require skill invocation.

## MANDATORY: Terminal Title Updates

**Claude must actively manage terminal title at session start and topic changes.**

### Session Start (MANDATORY - First Response)

**BEFORE your first response to the user in any session:**

1. ✅ Check if terminal title was already set by command hook (it runs automatically)
2. ✅ **IMMEDIATELY invoke `2389:terminal-title` skill** to refine with intelligent context
3. ✅ Use Claude's understanding to detect proper project name (not just file parsing)
4. ✅ Set topic to "Claude Code" for session start
5. ✅ Then respond to user

**Why refine?** The command hook sets a basic title instantly. Your intelligence makes it better:
- "skills" → "Skills Repository"
- "oneonone" → "OneOnOne"
- Contextual understanding of what the project represents

### Topic Change Detection Checklist

During conversation, before responding to ANY user message, Claude must ask:

**"Has the topic materially shifted from the previous exchange?"**

**If YES → Invoke `2389:terminal-title` skill immediately**

**Topic shift indicators:**
- User explicitly says "let's talk about X" or "can you help with Y"
- User switches domains (debugging → docs, frontend → backend, etc.)
- User starts working on different module/component/feature
- User asks about unrelated topic after sustained discussion (3+ exchanges)

**NOT topic shifts:**
- Follow-up questions on same work
- Small refinements ("make it blue", "add comment")
- Clarifications about current task

### Implementation Pattern

```
1. User sends message
2. Claude checks: "Is this a new topic?"
3. If yes: Invoke Skill(2389:terminal-title) with new topic
4. Then respond to user's message
```

**Example:**
```
User: "Can you help me debug the authentication flow?"
Claude: [Detects topic = "auth debugging", invokes terminal-title with "Debug: Auth Flow"]
Claude: "I'll help you debug the authentication flow. Let me start by..."
```

## Why This Matters

**User experience:** Terminal title provides at-a-glance context when multiple Claude sessions are running. Stale titles make it hard to find the right terminal.

**Developer workflow:** Quick visual scanning of terminal tabs to find "the one working on Firebase" or "the one debugging CSS".

**Team collaboration:** When screensharing, clear titles help teammates understand context instantly.

## Available 2389 Skills

Quick reference for other skills in this plugin:

### CSS Development
- `2389:css-development` - Routes to CSS workflows
- `2389:css-development:create-component` - Create new components
- `2389:css-development:validate` - Review CSS
- `2389:css-development:refactor` - Transform patterns

### Firebase Development
- `2389:firebase-development` - Routes to Firebase workflows
- `2389:firebase-development:project-setup` - Initialize projects
- `2389:firebase-development:add-feature` - Add features
- `2389:firebase-development:debug` - Troubleshoot issues
- `2389:firebase-development:validate` - Review security

### Terminal Title
- `2389:terminal-title` - Update terminal window title (MANDATORY on topic changes)

## Summary

**Single most important rule:** When topic changes, invoke `2389:terminal-title` skill. No exceptions.

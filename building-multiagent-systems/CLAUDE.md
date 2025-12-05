# Building Multi-Agent Systems Plugin

## Overview

This plugin provides comprehensive architecture patterns for multi-agent systems where AI agents coordinate to accomplish complex tasks using tools. Language-agnostic and applicable across TypeScript, Python, Go, Rust, and other environments.

## Skill Included

### building-multiagent-systems

**Trigger keywords**: multi-agent, orchestrator, coordination, sub-agents, delegation, parallel work, sequential pipeline, fan-out, map-reduce

**When to use**:
- Designing systems where multiple AI agents coordinate
- Implementing orchestrators that spawn sub-agents
- Building systems with parallel or sequential agent workflows
- Coordinating shared resources across agents
- Managing agent lifecycle and state

**What it does**:
1. Asks six discovery questions about requirements and constraints
2. Presents foundational patterns (event-sourcing, hierarchical IDs, state machines)
3. Recommends coordination pattern (fan-out/fan-in, pipeline, delegation, queue, map-reduce, peer collaboration)
4. Guides tool coordination design (permissions, locking, rate limiting, caching)
5. Enforces cascading cleanup to prevent orphaned agents
6. Provides production-ready implementation examples

## Patterns

### Six Coordination Patterns

1. **Fan-Out/Fan-In** - Parallel independent work with batching
2. **Sequential Pipeline** - Multi-stage transformations with checkpointing
3. **Recursive Delegation** - Hierarchical task breakdown with depth limits
4. **Work-Stealing Queue** - Large batches with load balancing
5. **Map-Reduce** - Cost optimization with cheap map, smart reduce
6. **Peer Collaboration** - LLM council for bias reduction

### Foundational Patterns

- **Event-Sourcing** - All state changes as events for audit trails and replay
- **Hierarchical IDs** - Encode delegation hierarchy (e.g., `session.1.2`)
- **Agent State Machines** - Explicit states with invalid transition errors
- **Communication Mechanisms** - EventEmitter, Channels, Async/Await

### Critical Lifecycle Pattern

**Cascading Stop** prevents orphaned agents:
1. Get all child agents
2. Stop all children in parallel
3. Stop self
4. Cancel ongoing work
5. Flush events

## Development Workflow

This skill is **question-driven**:

1. User mentions multi-agent architecture
2. Skill asks discovery questions
3. Based on answers, recommends specific pattern
4. Provides implementation with proper cleanup
5. Includes monitoring and cost tracking

## Auto-Detection

Skill triggers on:
- "multi-agent system"
- "orchestrator"
- "spawn agents"
- "parallel agents"
- "agent coordination"
- "map-reduce with AI"

## Real-World Example

Pull request orchestrator spawns four specialist reviewers (security, performance, style, tests) in parallel. Security and test reviewers use smart models; style and performance use fast models. Reviews execute with 2-minute timeouts. Results aggregate regardless of partial failures. Costs track per reviewer. All agents stop cleanly after completion.

## Common Usage

```
User: "How should I architect a system where multiple agents analyze pull requests?"
Assistant: [Triggers building-multiagent-systems skill]

Starting Point: Greenfield or adding to existing system?
Primary Use Case: Parallel work, sequential pipeline, or other?
Scale Expectations: Small (2-5 agents), medium (10-50), or large (100+)?
State Requirements: Stateless runs, session-based, or persistent?
Tool Coordination: Independent agents, shared resources, or rate-limited APIs?
Existing Constraints: Language, framework, performance needs?

[Based on answers, recommends fan-out/fan-in with map-reduce]
[Provides implementation with cascading cleanup and cost tracking]
```

## Integration with Other Plugins

Complements all development workflows:
- **scenario-testing**: Test multi-agent systems with real dependencies
- **fresh-eyes-review**: Review orchestrator code before shipping

## Philosophy

Production-ready patterns over improvisation. Every pattern addresses real failure modes from production systems.

## Notes

- Originated from Harper Reed's personal dotfiles
- Battle-tested in production multi-agent systems
- Language-agnostic patterns
- Emphasizes cost optimization and proper cleanup

---
name: building-multiagent-systems
description: Use when designing or implementing systems with orchestrators, sub-agents, and tool coordination - guides through architecture patterns, coordination mechanisms, and production-ready implementations for multi-agent workflows
---

# Building Multi-Agent, Tool-Using Agentic Systems

## Skill Overview

This comprehensive guide teaches architecture patterns for multi-agent systems where AI agents coordinate to accomplish complex tasks using tools. It's language-agnostic and applicable across TypeScript, Python, Go, Rust, and other environments.

## Critical Initial Step: Discovery Questions

Before architecting any system, you must ask these six mandatory questions:

1. **Starting Point** - Greenfield, adding to existing system, or fixing current implementation?
2. **Primary Use Case** - Parallel work, sequential pipeline, recursive delegation, peer collaboration, work queues, or other?
3. **Scale Expectations** - Small (2-5 agents), medium (10-50), or large (100+)?
4. **State Requirements** - Stateless runs, session-based, or persistent across crashes?
5. **Tool Coordination** - Independent agents, shared read-only resources, write coordination, or rate-limited APIs?
6. **Existing Constraints** - Language, framework, performance needs, compliance requirements?

## Foundational Patterns

### Event-Sourcing for Audit Trails

"All state changes should be events that can reconstruct system state." This creates complete audit trails, enables replay for debugging, and allows resumption from any execution point. State derives from events rather than being stored directly.

### Hierarchical IDs for Delegation Tracking

Thread IDs encode delegation hierarchy (e.g., `session.1.2`), enabling instant visibility of delegation trees, cost aggregation across descendants, and debug visualization.

### Agent State Machines

Every agent transitions through explicit states: idle → thinking → streaming → tool_execution → idle → stopped. Invalid transitions throw errors, preventing undefined behavior.

### Communication Mechanisms

- **EventEmitter** (JavaScript/Node.js): Parent listens to child state changes and tool execution events
- **Channels** (Go, Rust): Typed message passing with timeout handling
- **Async/Await** (Python, modern JS): Sequential promise-based coordination

## Six Core Coordination Patterns

### 1. Fan-Out/Fan-In (Parallel Independent Work)

Spawn agents for each item, execute in parallel with `Promise.all()`, then gather results. Use batching to prevent resource exhaustion. Critical gotchas include orphaned children if orchestrator aborts, resource exhaustion from spawning too many agents simultaneously, and cost explosion (N agents × cost per agent).

### 2. Sequential Pipeline

Multi-stage transformations where each stage receives accumulated context from previous stages. Add checkpointing between stages to survive failures. Bottleneck: pipeline speed equals slowest stage. Context growth can become problematic—prune between stages.

### 3. Recursive Delegation

Complex tasks break down hierarchically into subtasks. Delegate recursively or to specialists. Track via hierarchical thread IDs. Must add max-depth limits to prevent infinite recursion.

### 4. Work-Stealing Queue

Large batches (1000+ tasks) use shared queue. Multiple workers pull tasks, execute independently. Implements load balancing naturally. Gotcha: no built-in priority or retry mechanism.

### 5. Map-Reduce

Map phase uses cheap models (Haiku, GPT-4o-mini) for simple per-item analysis. Reduce phase uses smart models (Sonnet, GPT-4) for synthesis. Cost example: 100 files at $0.01 per map + $0.15 per reduce = $1.15 versus $15 using all smart models.

### 6. Peer Collaboration (LLM Council)

Multiple models provide independent responses, review others anonymously, then synthesize results. Expensive (3N+1 API calls) and slow (15-30 seconds) but reduces bias. Not hierarchical agent relationships.

## Tool Coordination

**Permission Inheritance**: Children inherit parent tools and permission scopes but cannot escalate privileges.

**Shared Resource Locking**: Implement acquire/release patterns to prevent race conditions when multiple agents access the same resource.

**Rate Limiting**: Implement token bucket algorithm shared across all agents to coordinate API call throttling.

**Result Caching**: Cache read-only, idempotent, expensive operations. Invalidate carefully for data freshness.

## Critical Lifecycle Pattern: Cascading Stop

"Always stop children before stopping self." This prevents orphaned agents consuming resources:

```
1. Get all child agents
2. Stop all children in parallel
3. Stop self
4. Cancel ongoing work
5. Flush events
```

If pause/resume unavailable, implement manual checkpointing: save agent state (messages, context, tool results), then restore later.

## State Management

**Event-Sourcing Benefits**:
- Complete audit trails
- Replay capability
- Multiple data views
- Time-travel debugging

**Checkpointing Strategy**: Save after significant events (10+ tools executed, cost >$1.00, or >5 minutes elapsed).

## Production Hardening

**Orphan Detection**: Periodically scan for agents whose parents stopped. Clean them up automatically.

**Session vs Project Scope Workaround**: Create project-level task store so agents can discover and claim work across sessions (work-stealing pattern).

**Coordination Primitives Workaround**: Implement locks, semaphores, and barriers in-memory if unavailable.

## Real-World Example: Code Review System

A pull request orchestrator spawns four specialist reviewers (security, performance, style, tests) in parallel. Security and test reviewers use smart models; style and performance use fast models. Reviews execute with 2-minute timeouts. Results aggregate regardless of partial failures. Costs track per reviewer. All agents stop cleanly after completion.

## Execution Checklist

1. Ask all discovery questions
2. Present foundational patterns relevant to constraints
3. Choose primary coordination pattern
4. Add tool coordination design
5. Implement cascading cleanup
6. Add monitoring and cost tracking
7. Provide complete working example

## Common Pitfalls

- Missing cascading stop → orphaned agents
- No timeouts → indefinite hangs
- Unbounded concurrency → resource exhaustion
- Ignoring cost tracking → budget surprises
- No partial-failure handling → cascading failures
- Unpersisted state → unrecoverable workflows
- Uncoordinated tool access → race conditions
- Wrong model selection → cost inefficiency

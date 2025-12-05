# Building Multi-Agent Systems

Architecture patterns for multi-agent systems where AI agents coordinate to accomplish complex tasks using tools.

## Installation

```bash
/plugin install building-multiagent-systems@2389-research
```

## What This Plugin Provides

Comprehensive guidance for designing and implementing multi-agent systems with proper coordination, lifecycle management, and production hardening.

### Key Concepts

- **Six coordination patterns**: fan-out/fan-in, sequential pipeline, recursive delegation, work-stealing queue, map-reduce, peer collaboration
- **Foundational patterns**: event-sourcing, hierarchical IDs, agent state machines
- **Tool coordination**: permissions, locking, rate limiting, caching
- **Lifecycle management**: cascading stop, orphan detection
- **Production hardening**: checkpointing, monitoring, cost tracking

## When to Use

- Designing systems where multiple AI agents coordinate
- Implementing orchestrators that spawn sub-agents
- Building parallel or sequential agent workflows
- Coordinating shared resources across agents
- Managing agent lifecycle and state

## Quick Example

```typescript
// Fan-out/fan-in pattern for parallel code review
const reviewers = [
  { type: 'security', model: 'smart' },
  { type: 'performance', model: 'fast' },
  { type: 'style', model: 'fast' },
  { type: 'tests', model: 'smart' }
];

// Spawn reviewers in parallel
const results = await Promise.all(
  reviewers.map(r => spawnReviewer(r.type, r.model))
);

// Cascading cleanup
async function cleanup() {
  const children = await getChildAgents();
  await Promise.all(children.map(c => c.stop()));
  await this.stop();
}
```

## Discovery Questions

Before architecting, the skill asks:

1. **Starting Point** - Greenfield, adding to existing, or fixing current?
2. **Primary Use Case** - Parallel work, pipeline, delegation, collaboration, queue?
3. **Scale Expectations** - Small (2-5), medium (10-50), large (100+)?
4. **State Requirements** - Stateless, session-based, or persistent?
5. **Tool Coordination** - Independent, shared read-only, write coordination, rate-limited?
6. **Existing Constraints** - Language, framework, performance, compliance?

## Common Pitfalls Avoided

- Missing cascading stop → orphaned agents
- No timeouts → indefinite hangs
- Unbounded concurrency → resource exhaustion
- Ignoring cost tracking → budget surprises
- No partial-failure handling → cascading failures
- Unpersisted state → unrecoverable workflows
- Uncoordinated tool access → race conditions
- Wrong model selection → cost inefficiency

## Documentation

See [skills/SKILL.md](skills/SKILL.md) for complete architecture patterns and implementation guidance.

## Philosophy

Production-ready patterns over improvisation. Every pattern addresses real failure modes from production systems.

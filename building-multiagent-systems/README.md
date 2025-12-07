# Building Multi-Agent Systems

Architecture patterns for multi-agent systems where AI agents coordinate to accomplish complex tasks using tools.

## Installation

```bash
/plugin install building-multiagent-systems@2389-research
```

## What This Plugin Provides

Comprehensive guidance for designing and implementing multi-agent systems with proper coordination, lifecycle management, and production hardening. Based on patterns from real production systems.

### Key Concepts

- **Four-layer architecture**: Reasoning, orchestration, tool bus, deterministic adapters - foundation for every agent
- **Schema-first tools**: Typed contracts for tools enable sub-agent discovery and validation
- **Deterministic boundary**: Clear separation between LLM reasoning and testable execution
- **Six coordination patterns**: fan-out/fan-in, sequential pipeline, recursive delegation, work-stealing queue, map-reduce, peer collaboration
- **Foundational patterns**: event-sourcing, hierarchical IDs, agent state machines
- **Tool coordination**: permission inheritance, locking, rate limiting, caching
- **Agent collaboration**: subagent spawning, tool inheritance, sub-agent as tool pattern
- **Lifecycle management**: cascading stop, orphan detection, heartbeat monitoring
- **Self-modification safety**: When and how sub-agents can modify themselves or each other
- **Production hardening**: checkpointing, monitoring, cost tracking across agent hierarchies

## When to Use

- Designing systems where multiple AI agents coordinate
- Implementing orchestrators that spawn sub-agents
- Building parallel or sequential agent workflows
- Coordinating shared resources across agents
- Managing agent lifecycle and state

## Quick Example

```typescript
// Four-layer architecture for each agent
const parentAgent = new Agent({
  model: 'sonnet',  // Layer 1: Reasoning
  tools: [editTool, readTool, bashTool],  // Layer 3: Tool bus with schemas
  permissions: ['file:read', 'file:write']  // Layer 2: Orchestration policy
});

// Fan-out/fan-in pattern: spawn specialist sub-agents
const reviewers = [
  { type: 'security', model: 'smart', tools: [readTool] },
  { type: 'performance', model: 'fast', tools: [readTool] },
  { type: 'style', model: 'fast', tools: [readTool] },
  { type: 'tests', model: 'smart', tools: [readTool, bashTool] }
];

// Spawn with permission inheritance (read-only for reviewers)
const results = await Promise.all(
  reviewers.map(r => parentAgent.spawnSubAgent({
    name: r.type,
    model: r.model,
    tools: r.tools,
    permissions: ['file:read'],  // Cannot write - safer
    timeout: 120000
  }))
);

// Cascading cleanup with heartbeat monitoring
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

- **Missing four-layer architecture** → untestable, unsafe agents
- **LLM calls in tools** → non-deterministic, untestable execution
- **No schema-first design** → sub-agents can't discover tools
- **Missing cascading stop** → orphaned agents consuming resources
- **No permission inheritance** → sub-agents escalate privileges
- **No timeouts** → indefinite hangs
- **Unbounded concurrency** → resource exhaustion
- **Ignoring cost tracking** → budget surprises across agent hierarchy
- **No partial-failure handling** → cascading failures
- **Unpersisted state** → unrecoverable workflows
- **Uncoordinated tool access** → race conditions
- **Wrong model selection** → cost inefficiency
- **Self-modification without safety protocol** → agents break themselves

## Documentation

See [skills/SKILL.md](skills/SKILL.md) for complete architecture patterns and implementation guidance.

## Philosophy

Production-ready patterns over improvisation. Every pattern addresses real failure modes from production systems.

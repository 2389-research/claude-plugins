# Building multi-agent systems

Architecture patterns for multi-agent systems where AI agents coordinate using tools.

## Installation

```bash
/plugin install building-multiagent-systems@2389-research
```

## What this plugin does

Guides you through designing and implementing multi-agent systems -- coordination, lifecycle management, production hardening. Based on patterns from real production systems.

### Concepts covered

- Four-layer architecture -- reasoning, orchestration, tool bus, deterministic adapters
- Schema-first tools -- typed contracts that let sub-agents discover and validate tools
- Deterministic boundary -- separating LLM reasoning from testable execution
- Seven coordination patterns -- fan-out/fan-in, sequential pipeline, recursive delegation, work-stealing queue, map-reduce, peer collaboration, MAKER (million-step zero-error)
- Foundational patterns -- event-sourcing, hierarchical IDs, agent state machines
- Tool coordination -- permission inheritance, locking, rate limiting, caching
- Agent collaboration -- subagent spawning, tool inheritance, sub-agent as tool
- Lifecycle management -- cascading stop, orphan detection, heartbeat monitoring
- Self-modification safety -- when and how sub-agents can modify themselves or each other
- Production hardening -- checkpointing, monitoring, cost tracking across agent hierarchies

## When to use

- Designing systems where multiple AI agents coordinate
- Implementing orchestrators that spawn sub-agents
- Building parallel or sequential agent workflows
- Coordinating shared resources across agents
- Managing agent lifecycle and state

## Quick example

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

## Discovery questions

Before architecting, the skill asks:

1. Starting point -- greenfield, adding to existing, or fixing current?
2. Primary use case -- parallel work, pipeline, delegation, collaboration, queue?
3. Scale expectations -- small (2-5), medium (10-50), large (100+)?
4. State requirements -- stateless, session-based, or persistent?
5. Tool coordination -- independent, shared read-only, write coordination, rate-limited?
6. Existing constraints -- language, framework, performance, compliance?

## Common pitfalls

- Missing four-layer architecture -> untestable, unsafe agents
- LLM calls in tools -> non-deterministic, untestable execution
- No schema-first design -> sub-agents can't discover tools
- Missing cascading stop -> orphaned agents consuming resources
- No permission inheritance -> sub-agents escalate privileges
- No timeouts -> indefinite hangs
- Unbounded concurrency -> resource exhaustion
- Ignoring cost tracking -> budget surprises across agent hierarchy
- No partial-failure handling -> cascading failures
- Unpersisted state -> unrecoverable workflows
- Uncoordinated tool access -> race conditions
- Wrong model selection -> cost inefficiency
- Self-modification without safety protocol -> agents break themselves

## Documentation

See [skills/SKILL.md](skills/SKILL.md) for the complete architecture patterns and implementation guidance.

## Philosophy

Production-ready patterns over improvisation. Every pattern here addresses a real failure mode from a production system.

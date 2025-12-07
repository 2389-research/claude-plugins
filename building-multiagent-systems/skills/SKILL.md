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

## Foundational Architecture: The Four-Layer Stack

Every agent in a multi-agent system should follow the four-layer architecture for testability, safety, and modularity:

```
┌─────────────────────────────────────────┐
│  1. Reasoning Layer (LLM)               │  Plans, critiques, decides which tools to call
├─────────────────────────────────────────┤
│  2. Orchestration Layer                 │  Validates, routes, enforces policy, spawns sub-agents
├─────────────────────────────────────────┤
│  3. Tool Bus                            │  Schema validation, tool execution coordination
├─────────────────────────────────────────┤
│  4. Deterministic Adapters              │  File I/O, APIs, shell commands, database access
└─────────────────────────────────────────┘
```

**Why this matters for multi-agent systems**:
- Each sub-agent has the same four layers - consistency across the system
- Orchestration layer (Layer 2) is where you spawn sub-agents and coordinate their work
- Tools (Layer 4) must be deterministic - no LLM calls inside tool implementations
- Clear separation makes debugging multi-agent interactions tractable

**Orchestration Layer Choices**:
- **YOLO Mode** (like pi-mono): Minimal validation, fast iteration, trust LLM decisions
- **Safety-First** (like Claude Code): User approval, policy enforcement, guardrails
- **Hybrid**: Safety for dangerous operations, YOLO for safe ones

Choose based on trust level and production environment. Multi-agent systems often use hybrid: parent agent has safety layers, sub-agents run in YOLO mode within controlled scopes.

### The Deterministic Boundary

**Critical Rule**: Everything below the Reasoning Layer must be deterministic.

```typescript
// ❌ WRONG: LLM call in a tool (breaks determinism)
async function analyzeTool(code: string) {
  const analysis = await llm.generate(`Analyze this code: ${code}`);
  return analysis;
}

// ✅ RIGHT: LLM in orchestration, tools are deterministic
async function analyzeCode(code: string) {
  // Layer 2: Orchestration decides to spawn analyzer sub-agent
  const analyzer = await spawnAgent('code-analyzer', { model: 'haiku' });

  // Layer 3: Tool bus validates and routes
  const result = await analyzer.executeTool('parse_ast', { code });

  // Layer 4: parse_ast is deterministic (no LLM)
  return result;
}
```

**Why this matters**: Deterministic tools are testable with unit tests. Non-deterministic tools (with LLM calls) can only be integration-tested and add unpredictability to multi-agent coordination.

### Schema-First Tool Design

Every tool must have a typed schema defined before implementation. This is critical in multi-agent systems where sub-agents need to discover and use tools dynamically.

```typescript
// Define schema FIRST
const editSchema = {
  name: "edit",
  description: "Edit a file by replacing exact text",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "Path to file" },
      oldText: { type: "string", description: "Text to replace" },
      newText: { type: "string", description: "Replacement text" }
    },
    required: ["path", "oldText", "newText"]
  }
};

// Then implement
async function editTool(params: SchemaType<typeof editSchema>) {
  // TypeScript/validation ensures params match schema
  const { path, oldText, newText } = params;
  // ... deterministic implementation ...
}
```

**Benefits for multi-agent systems**:
- Sub-agents can discover available tools via schema inspection
- Parent agents can validate sub-agent tool calls before execution
- Schema serves as contract between agents
- LLMs learn tool usage from schema descriptions

### Foundational Patterns

#### Event-Sourcing for Audit Trails

"All state changes should be events that can reconstruct system state." This creates complete audit trails, enables replay for debugging, and allows resumption from any execution point. State derives from events rather than being stored directly.

**Multi-agent application**: Track which sub-agent performed which action, when, and why. Essential for debugging coordination issues.

#### Hierarchical IDs for Delegation Tracking

Thread IDs encode delegation hierarchy (e.g., `session.1.2`), enabling instant visibility of delegation trees, cost aggregation across descendants, and debug visualization.

**Pattern**: `parentID.childIndex` - If parent is `task-123`, first child is `task-123.1`, its first child is `task-123.1.1`.

#### Agent State Machines

Every agent transitions through explicit states: idle → thinking → streaming → tool_execution → idle → stopped. Invalid transitions throw errors, preventing undefined behavior.

**Multi-agent consideration**: Parent must track child agent states to know when work is complete and when to initiate cascading cleanup.

#### Communication Mechanisms

- **EventEmitter** (JavaScript/Node.js): Parent listens to child state changes and tool execution events
- **Channels** (Go, Rust): Typed message passing with timeout handling
- **Async/Await** (Python, modern JS): Sequential promise-based coordination

**Best practice**: Use event-based communication for state changes, promise-based for result collection.

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

## Agent Collaboration Patterns

### Subagent Spawning with Tool Inheritance

When an orchestrator spawns sub-agents, tools and permissions should follow a clear inheritance model:

```typescript
// Parent agent with full toolset
const parent = new Agent({
  tools: [editTool, readTool, writeTool, bashTool, searchTool],
  permissions: ['file:read', 'file:write', 'shell:execute']
});

// Spawn sub-agent with SUBSET of tools
const codeAnalyzer = await parent.spawnSubAgent({
  name: 'code-analyzer',
  model: 'haiku',  // Cheaper model for simple tasks
  tools: [readTool, searchTool],  // Read-only tools
  permissions: ['file:read'],  // Cannot write or execute
  timeout: 120000  // 2 minute timeout
});

// Sub-agent CANNOT escalate privileges
// Attempting to use writeTool → Error: Tool not available
```

**Permission Inheritance Rules**:
1. Children inherit SUBSET of parent permissions (cannot escalate)
2. Children can only use tools parent has access to
3. Children cannot modify their own permission scope
4. Parent can revoke child permissions at any time

### Sub-Agent as Tool Pattern

Advanced pattern: Treat specialized agents as tools that parent can call.

```typescript
// Define sub-agent as a tool
const codeReviewerTool = {
  name: "code_reviewer",
  description: "Reviews code for security, performance, and style issues",
  parameters: {
    type: "object",
    properties: {
      filePath: { type: "string" },
      focusAreas: { type: "array", items: { type: "string" } }
    }
  },
  execute: async ({ filePath, focusAreas }) => {
    // Spawn specialized agent
    const reviewer = await spawnAgent('code-reviewer', {
      model: 'sonnet',
      tools: [readTool, searchTool]
    });

    // Agent performs review
    const result = await reviewer.run(
      `Review ${filePath} focusing on: ${focusAreas.join(', ')}`
    );

    // Clean up
    await reviewer.stop();

    return { review: result };
  }
};

// Parent can now use code reviewer like any other tool
const review = await parent.executeTool('code_reviewer', {
  filePath: 'src/auth.ts',
  focusAreas: ['security', 'input-validation']
});
```

**Benefits**:
- Composable abstractions (agents using agents)
- Consistent tool interface across system
- Natural lifecycle management (spawn → execute → cleanup)

### Code Analysis for Multi-Agent Systems

When orchestrators need to understand sub-agent behavior or modify spawned agents:

**Pattern: Analyze Before Modify**
```typescript
// Orchestrator needs to add a tool to a sub-agent codebase
async function addToolToAgent(agentPath: string, toolSpec: ToolSpec) {
  // 1. Analyze existing codebase
  const analysis = await analyzeCodebase(agentPath);

  // 2. Find tool registration pattern
  const pattern = analysis.patterns.find(p => p.type === 'tool-registration');

  // 3. Generate new tool following pattern
  const newTool = generateToolFromPattern(pattern, toolSpec);

  // 4. Validate it matches schema
  validateToolSchema(newTool);

  // 5. Add to codebase
  await writeFile(`${agentPath}/tools/${toolSpec.name}.ts`, newTool);

  // 6. Register in index
  await addToolToIndex(`${agentPath}/tools/index.ts`, toolSpec.name);
}
```

**Key insight**: Orchestrators analyzing sub-agent code should use AST parsing, not regex. Regex breaks on complex code; AST is reliable.

### Self-Modification Safety in Multi-Agent Systems

When sub-agents can modify their own code (or each other's code), follow the safety protocol:

**Safety Protocol Checklist**:
1. **Assess blast radius** - What can break if this modification fails?
2. **Git branch isolation** - Each modification on separate branch
3. **Test-first** - Write tests before implementing changes
4. **Validation gates** - All tests must pass before commit
5. **Rollback capability** - Can undo if validation fails

**Example: Sub-Agent Self-Improvement**
```typescript
// Sub-agent fixing its own bug
async function fixOwnBug(bugReport: string) {
  // 1. Assess blast radius
  const affectedFiles = await identifyBugLocation(bugReport);
  const risk = assessRisk(affectedFiles);  // Low/Medium/High/Critical

  if (risk === 'Critical') {
    throw new Error('Cannot self-modify critical systems');
  }

  // 2. Create isolation
  await gitBranch(`fix-bug-${Date.now()}`);

  // 3. Write test for bug FIRST
  await writeTest({
    description: 'Test that reproduces the bug',
    shouldFail: true  // Test should fail initially
  });

  // 4. Implement fix
  await applyFix(affectedFiles);

  // 5. Validate
  const testsPass = await runAllTests();
  const typeCheckPass = await runTypeCheck();
  const lintPass = await runLint();

  if (testsPass && typeCheckPass && lintPass) {
    // 6. Commit
    await gitCommit('fix: resolve bug in tool execution');
  } else {
    // 6. Rollback
    await gitReset('--hard', 'main');
    throw new Error('Fix validation failed - rolled back');
  }
}
```

**When sub-agents should NOT self-modify**:
- During active operation (modifying code while running it)
- Without parent orchestrator approval
- Core reasoning logic (Layer 1) changes
- When blast radius is Critical

**When self-modification is appropriate**:
- Fixing bugs in tool implementations (Layer 4)
- Adding logging/debugging
- Optimizing performance with tests
- Adding new tools that follow existing patterns

## Production Hardening

**Orphan Detection**: Periodically scan for agents whose parents stopped. Clean them up automatically.

```typescript
// Heartbeat pattern
setInterval(async () => {
  const allAgents = await getRunningAgents();
  for (const agent of allAgents) {
    const parentAlive = await checkParentHeartbeat(agent.parentId);
    if (!parentAlive) {
      await agent.stop();
      await cleanupResources(agent.id);
    }
  }
}, 30000);  // Check every 30 seconds
```

**Session vs Project Scope Workaround**: Create project-level task store so agents can discover and claim work across sessions (work-stealing pattern).

**Coordination Primitives Workaround**: Implement locks, semaphores, and barriers in-memory if unavailable.

**Cost Tracking Across Agent Hierarchy**: Aggregate costs from all descendant agents.

```typescript
// Hierarchical cost tracking
async function getTotalCost(agentId: string): Promise<number> {
  const directCost = await getAgentCost(agentId);
  const children = await getChildAgents(agentId);
  const childCosts = await Promise.all(
    children.map(child => getTotalCost(child.id))
  );
  return directCost + childCosts.reduce((sum, cost) => sum + cost, 0);
}
```

## Real-World Example: Code Review System

A pull request orchestrator spawns four specialist reviewers (security, performance, style, tests) in parallel. Security and test reviewers use smart models; style and performance use fast models. Reviews execute with 2-minute timeouts. Results aggregate regardless of partial failures. Costs track per reviewer. All agents stop cleanly after completion.

## Execution Checklist

When guiding implementation of multi-agent systems, follow this checklist:

1. **Ask all discovery questions** - Understand requirements before architecting
2. **Establish four-layer architecture** - Ensure reasoning, orchestration, tool bus, adapters separation
3. **Design schema-first tools** - Every tool needs typed contract before implementation
4. **Define deterministic boundary** - No LLM calls in tools (Layer 3-4), all randomness in Layer 1
5. **Choose orchestration model** - YOLO, Safety-First, or Hybrid based on trust and environment
6. **Select primary coordination pattern** - Fan-out, pipeline, delegation, queue, map-reduce, or peer
7. **Design tool coordination** - Permission inheritance, locking, rate limiting as needed
8. **Plan agent collaboration** - Subagent spawning, tool inheritance, lifecycle management
9. **Implement cascading cleanup** - Always stop children before parent
10. **Add monitoring and cost tracking** - Hierarchical aggregation across agent tree
11. **Consider self-modification safety** - If agents can modify code, add safety protocol
12. **Provide complete working example** - Runnable code demonstrating all patterns

## Common Pitfalls

- **Missing four-layer architecture** → agents are untestable, unsafe, hard to debug
- **LLM calls in tools (Layer 3-4)** → non-deterministic execution, can't unit test
- **No schema-first tool design** → sub-agents can't discover tools, no type safety
- **Missing cascading stop** → orphaned agents consuming resources indefinitely
- **No permission inheritance model** → sub-agents can escalate privileges
- **No timeouts** → indefinite hangs waiting for sub-agents
- **Unbounded concurrency** → resource exhaustion from spawning too many agents
- **Ignoring cost tracking** → budget surprises, can't attribute costs to agent subtrees
- **No partial-failure handling** → one sub-agent failure cascades to all agents
- **Unpersisted state** → unrecoverable workflows when orchestrator crashes
- **Uncoordinated tool access** → race conditions when multiple agents access shared resources
- **Wrong model selection** → cost inefficiency (using Sonnet for simple tasks)
- **Self-modification without safety protocol** → sub-agents break themselves or each other
- **No heartbeat monitoring** → can't detect orphaned agents after parent crashes

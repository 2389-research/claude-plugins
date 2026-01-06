# Binary RE MCP Server Architecture

> **STATUS: ARCHIVED - OPTIONAL FUTURE WORK**
>
> This design has been superseded by the episodic memory integration approach.
> The skill now uses `episodic-memory` plugin for cross-session persistence,
> eliminating the need for a custom MCP server. This document is preserved
> for reference if more sophisticated state management is needed in the future.

## Overview

A Rust MCP server that maintains analysis state (knowledge base) and exposes reverse engineering tools for Claude to drive. The server acts as the persistent brain while Claude reasons about what to do next.

## Current Approach (Recommended)

Instead of this MCP server, the skill uses:
- **Episodic memory** for cross-session persistence
- **Structured tagging** (`[BINARY-RE:phase]`) for searchability
- **Bash tool** for direct tool invocation
- **Claude's reasoning** for orchestration

This is simpler, requires no custom code, and leverages existing infrastructure.

## Design Principles

1. **Claude drives, server executes** - Claude decides which experiments to run; server handles tool invocation
2. **State persists across calls** - Knowledge base survives between MCP tool invocations
3. **Human gates risky operations** - Server enforces approval for execution-related tools
4. **JSON throughout** - All tool outputs are structured for LLM consumption
5. **Graceful degradation** - Missing tools reduce capability, don't break the server

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Claude (LLM)                            │
│   Reasons about facts → forms hypotheses → plans experiments    │
└─────────────────────────────────────┬───────────────────────────┘
                                      │ MCP Protocol
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Binary RE MCP Server (Rust)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Knowledge Base │  │  Tool Registry  │  │  Human Gateway  │  │
│  │                 │  │                 │  │                 │  │
│  │  - Facts        │  │  - rabin2       │  │  - Approval Q   │  │
│  │  - Hypotheses   │  │  - r2           │  │  - Audit Log    │  │
│  │  - Questions    │  │  - ghidra       │  │  - Policy Cfg   │  │
│  │  - Experiments  │  │  - qemu         │  │                 │  │
│  │  - Observations │  │  - gdb          │  │                 │  │
│  │  - Decisions    │  │  - frida        │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                        Exposed MCP Tools                        │
│                                                                 │
│  Knowledge:          Analysis:           Dynamic:               │
│  - add_fact          - run_rabin2        - run_qemu             │
│  - add_hypothesis    - run_r2            - run_gdb              │
│  - add_question      - run_ghidra        - run_frida            │
│  - record_experiment - detect_abi        - emulate_snippet      │
│  - record_observation                                           │
│  - get_state         Human-Gated:        Utility:               │
│  - search_facts      - execute_binary    - fetch_sysroot        │
│                      - ask_human         - list_tools           │
│                                          - get_config           │
└─────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     External Tools (CLI)                        │
│  rabin2 │ r2 │ analyzeHeadless │ qemu-* │ gdb-multiarch │ frida │
└─────────────────────────────────────────────────────────────────┘
```

## Knowledge Base Schema

```rust
// Core types for knowledge tracking

use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Artifact {
    pub id: Uuid,
    pub path: PathBuf,
    pub sha256: String,
    pub arch: Architecture,
    pub bits: u8,
    pub endianness: Endianness,
    pub interp: Option<String>,      // PT_INTERP value
    pub abi: AbiInfo,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AbiInfo {
    pub libc: LibcVariant,           // glibc, musl, uclibc
    pub float_abi: FloatAbi,         // hard, soft, softfp
    pub version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fact {
    pub id: Uuid,
    pub artifact_id: Uuid,
    pub kind: FactKind,              // Import, Export, String, Symbol, etc.
    pub data: serde_json::Value,     // Flexible payload
    pub source_tool: String,         // "rabin2", "r2", "ghidra"
    pub evidence_ref: Option<String>, // Command/query that produced this
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FactKind {
    Import,
    Export,
    String,
    Symbol,
    Function,
    CrossReference,
    LibraryDependency,
    Capability,                      // From capa/YARA
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Hypothesis {
    pub id: Uuid,
    pub artifact_id: Uuid,
    pub text: String,
    pub confidence: f32,             // 0.0 to 1.0
    pub supports: Vec<Uuid>,         // Fact IDs that support this
    pub contradicts: Vec<Uuid>,      // Fact IDs that contradict this
    pub status: HypothesisStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HypothesisStatus {
    Active,
    Confirmed,
    Refuted,
    Superseded(Uuid),                // Replaced by another hypothesis
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Question {
    pub id: Uuid,
    pub artifact_id: Uuid,
    pub text: String,
    pub priority: Priority,
    pub blocking: Vec<Uuid>,         // Hypothesis IDs this blocks
    pub answered_by: Option<Uuid>,   // Experiment ID that answered
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Experiment {
    pub id: Uuid,
    pub artifact_id: Uuid,
    pub action: String,              // Human-readable description
    pub tool: String,                // Tool to use
    pub params: serde_json::Value,   // Tool-specific parameters
    pub expected: Option<String>,    // What we expect to learn
    pub resource_budget: ResourceBudget,
    pub status: ExperimentStatus,
    pub result_ref: Option<Uuid>,    // Observation ID
    pub requires_approval: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceBudget {
    pub timeout_secs: u32,
    pub max_memory_mb: Option<u32>,
    pub allow_network: bool,
    pub allow_write: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExperimentStatus {
    Planned,
    AwaitingApproval,
    Running,
    Completed,
    Failed(String),
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Observation {
    pub id: Uuid,
    pub experiment_id: Uuid,
    pub summary: String,
    pub raw_output: Option<String>,  // Tool output (truncated if large)
    pub extracted_facts: Vec<Uuid>,  // Facts derived from this
    pub artifacts: Vec<PathBuf>,     // Files generated (logs, dumps)
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Decision {
    pub id: Uuid,
    pub artifact_id: Uuid,
    pub rationale: String,
    pub effect: String,              // What this decision changed
    pub created_by: Actor,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Actor {
    Llm { model: String },
    Human { identifier: String },
}
```

## MCP Tool Definitions

### Knowledge Management Tools

```rust
/// Add a verified fact to the knowledge base
#[tool(name = "add_fact")]
async fn add_fact(
    artifact_id: Uuid,
    kind: FactKind,
    data: serde_json::Value,
    source_tool: String,
    evidence_ref: Option<String>,
) -> Result<Fact>;

/// Add or update a hypothesis
#[tool(name = "add_hypothesis")]
async fn add_hypothesis(
    artifact_id: Uuid,
    text: String,
    confidence: f32,
    supports: Vec<Uuid>,
    contradicts: Vec<Uuid>,
) -> Result<Hypothesis>;

/// Record an open question
#[tool(name = "add_question")]
async fn add_question(
    artifact_id: Uuid,
    text: String,
    priority: Priority,
    blocking: Vec<Uuid>,
) -> Result<Question>;

/// Get current knowledge state for an artifact
#[tool(name = "get_state")]
async fn get_state(
    artifact_id: Uuid,
    include_facts: bool,
    include_hypotheses: bool,
    include_questions: bool,
    include_experiments: bool,
) -> Result<KnowledgeState>;

/// Search facts by various criteria
#[tool(name = "search_facts")]
async fn search_facts(
    artifact_id: Option<Uuid>,
    kind: Option<FactKind>,
    source_tool: Option<String>,
    text_search: Option<String>,
    limit: Option<u32>,
) -> Result<Vec<Fact>>;
```

### Static Analysis Tools

```rust
/// Run rabin2 for fast triage
#[tool(name = "run_rabin2")]
async fn run_rabin2(
    file: PathBuf,
    flags: Vec<String>,  // e.g., ["-I", "-l", "-zz", "-e"]
    timeout_secs: Option<u32>,
) -> Result<serde_json::Value>;

/// Run r2 commands in a session
#[tool(name = "run_r2")]
async fn run_r2(
    file: PathBuf,
    commands: Vec<String>,  // e.g., ["aa", "aflj", "izj"]
    timeout_secs: Option<u32>,
    analysis_level: Option<AnalysisLevel>,  // aa, aaa, aaaa
) -> Result<Vec<R2CommandResult>>;

/// Run Ghidra headless analysis with script
#[tool(name = "run_ghidra")]
async fn run_ghidra(
    file: PathBuf,
    script: String,           // Script name to run
    script_args: Vec<String>,
    processor: Option<String>, // e.g., "ARM:LE:32:v7"
    timeout_secs: Option<u32>,
    max_memory_mb: Option<u32>,
) -> Result<serde_json::Value>;

/// Detect ABI from binary headers
#[tool(name = "detect_abi")]
async fn detect_abi(
    file: PathBuf,
) -> Result<AbiInfo>;
```

### Dynamic Analysis Tools (Human-Gated)

```rust
/// Run binary under QEMU with syscall tracing
/// REQUIRES HUMAN APPROVAL
#[tool(name = "run_qemu", requires_approval = true)]
async fn run_qemu(
    file: PathBuf,
    arch: Architecture,
    args: Vec<String>,
    sysroot: Option<PathBuf>,
    enable_strace: bool,
    env_vars: HashMap<String, String>,
    timeout_secs: u32,
    sandbox_policy: SandboxPolicy,
) -> Result<QemuResult>;

/// Attach GDB to running process or QEMU
/// REQUIRES HUMAN APPROVAL for execution
#[tool(name = "run_gdb", requires_approval = true)]
async fn run_gdb(
    file: PathBuf,
    arch: Architecture,
    commands: Vec<String>,
    use_gef: bool,
    remote: Option<String>,  // "host:port" for remote
    timeout_secs: u32,
) -> Result<GdbResult>;

/// Run Frida instrumentation script
/// REQUIRES HUMAN APPROVAL
#[tool(name = "run_frida", requires_approval = true)]
async fn run_frida(
    target: FridaTarget,
    script: String,  // JavaScript
    timeout_secs: u32,
) -> Result<FridaResult>;

/// Emulate code snippet with Unicorn (isolated, no approval needed)
#[tool(name = "emulate_snippet")]
async fn emulate_snippet(
    code: Vec<u8>,
    arch: Architecture,
    start_addr: u64,
    registers: HashMap<String, u64>,
    memory_maps: Vec<MemoryRegion>,
    max_instructions: u32,
) -> Result<EmulationResult>;
```

### Human Gateway Tools

```rust
/// Request human decision for something that needs approval
#[tool(name = "ask_human")]
async fn ask_human(
    prompt: String,
    options: Option<Vec<String>>,
    context: Option<String>,
    urgency: Urgency,
) -> Result<HumanResponse>;

/// Check if an operation would require approval
#[tool(name = "check_approval_needed")]
async fn check_approval_needed(
    operation: String,
    params: serde_json::Value,
) -> Result<ApprovalCheck>;
```

### Utility Tools

```rust
/// List available sysroots
#[tool(name = "list_sysroots")]
async fn list_sysroots() -> Result<Vec<SysrootInfo>>;

/// Fetch/verify sysroot for architecture
#[tool(name = "fetch_sysroot")]
async fn fetch_sysroot(
    arch: Architecture,
    abi: AbiInfo,
) -> Result<PathBuf>;

/// List available tools and their status
#[tool(name = "list_tools")]
async fn list_tools() -> Result<Vec<ToolStatus>>;

/// Get server configuration
#[tool(name = "get_config")]
async fn get_config() -> Result<ServerConfig>;
```

## Sandbox Policy

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SandboxPolicy {
    /// Use nsjail/bwrap for isolation
    pub use_namespace_isolation: bool,
    /// Block all network access
    pub no_network: bool,
    /// Mount filesystem read-only
    pub read_only_root: bool,
    /// Allowed write paths (if not read_only_root)
    pub write_paths: Vec<PathBuf>,
    /// Memory limit in MB
    pub memory_limit_mb: Option<u32>,
    /// CPU time limit in seconds
    pub cpu_limit_secs: Option<u32>,
    /// Process limit
    pub max_processes: Option<u32>,
    /// Seccomp filter profile
    pub seccomp_profile: SeccompProfile,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SeccompProfile {
    /// Block only dangerous syscalls
    Permissive,
    /// Allow only essential syscalls
    Restrictive,
    /// Custom syscall whitelist
    Custom(Vec<String>),
}
```

## Persistence

The knowledge base persists to disk:

```
~/.binary-re/
├── config.toml           # Server configuration
├── artifacts/
│   └── {artifact_id}/
│       ├── meta.json     # Artifact metadata
│       ├── facts.json    # Facts for this artifact
│       ├── hypotheses.json
│       ├── questions.json
│       ├── experiments.json
│       └── observations.json
├── sysroots/             # Cached sysroots
│   ├── arm-gnueabihf/
│   └── aarch64-gnu/
└── audit.log             # Human approval audit trail
```

## Configuration

```toml
# ~/.binary-re/config.toml

[tools]
rabin2_path = "/usr/bin/rabin2"
r2_path = "/usr/bin/r2"
ghidra_path = "/opt/ghidra/support/analyzeHeadless"
qemu_arm_path = "/usr/bin/qemu-arm"
qemu_aarch64_path = "/usr/bin/qemu-aarch64"
gdb_path = "/usr/bin/gdb-multiarch"
frida_path = "/usr/local/bin/frida"

[sysroots]
arm_gnueabihf = "/usr/arm-linux-gnueabihf"
arm_gnueabi = "/usr/arm-linux-gnueabi"
aarch64_gnu = "/usr/aarch64-linux-gnu"

[limits]
default_timeout_secs = 120
max_timeout_secs = 600
max_memory_mb = 4096
max_output_size_bytes = 10485760  # 10MB

[sandbox]
use_nsjail = true
nsjail_path = "/usr/bin/nsjail"
default_policy = "restrictive"

[human_gateway]
# How to prompt for human approval
mode = "terminal"  # or "file" or "webhook"
approval_timeout_secs = 300
```

## Error Handling

```rust
#[derive(Debug, thiserror::Error)]
pub enum BinaryReError {
    #[error("Tool not available: {0}")]
    ToolNotAvailable(String),

    #[error("Tool execution failed: {tool} - {message}")]
    ToolFailed { tool: String, message: String },

    #[error("Timeout after {0} seconds")]
    Timeout(u32),

    #[error("Approval required for: {0}")]
    ApprovalRequired(String),

    #[error("Approval denied: {0}")]
    ApprovalDenied(String),

    #[error("Invalid architecture: {0}")]
    InvalidArchitecture(String),

    #[error("Sysroot not found for: {arch} {abi}")]
    SysrootNotFound { arch: String, abi: String },

    #[error("Knowledge base error: {0}")]
    KnowledgeBaseError(String),

    #[error("Sandbox violation: {0}")]
    SandboxViolation(String),
}
```

## Crate Dependencies

```toml
[dependencies]
# MCP protocol
mcp-server = "0.1"

# Async runtime
tokio = { version = "1", features = ["full"] }

# Serialization
serde = { version = "1", features = ["derive"] }
serde_json = "1"
toml = "0.8"

# IDs and time
uuid = { version = "1", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }

# Process execution
tokio-process = "1"

# File operations
walkdir = "2"
sha2 = "0.10"

# Error handling
thiserror = "1"
anyhow = "1"

# Logging
tracing = "0.1"
tracing-subscriber = "0.3"

# CLI argument parsing (for standalone testing)
clap = { version = "4", features = ["derive"] }
```

## Development Phases

### Phase 1: Core Infrastructure
- [ ] MCP server skeleton with tool registration
- [ ] Knowledge base types and persistence
- [ ] Configuration loading
- [ ] Basic rabin2 integration

### Phase 2: Static Analysis
- [ ] r2 integration with JSON parsing
- [ ] Ghidra headless integration
- [ ] ABI detection logic
- [ ] Fact extraction from tool outputs

### Phase 3: Dynamic Analysis
- [ ] QEMU integration with sandbox
- [ ] GDB integration
- [ ] Human approval gateway
- [ ] Audit logging

### Phase 4: Advanced Tools
- [ ] Frida integration
- [ ] Unicorn snippet emulation
- [ ] YARA pattern matching
- [ ] Angr symbolic execution (optional)

### Phase 5: Polish
- [ ] Error recovery and retries
- [ ] Output truncation for large results
- [ ] Parallel tool execution
- [ ] Performance optimization

# Binary Reverse Engineering Plugin

## Overview

Agentic binary reverse engineering for ELF binaries from embedded devices. The LLM drives analysis while humans provide context about the target platform, hardware, and suspected purpose.

## CRITICAL: Skill Invocation Required

**You MUST invoke the `binary-re` skill BEFORE taking any action** when:

### The Core Pattern
**User has a binary + wants to understand something about it**

This covers ANY question about a binary's behavior, purpose, or internals:
- "I have a binary that does X..."
- "What does this binary do?"
- "How does this work?"
- "Can you analyze/figure out/understand this?"
- "This executable [anything]..."

### Why This Matters
The skill provides:
1. **Structured methodology** - Hypothesis-driven analysis prevents wasted effort
2. **Tool selection** - Correct r2/Ghidra/QEMU invocation for the architecture
3. **Human-in-the-loop gates** - Safety checks before execution
4. **Episodic memory integration** - Findings persist across sessions

### What NOT To Do
❌ Run `file`, `strings`, `rabin2`, or `r2` commands before invoking the skill
❌ Start analyzing without checking episodic memory for prior work
❌ "Just quickly check" anything before invoking the skill
❌ Skip triage phase and jump to static/dynamic analysis

### Correct Behavior
```
User: "I have a binary here that checks this key and validates it.
       Can we determine what it's checking?"

Claude:
1. Invoke binary-re skill (FIRST)
2. Follow skill's triage → static → dynamic → synthesis flow
3. Gate execution decisions through human approval
```

The skill handles ALL binary analysis scenarios - don't try to enumerate them.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SIMPLIFIED ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐ │
│  │ binary-re    │     │  episodic-   │     │    Bash      │ │
│  │   skill      │────▶│   memory     │     │   (tools)    │ │
│  │ (workflow)   │     │ (persistence)│     │              │ │
│  └──────────────┘     └──────────────┘     └──────────────┘ │
│         │                    │                    ▲         │
│         │                    │                    │         │
│         └────────────────────┴────────────────────┘         │
│                         Claude                               │
│                   (reasoning + orchestration)                │
└─────────────────────────────────────────────────────────────┘
```

**Key insight:** No custom MCP server needed. Episodic memory provides cross-session persistence. Claude orchestrates tools directly via Bash.

## Skills Included

### Main Skill: binary-re

Provides overall methodology, philosophy, and reference material for binary reverse engineering.

### Phase-Specific Skills (Auto-Detect)

| Skill | Purpose | Trigger Keywords |
|-------|---------|------------------|
| `binary-re:triage` | Fast fingerprinting via rabin2 | "what is this binary", "identify", "file type" |
| `binary-re:static-analysis` | r2 + Ghidra deep analysis | "disassemble", "decompile", "functions" |
| `binary-re:dynamic-analysis` | QEMU/GDB/Frida runtime observation | "run", "execute", "debug", "trace" |
| `binary-re:synthesis` | Report generation | "summarize", "report", "document" |
| `binary-re:tool-setup` | Tool installation guides | "install", "setup", "tool not found" |

**Note:** Each skill auto-detects based on keywords in your request. The runtime's semantic matching handles routing automatically.

## Episodic Memory Integration

Knowledge persists across sessions via episodic memory with consistent tagging:

```
[BINARY-RE:{phase}] {artifact_name} (sha256: {hash})
FACT: {observation} (source: {tool})
HYPOTHESIS: {theory} (confidence: {0.0-1.0})
QUESTION: {unknown}
DECISION: {choice} (rationale: {why})
```

### Session Management

**Starting new analysis:**
1. Compute `sha256sum binary`
2. Search episodic memory: `[BINARY-RE] sha256:{hash}`
3. If found: "Previous analysis exists. Resume or start fresh?"

**Resuming analysis:**
1. Search: `[BINARY-RE] {artifact_name}`
2. Load facts/hypotheses from previous session
3. Continue from last phase

**Searching past work:**
- `[BINARY-RE] ARM` - Find all ARM binary analyses
- `[BINARY-RE] FACT: hardcoded` - Find binaries with hardcoded values
- `[BINARY-RE:synthesis]` - Find completed analyses

## Tool Requirements

### Required
- `radare2` (r2) - Static analysis and disassembly
- `qemu-user` - Dynamic emulation for ARM/MIPS/etc.
- `gdb-multiarch` - Cross-architecture debugging

### Recommended
- `ghidra` - Headless decompilation
- `gef` - GDB Enhanced Features
- `frida` - Dynamic instrumentation

### Optional
- `angr` - Symbolic execution
- `unicorn` - CPU emulation
- `yara` - Pattern matching

## Human-in-the-Loop Protocol

The skill gates these operations (requires human approval):

1. **Before any binary execution** - Confirm sandbox is appropriate
2. **Network-capable dynamic analysis** - Prevent unintended phone-home
3. **Conflicting analysis results** - Resolve contradictory evidence
4. **On-device operations** - Anything requiring target device access

## Knowledge Model

Each phase records structured knowledge:

- **FACTS**: Tool-verified observations with source attribution
- **HYPOTHESES**: Theories with confidence scores and evidence links
- **QUESTIONS**: Open unknowns blocking analysis progress
- **DECISIONS**: Human-approved choices with audit trail

## r2 JSON Commands (Preferred)

| Command | Purpose |
|---------|---------|
| `aflj` | Function list as JSON |
| `izj` | Strings as JSON |
| `iij` | Imports as JSON |
| `axtj @addr` | Cross-references to address |
| `pdfj @addr` | Disassembly as JSON |

Always append `j` for structured output.

**Why JSON matters for LLMs:**
- **Deterministic parsing** - No regex needed to extract values
- **Preserved structure** - Addresses stay as integers, not reformatted
- **Filterable with jq** - Easy to extract specific fields
- **Reduces hallucination** - Structured data minimizes misinterpretation
- **Consistent across r2 versions** - Text output format can change

## Architecture Support

| Architecture | QEMU Binary | GDB Arch | Ghidra Processor |
|--------------|-------------|----------|------------------|
| x86 32-bit | `qemu-i386` | `i386` | `x86:LE:32:default` |
| x86-64 | `qemu-x86_64` | `i386:x86-64` | `x86:LE:64:default` |
| ARM 32-bit | `qemu-arm` | `arm` | `ARM:LE:32:v7` |
| ARM 64-bit | `qemu-aarch64` | `aarch64` | `AARCH64:LE:64:v8A` |
| MIPS 32 LE | `qemu-mipsel` | `mips` | `MIPS:LE:32:default` |
| MIPS 32 BE | `qemu-mips` | `mips` | `MIPS:BE:32:default` |
| RISC-V 64 | `qemu-riscv64` | `riscv:rv64` | `RISCV:LE:64:RV64I` |
| RISC-V 32 | `qemu-riscv32` | `riscv:rv32` | `RISCV:LE:32:RV32I` |

## Sysroot Paths

```bash
/usr/arm-linux-gnueabihf    # ARMv7 hard-float (glibc)
/usr/arm-linux-gnueabi      # ARMv7 soft-float (glibc)
/usr/aarch64-linux-gnu      # ARM64 (glibc)
```

For musl/uClibc: extract sysroot from target device or buildroot.

## Example Session

```
User: "I have a binary from a security camera. ARM, probably BusyBox-based."

Claude:
1. Search episodic memory for previous analysis (none found)
2. Triage phase (binary-re-triage auto-detects)
   - Identify: ARM 32-bit, musl libc, libcurl+libssl
   - Record: [BINARY-RE:triage] camera_daemon (sha256: abc...)
   - Hypothesis: "Network client" (confidence: 0.6)

3. Static analysis (binary-re-static-analysis auto-detects)
   - Find functions calling curl_easy_perform
   - Locate URL strings
   - Record: [BINARY-RE:static] ... FACT: URL "api.vendor.com"
   - Update hypothesis: confidence 0.8

4. Ask human: "Ready to run under QEMU with network blocked?"
   - Human approves

5. Dynamic analysis (binary-re-dynamic-analysis auto-detects)
   - Observe connect() attempts, file reads
   - Record: [BINARY-RE:dynamic] ... FACT: connects to 1.2.3.4:443

6. Synthesis (binary-re-synthesis auto-detects)
   - Generate structured report
   - Record: [BINARY-RE:synthesis] ... CONFIRMED: telemetry client

Next session:
User: "What did we find about that camera binary?"
Claude: Searches "[BINARY-RE] camera_daemon" → retrieves full analysis
```

## Documentation

- `docs/r2-commands.md` - Complete r2 reference
- `docs/ghidra-headless.md` - Ghidra scripting guide
- `docs/arch-adapters.md` - Per-architecture quirks

## Integration

Works with:
- **episodic-memory** - Cross-session knowledge persistence
- **remote-system-maintenance** - Extract binaries from devices via SSH
- **fresh-eyes-review** - Validate conclusions before documenting

# Binary Reverse Engineering Plugin

## Overview

Agentic binary reverse engineering for ELF binaries from embedded devices. The LLM drives analysis while humans provide context about the target platform, hardware, and suspected purpose.

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

### Main Orchestrator: binary-re

Routes to phase-specific sub-skills based on context.

### Sub-Skills

| Skill | Purpose |
|-------|---------|
| `binary-re:triage` | Fast fingerprinting via rabin2 |
| `binary-re:static-analysis` | r2 + Ghidra deep analysis |
| `binary-re:dynamic-analysis` | QEMU/GDB/Frida runtime observation |
| `binary-re:synthesis` | Report generation |
| `binary-re:tool-setup` | Tool installation guides |

**Trigger keywords**: reverse engineering, binary, ELF, disassembly, ARM, embedded, firmware, radare2, r2, Ghidra, decompile

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
2. Invoke binary-re:triage
   - Identify: ARM 32-bit, musl libc, libcurl+libssl
   - Record: [BINARY-RE:triage] camera_daemon (sha256: abc...)
   - Hypothesis: "Network client" (confidence: 0.6)

3. Invoke binary-re:static-analysis
   - Find functions calling curl_easy_perform
   - Locate URL strings
   - Record: [BINARY-RE:static] ... FACT: URL "api.vendor.com"
   - Update hypothesis: confidence 0.8

4. Ask human: "Ready to run under QEMU with network blocked?"
   - Human approves

5. Invoke binary-re:dynamic-analysis
   - Observe connect() attempts, file reads
   - Record: [BINARY-RE:dynamic] ... FACT: connects to 1.2.3.4:443

6. Invoke binary-re:synthesis
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

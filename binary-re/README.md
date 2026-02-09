# Binary Reverse Engineering Plugin

Reverse engineer ELF binaries from embedded devices using radare2, Ghidra, GDB, and QEMU.

## Installation

```bash
/plugin install binary-re@2389-research
```

## What this plugin provides

### Skills

- `binary-re` -- structured RE workflow with hypothesis-driven analysis

### Capabilities

- Cross-architecture static analysis (ARM64, ARMv7, x86_64, MIPS)
- Dynamic tracing via QEMU user-mode emulation
- GDB integration for debugging
- Ghidra headless decompilation
- Human-in-the-loop gates for risky operations

## Quick example

```
User: "Analyze this binary from an IoT device - ARM, Linux-based"

Claude: [Triggers binary-re skill]

Let me start with triage to understand what we're working with.

Phase 1: Initial Triage
┌─────────────────────────────────────────┐
│ Architecture: ARM 32-bit LE (v7)        │
│ Libc: musl 1.2.3                        │
│ Dependencies: libcurl, libssl, libz     │
│ Stripped: Yes                           │
│ Strings: 847 (including URLs, paths)    │
└─────────────────────────────────────────┘

FACTS recorded:
- Links against libcurl.so.4 (network client)
- Contains string "api.vendor.com/telemetry"
- Imports socket, connect, SSL_read functions

HYPOTHESIS: This is a telemetry client that phones home over HTTPS
Confidence: 0.7
Evidence: curl+ssl imports, telemetry URL string

Do you want me to proceed with static analysis of network-related
functions, or should we try dynamic analysis under QEMU first?
```

## Tool requirements

```bash
# Required
sudo apt install radare2 qemu-user gdb-multiarch

# Recommended
# Ghidra from https://ghidra-sre.org/
pip install frida-tools

# ARM sysroots
sudo apt install libc6-armhf-cross libc6-arm64-cross
```

## Use cases

- Firmware analysis -- understand device behavior without source
- Protocol reverse engineering -- map network communications
- Security research -- find vulnerabilities in embedded systems
- Hardware hacking -- analyze robot/IoT device internals

## Philosophy

The LLM drives analysis; the human provides context.

You tell Claude what platform/device the binary came from, what hardware is involved, what the binary is theorized to do, and any constraints (no network, isolated test env, etc).

Claude runs the tools, forms hypotheses from evidence, designs experiments to test theories, and synthesizes findings into something actionable.

## Human-in-the-loop

The skill asks for confirmation before:
- Executing binaries (even sandboxed)
- Network-capable dynamic analysis
- Operations requiring device access
- Major changes in analysis direction

## Documentation

- [CLAUDE.md](./CLAUDE.md) -- detailed skill reference
- [skills/SKILL.md](./skills/SKILL.md) -- full workflow documentation

## License

MIT

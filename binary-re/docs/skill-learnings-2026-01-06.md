# Binary RE Skill Learnings (2026-01-06)

Test session analyzing `elf-Linux-ARMv7-ls` on macOS Apple Silicon. All four phases completed successfully after overcoming tooling gaps.

---

## Summary of Issues & Fixes

| # | Issue | Root Cause | Fix |
|---|-------|------------|-----|
| 1 | r2ghidra not available | Assumed installed | Pre-check: `r2 -qc 'pdg?' -` |
| 2 | Empty xrefs for imports | `aa` too shallow | Use `aa; aac` for call coverage |
| 3 | Call target not analyzed | `bl addr` doesn't create function | Explicit `af @addr` for targets |
| 4 | No qemu-arm on macOS | Homebrew QEMU = system-only | Use Docker fallback |
| 5 | Docker "exec format error" | binfmt not registered | `tonistiigi/binfmt --install arm` |
| 6 | Linker path mismatch | Binary: `/lib/ld-linux.so.3` vs container: `/lib/ld-linux-armhf.so.3` | Create symlink |
| 7 | strace fails in QEMU | ptrace not implemented | Use `LD_DEBUG` instead |
| 8 | Missing libcap/libacl | Slim container image | `apt install libcap2 libacl1` |

---

## Skill Updates Required

### 1. Orchestrator (`skills/SKILL.md`)

**Add pre-flight checks section:**

```markdown
## Pre-Flight Verification

Before beginning analysis, verify tooling:

### Core Tools (Required)
```bash
rabin2 -v  # Should show version
r2 -v      # Should show version
```

### Decompilation (Optional)
```bash
r2 -qc 'pdg?' - 2>/dev/null | grep -q Usage && echo "r2ghidra OK" || echo "r2ghidra missing - install with: r2pm -ci r2ghidra"
```

### Dynamic Analysis
| Host | Method | Setup |
|------|--------|-------|
| Linux | Native QEMU | `apt install qemu-user` |
| macOS | Docker | See Docker setup below |
| Windows | WSL2 | Use Linux method |

If dynamic tools unavailable: proceed with static-only analysis, note reduced confidence in synthesis.
```

---

### 2. Static Analysis (`skills/static-analysis/SKILL.md`)

**Replace analysis depth guidance:**

```markdown
## Analysis Depth Selection

| Binary Size | Command | Tradeoff |
|-------------|---------|----------|
| < 500KB | `aaa` | Full analysis, may be slow |
| 500KB - 5MB | `aa; aac` | Functions + all call targets |
| > 5MB | `aa` + targeted `af @addr` | Fast, manual depth control |

### Handling Unanalyzed Call Targets

If `axtj` returns empty for known imports:
1. The import may be called indirectly (function pointer)
2. Try deeper analysis: `aac` (analyze all calls)
3. Or manually create function: `af @0xaddr`

### r2ghidra Availability Check

Before attempting decompilation:
```bash
r2 -qc 'pdg?' - 2>/dev/null | grep -q Usage || echo "SKIP: r2ghidra not installed"
```

If unavailable, rely on disassembly (`pdf`) and cross-reference analysis (`axt/axf`).
```

---

### 3. Dynamic Analysis (`skills/dynamic-analysis/SKILL.md`)

**Add platform support matrix and Docker recipe:**

```markdown
## Platform Support

| Host Platform | Target Arch | Method | Complexity |
|---------------|-------------|--------|------------|
| Linux x86_64 | ARM32/64 | `qemu-arm` / `qemu-aarch64` | Low |
| macOS (any) | ARM32/64 | Docker + binfmt | Medium |
| Windows | ARM32/64 | WSL2 → Linux method | Medium |

### macOS Docker Setup (One-Time)

```bash
# Start Docker (Colima, Docker Desktop, etc.)
colima start

# Register ARM emulation handlers
docker run --rm --privileged --platform linux/arm64 tonistiigi/binfmt --install arm
```

### Running ARM32 Binaries on macOS

```bash
docker run --rm --platform linux/arm/v7 \
  -v /path/to/binary:/work:ro \
  arm32v7/debian:bullseye-slim \
  sh -c '
    # Fix linker path (binary expects /lib/ld-linux.so.3)
    ln -sf /lib/ld-linux-armhf.so.3 /lib/ld-linux.so.3

    # Install dependencies (check rabin2 -l output for requirements)
    apt-get update -qq
    apt-get install -qq -y libcap2 libacl1 2>/dev/null

    # Run with library debug output
    LD_DEBUG=libs /work/binary args
  '
```

### Tracing Limitations

| Method | Works in QEMU User-Mode? | Alternative |
|--------|--------------------------|-------------|
| strace | ❌ (ptrace not implemented) | `LD_DEBUG=files,libs` |
| ltrace | ❌ (same reason) | Direct observation |
| gdb | ✓ (with `-g` flag) | N/A |

### LD_DEBUG Options

```bash
LD_DEBUG=libs    # Library search and loading
LD_DEBUG=files   # File operations during loading
LD_DEBUG=symbols # Symbol resolution
LD_DEBUG=all     # Everything (verbose)
```
```

---

### 4. Tool Setup (`skills/tool-setup/SKILL.md`)

**Add comprehensive platform guides:**

```markdown
## macOS Setup

### radare2
```bash
brew install radare2
```

### r2ghidra (decompiler plugin)
```bash
r2pm -ci r2ghidra
```

### Docker for Dynamic Analysis
```bash
# Install Colima (lightweight Docker runtime)
brew install colima docker

# Start Colima
colima start

# Register multi-arch support
docker run --rm --privileged --platform linux/arm64 tonistiigi/binfmt --install arm
```

### Verify Setup
```bash
# Core tools
rabin2 -v && r2 -v

# r2ghidra
r2 -qc 'pdg?' - 2>/dev/null | grep -q Usage && echo "r2ghidra OK"

# Docker ARM emulation
docker run --rm --platform linux/arm/v7 arm32v7/debian:bullseye-slim uname -m
# Should output: armv7l
```

## Linux Setup

```bash
# Debian/Ubuntu
sudo apt install radare2 qemu-user gdb-multiarch

# r2ghidra
r2pm -ci r2ghidra

# ARM sysroot (for qemu-arm -L)
sudo apt install libc6-armhf-cross
# Sysroot at: /usr/arm-linux-gnueabihf
```

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| "exec format error" in Docker | binfmt not registered | Run tonistiigi/binfmt |
| "ld-linux.so.3 not found" | Linker path mismatch | Create symlink (see dynamic-analysis) |
| "libXXX.so not found" | Missing dependency | Install with apt in container |
| r2 `pdg` unknown command | r2ghidra not installed | `r2pm -ci r2ghidra` |
| Empty xrefs from `axtj` | Shallow analysis | Use `aa; aac` or manual `af` |
```

---

## Successful Dynamic Analysis Flow (Reference)

This worked on macOS ARM64 for ARM32 binary:

```bash
# 1. One-time: register ARM emulation
docker run --rm --privileged --platform linux/arm64 tonistiigi/binfmt --install arm

# 2. Run binary with analysis
docker run --rm --platform linux/arm/v7 \
  -v ~/code/binary-samples:/samples:ro \
  arm32v7/debian:bullseye-slim \
  sh -c '
    ln -sf /lib/ld-linux-armhf.so.3 /lib/ld-linux.so.3
    apt-get update -qq && apt-get install -qq -y libcap2 libacl1 >/dev/null 2>&1
    /samples/elf-Linux-ARMv7-ls --version
  '

# Output: ls (GNU coreutils) 8.21
```

---

## Test Results Summary

| Phase | Status | Key Findings |
|-------|--------|--------------|
| Triage | ✓ | ARM32 glibc hard-float, GCC 4.7.2, coreutils ls |
| Static | ✓ | 120 functions, 7 getenv calls, i18n via dcgettext |
| Dynamic | ✓ | Version confirmed, LS_COLORS response verified |
| Synthesis | ✓ | High confidence identification |

**Confidence: 1.0** - Both static and dynamic evidence confirm GNU coreutils ls 8.21.

# Architecture-Specific Adapters

## Overview

Each architecture has quirks affecting analysis. This guide documents per-architecture considerations for tooling.

## ARM 32-bit (ARMv7)

### Identification

```bash
file binary
# ELF 32-bit LSB executable, ARM, EABI5 version 1 (SYSV)

rabin2 -I binary | grep -E "arch|bits|endian"
# arch     arm
# bits     32
# endian   little
```

### Key Characteristics

- **Thumb mode**: ARM can switch between ARM (32-bit instructions) and Thumb (16-bit)
- **Multiple ABIs**: hard-float (armhf) vs soft-float (armel)
- **Calling convention**: r0-r3 for arguments, r0 for return

### Tool Configuration

**radare2:**
```bash
e asm.arch=arm
e asm.bits=32
# Thumb detection is automatic
```

**QEMU:**
```bash
qemu-arm -L /usr/arm-linux-gnueabihf ./binary  # hard-float
qemu-arm -L /usr/arm-linux-gnueabi ./binary    # soft-float
```

**GDB:**
```gdb
set architecture arm
# Or for Thumb-only:
set arm fallback-mode thumb
```

**Ghidra:**
```
-processor ARM:LE:32:v7      # Generic v7
-processor ARM:LE:32:Cortex  # Cortex-specific
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Mixed ARM/Thumb disassembly | Mode switches | r2 handles automatically |
| Wrong float ABI | Mismatched sysroot | Check `readelf -A` for VFP tags |
| Segfault in QEMU | Wrong sysroot | Verify interpreter path |

### Float ABI Detection

```bash
# Check for hard-float
readelf -A binary | grep "Tag_ABI_VFP_args"
# "VFP registers" = hard-float
# Missing or "compatible" = soft-float
```

---

## ARM 64-bit (AArch64)

### Identification

```bash
file binary
# ELF 64-bit LSB pie executable, ARM aarch64

rabin2 -I binary | grep -E "arch|bits"
# arch     arm
# bits     64
```

### Key Characteristics

- **No Thumb mode**: Always 32-bit fixed-width instructions
- **More registers**: x0-x30 general purpose
- **Calling convention**: x0-x7 for arguments, x0 for return
- **Stack alignment**: 16-byte required

### Tool Configuration

**radare2:**
```bash
e asm.arch=arm
e asm.bits=64
```

**QEMU:**
```bash
qemu-aarch64 -L /usr/aarch64-linux-gnu ./binary
```

**GDB:**
```gdb
set architecture aarch64
```

**Ghidra:**
```
-processor AARCH64:LE:64:v8A
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| r2 shows 32-bit | Auto-detect failed | Force with `e asm.bits=64` |
| QEMU "illegal instruction" | Kernel too old | Update QEMU |

---

## x86-64

### Identification

```bash
file binary
# ELF 64-bit LSB pie executable, x86-64

rabin2 -I binary | grep -E "arch|bits"
# arch     x86
# bits     64
```

### Key Characteristics

- **Complex instruction set**: Variable-length instructions
- **Calling conventions**: System V AMD64 ABI (Linux), Microsoft x64 (Windows)
- **RIP-relative addressing**: Common in PIE binaries

### Tool Configuration

**radare2:**
```bash
e asm.arch=x86
e asm.bits=64
```

**QEMU:**
```bash
qemu-x86_64 -L /usr/x86_64-linux-gnu ./binary
# Often not needed if running on x86_64 host
```

**GDB:**
```gdb
set architecture i386:x86-64
```

**Ghidra:**
```
-processor x86:LE:64:default
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| PLT/GOT resolution | PIE + ASLR | Use r2 with `aaa` for full resolution |
| Wrong calling convention | Compiler differences | Check for Windows vs Linux ABI |

---

## MIPS (32-bit Little Endian)

### Identification

```bash
file binary
# ELF 32-bit LSB executable, MIPS, MIPS32 rel2

rabin2 -I binary | grep -E "arch|bits|endian"
# arch     mips
# bits     32
# endian   little
```

### Key Characteristics

- **Delay slots**: Instruction after branch executes before branch
- **Two ABIs**: o32 (common) vs n32
- **Register conventions**: $a0-$a3 args, $v0-$v1 return

### Tool Configuration

**radare2:**
```bash
e asm.arch=mips
e asm.bits=32
```

**QEMU:**
```bash
qemu-mipsel -L /usr/mipsel-linux-gnu ./binary  # Little endian
qemu-mips -L /usr/mips-linux-gnu ./binary      # Big endian
```

**GDB:**
```gdb
set architecture mips
```

**Ghidra:**
```
-processor MIPS:LE:32:default  # Little endian
-processor MIPS:BE:32:default  # Big endian
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Missed branch targets | Delay slots | r2 handles, but verify manually |
| Wrong endianness | LE vs BE confusion | Check `file` output carefully |

---

## Libc Variants

### glibc

Most common on desktop/server Linux.

**Identification:**
```bash
readelf -p .interp binary
# /lib/ld-linux-armhf.so.3 (ARM hard-float)
# /lib/ld-linux.so.3 (ARM soft-float)
# /lib64/ld-linux-x86-64.so.2 (x86_64)
```

**Sysroots:**
```bash
/usr/arm-linux-gnueabihf   # ARM hard-float
/usr/arm-linux-gnueabi     # ARM soft-float
/usr/aarch64-linux-gnu     # ARM64
```

### musl

Lightweight libc, common in Alpine Linux and embedded.

**Identification:**
```bash
readelf -p .interp binary
# /lib/ld-musl-arm.so.1 (ARM)
# /lib/ld-musl-aarch64.so.1 (ARM64)
# /lib/ld-musl-x86_64.so.1 (x86_64)
```

**Sysroots:**
Must extract from Alpine or buildroot. No standard Debian packages.

```bash
# From Alpine Docker
docker run --rm -v /tmp:/out alpine:latest sh -c \
  "cp -a /lib /out/musl-arm"
```

### uClibc-ng

Very small footprint, embedded systems.

**Identification:**
```bash
readelf -p .interp binary
# /lib/ld-uClibc.so.0
```

**Sysroots:**
Extract from device or build with buildroot.

---

## Cross-Compilation Indicators

### GCC Markers

```bash
strings binary | grep -i "GCC:"
# GCC: (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0
# GCC: (Buildroot 2023.02) 12.2.0
```

### Build System Clues

| String Pattern | Likely Source |
|----------------|---------------|
| `Buildroot` | Embedded Linux buildroot |
| `OpenWrt` | Router firmware |
| `Yocto` | Yocto Project build |
| `Android` | Android NDK build |

---

## Emulation Compatibility Matrix

| Architecture | QEMU User | QEMU System | Notes |
|--------------|-----------|-------------|-------|
| ARM 32 | ✅ Good | ✅ Good | Most compatible |
| ARM 64 | ✅ Good | ✅ Good | Requires newer QEMU |
| x86_64 | ✅ Native | N/A | Usually runs natively |
| MIPS 32 | ⚠️ Some issues | ✅ Good | FPU emulation can be slow |
| MIPS 64 | ⚠️ Limited | ⚠️ Limited | Less tested |

### Fallback Options

When QEMU user-mode fails:

1. **Qiling Framework**: Python-based emulation with better syscall support
2. **Unicorn**: CPU-only emulation for code snippets
3. **Full system QEMU**: Boot entire OS image
4. **On-device**: Run on actual hardware

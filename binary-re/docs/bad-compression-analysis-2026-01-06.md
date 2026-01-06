# Bad Compression Challenge Analysis (2026-01-06)

## Challenge Overview

Binary: `compressor` (x86 32-bit Linux ELF)
Algorithm: LZSS compression with 2KB sliding window
Bug Type: Window position wrap error in decompression

## Binary Characteristics

| Property | Value |
|----------|-------|
| Architecture | x86 32-bit (i386) |
| Libc | glibc (dynamically linked) |
| Compiler | GCC 4.8.1 |
| Stripped | No (symbols present) |
| Size | 9704 bytes |

## LZSS Parameters Identified

- **Window size**: 2048 bytes (11-bit offset)
- **Length field**: 5 bits (values 0-31 representing lengths 2-33)
- **Initial fill**: Space character (0x20)
- **Initial position**: 2015 (0x7df)
- **Flag bit**: 1 = literal byte, 0 = back-reference

## Key Functions

| Address | Name | Purpose |
|---------|------|---------|
| 0x8048714 | encode | Compression function |
| 0x80489ac | decode | Decompression function (contains bug) |
| 0x804892b | read_bits | Bit stream reader |
| 0x804858b | write_bit | Single bit writer |
| 0x8048644 | write_literal | Write flag=1 + 8-bit byte |
| 0x8048690 | write_backref | Write flag=0 + 11-bit offset + 5-bit length |

## Bug Analysis

### Symptom
- File sizes match between correct and buggy output
- First corruption at byte 2393
- Pattern: "more " becomes "mo Bi"
- Corruption repeats at multiple positions (2393, 2948, 3714, ...)

### Root Cause
In the back-reference copy loop, the window position (`var_18h`) is incremented without being wrapped (AND 0x7ff). The wrap only happens AFTER the loop completes.

**Buggy Code Structure:**
```asm
loop_body:
  read byte from window[(offset + counter) & 0x7ff]  ; read is wrapped
  output byte
  write byte to window[window_pos]                   ; position NOT wrapped
  window_pos++                                        ; can exceed 2047!
  counter++
loop_compare:
  if should_continue: jge loop_body
after_loop:
  window_pos &= 0x7ff                                ; wrap ONLY here
```

**Problem:** When `window_pos` crosses 2047→2048 during a multi-byte copy, subsequent bytes are written PAST the buffer boundary instead of wrapping to position 0.

### Bug Location

| Address | Instruction | Issue |
|---------|-------------|-------|
| 0x8048a9f | `mov [var_18h], edx` | Stores new position (not wrapped) |
| 0x8048ab8 | `jge 0x8048a6b` | Loop continues without wrap |
| 0x8048aba | `and [ebp-0x18], 0x7ff` | Wrap happens TOO LATE |

Compare with literal byte handling at 0x8048a25 which correctly wraps after EACH byte.

## Fix Strategy

**Goal:** Move the AND 0x7ff operation INSIDE the loop so it runs every iteration.

**Approach:** Swap the order of the jge and AND instructions:

**Original (at 0xab8):**
```
7d b1                    jge 0x8048a6b
81 65 e8 ff 07 00 00     and [ebp-0x18], 0x7ff
```

**Patched:**
```
81 65 e8 ff 07 00 00     and [ebp-0x18], 0x7ff
7d aa                    jge 0x8048a6b (adjusted offset)
```

This ensures:
1. Position is wrapped every iteration
2. The jge check happens after wrapping
3. No additional bytes needed (same 9 bytes rearranged)

### Jump Offset Calculation

- Original jge at 0x8048ab8 with offset 0xb1 (-79) reaches 0x8048a6b
- New jge at 0x8048abf needs offset to reach 0x8048a6b
- Calculation: 0x8048a6b - (0x8048abf + 2) = -86 = 0xaa

## Patch Bytes

File offset 0xab8:
- Before: `7d b1 81 65 e8 ff 07 00 00`
- After:  `81 65 e8 ff 07 00 00 7d aa`

## Testing Methodology

1. Decompress test.compressed with original binary
2. Compare with test.txt to confirm bug exists
3. Apply patch
4. Decompress with patched binary
5. Verify output matches test.txt (MD5 comparison)

## Lessons Learned

### For Binary RE Skill

1. **Compare known inputs/outputs first**: The test.uncompressed_incorrectly file confirmed bug behavior before code analysis.

2. **Trace window/buffer operations carefully**: Circular buffer bugs often involve wrap-around edge cases.

3. **The literal vs back-ref path divergence**: Different code paths may have different (buggy) implementations of the same operation.

4. **Simple swaps can fix bugs**: Not all patches require adding code; sometimes reordering is sufficient.

### Platform Notes

- x86 32-bit binaries run fine in Docker with `--platform linux/i386`
- Home directory mounts work better than /tmp with Colima on macOS

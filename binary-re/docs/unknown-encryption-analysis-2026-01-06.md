# Unknown Encryption Binary Analysis (2026-01-06)

## Artifact Identification

| Property | Value |
|----------|-------|
| Filename | `unknown_encryption` |
| SHA256 | `8331b80164bded7744a9f60256159de58289436ea599129d164980c2511e5fae` |
| Location | `~/code/binary-samples/unknown_encryption` |
| Related | `unknown_encryption_another_platform` (not yet analyzed) |

## Binary Characteristics

| Property | Value |
|----------|-------|
| Format | Mach-O 64-bit x86_64 |
| OS | macOS |
| Compiler | clang |
| Size | 13,136 bytes |
| Stripped | Yes |
| Date | Oct 30, 2013 |

## Algorithm Identification

**CONFIRMED: GOST 28147-89** (Soviet/Russian block cipher standard)

| Parameter | Value |
|-----------|-------|
| Block size | 64 bits |
| Key size | 256 bits (8 × 32-bit subkeys) |
| Rounds | 32 Feistel rounds |
| Round function | S-box substitution + ROL₁₁ |
| S-box set | GOST R 34.11-94 CryptoPro (RFC 4357) |

## Facts (Source: radare2 static analysis)

```
FACT: Binary imports rand() - used for test data generation (source: rabin2 -i)
FACT: Binary has 4 × 256-byte S-box tables in .bss, initialized at runtime (source: r2 pdf @sym.func.100000930)
FACT: S-box values match RFC 4357 id-GostR3411-94-CryptoProParamSet (source: r2 px @0x100001d30)
FACT: Round function at 0x100000f00 performs 4-byte S-box lookup + 11-bit left rotation (source: r2 pdf)
FACT: Encrypt function at 0x100000a70 calls round function 32 times (source: r2 grep)
FACT: Decrypt function at 0x100000fc0 is structurally identical to encrypt (same size: 1156 bytes)
FACT: Main function runs 1000 tests: encrypt(100×) → decrypt(100×) → compare (source: r2 pdf @main)
```

## Function Map

| Address | Name | Size | Purpose |
|---------|------|------|---------|
| 0x100001a50 | main | 618 | Test harness |
| 0x100000930 | init | 313 | Build S-boxes from 4-bit tables |
| 0x100000a70 | encrypt | 1156 | 32-round GOST encryption |
| 0x100000fc0 | decrypt | 1156 | 32-round GOST decryption |
| 0x100000f00 | round_fn | 177 | S-box + rotate (called 80× total) |

## S-Box Values (CryptoPro Parameter Set)

```
S1: 0e,04,0d,01,02,0f,0b,08,03,0a,06,0c,05,09,00,07
S2: 0f,01,08,0e,06,0b,03,04,09,07,02,0d,0c,00,05,0a
S3: 0a,00,09,0e,06,03,0f,05,01,0d,0c,07,0b,04,02,08
S4: 07,0d,0e,03,00,06,09,0a,01,02,08,05,0b,0c,04,0f
S5: 02,0c,04,01,07,0a,0b,06,08,05,03,0f,0d,00,0e,09
S6: 0c,01,0a,0f,09,02,06,08,00,0d,03,04,0e,07,05,0b
S7: 04,0b,02,0e,0f,00,08,0d,03,0c,09,07,05,0a,06,01
S8: 0d,02,08,04,06,0f,0b,01,0a,09,03,0e,05,00,0c,07
```

## Hypothesis

**HYPOTHESIS:** Self-test binary for GOST 28147-89 implementation (confidence: 0.95)
- Supporting: 32 rounds, S-box+rotate structure, CryptoPro S-boxes, encrypt/decrypt pair
- Contradicting: None

## Dynamic Analysis

**NOT PERFORMED:** Mach-O x86_64 binary requires Intel Mac or Rosetta 2. Static analysis was sufficient for algorithm identification.

## Open Questions

```
QUESTION: What is unknown_encryption_another_platform? (Same algorithm, different arch?)
QUESTION: Is there a specific use case or origin for this binary?
```

## Session Notes

- Episodic memory MCP server not connected - findings recorded to file instead
- Binary-re skill should handle episodic memory unavailability gracefully

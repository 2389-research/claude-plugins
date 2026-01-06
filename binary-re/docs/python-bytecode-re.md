# Python Bytecode Reverse Engineering

## Overview

Python "binaries" (`.pyc`, marshalled code, obfuscated scripts) require different techniques than native binaries. This guide covers common patterns from CTF challenges and real-world obfuscation.

## Critical: Python Version Matters

### Syntax Dependencies
- Nested f-strings with matching quotes (`f"...{f"inner"}..."`) require **Python 3.12+**
- Walrus operator (`:=`) requires Python 3.8+
- Match statements require Python 3.10+

### Marshal Format
Marshal bytecode format is **version-dependent**. You must use the same Python version that created the bytecode:

```bash
# Check Python version from .pyc header (bytes 0-4)
python3 -c "import struct; print(struct.unpack('<H', open('file.pyc', 'rb').read()[0:2])[0])"

# Version mapping (partial):
# 3430 = Python 3.8
# 3450 = Python 3.10
# 3531 = Python 3.12
```

**If marshal.loads() fails:** You're likely using the wrong Python version.

## Common Obfuscation Layers

### Layer Pattern: compress → marshal → encode
```
Layer 1: Visible script
  └── zlib.decompress → marshalled code object
      └── base85/base64.decode → zlib.decompress → marshal.loads
          └── Another code object with the real logic
```

### Extraction Template
```python
import marshal
import zlib
import base64

# Layer 1: zlib + marshal
compressed_data = bytes.fromhex('...')  # or from file
decompressed = zlib.decompress(compressed_data)
code1 = marshal.loads(decompressed)

# Inspect code object
print("Constants:", code1.co_consts)
print("Names:", code1.co_names)
print("Bytecode:", code1.co_code.hex())

# Layer 2: Often hidden in constants
for const in code1.co_consts:
    if isinstance(const, bytes):
        try:
            decoded = base64.b85decode(const)
            decompressed2 = zlib.decompress(decoded)
            code2 = marshal.loads(decompressed2)
            print("Found nested code object!")
        except:
            pass
```

## Decompilation Strategy

### Tool Hierarchy
1. **uncompyle6** - Best for Python 2.7-3.8
2. **decompyle3** - Python 3.7-3.9
3. **pycdc** - Wider version support, sometimes incomplete
4. **pycdas** - Disassembler (fallback when decompilers fail)

### When Decompilers Fail
High-level decompilers often fail on:
- Python 3.12+ async code
- Generator expressions with complex logic
- Heavily obfuscated code

**Always check the disassembly:**
```bash
# pycdas gives you raw bytecode
pycdas extracted_code.pyc

# Or use Python's dis module
python3 -c "
import marshal, dis
with open('code.marshal', 'rb') as f:
    code = marshal.load(f)
dis.dis(code)
"
```

### Hidden Constants Example
Decompiler output:
```python
result = bytes([c ^ i for i, c in enumerate(data)])
```

Actual bytecode (pycdas):
```
LOAD_FAST     2: c
LOAD_FAST     1: i
LOAD_CONST    0: 42    # <-- HIDDEN OFFSET!
BINARY_OP     0 (+)
BINARY_OP     12 (^)
```

Real logic:
```python
result = bytes([c ^ (i + 42) for i, c in enumerate(data)])
```

**Magic numbers like 42 are often the key to cracking the challenge.**

## Common Encryption Patterns

### XOR with Index
```python
# Simple
decrypted = bytes([c ^ i for i, c in enumerate(encrypted)])

# With offset
decrypted = bytes([c ^ (i + offset) for i, c in enumerate(encrypted)])

# With key rotation
decrypted = bytes([c ^ key[i % len(key)] for i, c in enumerate(encrypted)])
```

### ARC4 (RC4)
```python
from arc4 import ARC4

cipher = ARC4(key_bytes)
plaintext = cipher.decrypt(ciphertext)
```

### Common Package Dependencies
Obfuscated Python often imports unusual packages:
- `emoji` - Character encoding tricks
- `cowsay` - Red herrings / ascii art
- `pyjokes` - Red herrings
- `arc4` - Encryption
- `art` - ASCII art generation

Install all dependencies before analysis:
```bash
pip install emoji cowsay pyjokes arc4 art
```

## Theme Analysis

Challenge/malware names often hint at the solution:

| Theme | Likely Meaning |
|-------|---------------|
| "Chimera" | Multiple parts combined |
| "Alchemy/Khem" | Transformation, gold |
| "Transmutation" | Encoding/decoding |
| "Catalyst" | Key or trigger |
| "Golden" | The answer/flag |

## Workflow Summary

1. **Identify Python version** from syntax or marshal header
2. **Set up matching Python environment**
3. **Install dependencies** that the script imports
4. **Extract layers** - decompress → unmarshal → decode → repeat
5. **Try decompilation** with pycdc/uncompyle6
6. **If decompilation incomplete:** Use pycdas disassembly
7. **Look for magic constants** hidden in bytecode
8. **Check theme clues** for hints about keys/passwords
9. **Test common patterns:** XOR, ARC4, base64 variants

## Tools

- **pycdc/pycdas**: https://github.com/zrax/pycdc
- **uncompyle6**: `pip install uncompyle6`
- **decompyle3**: `pip install decompyle3`
- **Python dis module**: Built-in bytecode disassembler

## Real Example: Flare-On 12 Challenge 2

Multi-layer obfuscation with hidden XOR offset:

```python
# Layer 1: project_chimera.py
sequencer_code = zlib.decompress(encrypted_sequencer_data)
code1 = marshal.loads(sequencer_code)

# Layer 2: catalyst (from code1's constants)
compressed = base64.b85decode(encoded_catalyst_strand)
marshalled = zlib.decompress(compressed)
catalyst_code = marshal.loads(marshalled)

# Key insight: pycdc showed c ^ i, but pycdas revealed c ^ (i + 42)
SIGNATURE = bytes.fromhex('6d1b40491d416f6540075a465b424c0d4e0a0c53')
username = bytes([sig[i] ^ (i + 42) for i in range(len(sig))])
# G0ld3n_Tr4nsmut4t10n

# Final decryption
from arc4 import ARC4
ENCRYPTED = bytes.fromhex('7232622d0d9ef21f70183582cffc9014f14fad235df3e2c04cd0c1650ceaecae1162a78caa21a19dc290')
flag = ARC4(username).decrypt(ENCRYPTED)
# Th3_Alch3m1sts_S3cr3t_F0rmul4@flare-on.com
```

**Lesson:** When decompilation seems complete but decryption fails, always verify against the raw bytecode disassembly.

# Radare2 Commands Reference (LLM-Optimized)

## Command Naming Convention

Most r2 commands follow patterns:
- Base command: `afl` (analyze function list)
- JSON output: `aflj` (append `j`)
- Quiet mode: `aflq` (append `q`)
- At address: `afl @addr` (use `@`)

**Always prefer `j` suffix for structured output.**

## Analysis Commands

### Initialization

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `aa` | Analyze all (basic) | Default for most binaries |
| `aaa` | Analyze all autoname | Small binaries (<500KB) |
| `aaaa` | Full analysis | Very small binaries only |
| `aac` | Analyze function calls | After aa, find more refs |
| `aar` | Analyze references | Find data references |

**Best practice:** Start with `aa`, add more if needed.

### Function Analysis

| Command | Output | Description |
|---------|--------|-------------|
| `afl` | Text | List all functions |
| `aflj` | JSON | Functions as JSON array |
| `afll` | Text | Verbose function list |
| `afi @addr` | Text | Info about function at addr |
| `afij @addr` | JSON | Function info as JSON |
| `afn name @addr` | - | Rename function |
| `afs @addr` | Text | Function signature |

### Cross-References

| Command | Output | Description |
|---------|--------|-------------|
| `axt @addr` | Text | Xrefs TO address (who uses this?) |
| `axtj @addr` | JSON | Xrefs TO as JSON |
| `axf @addr` | Text | Xrefs FROM address (what does it call?) |
| `axfj @addr` | JSON | Xrefs FROM as JSON |
| `axtg @addr` | Graph | Xref graph |

### Variables & Arguments

| Command | Output | Description |
|---------|--------|-------------|
| `afv @addr` | Text | Variables in function |
| `afvj @addr` | JSON | Variables as JSON |
| `afvn old new` | - | Rename variable |
| `afvt var type` | - | Set variable type |

## Information Commands

### Binary Metadata

| Command | Output | Description |
|---------|--------|-------------|
| `i` | Text | File info summary |
| `ij` | JSON | All info as JSON |
| `iI` | Text | Binary info |
| `iIj` | JSON | Binary info JSON |
| `ie` | Text | Entry points |
| `iej` | JSON | Entry points JSON |
| `iM` | Text | Main address |

### Imports & Exports

| Command | Output | Description |
|---------|--------|-------------|
| `ii` | Text | Imports |
| `iij` | JSON | Imports JSON |
| `iE` | Text | Exports |
| `iEj` | JSON | Exports JSON |
| `il` | Text | Libraries |
| `ilj` | JSON | Libraries JSON |

### Symbols & Sections

| Command | Output | Description |
|---------|--------|-------------|
| `is` | Text | Symbols |
| `isj` | JSON | Symbols JSON |
| `iS` | Text | Sections |
| `iSj` | JSON | Sections JSON |

### Strings

| Command | Output | Description |
|---------|--------|-------------|
| `iz` | Text | Strings in data sections |
| `izj` | JSON | Strings JSON |
| `izz` | Text | All strings (including code) |
| `izzj` | JSON | All strings JSON |

## Disassembly Commands

### Print Disassembly

| Command | Output | Description |
|---------|--------|-------------|
| `pd N` | Text | Disassemble N instructions |
| `pdj N` | JSON | Disassembly JSON |
| `pdf @addr` | Text | Disassemble function |
| `pdfj @addr` | JSON | Function disasm JSON |
| `pdr @addr` | Text | Recursive disassembly |

### Decompilation (r2ghidra)

| Command | Output | Description |
|---------|--------|-------------|
| `pdg @addr` | Text | Decompile function |
| `pdgj @addr` | JSON | Decompiled JSON |
| `pdga @addr` | Text | Decompile with assembly |

### Print Data

| Command | Output | Description |
|---------|--------|-------------|
| `px N` | Hex | Print N bytes hex |
| `pxj N` | JSON | Hex as JSON |
| `ps @addr` | Text | Print string |
| `psj @addr` | JSON | String as JSON |

## Search Commands

### Pattern Search

| Command | Description |
|---------|-------------|
| `/ string` | Search for string |
| `/j string` | Search, JSON output |
| `/x AABB` | Search hex bytes |
| `/xj AABB` | Hex search, JSON |
| `/R opcode` | Search ROP gadgets |
| `/Rj opcode` | ROP search, JSON |

### String Search

| Command | Description |
|---------|-------------|
| `iz~pattern` | Filter strings |
| `/j pattern` | Search in binary |

## Seek Commands

| Command | Description |
|---------|-------------|
| `s addr` | Seek to address |
| `s sym.main` | Seek to symbol |
| `s+N` | Seek forward N bytes |
| `s-N` | Seek backward N bytes |
| `sr reg` | Seek to register value |

## Graph Commands

| Command | Output | Description |
|---------|--------|-------------|
| `agf` | ASCII | Function graph |
| `agfd @addr` | DOT | Function graph (dot format) |
| `agC` | ASCII | Call graph |
| `agCd` | DOT | Call graph (dot format) |
| `VV` | Visual | Enter visual graph mode |

## Configuration

### Essential Settings

```bash
# Analysis settings
e anal.timeout=120       # Timeout in seconds
e anal.maxsize=67108864  # Max function size (64MB)

# Output settings
e scr.color=false        # Disable colors for parsing
e cfg.json.num=true      # Numbers in JSON output

# Architecture (if auto-detect fails)
e asm.arch=arm
e asm.bits=32
```

### Check Settings

```bash
e?anal              # List analysis settings
e anal.timeout      # Show current value
```

## Iteration & Scripting

### Apply to Multiple

| Syntax | Description |
|--------|-------------|
| `cmd @addr` | Run cmd at address |
| `cmd @@=addr1 addr2` | Run at multiple addresses |
| `cmd @@f` | Run at all functions |
| `cmd @@s:string` | Run at all string matches |
| `cmd @@hit*` | Run at all search hits |

### Command Chaining

| Syntax | Description |
|--------|-------------|
| `cmd1;cmd2` | Run sequentially |
| `cmd1 && cmd2` | Run if first succeeds |
| `.cmd` | Interpret output as commands |
| `!shell_cmd` | Run shell command |

## JSON Output Examples

### Function List

```json
[
  {
    "offset": 33792,
    "name": "main",
    "size": 256,
    "cc": 5,
    "nbbs": 8,
    "edges": 10,
    "ebbs": 2
  }
]
```

### Cross-References

```json
[
  {
    "from": 33812,
    "type": "CALL",
    "opcode": "bl sym.imp.printf",
    "fcn_name": "main"
  }
]
```

### Strings

```json
{
  "strings": [
    {
      "vaddr": 36864,
      "paddr": 4096,
      "ordinal": 1,
      "size": 12,
      "length": 11,
      "section": ".rodata",
      "type": "ascii",
      "string": "Hello World"
    }
  ]
}
```

## Common Workflows

### Identify Key Functions

```bash
aa                        # Analyze
aflj | jq 'length'        # Count functions
aflj | jq '.[] | select(.name | contains("main"))'
axtj @sym.imp.connect     # Who calls connect()?
```

### Trace String Usage

```bash
izj | jq '.strings[] | select(.string | contains("password"))'
# Note vaddr
axtj @0xVADDR             # Find references
```

### Analyze Specific Function

```bash
s sym.target_function     # Seek to function
pdf                       # Disassemble
pdg                       # Decompile
afv                       # Local variables
axf                       # What it calls
```

## Batch Mode

Run r2 non-interactively:

```bash
# Single command
r2 -q -c 'aflj' binary

# Multiple commands
r2 -q -c 'aa; aflj; izj' binary

# With analysis timeout
r2 -q -e anal.timeout=60 -c 'aa; aflj' binary

# Quiet with no banner
r2 -q0 -c 'aa; aflj' binary
```

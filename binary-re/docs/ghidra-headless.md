# Ghidra Headless Analysis Guide

## Overview

Ghidra's `analyzeHeadless` enables command-line decompilation and analysis without the GUI. Essential for automated pipelines and LLM-driven analysis.

## Basic Usage

```bash
analyzeHeadless <project_location> <project_name> [options]
```

### Minimal Example

```bash
# Analyze and immediately delete project
analyzeHeadless /tmp/ghidra_proj proj \
  -import binary \
  -overwrite \
  -deleteProject
```

### With Processor Specification

```bash
analyzeHeadless /tmp/ghidra_proj proj \
  -import binary \
  -overwrite \
  -processor ARM:LE:32:v7 \
  -deleteProject
```

## Processor Strings

| Architecture | Processor String |
|--------------|------------------|
| ARM 32-bit (v7) | `ARM:LE:32:v7` |
| ARM 32-bit (Cortex) | `ARM:LE:32:Cortex` |
| ARM 64-bit (v8) | `AARCH64:LE:64:v8A` |
| x86 32-bit | `x86:LE:32:default` |
| x86-64 | `x86:LE:64:default` |
| MIPS 32 LE | `MIPS:LE:32:default` |
| MIPS 32 BE | `MIPS:BE:32:default` |
| MIPS 64 LE | `MIPS:LE:64:default` |
| PowerPC 32 BE | `PowerPC:BE:32:default` |

### Auto-Detection

Omit `-processor` to let Ghidra auto-detect:

```bash
analyzeHeadless /tmp/proj proj -import binary -overwrite -deleteProject
```

## Running Scripts

### Post-Analysis Script

```bash
analyzeHeadless /tmp/proj proj \
  -import binary \
  -overwrite \
  -scriptPath /path/to/scripts \
  -postScript MyScript.java arg1 arg2 \
  -deleteProject
```

### Pre-Analysis Script

```bash
analyzeHeadless /tmp/proj proj \
  -import binary \
  -overwrite \
  -preScript SetupScript.java \
  -postScript AnalyzeScript.java \
  -deleteProject
```

## Useful Scripts

### Export Functions to JSON

**ExportFunctions.java:**
```java
// @category Analysis
import ghidra.app.script.GhidraScript;
import ghidra.program.model.listing.*;
import com.google.gson.*;

public class ExportFunctions extends GhidraScript {
    @Override
    public void run() throws Exception {
        JsonArray functions = new JsonArray();
        FunctionIterator iter = currentProgram.getFunctionManager().getFunctions(true);

        while (iter.hasNext()) {
            Function func = iter.next();
            JsonObject obj = new JsonObject();
            obj.addProperty("name", func.getName());
            obj.addProperty("address", func.getEntryPoint().toString());
            obj.addProperty("size", func.getBody().getNumAddresses());
            functions.add(obj);
        }

        println(new Gson().toJson(functions));
    }
}
```

### Export Decompilation

**ExportDecompilation.java:**
```java
// @category Analysis
import ghidra.app.script.GhidraScript;
import ghidra.app.decompiler.*;
import ghidra.program.model.listing.*;

public class ExportDecompilation extends GhidraScript {
    @Override
    public void run() throws Exception {
        String funcName = getScriptArgs()[0];
        Function func = getFunction(funcName);

        if (func == null) {
            printerr("Function not found: " + funcName);
            return;
        }

        DecompInterface decomp = new DecompInterface();
        decomp.openProgram(currentProgram);

        DecompileResults results = decomp.decompileFunction(func, 60, monitor);
        if (results.decompileCompleted()) {
            println(results.getDecompiledFunction().getC());
        } else {
            printerr("Decompilation failed");
        }

        decomp.dispose();
    }

    private Function getFunction(String name) {
        FunctionManager fm = currentProgram.getFunctionManager();
        for (Function f : fm.getFunctions(true)) {
            if (f.getName().equals(name)) return f;
        }
        // Try by address
        try {
            return fm.getFunctionAt(currentProgram.getAddressFactory()
                .getAddress(name));
        } catch (Exception e) {
            return null;
        }
    }
}
```

### Export Strings

**ExportStrings.java:**
```java
// @category Analysis
import ghidra.app.script.GhidraScript;
import ghidra.program.model.data.*;
import ghidra.program.model.listing.*;
import com.google.gson.*;

public class ExportStrings extends GhidraScript {
    @Override
    public void run() throws Exception {
        JsonArray strings = new JsonArray();
        DataIterator iter = currentProgram.getListing().getDefinedData(true);

        while (iter.hasNext()) {
            Data data = iter.next();
            if (data.hasStringValue()) {
                JsonObject obj = new JsonObject();
                obj.addProperty("address", data.getAddress().toString());
                obj.addProperty("value", data.getValue().toString());
                strings.add(obj);
            }
        }

        println(new Gson().toJson(strings));
    }
}
```

### Export Cross-References

**ExportXrefs.java:**
```java
// @category Analysis
import ghidra.app.script.GhidraScript;
import ghidra.program.model.symbol.*;
import ghidra.program.model.address.*;
import com.google.gson.*;

public class ExportXrefs extends GhidraScript {
    @Override
    public void run() throws Exception {
        String targetAddr = getScriptArgs()[0];
        Address addr = currentProgram.getAddressFactory().getAddress(targetAddr);

        JsonArray xrefs = new JsonArray();
        ReferenceManager refMgr = currentProgram.getReferenceManager();

        for (Reference ref : refMgr.getReferencesTo(addr)) {
            JsonObject obj = new JsonObject();
            obj.addProperty("from", ref.getFromAddress().toString());
            obj.addProperty("type", ref.getReferenceType().toString());
            xrefs.add(obj);
        }

        println(new Gson().toJson(xrefs));
    }
}
```

## Command Line Options

### Analysis Control

| Option | Description |
|--------|-------------|
| `-import <file>` | Import file for analysis |
| `-overwrite` | Overwrite existing project |
| `-deleteProject` | Delete project when done |
| `-noanalysis` | Skip auto-analysis |
| `-processor <spec>` | Set processor/architecture |

### Script Options

| Option | Description |
|--------|-------------|
| `-scriptPath <dir>` | Additional script directories |
| `-preScript <script>` | Run before analysis |
| `-postScript <script>` | Run after analysis |

### Resource Limits

| Option | Description |
|--------|-------------|
| `-max-cpu <N>` | Max CPU cores to use |
| `-analysisTimeoutPerFile <secs>` | Analysis timeout |

## Memory Configuration

For large binaries, edit launch script or set environment:

```bash
# In analyzeHeadless script, modify:
MAXMEM=4G

# Or via environment:
export _JAVA_OPTIONS="-Xmx4g"
analyzeHeadless ...
```

## Output Capture

Ghidra prints to stdout. Capture for parsing:

```bash
analyzeHeadless /tmp/proj proj \
  -import binary \
  -postScript ExportFunctions.java \
  -deleteProject 2>/dev/null | tail -1 > functions.json
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Unable to determine language` | Unknown arch | Specify `-processor` |
| `OutOfMemoryError` | Heap exhausted | Increase MAXMEM |
| `Analysis timeout` | Binary too complex | Use `-analysisTimeoutPerFile` |
| `Script not found` | Wrong path | Check `-scriptPath` |

### Debug Mode

```bash
analyzeHeadless /tmp/proj proj \
  -import binary \
  -log /tmp/ghidra.log \
  -deleteProject
```

## Integration with r2

Use Ghidra when r2's decompiler (r2ghidra) struggles:

```bash
# Try r2 first
r2 -q -c 'pdgj @sym.complex_func' binary

# If output is poor, use Ghidra
analyzeHeadless /tmp/proj proj \
  -import binary \
  -processor ARM:LE:32:v7 \
  -postScript ExportDecompilation.java sym.complex_func \
  -deleteProject 2>/dev/null | tail -1
```

## Batch Processing

Process multiple binaries:

```bash
for bin in binaries/*; do
  echo "Processing $bin"
  analyzeHeadless /tmp/proj proj \
    -import "$bin" \
    -overwrite \
    -postScript ExportFunctions.java \
    -deleteProject 2>/dev/null | tail -1 > "${bin}.json"
done
```

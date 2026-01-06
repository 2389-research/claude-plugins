# Integration Test: ARM Telemetry Client Analysis

## Scenario Description

User has a binary extracted from an IoT device (smart thermostat). They want to understand what data it collects and where it sends it.

## Setup

**Binary characteristics:**
- ARM 32-bit, hard-float ABI
- Dynamically linked against musl
- Stripped, ~150KB
- Links to libcurl and libssl

**User context provided:**
- "This is from a smart thermostat"
- "Runs on ARM Linux"
- "We think it phones home but don't know where"

## Expected Skill Flow

### Phase 1: Triage (binary-re-triage)

**Expected commands:**
```bash
file thermostat_daemon
rabin2 -q -j -I thermostat_daemon
rabin2 -q -j -l thermostat_daemon
rabin2 -q -j -zz thermostat_daemon | jq '.strings | length'
```

**Expected facts extracted:**
- Architecture: ARM 32-bit LE
- ABI: musl (from interpreter /lib/ld-musl-arm.so.1)
- Dependencies: libcurl.so.4, libssl.so.1.1, libz.so.1
- Capabilities inferred: HTTP client, TLS

**Expected hypothesis:**
- H1: "Binary is a telemetry/reporting client" (confidence: 0.6)

### Phase 2: Static Analysis (binary-re-static-analysis)

**Expected commands:**
```bash
r2 -q -e anal.timeout=120 -c 'aa; aflj' thermostat_daemon
r2 -q -c 'axtj @sym.imp.curl_easy_perform' thermostat_daemon
r2 -q -c 'izj' thermostat_daemon | jq '.strings[] | select(.string | test("http|api|temp"))'
```

**Expected facts extracted:**
- Function calling curl_easy_perform at 0x8400
- String "https://api.thermco.com/v1/telemetry" at 0x12340
- String "temperature" at 0x12380
- String "humidity" at 0x12390

**Updated hypothesis:**
- H1: "Binary sends temperature/humidity data to api.thermco.com" (confidence: 0.8)

### Phase 3: Dynamic Analysis (binary-re-dynamic-analysis)

**Human approval gate:**
- "I'm ready to run this under QEMU with syscall tracing. The sandbox will block network access. Proceed?"

**Expected commands (after approval):**
```bash
qemu-arm -L ~/sysroots/musl-arm -strace ./thermostat_daemon 2>&1 | head -100
```

**Expected observations:**
- Reads /etc/thermostat.conf
- Attempts connect() to 93.184.216.34:443
- Writes to /var/log/thermostat.log

**Facts confirmed:**
- Configuration read from /etc/thermostat.conf
- Network connection attempted (blocked by sandbox)
- Logging to /var/log/thermostat.log

### Phase 4: Synthesis (binary-re-synthesis)

**Expected report structure:**

```markdown
## Binary Analysis Report: thermostat_daemon

### Executive Summary
ARM 32-bit telemetry client that collects temperature/humidity data
and transmits to api.thermco.com over HTTPS.

### Capabilities
- [x] HTTPS client (libcurl + libssl)
- [x] Configuration file parsing
- [x] Local logging
- [ ] Server functionality

### Network Behavior
- Destination: api.thermco.com:443
- Protocol: HTTPS
- Endpoint: /v1/telemetry
- Data: temperature, humidity readings

### File Access
- /etc/thermostat.conf (read)
- /var/log/thermostat.log (write)

### Confidence: HIGH
Multiple evidence sources confirm telemetry behavior.
```

## Success Criteria

1. ✅ Correct architecture/ABI detection
2. ✅ Network destination identified
3. ✅ Data types inferred (temperature, humidity)
4. ✅ Configuration and log paths discovered
5. ✅ Human approval obtained before execution
6. ✅ Structured report generated with evidence

## Failure Modes to Test

| Scenario | Expected Behavior |
|----------|-------------------|
| Missing musl sysroot | Prompt for sysroot setup via binary-re-tool-setup |
| QEMU unsupported syscall | Fall back to static-only analysis |
| Stripped binary (no symbols) | Use address-based analysis |
| Encrypted strings | Note as "obfuscated" in report |

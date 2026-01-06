# Integration Test: Router Firmware Binary Analysis

## Scenario Description

User extracted a binary from router firmware dump. They want to understand if it has any backdoors or unexpected network behavior.

## Setup

**Binary characteristics:**
- MIPS 32-bit, little endian
- Statically linked against uClibc
- Not stripped (has symbols)
- ~500KB

**User context provided:**
- "Extracted from TP-Link router firmware"
- "This is the main management daemon"
- "Concerned about potential backdoors"

## Expected Skill Flow

### Phase 1: Triage (binary-re-triage)

**Expected commands:**
```bash
file router_mgmt
rabin2 -q -j -I router_mgmt
rabin2 -q -j -e router_mgmt
rabin2 -q -j -zz router_mgmt | jq '.strings[] | select(.string | test("password|admin|backdoor|telnet|shell"; "i"))'
```

**Expected facts extracted:**
- Architecture: MIPS 32-bit LE
- Libc: uClibc (static)
- Has symbols (not stripped)
- Suspicious strings: "admin", "tplink123", potential hardcoded credentials

**Initial hypothesis:**
- H1: "Binary contains hardcoded credentials" (confidence: 0.5)
- H2: "Binary implements network server" (confidence: 0.7)

### Phase 2: Static Analysis (binary-re-static-analysis)

**Expected commands:**
```bash
r2 -q -c 'aa; aflj' router_mgmt | jq '.[] | select(.name | test("auth|login|check"))'
r2 -q -c 'axtj @str.tplink123' router_mgmt
r2 -q -c 'axtj @sym.imp.bind' router_mgmt
r2 -q -c 'pdf @sym.check_password' router_mgmt
```

**Expected findings:**
- Function `check_password` at 0x40800
- String "tplink123" referenced in `check_password`
- bind() called from `start_telnet_server` at 0x42000
- Hardcoded comparison: `strcmp(input, "tplink123")`

**Updated hypotheses:**
- H1: "Binary has hardcoded backdoor password 'tplink123'" (confidence: 0.9)
- H3: "Binary starts telnet server" (confidence: 0.85)

### Phase 3: Dynamic Analysis (binary-re-dynamic-analysis)

**Human approval gate:**
- "This binary appears to start a network server. Running it could expose services. Recommend static-only analysis. Proceed with dynamic anyway?"
- (User declines, stays with static)

### Phase 4: Synthesis (binary-re-synthesis)

**Expected report:**

```markdown
## Binary Analysis Report: router_mgmt

### Executive Summary
Router management daemon with CRITICAL security issues:
hardcoded backdoor credentials and unauthenticated telnet server.

### Security Findings

#### CRITICAL: Hardcoded Backdoor Password
- Function: check_password (0x40800)
- Password: "tplink123"
- Evidence: Direct strcmp() comparison in decompiled code

#### HIGH: Unauthenticated Telnet Server
- Function: start_telnet_server (0x42000)
- Port: 23 (standard telnet)
- No authentication check before shell access

### Recommendations
1. Do not deploy this firmware
2. Report to vendor
3. Block port 23 at network level
4. Consider alternative firmware (OpenWrt)

### Evidence Log
- String "tplink123" at 0x4C000
- Xref to string from check_password
- bind() syscall in start_telnet_server
```

## Success Criteria

1. ✅ Identify hardcoded credentials
2. ✅ Map network server functionality
3. ✅ Appropriately refuse risky dynamic analysis
4. ✅ Generate security-focused report
5. ✅ Provide actionable recommendations

## Failure Modes to Test

| Scenario | Expected Behavior |
|----------|-------------------|
| MIPS emulation unavailable | Note limitation, complete static analysis |
| Obfuscated password check | Note as "requires further analysis" |
| User insists on dynamic | Require explicit acknowledgment of risks |

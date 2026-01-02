# xtool Plugin

## Overview

This plugin provides guidance for Xcode-free iOS development using xtool. It helps build SwiftPM-based iOS apps on Linux, Windows, and macOS without requiring Xcode.

## Skills Included

### using-xtool (Main Skill)

Auto-detects when working with:
- xtool projects or configuration
- SwiftPM iOS apps
- iOS development on non-macOS platforms
- App extensions (widgets, share, keyboard, etc.)

## Key Patterns

### xtool is NOT XcodeGen

This is the most critical distinction. xtool:
- Uses `xtool.yml` (not `project.yml` or `Project.swift`)
- Uses standard SwiftPM `Package.swift`
- Uses `xtool dev` command (not `xtool build` or `xtool run`)
- Places extensions in `Sources/` (standard SwiftPM, not `Extensions/`)

### Project Structure

```
MyApp/
├── Package.swift          # SwiftPM package definition
├── xtool.yml              # xtool configuration
├── Sources/
│   ├── MyApp/             # Main app target
│   └── MyWidget/          # Extension targets
└── *-Info.plist           # Optional custom plists
```

### App Extensions Pattern

Extensions require:
1. `.library` product + target in Package.swift (not `.executable`)
2. Entry in `xtool.yml` under `extensions:`
3. Info.plist with `NSExtensionPointIdentifier`

### Common Commands

```bash
xtool new MyApp          # Create project
xtool dev                # Build + run
xtool dev build --ipa    # Build IPA
xtool dev run -s         # Run on simulator
xtool devices            # List devices
xtool auth login         # Authenticate
```

## Troubleshooting Reference

| Issue | Solution |
|-------|----------|
| "Untrusted Developer" | Settings > VPN & Device Management > Trust |
| Device not found | `xtool devices`, enable Developer Mode |
| Auth failed | `xtool auth login` |
| First build slow | Normal - SDK modules building |

## Development Notes

When assisting with xtool projects:
1. Always verify `xtool.yml` exists (not `project.yml`)
2. Check Package.swift uses `.library` products
3. Extensions go in `Sources/`, not `Extensions/`
4. Use `xtool dev` not `xtool build`

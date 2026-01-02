# xtool Plugin

Xcode-free iOS development with xtool - build SwiftPM apps on Linux, Windows, and macOS without Xcode.

## Installation

```bash
/plugin install xtool@2389-research
```

## What This Plugin Provides

### Skills

- **using-xtool** - Complete guide for xtool iOS development including project creation, app extensions (widgets, share extensions), and configuration

## Quick Example

Create a new iOS app:
```bash
xtool new MyApp
cd MyApp
xtool dev
```

Add a widget extension:
1. Add product + target to `Package.swift`
2. Configure in `xtool.yml` under `extensions:`
3. Create `Sources/MyWidget/Widget.swift`
4. Create `MyWidget-Info.plist` with `NSExtensionPointIdentifier`
5. Run `xtool dev`

## When This Skill Applies

The skill auto-triggers on:
- Mentions of `xtool`
- SwiftPM iOS app development
- Building iOS apps on Linux/Windows
- App extension setup (widgets, share extensions)

## Key Differentiator

xtool is NOT XcodeGen or Tuist:

| xtool Uses | NOT These |
|------------|-----------|
| `xtool.yml` | `project.yml`, `Project.swift` |
| `Package.swift` (SwiftPM) | Xcode project files |
| `xtool dev` | `xtool build`, `xtool run` |

## Links

- [xtool GitHub](https://github.com/nickyramone/xtool)
- [Plugin CLAUDE.md](./CLAUDE.md) - Development instructions

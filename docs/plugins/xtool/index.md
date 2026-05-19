# xtool

> Xcode-free iOS development with xtool - build SwiftPM apps on Linux, Windows, and macOS without Xcode

- **Version:** 1.0.0
- **Source:** https://github.com/2389-research/xtool
- **Install:** `/plugin install 2389-research/xtool`

## Install via marketplace

```
/plugin marketplace add 2389-research/claude-plugins
/plugin install 2389-research/xtool
```

## README

# xtool Plugin

Xcode-free iOS development with xtool - build SwiftPM apps on Linux, Windows, and macOS without Xcode.

## Installation

```bash
/plugin marketplace add 2389-research/claude-plugins
/plugin install xtool@2389-research
```

## What this plugin provides

### Skills

- `using-xtool` -- guide for xtool iOS development including project creation, app extensions (widgets, share extensions), and configuration

## Quick example

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

## When this skill applies

The skill auto-triggers on:
- Mentions of `xtool`
- SwiftPM iOS app development
- Building iOS apps on Linux/Windows
- App extension setup (widgets, share extensions)

## How xtool differs from XcodeGen/Tuist

| xtool Uses | NOT These |
|------------|-----------|
| `xtool.yml` | `project.yml`, `Project.swift` |
| `Package.swift` (SwiftPM) | Xcode project files |
| `xtool dev` | `xtool build`, `xtool run` |

## Links

- [xtool GitHub](https://github.com/nickyramone/xtool)
- [Plugin CLAUDE.md](./CLAUDE.md) -- development instructions

---

If xtool freed you from Xcode, a ⭐ helps us know it's landing.

Built by [2389](https://2389.ai) · Part of the [Claude Code plugin marketplace](https://github.com/2389-research/claude-plugins)


# [meta] Sysadmin

Meta-plugin for system administration workflows on Linux systems.

## Installation

```bash
/plugin install sysadmin@2389-research
```

This will automatically install:
- **remote-system-maintenance** - Structured Linux diagnostics and cleanup

## What This Provides

### Remote System Maintenance

Structured procedures for diagnosing and maintaining remote Linux systems via SSH/tmux:

**Three-phase diagnostics:**
1. Initial diagnostics (hostname, resources, processes, zombies)
2. System log review (errors, journal consumption, service status)
3. Package assessment (upgradable, orphaned, cached)

**Seven-stage cleanup:**
1. apt update - Refresh package lists
2. apt upgrade - Apply security fixes
3. apt autoremove - Remove unused dependencies
4. apt clean - Purge package cache
5. journalctl vacuum - Prune old logs
6. snap cleanup - Remove disabled revisions (500MB-2GB savings!)
7. /tmp assessment - Check temporary directories

**Expected recovery**: 2+ GB in comprehensive sessions

## Why This Meta Plugin?

Currently just wraps `remote-system-maintenance`, but provides:
- Clear categorization (sysadmin vs development tools)
- Future expansion point for additional sysadmin tools
- Semantic installation (`/plugin install sysadmin`)

## Future Additions

Potential future inclusions:
- Docker cleanup workflows
- Log analysis tools
- Performance monitoring
- Backup verification
- Security hardening checklists

## Documentation

See [remote-system-maintenance plugin](../remote-system-maintenance/) for complete maintenance procedures.



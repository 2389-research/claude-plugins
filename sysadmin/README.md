# [meta] Sysadmin

Meta-plugin for system administration workflows on Linux systems.

## Installation

```bash
/plugin install sysadmin@2389-research
```

This will automatically install:
- `remote-system-maintenance` -- structured Linux diagnostics and cleanup

## What this provides

### Remote system maintenance

Structured procedures for diagnosing and maintaining remote Linux systems via SSH/tmux.

Diagnostics run in three phases:
1. Initial diagnostics (hostname, resources, processes, zombies)
2. System log review (errors, journal consumption, service status)
3. Package assessment (upgradable, orphaned, cached)

Cleanup runs in seven stages:
1. apt update -- refresh package lists
2. apt upgrade -- apply security fixes
3. apt autoremove -- remove unused dependencies
4. apt clean -- purge package cache
5. journalctl vacuum -- prune old logs
6. snap cleanup -- remove disabled revisions (500MB-2GB savings!)
7. /tmp assessment -- check temporary directories

Expect to recover 2+ GB in a comprehensive session.

## Why a meta-plugin?

Right now it just wraps `remote-system-maintenance`, but it gives you clear categorization (sysadmin vs development tools), a place to add future sysadmin tools, and a semantic install path (`/plugin install sysadmin`).

## Future additions

- Docker cleanup workflows
- Log analysis tools
- Performance monitoring
- Backup verification
- Security hardening checklists

## Documentation

See [remote-system-maintenance plugin](../remote-system-maintenance/) for complete maintenance procedures.

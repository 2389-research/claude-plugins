# Remote System Maintenance Plugin

## Overview

This plugin provides structured procedures for diagnosing and maintaining remote Linux systems through SSH/tmux sessions, with emphasis on Ubuntu/Debian platforms.

## Skill Included

### remote-system-maintenance

**Trigger keywords**: remote system, Linux, Ubuntu, Debian, maintenance, cleanup, diagnostics, SSH, tmux, disk space, journal, snap

**When to use**:
- Performing system maintenance on remote Linux servers
- Recovering disk space on Ubuntu/Debian systems
- Running diagnostics on remote systems
- Cleaning up package caches, journals, or snap revisions

**What it does**:
1. **Phase 1: Initial diagnostics** - Captures hostname, resources, processes, zombies
2. **Phase 2: Log review** - Examines errors, journal consumption, service status
3. **Phase 3: Package assessment** - Identifies upgradable, orphaned, cached packages
4. **Executes cleanup sequence** - apt, journal vacuum, snap cleanup (7 stages)
5. **Generates documentation** - Structured logs with before/after states and MB freed

**Expected results**: 2+ GB recovered in comprehensive sessions

**Time commitment**: 15-30 minutes

## Three-Phase Approach

### Phase 1: Initial Diagnostics

```bash
hostname && df -h && free -h && uptime
ps aux | head -20
ps aux | awk '$8 ~ /Z/ {print}'  # Zombie detection
```

### Phase 2: System Log Review

```bash
journalctl -p err -n 50
journalctl --disk-usage
systemctl --failed
```

### Phase 3: Package Assessment

```bash
apt list --upgradable
dpkg -l | grep '^rc'  # Orphaned configs
du -sh /var/cache/apt/archives
```

## Seven-Stage Cleanup Sequence

1. `apt update` - Refresh package lists
2. `apt upgrade -y` - Apply security and bug fixes
3. `apt autoremove -y` - Remove unused dependencies
4. `apt clean` - Purge package cache
5. `journalctl --vacuum-time=7d` - Prune old logs
6. Snap revision cleanup - Remove disabled revisions
7. `/tmp` assessment - Check temporary directories

## Snap Cleanup (Biggest Wins!)

```bash
# List disabled revisions
snap list --all | awk '/disabled/{print $1, $3}'

# Remove by revision
snap remove package-name --revision=123
```

**Recovery**: 500 MB to 2 GB typical

## Documentation Template

```
=== Remote System Maintenance Log ===

System Information:
- Hostname: production-web-01
- OS: Ubuntu 22.04.3 LTS
- Kernel: 5.15.0-84-generic
- Operator: harper
- Date: 2025-12-05

Initial State:
- Disk: 45.2 GB / 50 GB (90% used)
- Memory: 3.8 GB / 4 GB (95% used)
- Load: 1.2, 0.8, 0.5

Actions Taken:
- apt upgrade: 12 packages updated
- apt autoremove: 3 packages removed (150 MB)
- apt clean: package cache purged (450 MB)
- journalctl vacuum: 7+ days pruned (580 MB)
- snap cleanup: 4 disabled revisions (1.2 GB)
- Total recovered: 2.38 GB

Final State:
- Disk: 42.8 GB / 50 GB (85% used)
- Memory: 3.8 GB / 4 GB (95% used)
- Load: 0.9, 0.7, 0.5

Follow-up:
- Monitor snap revisions monthly
- Consider expanding disk if usage > 90% persists
```

## Development Workflow

This skill provides **structured checklists** for ad-hoc operations:

1. User mentions remote maintenance or disk cleanup
2. Skill guides through three diagnostic phases
3. Executes seven-stage cleanup sequence
4. Quantifies results in structured log
5. Provides follow-up recommendations

## Auto-Detection

Skill triggers on:
- "clean up remote server"
- "disk space on production"
- "Ubuntu maintenance"
- "snap cleanup"
- "journal vacuum"

## Common Usage

```
User: "Production server is low on disk space, can you help clean it up?"
Assistant: [Triggers remote-system-maintenance skill]

Let me run structured diagnostics first.

Phase 1: Initial diagnostics
[Captures hostname, disk at 90%, memory at 95%]

Phase 2: Log review
[Finds journal consuming 2.1 GB]

Phase 3: Package assessment
[Identifies 4 disabled snap revisions, package cache 450 MB]

Starting cleanup sequence...

1. apt update - ✓ package lists refreshed
2. apt upgrade - ✓ 12 packages updated
3. apt autoremove - ✓ 150 MB freed
4. apt clean - ✓ 450 MB freed
5. journalctl vacuum - ✓ 580 MB freed
6. snap cleanup - ✓ 1.2 GB freed (4 revisions)
7. /tmp assessment - ✓ clean

Total recovered: 2.38 GB
Disk now at 85% (was 90%)

Generating structured log...
[Provides complete documentation with quantified results]
```

## Integration with Other Plugins

Complements operational workflows:
- **scenario-testing**: Test cleanup scripts with real servers
- **fresh-eyes-review**: Review automation before deploying

## Philosophy

Structure ad-hoc operational work with checklists and documentation. Quantify everything.

## Notes

- Originated from Harper Reed's personal dotfiles
- Battle-tested on Ubuntu/Debian production systems
- Snap cleanup often provides biggest space recovery
- Documentation enables trend analysis

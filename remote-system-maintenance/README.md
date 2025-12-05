# Remote System Maintenance

Structured procedures for diagnosing and maintaining remote Linux systems via SSH/tmux.

## Installation

```bash
/plugin install remote-system-maintenance@2389-research
```

## What This Plugin Provides

Structured guidance for system diagnostics and maintenance on remote Linux systems, with emphasis on Ubuntu/Debian platforms.

### Key Features

- **Three-phase diagnostic approach**: baseline diagnostics, log review, package assessment
- **Seven-stage cleanup sequence**: apt, journal, snap revisions, and more
- **Documentation templates**: structured logs with quantified results
- **Real-world metrics**: expect 2+ GB recovery in comprehensive sessions

## When to Use

- Performing system maintenance on remote Linux servers
- Recovering disk space on Ubuntu/Debian systems
- Running diagnostics on remote systems
- Cleaning up package caches, journals, or snap revisions

## Quick Example

```bash
# Phase 1: Initial diagnostics
hostname && df -h && free -h && uptime
ps aux | head -20
ps aux | awk '$8 ~ /Z/ {print}'  # Zombie detection

# Phase 2: Log review
journalctl -p err -n 50
journalctl --disk-usage

# Phase 3: Cleanup sequence
apt update && apt upgrade -y
apt autoremove -y && apt clean
journalctl --vacuum-time=7d

# Snap cleanup (biggest wins!)
snap list --all | awk '/disabled/{print $1, $3}'
snap remove package-name --revision=123

# Document: hostname, before/after disk, MB freed per category
```

## Three-Phase Approach

### Phase 1: Initial Diagnostics

Capture baseline system state:
- Hostname and system identification
- Resource utilization (disk, memory, CPU)
- Process status and load
- Zombie process detection

### Phase 2: System Log Review

Examine system health indicators:
- Recent error messages in system logs
- Journal disk consumption analysis
- Critical service status
- Authentication and security events

### Phase 3: Package Assessment

Identify maintenance opportunities:
- Upgradable packages
- Orphaned configurations
- Unused dependencies
- Package cache size

## Ubuntu/Debian Cleanup Sequence

Execute these seven stages in order:

1. **Package Cache Refresh** - `apt update`
2. **System Upgrades** - `apt upgrade`
3. **Orphan Removal** - `apt autoremove`
4. **Cache Purging** - `apt clean`
5. **Journal Pruning** - `journalctl --vacuum-time=7d`
6. **Snap Revision Cleanup** - Remove disabled snap revisions
7. **Temporary Directory Assessment** - Review `/tmp` and `/var/tmp`

## Snap Revision Cleanup

Snap keeps old revisions by default. Big space savings here:

```bash
# List all disabled snap revisions
snap list --all | awk '/disabled/{print $1, $3}'

# Remove specific revision
snap remove <package-name> --revision=<revision-number>
```

**Important**: Requires explicit removal by revision number.

## Expected Results

Real-world recovery examples:
- **Journal vacuuming**: 300-600 MB
- **Snap revision cleanup**: 500 MB to 2 GB (!)
- **Package cache purging**: 100-500 MB
- **Total potential**: 2+ GB in comprehensive sessions

## Documentation Requirements

All maintenance sessions must generate structured logs:

1. **System Identification**: hostname, OS version, kernel, operator
2. **Resource States**: initial/final disk/memory/CPU usage
3. **Actions Taken**: commands executed, MB/GB freed per category
4. **Follow-up Recommendations**: remaining issues, future needs

## Time Commitment

Typical maintenance session: **15-30 minutes** including diagnostics, cleanup, and documentation.

## Documentation

See [skills/SKILL.md](skills/SKILL.md) for complete maintenance procedures.

## Philosophy

Structure ad-hoc operational work with checklists and documentation. Quantify everything.

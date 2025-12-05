# Sysadmin Meta Plugin

## Overview

This meta-plugin bundles system administration tools for Linux maintenance and diagnostics.

## Plugin Included

### remote-system-maintenance

Structured procedures for remote Linux system maintenance:

**Trigger keywords**: remote system, Linux, Ubuntu, Debian, maintenance, cleanup, diagnostics, SSH, tmux, disk space

**What it does**:
1. Phase 1: Initial diagnostics
2. Phase 2: System log review
3. Phase 3: Package assessment
4. Seven-stage cleanup sequence
5. Structured documentation with quantified results

**Expected results**: 2+ GB recovered in comprehensive sessions

**Time commitment**: 15-30 minutes

## Use Cases

- Production server disk cleanup
- Regular maintenance on Ubuntu/Debian servers
- Post-mortem diagnostics
- Capacity planning data collection

## Philosophy

Structure ad-hoc operational work with checklists and documentation. Quantify everything.

## Future Expansion

This meta-plugin currently wraps one tool but provides a semantic namespace for future sysadmin additions:

- Docker cleanup workflows
- Log analysis and pattern detection
- Performance monitoring and tuning
- Backup verification procedures
- Security hardening checklists
- Certificate renewal automation

## Integration

Works well with:
- **scenario-testing** - Test cleanup scripts with real servers
- **fresh-eyes-review** - Review automation before deploying

## Notes

Focused on Ubuntu/Debian systems with battle-tested procedures from production environments.

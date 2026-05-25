---
name: code-review
description: Use when reviewing PRs for the TypeScript Delivery SDK—API, tests, bundler impact, semver.
---

# Code review – contentstack-typescript

## When to use

- Reviewing SDK features, fixes, or dependency upgrades
- Assessing risk of a change to browser/Node consumers

## Instructions

### Checklist

- **Semver**: Public API or default behavior change flagged for major/minor/patch appropriately.
- **Core/utils**: Coordinated version bumps for `@contentstack/core` and `@contentstack/utils` when needed.
- **Tests**: Unit + relevant API/browser/bundler coverage for the change.
- **Build**: `npm run build` succeeds; consider `npm run validate:all` for packaging-sensitive edits.
- **Docs**: README or type docs updated for user-visible changes.

### Severity hints

- **Blocker**: Broken `exports`, failing CI, or security issues in dependencies.
- **Major**: Missing tests for cross-bundler or browser regressions.
- **Minor**: Internal refactors with full green matrix.

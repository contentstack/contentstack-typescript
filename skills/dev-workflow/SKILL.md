---
name: dev-workflow
description: Use for branches, CI, npm scripts, and release flow in contentstack-typescript.
---

# Development workflow – contentstack-typescript

## When to use

- Choosing which test target to run locally
- Aligning a PR with GitHub Actions (coverage, branch checks, publish)

## Instructions

### Branches

- Default branch is **`main`**; feature work typically merges via PR with required checks.

### Key commands

- `npm run build` — produce `dist/modern/` artifacts.
- `npm run test:unit` — fast unit tests.
- `npm run test:api` — API-level Jest tests (may need env; see repo docs).
- `npm run test:all` — unit + browser + API (heavy).
- `npm run validate:all` — browser-safe + bundler validation before release-style work.
- `npm run prerelease` — `test:all` + `validate:all` per `package.json`.

### CI

- Workflows under `.github/workflows/` include coverage checks and policy/SCA—keep local runs close to what CI executes for risky changes.

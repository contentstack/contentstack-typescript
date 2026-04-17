---
name: typescript
description: Use for TypeScript source layout, Rollup build, and dist outputs in contentstack-typescript.
---

# TypeScript & layout – contentstack-typescript

## When to use

- Editing `src/` modules or `config/tsconfig.decl-esm.json`
- Debugging ESM vs CJS consumption issues

## Instructions

### Structure

- Application source under **`src/`**; Rollup config at repo root (`rollup` `-c`).
- Types and JS emit land under **`dist/modern/`**—do not hand-edit generated files.

### Node version

- **`engines.node`** requires **≥ 18**—use the same for local development to avoid subtle test or tooling differences.

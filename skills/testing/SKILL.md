---
name: testing
description: Use for Jest, Playwright e2e, API tests, and bundler smoke tests in contentstack-typescript.
---

# Testing – contentstack-typescript

## When to use

- Adding or fixing tests under `test/unit`, `test/api`, or browser/e2e flows
- Investigating failures in `test/bundlers` or Playwright

## Instructions

### Layers

- **Unit**: `npm run test:unit` → `jest ./test/unit`.
- **API**: `npm run test:api` — may require stack credentials via env files (see project docs and `.gitignore`).
- **Browser**: `npm run test:browser` uses a dedicated Jest config.
- **E2E**: `npm run test:e2e` builds a browser bundle then runs Playwright—slower; run before large release changes.
- **Bundlers**: `test/bundlers/` exercises webpack/vite/rollup/next/esbuild—run `npm run validate:bundlers` when changing packaging.

### Hygiene

- Do not commit secrets or live tokens; use fixtures or CI secrets only where documented.

---
name: framework
description: Use for Rollup build, browser-safe validation, and bundler compatibility in contentstack-typescript.
---

# Build & platform – contentstack-typescript

## When to use

- Changing Rollup plugins, bundle splits, or `dist/` layout
- Debugging issues specific to browser, Next.js, Vite, or other bundlers

## Instructions

### Rollup

- Production build: `npm run build:rollup` (high Node memory options may apply—see `package.json`).
- Declaration files: `npm run build:types` (`tsc` with `config/tsconfig.decl-esm.json`).

### Browser and bundlers

- `npm run validate:browser` checks browser-safe assumptions.
- `test/bundlers/` validates multiple toolchains—run `./validate-all.sh` or `npm run validate:bundlers` after dependency or export map changes.

### Outputs

- Consumers import from **`@contentstack/delivery-sdk`**—verify both `import` and `require` paths after changing `exports`.

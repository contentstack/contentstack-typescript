---
description: "Branches, build, and test matrix for contentstack-typescript"
globs: ["**/*.ts", "**/*.mjs", "**/*.json"]
alwaysApply: false
---

# Development workflow — `@contentstack/delivery-sdk`

## Before a PR

1. **`npm run build`** — Rollup + type declarations succeed.
2. **`npm run test:unit`** — required baseline.
3. **API tests** — `npm run test:api` when your change affects live CDA behavior; configure **`.env`** per **`test/utils/stack-instance.ts`**. Never commit tokens.
4. **Browser / e2e** — run when changing bundling, globals, or browser-specific code (`npm run test:browser`, `npm run test:e2e` as needed).

## Dependency on core

- Bumps to **`@contentstack/core`** may require alignment of **httpClient** options, interceptors, or error types. Verify **`stack/contentstack.ts`** and retry/plugin code after core upgrades.

## Versioning

- Update **`package.json` `version`** per semver for user-visible SDK changes.

## Links

- [`AGENTS.md`](../../AGENTS.md) · [`skills/contentstack-delivery-typescript/SKILL.md`](../../skills/contentstack-delivery-typescript/SKILL.md)

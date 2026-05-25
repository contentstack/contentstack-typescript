# Contentstack TypeScript Delivery SDK – Agent guide

**Universal entry point** for contributors and AI agents. Detailed conventions live in **`skills/*/SKILL.md`**.

## What this repo is

| Field | Detail |
|--------|--------|
| **Name:** | [contentstack-typescript](https://github.com/contentstack/contentstack-typescript) (`@contentstack/delivery-sdk`) |
| **Purpose:** | TypeScript/JavaScript Content Delivery SDK for fetching and working with stack content in Node and browsers. |
| **Out of scope:** | Not the Management API or CLI; use the appropriate Contentstack tools for non-delivery workflows. |

## Tech stack (at a glance)

| Area | Details |
|------|---------|
| Language | TypeScript (`typescript` in `package.json`); Node **≥ 18** |
| Build | Rollup (`rollup -c`), declaration emit (`config/tsconfig.decl-esm.json`) → `dist/modern/` |
| Tests | Jest: `test/unit`, `test/api`, browser config; Playwright for e2e (`test/e2e`); bundler smoke tests under `test/bundlers/` |
| Lint / coverage | No root `lint` script—use `npm run validate:all` and `.github/workflows/coverage-check.yml` for quality gates |
| CI | `.github/workflows/coverage-check.yml`, `check-branch.yml`, `sca-scan.yml`, `policy-scan.yml`, `npm-publish.yml` |

## Commands (quick reference)

| Command type | Command |
|--------------|---------|
| Build | `npm run build` |
| Test (common) | `npm run test:unit` / `npm run test:api` / `npm run test:all` |
| Validate | `npm run validate:all` |
| Full CI-style suite | `npm run test:cicd` or `npm run test:cicd:no-browser` (see `package.json`) |

## Where the documentation lives: skills

| Skill | Path | What it covers |
|-------|------|----------------|
| **Development workflow** | [`skills/dev-workflow/SKILL.md`](skills/dev-workflow/SKILL.md) | Branches, CI, npm scripts, prerelease |
| **Delivery SDK** | [`skills/contentstack-delivery-typescript/SKILL.md`](skills/contentstack-delivery-typescript/SKILL.md) | Public API, stack client, `@contentstack/core` usage |
| **TypeScript & layout** | [`skills/typescript/SKILL.md`](skills/typescript/SKILL.md) | `src/`, Rollup outputs, modern CJS/ESM |
| **Testing** | [`skills/testing/SKILL.md`](skills/testing/SKILL.md) | Jest, API tests, Playwright, bundler matrix |
| **Build & platform** | [`skills/framework/SKILL.md`](skills/framework/SKILL.md) | Rollup, browser safety, bundler validation |
| **Code review** | [`skills/code-review/SKILL.md`](skills/code-review/SKILL.md) | PR checklist for SDK changes |

## Using Cursor (optional)

If you use **Cursor**, [`.cursor/rules/README.md`](.cursor/rules/README.md) only points to **`AGENTS.md`**—same docs as everyone else.

# AGENTS.md — AI / automation context

## Project

| | |
|---|---|
| **Name** | **`@contentstack/delivery-sdk`** (npm) — **Contentstack TypeScript Content Delivery SDK** |
| **Purpose** | TypeScript client for the **Content Delivery API (CDA)**: stacks, entries, assets, queries, sync, live preview, cache. Built on **`@contentstack/core`** (**Axios** HTTP + retry helpers) and **`@contentstack/utils`**. |
| **Repository** | [contentstack/contentstack-typescript](https://github.com/contentstack/contentstack-typescript.git) |

## Tech stack

| Area | Details |
|------|---------|
| **Language** | **TypeScript**, **ES modules** (`"type": "module"`) |
| **Runtime** | Node **>= 18** (`package.json` `engines`) |
| **Build** | **Rollup** (`npm run build:rollup`) + **`tsc`** declarations (`config/tsconfig.decl-esm.json`) → **`dist/modern/`** |
| **Tests** | **Jest** + **ts-jest**: **`test/unit`**, **`test/api`**, **`test/browser`**; **Playwright** e2e (`test/e2e`, `npm run test:e2e`) |
| **Lint** | **ESLint** (`.eslintrc.json`) |

## Source layout

| Path | Role |
|------|------|
| `src/stack/contentstack.ts` | **`stack(config)`** factory — wires **`httpClient`** from **`@contentstack/core`**, region/host, live preview |
| `src/stack/stack.ts` | **Stack** class |
| `src/query/**` | Queries (entry, asset, taxonomy, content type, …) |
| `src/entries/**`, `src/assets/**`, `src/sync/**`, `src/cache/**` | Domain modules |
| `src/common/**` | Types, utils, errors, pagination |
| `src/index.ts` | Public package exports |
| `test/utils/stack-instance.ts` | **`stackInstance()`** — loads **dotenv**, **`HOST`**, **`API_KEY`**, **`DELIVERY_TOKEN`**, **`ENVIRONMENT`**, optional live-preview vars |

## Common commands

```bash
npm install
npm run build
npm run test:unit      # jest ./test/unit
npm run test:api       # live API — needs .env (see stack-instance)
npm run test:browser
npm run test:e2e       # Playwright (builds browser bundle first)
npm run test:all       # unit + browser + api
```

## Environment variables (API / integration tests)

Loaded via **`dotenv`** in **`test/utils/stack-instance.ts`**:

- **`HOST`**, **`API_KEY`**, **`DELIVERY_TOKEN`**, **`ENVIRONMENT`** — stack connection
- Optional: **`PREVIEW_TOKEN`**, **`LIVE_PREVIEW_HOST`** for live preview tests

Do not commit secrets.

## Further guidance

- **Cursor rules:** [`.cursor/rules/README.md`](.cursor/rules/README.md)
- **Skills:** [`skills/README.md`](skills/README.md)

Product docs: [Content Delivery API](https://www.contentstack.com/docs/developers/apis/content-delivery-api/).

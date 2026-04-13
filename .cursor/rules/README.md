# Cursor Rules — `@contentstack/delivery-sdk`

Rules for **contentstack-typescript**: TypeScript **CDA** SDK built on **`@contentstack/core`**.

## Rules overview

| Rule | Role |
|------|------|
| [`dev-workflow.md`](dev-workflow.md) | Branch/PR, build, tests (`unit` / `api` / `browser`), e2e |
| [`typescript.mdc`](typescript.mdc) | TS conventions, `src/`, `config/` |
| [`contentstack-delivery-typescript.mdc`](contentstack-delivery-typescript.mdc) | **stack**, queries, cache, live preview, **core** integration |
| [`testing.mdc`](testing.mdc) | Jest suites, **jest.setup.ts**, env, Playwright |
| [`code-review.mdc`](code-review.mdc) | PR checklist (**always applied**) |

## Rule application

| Context | Typical rules |
|---------|----------------|
| **Every session** | `code-review.mdc` |
| **Most files** | `dev-workflow.md` |
| **`src/`** | `typescript.mdc` + `contentstack-delivery-typescript.mdc` |
| **`test/**`** | `testing.mdc` |
| **Rollup / TS config** | `typescript.mdc` |

## Quick reference

| File | `alwaysApply` | Globs (summary) |
|------|---------------|-----------------|
| `dev-workflow.md` | no | `**/*.ts`, `**/*.mjs`, `**/*.json` |
| `typescript.mdc` | no | `src/**/*.ts`, `config/**/*.ts`, `jest.config.ts`, `jest.config.browser.ts`, `jest.setup.ts` |
| `contentstack-delivery-typescript.mdc` | no | `src/**/*.ts` |
| `testing.mdc` | no | `test/**/*.ts`, `playwright.config.ts` |
| `code-review.mdc` | **yes** | — |

## Skills

- [`skills/README.md`](../../skills/README.md) · [`AGENTS.md`](../../AGENTS.md)

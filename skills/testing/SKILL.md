---
name: testing
description: Jest unit/api/browser and Playwright e2e for @contentstack/delivery-sdk.
---

# Testing — `@contentstack/delivery-sdk`

## Commands

| Goal | Command |
|------|---------|
| Unit | `npm run test:unit` |
| API (live stack) | `npm run test:api` |
| Browser | `npm run test:browser` |
| All three | `npm run test:all` |
| E2E | `npm run test:e2e` |
| CI-style matrix | `npm run test:cicd` (includes reports + browser tests) |

## Environment

See **`test/utils/stack-instance.ts`**:

- **Required:** `HOST`, `API_KEY`, `DELIVERY_TOKEN`, `ENVIRONMENT`
- **Optional:** `PREVIEW_TOKEN`, `LIVE_PREVIEW_HOST`

Use a **`.env`** at repo root for local API runs.

## Setup

- **`jest.setup.ts`** — global hooks and expected-error suppression; read before changing console behavior.

## References

- `.cursor/rules/testing.mdc`

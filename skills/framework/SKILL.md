---
name: framework
description: HTTP and retry integration — @contentstack/core with httpClient on the Delivery SDK stack.
---

# Framework skill — `@contentstack/core` + Delivery SDK

## Integration point

- **`src/stack/contentstack.ts`** imports **`httpClient`**, **`retryRequestHandler`**, **`retryResponseErrorHandler`**, **`retryResponseHandler`** from **`@contentstack/core`** and composes them with stack-specific **headers**, **live_preview**, and **cache**-related request handling (**`handleRequest`**).

## When to change

- **Retry behavior** shared across Contentstack TS clients → prefer **`@contentstack/core`** (**contentstack-js-core** repo) if appropriate; otherwise document SDK-only overrides here.
- **Base URL / region** — **`getHostforRegion`** and **StackConfig.host** in **`src/common/utils.ts`** (verify imports from current **`contentstack.ts`**).

## Testing

- **Unit** — mock HTTP layers; **API** — full stack via **`stackInstance()`**.

## Rule shortcut

- `.cursor/rules/contentstack-delivery-typescript.mdc`

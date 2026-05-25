---
name: contentstack-delivery-typescript
description: Use for the public Delivery SDK API, stack initialization, and integration with @contentstack/core and utils.
---

# Contentstack Delivery SDK – contentstack-typescript

## When to use

- Changing how consumers initialize the SDK or call stack APIs
- Updating dependencies on `@contentstack/core` or `@contentstack/utils`

## Instructions

### Package identity

- Published as **`@contentstack/delivery-sdk`**; entry is built into **`dist/modern/`** with dual CJS/ESM typings (`package.json` `exports`).

### Design constraints

- Preserve backward compatibility for public imports and options unless shipping a **semver major**.
- HTTP and low-level client behavior often delegate to **`@contentstack/core`**—avoid duplicating retry or error logic; extend in one place when possible.

### Documentation

- User-facing behavior belongs in **`README.md`** and official Contentstack docs; keep code samples accurate when changing APIs.

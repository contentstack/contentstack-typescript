---
name: contentstack-delivery-typescript
description: @contentstack/delivery-sdk — TypeScript CDA client, stack factory, queries, sync, cache, live preview.
---

# Contentstack TypeScript Delivery SDK skill

## Entry

- **`contentstack.stack(config)`** — **`src/stack/contentstack.ts`**: merges **StackConfig**, resolves **Region** → host, attaches **@contentstack/core** **`httpClient`** with retry handlers, returns **`Stack`**.

## Structure

- **`Stack`** — **`src/stack/stack.ts`**: content types, entries, assets, sync, taxonomy helpers.
- **Queries** — **`src/query/`**: **BaseQuery**, **Query**, **AssetQuery**, **TaxonomyQuery**, **ContentTypeQuery**, **GlobalFieldQuery**, **EntryQueryable**, etc.
- **Sync** — **`src/sync/`**
- **Cache** — **`src/cache/`** + **Policy** enum in types.

## Extending

- Add query methods on the appropriate class; keep param names aligned with **CDA** query docs.
- Prefer delegating transport concerns to **core** rather than duplicating Axios logic.

## Consumer packages

- **`@contentstack/core`** — HTTP + retries
- **`@contentstack/utils`** — utilities; re-exported where documented.

## Docs

- [Content Delivery API](https://www.contentstack.com/docs/developers/apis/content-delivery-api/)

## Rule shortcut

- `.cursor/rules/contentstack-delivery-typescript.mdc`

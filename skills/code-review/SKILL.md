---
name: code-review
description: PR review for @contentstack/delivery-sdk — public API, StackConfig, core alignment, tests.
---

# Code review — `@contentstack/delivery-sdk`

## Checklist

- [ ] **API:** New or changed **`stack()`** / **Stack** / query methods documented; exports updated in **`src/index.ts`**.
- [ ] **Types:** **StackConfig** and public interfaces remain consistent with **`dist/modern/*.d.ts`** after build.
- [ ] **@contentstack/core:** Version or API changes validated in **`src/stack/contentstack.ts`** (interceptors, **httpClient** options).
- [ ] **Tests:** **`test:unit`** passes; add/extend **`test/api`** when integration behavior changes; browser/e2e if relevant.
- [ ] **Secrets:** No tokens in repo; **stack-instance** env vars only for local CI secrets store.

## References

- `.cursor/rules/code-review.mdc`
- `.cursor/rules/dev-workflow.md`

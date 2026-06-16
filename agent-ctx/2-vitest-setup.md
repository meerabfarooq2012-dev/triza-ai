# Task 2 — Vitest Test Infrastructure Setup

**Agent:** Task 2 — Vitest setup agent
**Date:** 2026-06-16
**Status:** ✅ Complete

## Summary

Set up automated testing infrastructure using **Vitest** (not Jest, due to Next.js 16 Turbopack compatibility issues). All 126 tests pass across 5 test files. No production code was modified.

## Files Created

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Vitest configuration: jsdom env, globals, `@` → `./src` alias, v8 coverage |
| `src/test/setup.tsx` | Global setup: jest-dom matchers, cleanup, jsdom polyfills (matchMedia, IntersectionObserver, ResizeObserver), Next.js mocks (navigation, link, image, themes) |
| `src/test/utils.tsx` | Test utilities: `renderWithProviders`, `resetMarketplaceStore`, mock data factories (User, Shop, Product, Order, Review, CartItem, Notification), API request builders |
| `src/lib/__tests__/security.test.ts` | 50 tests for `isValidId`, `isValidSqlIdentifier`, `isValidSqlType`, `validateSecret`, HMAC round-trip, `redactSensitiveFields`, `maskConnectionString` |
| `src/lib/__tests__/payment-methods.test.ts` | 31 tests for the static payment-methods config (counts, active flags, categories, crypto filter) |
| `src/app/api/health/__tests__/route.test.ts` | 6 tests for `/api/health` (mocks `@/lib/db`) |
| `src/app/api/payment-methods/__tests__/route.test.ts` | 12 tests for `/api/payment-methods` (mocks `@/lib/db` + `@/lib/cache`, covers cache hit/miss/error paths) |
| `src/components/__tests__/price.test.tsx` | 27 tests for `<Price>` component (currency conversion, strikethrough, prefix, compact, sizes) |

## Files Modified

- `package.json`: added `test`, `test:watch`, `test:coverage` scripts; added devDependencies for Vitest + Testing Library + coverage provider

## Test Results

```
Test Files  5 passed (5)
     Tests  126 passed (126)
  Duration  1.77s
```

## Key Decisions

1. **Vitest over Jest** — Jest has documented incompatibilities with Next.js 16 Turbopack. Vitest uses the same Vite plugin ecosystem and works seamlessly.

2. **Mock-first strategy** — All API route tests mock `@/lib/db` (Prisma) and `@/lib/cache` at the module boundary. No real DB connections are opened, no cache state leaks between tests.

3. **Setup file is `.tsx`** — The `next/link` and `next/image` mocks return JSX, so the setup file has to be `.tsx`. Vitest compiles it through `@vitejs/plugin-react` transparently.

4. **Health endpoint response shape discrepancy** — The task spec said the response should include `success: true`, but the actual `/api/health` route returns `{ status: 'ok', timestamp, database }` (no `success` field). Tests were written to match the actual implementation. Changing the route's public response shape would break existing API consumers. The `/api/payment-methods` route does return `success: true`, and that's tested verbatim.

5. **Price component `overrideCurrency` bug discovered** — While writing the Price test, I noticed `overrideCurrency` is computed but never used (the hook's `formatPrice` always uses the store currency). The test pins the safe-rendering contract (passing the prop doesn't crash). Fixing the bug is out of scope for this testing-only task.

## Coverage

- `src/lib/security.ts`: 66.66% statements, 73.33% functions, 69.84% lines
- `src/lib/payment-methods.ts`: 77.77% statements, 95% functions, 79.41% lines

## Verification Commands

```bash
bun run test            # All 126 tests pass
bun run test:watch      # Watch mode works
bun run test:coverage   # Coverage report generates successfully
bun run lint            # 0 errors (1 pre-existing warning in src/app/page.tsx, not from this task)
```

## Dev Server Impact

`bun run dev` continues to start cleanly. Verified via `dev.log` — no regressions from the new test files or `vitest.config.ts`.

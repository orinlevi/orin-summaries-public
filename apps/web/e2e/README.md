# E2E Tests (Playwright)

Smoke tests that verify the site works end-to-end — navigation, search, content rendering, and error handling.

## How to run

```bash
cd apps/web

# Run all tests (starts dev server automatically)
npm run test:e2e

# Run with UI (opens Playwright inspector — you can see the browser)
npm run test:e2e:ui

# Run a specific file
npx playwright test e2e/search.spec.ts
```

## Test files

| File | What it tests | Tests |
|---|---|---|
| `navigation.spec.ts` | Homepage, TAU/HUJI buttons, course cards, breadcrumbs, navbar links | 8 |
| `search.spec.ts` | Search input, results, TAU/HUJI separation, keyboard navigation | 7 |
| `course-content.spec.ts` | Unit list, free content, KaTeX math, paywall on paid units, access page | 8 |
| `huji.spec.ts` | HUJI landing, course cards, units (all free), search | 6 |
| `error-pages.spec.ts` | 404 for bad URLs, friendly error message, back-to-home link | 5 |

**Total: 34 tests**

## What's NOT tested (and why)

- **Auth flow** — Google Sign-In needs real credentials + Vercel KV isn't available locally
- **Payment** — Lemon Squeezy checkout is an external embed
- **Mobile layout** — worth adding later, not critical yet
- **Admin endpoints** — require auth tokens

## Setup (one-time)

```bash
# Install Playwright + Chromium browser
npm install -D @playwright/test
npx playwright install chromium
```

## Config

See `playwright.config.ts` in the web app root. Key settings:
- **Browser**: Chromium only (enough for smoke tests)
- **Dev server**: Playwright auto-starts `npm run dev` on port 3000
- **Retries**: 1 retry in CI, 0 locally

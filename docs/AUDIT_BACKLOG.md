# Audit Backlog - orin-summaries

Sorted by priority. Each item should be done on a **separate git branch**.

---

## P0 - Content Rendering Bugs
Issues that affect what users see on the site.

### Broken .md Links
- **94 links** in 28 files point to `.md` files (e.g. `[basics.md](basics.md)`) that don't resolve to a slug in `courses.json`
- The link silently disappears - user sees nothing
- **Fix**: rewrite links to match actual unit slugs, or add a preprocessor to convert `.md` links to correct paths
- **Branch**: `fix/broken-md-links`

### `<div markdown>` Blocks
- **320 occurrences** in 36 files
- This is Python-Markdown syntax (from MkDocs) that doesn't work with MDXRemote
- Markdown inside these `<div>` tags doesn't get rendered
- **Fix**: either strip the `<div markdown>` tags or add a preprocessor to handle them
- **Branch**: `fix/div-markdown-blocks`

### Math Rendering (Verify)
- `\(...\)` MathJax syntax in 37 files - the preprocessor should convert to `$...$` but needs verification
- `\begin{align}` in 1 file - should be converted to `aligned`
- `\stackrel` in 2 files - should be converted to `\overset`
- **Action**: open these pages and verify the math renders correctly
- **Branch**: `fix/math-rendering` (if issues found)

---

## P1 - Security
Important for a site that handles payments.

### ~~Rate Limiting~~ ✅ DONE (Feb 2026)
- ~~No rate limiting on API routes~~
- **Implemented**: sliding-window rate limiter using Redis sorted sets (`src/lib/rate-limit.ts`)
- 10 req/min on auth routes, 5 req/min on coupon redemption
- **Branch**: was `feature/rate-limiting`, merged to main

### Security Headers
- Missing CSP (Content Security Policy), X-Frame-Options in `next.config`
- **Fix**: add security headers in `next.config.ts`
- **Branch**: `feature/security-headers`

### Input Validation
- Partial validation on API routes (email format, coupon code)
- **Fix**: add proper validation with zod or similar
- **Branch**: `feature/input-validation`

---

## P2 - Accessibility (a11y)

### ARIA Labels
- Missing on SearchBar, TableOfContents, navigation buttons
- **Fix**: add `aria-label`, `role`, and `aria-expanded` attributes
- **Branch**: `feature/aria-labels`

### Form Labels
- Using `placeholder` instead of `<label>` in forms (accessibility issue)
- Screen readers can't read placeholder text reliably
- **Fix**: add visually-hidden `<label>` elements
- **Branch**: `fix/form-labels`

### Color Contrast
- `text-gray-500` on dark background may not meet WCAG AA (4.5:1 ratio)
- **Fix**: audit with browser DevTools contrast checker, bump to lighter grays
- **Branch**: `fix/contrast`

---

## P3 - SEO & UX

### OpenGraph Tags
- No og:image, og:title, og:description for social media sharing
- **Fix**: add `generateMetadata()` with OpenGraph tags to layout/pages
- **Branch**: `feature/opengraph`

### Loading States
- No `loading.tsx` files - pages show blank while loading
- **Fix**: add `loading.tsx` with skeleton/spinner to key routes
- **Branch**: `feature/loading-states`

### Error Boundaries
- If Markdown rendering fails, the entire page crashes
- **Fix**: wrap MarkdownRenderer in error boundary, show fallback
- **Branch**: `feature/error-boundaries`

---

## P4 - Polish (Low Priority)

### Light Mode
- Site is dark-mode only
- **Branch**: `feature/light-mode`

### Keyboard Navigation
- SearchBar doesn't support keyboard navigation (arrow keys, escape)
- **Branch**: `feature/keyboard-nav`

### Console.log Cleanup
- 12+ console.log statements in production code
- **Fix**: remove or replace with structured logging
- **Branch**: `fix/console-logs`

### ~~Tests~~ ✅ DONE (Feb 2026)
- ~~No tests exist~~
- **Implemented**: Playwright E2E (34 smoke tests) + Vitest for unit tests
- Test files: `apps/web/e2e/` (5 spec files)
- Run: `npm run test:e2e`
- **Branch**: was `feature/e2e-tests`, merged to main

---

## How to Work on These

Each item gets its own branch:
```bash
# 1. Create a new branch from main
git checkout main
git pull
git checkout -b fix/broken-md-links

# 2. Make changes, commit
git add <files>
git commit -m "Fix broken .md links in content files"

# 3. Push and merge
git push -u origin fix/broken-md-links
# Then merge via GitHub PR, or:
git checkout main
git merge fix/broken-md-links
git push
```

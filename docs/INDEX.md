# docs/ - Project Documentation

Welcome! This folder contains all documentation for the orin-summaries project.

## For You (Orin)

| File | What | When to read |
|------|------|--------------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to add courses, write Markdown, compile LaTeX, manage assets | When adding new content to the site |
| [COUPONS.md](COUPONS.md) | Coupon codes, how to check usage, how to create new ones | When sharing access with friends |
| [STORE_LAUNCH_CHECKLIST.md](STORE_LAUNCH_CHECKLIST.md) | Step-by-step: what to do when Lemon Squeezy approves the store | When the store gets approved |
| [DATABASE.md](DATABASE.md) | Database architecture: Postgres tables, Redis keys, auth flow diagram | When working on backend/data layer |
| [AUDIT_BACKLOG.md](AUDIT_BACKLOG.md) | List of improvements sorted by priority, with git branch names | When you want to improve the site |

## Public Portfolio Repo

There is a **public** copy of the code at `github.com/orinlevi/orin-summaries-public`.
It contains only the source code (no summaries, PDFs, or secrets) for portfolio/CV purposes.

**When to update it:** After major changes (new features, new API routes, big refactors), create a fresh snapshot:
1. Copy the code (without `content/`, `private-assets/`, `admin-assets/`, `.env*`)
2. Keep the example course
3. Update the README if needed
4. Commit and push to `orin-summaries-public`

## For AI Assistants (Claude Code / Cursor / Copilot)

If you're an AI reading this project, here's what you need to know:

- **Tech stack**: Next.js 16 + React 19 + Tailwind CSS 4, Turborepo monorepo
- **Content**: Hebrew RTL, Markdown with KaTeX math and MkDocs admonitions
- **Database**: Hybrid — PostgreSQL (Neon/Drizzle) for data, Redis (Vercel KV) for sessions
- **Auth**: HMAC-SHA256 token in cookie, session check via Redis, purchase check via Postgres
- **Payment**: Lemon Squeezy (store pending approval, test mode webhook active)
- **Testing**: Playwright E2E (34 smoke tests), Vitest for unit tests
- **Key config file**: `apps/web/content/courses.json` - all courses defined here
- **LaTeX**: `xelatex` with polyglossia, never use `\tableofcontents` (bug)
- **Build**: `npx turbo build` from project root
- **Deploy**: `git push origin main` triggers Vercel auto-deploy
- **DB management**: `npm run db:push` (create tables), `db:studio` (visual browser)

### Critical gotchas
1. `auth.ts` must NOT throw at module level - use lazy `getCookieSecret()`
2. `db/index.ts` must NOT call `neon()` at module level - uses lazy Proxy pattern
3. Google Sign-In origin must be `orin-summaries.vercel.app`
4. Always run `xelatex` twice for references
5. Checkout URL in `PaywallGate.tsx` and `Navbar.tsx` is test mode - needs update for production

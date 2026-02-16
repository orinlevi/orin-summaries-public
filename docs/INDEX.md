# docs/ - Project Documentation

| File | What | When to read |
|------|------|--------------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to add courses, write Markdown, compile LaTeX, manage assets | When adding new content |
| [AUDIT_BACKLOG.md](AUDIT_BACKLOG.md) | List of improvements sorted by priority, with git branch names | When improving the site |

## For AI Assistants (Claude Code / Cursor / Copilot)

If you're an AI reading this project, here's what you need to know:

- **Tech stack**: Next.js 16 + React 19 + Tailwind CSS 4, Turborepo monorepo
- **Content**: Hebrew RTL, Markdown with KaTeX math and MkDocs admonitions
- **Auth**: HMAC-SHA256 token in cookie, Vercel KV for purchases/sessions
- **Payment**: Lemon Squeezy webhooks with timing-safe HMAC verification
- **Key config file**: `apps/web/content/courses.json` - all courses defined here
- **LaTeX**: `xelatex` with polyglossia, never use `\tableofcontents` (bug)
- **Build**: `npx turbo build` from project root

### Critical gotchas
1. `auth.ts` must NOT throw at module level - use lazy `getCookieSecret()`
2. Always run `xelatex` twice for references
3. All secrets come from `process.env` - never hardcode

# Orin Summaries

A full-stack course summaries platform built for university students. Features paid content access, authentication, payment integration, and full Hebrew RTL support.

**Live site:** [orin-summaries.vercel.app](https://orin-summaries.vercel.app)

> **📌 Portfolio Snapshot:** This repository is a public snapshot of a private production codebase. Course content (summaries, PDFs) and environment variables are excluded — the code is shared for review purposes only. Visit the live site to see it in action.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, Tailwind CSS 4 |
| **Monorepo** | Turborepo |
| **Database** | Vercel KV (Redis) |
| **Payments** | Lemon Squeezy (webhooks + checkout) |
| **Auth** | Custom HMAC-SHA256 token system |
| **Content** | Markdown + KaTeX math + custom admonitions |
| **LaTeX** | XeLaTeX with Hebrew (polyglossia) |
| **Deployment** | Vercel (auto-deploy on push) |

---

## Architecture

```
orin-summaries/
├── apps/web/                        # Next.js application
│   ├── src/
│   │   ├── app/                     # App Router pages
│   │   │   ├── api/
│   │   │   │   ├── auth/            # Auth endpoints (Google, email, coupon)
│   │   │   │   ├── webhooks/        # Lemon Squeezy payment webhooks
│   │   │   │   ├── download/        # Protected file serving
│   │   │   │   └── admin/           # Admin endpoints (coupon management)
│   │   │   ├── course/[courseId]/    # Dynamic course pages
│   │   │   └── access/              # Login page
│   │   ├── lib/
│   │   │   ├── auth.ts              # HMAC-SHA256 token signing/verification
│   │   │   ├── kv.ts                # Redis operations (purchases, sessions, coupons)
│   │   │   ├── courses.ts           # Course data loading
│   │   │   └── content.ts           # Markdown file reading
│   │   └── components/
│   │       ├── PaywallGate.tsx       # Content gating
│   │       ├── Navbar.tsx            # Navigation with auth state
│   │       └── content/
│   │           └── MarkdownRenderer.tsx  # MDX + KaTeX + admonitions
│   └── content/
│       └── courses.json             # Central course configuration (45+ courses)
├── packages/
│   └── remark-mkdocs/               # Custom remark plugin
│       └── src/
│           ├── admonitions.ts        # MkDocs !!! syntax parser
│           ├── math-fixup.ts         # MathJax to KaTeX converter
│           └── rehype-admonitions.ts # HTML post-processing
├── scripts/
│   └── build-latex.sh               # LaTeX to PDF compilation
└── docs/                            # Project documentation
```

---

## Key Features

### Authentication and Authorization
- Custom token system using HMAC-SHA256 signed cookies (180-day expiry)
- Google Sign-In with server-side token verification
- Role-based access: Admin, Allowed (free list), Purchased, Guest
- Single-device enforcement via session tracking in Redis
- Coupon system with usage limits and redemption tracking

### Payment Integration (Lemon Squeezy)
- Embedded checkout flow
- Webhook receiver with timing-safe HMAC signature verification (`crypto.timingSafeEqual`)
- Dual-path purchase recording: webhook + redirect endpoint (fault-tolerant design)
- Purchase records stored in Vercel KV with 180-day TTL

### Content Rendering Pipeline
```
Markdown source
    -> preprocessMkdocsAdmonitions()    // !!! info -> blockquotes
    -> preprocessMathFixup()            // MathJax -> KaTeX syntax
    -> rewriteLinks()                   // Relative -> absolute URLs
    -> MDXRemote with plugins:
        - remarkGfm                     // Tables, strikethrough
        - remarkMath                    // $...$ and $$...$$
        - rehypeRaw                     // Raw HTML support
        - rehypeKatex                   // Math rendering
        - rehypeAdmonitions             // Info/warning/tip boxes
        - rehypeSlug                    // Heading anchors
    -> Rendered HTML with full RTL support
```

### Three-Tier Asset System
| Directory | Auth | Use Case |
|-----------|:----:|----------|
| `public/assets/` | None | Images embedded in Markdown |
| `private-assets/` | Login | PDFs, notebooks, code files |
| `admin-assets/` | Admin | Personal reference materials |

All protected downloads served through `/api/download` with auth verification.

### Full Hebrew RTL Support
- Document-level `dir="rtl"` with LTR isolation for code and math
- RTL-aware tables, lists, and blockquotes

---

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/auth/google` | Google Sign-In verification |
| `POST` | `/api/auth/verify-email` | Email-based login |
| `GET` | `/api/auth/activate` | Post-purchase activation |
| `POST` | `/api/auth/redeem-coupon` | Coupon redemption |
| `GET` | `/api/auth/check` | Auth status check |
| `GET` | `/api/download` | Protected file serving |
| `POST` | `/api/webhooks/lemonsqueezy` | Payment webhook |
| `POST` | `/api/admin/create-coupon` | Create coupon (admin) |
| `GET` | `/api/admin/coupons` | List coupons (admin) |

---

## Getting Started

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
# Fill in environment variables
npm run dev
```

---

## Screenshots

> Visit the live site: [orin-summaries.vercel.app](https://orin-summaries.vercel.app)

*Screenshots to be added.*

---

## Author

**Orin Levi** — B.Sc. Psychology and Computer Science (Neuroscience emphasis), Tel Aviv University

## License

Source code is provided for portfolio and review purposes. All rights reserved.
Course content is proprietary and not included in this repository.

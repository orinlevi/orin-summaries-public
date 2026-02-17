# Database Architecture

## Overview

The project uses a **hybrid database architecture**:

| Database | What it stores | Why |
|----------|---------------|-----|
| **PostgreSQL** (Neon) | Users, purchases, progress, coupons | Relational data with foreign keys, CASCADE deletes, complex queries |
| **Redis** (Vercel KV) | Sessions, rate limiting, visit counter | Ultra-fast (~10ms), checked on every page load |

## PostgreSQL (Neon)

### Connection
- **Provider**: Neon (Serverless Postgres), Free tier
- **ORM**: Drizzle (`drizzle-orm` + `@neondatabase/serverless`)
- **Env var**: `POSTGRES_URL` (auto-set by Vercel Neon integration)
- **Region**: Washington D.C. (iad1)

### Tables

```
users
├── id (serial, PK)
├── email (text, unique, not null)
├── created_at (timestamp)
└── last_login (timestamp)

purchases
├── id (serial, PK)
├── user_id (FK → users.id, CASCADE)
├── order_id (text, not null)
├── product_id (text, default "semester")
├── source (text, default "lemon-squeezy")
├── created_at (timestamp)
└── expires_at (timestamp, not null)

progress
├── id (serial, PK)
├── user_id (FK → users.id, CASCADE)
├── course_id (text, not null)
├── unit_id (integer, not null)
├── status (text, "viewed" | "completed")
├── updated_at (timestamp)
└── UNIQUE(user_id, course_id, unit_id)

coupons
├── id (serial, PK)
├── code (text, unique, not null)
├── max_uses (integer, default 0 = unlimited)
├── expires_at (timestamp, nullable)
├── created_at (timestamp)
└── created_by (text, not null)

coupon_redemptions
├── id (serial, PK)
├── coupon_id (FK → coupons.id, CASCADE)
├── user_id (FK → users.id, CASCADE)
├── redeemed_at (timestamp)
└── UNIQUE(coupon_id, user_id)
```

### Key files
- **Schema**: `apps/web/src/lib/db/schema.ts`
- **Client**: `apps/web/src/lib/db/index.ts` (lazy Proxy — won't crash at build time)
- **Queries**: `apps/web/src/lib/db/queries.ts` (~310 lines, full data access layer)
- **Config**: `apps/web/drizzle.config.ts`

### Common commands
```bash
# Create/update tables from schema
npm run db:push

# Open visual database browser
npm run db:studio

# Generate migration SQL files
npm run db:generate
```

## Redis (Vercel KV)

### Connection
- **Store**: `orin-kv`
- **Env prefix**: `KV_` (KV_URL, KV_REST_API_URL, etc.)

### Key patterns
| Key | Value | TTL |
|-----|-------|-----|
| `session:{email}` | iat timestamp (number) | 180 days |
| `ratelimit:{ip}:{endpoint}` | sorted set | auto-cleanup |
| `visits` | counter (number) | none |

### Key file
- `apps/web/src/lib/kv.ts` (~25 lines — only `storeSession` and `isLatestSession`)

## Migration from Redis to Postgres

A one-time migration script exists at `apps/web/scripts/migrate-kv-to-postgres.ts`.

```bash
# Prerequisites: POSTGRES_URL and KV_* env vars must be set
# Tables must exist (run db:push first)
npx tsx scripts/migrate-kv-to-postgres.ts
```

It reads all `purchase:*`, `progress:*`, and `coupon:*` keys from Redis
and inserts them into the corresponding Postgres tables.

## Auth Flow Diagram

```
┌─────────────┐     ┌──────────┐     ┌──────────┐     ┌────────┐
│   Browser   │────→│ API Route│────→│ Postgres │     │ Redis  │
│  (cookie)   │     │          │     │          │     │        │
└─────────────┘     └──────────┘     └──────────┘     └────────┘

Login (once):
  Browser → POST /api/auth/verify-email
    → Postgres: hasPurchase(email)?  ← ~50ms
    → Redis: storeSession(email, iat) ← ~10ms
    → Set cookie (JWT with email + iat)

Every page load:
  Browser → GET /api/auth/check
    → Decode JWT from cookie
    → Redis: isLatestSession(email, iat)?  ← ~10ms
    → Return { ok: true/false }
    (NO Postgres call — fast!)
```

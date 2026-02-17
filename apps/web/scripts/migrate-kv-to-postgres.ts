/**
 * One-time migration script: Redis (Vercel KV) → PostgreSQL
 *
 * Reads existing purchase, progress, and coupon data from Redis
 * and inserts it into the new Postgres tables.
 *
 * Usage:
 *   npx tsx scripts/migrate-kv-to-postgres.ts
 *
 * Prerequisites:
 *   - POSTGRES_URL must be set (Vercel Postgres / Neon)
 *   - KV_* env vars must be set (Vercel KV / Redis)
 *   - Run `npm run db:push` first to create tables
 */

import { kv } from "@vercel/kv";
import { db } from "../src/lib/db";
import { users, purchases, progress, coupons, couponRedemptions } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

// ── Helpers ──────────────────────────────────────────────────

let migratedUsers = 0;
let migratedPurchases = 0;
let migratedProgress = 0;
let migratedCoupons = 0;
let migratedRedemptions = 0;
let errors = 0;

async function getOrCreateUser(email: string): Promise<number> {
  const normalized = email.toLowerCase();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);

  if (existing.length > 0) return existing[0].id;

  const [inserted] = await db
    .insert(users)
    .values({ email: normalized })
    .onConflictDoNothing()
    .returning({ id: users.id });

  if (inserted) {
    migratedUsers++;
    return inserted.id;
  }

  // Race condition: another insert happened between select and insert
  const [found] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);

  return found.id;
}

// ── Migrate purchases ────────────────────────────────────────

interface KVPurchase {
  email: string;
  orderId: string;
  productId: string;
  createdAt: string;
  expiresAt: string;
}

async function migratePurchases() {
  console.log("\n📦 Migrating purchases...");

  const keys: string[] = [];
  let cursor = 0;
  do {
    const result = await kv.scan(cursor, { match: "purchase:*", count: 100 });
    cursor = Number(result[0]);
    keys.push(...(result[1] as string[]));
  } while (cursor !== 0);

  console.log(`  Found ${keys.length} purchase keys`);

  for (const key of keys) {
    try {
      const record = await kv.get<KVPurchase>(key);
      if (!record || !record.email) continue;

      const userId = await getOrCreateUser(record.email);

      await db
        .insert(purchases)
        .values({
          userId,
          orderId: record.orderId,
          productId: record.productId || "semester",
          source: record.orderId.startsWith("coupon:") ? "coupon" : "lemon-squeezy",
          createdAt: record.createdAt ? new Date(record.createdAt) : undefined,
          expiresAt: new Date(record.expiresAt),
        })
        .onConflictDoNothing();

      migratedPurchases++;
    } catch (err) {
      console.error(`  ❌ Error migrating ${key}:`, err);
      errors++;
    }
  }
}

// ── Migrate progress ─────────────────────────────────────────

interface KVProgress {
  viewed: number[];
  completed: number[];
}

async function migrateProgress() {
  console.log("\n📊 Migrating progress...");

  const keys: string[] = [];
  let cursor = 0;
  do {
    const result = await kv.scan(cursor, { match: "progress:*", count: 100 });
    cursor = Number(result[0]);
    keys.push(...(result[1] as string[]));
  } while (cursor !== 0);

  console.log(`  Found ${keys.length} progress keys`);

  for (const key of keys) {
    try {
      // Key format: progress:email:courseId
      const parts = key.split(":");
      if (parts.length < 3) continue;

      const email = parts[1];
      const courseId = parts.slice(2).join(":"); // courseId might contain colons
      const record = await kv.get<KVProgress>(key);
      if (!record) continue;

      const userId = await getOrCreateUser(email);

      // Insert viewed units
      for (const unitId of record.viewed || []) {
        const status = (record.completed || []).includes(unitId) ? "completed" : "viewed";
        await db
          .insert(progress)
          .values({ userId, courseId, unitId, status })
          .onConflictDoNothing();
        migratedProgress++;
      }

      // Insert completed units that weren't in viewed (shouldn't happen, but just in case)
      for (const unitId of record.completed || []) {
        if (!(record.viewed || []).includes(unitId)) {
          await db
            .insert(progress)
            .values({ userId, courseId, unitId, status: "completed" })
            .onConflictDoNothing();
          migratedProgress++;
        }
      }
    } catch (err) {
      console.error(`  ❌ Error migrating ${key}:`, err);
      errors++;
    }
  }
}

// ── Migrate coupons ──────────────────────────────────────────

interface KVCoupon {
  code: string;
  maxUses: number;
  uses: number;
  redeemedBy: string[];
  expiresAt: string;
  createdAt: string;
  createdBy: string;
}

async function migrateCoupons() {
  console.log("\n🎟️  Migrating coupons...");

  const keys: string[] = [];
  let cursor = 0;
  do {
    const result = await kv.scan(cursor, { match: "coupon:*", count: 100 });
    cursor = Number(result[0]);
    keys.push(...(result[1] as string[]));
  } while (cursor !== 0);

  console.log(`  Found ${keys.length} coupon keys`);

  for (const key of keys) {
    try {
      const record = await kv.get<KVCoupon>(key);
      if (!record || !record.code) continue;

      const [inserted] = await db
        .insert(coupons)
        .values({
          code: record.code.toUpperCase(),
          maxUses: record.maxUses || 0,
          expiresAt: record.expiresAt ? new Date(record.expiresAt) : null,
          createdAt: record.createdAt ? new Date(record.createdAt) : undefined,
          createdBy: record.createdBy || "admin",
        })
        .onConflictDoNothing()
        .returning({ id: coupons.id });

      if (!inserted) {
        // Coupon already exists — get its ID
        const [existing] = await db
          .select({ id: coupons.id })
          .from(coupons)
          .where(eq(coupons.code, record.code.toUpperCase()))
          .limit(1);
        if (!existing) continue;

        migratedCoupons++;

        // Migrate redemptions
        for (const email of record.redeemedBy || []) {
          try {
            const userId = await getOrCreateUser(email);
            await db
              .insert(couponRedemptions)
              .values({ couponId: existing.id, userId })
              .onConflictDoNothing();
            migratedRedemptions++;
          } catch {
            // Skip individual redemption errors
          }
        }
      } else {
        migratedCoupons++;

        // Migrate redemptions
        for (const email of record.redeemedBy || []) {
          try {
            const userId = await getOrCreateUser(email);
            await db
              .insert(couponRedemptions)
              .values({ couponId: inserted.id, userId })
              .onConflictDoNothing();
            migratedRedemptions++;
          } catch {
            // Skip individual redemption errors
          }
        }
      }
    } catch (err) {
      console.error(`  ❌ Error migrating ${key}:`, err);
      errors++;
    }
  }
}

// ── Main ─────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Starting KV → Postgres migration...");
  console.log("   Make sure you ran `npm run db:push` first!\n");

  await migratePurchases();
  await migrateProgress();
  await migrateCoupons();

  console.log("\n" + "─".repeat(50));
  console.log("✅ Migration complete!");
  console.log(`   Users:       ${migratedUsers}`);
  console.log(`   Purchases:   ${migratedPurchases}`);
  console.log(`   Progress:    ${migratedProgress} records`);
  console.log(`   Coupons:     ${migratedCoupons}`);
  console.log(`   Redemptions: ${migratedRedemptions}`);
  if (errors > 0) {
    console.log(`   ⚠️  Errors:    ${errors}`);
  }
  console.log("─".repeat(50));
}

main().catch((err) => {
  console.error("💥 Migration failed:", err);
  process.exit(1);
});

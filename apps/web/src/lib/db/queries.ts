/**
 * Data access layer — all Postgres queries.
 *
 * These functions replace the old KV-based purchase/progress/coupon
 * functions. They keep the same names and return shapes so the API
 * routes need minimal changes (just swap the import path).
 *
 * Redis is still used for sessions and rate limiting (see kv.ts).
 */

import { eq, and, gt } from "drizzle-orm";
import { db, users, purchases, progress, coupons, couponRedemptions } from "./index";

// ── User helpers ─────────────────────────────────────────

/**
 * Find or create a user by email. Returns the user's id.
 * Uses INSERT ... ON CONFLICT DO NOTHING for atomicity.
 */
export async function getOrCreateUser(email: string): Promise<number> {
  const normalized = email.trim().toLowerCase();

  // Try to insert; if already exists, do nothing
  await db.insert(users)
    .values({ email: normalized })
    .onConflictDoNothing({ target: users.email });

  // Now SELECT — guaranteed to exist
  const rows = await db.select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalized));

  return rows[0]!.id;
}

/**
 * Update the last_login timestamp for a user.
 */
export async function updateLastLogin(email: string): Promise<void> {
  await db.update(users)
    .set({ lastLogin: new Date() })
    .where(eq(users.email, email.trim().toLowerCase()));
}

// ── Purchase helpers ─────────────────────────────────────

/**
 * Check if a user has an active (non-expired) purchase.
 * Same name as the old KV version for easy migration.
 */
export async function hasPurchase(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();

  const result = await db.select({ id: purchases.id })
    .from(purchases)
    .innerJoin(users, eq(purchases.userId, users.id))
    .where(
      and(
        eq(users.email, normalized),
        gt(purchases.expiresAt, new Date()) // not expired
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Store a new purchase. Creates the user if they don't exist yet.
 * Accepts the same fields as the old KV PurchaseRecord.
 */
export async function storePurchase(record: {
  email: string;
  orderId: string;
  productId: string;
  source?: string;
  createdAt?: string; // ISO string (for backwards compat)
  expiresAt: string;  // ISO string
}): Promise<void> {
  const userId = await getOrCreateUser(record.email);

  await db.insert(purchases).values({
    userId,
    orderId: record.orderId,
    productId: record.productId,
    source: record.source ?? "lemon-squeezy",
    expiresAt: new Date(record.expiresAt),
  });
}

// ── Progress helpers ─────────────────────────────────────

export interface ProgressRecord {
  viewed: number[];
  completed: number[];
}

/**
 * Get a user's progress for a course.
 * Returns { viewed: number[], completed: number[] } — same shape
 * as the old KV version, so the frontend doesn't need to change.
 */
export async function getProgress(
  email: string,
  courseId: string
): Promise<ProgressRecord> {
  const normalized = email.trim().toLowerCase();

  const rows = await db.select({
    unitId: progress.unitId,
    status: progress.status,
  })
    .from(progress)
    .innerJoin(users, eq(progress.userId, users.id))
    .where(
      and(
        eq(users.email, normalized),
        eq(progress.courseId, courseId)
      )
    );

  const viewed: number[] = [];
  const completed: number[] = [];

  for (const row of rows) {
    viewed.push(row.unitId);
    if (row.status === "completed") {
      completed.push(row.unitId);
    }
  }

  return { viewed, completed };
}

/**
 * Mark a unit as viewed. Safe to call multiple times (UPSERT).
 * Won't downgrade a "completed" status to "viewed".
 */
export async function markViewed(
  email: string,
  courseId: string,
  unitId: number
): Promise<void> {
  const userId = await getOrCreateUser(email);

  await db.insert(progress)
    .values({ userId, courseId, unitId, status: "viewed" })
    .onConflictDoUpdate({
      target: [progress.userId, progress.courseId, progress.unitId],
      // Only update timestamp, don't change status (preserves "completed")
      set: { updatedAt: new Date() },
    });
}

/**
 * Mark a unit as completed (also counts as viewed).
 */
export async function markCompleted(
  email: string,
  courseId: string,
  unitId: number
): Promise<void> {
  const userId = await getOrCreateUser(email);

  await db.insert(progress)
    .values({ userId, courseId, unitId, status: "completed" })
    .onConflictDoUpdate({
      target: [progress.userId, progress.courseId, progress.unitId],
      set: { status: "completed", updatedAt: new Date() },
    });
}

/**
 * Unmark a unit as completed (reverts to "viewed").
 */
export async function unmarkCompleted(
  email: string,
  courseId: string,
  unitId: number
): Promise<void> {
  const normalized = email.trim().toLowerCase();

  const userRows = await db.select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalized));

  if (userRows.length === 0) return; // no user = nothing to undo

  await db.update(progress)
    .set({ status: "viewed", updatedAt: new Date() })
    .where(
      and(
        eq(progress.userId, userRows[0]!.id),
        eq(progress.courseId, courseId),
        eq(progress.unitId, unitId)
      )
    );
}

// ── Coupon helpers ───────────────────────────────────────

export interface CouponRecord {
  code: string;
  maxUses: number;
  uses: number;
  redeemedBy: string[];
  expiresAt: string; // ISO string or ""
  createdAt: string;
  createdBy: string;
}

/**
 * Get a coupon by code, including redemption count and emails.
 */
export async function getCoupon(code: string): Promise<CouponRecord | null> {
  const normalized = code.trim().toUpperCase();

  const couponRows = await db.select()
    .from(coupons)
    .where(eq(coupons.code, normalized));

  if (couponRows.length === 0) return null;
  const coupon = couponRows[0]!;

  // Get redemption emails
  const redemptions = await db.select({ email: users.email })
    .from(couponRedemptions)
    .innerJoin(users, eq(couponRedemptions.userId, users.id))
    .where(eq(couponRedemptions.couponId, coupon.id));

  return {
    code: coupon.code,
    maxUses: coupon.maxUses ?? 0,
    uses: redemptions.length,
    redeemedBy: redemptions.map((r) => r.email),
    expiresAt: coupon.expiresAt?.toISOString() ?? "",
    createdAt: coupon.createdAt?.toISOString() ?? "",
    createdBy: coupon.createdBy,
  };
}

/**
 * Create a new coupon.
 */
export async function createCoupon(record: {
  code: string;
  maxUses: number;
  expiresAt?: string;
  createdBy: string;
}): Promise<void> {
  await db.insert(coupons).values({
    code: record.code.trim().toUpperCase(),
    maxUses: record.maxUses,
    expiresAt: record.expiresAt ? new Date(record.expiresAt) : null,
    createdBy: record.createdBy,
  });
}

/**
 * Record a coupon redemption and return updated coupon stats.
 * Replaces the old KV incrementCouponUses().
 */
export async function incrementCouponUses(
  code: string,
  email?: string
): Promise<CouponRecord | null> {
  if (!email) return getCoupon(code);

  const normalized = code.trim().toUpperCase();

  const couponRows = await db.select()
    .from(coupons)
    .where(eq(coupons.code, normalized));

  if (couponRows.length === 0) return null;

  const userId = await getOrCreateUser(email);

  // Insert redemption (unique constraint prevents double-use)
  await db.insert(couponRedemptions)
    .values({ couponId: couponRows[0]!.id, userId })
    .onConflictDoNothing();

  return getCoupon(code);
}

/**
 * List all coupons with their stats. Used by admin panel.
 * Replaces the old KV scan+mget approach.
 */
export async function listAllCoupons(): Promise<CouponRecord[]> {
  const allCoupons = await db.select().from(coupons);

  const result: CouponRecord[] = [];
  for (const coupon of allCoupons) {
    const redemptions = await db.select({ email: users.email })
      .from(couponRedemptions)
      .innerJoin(users, eq(couponRedemptions.userId, users.id))
      .where(eq(couponRedemptions.couponId, coupon.id));

    result.push({
      code: coupon.code,
      maxUses: coupon.maxUses ?? 0,
      uses: redemptions.length,
      redeemedBy: redemptions.map((r) => r.email),
      expiresAt: coupon.expiresAt?.toISOString() ?? "",
      createdAt: coupon.createdAt?.toISOString() ?? "",
      createdBy: coupon.createdBy,
    });
  }

  return result;
}

import { kv } from "@vercel/kv";

export interface PurchaseRecord {
  email: string;
  orderId: string;
  productId: string;
  createdAt: string;
  expiresAt: string;
}

/** ~6 months in seconds */
const SEMESTER_TTL = 180 * 24 * 60 * 60;

export async function storePurchase(record: PurchaseRecord): Promise<void> {
  await kv.set(`purchase:${record.email}`, record, { ex: SEMESTER_TTL });
}

export async function getPurchase(
  email: string
): Promise<PurchaseRecord | null> {
  return kv.get<PurchaseRecord>(`purchase:${email}`);
}

export async function hasPurchase(email: string): Promise<boolean> {
  return (await kv.exists(`purchase:${email}`)) === 1;
}

/* ── Session management (single-device enforcement) ─────────── */

/**
 * Store the latest session timestamp for an email.
 * Only the most recent session is considered valid.
 */
export async function storeSession(email: string, iat: number): Promise<void> {
  await kv.set(`session:${email.toLowerCase()}`, iat, { ex: SEMESTER_TTL });
}

/**
 * Check if a session timestamp matches the latest stored one.
 * Returns true if it matches (valid session) or if no session is stored.
 */
export async function isLatestSession(email: string, iat: number): Promise<boolean> {
  const stored = await kv.get<number>(`session:${email.toLowerCase()}`);
  if (stored === null) return true; // no record = allow (backwards compat)
  return stored === iat;
}

/* ── Coupon management ──────────────────────────────────── */

export interface CouponRecord {
  code: string;
  maxUses: number; // 0 = unlimited
  uses: number;
  redeemedBy: string[]; // emails that redeemed this coupon
  expiresAt: string; // ISO string or "" for no expiry
  createdAt: string;
  createdBy: string;
}

function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

export async function getCoupon(code: string): Promise<CouponRecord | null> {
  return kv.get<CouponRecord>(`coupon:${normalizeCouponCode(code)}`);
}

export async function createCoupon(record: CouponRecord): Promise<void> {
  const key = `coupon:${normalizeCouponCode(record.code)}`;
  if (record.expiresAt) {
    const ttl = Math.floor((new Date(record.expiresAt).getTime() - Date.now()) / 1000);
    if (ttl > 0) {
      await kv.set(key, record, { ex: ttl });
    }
  } else {
    await kv.set(key, record);
  }
}

export async function incrementCouponUses(code: string, email?: string): Promise<CouponRecord | null> {
  const key = `coupon:${normalizeCouponCode(code)}`;
  const record = await kv.get<CouponRecord>(key);
  if (!record) return null;
  record.uses += 1;
  if (email) {
    record.redeemedBy = record.redeemedBy || [];
    record.redeemedBy.push(email.toLowerCase());
  }
  if (record.expiresAt) {
    const ttl = Math.floor((new Date(record.expiresAt).getTime() - Date.now()) / 1000);
    if (ttl > 0) await kv.set(key, record, { ex: ttl });
  } else {
    await kv.set(key, record);
  }
  return record;
}

import { NextRequest, NextResponse } from "next/server";
import { getPayloadFromRequest, isAdmin } from "@/lib/auth";
import { kv } from "@vercel/kv";
import type { CouponRecord } from "@/lib/kv";

/**
 * GET /api/admin/coupons
 * Admin-only. List all coupons.
 *
 * From browser console while logged in:
 *   fetch('/api/admin/coupons').then(r => r.json()).then(console.log)
 */
export async function GET(request: NextRequest) {
  const payload = getPayloadFromRequest(request);
  if (!payload || !isAdmin(payload.email)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const keys: string[] = [];
    const result = await kv.scan(0, { match: "coupon:*", count: 1000 });
    keys.push(...(result[1] as string[]));

    if (keys.length === 0) {
      return NextResponse.json({ coupons: [] });
    }

    const values = await kv.mget<CouponRecord[]>(...keys);
    const coupons = values
      .filter((v): v is CouponRecord => v !== null)
      .sort((a, b) => a.code.localeCompare(b.code));

    return NextResponse.json({ coupons });
  } catch (err) {
    console.error("list-coupons error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

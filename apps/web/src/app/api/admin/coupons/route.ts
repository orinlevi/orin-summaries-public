import { NextRequest, NextResponse } from "next/server";
import { getPayloadFromRequest, isAdmin } from "@/lib/auth";

/**
 * GET /api/admin/coupons
 * Admin-only. List all coupons from Postgres.
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
    const { listAllCoupons } = await import("@/lib/db/queries");
    const coupons = await listAllCoupons();
    return NextResponse.json({ coupons });
  } catch (err) {
    console.error("list-coupons error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

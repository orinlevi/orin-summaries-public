import { NextRequest, NextResponse } from "next/server";
import { getPayloadFromRequest, isAdmin } from "@/lib/auth";

/**
 * POST /api/admin/create-coupon
 * Body: { "code": "FRIEND2025", "maxUses": 5, "expiresAt": "2026-12-31T23:59:59Z" }
 *
 * Admin-only. Create from browser console while logged in:
 *   fetch('/api/admin/create-coupon', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ code: 'MYCODE', maxUses: 10 })
 *   }).then(r => r.json()).then(console.log)
 */
export async function POST(request: NextRequest) {
  const payload = getPayloadFromRequest(request);
  if (!payload || !isAdmin(payload.email)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const code: string | undefined = body?.code?.trim();

    if (!code || code.length < 3) {
      return NextResponse.json({ error: "code must be at least 3 characters" }, { status: 400 });
    }

    const maxUses: number = typeof body?.maxUses === "number" ? body.maxUses : 0;
    const expiresAt: string = body?.expiresAt || "";

    const { createCoupon, getCoupon } = await import("@/lib/kv");

    const existing = await getCoupon(code);
    if (existing) {
      return NextResponse.json({ error: "coupon_exists", coupon: existing }, { status: 409 });
    }

    await createCoupon({
      code: code.toUpperCase(),
      maxUses,
      uses: 0,
      redeemedBy: [],
      expiresAt,
      createdAt: new Date().toISOString(),
      createdBy: payload.email,
    });

    return NextResponse.json({
      ok: true,
      coupon: { code: code.toUpperCase(), maxUses, expiresAt: expiresAt || "never" },
    });
  } catch (err) {
    console.error("create-coupon error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

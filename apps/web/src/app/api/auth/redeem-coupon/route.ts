import { NextRequest, NextResponse } from "next/server";
import { signToken, verifyToken, COOKIE_NAME, SEMESTER_MAX_AGE } from "@/lib/auth";

/**
 * POST /api/auth/redeem-coupon
 * Body: { "code": "COUPONCODE", "email": "friend@example.com" }
 *
 * Validates coupon, creates a purchase record, and signs the user in.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const code: string | undefined = body?.code?.trim();
    const email: string | undefined = body?.email?.trim().toLowerCase();

    if (!code || !email) {
      return NextResponse.json({ error: "missing code or email" }, { status: 400 });
    }

    const { getCoupon, incrementCouponUses, storePurchase, storeSession } =
      await import("@/lib/kv");

    const coupon = await getCoupon(code);
    if (!coupon) {
      return NextResponse.json({ error: "invalid_coupon" }, { status: 404 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "coupon_expired" }, { status: 410 });
    }

    if (coupon.maxUses > 0 && coupon.uses >= coupon.maxUses) {
      return NextResponse.json({ error: "coupon_exhausted" }, { status: 410 });
    }

    await incrementCouponUses(code, email);

    // Create purchase record so the user can log in normally in the future
    await storePurchase({
      email,
      orderId: `coupon:${code.toUpperCase()}`,
      productId: "coupon",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SEMESTER_MAX_AGE * 1000).toISOString(),
    });

    // Sign in immediately
    const token = signToken(email);
    const response = NextResponse.json({ ok: true });

    try {
      const payload = verifyToken(token);
      if (payload) await storeSession(email, payload.iat);
    } catch {
      // KV session tracking unavailable
    }

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SEMESTER_MAX_AGE,
    });

    return response;
  } catch (err) {
    console.error("redeem-coupon error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

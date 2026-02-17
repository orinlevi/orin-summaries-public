import { NextRequest, NextResponse } from "next/server";
import { signToken, verifyToken, COOKIE_NAME, SEMESTER_MAX_AGE } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/auth/redeem-coupon
 * Body: { "code": "COUPONCODE", "email": "friend@example.com" }
 *
 * Validates coupon (Postgres), creates a purchase record (Postgres),
 * stores session (Redis), and signs the user in.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per minute (prevent brute-force on coupons)
    const limited = await rateLimit(request, { limit: 5, windowMs: 60_000 });
    if (limited) return limited;

    const body = await request.json().catch(() => null);
    const code: string | undefined = body?.code?.trim();
    const email: string | undefined = body?.email?.trim().toLowerCase();

    if (!code || !email) {
      return NextResponse.json({ error: "missing code or email" }, { status: 400 });
    }

    // Input validation
    if (code.length > 30 || !/^[A-Za-z0-9-]+$/.test(code)) {
      return NextResponse.json({ error: "invalid code format" }, { status: 400 });
    }
    if (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid email format" }, { status: 400 });
    }

    // Coupon + purchase operations from Postgres
    const { getCoupon, incrementCouponUses, storePurchase } =
      await import("@/lib/db/queries");

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
      source: "coupon",
      expiresAt: new Date(Date.now() + SEMESTER_MAX_AGE * 1000).toISOString(),
    });

    // Sign in immediately
    const token = signToken(email);
    const response = NextResponse.json({ ok: true });

    // Session in Redis for single-device enforcement
    try {
      const payload = verifyToken(token);
      if (payload) {
        const { storeSession } = await import("@/lib/kv");
        await storeSession(email, payload.iat);
      }
    } catch {
      // Redis session tracking unavailable
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

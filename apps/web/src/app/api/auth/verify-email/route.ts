import { NextRequest, NextResponse } from "next/server";
import { signToken, verifyToken, COOKIE_NAME, SEMESTER_MAX_AGE, hasPrivilegedAccess } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/auth/verify-email
 * Body: { "email": "user@example.com" }
 *
 * Admins & allowed emails always get access.
 * Other users need a purchase record in Postgres.
 * Each login invalidates previous sessions (single-device enforcement via Redis).
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 attempts per minute (prevent email enumeration)
    const limited = await rateLimit(request, { limit: 10, windowMs: 60_000 });
    if (limited) return limited;

    const body = await request.json().catch(() => null);
    const email: string | undefined = body?.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "missing email" }, { status: 400 });
    }

    // Admins and allowed emails always get in
    if (!hasPrivilegedAccess(email)) {
      try {
        const { hasPurchase } = await import("@/lib/db/queries");
        const purchased = await hasPurchase(email);
        if (!purchased) {
          return NextResponse.json(
            { error: "purchase_not_found" },
            { status: 404 }
          );
        }
      } catch {
        // DB not configured – non-admins cannot be verified
        return NextResponse.json(
          { error: "purchase_not_found" },
          { status: 404 }
        );
      }
    }

    const token = signToken(email);
    const response = NextResponse.json({ ok: true });

    // Store latest session in Redis so previous sessions are invalidated
    try {
      const payload = verifyToken(token);
      if (payload) {
        const { storeSession } = await import("@/lib/kv");
        await storeSession(email, payload.iat);
      }
    } catch {
      // Redis not available – skip session tracking (still allow login)
    }

    // Update last login timestamp in Postgres
    try {
      const { updateLastLogin } = await import("@/lib/db/queries");
      await updateLastLogin(email);
    } catch {
      // Non-critical – don't block login
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
    console.error("verify-email error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

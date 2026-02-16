import { NextRequest, NextResponse } from "next/server";
import { signToken, verifyToken, COOKIE_NAME, SEMESTER_MAX_AGE, hasPrivilegedAccess } from "@/lib/auth";

/**
 * POST /api/auth/verify-email
 * Body: { "email": "user@example.com" }
 *
 * Admins & allowed emails always get access.
 * Other users need a purchase record in KV.
 * Each login invalidates previous sessions (single-device enforcement).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const email: string | undefined = body?.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "missing email" }, { status: 400 });
    }

    // Admins and allowed emails always get in
    if (!hasPrivilegedAccess(email)) {
      try {
        // Lazy-import KV only when needed (avoids crash if KV env vars are missing)
        const { hasPurchase } = await import("@/lib/kv");
        const purchased = await hasPurchase(email);
        if (!purchased) {
          return NextResponse.json(
            { error: "purchase_not_found" },
            { status: 404 }
          );
        }
      } catch {
        // KV not configured – non-admins cannot be verified
        return NextResponse.json(
          { error: "purchase_not_found" },
          { status: 404 }
        );
      }
    }

    const token = signToken(email);
    const response = NextResponse.json({ ok: true });

    // Store latest session in KV so previous sessions are invalidated
    try {
      const payload = verifyToken(token);
      if (payload) {
        const { storeSession } = await import("@/lib/kv");
        await storeSession(email, payload.iat);
      }
    } catch {
      // KV not available – skip session tracking (still allow login)
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

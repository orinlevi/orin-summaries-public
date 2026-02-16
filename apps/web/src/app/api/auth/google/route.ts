import { NextRequest, NextResponse } from "next/server";
import { signToken, verifyToken, COOKIE_NAME, SEMESTER_MAX_AGE, hasPrivilegedAccess } from "@/lib/auth";

/**
 * Verify a Google ID token using Google's tokeninfo endpoint.
 * Returns the verified email or null.
 */
async function verifyGoogleToken(idToken: string): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error("GOOGLE_CLIENT_ID not configured");
    return null;
  }

  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );
    if (!res.ok) return null;

    const data = await res.json();

    // Verify token was issued for our app
    if (data.aud !== clientId) return null;

    // Verify not expired
    const exp = parseInt(data.exp, 10);
    if (isNaN(exp) || exp < Date.now() / 1000) return null;

    // Verify email is present and verified
    if (!data.email || data.email_verified !== "true") return null;

    return data.email as string;
  } catch {
    return null;
  }
}

/**
 * POST /api/auth/google
 * Body: { "credential": "<google-id-token>" }
 *
 * Verifies Google ID token, checks purchase/admin status, sets cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const credential: string | undefined = body?.credential;

    if (!credential) {
      return NextResponse.json({ error: "missing credential" }, { status: 400 });
    }

    const email = await verifyGoogleToken(credential);
    if (!email) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check access: admin/allowed skip KV, others need purchase
    if (!hasPrivilegedAccess(normalizedEmail)) {
      try {
        const { hasPurchase } = await import("@/lib/kv");
        const purchased = await hasPurchase(normalizedEmail);
        if (!purchased) {
          return NextResponse.json({ error: "purchase_not_found" }, { status: 404 });
        }
      } catch {
        return NextResponse.json({ error: "purchase_not_found" }, { status: 404 });
      }
    }

    const token = signToken(normalizedEmail);
    const response = NextResponse.json({ ok: true });

    // Store session for single-device enforcement
    try {
      const payload = verifyToken(token);
      if (payload) {
        const { storeSession } = await import("@/lib/kv");
        await storeSession(normalizedEmail, payload.iat);
      }
    } catch {
      // KV unavailable
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
    console.error("google auth error:", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

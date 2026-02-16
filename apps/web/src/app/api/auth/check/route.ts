import { NextRequest, NextResponse } from "next/server";
import { getPayloadFromRequest, hasPrivilegedAccess, isAdmin } from "@/lib/auth";

/**
 * GET /api/auth/check — cookie verification with session validation.
 * Privileged users (admin/allowed) skip session check.
 * Regular users are verified against KV to enforce single-device sessions.
 */
export async function GET(request: NextRequest) {
  const payload = getPayloadFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userIsAdmin = isAdmin(payload.email);

  // Admins and allowed emails skip session check
  if (hasPrivilegedAccess(payload.email)) {
    return NextResponse.json({ ok: true, admin: userIsAdmin });
  }

  // For regular users, verify this is the latest session
  try {
    const { isLatestSession } = await import("@/lib/kv");
    const valid = await isLatestSession(payload.email, payload.iat);
    if (!valid) {
      return NextResponse.json(
        { error: "session_expired" },
        { status: 401 }
      );
    }
  } catch {
    // KV unavailable – allow access (graceful degradation)
  }

  return NextResponse.json({ ok: true, admin: false });
}

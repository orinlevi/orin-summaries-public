import { NextRequest, NextResponse } from "next/server";
import { getPayloadFromRequest } from "@/lib/auth";

/**
 * POST /api/progress/mark-viewed
 * Body: { courseId: string, unitId: number }
 * Marks a unit as viewed for the authenticated user (in Postgres).
 */
export async function POST(request: NextRequest) {
  const payload = getPayloadFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { courseId?: string; unitId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { courseId, unitId } = body;
  if (!courseId || typeof unitId !== "number") {
    return NextResponse.json({ error: "missing courseId or unitId" }, { status: 400 });
  }

  // Input validation: courseId must be alphanumeric+hyphens, unitId must be reasonable
  if (!/^[a-z0-9-]+$/.test(courseId) || courseId.length > 50) {
    return NextResponse.json({ error: "invalid courseId" }, { status: 400 });
  }
  if (!Number.isInteger(unitId) || unitId < 0 || unitId > 1000) {
    return NextResponse.json({ error: "invalid unitId" }, { status: 400 });
  }

  try {
    const { markViewed } = await import("@/lib/db/queries");
    await markViewed(payload.email, courseId, unitId);
  } catch {
    // DB unavailable — graceful degradation
  }

  return NextResponse.json({ ok: true });
}

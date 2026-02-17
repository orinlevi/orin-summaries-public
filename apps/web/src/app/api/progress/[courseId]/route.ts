import { NextRequest, NextResponse } from "next/server";
import { getPayloadFromRequest } from "@/lib/auth";

interface Props {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/progress/:courseId
 * Returns the user's progress for a specific course (from Postgres).
 */
export async function GET(request: NextRequest, { params }: Props) {
  const payload = getPayloadFromRequest(request);
  if (!payload) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { courseId } = await params;

  try {
    const { getProgress } = await import("@/lib/db/queries");
    const progress = await getProgress(payload.email, courseId);
    return NextResponse.json(progress);
  } catch {
    // DB unavailable — return empty progress
    return NextResponse.json({ viewed: [], completed: [] });
  }
}

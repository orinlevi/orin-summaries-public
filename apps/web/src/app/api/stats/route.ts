import { kv } from "@vercel/kv";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

const KEY = "stats:visits";
const COOKIE_NAME = "visited";
const ONE_DAY = 60 * 60 * 24;
const PROD_HOST = "orin-summaries.vercel.app";

/**
 * POST /api/stats — increment if not visited today (cookie-based daily unique).
 * Only counts visits from the production domain to avoid inflating from
 * preview deployments, localhost, and other non-production hosts.
 * GET  /api/stats — return current count without incrementing.
 */
export async function POST() {
  try {
    const headerStore = await headers();
    const host = headerStore.get("host") || "";

    // Only count visits from production domain
    if (host !== PROD_HOST) {
      const count = (await kv.get<number>(KEY)) ?? 0;
      return NextResponse.json({ count });
    }

    const cookieStore = await cookies();
    const alreadyVisited = cookieStore.get(COOKIE_NAME);

    if (alreadyVisited) {
      // Already counted today — just return current count
      const count = (await kv.get<number>(KEY)) ?? 0;
      return NextResponse.json({ count });
    }

    const count = await kv.incr(KEY);
    const res = NextResponse.json({ count });
    res.cookies.set(COOKIE_NAME, "1", {
      maxAge: ONE_DAY,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ count: null }, { status: 500 });
  }
}

export async function GET() {
  try {
    const count = (await kv.get<number>(KEY)) ?? 0;
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: null }, { status: 500 });
  }
}

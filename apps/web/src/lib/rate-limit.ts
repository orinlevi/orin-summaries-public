import { NextRequest, NextResponse } from "next/server";

/**
 * Simple sliding-window rate limiter using Vercel KV.
 * Falls back to allowing the request if KV is unavailable.
 */
export async function rateLimit(
  req: NextRequest,
  { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): Promise<NextResponse | null> {
  try {
    const { kv } = await import("@vercel/kv");

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const key = `rl:${ip}:${req.nextUrl.pathname}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Use a sorted set: score = timestamp, member = unique request id
    const pipeline = kv.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart); // remove old entries
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    pipeline.zcard(key);
    pipeline.expire(key, Math.ceil(windowMs / 1000));

    const results = await pipeline.exec();
    const count = (results?.[2] as number) ?? 0;

    if (count > limit) {
      return NextResponse.json(
        { error: "too_many_requests" },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) },
        }
      );
    }

    return null; // allowed
  } catch {
    // KV unavailable — fail open (allow request)
    return null;
  }
}

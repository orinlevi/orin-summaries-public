import { NextResponse } from "next/server";
import crypto from "crypto";
import { storePurchase } from "@/lib/db/queries";

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "";

/**
 * POST /api/webhooks/lemonsqueezy
 *
 * Receives Lemon Squeezy webhook events.
 * Verifies HMAC-SHA256 signature, then stores the purchase in Postgres.
 */
export async function POST(request: Request) {
  /* ── read raw body for signature verification ────────────── */
  const rawBody = await request.text();

  /* ── verify signature ────────────────────────────────────── */
  const signature = request.headers.get("x-signature") || "";

  if (!WEBHOOK_SECRET) {
    console.error("LEMONSQUEEZY_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    console.error("Webhook signature mismatch");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  /* ── parse and handle event ──────────────────────────────── */
  const body = JSON.parse(rawBody);
  const eventName: string = body.meta?.event_name;

  if (eventName !== "order_created") {
    // Acknowledge events we don't handle
    return NextResponse.json({ ok: true });
  }

  const attrs = body.data?.attributes;
  const email: string | undefined = attrs?.user_email;
  const orderId: string = String(body.data?.id ?? "");
  const productId: string = String(
    body.data?.relationships?.["order-items"]?.data?.[0]?.id ?? ""
  );

  if (!email) {
    console.error("Webhook: no email in order payload");
    return NextResponse.json({ error: "no email" }, { status: 400 });
  }

  try {
    await storePurchase({
      email,
      orderId,
      productId,
      source: "lemon-squeezy",
      expiresAt: new Date(
        Date.now() + 180 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  } catch (err) {
    console.error("Failed to store purchase in Postgres:", err);
    return NextResponse.json({ error: "storage failed" }, { status: 500 });
  }

  console.log(`Purchase stored for ${email} (order ${orderId})`);

  return NextResponse.json({ ok: true });
}

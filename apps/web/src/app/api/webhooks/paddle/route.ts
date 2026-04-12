import { NextResponse } from "next/server";
import crypto from "crypto";
import { storePurchase } from "@/lib/db/queries";

const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET || "";

/**
 * POST /api/webhooks/paddle
 *
 * Receives Paddle Billing webhook events.
 * Verifies HMAC-SHA256 signature (ts:body format), then stores the purchase.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("Paddle-Signature") || "";

  if (!WEBHOOK_SECRET) {
    console.error("PADDLE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  /* ── verify signature ────────────────────────────────────── */
  if (!verifyPaddleSignature(rawBody, signatureHeader, WEBHOOK_SECRET)) {
    console.error("Paddle webhook signature mismatch");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  /* ── parse and handle event ──────────────────────────────── */
  const event = JSON.parse(rawBody);
  const eventType: string = event.event_type;

  if (eventType !== "transaction.completed") {
    return NextResponse.json({ ok: true });
  }

  const transactionId: string = event.data?.id || "";
  const customerEmail: string =
    event.data?.customer?.email ||
    event.data?.custom_data?.email ||
    "";
  const priceId: string = event.data?.items?.[0]?.price?.id || "";

  if (!customerEmail) {
    console.error("Paddle webhook: no email in transaction payload");
    return NextResponse.json({ error: "no email" }, { status: 400 });
  }

  try {
    await storePurchase({
      email: customerEmail,
      orderId: transactionId,
      productId: priceId,
      source: "paddle",
      expiresAt: new Date(
        Date.now() + 180 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  } catch (err) {
    console.error("Failed to store purchase in Postgres:", err);
    return NextResponse.json({ error: "storage failed" }, { status: 500 });
  }

  console.log(`Purchase stored for ${customerEmail} (txn ${transactionId})`);
  return NextResponse.json({ ok: true });
}

function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  const match = signatureHeader.match(/^ts=(\d+);h1=(.+)$/);
  if (!match) return false;

  const [, timestamp, signature] = match;
  const signedPayload = `${timestamp}:${rawBody}`;

  const computed = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computed)
    );
  } catch {
    return false;
  }
}

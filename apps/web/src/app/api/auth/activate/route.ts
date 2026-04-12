import { NextRequest, NextResponse } from "next/server";
import { signToken, COOKIE_NAME, SEMESTER_MAX_AGE } from "@/lib/auth";
import { storePurchase, hasPurchase } from "@/lib/db/queries";
import { rateLimit } from "@/lib/rate-limit";

const PADDLE_API_KEY = process.env.PADDLE_API_KEY || "";
const PADDLE_ENV = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || "production";

const PADDLE_API_BASE =
  PADDLE_ENV === "sandbox"
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";

/**
 * GET /api/auth/activate?txn_id=<paddle-transaction-id>
 *
 * Called after a successful Paddle checkout.
 * Verifies the transaction via Paddle API, stores the purchase in Postgres,
 * sets a signed cookie, then redirects to the homepage.
 */
export async function GET(request: NextRequest) {
  const limited = await rateLimit(request, { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const txnId = request.nextUrl.searchParams.get("txn_id");

  if (!txnId || !/^txn_/.test(txnId)) {
    return NextResponse.json(
      { error: "missing or invalid txn_id" },
      { status: 400 }
    );
  }

  /* ── verify transaction with Paddle API ──────────────────── */
  const res = await fetch(`${PADDLE_API_BASE}/transactions/${txnId}`, {
    headers: {
      Authorization: `Bearer ${PADDLE_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    console.error(`Paddle API error: ${res.status} for txn ${txnId}`);
    return NextResponse.json(
      { error: "transaction not found" },
      { status: 404 }
    );
  }

  const json = await res.json();
  const txnData = json.data;
  const email: string | undefined =
    txnData?.customer?.email || txnData?.custom_data?.email;
  const status: string | undefined = txnData?.status;

  if (!email || status !== "completed") {
    return NextResponse.json(
      { error: "transaction not completed or no email" },
      { status: 400 }
    );
  }

  /* ── store purchase in Postgres if webhook hasn't already ── */
  if (!(await hasPurchase(email))) {
    await storePurchase({
      email,
      orderId: txnId,
      productId: txnData?.items?.[0]?.price?.id || "",
      source: "paddle",
      expiresAt: new Date(
        Date.now() + 180 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  }

  /* ── set access cookie and redirect ──────────────────────── */
  const token = signToken(email);
  const response = NextResponse.redirect(
    new URL("/?activated=1", request.url)
  );

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEMESTER_MAX_AGE,
  });

  return response;
}

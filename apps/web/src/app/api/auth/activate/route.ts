import { NextRequest, NextResponse } from "next/server";
import { signToken, COOKIE_NAME, SEMESTER_MAX_AGE } from "@/lib/auth";
import { storePurchase, hasPurchase } from "@/lib/kv";

const LS_API_KEY = process.env.LEMONSQUEEZY_API_KEY || "";

/**
 * GET /api/auth/activate?order_id=<lemon-squeezy-order-id>
 *
 * Called after a successful Lemon Squeezy checkout.
 * Verifies the order via LS API, stores the purchase, sets a signed cookie,
 * then redirects to the homepage.
 */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json(
      { error: "missing order_id" },
      { status: 400 }
    );
  }

  /* ── verify order with Lemon Squeezy API ─────────────────── */
  const res = await fetch(
    `https://api.lemonsqueezy.com/v1/orders/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${LS_API_KEY}`,
        Accept: "application/vnd.api+json",
      },
    }
  );

  if (!res.ok) {
    console.error(`LS API error: ${res.status} for order ${orderId}`);
    return NextResponse.json(
      { error: "order not found" },
      { status: 404 }
    );
  }

  const json = await res.json();
  const attrs = json.data?.attributes;
  const email: string | undefined = attrs?.user_email;
  const status: string | undefined = attrs?.status;

  if (!email || status !== "paid") {
    return NextResponse.json(
      { error: "order not paid or no email" },
      { status: 400 }
    );
  }

  /* ── store purchase if webhook hasn't already ────────────── */
  if (!(await hasPurchase(email))) {
    await storePurchase({
      email,
      orderId,
      productId: String(
        json.data?.relationships?.["order-items"]?.data?.[0]?.id ?? ""
      ),
      createdAt: new Date().toISOString(),
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

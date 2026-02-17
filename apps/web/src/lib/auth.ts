import { cookies } from "next/headers";
import crypto from "crypto";

function getCookieSecret(): string {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) {
    throw new Error("COOKIE_SECRET environment variable is required");
  }
  return secret;
}
const COOKIE_NAME = "access_token";

/** Emails that always have access (site owner). Must be set via ADMIN_EMAILS env var. */
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
);
if (ADMIN_EMAILS.size === 0) {
  console.warn("WARNING: ADMIN_EMAILS not set — no admin users configured");
}

/**
 * Emails that get free access (friends, testers, etc).
 * Set ALLOWED_EMAILS env var as comma-separated list, or add here directly.
 */
const ALLOWED_EMAILS = new Set(
  (process.env.ALLOWED_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
);

/** Seconds until cookie expires (~6 months) */
export const SEMESTER_MAX_AGE = 180 * 24 * 60 * 60;

interface AccessPayload {
  email: string;
  exp: number; // Unix timestamp (seconds)
  iat: number; // Issued at (seconds) — used for session invalidation
}

/** Sign a payload into a token: base64url(json).base64url(hmac) */
export function signToken(email: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AccessPayload = {
    email,
    exp: now + SEMESTER_MAX_AGE,
    iat: now,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getCookieSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

/** Verify and decode a signed token. Returns null if invalid or expired. */
export function verifyToken(token: string): AccessPayload | null {
  // Reject absurdly long tokens early (prevent DoS)
  if (!token || token.length > 1024) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = crypto
    .createHmac("sha256", getCookieSecret())
    .update(data!)
    .digest("base64url");
  // Timing-safe comparison to prevent timing attacks
  if (sig!.length !== expected.length) return null;
  const sigBuf = Buffer.from(sig!, "utf8");
  const expBuf = Buffer.from(expected, "utf8");
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const payload: AccessPayload = JSON.parse(
      Buffer.from(data!, "base64url").toString()
    );
    if (payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Check access in server components (reads the cookie jar). */
export async function hasAccess(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    return verifyToken(token) !== null;
  } catch {
    // cookies() can throw during static generation
    return false;
  }
}

/** Check if an email has admin (permanent) access. */
export function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.has(email.toLowerCase());
}

/** Check if an email has free access (friends list). */
export function isAllowed(email: string): boolean {
  return ALLOWED_EMAILS.has(email.toLowerCase());
}

/** Check if an email has any kind of privileged access (admin or allowed). */
export function hasPrivilegedAccess(email: string): boolean {
  return isAdmin(email) || isAllowed(email);
}

/** Extract and verify the access payload from a Request's cookies. */
export function getPayloadFromRequest(request: Request): AccessPayload | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifyToken(match[1]!);
}

/** Check access in API route handlers (reads from Request headers).
 *  Signature kept identical to the old placeholder so download route works. */
export function isAuthorized(request: Request): boolean {
  return getPayloadFromRequest(request) !== null;
}

export { COOKIE_NAME };

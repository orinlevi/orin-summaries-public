import { kv } from "@vercel/kv";

/** ~6 months in seconds */
const SESSION_TTL = 180 * 24 * 60 * 60;

/* ── Session management (single-device enforcement) ─────────── */

/**
 * Store the latest session timestamp for an email.
 * Only the most recent session is considered valid.
 */
export async function storeSession(email: string, iat: number): Promise<void> {
  await kv.set(`session:${email.toLowerCase()}`, iat, { ex: SESSION_TTL });
}

/**
 * Check if a session timestamp matches the latest stored one.
 * Returns true if it matches (valid session) or if no session is stored.
 */
export async function isLatestSession(email: string, iat: number): Promise<boolean> {
  const stored = await kv.get<number>(`session:${email.toLowerCase()}`);
  if (stored === null) return true; // no record = allow (backwards compat)
  return stored === iat;
}

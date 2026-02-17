/**
 * Drizzle client — connects to Vercel Postgres (Neon).
 *
 * Uses lazy initialization to avoid crashing at build time
 * when POSTGRES_URL isn't set (same pattern as auth.ts).
 * No actual connection is made until the first query runs.
 */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _db: NeonHttpDatabase<typeof schema> | null = null;

/**
 * Get the Drizzle database instance (lazy singleton).
 * Throws at runtime if POSTGRES_URL is missing, but won't crash at build time.
 */
function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    const url = process.env.POSTGRES_URL;
    if (!url) {
      throw new Error("POSTGRES_URL environment variable is not set");
    }
    const sql: NeonQueryFunction<false, false> = neon(url);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

/** Proxy that lazily initializes on first use */
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const realDb = getDb();
    const value = Reflect.get(realDb, prop, receiver);
    return typeof value === "function" ? value.bind(realDb) : value;
  },
});

// Re-export schema for convenience
export * from "./schema";

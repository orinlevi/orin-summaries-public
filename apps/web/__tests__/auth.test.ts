import { describe, it, expect, beforeAll } from "vitest";

// Set a test cookie secret before importing auth module
process.env.COOKIE_SECRET = "test-secret-for-vitest-12345678901234";
process.env.ADMIN_EMAILS = "admin@test.com,admin2@test.com";
process.env.ALLOWED_EMAILS = "friend@test.com";

// Dynamic import after env vars are set
let signToken: typeof import("@/lib/auth").signToken;
let verifyToken: typeof import("@/lib/auth").verifyToken;
let isAdmin: typeof import("@/lib/auth").isAdmin;
let isAllowed: typeof import("@/lib/auth").isAllowed;
let hasPrivilegedAccess: typeof import("@/lib/auth").hasPrivilegedAccess;
let SEMESTER_MAX_AGE: number;

beforeAll(async () => {
  const auth = await import("@/lib/auth");
  signToken = auth.signToken;
  verifyToken = auth.verifyToken;
  isAdmin = auth.isAdmin;
  isAllowed = auth.isAllowed;
  hasPrivilegedAccess = auth.hasPrivilegedAccess;
  SEMESTER_MAX_AGE = auth.SEMESTER_MAX_AGE;
});

describe("auth — token signing and verification", () => {
  it("signToken returns a string with two dot-separated parts", () => {
    const token = signToken("user@example.com");
    expect(typeof token).toBe("string");
    const parts = token.split(".");
    expect(parts.length).toBe(2);
    expect(parts[0]!.length).toBeGreaterThan(0);
    expect(parts[1]!.length).toBeGreaterThan(0);
  });

  it("verifyToken returns payload for a valid token", () => {
    const token = signToken("user@example.com");
    const payload = verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.email).toBe("user@example.com");
    expect(typeof payload!.exp).toBe("number");
    expect(typeof payload!.iat).toBe("number");
  });

  it("verifyToken returns null for tampered token", () => {
    const token = signToken("user@example.com");
    const tampered = token.slice(0, -3) + "xyz";
    expect(verifyToken(tampered)).toBeNull();
  });

  it("verifyToken returns null for empty or missing token", () => {
    expect(verifyToken("")).toBeNull();
    expect(verifyToken("not-a-token")).toBeNull();
    expect(verifyToken("a.b.c")).toBeNull();
  });

  it("verifyToken rejects absurdly long tokens", () => {
    const long = "a".repeat(2000) + ".b";
    expect(verifyToken(long)).toBeNull();
  });

  it("token expiration is approximately SEMESTER_MAX_AGE", () => {
    const token = signToken("user@example.com");
    const payload = verifyToken(token)!;
    const diff = payload.exp - payload.iat;
    expect(diff).toBe(SEMESTER_MAX_AGE);
  });

  it("verifyToken returns null for expired token", () => {
    // Manually craft an expired token
    const crypto = require("crypto");
    const secret = process.env.COOKIE_SECRET!;
    const payload = {
      email: "user@example.com",
      exp: Math.floor(Date.now() / 1000) - 100, // already expired
      iat: Math.floor(Date.now() / 1000) - 200,
    };
    const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const sig = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("base64url");
    const token = `${data}.${sig}`;
    expect(verifyToken(token)).toBeNull();
  });
});

describe("auth — admin/allowed checks", () => {
  it("isAdmin returns true for admin emails", () => {
    expect(isAdmin("admin@test.com")).toBe(true);
    expect(isAdmin("ADMIN@TEST.COM")).toBe(true);
    expect(isAdmin("admin2@test.com")).toBe(true);
  });

  it("isAdmin returns false for non-admin emails", () => {
    expect(isAdmin("user@test.com")).toBe(false);
    expect(isAdmin("friend@test.com")).toBe(false);
  });

  it("isAllowed returns true for allowed emails", () => {
    expect(isAllowed("friend@test.com")).toBe(true);
    expect(isAllowed("FRIEND@TEST.COM")).toBe(true);
  });

  it("isAllowed returns false for non-allowed emails", () => {
    expect(isAllowed("random@test.com")).toBe(false);
  });

  it("hasPrivilegedAccess returns true for admin or allowed", () => {
    expect(hasPrivilegedAccess("admin@test.com")).toBe(true);
    expect(hasPrivilegedAccess("friend@test.com")).toBe(true);
  });

  it("hasPrivilegedAccess returns false for regular users", () => {
    expect(hasPrivilegedAccess("user@example.com")).toBe(false);
  });
});

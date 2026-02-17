import { describe, it, expect } from "vitest";

/**
 * Tests for input validation patterns used across API routes.
 * These test the regex patterns themselves (not the routes).
 */

describe("courseId validation pattern", () => {
  const isValid = (id: string) => /^[a-z0-9-]+$/.test(id) && id.length <= 50;

  it("accepts valid course IDs", () => {
    expect(isValid("discrete1")).toBe(true);
    expect(isValid("calculus1b")).toBe(true);
    expect(isValid("cs-math-intro")).toBe(true);
    expect(isValid("stats1")).toBe(true);
    expect(isValid("lini2b")).toBe(true);
  });

  it("rejects invalid course IDs", () => {
    expect(isValid("")).toBe(false);
    expect(isValid("UPPERCASE")).toBe(false);
    expect(isValid("has spaces")).toBe(false);
    expect(isValid("has/slash")).toBe(false);
    expect(isValid("has..dots")).toBe(false);
    expect(isValid("../traversal")).toBe(false);
    expect(isValid("a".repeat(51))).toBe(false);
  });
});

describe("unitId validation", () => {
  const isValid = (id: number) => Number.isInteger(id) && id >= 0 && id <= 1000;

  it("accepts valid unit IDs", () => {
    expect(isValid(0)).toBe(true);
    expect(isValid(1)).toBe(true);
    expect(isValid(42)).toBe(true);
    expect(isValid(999)).toBe(true);
    expect(isValid(1000)).toBe(true);
  });

  it("rejects invalid unit IDs", () => {
    expect(isValid(-1)).toBe(false);
    expect(isValid(1001)).toBe(false);
    expect(isValid(1.5)).toBe(false);
    expect(isValid(NaN)).toBe(false);
    expect(isValid(Infinity)).toBe(false);
  });
});

describe("email validation pattern", () => {
  const isValid = (email: string) =>
    email.length <= 100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  it("accepts valid emails", () => {
    expect(isValid("user@example.com")).toBe(true);
    expect(isValid("orin@mail.tau.ac.il")).toBe(true);
    expect(isValid("test+tag@gmail.com")).toBe(true);
    expect(isValid("name@sub.domain.co.uk")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isValid("")).toBe(false);
    expect(isValid("no-at-sign")).toBe(false);
    expect(isValid("@no-local.com")).toBe(false);
    expect(isValid("no-domain@")).toBe(false);
    expect(isValid("spaces in@email.com")).toBe(false);
    expect(isValid("a".repeat(101) + "@test.com")).toBe(false);
  });
});

describe("coupon code validation pattern", () => {
  const isValid = (code: string) =>
    code.length <= 30 && /^[A-Za-z0-9-]+$/.test(code);

  it("accepts valid coupon codes", () => {
    expect(isValid("NOTAPDF1")).toBe(true);
    expect(isValid("NERDAF5")).toBe(true);
    expect(isValid("BRAINLEAK3")).toBe(true);
    expect(isValid("ABC-123")).toBe(true);
  });

  it("rejects invalid coupon codes", () => {
    expect(isValid("")).toBe(false);
    expect(isValid("has spaces")).toBe(false);
    expect(isValid("has/slash")).toBe(false);
    expect(isValid("special!char")).toBe(false);
    expect(isValid("a".repeat(31))).toBe(false);
  });
});

describe("order ID validation (numeric only)", () => {
  const isValid = (id: string) => /^\d+$/.test(id);

  it("accepts valid numeric order IDs", () => {
    expect(isValid("123456")).toBe(true);
    expect(isValid("1")).toBe(true);
    expect(isValid("9999999999")).toBe(true);
  });

  it("rejects non-numeric order IDs", () => {
    expect(isValid("")).toBe(false);
    expect(isValid("abc")).toBe(false);
    expect(isValid("123abc")).toBe(false);
    expect(isValid("12 34")).toBe(false);
    expect(isValid("-1")).toBe(false);
    expect(isValid("1.5")).toBe(false);
  });
});

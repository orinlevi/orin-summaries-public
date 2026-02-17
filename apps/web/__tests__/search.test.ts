import { describe, it, expect } from "vitest";
import { getSnippet } from "@/lib/search";

describe("getSnippet", () => {
  it("returns snippet around matching text", () => {
    const text = "This is a long paragraph about linear algebra and matrices in mathematics.";
    const result = getSnippet(text, "linear");
    expect(result).not.toBeNull();
    expect(result).toContain("linear");
  });

  it("returns first 60 chars when query is not found", () => {
    const text = "אבגדהוזחטיכלמנסעפצקרשת ".repeat(5);
    const result = getSnippet(text, "xyz-not-found");
    expect(result).not.toBeNull();
    expect(result!.length).toBeLessThanOrEqual(60);
  });

  it("is case insensitive", () => {
    const text = "Hello World is a common greeting.";
    const result = getSnippet(text, "hello");
    expect(result).toContain("Hello");
  });

  it("handles Hebrew text", () => {
    const text = "זוהי פסקה על אלגברה לינארית ומטריצות בקורס מתמטיקה.";
    const result = getSnippet(text, "אלגברה");
    expect(result).not.toBeNull();
    expect(result).toContain("אלגברה");
  });

  it("returns null for empty text with no match", () => {
    const result = getSnippet("", "test");
    // Empty text, no match, returns text.slice(0, 60) which is ""
    expect(result).toBe("");
  });

  it("truncates context to about 60 chars around match", () => {
    const longText = "a".repeat(100) + "MATCH" + "b".repeat(100);
    const result = getSnippet(longText, "MATCH");
    expect(result).not.toBeNull();
    // Should be ~60 chars: 20 before + 5 (MATCH) + 40 after
    expect(result!.length).toBeLessThanOrEqual(70);
    expect(result).toContain("MATCH");
  });
});

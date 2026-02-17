import { test, expect } from "@playwright/test";

test.describe("Error Pages", () => {
  test("nonexistent course shows 404 page", async ({ page }) => {
    await page.goto("/course/nonexistent-course-xyz");
    // In dev mode, Next.js may return 200 but renders the not-found page
    await expect(page.locator("text=404")).toBeVisible();
    await expect(page.locator("text=הלכת לאיבוד")).toBeVisible();
  });

  test("nonexistent unit shows 404 page", async ({ page }) => {
    await page.goto("/course/discrete1/nonexistent-unit-xyz");
    await expect(page.locator("text=404")).toBeVisible();
  });

  test("nonexistent HUJI course shows 404 page", async ({ page }) => {
    await page.goto("/huji/nonexistent-huji-xyz");
    await expect(page.locator("text=404")).toBeVisible();
  });

  test("404 page shows friendly message", async ({ page }) => {
    await page.goto("/course/nonexistent-course-xyz");
    await expect(page.locator("text=404")).toBeVisible();
    // Should have the witty message
    const pageText = await page.textContent("body");
    expect(pageText).toContain("הלכת לאיבוד");
  });

  test("404 page has link back to homepage", async ({ page }) => {
    await page.goto("/course/nonexistent-course-xyz");
    await expect(page.locator("text=404")).toBeVisible();
    // Use more specific selector — the "back to home" link in the 404 page
    const homeLink = page.locator('a', { hasText: 'חזרה לדף הבית' });
    await expect(homeLink).toBeVisible();
  });
});

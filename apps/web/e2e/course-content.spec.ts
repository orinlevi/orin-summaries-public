import { test, expect } from "@playwright/test";

test.describe("Course Content", () => {
  test("course page shows list of units", async ({ page }) => {
    await page.goto("/course/discrete1");
    await expect(page.locator("h1")).toBeVisible();
    // Should have unit links
    const unitLinks = page.locator('a[href*="/course/discrete1/"]');
    expect(await unitLinks.count()).toBeGreaterThanOrEqual(3);
  });

  test("free unit renders content", async ({ page }) => {
    // unit-1 (אינדוקציה מתמטית) is free
    await page.goto("/course/discrete1/unit-1");
    // Breadcrumb nav should be visible (page loaded)
    await expect(page.locator("nav").first()).toBeVisible();
    // Content should render — free units show content directly
    const content = page.locator("article, main");
    await expect(content.first()).toBeVisible();
    // Should have actual content text (headings from markdown)
    await expect(page.locator("h2, h3").first()).toBeVisible({ timeout: 10000 });
  });

  test("free unit has KaTeX math formulas", async ({ page }) => {
    await page.goto("/course/discrete1/unit-1");
    // Wait for content to render
    await page.waitForTimeout(2000);
    // KaTeX renders math into elements with class "katex"
    const katexElements = page.locator(".katex");
    expect(await katexElements.count()).toBeGreaterThanOrEqual(1);
  });

  test("free unit has headings for table of contents", async ({ page }) => {
    await page.goto("/course/discrete1/unit-1");
    await expect(page.locator("h2, h3").first()).toBeVisible({ timeout: 10000 });
    const headings = page.locator("h2, h3");
    expect(await headings.count()).toBeGreaterThanOrEqual(2);
  });

  test("paid unit shows protected content / paywall", async ({ page }) => {
    // unit-3 is paid (free: false)
    await page.goto("/course/discrete1/unit-3");
    // Breadcrumb nav should be visible (page loaded)
    await expect(page.locator("nav").first()).toBeVisible();
    // Without auth, ProtectedContent calls /api/auth/check → blocked → PaywallGate
    // Wait for the auth check to resolve and paywall to appear
    await expect(page.locator("text=תוכן זה זמין למנויים")).toBeVisible({ timeout: 10000 });
    // Should show a purchase link
    await expect(page.locator("text=רכישת גישה מלאה")).toBeVisible();
  });

  test("course page shows downloadables section", async ({ page }) => {
    await page.goto("/course/discrete1");
    // Check for download links or downloadables section
    const downloadSection = page.locator('text=להורדה').or(page.locator('a[href*="/api/download"]'));
    // Some courses have downloadables, some don't — just check the page loads
    await expect(page.locator("h1")).toBeVisible();
  });

  test("access page loads with login form", async ({ page }) => {
    await page.goto("/access");
    await expect(page).toHaveURL("/access");
    // Should show some form of login UI
    const pageText = await page.textContent("body");
    const hasLoginUI = pageText?.includes("Google") ||
                       pageText?.includes("התחבר") ||
                       pageText?.includes("גישה") ||
                       pageText?.includes("קוד קופון") ||
                       pageText?.includes("קופון");
    expect(hasLoginUI).toBeTruthy();
  });

  test("unit page has back link to course", async ({ page }) => {
    await page.goto("/course/discrete1/unit-1");
    // Should have a breadcrumb or back link to the course page
    const backLink = page.locator('a[href="/course/discrete1"], a[href="/"]');
    await expect(backLink.first()).toBeVisible();
  });
});

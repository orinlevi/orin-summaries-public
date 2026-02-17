import { test, expect } from "@playwright/test";

test.describe("HUJI Section", () => {
  test("HUJI page loads with heading", async ({ page }) => {
    await page.goto("/huji");
    await expect(page.locator("h1")).toBeVisible();
    const heading = await page.locator("h1").textContent();
    expect(heading).toBeTruthy();
  });

  test("HUJI page shows course cards", async ({ page }) => {
    await page.goto("/huji");
    // HUJI courses link to /huji/{courseId}
    const courseLinks = page.locator('a[href^="/huji/"]');
    await expect(courseLinks.first()).toBeVisible();
    expect(await courseLinks.count()).toBeGreaterThanOrEqual(3);
  });

  test("clicking a HUJI course navigates to course page", async ({ page }) => {
    await page.goto("/huji");
    const firstCourse = page.locator('a[href^="/huji/"]').first();
    const href = await firstCourse.getAttribute("href");
    await firstCourse.click();
    await expect(page).toHaveURL(href!);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("HUJI course page shows units", async ({ page }) => {
    await page.goto("/huji/huji-dast");
    await expect(page.locator("h1")).toBeVisible();
    // Should have unit links
    const unitLinks = page.locator('a[href*="/huji/huji-dast/"]');
    expect(await unitLinks.count()).toBeGreaterThanOrEqual(1);
  });

  test("HUJI unit page renders content (all free)", async ({ page }) => {
    await page.goto("/huji/huji-dast");
    // Click first unit
    const firstUnit = page.locator('a[href*="/huji/huji-dast/"]').first();
    await firstUnit.click();
    // Content should render without paywall (all HUJI content is free)
    await expect(page.locator("h1")).toBeVisible();
    // Wait for markdown content to render
    await expect(page.locator("h2, h3").first()).toBeVisible({ timeout: 10000 });
  });

  test("HUJI page has search bar", async ({ page }) => {
    await page.goto("/huji");
    const searchInput = page.locator('input[aria-label="חיפוש קורסים ותוכן"]');
    await expect(searchInput).toBeVisible();
  });
});

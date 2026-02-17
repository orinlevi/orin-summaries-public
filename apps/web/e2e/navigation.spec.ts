import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads with title and heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Orin Summaries|סיכומי קורסים/);
    await expect(page.locator("h1")).toContainText("סיכומי קורסים");
  });

  test("TAU button links to homepage", async ({ page }) => {
    await page.goto("/");
    const tauButton = page.locator('a', { hasText: 'TAU' }).first();
    await expect(tauButton).toHaveAttribute("href", "/");
  });

  test("HUJI button links to /huji", async ({ page }) => {
    await page.goto("/");
    const hujiButton = page.locator('a', { hasText: 'HUJI' }).first();
    await expect(hujiButton).toHaveAttribute("href", "/huji");
    await hujiButton.click();
    await expect(page).toHaveURL("/huji");
  });

  test("homepage shows course cards", async ({ page }) => {
    await page.goto("/");
    // Look for course links - TAU courses link to /course/{id}
    const courseLinks = page.locator('a[href^="/course/"]');
    await expect(courseLinks.first()).toBeVisible();
    expect(await courseLinks.count()).toBeGreaterThanOrEqual(5);
  });

  test("clicking a course card navigates to course page", async ({ page }) => {
    await page.goto("/");
    const firstCourseLink = page.locator('a[href^="/course/"]').first();
    const href = await firstCourseLink.getAttribute("href");
    await firstCourseLink.click();
    await expect(page).toHaveURL(href!);
    // Course page should have a heading
    await expect(page.locator("h1")).toBeVisible();
  });

  test("clicking a unit navigates to unit page", async ({ page }) => {
    await page.goto("/course/discrete1");
    // Find first unit link
    const unitLink = page.locator('a[href*="/course/discrete1/"]').first();
    await expect(unitLink).toBeVisible();
    const href = await unitLink.getAttribute("href");
    await unitLink.click();
    await expect(page).toHaveURL(href!);
  });

  test("breadcrumbs work on course page", async ({ page }) => {
    await page.goto("/course/discrete1");
    // Should have a link back to home
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
  });

  test("navbar access link goes to /access", async ({ page }) => {
    await page.goto("/");
    const accessLink = page.locator('a[href="/access"]').first();
    await expect(accessLink).toBeVisible();
    await accessLink.click();
    await expect(page).toHaveURL("/access");
  });
});

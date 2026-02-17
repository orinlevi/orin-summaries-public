import { test, expect } from "@playwright/test";

test.describe("Search", () => {
  test("search bar is visible on homepage", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator('input[aria-label="חיפוש קורסים ותוכן"]');
    await expect(searchInput).toBeVisible();
  });

  test("typing a query shows results", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator('input[aria-label="חיפוש קורסים ותוכן"]');
    await searchInput.fill("בדידה");
    // Should show a results dropdown with at least one item
    const resultsList = page.locator('[role="listbox"]');
    await expect(resultsList).toBeVisible({ timeout: 5000 });
    const options = resultsList.locator('[role="option"]');
    expect(await options.count()).toBeGreaterThanOrEqual(1);
  });

  test("clicking a search result navigates to the page", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator('input[aria-label="חיפוש קורסים ותוכן"]');
    await searchInput.fill("בדידה");
    const resultsList = page.locator('[role="listbox"]');
    await expect(resultsList).toBeVisible({ timeout: 5000 });
    // Click the first result button
    const firstResult = resultsList.locator("button").first();
    await firstResult.click();
    // Should navigate away from homepage
    await expect(page).not.toHaveURL("/");
  });

  test("TAU search does not show HUJI results", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator('input[aria-label="חיפוש קורסים ותוכן"]');
    // Search for something HUJI-specific
    await searchInput.fill("huji");
    // Wait a bit for search to process
    await page.waitForTimeout(500);
    // Either no results or results don't link to /huji/
    const hujiLinks = page.locator('[role="listbox"] a[href^="/huji/"]');
    expect(await hujiLinks.count()).toBe(0);
  });

  test("HUJI search does not show TAU results", async ({ page }) => {
    await page.goto("/huji");
    const searchInput = page.locator('input[aria-label="חיפוש קורסים ותוכן"]');
    await searchInput.fill("בדידה");
    // Wait for results
    await page.waitForTimeout(500);
    // Should not have results linking to /course/ (TAU prefix)
    const tauLinks = page.locator('[role="listbox"] button');
    // If results appear, none should navigate to TAU routes
    const count = await tauLinks.count();
    if (count > 0) {
      // Check that no result text matches TAU-only courses
      const resultText = await page.locator('[role="listbox"]').textContent();
      expect(resultText).not.toContain("מתמטיקה בדידה");
    }
  });

  test("clearing search hides results", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator('input[aria-label="חיפוש קורסים ותוכן"]');
    await searchInput.fill("בדידה");
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 5000 });
    // Clear the search
    await searchInput.fill("");
    await expect(page.locator('[role="listbox"]')).not.toBeVisible();
  });

  test("keyboard navigation works in search results", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator('input[aria-label="חיפוש קורסים ותוכן"]');
    await searchInput.fill("בדידה");
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 5000 });
    // Press ArrowDown to highlight first item
    await searchInput.press("ArrowDown");
    // First option should be selected
    const selectedOption = page.locator('[role="option"][aria-selected="true"]');
    await expect(selectedOption).toBeVisible();
    // Press Enter to navigate
    await searchInput.press("Enter");
    await expect(page).not.toHaveURL("/");
  });
});

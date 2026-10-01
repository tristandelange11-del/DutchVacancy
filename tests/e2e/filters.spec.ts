import { test, expect } from "@playwright/test";

/**
 * The vacancy filters (design A): a bar of filter buttons with menus on desktop, a
 * sheet from the bottom on mobile. Several values per filter go into the URL comma
 * separated; backend/tests/test_job_filters.py covers how the API applies them.
 */

test("desktop: choose two cities from the city menu, then remove one with its chip", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/jobs");

  await page.getByTestId("filter-button-city").click();
  await page.getByTestId("filter-option-city-Amsterdam").check();
  await page.getByTestId("filter-option-city-Utrecht").check();
  await expect(page).toHaveURL(/city=Amsterdam%2CUtrecht/);
  await expect(page.getByTestId("filter-button-city")).toHaveText(/City: 2 selected/);

  await page.getByTestId("filter-menu-done-city").click();
  await expect(page.getByTestId("filter-menu-city")).toHaveCount(0);

  await page.getByTestId("filter-chip-city-Amsterdam").click();
  await expect(page).toHaveURL(/city=Utrecht(&|$)/);
  await expect(page.getByTestId("filter-button-city")).toHaveText(/City: Utrecht/);

  await page.getByTestId("jobs-clear-filters").click();
  await expect(page).not.toHaveURL(/city=/);
});

test("mobile: the filter sheet shows the chosen filters, adds one and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/jobs?english_level=english_only");
  await expect(page.getByTestId("filter-bar")).toBeHidden();

  await page.getByTestId("jobs-filter-toggle").click();
  const sheet = page.getByTestId("filter-sheet");
  await expect(sheet).toBeVisible();
  await expect(sheet.getByTestId("filter-option-english_level-english_only")).toBeChecked();

  await sheet.getByTestId("filter-option-work_mode-remote").check();
  await expect(page).toHaveURL(/work_mode=remote/);
  await sheet.getByTestId("filter-sheet-show").click();
  await expect(sheet).toBeHidden();
  await expect(page.getByTestId("filter-chip-work_mode-remote")).toBeVisible();

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

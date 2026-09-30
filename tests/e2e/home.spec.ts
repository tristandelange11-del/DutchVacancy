import { test, expect } from "@playwright/test";

/**
 * Homepage (design A): the hero search and what the featured block shows when there is
 * nothing to feature. The featured list is intercepted for the empty case, so the
 * test does not depend on how many vacancies the test database holds.
 */

test("the hero search filters on English-only vacancies unless the box is cleared", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByTestId("hero-facts")).toBeVisible();
  await expect(page.getByTestId("hero-english-only")).toBeChecked();

  await page.getByTestId("hero-search-input").fill("barista");
  await page.getByTestId("hero-city-select").selectOption("Utrecht");
  await page.getByTestId("hero-search-button").click();
  await expect(page).toHaveURL(/\/en\/jobs\?/);
  const withBox = new URL(page.url()).searchParams;
  expect(Object.fromEntries(withBox)).toEqual({ q: "barista", city: "Utrecht", english_level: "english_only" });

  await page.goto("/en");
  await page.getByTestId("hero-english-only").uncheck();
  await page.getByTestId("hero-search-input").fill("barista");
  await page.getByTestId("hero-search-input").press("Enter");
  await expect(page).toHaveURL(/\/en\/jobs\?/);
  expect(Object.fromEntries(new URL(page.url()).searchParams)).toEqual({ q: "barista" });
});

test("with no open vacancies the homepage says so instead of loading forever", async ({ page }) => {
  await page.route("**/api/jobs/fresh", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ items: [], total: 0 }) }),
  );
  await page.goto("/en");
  await expect(page.getByTestId("featured-none")).toContainText("No vacancies online yet");
  await expect(page.getByTestId("featured-jobs-grid")).toHaveCount(0);
});

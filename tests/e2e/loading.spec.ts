import { test, expect } from "@playwright/test";

/**
 * Only the home page ships in the main bundle; other pages load when first opened
 * (App.tsx). A visitor on the home page should not download the dashboards or the
 * vacancy form, and a page opened directly still renders.
 */

const NOT_ON_HOME = /pages\/(EmployerDashboard|StudentDashboard|VacancyForm)|\/(EmployerDashboard|StudentDashboard|VacancyForm)-[\w-]+\.js/;

test("the home page does not download the dashboards or the vacancy form", async ({ page }) => {
  const requested: string[] = [];
  page.on("request", (request) => requested.push(request.url()));
  await page.goto("/en");
  await expect(page.getByTestId("hero-facts")).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(requested.filter((url) => NOT_ON_HOME.test(url))).toEqual([]);
});

test("a page opened directly loads its own code and renders", async ({ page }) => {
  await page.goto("/en/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("page-loading")).toHaveCount(0);
});

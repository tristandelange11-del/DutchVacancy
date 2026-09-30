import { test, expect } from "@playwright/test";

/**
 * The talking DV mark: it plays its conversation on the home page only, stands
 * still for visitors who ask for less motion, and the favicon is DutchVacancy's
 * own mark (not the platform's default).
 */

test("the logo talks on the home page and stands still elsewhere", async ({ page }) => {
  await page.goto("/en");
  const mark = page.getByTestId("brand-logo").locator("svg.dv-logo");
  await expect(mark).toHaveClass(/dv-logo--talk/);
  expect(await mark.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);

  await page.goto("/en/jobs");
  await expect(page.getByTestId("brand-logo").locator("svg.dv-logo")).toHaveClass(/dv-logo--still/);
});

test("with reduced motion the logo does not animate", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  const mark = page.getByTestId("brand-logo").locator("svg.dv-logo");
  await expect(mark).toBeVisible();
  expect(await mark.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
});

test("the favicons are DutchVacancy's mark", async ({ page, request }) => {
  await page.goto("/en");
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute("href", "/favicon.svg");
  const svg = await request.get("/favicon.svg");
  expect(svg.ok()).toBe(true);
  expect(await svg.text()).toContain("<title>DutchVacancy</title>");
  const ico = await request.get("/favicon.ico");
  expect(ico.ok()).toBe(true);
});

import { test, expect } from "@playwright/test";

/**
 * Dutch at "/", English under "/en": each language version has its own URL, so both
 * can be indexed. The switch keeps you on the same page; links keep the language; a
 * visitor whose browser prefers the other language is offered it, never redirected.
 * (Playwright's browser language is English.)
 */

test("each language has its own URL, canonical and hreflang alternates", async ({ page }) => {
  await page.goto("/guide");
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Werken als internationale student in Nederland");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/guide$/);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", /\/en\/guide$/);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute("href", /localhost:3000\/guide$/);

  await page.goto("/en/guide");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Working in the Netherlands as an international student");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/en\/guide$/);
  await expect(page.locator('link[rel="alternate"][hreflang="nl"]')).toHaveAttribute("href", /localhost:3000\/guide$/);
});

test("the switch keeps the page and links keep the language", async ({ page }) => {
  await page.goto("/en/employers");
  await page.getByTestId("lang-switch-nl").click();
  await expect(page).toHaveURL(/localhost:3000\/employers$/);
  await expect(page.getByTestId("nav-link-jobs")).toHaveAttribute("href", "/jobs");

  await page.getByTestId("lang-switch-en").click();
  await expect(page).toHaveURL(/\/en\/employers$/);
  await expect(page.getByTestId("nav-link-jobs")).toHaveAttribute("href", "/en/jobs");
  await page.getByTestId("nav-link-guide").click();
  await expect(page).toHaveURL(/\/en\/guide$/);
});

test("an English browser on a Dutch page is offered English, not redirected", async ({ page }) => {
  await page.goto("/about");
  await expect(page).toHaveURL(/localhost:3000\/about$/);
  const hint = page.getByTestId("language-hint");
  await expect(hint).toBeVisible();
  await expect(hint).toHaveAttribute("lang", "en");
  await page.getByTestId("language-hint-switch").click();
  await expect(page).toHaveURL(/\/en\/about$/);
  await expect(page.getByTestId("language-hint")).toHaveCount(0);

  // English is now the visitor's own choice: a Dutch link still offers it.
  await page.goto("/contact");
  await expect(page.getByTestId("language-hint")).toBeVisible();
  await expect(page).toHaveURL(/localhost:3000\/contact$/);
});

test("staying in Dutch hides the offer for good", async ({ page }) => {
  await page.goto("/jobs");
  await page.getByTestId("language-hint-dismiss").click();
  await expect(page.getByTestId("language-hint")).toHaveCount(0);
  await page.goto("/guide");
  await expect(page.getByTestId("language-hint")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
});

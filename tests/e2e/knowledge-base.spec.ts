import { test, expect } from "@playwright/test";

/**
 * The knowledge base as a visitor sees it. What the backend serves depends on the
 * environment: production (and CI) only serves reviewed articles — none yet — while
 * staging (KB_SHOW_DRAFTS=1) also serves drafts, marked and noindex. The tests read
 * /api/kb and assert the matching behaviour, so they hold in both.
 */

type Summary = { slug: string; live: boolean };

test("the knowledge base is reachable from the navigation and the footer", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("nav-link-guide").click();
  await expect(page).toHaveURL(/\/guide$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Working in the Netherlands as an international student",
  );
  await page.goto("/jobs");
  await page.getByTestId("footer-guide-link").click();
  await expect(page).toHaveURL(/\/guide$/);
});

test("the hub shows only what this environment may serve", async ({ page }) => {
  const articles: Summary[] = await (await page.request.get("/api/kb")).json();
  await page.goto("/guide");
  await expect(page.getByTestId("kb-official-bodies")).toBeVisible();
  await expect(page.getByTestId("kb-jobs-link")).toHaveAttribute("href", "/jobs?english_level=english_only");

  if (articles.length === 0) {
    // Nothing reviewed yet: no article cards, and article URLs are a plain 404.
    await expect(page.getByTestId("kb-none")).toBeVisible();
    await page.goto("/guide/twv-work-permit");
    await expect(page.getByTestId("not-found-page")).toBeVisible();
    return;
  }

  for (const article of articles) {
    const card = page.getByTestId(`kb-card-${article.slug}`);
    await expect(card).toBeVisible();
    await expect(page.getByTestId(`kb-draft-${article.slug}`)).toHaveCount(article.live ? 0 : 1);
  }
});

test("an article follows the fixed structure and drafts stay out of search", async ({ page }) => {
  const articles: Summary[] = await (await page.request.get("/api/kb")).json();
  test.skip(articles.length === 0, "no article is served in this environment (none reviewed yet)");
  const article = articles.find((a) => a.slug === "twv-work-permit") ?? articles[0];

  await page.goto(`/guide/${article.slug}`);
  for (const part of ["kb-answer", "kb-applies-to", "kb-next-steps", "kb-contacts", "kb-sources", "kb-byline"]) {
    await expect(page.getByTestId(part)).toBeVisible();
  }
  await expect(page.getByTestId("kb-sources").getByRole("link").first()).toHaveAttribute("href", /^https:\/\//);
  if (!article.live) {
    await expect(page.getByTestId("kb-draft-banner")).toBeVisible();
    await expect(page.getByTestId("kb-last-reviewed")).toHaveText(/not yet reviewed/i);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator("#dv-json-ld")).toHaveCount(0);
  }
});

test("unverified rules are no longer stated on the home page or the guide", async ({ page }) => {
  for (const path of ["/", "/guide", "/register"]) {
    await page.goto(path);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/14\s*[–-]\s*24/);
    expect(text).not.toMatch(/not both in the same year/i);
    expect(text).not.toMatch(/costs you nothing|never pay for one yourself/i);
  }
});

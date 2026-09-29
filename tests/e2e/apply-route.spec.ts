import { test, expect, type Page } from "@playwright/test";
import { expireJobDirectly, verifyEmailDirectly } from "../fixtures/db";
import { dismissToasts } from "../fixtures/helpers";

/**
 * The application route as a first-time visitor experiences it, on desktop and on a
 * phone: open a vacancy, hit "apply" while logged out, register, come back to the same
 * vacancy, get a clear message while the email is unconfirmed, then apply. Also the
 * closed state. All addresses use the reserved example.com domain, which the backend
 * never emails (lib/email.py) — test runs cannot reach real people.
 */

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const PASSWORD = "Correct-Horse-1!";
const JOB_TITLE = `E2E Route Vacancy ${RUN}`;

async function register(page: Page, role: "student" | "employer", email: string) {
  await page.getByTestId(`register-role-${role}`).click();
  await page.getByTestId("register-name-input").fill(`E2E ${role}`);
  await page.getByTestId("register-email-input").fill(email);
  await page.getByTestId("register-password-input").fill(PASSWORD);
  if (role === "employer") await page.getByTestId("register-company-input").fill(`Route Co ${RUN}`);
  await page.getByTestId("register-submit-button").click();
}

let jobId = "";

test.describe.serial("application route", () => {
  test("employer posts a vacancy without pay or hours — nothing is invented", async ({ page }) => {
    await page.goto("/register?role=employer");
    await dismissToasts(page);
    const email = `e2e-route-employer-${RUN}@example.com`;
    await register(page, "employer", email);
    await expect(page).toHaveURL(/\/employer\/dashboard$/);
    await verifyEmailDirectly(email);

    await page.goto("/employer/vacancies/new");
    await page.getByTestId("vacancy-title-input").fill(JOB_TITLE);
    await page.getByTestId("vacancy-description-input").fill("Route test vacancy.");
    await expect(page.getByTestId("vacancy-hourlymin-input")).toHaveValue("");
    await expect(page.getByTestId("vacancy-hours-input")).toHaveValue("");
    await expect(page.getByTestId("vacancy-permit-select")).toHaveValue("none");
    await expect(page.getByTestId("vacancy-closes-input")).not.toHaveValue("");

    const [created] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/employer/jobs") && r.request().method() === "POST"),
      page.getByTestId("vacancy-submit-button").click(),
    ]);
    expect(created.ok()).toBeTruthy();
    const job = await created.json();
    jobId = job.id;
    expect(job.hourly_min).toBeNull();
    expect(job.hours_per_week).toBeNull();
  });

  test("logged-out visitor is taken through sign-up and back to the vacancy", async ({ page }) => {
    await page.goto(`/jobs/${jobId}`);
    await dismissToasts(page);
    await expect(page.getByTestId("job-detail-title")).toHaveText(JOB_TITLE);
    await expect(page.getByTestId("job-detail-rate")).toHaveText(/pay not stated/i);
    await expect(page.getByTestId("job-detail-posted")).toBeVisible();
    await expect(page.getByTestId("job-detail-closes")).toBeVisible();

    // Google's required JobPosting properties are present, and nothing is invented:
    // no pay was stated, so there is no baseSalary.
    const ld = JSON.parse((await page.locator("#dv-json-ld").textContent()) ?? "{}");
    for (const key of ["title", "description", "datePosted", "hiringOrganization", "jobLocation", "validThrough"]) {
      expect(ld).toHaveProperty(key);
    }
    expect(ld).not.toHaveProperty("baseSalary");

    await page.getByTestId("job-apply-button").click();
    await expect(page).toHaveURL(new RegExp(`/register\\?next=${encodeURIComponent(`/jobs/${jobId}`)}`));

    const email = `e2e-route-student-${RUN}@example.com`;
    await register(page, "student", email);
    await expect(page).toHaveURL(new RegExp(`/jobs/${jobId}$`));

    // Not yet confirmed: applying explains what to do instead of failing silently.
    await page.getByTestId("job-apply-button").click();
    await expect(page.getByTestId("apply-motivation-hint")).toHaveText(/at least 10 characters/i);
    await page.getByTestId("apply-motivation-input").fill("Short");
    await expect(page.getByTestId("apply-submit-button")).toBeDisabled();
    await page.getByTestId("apply-motivation-input").fill("I would really like to work here alongside my studies.");
    await expect(page.getByTestId("apply-submit-button")).toBeEnabled();
    await page.getByTestId("apply-submit-button").click();
    await expect(page.locator("[data-sonner-toast]").filter({ hasText: /confirm your email/i })).toBeVisible();

    await verifyEmailDirectly(email);
    await page.reload();
    await page.getByTestId("job-apply-button").click();
    await page.getByTestId("apply-motivation-input").fill("I would really like to work here alongside my studies.");
    const [applied] = await Promise.all([
      page.waitForResponse((r) => r.url().includes(`/api/jobs/${jobId}/apply`) && r.request().method() === "POST"),
      page.getByTestId("apply-submit-button").click(),
    ]);
    expect(applied.ok()).toBeTruthy();
    await expect(page.getByTestId("job-already-applied")).toBeVisible();
  });

  test("the same route works on a phone-sized screen", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    try {
      await page.goto(`/jobs/${jobId}`);
      await dismissToasts(page);
      // On a phone the apply action is pinned to the bottom of the screen.
      const bar = page.getByTestId("job-apply-bar-button");
      await expect(bar).toBeInViewport();
      await bar.tap();
      await expect(page).toHaveURL(/\/register\?next=/);

      const email = `e2e-route-mobile-${RUN}@example.com`;
      await register(page, "student", email);
      await expect(page).toHaveURL(new RegExp(`/jobs/${jobId}$`));
      await verifyEmailDirectly(email);
      await page.reload();

      await page.getByTestId("job-apply-bar-button").tap();
      const dialog = page.getByTestId("apply-dialog");
      await expect(dialog).toBeVisible();
      await dialog.getByTestId("apply-motivation-input").fill("Applying from my phone for this student job.");
      const submit = dialog.getByTestId("apply-submit-button");
      await submit.scrollIntoViewIfNeeded();
      await expect(submit).toBeInViewport();
      await submit.tap();
      await expect(page.getByTestId("job-already-applied")).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("a closed vacancy says so, cannot be applied to and leaves the listings", async ({ page }) => {
    await expireJobDirectly(jobId);
    await page.goto(`/jobs/${jobId}`);
    await expect(page.getByTestId("job-closed-banner")).toBeVisible();
    await expect(page.getByTestId("job-apply-button")).toHaveCount(0);
    await expect(page.getByTestId("job-closed-browse")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator("#dv-json-ld")).toHaveCount(0);

    await page.goto(`/jobs?q=${encodeURIComponent(JOB_TITLE)}`);
    await expect(page.getByTestId(`job-card-${jobId}`)).toHaveCount(0);
  });
});

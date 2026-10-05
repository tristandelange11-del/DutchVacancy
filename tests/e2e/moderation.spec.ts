import { test, expect, type Page } from "@playwright/test";
import { approveVacancyDirectly, reviewLinkDirectly, verifyEmailDirectly } from "../fixtures/db";
import { dismissToasts } from "../fixtures/helpers";

/**
 * Equal treatment (backend/lib/moderation.py): hints in the vacancy form while typing,
 * a flagged vacancy waiting for a person, a refusal with a reason the employer sees,
 * and a visitor reporting a vacancy that is online. The review link normally reaches
 * the moderation inbox by email; here it is stored directly (fixtures/db.ts).
 */

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const PASSWORD = "Correct-Horse-1!";
const EMAIL = `e2e-mod-employer-${RUN}@example.com`;
const TITLE = `E2E Moderation Vacancy ${RUN}`;
const NOTE = "Een leeftijdsgrens is geen toegestane eis.";

async function login(page: Page) {
  await page.goto("/en/login");
  await page.getByTestId("login-email-input").fill(EMAIL);
  await page.getByTestId("login-password-input").fill(PASSWORD);
  await page.getByTestId("login-submit-button").click();
  await expect(page).toHaveURL(/\/employer\/dashboard$/);
}

let jobId = "";

test.describe.serial("vacancy moderation", () => {
  test("the form hints at phrases while typing, and a flagged vacancy waits for review", async ({ page }) => {
    await page.goto("/en/register?role=employer");
    await dismissToasts(page);
    await page.getByTestId("register-role-employer").click();
    await page.getByTestId("register-name-input").fill("E2E Moderation");
    await page.getByTestId("register-email-input").fill(EMAIL);
    await page.getByTestId("register-password-input").fill(PASSWORD);
    await page.getByTestId("register-company-input").fill(`Moderation Co ${RUN}`);
    await page.getByTestId("register-submit-button").click();
    await expect(page).toHaveURL(/\/employer\/dashboard$/);
    await verifyEmailDirectly(EMAIL);

    await page.goto("/en/employer/vacancies/new");
    await expect(page.getByTestId("vacancy-fair-hint")).toContainText("not who the candidate is");
    await page.getByTestId("vacancy-title-input").fill(TITLE);
    await page.getByTestId("vacancy-description-input").fill("Join our bar crew. Max 25 jaar.");
    await page.getByTestId("vacancy-requirements-input").fill("Native English speaker");
    await expect(page.getByTestId("vacancy-hint-age")).toContainText("“Max 25 jaar” (description)");
    await expect(page.getByTestId("vacancy-hint-origin")).toContainText("language level");
    // Rewriting the phrase removes its hint.
    await page.getByTestId("vacancy-requirements-input").fill("English at C1 level");
    await expect(page.getByTestId("vacancy-hint-origin")).toHaveCount(0);
    await expect(page.getByTestId("vacancy-hint-age")).toBeVisible();

    const [created] = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/api/employer/jobs") && r.request().method() === "POST"),
      page.getByTestId("vacancy-submit-button").click(),
    ]);
    const job = await created.json();
    jobId = job.id;
    expect(job.moderation_status).toBe("pending");
    await expect(page).toHaveURL(/\/employer\/dashboard$/);
    await expect(page.getByTestId(`employer-vacancy-state-${jobId}`)).toHaveText("In review");
    await expect(page.getByTestId(`employer-vacancy-moderation-${jobId}`)).toBeVisible();
  });

  test("the reviewer refuses it with a reason, once", async ({ page }) => {
    await page.goto(`/en/jobs/${jobId}`);
    await expect(page.getByTestId("job-not-found")).toBeVisible();

    const link = await reviewLinkDirectly(jobId, "flagged", [
      { category: "age", phrase: "Max 25 jaar", field: "description" },
    ]);
    await page.goto(link);
    await expect(page.getByTestId("review-reason")).toHaveText("Phrases that may signal unequal treatment");
    await expect(page.getByTestId("review-findings")).toContainText("“Max 25 jaar” · Age (description)");
    await expect(page.getByTestId("review-description").locator("mark")).toHaveText("Max 25 jaar");
    await expect(page.getByTestId("review-reject-button")).toBeDisabled();
    await page.getByTestId("review-note-input").fill(NOTE);
    await page.getByTestId("review-reject-button").click();
    await expect(page.getByTestId("review-done")).toContainText("The vacancy is offline");

    await page.goto(link);
    await expect(page.getByTestId("review-unavailable")).toContainText("already used");
  });

  test("the employer sees the reason on the dashboard and the vacancy page", async ({ page }) => {
    await login(page);
    await expect(page.getByTestId(`employer-vacancy-state-${jobId}`)).toHaveText("Not approved");
    await expect(page.getByTestId(`employer-vacancy-moderation-${jobId}`)).toContainText(NOTE);
    await page.goto(`/en/jobs/${jobId}`);
    await expect(page.getByTestId("job-moderation-banner")).toContainText(NOTE);
    await expect(page.getByTestId("job-closed-banner")).toHaveCount(0);
    await expect(page.getByTestId("job-report-button")).toHaveCount(0);
  });

  test("a visitor can report a vacancy that is online", async ({ page }) => {
    await approveVacancyDirectly(jobId);
    await page.goto(`/en/jobs/${jobId}`);
    await page.getByTestId("job-report-button").click();
    const dialog = page.getByTestId("report-dialog");
    await expect(dialog.getByTestId("report-submit-button")).toBeDisabled();
    await dialog.getByTestId("report-reason-discrimination").check();
    await dialog.getByTestId("report-message-input").fill("It asks for an age.");
    const [sent] = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith(`/api/jobs/${jobId}/report`) && r.request().method() === "POST"),
      dialog.getByTestId("report-submit-button").click(),
    ]);
    expect(sent.ok()).toBeTruthy();
    await expect(dialog.getByTestId("report-sent")).toBeVisible();
  });
});

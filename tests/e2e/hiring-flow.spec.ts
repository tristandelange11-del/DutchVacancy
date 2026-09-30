import { test, expect, type Page } from "@playwright/test";
import { verifyEmailDirectly } from "../fixtures/db";
import { dismissToasts, waitForAppReady } from "../fixtures/helpers";

/**
 * The full golden path this app exists for: an employer posts a vacancy, a student
 * applies, the employer proposes interview times, and the student picks one. This is
 * exactly what was verified by hand on staging before this spec existed — the goal
 * here is to catch a future regression automatically instead of re-doing that by hand
 * every time.
 *
 * Both accounts are registered through the real UI; only email verification is
 * shortcut (see fixtures/db.ts — no mailbox to click a link in during CI).
 */

const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const EMPLOYER_EMAIL = `e2e-employer-${RUN_ID}@example.com`;
const STUDENT_EMAIL = `e2e-student-${RUN_ID}@example.com`;
const PASSWORD = "Correct-Horse-1!";
const JOB_TITLE = `E2E Test Vacancy ${RUN_ID}`;

async function registerEmployer(page: Page) {
  await page.goto("/en/register?role=employer");
  await waitForAppReady(page);
  await dismissToasts(page);
  await page.getByTestId("register-role-employer").click();
  await page.getByTestId("register-name-input").fill("E2E Employer");
  await page.getByTestId("register-email-input").fill(EMPLOYER_EMAIL);
  await page.getByTestId("register-password-input").fill(PASSWORD);
  await page.getByTestId("register-company-input").fill(`E2E Company ${RUN_ID}`);
  await page.getByTestId("register-submit-button").click();
  await expect(page).toHaveURL(/\/employer\/dashboard$/);
}

async function registerStudent(page: Page) {
  await page.goto("/en/register");
  await waitForAppReady(page);
  await dismissToasts(page);
  await page.getByTestId("register-role-student").click();
  await page.getByTestId("register-name-input").fill("E2E Student");
  await page.getByTestId("register-email-input").fill(STUDENT_EMAIL);
  await page.getByTestId("register-password-input").fill(PASSWORD);
  await page.getByTestId("register-submit-button").click();
  await expect(page).toHaveURL(/\/student\/dashboard$/);
}

async function login(page: Page, email: string) {
  await page.goto("/en/login");
  await page.getByTestId("login-email-input").fill(email);
  await page.getByTestId("login-password-input").fill(PASSWORD);
  await page.getByTestId("login-submit-button").click();
}

async function logout(page: Page) {
  await page.getByTestId("nav-logout-button").click();
  await expect(page).toHaveURL(/\/en$/);
}

test.describe.serial("hiring flow: post a vacancy, apply, schedule and confirm an interview", () => {
  let jobId = "";
  let applicationId = "";

  test("employer registers and posts a vacancy", async ({ page }) => {
    await registerEmployer(page);
    await verifyEmailDirectly(EMPLOYER_EMAIL);
    await page.reload(); // pick up the session's now-current email_verified flag

    await page.goto("/en/employer/vacancies/new");
    await page.getByTestId("vacancy-title-input").fill(JOB_TITLE);
    await page.getByTestId("vacancy-description-input").fill("A vacancy created by the e2e suite.");

    const [createResponse] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/employer/jobs") && r.request().method() === "POST"),
      page.getByTestId("vacancy-submit-button").click(),
    ]);
    expect(createResponse.ok()).toBeTruthy();
    jobId = (await createResponse.json()).id;
    expect(jobId).toBeTruthy();

    await expect(page).toHaveURL(/\/employer\/dashboard$/);
    await logout(page);
  });

  test("student registers and applies to that vacancy", async ({ page }) => {
    await registerStudent(page);
    await verifyEmailDirectly(STUDENT_EMAIL);
    await page.reload();

    await page.goto(`/en/jobs/${jobId}`);
    await expect(page.getByTestId("job-detail-title")).toHaveText(JOB_TITLE);
    await page.getByTestId("job-apply-button").click();
    await page.getByTestId("apply-motivation-input").fill("I would love to work on this vacancy for the e2e suite.");

    const [applyResponse] = await Promise.all([
      page.waitForResponse((r) => r.url().includes(`/api/jobs/${jobId}/apply`) && r.request().method() === "POST"),
      page.getByTestId("apply-submit-button").click(),
    ]);
    expect(applyResponse.ok()).toBeTruthy();
    applicationId = (await applyResponse.json()).id;
    expect(applicationId).toBeTruthy();

    await expect(page.getByTestId("job-already-applied")).toBeVisible();
    await logout(page);
  });

  test("employer proposes interview times", async ({ page }) => {
    await login(page, EMPLOYER_EMAIL);
    await expect(page).toHaveURL(/\/employer\/dashboard$/);

    await page.getByTestId("employer-tab-applicants").click();

    const select = page.getByTestId(`applicant-status-select-${applicationId}`);
    await select.selectOption("interview");

    const dialog = page.getByTestId("interview-dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByTestId("interview-location-input").fill("https://meet.example.com/e2e-interview");

    const slot = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days out
    const local = `${slot.getFullYear()}-${String(slot.getMonth() + 1).padStart(2, "0")}-${String(slot.getDate()).padStart(2, "0")}T10:00`;
    await dialog.getByTestId("interview-slot-input-0").fill(local);

    const [proposeResponse] = await Promise.all([
      page.waitForResponse((r) => r.url().includes(`/api/employer/applications/${applicationId}/interview`) && r.request().method() === "PUT"),
      dialog.getByTestId("interview-submit-button").click(),
    ]);
    expect(proposeResponse.ok()).toBeTruthy();

    await expect(page.getByTestId(`applicant-interview-info-${applicationId}`)).toContainText(/waiting|wacht/i);
    await logout(page);
  });

  test("student picks the proposed time, employer sees it confirmed", async ({ page }) => {
    await login(page, STUDENT_EMAIL);
    await expect(page).toHaveURL(/\/student\/dashboard$/);

    await page.getByTestId(`application-choose-time-${applicationId}`).click();
    await expect(page).toHaveURL(new RegExp(`/student/applications/${applicationId}/interview$`));

    const firstSlot = page.locator('[data-testid^="interview-slot-"]').first();
    await firstSlot.click();

    const [chooseResponse] = await Promise.all([
      page.waitForResponse((r) => r.url().includes(`/api/student/applications/${applicationId}/interview/choose`) && r.request().method() === "POST"),
      page.getByTestId("interview-confirm-button").click(),
    ]);
    expect(chooseResponse.ok()).toBeTruthy();
    await expect(page.getByTestId("interview-confirmed")).toBeVisible();
    await expect(page.getByTestId("interview-add-to-calendar")).toBeVisible();
    await logout(page);

    await login(page, EMPLOYER_EMAIL);
    await page.getByTestId("employer-tab-applicants").click();
    await expect(page.getByTestId(`applicant-interview-ics-${applicationId}`)).toBeVisible();
  });
});

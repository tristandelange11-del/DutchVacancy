import { test, expect } from "@playwright/test";

/**
 * Employer information and the employer request form. The form's delivery (storage +
 * mail to the follow-up mailbox) is covered by backend/tests/test_contact_delivery.py;
 * here the browser side: what is sent, and that the page only claims success when the
 * server said so. The API is intercepted, so no request reaches a real mailbox.
 */

test("employers find the page from the navigation and can start an account", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("nav-link-employers").click();
  await expect(page).toHaveURL(/\/employers$/);
  await expect(page.getByTestId("employers-page")).toBeVisible();
  await expect(page.getByTestId("employers-register-link")).toHaveAttribute("href", "/register?role=employer");
});

test("an employer request is sent as such and confirmed only after the server accepted it", async ({ page }) => {
  let sent: Record<string, unknown> | null = null;
  await page.route("**/api/contact", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.goto("/employers");
  await page.getByTestId("employer-name-input").fill("E2E Employer");
  await page.getByTestId("employer-email-input").fill("e2e-employer-request@example.com");
  await page.getByTestId("employer-company-input").fill("E2E Test Company");
  await page.getByTestId("employer-message-input").fill("Two weekend roles in Leiden from November.");
  await page.getByTestId("employer-submit-button").click();

  await expect(page.getByTestId("employer-request-sent")).toBeVisible();
  expect(sent).toMatchObject({
    kind: "employer",
    company: "E2E Test Company",
    email: "e2e-employer-request@example.com",
  });
});

test("a failed employer request says so instead of pretending it worked", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Contact delivery is temporarily unavailable. Please try again later." }),
    }),
  );
  await page.goto("/employers");
  await page.getByTestId("employer-name-input").fill("E2E Employer");
  await page.getByTestId("employer-email-input").fill("e2e-employer-request@example.com");
  await page.getByTestId("employer-company-input").fill("E2E Test Company");
  await page.getByTestId("employer-message-input").fill("Two weekend roles in Leiden from November.");
  await page.getByTestId("employer-submit-button").click();

  await expect(page.getByTestId("employer-request-error")).toContainText("temporarily unavailable");
  await expect(page.getByTestId("employer-request-sent")).toHaveCount(0);
});

test("the contact page makes no unconfirmed promises", async ({ page }) => {
  await page.goto("/contact");
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/working days|werkdagen/i);
  expect(text).not.toMatch(/Online, the Netherlands/);
});

test("an unknown page and an unknown vacancy are kept out of search", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");
  await expect(page.getByTestId("not-found-page")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  await page.goto("/jobs/does-not-exist");
  await expect(page.getByTestId("job-not-found")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

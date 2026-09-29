import { test, expect } from "@playwright/test";
import { dismissToasts, waitForAppReady } from "../fixtures/helpers";

function uniqueEmail(prefix: string) {
  return `e2e-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

test.describe("student registration and login", () => {
  test("register logs the student in, and they can log out and back in", async ({ page }) => {
    const email = uniqueEmail("student");
    const password = "Correct-Horse-1!";

    await page.goto("/register");
    await waitForAppReady(page);
    await dismissToasts(page);

    await page.getByTestId("register-role-student").click();
    await page.getByTestId("register-name-input").fill("E2E Student");
    await page.getByTestId("register-email-input").fill(email);
    await page.getByTestId("register-password-input").fill(password);
    await page.getByTestId("register-submit-button").click();

    await expect(page).toHaveURL(/\/student\/dashboard$/);
    await expect(page.getByTestId("nav-logout-button")).toBeVisible();

    await page.getByTestId("nav-logout-button").click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/login");
    await page.getByTestId("login-email-input").fill(email);
    await page.getByTestId("login-password-input").fill(password);
    await page.getByTestId("login-submit-button").click();
    await expect(page).toHaveURL(/\/student\/dashboard$/);
  });

  test("a wrong password is rejected with a visible error, no navigation", async ({ page }) => {
    const email = uniqueEmail("wrongpw");
    await page.goto("/register");
    await page.getByTestId("register-role-student").click();
    await page.getByTestId("register-name-input").fill("E2E Wrong Password");
    await page.getByTestId("register-email-input").fill(email);
    await page.getByTestId("register-password-input").fill("Correct-Horse-1!");
    await page.getByTestId("register-submit-button").click();
    await expect(page).toHaveURL(/\/student\/dashboard$/);
    await page.getByTestId("nav-logout-button").click();

    await page.goto("/login");
    await page.getByTestId("login-email-input").fill(email);
    await page.getByTestId("login-password-input").fill("definitely-wrong");
    await page.getByTestId("login-submit-button").click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("[data-sonner-toast]")).toContainText(/invalid|onjuist|wrong|incorrect/i);
  });
});

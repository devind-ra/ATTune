import { test, expect } from "@playwright/test";
import { landingPageContent } from "../content/landing_page_content";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/");
});

test.describe("Hero Section", () => {
  test("checking all hero section elements", async ({ page }) => {
    await expect(page).toHaveTitle(landingPageContent.title);
    await expect(
      page.getByRole("heading", { name: landingPageContent.title }),
    ).toBeVisible();
    await expect(page.getByText(landingPageContent.subheading)).toBeVisible();
    await expect(page.getByText(landingPageContent.description)).toBeVisible();
    await expect(
      page.getByRole("button", { name: landingPageContent.getStartedButton }),
    ).toBeVisible();
  });
});

test.describe("Authentication Section", () => {
  test("checking all authentication section elements", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: landingPageContent.authenticationSectionHeading,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(landingPageContent.authenticationSectionDescription),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: landingPageContent.formHeading }),
    ).toBeVisible();
    await expect(
      page.getByText(landingPageContent.handleOrEmail),
    ).toBeVisible();
    await expect(page.getByText(landingPageContent.appPassword)).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: landingPageContent.whereDoIGetThisButton,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: landingPageContent.signInButton }),
    ).toBeVisible();
    await expect(
      page.getByText(landingPageContent.dontHaveAnAccount),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: landingPageContent.signUpButton }),
    ).toBeVisible();
    await expect(
      page.getByText(landingPageContent.rateHeading, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(landingPageContent.rateDescription),
    ).toBeVisible();
    await expect(
      page.getByText(landingPageContent.reviewHeading, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(landingPageContent.reviewDescription),
    ).toBeVisible();
    await expect(
      page.getByText(landingPageContent.connectHeading, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(landingPageContent.connectDescription),
    ).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";
import { LandingPage } from "./page/landing_page";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/");
});

test("checking all landing page elements", async ({ page }) => {
  const landingPage = new LandingPage(page);
  await landingPage.checkPageElements();
});

test("check sign in", async ({ page }) => {
  const landingPage = new LandingPage(page);
  await landingPage.clickGetStarted();
  await landingPage.fillHandleOrEmail();
  await landingPage.fillAppPassword();
  await landingPage.clickSignIn();
  await expect(page).toHaveURL("http://localhost:3000/home");
});

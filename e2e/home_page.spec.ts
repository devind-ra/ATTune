import { test } from "@playwright/test";
import { HomePage } from "./page/home_page";
import { LandingPage } from "./page/landing_page";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
  const landingPage = new LandingPage(page);
  landingPage.clickGetStarted();
  landingPage.fillDetails();
  landingPage.clickSignIn();
});

test("checking all home page elements", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.checkPageElements();
});

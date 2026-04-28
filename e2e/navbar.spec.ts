import { test } from "@playwright/test";
import { LandingPage } from "./page/landing_page";
import { Navbar } from "./page/navbar";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
  const landingPage = new LandingPage(page);
  await landingPage.clickGetStarted();
  await landingPage.fillDetails();
  await landingPage.clickSignIn();
  await page.waitForURL("http://localhost:3000/home");
});

test("checking all navbar elements", async ({ page }) => {
  const navbar = new Navbar(page);
  await navbar.checkPageElements();
});

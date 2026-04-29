import { test } from "@playwright/test";
import { LandingPage } from "./page/landing_page";
import { Navbar } from "./page/navbar";
import HelpPage from "./page/help_page";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
  const landingPage = new LandingPage(page);
  await landingPage.clickGetStarted();
  await landingPage.fillDetails();
  await landingPage.clickSignIn();
  const navbar = new Navbar(page);
  await navbar.clickAccount();
  await navbar.clickHelp();
});

test("checking all help page elements", async ({ page }) => {
  const helpPage = new HelpPage(page);
  await helpPage.checkPageElements();
});

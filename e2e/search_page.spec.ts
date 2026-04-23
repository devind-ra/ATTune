import { test } from "@playwright/test";
import { LandingPage } from "./page/landing_page";
import { Navbar } from "./page/navbar";
import { SearchPage } from "./page/search_page";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
  const landingPage = new LandingPage(page);
  await landingPage.clickGetStarted();
  await landingPage.fillDetails();
  await landingPage.clickSignIn();
  const navbar = new Navbar(page);
  await Promise.all([
    page.waitForURL("http://localhost:3000/search?q=Drake"),
    navbar.clickSearch("Drake"),
  ]);
  await page.waitForTimeout(2000);
});

test("checking all normal search page elements", async ({ page }) => {
  const searchPage = new SearchPage(page);
  await searchPage.checkPageElements();
});

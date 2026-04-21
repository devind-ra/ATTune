import { test } from "@playwright/test";
import { LandingPage } from "./page/landing_page";
import { ExplorePage } from "./page/explore_page";
import { Navbar } from "./page/navbar";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
  const landingPage = new LandingPage(page);
  await landingPage.clickGetStarted();
  await landingPage.fillDetails();
  await landingPage.clickSignIn();
  const navbar = new Navbar(page);
  await navbar.clickExplore();
});

test("checking all explore page elements", async ({ page }) => {
  const explorePage = new ExplorePage(page);
  await explorePage.checkExploreGenresSection();
  await explorePage.checkTrendingGloballySection();
  await explorePage.checkGlobalSoundsSection();
});

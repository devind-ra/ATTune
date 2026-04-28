import { test } from "@playwright/test";
import { LandingPage } from "./page/landing_page";
import { Navbar } from "./page/navbar";
import { ProfilePage } from "./page/profile_page";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
  const landingPage = new LandingPage(page);
  await landingPage.clickGetStarted();
  await landingPage.fillDetails();
  await landingPage.clickSignIn();
  const navbar = new Navbar(page);
  await navbar.clickProfile();
});

test("checking profile page elements", async ({ page }) => {
  const profilePage = new ProfilePage(page);
  await profilePage.checkUserProfileInformation();
  await profilePage.checkUserTastes();
  await profilePage.checkReviewActivity();
  await profilePage.checkRecentReviews();
});

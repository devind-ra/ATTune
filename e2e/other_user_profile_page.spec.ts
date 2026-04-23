import { test } from "@playwright/test";
import { LandingPage } from "./page/landing_page";
import { OtherUserProfilePage } from "./page/other_user_profile_page";
import { HomePage } from "./page/home_page";
import Navbar from "./page/navbar";
import SearchPage from "./page/search_page";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
  const landingPage = new LandingPage(page);
  await landingPage.clickGetStarted();
  await landingPage.fillDetails();
  await landingPage.clickSignIn();
  const navbar = new Navbar(page);
  await navbar.clickSearch(process.env.OTHER_BLUESKY_HANDLE!);
  const searchPage = new SearchPage(page);
  await searchPage.clickProfile();
  await page.waitForURL(
    "http://localhost:3000/profile/" + process.env.OTHER_BLUESKY_HANDLE!,
  );
});

test("checking profile page elements", async ({ page }) => {
  const otherUserProfilePage = new OtherUserProfilePage(page);
  await otherUserProfilePage.checkUserProfileInformation();
  await otherUserProfilePage.checkUserTastes();
  await otherUserProfilePage.checkReviewActivity();
  await otherUserProfilePage.checkRecentReviews();
});

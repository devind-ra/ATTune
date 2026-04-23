import { test } from "@playwright/test";
import { LandingPage } from "./page/landing_page";
import { Navbar } from "./page/navbar";
import OtherUserProfilePage from "./page/other_user_profile_page";
import SearchPage from "./page/search_page";
import { OtherUserReviewsPage } from "./page/other_user_reviews_page";

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
  const otherUserProfilePage = new OtherUserProfilePage(page);
  await otherUserProfilePage.clickShowMoreReviews();
  await page.waitForURL(
    "http://localhost:3000/" + process.env.OTHER_BLUESKY_HANDLE! + "/reviews",
  );
});

test("checking all review page elements", async ({ page }) => {
  const otherUserReviewsPage = new OtherUserReviewsPage(page);
  await page.waitForTimeout(5000);
  await otherUserReviewsPage.checkPageElements();
});

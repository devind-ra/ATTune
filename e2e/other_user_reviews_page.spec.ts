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
  await Promise.all([
    page.waitForURL(
      "http://localhost:3000/search?q=" + process.env.OTHER_BLUESKY_HANDLE!,
      { waitUntil: "networkidle" },
    ),
    navbar.clickSearch(process.env.OTHER_BLUESKY_HANDLE!),
  ]);
  const searchPage = new SearchPage(page);
  await Promise.all([
    page.waitForURL(
      "http://localhost:3000/profile/" + process.env.OTHER_BLUESKY_HANDLE!,
      { waitUntil: "networkidle" },
    ),
    searchPage.clickProfile(),
  ]);
  await page.waitForTimeout(5000);
  const otherUserProfilePage = new OtherUserProfilePage(page);
  await Promise.all([
    page.waitForURL(
      "http://localhost:3000/" + process.env.OTHER_BLUESKY_HANDLE! + "/reviews",
      { waitUntil: "networkidle" },
    ),
    otherUserProfilePage.clickShowMoreReviews(),
  ]);
});

test("checking all review page elements", async ({ page }) => {
  const otherUserReviewsPage = new OtherUserReviewsPage(page);
  await otherUserReviewsPage.checkPageElements();
});

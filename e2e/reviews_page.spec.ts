import { test } from "@playwright/test";
import { LandingPage } from "./page/landing_page";
import { Navbar } from "./page/navbar";
import { ProfilePage } from "./page/profile_page";
import { ReviewsPage } from "./page/reviews_page";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
  const landingPage = new LandingPage(page);
  await landingPage.clickGetStarted();
  await landingPage.fillDetails();
  await landingPage.clickSignIn();
  const navbar = new Navbar(page);
  await navbar.clickProfile();
  const profilePage = new ProfilePage(page);
  await profilePage.clickShowMoreReviews();
});

test("checking all review page elements", async ({ page }) => {
  const reviewsPage = new ReviewsPage(page);
  await reviewsPage.checkPageElements();
});

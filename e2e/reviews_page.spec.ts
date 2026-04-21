import { test } from "@playwright/test";
import { LandingPage } from "./page/landing_page";
import { Navbar } from "./page/navbar";
import { ProfilePage } from "./page/profile_page";
import { ReviewsPage } from "./page/reviews_page";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
  const landingPage = new LandingPage(page);
  landingPage.clickGetStarted();
  landingPage.fillDetails();
  landingPage.clickSignIn();
  const navbar = new Navbar(page);
  navbar.clickProfile();
  const profilePage = new ProfilePage(page);
  profilePage.clickShowMoreReviews();
});

test("checking all review page elements", async ({ page }) => {
  const reviewsPage = new ReviewsPage(page);
  await reviewsPage.checkPageElements();
});

import { test } from "@playwright/test";
import { LandingPage } from "./page/landing_page";
import { AlbumPage } from "./page/album_page";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
  const landingPage = new LandingPage(page);
  await landingPage.clickGetStarted();
  await landingPage.fillDetails();
  await landingPage.clickSignIn();
  await page.waitForURL("http://localhost:3000/home");
  await page.goto("http://localhost:3000/album/Don%20Toliver/Octane");
  await page.waitForURL("http://localhost:3000/album/Don%20Toliver/Octane");
});

test("checking all artist page elements", async ({ page }) => {
  const albumPage = new AlbumPage(page);
  await albumPage.checkPageElements();
});

test("checking review form", async ({ page }) => {
  const albumPage = new AlbumPage(page);
  await albumPage.clickAddAReview();
  await albumPage.checkReviewForm();
});

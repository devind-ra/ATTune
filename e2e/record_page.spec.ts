import { test } from "@playwright/test";
import { LandingPage } from "./page/landing_page";
import { Navbar } from "./page/navbar";
import { RecordPage } from "./page/record_page";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
  const landingPage = new LandingPage(page);
  landingPage.clickGetStarted();
  landingPage.fillDetails();
  landingPage.clickSignIn();
  const navbar = new Navbar(page);
  await navbar.clickRecord();
});

test("checking all normal record page elements", async ({ page }) => {
  const recordPage = new RecordPage(page);
  await recordPage.checkPageElements();
});

test("checking record form elements", async ({ page }) => {
  const recordPage = new RecordPage(page);
  await recordPage.searchAndSelectAlbum();
  await recordPage.checkReviewForm();
});

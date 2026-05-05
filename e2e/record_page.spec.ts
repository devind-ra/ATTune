// Record Page Tests calling POM with content

import { test } from "@playwright/test";
import { LandingPage } from "./page/landing_page";
import { Navbar } from "./page/navbar";
import { RecordPage } from "./page/record_page";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
  const landingPage = new LandingPage(page);
  await landingPage.clickGetStarted();
  await landingPage.fillDetails();
  await landingPage.clickSignIn();
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

test("creating a review", async ({ page }) => {
  const recordPage = new RecordPage(page);
  await recordPage.searchAndSelectAlbum();
  await recordPage.fillReviewForm("5", "Great album!");
  await recordPage.postReview();
});

test("cancelling a review", async ({ page }) => {
  const recordPage = new RecordPage(page);
  await recordPage.searchAndSelectAlbum();
  await recordPage.fillReviewForm("5", "Great album!");
  await recordPage.cancelReview();
});

test("checking comments", async ({ page }) => {
  const recordPage = new RecordPage(page);
  await recordPage.clickAndCheckComments();
});

test("creating a comment", async ({ page }) => {
  const recordPage = new RecordPage(page);
  await recordPage.clickAndCheckComments();
  await recordPage.fillCommentForm("Great review!");
  await recordPage.clickPostComment();
});

test("cancelling a comment", async ({ page }) => {
  const recordPage = new RecordPage(page);
  await recordPage.clickAndCheckComments();
  await recordPage.fillCommentForm("Great review!");
  await recordPage.clickCloseCommentModal();
});

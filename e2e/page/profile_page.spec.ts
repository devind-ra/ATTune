import { test, expect } from "@playwright/test";
import { landingPageContent } from "../content/landing_page_content";
import { homePageContent } from "../content/home_page_content";
import { profilePageContent } from "../content/profile_page_content";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page
    .getByRole("button", { name: landingPageContent.getStartedButton })
    .click();
  await page
    .getByPlaceholder(landingPageContent.handleOrEmailPlaceholder)
    .click();
  await page
    .getByPlaceholder(landingPageContent.handleOrEmailPlaceholder)
    .fill(process.env.BLUESKY_HANDLE!);
  await page
    .getByPlaceholder(landingPageContent.handleOrEmailPlaceholder)
    .click();
  await page
    .getByPlaceholder(landingPageContent.appPasswordPlaceholder)
    .fill(process.env.BLUESKY_APP_PASSWORD!);
  await page
    .getByRole("button", { name: landingPageContent.signInButton })
    .click();
  await page.getByRole("link", { name: homePageContent.profile }).click();
  await expect(page).toHaveURL("http://localhost:3000/profile");
});

test.describe("Profile Page", () => {
  test("checking user profile information", async ({ page }) => {
    await expect(page).toHaveTitle(profilePageContent.title);
    await expect(
      page.getByRole("heading", { name: process.env.BLUESKY_HANDLE! }),
    ).toBeVisible();
    await expect(
      page.getByText("@" + process.env.BLUESKY_HANDLE!),
    ).toBeVisible();
    await expect(page.getByText(profilePageContent.reviewText)).toBeVisible();
    await expect(page.getByText(profilePageContent.followerText)).toBeVisible();
    await expect(
      page.getByText(profilePageContent.followingText),
    ).toBeVisible();
  });

  test("checking user tastes section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: profilePageContent.tastesHeading }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: profilePageContent.artistsSubHeading }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: profilePageContent.genresSubHeading }),
    ).toBeVisible();
    await expect(
      page.getByText(profilePageContent.editTastesText),
    ).toBeVisible();
  });

  test("checking review activity section", async ({ page }) => {
    const activitySection = page.locator("div").filter({
      has: page.getByRole("heading", {
        name: profilePageContent.reviewActivityHeading,
      }),
    });
    const activityGraph = page.locator(".react-activity-calendar__calendar");
    await expect(
      activitySection.getByRole("heading", {
        name: profilePageContent.reviewActivityHeading,
      }),
    ).toBeVisible();
    await expect(activityGraph).toBeVisible();
    await expect(
      activitySection.getByText(profilePageContent.reviewActivityText),
    ).toBeVisible();
    await expect(
      activitySection.getByText(profilePageContent.reviewActivityLessText),
    ).toBeVisible();
    await expect(
      activitySection.getByText(profilePageContent.reviewActivityMoreText, {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("checking user recent reviews section", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: profilePageContent.recentReviewsHeading,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(profilePageContent.recentReviewsListenedOnText),
    ).toHaveCount(2);
    await expect(
      page.getByText(profilePageContent.recentReviewsEditText, { exact: true }),
    ).toHaveCount(2);
    await expect(
      page.getByText(profilePageContent.recentReviewsDeleteText, {
        exact: true,
      }),
    ).toHaveCount(2);
  });

  test("check link to reviews page", async ({ page }) => {
    await page
      .getByRole("link", { name: profilePageContent.showMoreReviewsText })
      .click();
    await expect(page).toHaveURL("http://localhost:3000/reviews");
  });
});

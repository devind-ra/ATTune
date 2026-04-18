import { test, expect } from "@playwright/test";
import { landingPageContent } from "../content/landing_page_content";
import {
  homePageContent,
  homePageLocators,
} from "../content/home_page_content";

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
  await expect(page).toHaveURL("http://localhost:3000/home");
});

test.describe("Home Page", () => {
  test("checking home page main content", async ({ page }) => {
    await expect(page.getByText("Filter Sections")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: homePageContent.recommendedAlbumsHeading,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: homePageContent.recommendedArtistsHeading,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: homePageContent.currentTopArtistsHeading,
      }),
    ).toBeVisible();
    await expect(
      page.locator(homePageLocators.recommendedAlbumsListItems),
    ).toHaveCount(5);
    await expect(
      page.locator(homePageLocators.recommendedArtistsListItems),
    ).toHaveCount(5);
    await expect(
      page.locator(homePageLocators.currentTopArtistsListItems),
    ).toHaveCount(5);
  });

  test("checking home page filters", async ({ page }) => {
    await page.getByText("Filter Sections").click();
    await expect(
      page.getByRole("button", {
        name: homePageContent.recommendedAlbumsHeading,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: homePageContent.recommendedArtistsHeading,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: homePageContent.currentTopArtistsHeading,
      }),
    ).toBeVisible();
  });
});

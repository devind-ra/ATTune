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

test.describe("Navbar", () => {
  test("checking all navbar elements", async ({ page }) => {
    await expect(page).toHaveTitle(homePageContent.title);
    await expect(
      page.getByRole("heading", { name: homePageContent.title }),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder(homePageContent.searchBarPlaceholder).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: homePageContent.profile }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: homePageContent.explore }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: homePageContent.record }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: homePageContent.account }),
    ).toBeVisible();
  });
});

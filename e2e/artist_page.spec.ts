// Artist Page Tests calling POM with content

import { test } from "@playwright/test";
import { LandingPage } from "./page/landing_page";
import { ArtistPage } from "./page/artist_page";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
  const landingPage = new LandingPage(page);
  await landingPage.clickGetStarted();
  await landingPage.fillDetails();
  await landingPage.clickSignIn();
  await page.waitForURL("http://localhost:3000/home");
  await page.goto("http://localhost:3000/artist/drake");
  await page.waitForURL("http://localhost:3000/artist/drake");
});

test("checking all artist page elements", async ({ page }) => {
  const artistPage = new ArtistPage(page);
  await artistPage.checkPageElements();
  await artistPage.checkTopTracks();
  await artistPage.checkDiscography();
});

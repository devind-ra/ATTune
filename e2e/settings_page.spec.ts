import { test } from "@playwright/test";
import { HomePage } from "./page/home_page";
import { LandingPage } from "./page/landing_page";
import { SettingsPage } from "./page/settings_page";
import { Navbar } from "./page/navbar";

test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    const landingPage = new LandingPage(page);
    landingPage.clickGetStarted();
    landingPage.fillDetails();
    landingPage.clickSignIn();
    const navbar = new Navbar(page);
    navbar.clickAccount();
    navbar.clickSettings();
});

test("checking all settings page elements", async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.checkPageElements();
});

test("checking wipe all data button", async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.clickWipeAllDataButton();
    await settingsPage.checkConfirmationModal();
});

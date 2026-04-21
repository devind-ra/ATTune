import { Page, type Locator } from "playwright";
import { expect } from "@playwright/test";
import { homePageContent } from "../content/home_page_content";

export class Navbar {
  private readonly title: string;
  private readonly searchBarPlaceholder: string;
  private readonly profile: string;
  private readonly explore: string;
  private readonly record: string;
  private readonly account: string;
  private readonly settings: string;
  private readonly signOut: string;

  constructor(private page: Page) {
    this.title = homePageContent.title;
    this.searchBarPlaceholder = homePageContent.searchBarPlaceholder;
    this.profile = homePageContent.profile;
    this.explore = homePageContent.explore;
    this.record = homePageContent.record;
    this.account = homePageContent.account;
    this.settings = homePageContent.settings;
    this.signOut = homePageContent.signOut;
  }

  async checkPageElements() {
    await expect(this.page).toHaveTitle(this.title);
    await expect(
      this.page.getByPlaceholder(this.searchBarPlaceholder).first(),
    ).toBeVisible();
    await expect(
      this.page.getByRole("link", { name: this.profile }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("link", { name: this.explore }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.record }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.account }),
    ).toBeVisible();
  }

  async clickProfile() {
    await this.page.getByRole("link", { name: this.profile }).click();
  }

  async clickExplore() {
    await this.page.getByRole("link", { name: this.explore }).click();
  }

  async clickRecord() {
    await this.page.getByRole("button", { name: this.record }).click();
  }

  async clickAccount() {
    await this.page.getByRole("button", { name: this.account }).click();
  }

  async clickSearch() {
    await this.page
      .getByPlaceholder(this.searchBarPlaceholder)
      .first()
      .fill("Drake");
    await this.page
      .getByPlaceholder(this.searchBarPlaceholder)
      .first()
      .press("Enter");
  }

  async clickSettings() {
    await this.page.getByRole("link", { name: this.settings }).click();
  }

  async clickSignOut() {
    await this.page.getByRole("link", { name: this.signOut }).click();
  }
}

export default Navbar;

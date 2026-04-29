import { Page } from "playwright";
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
  private readonly help: string;
  private readonly signOut: string;

  constructor(private page: Page) {
    this.title = homePageContent.title;
    this.searchBarPlaceholder = homePageContent.searchBarPlaceholder;
    this.profile = homePageContent.profile;
    this.explore = homePageContent.explore;
    this.record = homePageContent.record;
    this.account = homePageContent.account;
    this.settings = homePageContent.settings;
    this.help = homePageContent.help;
    this.signOut = homePageContent.signOut;
  }

  async checkPageElements() {
    await expect(this.page).toHaveTitle(this.title);
    await expect(
      this.page.getByPlaceholder(this.searchBarPlaceholder).first(),
    ).toBeVisible();
    await expect(
      this.page.getByRole("link", { name: this.profile }).first(),
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
    await this.page.getByRole("link", { name: this.profile }).first().click();
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

  async clickSearch(query: string) {
    const searchBar = this.page
      .getByPlaceholder(this.searchBarPlaceholder)
      .first();

    await searchBar.waitFor({ state: "visible", timeout: 10000 });
    await searchBar.fill(query);
    await searchBar.press("Enter");
  }

  async clickSettings() {
    await this.page.getByRole("link", { name: this.settings }).click();
  }

  async clickHelp() {
    await this.page.getByRole("link", { name: this.help }).click();
  }

  async clickSignOut() {
    await this.page.getByRole("link", { name: this.signOut }).click();
  }
}

export default Navbar;

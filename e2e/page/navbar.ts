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

  constructor(private page: Page) {
    this.title = homePageContent.title;
    this.searchBarPlaceholder = homePageContent.searchBarPlaceholder;
    this.profile = homePageContent.profile;
    this.explore = homePageContent.explore;
    this.record = homePageContent.record;
    this.account = homePageContent.account;
  }

  async checkPageElements(): Promise<void> {
    await Promise.all([
      await expect(this.page).toHaveTitle(this.title),
      await expect(
        this.page.getByPlaceholder(this.searchBarPlaceholder),
      ).toBeVisible(),
      await expect(
        this.page.getByRole("link", { name: this.profile }),
      ).toBeVisible(),
      await expect(
        this.page.getByRole("link", { name: this.explore }),
      ).toBeVisible(),
      await expect(
        this.page.getByRole("button", { name: this.record }),
      ).toBeVisible(),
      await expect(
        this.page.getByRole("button", { name: this.account }),
      ).toBeVisible(),
    ]);
  }

  async clickProfile(): Promise<void> {
    await this.page.getByRole("link", { name: this.profile }).click();
  }

  async clickExplore(): Promise<void> {
    await this.page.getByRole("link", { name: this.explore }).click();
  }

  async clickRecord(): Promise<void> {
    await this.page.getByRole("button", { name: this.record }).click();
  }

  async clickAccount(): Promise<void> {
    await this.page.getByRole("button", { name: this.account }).click();
  }
}

export default Navbar;

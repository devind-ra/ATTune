import { Page, type Locator } from "playwright";
import { expect } from "@playwright/test";
import { searchPageContent } from "../content/search_page_content";

export class SearchPage {
  private readonly title: string;
  private readonly heading: string;
  private readonly artistHeading: string;
  private readonly albumHeading: string;
  private readonly usersHeading: string;

  constructor(private page: Page) {
    this.title = searchPageContent.title;
    this.heading = searchPageContent.heading("Drake");
    this.artistHeading = searchPageContent.artistHeading;
    this.albumHeading = searchPageContent.albumHeading;
    this.usersHeading = searchPageContent.usersHeading;
  }

  async checkPageElements() {
    await expect(this.page).toHaveTitle(this.title);
    await expect(
      this.page.getByRole("heading", { name: this.heading }),
    ).toBeVisible();
    await this.checkArtistSection();
    await this.checkAlbumSection();
    await this.checkUserSection();
  }

  async checkArtistSection() {
    const artists = this.page
      .locator("section")
      .filter({ hasText: this.artistHeading })
      .locator("li");
    await expect(
      this.page.getByRole("heading", { name: this.artistHeading }),
    ).toBeVisible();
    await expect(artists).toHaveCount(10);
  }

  async checkAlbumSection() {
    const albums = this.page
      .locator("section")
      .filter({ hasText: this.albumHeading })
      .locator("li");
    await expect(
      this.page.getByRole("heading", { name: this.albumHeading }),
    ).toBeVisible();
    await expect(albums).toHaveCount(10);
  }

  async checkUserSection() {
    const users = this.page
      .locator("section")
      .filter({ hasText: this.usersHeading })
      .locator("li");
    await expect(
      this.page.getByRole("heading", { name: this.usersHeading }),
    ).toBeVisible();
    await expect(users).toHaveCount(10);
  }

  async clickProfile() {
    const user = this.page
      .locator("section")
      .filter({ hasText: this.usersHeading })
      .locator("li")
      .first()
      .locator("a");

    await user.waitFor({ state: "visible", timeout: 15000 });
    await this.page.waitForTimeout(3000);
    await user.click();
  }
}

export default SearchPage;

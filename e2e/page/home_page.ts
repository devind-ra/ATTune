import { Page, type Locator } from "playwright";
import { expect } from "@playwright/test";
import { homePageContent } from "../content/home_page_content";

export class HomePage {
  private readonly title: string;
  private readonly filterSectionsText: string;
  private readonly recommendedAlbumsHeading: string;
  private readonly recommendedArtistsHeading: string;
  private readonly currentTopArtistsHeading: string;

  constructor(private page: Page) {
    this.title = homePageContent.title;
    this.filterSectionsText = homePageContent.filterSectionsText;
    this.recommendedAlbumsHeading = homePageContent.recommendedAlbumsHeading;
    this.recommendedArtistsHeading = homePageContent.recommendedArtistsHeading;
    this.currentTopArtistsHeading = homePageContent.currentTopArtistsHeading;
  }

  async checkPageElements() {
    await expect(this.page).toHaveTitle(this.title);
    await this.checkFilters();
    await this.checkRecommendedAlbums();
    await this.checkRecommendedArtists();
    await this.checkCurrentTopArtists();
  }

  async checkFilters() {
    await this.page
      .getByRole("button", { name: this.filterSectionsText })
      .click();
    await expect(
      this.page.getByRole("button", { name: this.recommendedAlbumsHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.recommendedArtistsHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.currentTopArtistsHeading }),
    ).toBeVisible();
  }

  async checkRecommendedAlbums() {
    await expect(
      this.page.getByRole("heading", { name: this.recommendedAlbumsHeading }),
    ).toBeVisible();
    const recommendedAlbumsListItems = this.page
      .locator("section")
      .filter({ hasText: this.recommendedAlbumsHeading })
      .locator("li");
    await expect(recommendedAlbumsListItems).toHaveCount(5);
  }

  async checkRecommendedArtists() {
    await expect(
      this.page.getByRole("heading", {
        name: this.recommendedArtistsHeading,
      }),
    ).toBeVisible();
    const recommendedArtistsListItems = this.page
      .locator("section")
      .filter({ hasText: this.recommendedArtistsHeading })
      .locator("li");
    await expect(recommendedArtistsListItems).toHaveCount(5);
  }

  async checkCurrentTopArtists() {
    await expect(
      this.page.getByRole("heading", { name: this.currentTopArtistsHeading }),
    ).toBeVisible();
    const currentTopArtistsListItems = this.page
      .locator("section")
      .filter({ hasText: this.currentTopArtistsHeading })
      .locator("li");
    await expect(currentTopArtistsListItems).toHaveCount(5);
  }
}

export default HomePage;

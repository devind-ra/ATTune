import { Page, type Locator } from "playwright";
import { expect } from "@playwright/test";
import { homePageContent } from "../content/home_page_content";

export class HomePage {
  private readonly title: string;
  private readonly filterSectionsText: string;
  private readonly recommendedArtistsByTasteHeading: string;
  private readonly similarArtistsByTasteHeading: string;
  private readonly recommendedAlbumsHeading: string;

  constructor(private page: Page) {
    this.title = homePageContent.title;
    this.filterSectionsText = homePageContent.filterSectionsText;
    this.recommendedArtistsByTasteHeading =
      homePageContent.recommendedArtistsByTasteHeading;
    this.similarArtistsByTasteHeading =
      homePageContent.similarArtistsByTasteHeading;
    this.recommendedAlbumsHeading = homePageContent.recommendedAlbumsHeading;
  }

  async checkPageElements() {
    await expect(this.page).toHaveTitle(this.title);
    await this.checkFilters();
    await this.checkRecommendedArtistsByTaste();
    await this.checkSimilarArtistsByTaste();
    await this.checkRecommendedAlbums();
  }

  async checkFilters() {
    await this.page
      .getByRole("button", { name: this.filterSectionsText })
      .click();
    await expect(
      this.page.getByRole("button", {
        name: this.recommendedArtistsByTasteHeading,
      }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", {
        name: this.similarArtistsByTasteHeading,
      }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.recommendedAlbumsHeading }),
    ).toBeVisible();
  }

  async checkRecommendedArtistsByTaste() {
    const recommendedArtistsByTasteListItems = this.page
      .locator("section")
      .filter({ hasText: this.recommendedArtistsByTasteHeading })
      .locator("li");
    await expect(
      this.page.getByRole("heading", {
        name: this.recommendedArtistsByTasteHeading,
      }),
    ).toBeVisible();
    await expect(recommendedArtistsByTasteListItems).toHaveCount(5);
  }

  async checkSimilarArtistsByTaste() {
    const similarArtistsByTasteListItems = this.page
      .locator("section")
      .filter({ hasText: this.similarArtistsByTasteHeading })
      .locator("li");
    await expect(
      this.page.getByRole("heading", {
        name: this.similarArtistsByTasteHeading,
      }),
    ).toBeVisible();
    await expect(similarArtistsByTasteListItems).toHaveCount(5);
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
}

export default HomePage;

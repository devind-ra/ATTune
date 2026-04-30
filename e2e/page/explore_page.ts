import { Page } from "playwright";
import { expect } from "@playwright/test";
import { explorePageContent } from "../content/explore_page_content";

export class ExplorePage {
  private readonly title: string;
  private readonly heading: string;
  private readonly description: string;
  private readonly filterSectionsText: string;
  private readonly discoverAlbumsHeading: string;
  private readonly moreOnLastFMText: string;
  private readonly topArtistsHeading: string;
  private readonly topArtistsDescription: string;
  private readonly trendingTracksHeading: string;
  private readonly trendingTracksDescription: string;
  private readonly geoTopArtistsHeading: string;
  private readonly geoTopArtistsDescription: string;
  private readonly countryDropdownPlaceholder: string;
  private readonly shuffleButtonText: string;

  constructor(private page: Page) {
    this.title = explorePageContent.title;
    this.heading = explorePageContent.heading;
    this.description = explorePageContent.description;
    this.filterSectionsText = explorePageContent.filterSectionsText;
    this.discoverAlbumsHeading = explorePageContent.discoverAlbumsHeading;
    this.moreOnLastFMText = explorePageContent.moreOnLastFMText;
    this.topArtistsHeading = explorePageContent.topArtistsHeading;
    this.topArtistsDescription = explorePageContent.topArtistsDescription;
    this.trendingTracksHeading = explorePageContent.trendingTracksHeading;
    this.trendingTracksDescription =
      explorePageContent.trendingTracksDescription;
    this.geoTopArtistsHeading = explorePageContent.geoTopArtistsHeading;
    this.geoTopArtistsDescription = explorePageContent.geoTopArtistsDescription;
    this.countryDropdownPlaceholder =
      explorePageContent.countryDropdownPlaceholder;
    this.shuffleButtonText = explorePageContent.shuffleButtonText;
  }

  async checkPageElements() {
    await this.checkExploreGenresSection();
    await this.checkFilters();
    await this.checkTopArtistsSection();
    await this.checkTrendingGloballySection();
    await this.checkGeoTopArtistsSection();
  }

  async checkExploreGenresSection() {
    await expect(this.page).toHaveTitle(this.title);
    await expect(
      this.page.getByRole("heading", { name: this.heading }),
    ).toBeVisible();
    await expect(this.page.getByText(this.shuffleButtonText)).toHaveCount(3);
    await expect(this.page.getByText(this.description)).toBeVisible();
    await expect(
      this.page.getByRole("heading", { name: this.discoverAlbumsHeading }),
    ).toHaveCount(3);
    await expect(this.page.getByText(this.moreOnLastFMText)).toHaveCount(3);
  }

  async checkFilters() {
    await this.page
      .getByRole("button", { name: this.filterSectionsText })
      .click();
    await expect(
      this.page.getByRole("button", {
        name: this.discoverAlbumsHeading,
      }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", {
        name: this.topArtistsHeading,
      }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.trendingTracksHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.geoTopArtistsHeading }),
    ).toBeVisible();
  }

  async checkTopArtistsSection() {
    const topArtists = this.page
      .locator("section")
      .filter({ hasText: this.topArtistsHeading })
      .locator("li");
    await expect(
      this.page.getByRole("heading", { name: this.topArtistsHeading }),
    ).toBeVisible();
    await expect(this.page.getByText(this.topArtistsDescription)).toBeVisible();
    await expect(topArtists).toHaveCount(10);
  }

  async checkTrendingGloballySection() {
    const trendingTracks = this.page
      .locator("section")
      .filter({ hasText: this.trendingTracksHeading })
      .locator("li");
    await expect(
      this.page.getByRole("heading", { name: this.trendingTracksHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.trendingTracksDescription),
    ).toBeVisible();
    await expect(trendingTracks).toHaveCount(10);
  }

  async checkGeoTopArtistsSection() {
    await expect(
      this.page.getByRole("heading", { name: this.geoTopArtistsHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.geoTopArtistsDescription),
    ).toBeVisible();
  }

  async changeCountry() {
    await this.page
      .getByLabel(this.countryDropdownPlaceholder)
      .selectOption("United Kingdom");
    await expect(this.page.getByText("United Kingdom")).toBeVisible();
  }

  async clickShuffleButtonOne() {
    await this.page
      .getByRole("button", { name: this.shuffleButtonText })
      .first()
      .click();
  }

  async clickShuffleButtonTwo() {
    await this.page
      .getByRole("button", { name: this.shuffleButtonText })
      .nth(1)
      .click();
  }

  async clickShuffleButtonThree() {
    await this.page
      .getByRole("button", { name: this.shuffleButtonText })
      .nth(2)
      .click();
  }
}

export default ExplorePage;

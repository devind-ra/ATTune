import { Page, type Locator } from "playwright";
import { expect } from "@playwright/test";
import { explorePageContent } from "../content/explore_page_content";

export class ExplorePage {
  private readonly title: string;
  private readonly heading: string;
  private readonly description: string;
  private readonly discoverSubHeading: string;
  private readonly moreOnLastFM: string;
  private readonly topArtistsHeading: string;
  private readonly topArtistsDescription: string;
  private readonly trendingGloballyHeading: string;
  private readonly trendingGloballyDescription: string;
  private readonly globalSoundsHeading: string;
  private readonly globalSoundsDescription: string;
  private readonly countryDropdownPlaceholder: string;

  constructor(private page: Page) {
    this.title = explorePageContent.title;
    this.heading = explorePageContent.heading;
    this.description = explorePageContent.description;
    this.discoverSubHeading = explorePageContent.discoverSubHeading;
    this.moreOnLastFM = explorePageContent.moreOnLastFM;
    this.topArtistsHeading = explorePageContent.topArtistsHeading;
    this.topArtistsDescription = explorePageContent.topArtistsDescription;
    this.trendingGloballyHeading = explorePageContent.trendingGloballyHeading;
    this.trendingGloballyDescription =
      explorePageContent.trendingGloballyDescription;
    this.globalSoundsHeading = explorePageContent.globalSoundsHeading;
    this.globalSoundsDescription = explorePageContent.globalSoundsDescription;
    this.countryDropdownPlaceholder =
      explorePageContent.countryDropdownPlaceholder;
  }

  async checkExploreGenresSection() {
    await expect(this.page).toHaveTitle(this.title);
    await expect(
      this.page.getByRole("heading", { name: this.heading }),
    ).toBeVisible();
    await expect(this.page.getByText(this.description)).toBeVisible();
    await expect(
      this.page.getByRole("heading", {
        name: this.discoverSubHeading,
        exact: true,
      }),
    ).toHaveCount(3);
    await expect(
      this.page.getByRole("link", { name: this.moreOnLastFM }),
    ).toHaveCount(3);
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
      .filter({ hasText: this.trendingGloballyHeading })
      .locator("li");
    await expect(
      this.page.getByRole("heading", { name: this.trendingGloballyHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.trendingGloballyDescription),
    ).toBeVisible();
    await expect(trendingTracks).toHaveCount(10);
  }

  async checkGlobalSoundsSection() {
    await expect(
      this.page.getByRole("heading", { name: this.globalSoundsHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.globalSoundsDescription),
    ).toBeVisible();
  }

  async changeCountry() {
    await this.page
      .getByLabel(this.countryDropdownPlaceholder)
      .selectOption("United Kingdom");
    await expect(this.page.getByText("United Kingdom")).toBeVisible();
  }
}

export default ExplorePage;

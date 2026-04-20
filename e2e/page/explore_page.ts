import { Page, type Locator } from "playwright";
import { expect } from "@playwright/test";
import { explorePageContent } from "../content/explore_page_content";

export class ExplorePage {
  private readonly title: string;
  private readonly heading: string;
  private readonly description: string;
  private readonly discoverSubHeading: string;
  private readonly moreOnLastFM: string;
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

  async checkTrendingGloballySection() {
    await expect(
      this.page.getByRole("heading", { name: this.trendingGloballyHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.trendingGloballyDescription),
    ).toBeVisible();
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

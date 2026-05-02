import { Page } from "playwright";
import { expect } from "@playwright/test";
import { reviewsPageContent } from "../content/reviews_page_content";

export class ReviewsPage {
  private readonly title: string;
  private readonly heading: string;
  private readonly backToProfile: string;
  private readonly reviewFunctionsSubheading: string;
  private readonly sortBy: string;
  private readonly latestListened: string;
  private readonly earliestListened: string;
  private readonly highestRated: string;
  private readonly lowestRated: string;
  private readonly sortSelect: string;

  constructor(private page: Page) {
    this.title = reviewsPageContent.title;
    this.heading = reviewsPageContent.heading;
    this.backToProfile = reviewsPageContent.backToProfile;
    this.reviewFunctionsSubheading =
      reviewsPageContent.reviewFunctionsSubheading;
    this.sortBy = reviewsPageContent.sortBy;
    this.latestListened = reviewsPageContent.latestListened;
    this.earliestListened = reviewsPageContent.earliestListened;
    this.highestRated = reviewsPageContent.highestRated;
    this.lowestRated = reviewsPageContent.lowestRated;
    this.sortSelect = "#sort-select";
  }

  async checkPageElements() {
    await expect(this.page).toHaveTitle(this.title);
    await expect(
      this.page.getByRole("heading", { name: this.heading }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("link", { name: this.backToProfile }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.reviewFunctionsSubheading),
    ).toBeVisible();
    await expect(this.page.getByText(this.sortBy)).toBeVisible();
  }

  async sortByLatestListened() {
    await this.selectSortOption(this.latestListened);
  }

  async sortByEarliestListened() {
    await this.selectSortOption(this.earliestListened);
  }

  async sortByHighestRated() {
    await this.selectSortOption(this.highestRated);
  }

  async sortByLowestRated() {
    await this.selectSortOption(this.lowestRated);
  }

  async selectSortOption(option: string) {
    await this.page.locator(this.sortSelect).click();
    await this.page.locator(this.sortSelect).selectOption({ label: option });
  }
}

export default ReviewsPage;

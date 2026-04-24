import { Page, type Locator } from "playwright";
import { expect } from "@playwright/test";
import { otherUserReviewsPageContent } from "../content/other_user_reviews_page_content";

export class OtherUserReviewsPage {
  private readonly title: string;
  private readonly heading: string;
  private readonly backtoProfile: string;
  private readonly reviewFunctionsSubheading: string;
  private readonly sortBy: string;
  private readonly latestListened: string;
  private readonly earliestListened: string;
  private readonly highestRated: string;
  private readonly lowestRated: string;

  constructor(private page: Page) {
    this.title = otherUserReviewsPageContent.title;
    this.heading = otherUserReviewsPageContent.heading;
    this.backtoProfile = otherUserReviewsPageContent.backtoProfile(
      process.env.OTHER_BLUESKY_HANDLE!,
    );
    this.reviewFunctionsSubheading =
      otherUserReviewsPageContent.reviewFunctionsSubheading;
    this.sortBy = otherUserReviewsPageContent.sortBy;
    this.latestListened = otherUserReviewsPageContent.latestListened;
    this.earliestListened = otherUserReviewsPageContent.earliestListened;
    this.highestRated = otherUserReviewsPageContent.highestRated;
    this.lowestRated = otherUserReviewsPageContent.lowestRated;
  }

  async checkPageElements() {
    await expect(this.page).toHaveTitle(this.title);
    await expect(
      this.page.getByRole("heading", { name: this.heading }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("link", { name: this.backtoProfile }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.reviewFunctionsSubheading),
    ).toBeVisible();
    await expect(this.page.getByText(this.sortBy)).toBeVisible();
  }
}

export default OtherUserReviewsPage;

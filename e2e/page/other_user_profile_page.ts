import { Page, type Locator } from "playwright";
import { expect } from "@playwright/test";
import { otherUserProfilePageContent } from "../content/other_user_profile_page_content";

export class OtherUserProfilePage {
  private readonly title: string;
  private readonly reviewText: string;
  private readonly followerText: string;
  private readonly followingText: string;
  private readonly followButtonText: string;
  private readonly unfollowButtonText: string;
  private readonly tastesHeading: string;
  private readonly artistsSubHeading: string;
  private readonly genresSubHeading: string;
  private readonly reviewActivityHeading: string;
  private readonly reviewActivityText: string;
  private readonly reviewActivityLessText: string;
  private readonly reviewActivityMoreText: string;
  private readonly recentReviewsHeading: string;
  private readonly recentReviewsSubHeading: string;
  private readonly recentReviewsListenedOnText: string;
  private readonly showMoreReviewsText: string;

  constructor(private page: Page) {
    this.title = otherUserProfilePageContent.title;
    this.reviewText = otherUserProfilePageContent.reviewText;
    this.followerText = otherUserProfilePageContent.followerText;
    this.followingText = otherUserProfilePageContent.followingText;
    this.followButtonText = otherUserProfilePageContent.followButtonText;
    this.unfollowButtonText = otherUserProfilePageContent.unfollowButtonText;
    this.tastesHeading = otherUserProfilePageContent.tastesHeading;
    this.artistsSubHeading = otherUserProfilePageContent.artistsSubHeading;
    this.genresSubHeading = otherUserProfilePageContent.genresSubHeading;
    this.reviewActivityHeading =
      otherUserProfilePageContent.reviewActivityHeading;
    this.reviewActivityText = otherUserProfilePageContent.reviewActivityText;
    this.reviewActivityLessText =
      otherUserProfilePageContent.reviewActivityLessText;
    this.reviewActivityMoreText =
      otherUserProfilePageContent.reviewActivityMoreText;
    this.recentReviewsHeading =
      otherUserProfilePageContent.recentReviewsHeading;
    this.recentReviewsSubHeading =
      otherUserProfilePageContent.recentReviewsSubHeading;
    this.recentReviewsListenedOnText =
      otherUserProfilePageContent.recentReviewsListenedOnText;
    this.showMoreReviewsText = otherUserProfilePageContent.showMoreReviewsText;
  }

  async checkUserProfileInformation() {
    await expect(this.page).toHaveTitle(this.title);
    await expect(
      this.page.getByRole("heading", {
        name: process.env.OTHER_BLUESKY_HANDLE!,
      }),
    ).toBeVisible();
    await expect(
      this.page.getByText("@" + process.env.OTHER_BLUESKY_HANDLE!),
    ).toBeVisible();
    await expect(this.page.getByText(this.reviewText)).toBeVisible();
    await expect(this.page.getByText(this.followerText)).toBeVisible();
    await expect(this.page.getByText(this.followingText)).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.followButtonText }),
    ).toBeVisible();
  }

  async checkUserTastes() {
    await expect(
      this.page.getByRole("heading", { name: this.tastesHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("heading", { name: this.artistsSubHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("heading", { name: this.genresSubHeading }),
    ).toBeVisible();
  }

  async checkReviewActivity() {
    const activitySection = this.page.locator("div").filter({
      has: this.page.getByRole("heading", {
        name: this.reviewActivityHeading,
      }),
    });
    const activityGraph = this.page.locator(
      ".react-activity-calendar__calendar",
    );
    (await expect(
      activitySection.getByRole("heading", {
        name: this.reviewActivityHeading,
      }),
    ).toBeVisible(),
      await expect(activityGraph).toBeVisible(),
      await expect(this.page.getByText(this.reviewActivityText)).toBeVisible());
    await expect(
      this.page.getByText(this.reviewActivityLessText),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.reviewActivityMoreText, { exact: true }),
    ).toBeVisible();
  }

  async checkRecentReviews() {
    await expect(
      this.page.getByRole("heading", { name: this.recentReviewsHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("heading", { name: this.recentReviewsSubHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.recentReviewsListenedOnText),
    ).toHaveCount(2);
    await expect(
      this.page.getByText(this.recentReviewsListenedOnText),
    ).toHaveCount(2);
    await expect(
      this.page.getByRole("link", { name: this.showMoreReviewsText }),
    ).toBeVisible();
  }

  async clickShowMoreReviews() {
    await this.page
      .getByRole("link", { name: this.showMoreReviewsText })
      .click();
    await expect(this.page).toHaveURL(
      `http://localhost:3000/${process.env.OTHER_BLUESKY_HANDLE!}/reviews`,
    );
  }
}

export default OtherUserProfilePage;

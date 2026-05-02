import { Page } from "playwright";
import { expect } from "@playwright/test";
import { profilePageContent } from "../content/profile_page_content";

export class ProfilePage {
  private readonly title: string;
  private readonly reviewText: string;
  private readonly followerText: string;
  private readonly followingText: string;
  private readonly tastesHeading: string;
  private readonly artistsSubHeading: string;
  private readonly artistsFormSubheading: string;
  private readonly genresSubHeading: string;
  private readonly genresFormSubheading: string;
  private readonly editTastesText: string;
  private readonly saveTastesButton: string;
  private readonly cancelTastesButton: string;
  private readonly reviewActivityHeading: string;
  private readonly reviewActivityText: string;
  private readonly reviewActivityLessText: string;
  private readonly reviewActivityMoreText: string;
  private readonly recentReviewsHeading: string;
  private readonly recentReviewsListenedOnText: string;
  private readonly recentReviewsEditText: string;
  private readonly recentReviewsDeleteText: string;
  private readonly showMoreReviewsText: string;

  constructor(private page: Page) {
    this.title = profilePageContent.title;
    this.reviewText = profilePageContent.reviewText;
    this.followerText = profilePageContent.followerText;
    this.followingText = profilePageContent.followingText;
    this.tastesHeading = profilePageContent.tastesHeading;
    this.artistsSubHeading = profilePageContent.artistsSubHeading;
    this.artistsFormSubheading = profilePageContent.artistsFormSubheading;
    this.genresSubHeading = profilePageContent.genresSubHeading;
    this.genresFormSubheading = profilePageContent.genresFormSubheading;
    this.editTastesText = profilePageContent.editTastesText;
    this.saveTastesButton = profilePageContent.saveTastesButton;
    this.cancelTastesButton = profilePageContent.cancelTastesButton;
    this.reviewActivityHeading = profilePageContent.reviewActivityHeading;
    this.reviewActivityText = profilePageContent.reviewActivityText;
    this.reviewActivityLessText = profilePageContent.reviewActivityLessText;
    this.reviewActivityMoreText = profilePageContent.reviewActivityMoreText;
    this.recentReviewsHeading = profilePageContent.recentReviewsHeading;
    this.recentReviewsListenedOnText =
      profilePageContent.recentReviewsListenedOnText;
    this.recentReviewsEditText = profilePageContent.recentReviewsEditText;
    this.recentReviewsDeleteText = profilePageContent.recentReviewsDeleteText;
    this.showMoreReviewsText = profilePageContent.showMoreReviewsText;
  }

  async checkUserProfileInformation() {
    await expect(this.page).toHaveTitle(this.title);
    await expect(
      this.page.getByRole("heading", { name: process.env.BLUESKY_HANDLE! }),
    ).toBeVisible();
    await expect(
      this.page.getByText("@" + process.env.BLUESKY_HANDLE!),
    ).toBeVisible();
    await expect(this.page.getByText(this.reviewText)).toBeVisible();
    await expect(this.page.getByText(this.followerText)).toBeVisible();
    await expect(this.page.getByText(this.followingText)).toBeVisible();
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
    await expect(
      this.page.getByRole("button", { name: this.editTastesText }),
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
      this.page.getByText(this.recentReviewsListenedOnText),
    ).toHaveCount(2);
    await expect(
      this.page.getByText(this.recentReviewsListenedOnText),
    ).toHaveCount(2);
    await expect(
      this.page.getByText(this.recentReviewsEditText, {
        exact: true,
      }),
    ).toHaveCount(2);
    await expect(
      this.page.getByText(this.recentReviewsDeleteText, {
        exact: true,
      }),
    ).toHaveCount(2);
    await expect(
      this.page.getByRole("link", { name: this.showMoreReviewsText }),
    ).toBeVisible();
  }

  async checkEditTastes() {
    await this.clickEditTastes();
    await expect(
      this.page.getByRole("heading", { name: this.artistsFormSubheading }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("heading", { name: this.genresFormSubheading }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.saveTastesButton }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.cancelTastesButton }),
    ).toBeVisible();
  }

  async clickEditTastes() {
    await this.page.getByRole("button", { name: this.editTastesText }).click();
  }

  async clickSaveTastes() {
    await this.page
      .getByRole("button", { name: this.saveTastesButton })
      .click();
  }

  async clickCancelTastes() {
    await this.page
      .getByRole("button", { name: this.cancelTastesButton })
      .click();
  }

  async clickShowMoreReviews() {
    await this.page
      .getByRole("link", { name: this.showMoreReviewsText })
      .click();
    await expect(this.page).toHaveURL("http://localhost:3000/reviews");
  }
}

export default ProfilePage;

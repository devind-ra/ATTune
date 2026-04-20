import { Page, type Locator } from "playwright";
import { expect } from "@playwright/test";
import { recordPageContent } from "../content/record_page_content";

export class RecordPage {
  private readonly title: string;
  private readonly heading: string;
  private readonly description: string;
  private readonly searchPlaceholder: string;
  private readonly startTypingMessage: string;
  private readonly yourReviewsHeading: string;
  private readonly reviewFunctionsSubheading: string;
  private readonly ratingHeading: string;
  private readonly rating: string;
  private readonly reviewHeading: string;
  private readonly reviewTextPlaceholder: string;
  private readonly dateListenedHeading: string;
  private readonly publishToBluesky: string;
  private readonly publishToBlueskyDescription: string;
  private readonly postReviewButton: string;
  private readonly cancelButton: string;

  constructor(private page: Page) {
    this.title = recordPageContent.title;
    this.heading = recordPageContent.heading;
    this.description = recordPageContent.description;
    this.searchPlaceholder = recordPageContent.searchPlaceholder;
    this.startTypingMessage = recordPageContent.startTypingMessage;
    this.yourReviewsHeading = recordPageContent.yourReviewsHeading;
    this.reviewFunctionsSubheading =
      recordPageContent.reviewFunctionsSubheading;
    this.ratingHeading = recordPageContent.ratingHeading;
    this.rating = recordPageContent.rating;
    this.reviewHeading = recordPageContent.reviewHeading;
    this.reviewTextPlaceholder = recordPageContent.reviewTextPlaceholder;
    this.dateListenedHeading = recordPageContent.dateListenedHeading;
    this.publishToBluesky = recordPageContent.publishToBluesky;
    this.publishToBlueskyDescription =
      recordPageContent.publishToBlueskyDescription;
    this.postReviewButton = recordPageContent.postReviewButton;
    this.cancelButton = recordPageContent.cancelButton;
  }

  async checkPageElements() {
    await expect(this.page).toHaveTitle(this.title);
    await this.checkReviewModal();
    await this.checkYourReviews();
  }

  async checkReviewModal() {
    await expect(
      this.page.getByRole("heading", { name: this.heading }),
    ).toBeVisible();
    await expect(this.page.getByText(this.description)).toBeVisible();
    await expect(
      this.page.getByPlaceholder(this.searchPlaceholder),
    ).toBeVisible();
    await expect(this.page.getByText(this.startTypingMessage)).toBeVisible();
  }

  async checkYourReviews() {
    await expect(
      this.page.getByRole("heading", { name: this.yourReviewsHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.reviewFunctionsSubheading),
    ).toBeVisible();
  }

  async searchAndSelectAlbum() {
    await this.page.getByPlaceholder(this.searchPlaceholder).click();
    await this.page
      .getByPlaceholder(this.searchPlaceholder)
      .fill(recordPageContent.albumName);
    await this.page.waitForTimeout(1000);
    await this.page.getByText(recordPageContent.artistName).first().click();
  }

  async checkReviewForm() {
    await expect(this.page.getByText(this.ratingHeading)).toBeVisible();
    await expect(
      this.page.getByText(this.reviewHeading, { exact: true }),
    ).toBeVisible();
    await expect(
      this.page.getByPlaceholder(this.reviewTextPlaceholder),
    ).toBeVisible();
    await expect(this.page.getByText(this.dateListenedHeading)).toBeVisible();
    await expect(
      this.page.getByRole("checkbox", { name: this.publishToBluesky }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.publishToBlueskyDescription),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.postReviewButton }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.cancelButton }),
    ).toBeVisible();
  }

  async fillReviewForm(
    rating: string,
    reviewText: string,
    dateListened: string,
  ) {
    await this.page.getByRole("button", { name: rating }).click();
    await this.page
      .getByPlaceholder(this.reviewTextPlaceholder)
      .fill(reviewText);
    await this.page
      .getByPlaceholder(this.dateListenedHeading)
      .fill(dateListened);
  }
}

export default RecordPage;

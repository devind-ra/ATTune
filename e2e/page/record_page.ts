// Record Page POM
// Contains the following:
// - Constructor for elements on record page
// - Methods for checking elements
// - Methods for interacting with elements on record page

import { Page } from "playwright";
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
  private readonly albumName: string;
  private readonly artistName: string;
  private readonly ratingHeading: string;
  private readonly rating: string;
  private readonly reviewHeading: string;
  private readonly reviewTextPlaceholder: string;
  private readonly dateListenedHeading: string;
  private readonly publishToBluesky: string;
  private readonly publishToBlueskyDescription: string;
  private readonly postReviewButton: string;
  private readonly cancelButton: string;
  private readonly commentsText: string;
  private readonly addCommentLabel: string;
  private readonly firstReviewLocator: string;
  private readonly commentFormLocator: string;
  private readonly postCommentButton: string;
  private readonly closeCommentModal: string;

  constructor(private page: Page) {
    this.title = recordPageContent.title;
    this.heading = recordPageContent.heading;
    this.description = recordPageContent.description;
    this.searchPlaceholder = recordPageContent.searchPlaceholder;
    this.startTypingMessage = recordPageContent.startTypingMessage;
    this.yourReviewsHeading = recordPageContent.yourReviewsHeading;
    this.reviewFunctionsSubheading =
      recordPageContent.reviewFunctionsSubheading;
    this.albumName = recordPageContent.albumName("Octane");
    this.artistName = recordPageContent.artistName("Don Toliver");
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
    this.commentsText = recordPageContent.commentsText;
    this.addCommentLabel = recordPageContent.addCommentLabel;
    this.firstReviewLocator = recordPageContent.firstReviewLocator;
    this.commentFormLocator = recordPageContent.commentFormLocator;
    this.postCommentButton = recordPageContent.postCommentButton;
    this.closeCommentModal = recordPageContent.closeCommentModal;
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
      .fill(this.albumName);
    await this.page.waitForTimeout(1000);
    await this.page.getByText(this.artistName).first().click();
    await this.page.waitForTimeout(1000);
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

  async fillReviewForm(rating: string, reviewText: string) {
    await this.page
      .getByRole("button", { name: `Rate ${rating} stars`, exact: true })
      .click();
    await this.page
      .getByPlaceholder(this.reviewTextPlaceholder)
      .fill(reviewText);
  }

  async clickAndCheckComments() {
    await this.page.locator(this.firstReviewLocator).click();
    await expect(this.page.getByText(this.commentsText)).toBeVisible();
    await expect(this.page.getByLabel(this.addCommentLabel)).toBeVisible();
  }

  async fillCommentForm(comment: string) {
    await this.page.locator(this.commentFormLocator).fill(comment);
  }

  async clickPostComment() {
    await this.page
      .getByRole("button", { name: this.postCommentButton })
      .click();
  }

  async clickCloseCommentModal() {
    await this.page
      .getByRole("button", { name: this.closeCommentModal })
      .click();
  }

  async postReview() {
    await this.page
      .getByRole("button", { name: this.postReviewButton })
      .click();
  }

  async cancelReview() {
    await this.page.getByRole("button", { name: this.cancelButton }).click();
  }
}

export default RecordPage;

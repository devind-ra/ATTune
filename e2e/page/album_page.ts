// Album Page POM
// Contains the following:
// - Constructor for elements on album page
// - Methods for checking elements

import { Page } from "playwright";
import { expect } from "@playwright/test";
import { albumPageContent } from "../content/album_page_content";

export class AlbumPage {
  private readonly title: string;
  private readonly heading: string;
  private readonly artistSubheading: string;
  private readonly released: string;
  private readonly tags: string[];
  private readonly viewFullAlbum: string;
  private readonly addAReview: string;
  private readonly otherUsersReviews: string;
  private readonly yourReviews: string;
  private readonly reviewFunctionsSubheading: string;
  private readonly albumName: string;
  private readonly artistName: string;
  private readonly ratingHeading: string;
  private readonly reviewHeading: string;
  private readonly rating: string;
  private readonly reviewTextPlaceholder: string;
  private readonly dateListenedHeading: string;
  private readonly publishToBluesky: string;
  private readonly publishToBlueskyDescription: string;
  private readonly postReviewButton: string;
  private readonly cancelButton: string;

  constructor(private page: Page) {
    this.title = albumPageContent.title("Octane", "Don Toliver");
    this.heading = albumPageContent.heading("Octane");
    this.artistSubheading = albumPageContent.artistSubheading("Don Toliver");
    this.released = albumPageContent.released("01 Jan 2026");
    this.tags = albumPageContent.tags(["2026", "don toliver"]);
    this.viewFullAlbum = albumPageContent.viewFullAlbum;
    this.addAReview = albumPageContent.addAReview;
    this.otherUsersReviews = albumPageContent.otherUsersReviews;
    this.yourReviews = albumPageContent.yourReviews;
    this.reviewFunctionsSubheading = albumPageContent.reviewFunctionsSubheading;
    this.albumName = albumPageContent.albumName("Octane");
    this.artistName = albumPageContent.artistName("Don Toliver");
    this.ratingHeading = albumPageContent.ratingHeading;
    this.reviewHeading = albumPageContent.reviewHeading;
    this.rating = albumPageContent.rating;
    this.reviewTextPlaceholder = albumPageContent.reviewTextPlaceholder;
    this.dateListenedHeading = albumPageContent.dateListenedHeading;
    this.publishToBluesky = albumPageContent.publishToBluesky;
    this.publishToBlueskyDescription =
      albumPageContent.publishToBlueskyDescription;
    this.postReviewButton = albumPageContent.postReviewButton;
    this.cancelButton = albumPageContent.cancelButton;
  }

  async checkPageElements() {
    await expect(this.page).toHaveTitle(this.title);
    await this.checkAlbumOverview();
    await this.checkReviewFunctions();
    await this.checkOtherUsersReviews();
    await this.checkYourReviews();
  }

  async checkAlbumOverview() {
    await expect(
      this.page.getByRole("heading", { name: this.heading }).first(),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.artistSubheading).first(),
    ).toBeVisible();
    await expect(this.page.getByText(this.released)).toBeVisible();
    await expect(
      this.page.getByText(this.tags[0], { exact: true }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.tags[1], { exact: true }),
    ).toBeVisible();
    await expect(this.page.getByText(this.viewFullAlbum)).toBeVisible();
  }

  async checkReviewFunctions() {
    await expect(this.page.getByText(this.addAReview)).toBeVisible();
  }

  async checkOtherUsersReviews() {
    await expect(this.page.getByText(this.otherUsersReviews)).toBeVisible();
  }

  async checkYourReviews() {
    await expect(this.page.getByText(this.yourReviews)).toBeVisible();
    await expect(
      this.page.getByText(this.reviewFunctionsSubheading),
    ).toBeVisible();
  }

  async clickAddAReview() {
    await this.page.getByText(this.addAReview).click();
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
}

export default AlbumPage;

// Artist Page POM
// Contains the following:
// - Constructor for elements on artist page
// - Methods for checking elements

import { Page } from "playwright";
import { expect } from "@playwright/test";
import { artistPageContents } from "../content/artist_page_content";

export class ArtistPage {
  private readonly title: string;
  private readonly heading: string;
  private readonly topTags: string[];
  private readonly listeners: string;
  private readonly scrobbles: string;
  private readonly viewFullProfile: string;
  private readonly topTracks: string;
  private readonly discography: string;

  constructor(private page: Page) {
    this.title = artistPageContents.title("Drake");
    this.heading = artistPageContents.heading("Drake");
    this.topTags = artistPageContents.topTags;
    this.listeners = artistPageContents.listeners;
    this.scrobbles = artistPageContents.scrobbles;
    this.viewFullProfile = artistPageContents.viewFullProfile;
    this.topTracks = artistPageContents.topTracks;
    this.discography = artistPageContents.discography;
  }

  async checkPageElements() {
    await expect(this.page).toHaveTitle(this.title);
    await expect(
      this.page.getByRole("heading", { name: this.heading }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.topTags[0], { exact: true }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.topTags[1], { exact: true }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.topTags[2], { exact: true }),
    ).toBeVisible();
    await expect(this.page.getByText(this.listeners)).toBeVisible();
    await expect(this.page.getByText(this.scrobbles)).toBeVisible();
    await expect(
      this.page.getByRole("link", { name: this.viewFullProfile, exact: true }),
    ).toBeVisible();
  }

  async checkTopTracks() {
    const topTracks = this.page
      .locator("section")
      .filter({ hasText: this.topTracks })
      .locator("li");
    await expect(topTracks).toHaveCount(5);
  }

  async checkDiscography() {
    const discography = this.page
      .locator("section")
      .filter({ hasText: this.discography })
      .locator("li");
    await expect(discography).toHaveCount(10);
  }
}

export default ArtistPage;

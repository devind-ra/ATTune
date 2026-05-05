// Help Page POM
// Contains the following:
// - Constructor for elements on help page
// - Methods for checking elements

import { Page, type Locator } from "playwright";
import { expect } from "@playwright/test";
import { helpPageContent } from "../content/help_page_content";

export class HelpPage {
  private readonly title: string;
  private readonly backButton: string;
  private readonly signInWithBluesky: string;
  private readonly signInWithBlueskyContent: string;
  private readonly keyFeaturesHeading: string;
  private readonly keyFeatures1: string;
  private readonly keyFeatures2: string;
  private readonly keyFeatures3: string;
  private readonly keyFeatures4: string;
  private readonly keyFeatures5: string;
  private readonly keyFeatures6: string;
  private readonly howToAttuneUseHeading: string;
  private readonly createTastes1: string;
  private readonly createTastes2: string;
  private readonly createTastes3: string;
  private readonly createTastes4: string;
  private readonly createTastes5: string;
  private readonly createTastes6: string;
  private readonly createTastes7: string;
  private readonly recordAnAlbum1: string;
  private readonly recordAnAlbum2: string;
  private readonly recordAnAlbum3: string;
  private readonly recordAnAlbum4: string;
  private readonly recordAnAlbum5: string;
  private readonly recordAnAlbum6: string;
  private readonly recordAnAlbum7: string;
  private readonly recordAnAlbum8: string;
  private readonly recordAnAlbum9: string;
  private readonly faqsHeading: string;
  private readonly faqs1: string;
  private readonly faqs2: string;
  private readonly faqs3: string;
  private readonly faqs4: string;
  private readonly faqs5: string;
  private readonly faqs6: string;
  private readonly faqs7: string;
  private readonly faqs8: string;

  constructor(private page: Page) {
    this.title = helpPageContent.title;
    this.backButton = helpPageContent.backButton;
    this.signInWithBluesky = helpPageContent.signInWithBluesky;
    this.signInWithBlueskyContent = helpPageContent.signInWithBlueskyContent;
    this.keyFeaturesHeading = helpPageContent.keyFeaturesHeading;
    this.keyFeatures1 = helpPageContent.keyFeatures1;
    this.keyFeatures2 = helpPageContent.keyFeatures2;
    this.keyFeatures3 = helpPageContent.keyFeatures3;
    this.keyFeatures4 = helpPageContent.keyFeatures4;
    this.keyFeatures5 = helpPageContent.keyFeatures5;
    this.keyFeatures6 = helpPageContent.keyFeatures6;
    this.howToAttuneUseHeading = helpPageContent.howToUseAttuneHeading;
    this.createTastes1 = helpPageContent.createTastes1;
    this.createTastes2 = helpPageContent.createTastes2;
    this.createTastes3 = helpPageContent.createTastes3;
    this.createTastes4 = helpPageContent.createTastes4;
    this.createTastes5 = helpPageContent.createTastes5;
    this.createTastes6 = helpPageContent.createTastes6;
    this.createTastes7 = helpPageContent.createTastes7;
    this.recordAnAlbum1 = helpPageContent.recordAnAlbum1;
    this.recordAnAlbum2 = helpPageContent.recordAnAlbum2;
    this.recordAnAlbum3 = helpPageContent.recordAnAlbum3;
    this.recordAnAlbum4 = helpPageContent.recordAnAlbum4;
    this.recordAnAlbum5 = helpPageContent.recordAnAlbum5;
    this.recordAnAlbum6 = helpPageContent.recordAnAlbum6;
    this.recordAnAlbum7 = helpPageContent.recordAnAlbum7;
    this.recordAnAlbum8 = helpPageContent.recordAnAlbum8;
    this.recordAnAlbum9 = helpPageContent.recordAnAlbum9;
    this.faqsHeading = helpPageContent.faqsHeading;
    this.faqs1 = helpPageContent.faqs1;
    this.faqs2 = helpPageContent.faqs2;
    this.faqs3 = helpPageContent.faqs3;
    this.faqs4 = helpPageContent.faqs4;
    this.faqs5 = helpPageContent.faqs5;
    this.faqs6 = helpPageContent.faqs6;
    this.faqs7 = helpPageContent.faqs7;
    this.faqs8 = helpPageContent.faqs8;
  }

  async checkPageElements() {
    await expect(this.page).toHaveTitle(this.title);
    await this.checkBackButton();
    await this.checkSignInWithBluesky();
    await this.checkKeyFeatures();
    await this.checkHowToUse();
    await this.checkFAQs();
  }

  async checkBackButton() {
    await expect(
      this.page.getByRole("button", { name: this.backButton }),
    ).toBeVisible();
  }

  async checkSignInWithBluesky() {
    await expect(this.page.getByText(this.signInWithBluesky)).toBeVisible();
    await expect(
      this.page.getByText(this.signInWithBlueskyContent),
    ).toBeVisible();
  }

  async checkKeyFeatures() {
    await expect(this.page.getByText(this.keyFeaturesHeading)).toBeVisible();
    await expect(this.page.getByText(this.keyFeatures1)).toBeVisible();
    await expect(this.page.getByText(this.keyFeatures2)).toBeVisible();
    await expect(this.page.getByText(this.keyFeatures3)).toBeVisible();
    await expect(this.page.getByText(this.keyFeatures4)).toBeVisible();
    await expect(this.page.getByText(this.keyFeatures5)).toBeVisible();
    await expect(this.page.getByText(this.keyFeatures6)).toBeVisible();
  }

  async checkHowToUse() {
    await expect(this.page.getByText(this.howToAttuneUseHeading)).toBeVisible();
    await expect(this.page.getByText(this.createTastes1)).toBeVisible();
    await expect(this.page.getByText(this.createTastes2)).toBeVisible();
    await expect(this.page.getByText(this.createTastes3)).toBeVisible();
    await expect(this.page.getByText(this.createTastes4)).toBeVisible();
    await expect(this.page.getByText(this.createTastes5)).toBeVisible();
    await expect(this.page.getByText(this.createTastes6)).toBeVisible();
    await expect(this.page.getByText(this.createTastes7)).toBeVisible();
    await expect(this.page.getByText(this.recordAnAlbum1)).toBeVisible();
    await expect(this.page.getByText(this.recordAnAlbum2)).toBeVisible();
    await expect(this.page.getByText(this.recordAnAlbum3)).toBeVisible();
    await expect(this.page.getByText(this.recordAnAlbum4)).toBeVisible();
    await expect(this.page.getByText(this.recordAnAlbum5)).toBeVisible();
    await expect(this.page.getByText(this.recordAnAlbum6)).toBeVisible();
    await expect(this.page.getByText(this.recordAnAlbum7)).toBeVisible();
    await expect(this.page.getByText(this.recordAnAlbum8)).toBeVisible();
    await expect(this.page.getByText(this.recordAnAlbum9)).toBeVisible();
  }

  async checkFAQs() {
    await expect(this.page.getByText(this.faqsHeading)).toBeVisible();
    await expect(this.page.getByText(this.faqs1)).toBeVisible();
    await expect(this.page.getByText(this.faqs2)).toBeVisible();
    await expect(this.page.getByText(this.faqs3)).toBeVisible();
    await expect(this.page.getByText(this.faqs4)).toBeVisible();
    await expect(this.page.getByText(this.faqs5)).toBeVisible();
    await expect(this.page.getByText(this.faqs6)).toBeVisible();
    await expect(this.page.getByText(this.faqs7)).toBeVisible();
    await expect(this.page.getByText(this.faqs8)).toBeVisible();
  }
}

export default HelpPage;

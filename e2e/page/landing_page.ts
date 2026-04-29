import { Page } from "playwright";
import { expect } from "@playwright/test";
import { landingPageContent } from "../content/landing_page_content";

export class LandingPage {
  private readonly title: string;
  private readonly subheading: string;
  private readonly description: string;
  private readonly getStartedButton: string;
  private readonly signInButton: string;
  private readonly signUpButton: string;
  private readonly authenticationSectionHeading: string;
  private readonly authenticationSectionDescription: string;
  private readonly formHeading: string;
  private readonly handleOrEmail: string;
  private readonly handleOrEmailPlaceholder: string;
  private readonly appPassword: string;
  private readonly appPasswordPlaceholder: string;
  private readonly whereDoIGetThisButton: string;
  private readonly dontHaveAnAccount: string;
  private readonly rateHeading: string;
  private readonly rateDescription: string;
  private readonly reviewHeading: string;
  private readonly reviewDescription: string;
  private readonly connectHeading: string;
  private readonly connectDescription: string;

  constructor(private page: Page) {
    this.title = landingPageContent.title;
    this.subheading = landingPageContent.subheading;
    this.description = landingPageContent.description;
    this.getStartedButton = landingPageContent.getStartedButton;
    this.signInButton = landingPageContent.signInButton;
    this.signUpButton = landingPageContent.signUpButton;
    this.authenticationSectionHeading =
      landingPageContent.authenticationSectionHeading;
    this.authenticationSectionDescription =
      landingPageContent.authenticationSectionDescription;
    this.formHeading = landingPageContent.formHeading;
    this.handleOrEmail = landingPageContent.handleOrEmail;
    this.handleOrEmailPlaceholder = landingPageContent.handleOrEmailPlaceholder;
    this.appPassword = landingPageContent.appPassword;
    this.appPasswordPlaceholder = landingPageContent.appPasswordPlaceholder;
    this.whereDoIGetThisButton = landingPageContent.whereDoIGetThisButton;
    this.dontHaveAnAccount = landingPageContent.dontHaveAnAccount;
    this.rateHeading = landingPageContent.rateHeading;
    this.rateDescription = landingPageContent.rateDescription;
    this.reviewHeading = landingPageContent.reviewHeading;
    this.reviewDescription = landingPageContent.reviewDescription;
    this.connectHeading = landingPageContent.connectHeading;
    this.connectDescription = landingPageContent.connectDescription;
  }

  async checkPageElements() {
    await this.checkHeroSection();
    await this.checkAuthenticationSection();
  }

  async checkHeroSection() {
    await expect(
      this.page.getByRole("heading", { name: this.title }),
    ).toBeVisible();
    await expect(this.page.getByText(this.subheading)).toBeVisible();
    await expect(this.page.getByText(this.description)).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.getStartedButton }),
    ).toBeVisible();
  }

  async checkAuthenticationSection() {
    await expect(
      this.page.getByRole("heading", {
        name: this.authenticationSectionHeading,
      }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.authenticationSectionDescription),
    ).toBeVisible();
    await expect(
      this.page.getByRole("heading", { name: this.formHeading }),
    ).toBeVisible();
    await expect(this.page.getByText(this.handleOrEmail)).toBeVisible();
    await expect(this.page.getByText(this.appPassword)).toBeVisible();
    await expect(
      this.page.getByRole("button", {
        name: this.whereDoIGetThisButton,
      }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.signInButton }),
    ).toBeVisible();
    await expect(this.page.getByText(this.dontHaveAnAccount)).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.signUpButton }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.rateHeading, { exact: true }),
    ).toBeVisible();
    await expect(this.page.getByText(this.rateDescription)).toBeVisible();
    await expect(
      this.page.getByText(this.reviewHeading, { exact: true }),
    ).toBeVisible();
    await expect(this.page.getByText(this.reviewDescription)).toBeVisible();
    await expect(
      this.page.getByText(this.connectHeading, { exact: true }),
    ).toBeVisible();
    await expect(this.page.getByText(this.connectDescription)).toBeVisible();
  }

  async clickGetStarted() {
    await this.page
      .getByRole("button", { name: this.getStartedButton })
      .click();
  }

  async clickSignIn() {
    await this.page.getByRole("button", { name: this.signInButton }).click();
  }

  async clickSignUp() {
    await this.page.getByRole("button", { name: this.signUpButton }).click();
  }

  async clickWhereDoIGetThis() {
    await this.page
      .getByRole("button", { name: this.whereDoIGetThisButton })
      .click();
  }

  async fillDetails() {
    await this.fillHandleOrEmail();
    await this.fillAppPassword();
  }

  async fillHandleOrEmail() {
    await this.page.getByPlaceholder(this.handleOrEmailPlaceholder).click();
    await this.page
      .getByPlaceholder(this.handleOrEmailPlaceholder)
      .fill(process.env.BLUESKY_HANDLE!);
  }

  async fillAppPassword() {
    await this.page
      .getByPlaceholder(this.appPasswordPlaceholder)
      .fill(process.env.BLUESKY_APP_PASSWORD!);
  }
}

export default LandingPage;

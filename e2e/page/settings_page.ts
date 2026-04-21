import { Page, type Locator } from "playwright";
import { expect } from "@playwright/test";
import { settingsPageContent } from "../content/settings_page_content";

export class SettingsPage {
  private readonly title: string;
  private readonly backButton: string;
  private readonly dataPrivacyPoliciesHeading: string;
  private readonly dataPrivacyPoliciesSummary: string;
  private readonly dataPrivacyPoliciesDescription: string;
  private readonly dataPrivacyPoliciesDescription2: string;
  private readonly thirdPartyServicesHeading: string;
  private readonly thirdPartyServicesSummary: string;
  private readonly thirdPartyServicesDescription: string;
  private readonly thirdPartyServicesDescription2: string;
  private readonly thirdPartyServicesDescription3: string;
  private readonly thirdPartyServicesDescription4: string;
  private readonly accountDataHandlingHeading: string;
  private readonly accountDataHandlingSummary: string;
  private readonly accountDataHandlingDescription: string;
  private readonly accountDataHandlingDescription2: string;
  private readonly accountDataHandlingDescription3: string;
  private readonly accountDataHandlingDescription4: string;
  private readonly deleteATtuneDataHeading: string;
  private readonly deleteATtuneDataDescription: string;
  private readonly wipeAllDataButton: string;
  private readonly confirmationHeading: string;
  private readonly confirmationDescription: string;
  private readonly passwordInputHeading: string;
  private readonly passwordInputPlaceholder: string;
  private readonly cancelButton: string;
  private readonly permanentlyWipeButton: string;

  constructor(private page: Page) {
    this.title = settingsPageContent.title;
    this.backButton = settingsPageContent.backButton;
    this.dataPrivacyPoliciesHeading =
      settingsPageContent.dataPrivacyPoliciesHeading;
    this.dataPrivacyPoliciesSummary =
      settingsPageContent.dataPrivacyPoliciesSummary;
    this.dataPrivacyPoliciesDescription =
      settingsPageContent.dataPrivacyPoliciesDescription;
    this.dataPrivacyPoliciesDescription2 =
      settingsPageContent.dataPrivacyPoliciesDescription2;
    this.thirdPartyServicesHeading =
      settingsPageContent.thirdPartyServicesHeading;
    this.thirdPartyServicesSummary =
      settingsPageContent.thirdPartyServicesSummary;
    this.thirdPartyServicesDescription =
      settingsPageContent.thirdPartyServicesDescription;
    this.thirdPartyServicesDescription2 =
      settingsPageContent.thirdPartyServicesDescription2;
    this.thirdPartyServicesDescription3 =
      settingsPageContent.thirdPartyServicesDescription3;
    this.thirdPartyServicesDescription4 =
      settingsPageContent.thirdPartyServicesDescription4;
    this.accountDataHandlingHeading =
      settingsPageContent.accountDataHandlingHeading;
    this.accountDataHandlingSummary =
      settingsPageContent.accountDataHandlingSummary;
    this.accountDataHandlingDescription =
      settingsPageContent.accountDataHandlingDescription;
    this.accountDataHandlingDescription2 =
      settingsPageContent.accountDataHandlingDescription2;
    this.accountDataHandlingDescription3 =
      settingsPageContent.accountDataHandlingDescription3;
    this.accountDataHandlingDescription4 =
      settingsPageContent.accountDataHandlingDescription4;
    this.deleteATtuneDataHeading = settingsPageContent.deleteATtuneDataHeading;
    this.deleteATtuneDataDescription =
      settingsPageContent.deleteATtuneDataDescription;
    this.wipeAllDataButton = settingsPageContent.wipeAllDataButton;
    this.confirmationHeading = settingsPageContent.confirmationHeading;
    this.confirmationDescription = settingsPageContent.confirmationDescription;
    this.passwordInputHeading = settingsPageContent.passwordInputHeading;
    this.passwordInputPlaceholder =
      settingsPageContent.passwordInputPlaceholder;
    this.cancelButton = settingsPageContent.cancelButton;
    this.permanentlyWipeButton = settingsPageContent.permanentlyWipeButton;
  }

  async checkPageElements() {
    await expect(this.page).toHaveTitle(this.title);
    await this.checkBackButton();
    await this.checkDataPrivacyPoliciesHeading();
    await this.checkThirdPartyServices();
    await this.checkAccountDataHandling();
    await this.checkWipeAllDataButton();
  }

  async checkBackButton() {
    await expect(
      this.page.getByRole("button", { name: this.backButton }),
    ).toBeVisible();
  }

  async checkDataPrivacyPoliciesHeading() {
    await expect(
      this.page.getByRole("heading", { name: this.dataPrivacyPoliciesHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.dataPrivacyPoliciesSummary),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.dataPrivacyPoliciesDescription),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.dataPrivacyPoliciesDescription2),
    ).toBeVisible();
  }

  async checkThirdPartyServices() {
    await expect(
      this.page.getByRole("heading", { name: this.thirdPartyServicesHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.thirdPartyServicesSummary),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.thirdPartyServicesDescription),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.thirdPartyServicesDescription2),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.thirdPartyServicesDescription3),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.thirdPartyServicesDescription4),
    ).toBeVisible();
  }

  async checkAccountDataHandling() {
    await expect(
      this.page.getByRole("heading", { name: this.accountDataHandlingHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.accountDataHandlingSummary),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.accountDataHandlingDescription),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.accountDataHandlingDescription2),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.accountDataHandlingDescription3),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.accountDataHandlingDescription4),
    ).toBeVisible();
  }

  async checkWipeAllDataButton() {
    await expect(
      this.page.getByRole("heading", { name: this.deleteATtuneDataHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.deleteATtuneDataDescription),
    ).toBeVisible();
    await expect(this.page.getByText(this.wipeAllDataButton)).toBeVisible();
  }

  async clickWipeAllDataButton() {
    await this.page.getByText(this.wipeAllDataButton).click();
  }

  async checkConfirmationModal() {
    await expect(
      this.page.getByRole("heading", { name: this.confirmationHeading }),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.confirmationDescription),
    ).toBeVisible();
    await expect(
      this.page.getByText(this.passwordInputHeading).nth(1),
    ).toBeVisible();
    await expect(
      this.page.getByPlaceholder(this.passwordInputPlaceholder),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.cancelButton }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: this.permanentlyWipeButton }),
    ).toBeVisible();
  }

  async fillPassword(password: string) {
    await this.page
      .getByPlaceholder(this.passwordInputPlaceholder)
      .fill(password);
  }

  async clickCancelButton() {
    await this.page.getByRole("button", { name: this.cancelButton }).click();
  }

  async clickPermanentlyWipeButton() {
    await this.page
      .getByRole("button", { name: this.permanentlyWipeButton })
      .click();
  }
}

export default SettingsPage;

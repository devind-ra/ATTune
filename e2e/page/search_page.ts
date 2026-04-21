import { Page, type Locator } from "playwright";
import { expect } from "@playwright/test";
import {
    searchPageContent,
} from "../content/search_page_content";

export class SearchPage {
    private readonly title: string;
    private readonly heading: string;
    private readonly artistHeading: string;
    private readonly albumHeading: string;

    constructor(private page: Page) {
        this.title = searchPageContent.title;
        this.heading = searchPageContent.heading("Drake");
        this.artistHeading = searchPageContent.artistHeading;
        this.albumHeading = searchPageContent.albumHeading;
    }

    async checkPageElements() {
        await expect(this.page).toHaveTitle(this.title);
        await expect(this.page.getByRole("heading", { name: this.heading })).toBeVisible();
        await expect(this.page.getByRole("heading", { name: this.artistHeading })).toBeVisible();
        await expect(this.page.getByRole("heading", { name: this.albumHeading })).toBeVisible();
    }
}

export default SearchPage;

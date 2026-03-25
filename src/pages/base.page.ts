import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * BasePage — abstract base class for all Page Objects.
 *
 * Centralises common interactions (navigation, waiting, scrolling) so that
 * individual page classes stay focused on their own selectors and workflows.
 * All subclasses receive a `page` reference via constructor injection, which
 * makes them trivially testable in isolation.
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ------------------------------------------------------------------ //
  //  Navigation                                                          //
  // ------------------------------------------------------------------ //

  /** Navigate to a relative path or absolute URL. */
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
    await this.waitForPageReady();
  }

  /** Wait for network to settle — suitable after navigations and form submits. */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Wait for the full page (including sub-resources) to load. */
  async waitForFullLoad(): Promise<void> {
    await this.page.waitForLoadState('load');
  }

  // ------------------------------------------------------------------ //
  //  Querying                                                            //
  // ------------------------------------------------------------------ //

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  // ------------------------------------------------------------------ //
  //  Assertions                                                          //
  // ------------------------------------------------------------------ //

  /** Assert the page URL contains the given substring. */
  async assertUrlContains(substring: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(substring));
  }

  /** Assert a locator is visible within the default expect timeout. */
  async assertVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  /** Assert a locator contains the expected text. */
  async assertText(locator: Locator, expected: string): Promise<void> {
    await expect(locator).toHaveText(expected);
  }

  // ------------------------------------------------------------------ //
  //  Interactions                                                        //
  // ------------------------------------------------------------------ //

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async reloadPage(): Promise<void> {
    await this.page.reload();
    await this.waitForPageReady();
  }
}

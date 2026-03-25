import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * LoginPage — Page Object for https://practicetestautomation.com/practice-test-login/
 *
 * This is a public demo site purpose-built for automation practice.
 * Valid credentials: username=student / password=Password123
 */
export class LoginPage extends BasePage {
  // Selectors are scoped to the page's stable attributes to minimise
  // brittleness when cosmetic styling changes.
  private readonly usernameInput = this.page.locator('#username');
  private readonly passwordInput = this.page.locator('#password');
  private readonly submitButton = this.page.locator('#submit');
  private readonly errorMessage = this.page.locator('#error');
  private readonly successHeading = this.page.locator('h1', { hasText: 'Logged In Successfully' });
  private readonly logoutButton = this.page.locator('.wp-block-button__link', { hasText: 'Log out' });

  static readonly PATH = '/practice-test-login/';

  // ------------------------------------------------------------------ //
  //  Navigation                                                          //
  // ------------------------------------------------------------------ //

  async navigate(): Promise<void> {
    await this.goto(LoginPage.PATH);
  }

  // ------------------------------------------------------------------ //
  //  Actions                                                             //
  // ------------------------------------------------------------------ //

  /** Fill in credentials and submit the login form. */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.waitForPageReady();
  }

  // ------------------------------------------------------------------ //
  //  Assertions                                                          //
  // ------------------------------------------------------------------ //

  async assertLoginSuccess(): Promise<void> {
    await expect(this.successHeading).toBeVisible();
    await this.assertUrlContains('logged-in-successfully');
  }

  async assertErrorMessage(expectedText: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedText);
  }

  async assertLogoutButtonVisible(): Promise<void> {
    await expect(this.logoutButton).toBeVisible();
  }

  // ------------------------------------------------------------------ //
  //  State queries                                                       //
  // ------------------------------------------------------------------ //

  async isLoggedIn(): Promise<boolean> {
    return this.successHeading.isVisible();
  }

  async getErrorMessage(): Promise<string> {
    return this.errorMessage.innerText();
  }
}

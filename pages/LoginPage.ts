import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Page Object for /index.html (see lesson 07).
 *
 * Rules of thumb used here:
 *  - locators are declared once in the constructor, never re-typed in tests;
 *  - methods describe *user intent* ("login"), not clicks and keystrokes;
 *  - the object exposes locators so tests can still write their own assertions.
 */
export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByRole('button', { name: 'Log in' });
    this.errorMessage = page.getByTestId('login-error');
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.loginButton).toBeVisible();
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  /** Login that also waits for the redirect - use it when you expect success. */
  async loginSuccessfully(username = 'standard_user', password = 'secret123') {
    await this.login(username, password);
    await this.page.waitForURL('**/inventory.html');
  }
}

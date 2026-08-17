import { test as base, expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

/**
 * Custom fixtures (lesson 06).
 *
 * A fixture is a named piece of setup that Playwright builds *on demand*: a test
 * that never mentions `loggedInPage` never pays for the login. Anything after
 * `await use(...)` is teardown.
 *
 * Import `test` and `expect` from this file instead of '@playwright/test' when a
 * spec needs these fixtures.
 */

/** The accounts the demo app knows about. */
export const USERS = {
  standard: { username: 'standard_user', password: 'secret123' },
  locked: { username: 'locked_user', password: 'secret123' },
  unknown: { username: 'no_such_user', password: 'whatever' },
} as const;

/** Plain helper - handy when a test wants to control *when* the login happens. */
export async function login(
  page: Page,
  username: string = USERS.standard.username,
  password: string = USERS.standard.password,
) {
  await page.goto('/');
  await page.getByTestId('username').fill(username);
  await page.getByTestId('password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
}

type CourseFixtures = {
  /** A page already signed in as standard_user, sitting on the products page. */
  loggedInPage: Page;
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
};

export const test = base.extend<CourseFixtures>({
  loggedInPage: async ({ page }, use) => {
    // --- setup ------------------------------------------------------------
    await login(page);
    await page.waitForURL('**/inventory.html');

    // --- the test runs here ----------------------------------------------
    await use(page);

    // --- teardown ---------------------------------------------------------
    await page.evaluate(() => localStorage.clear());
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});

export { expect };

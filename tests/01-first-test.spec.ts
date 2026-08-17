import { test, expect } from '@playwright/test';

/**
 * LESSON 01 - Your first test
 * Read docs/lessons/01-first-test.md alongside this file.
 *
 * Run just this lesson:
 *   npx playwright test tests/01-first-test.spec.ts
 *   npx playwright test tests/01-first-test.spec.ts --headed   (watch the browser)
 *
 * Anatomy of a test:
 *   test('name', async ({ page }) => { ... })
 *        ^ title           ^ fixture: a brand new browser tab, isolated per test
 *   Everything Playwright does is async, so almost every line starts with `await`.
 */

// `describe` groups related tests. It is optional, but it keeps reports readable.
test.describe('Lesson 01 - first steps', () => {
  test('opens the login page', async ({ page }) => {
    // 1. Navigate. '/' is resolved against `baseURL` from playwright.config.ts.
    await page.goto('/');

    // 2. Assert on the page itself.
    await expect(page).toHaveTitle('QA Shop - Login');
    await expect(page).toHaveURL(/index\.html|127\.0\.0\.1:4173\/$/);

    // 3. Assert on elements. `getByRole` is how a screen reader (and a user)
    //    finds things, which makes it the most robust way to locate them.
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
  });

  test('logs in with valid credentials', async ({ page }) => {
    await page.goto('/');

    // Fill the form. `getByLabel` uses the <label> text - no CSS selectors needed.
    await page.getByLabel('Username').fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();

    // The app redirects after a successful login. `expect` waits for it -
    // there is no sleep and no manual "wait for navigation" call.
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  });

  test('shows an error for a wrong password', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Username').fill('standard_user');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByTestId('login-error')).toHaveText(
      'Username and password do not match any user in this service.',
    );
    // Still on the login page - the user was not let through.
    await expect(page).not.toHaveURL(/inventory\.html/);
  });
});

import { test, expect } from '@playwright/test';

/**
 * LESSON 08 (part 2) - tests that start already signed in
 * Read docs/lessons/08-authentication.md alongside this file.
 *
 * Run only this lesson:
 *   npx playwright test --project=authenticated
 *
 * Every test below opens straight onto a protected page: the `authenticated`
 * project loads playwright/.auth/user.json into the browser context before the
 * first navigation, so there is no login step and no shared state between tests.
 */

test.describe('Lesson 08 - reusing an authenticated session', () => {
  test('lands on a protected page without logging in', async ({ page }) => {
    await page.goto('/inventory.html');

    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    await expect(page.getByTestId('current-user')).toHaveText('standard_user');
  });

  test('the session is a copy, so tests still cannot affect each other', async ({ page }) => {
    await page.goto('/inventory.html');

    // Add something to the cart here...
    await page.getByTestId('product-card').filter({ hasText: 'Wireless Mouse' })
      .getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });

  test('...and the next test sees an empty cart again', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page.getByTestId('cart-count')).toHaveText('0');
  });

  test('the protected page redirects when the session is cleared', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    // Simulate an expired session.
    await page.evaluate(() => localStorage.clear());
    await page.goto('/cart.html');

    await expect(page).toHaveURL(/index\.html/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });
});

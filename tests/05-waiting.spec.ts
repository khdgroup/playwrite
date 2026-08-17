import { test, expect } from '@playwright/test';

/**
 * LESSON 05 - Waiting, without sleeps
 * Read docs/lessons/05-waiting.md alongside this file.
 *
 * The single biggest source of flaky UI tests is hard-coded sleeps. Playwright
 * removes the need for them:
 *   - actions wait for the element to be actionable;
 *   - `expect(locator)` retries until it passes or times out;
 *   - explicit waits exist for the rare cases the two above cannot express.
 *
 * Rule for the team: `page.waitForTimeout()` never lands in main.
 */

test.describe('Lesson 05 - waiting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Username').fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.waitForURL('**/inventory.html');
  });

  test('assertions wait for late content', async ({ page }) => {
    // The promo banner is added ~900ms after load. No sleep required: the
    // assertion polls until it appears.
    await expect(page.getByTestId('promo-banner')).toBeVisible();
    await expect(page.getByTestId('promo-banner')).toHaveText(
      'Free shipping on orders over $50 today!',
    );
  });

  test('waiting for a slow request to render its result', async ({ page }) => {
    await page.getByRole('button', { name: 'Load reviews' }).click();

    // The API sleeps 1.2s. Assert the loading state, then the final state.
    await expect(page.getByTestId('reviews-loading')).toBeVisible();
    await expect(page.getByTestId('review')).toHaveCount(3);
    await expect(page.getByTestId('reviews-loading')).toBeHidden();
  });

  test('overriding the timeout for one slow assertion', async ({ page }) => {
    await page.goto('/playground.html');
    await page.getByTestId('start-job').click();

    await expect(page.getByTestId('job-status')).toHaveText('Running...');
    // The job finishes after 2s; the global expect timeout is 5s, so this passes,
    // but this is how you give a single assertion more room when it needs it.
    await expect(page.getByTestId('job-status')).toHaveText('Job completed', { timeout: 10_000 });
  });

  test('waiting for a specific network response', async ({ page }) => {
    // Start listening BEFORE triggering the action, otherwise you race it.
    const reviewsResponse = page.waitForResponse(
      (response) => response.url().includes('/api/reviews') && response.status() === 200,
    );

    await page.getByRole('button', { name: 'Load reviews' }).click();

    const response = await reviewsResponse;
    const body = await response.json();
    expect(body).toHaveLength(3);
    expect(body[0]).toHaveProperty('author', 'Priya');
  });

  test('waitFor on a locator, and waitForURL on navigation', async ({ page }) => {
    // locator.waitFor() when you need the wait without an assertion.
    await page.getByTestId('promo-banner').waitFor({ state: 'visible' });

    await page.getByTestId('product-card').first().getByRole('button').click();
    await page.getByTestId('cart-link').click();
    await page.waitForURL('**/cart.html');

    await expect(page.getByRole('heading', { name: 'Your cart' })).toBeVisible();
  });

  test('anti-pattern: do not do this', async ({ page }) => {
    // Kept as a bad example. It "works" today and breaks on a slow CI machine,
    // while also making every green run 3 seconds slower.
    //
    //   await page.waitForTimeout(3000);
    //   expect(await page.getByTestId('promo-banner').isVisible()).toBe(true);
    //
    // The version that is both faster and reliable:
    await expect(page.getByTestId('promo-banner')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

/**
 * LESSON 03 - Assertions
 * Read docs/lessons/03-assertions.md alongside this file.
 *
 * Two families:
 *  - WEB-FIRST assertions: `await expect(locator).toBeVisible()`. They retry
 *    until they pass or the expect timeout (5s, set in the config) runs out.
 *    Always `await` them.
 *  - GENERIC assertions: `expect(2 + 2).toBe(4)`. No retry, no await - they
 *    check a value you already have.
 *
 * If you find yourself adding sleeps before an assertion, you are almost always
 * using a generic assertion where a web-first one belongs.
 */

test.describe('Lesson 03 - assertions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Username').fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.waitForURL('**/inventory.html');
  });

  test('visibility, text and counts', async ({ page }) => {
    // Visibility / presence.
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    await expect(page.getByTestId('empty-state')).toBeHidden();

    // Text. toHaveText = whole string, toContainText = substring.
    await expect(page.getByTestId('result-count')).toHaveText('6 products found');
    await expect(page.getByTestId('result-count')).toContainText('products');

    // Counts, and text of every element in a list (order matters).
    const cards = page.getByTestId('product-card');
    await expect(cards).toHaveCount(6);
    await expect(cards.getByRole('heading')).toHaveText([
      '27" 4K Monitor',
      'Laptop Stand',
      'Mechanical Keyboard',
      'Noise Cancelling Headphones',
      'USB-C Hub',
      'Wireless Mouse',
    ]);
  });

  test('state, values and attributes', async ({ page }) => {
    const soldOut = page.getByTestId('product-card').filter({ hasText: 'USB-C Hub' });
    await expect(soldOut.getByRole('button', { name: 'Add to cart' })).toBeDisabled();

    const inStock = page.getByTestId('product-card').filter({ hasText: 'Laptop Stand' });
    await expect(inStock.getByRole('button', { name: 'Add to cart' })).toBeEnabled();

    // Input values.
    await page.getByLabel('Search products').fill('mouse');
    await expect(page.getByLabel('Search products')).toHaveValue('mouse');

    // Attributes, CSS classes and computed styles.
    await expect(page.getByTestId('cart-link')).toHaveAttribute('href', '/cart.html');
    await expect(page.getByTestId('cart-count')).toHaveClass('badge');
    await expect(page.getByTestId('cart-count')).toHaveCSS('border-radius', '999px');
  });

  test('negating an assertion with .not', async ({ page }) => {
    await expect(page.getByTestId('login-error')).not.toBeVisible();
    await expect(page.getByTestId('result-count')).not.toHaveText('0 products found');
  });

  test('generic assertions for plain values', async ({ page }) => {
    const names = await page.getByTestId('product-card').getByRole('heading').allTextContents();

    expect(names).toHaveLength(6);
    expect(names).toContain('Wireless Mouse');
    expect(names[0]).toMatch(/Monitor$/);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('soft assertions collect every failure before ending the test', async ({ page }) => {
    // expect.soft() records a failure and keeps going, so one run tells you about
    // all four problems instead of only the first. The test still fails at the end.
    await expect.soft(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    await expect.soft(page.getByTestId('cart-count')).toHaveText('0');
    await expect.soft(page.getByTestId('search')).toBeEditable();
    await expect.soft(page.getByTestId('sort')).toBeVisible();
  });

  test('expect.poll re-runs a function until it returns the expected value', async ({ page }) => {
    await page.getByTestId('product-card').filter({ hasText: 'Laptop Stand' })
      .getByRole('button', { name: 'Add to cart' }).click();

    // Useful when the thing you are checking is not a DOM element - here it is
    // the app's localStorage.
    await expect
      .poll(async () => {
        const raw = await page.evaluate(() => localStorage.getItem('qa-shop.cart'));
        return JSON.parse(raw ?? '[]').length;
      }, { message: 'cart should contain one line item', timeout: 5_000 })
      .toBe(1);
  });

  test('custom failure messages make reports readable', async ({ page }) => {
    await expect(page.getByTestId('product-list'), 'the product grid should render')
      .toBeVisible();
  });
});

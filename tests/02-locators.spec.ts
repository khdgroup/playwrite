import { test, expect } from '@playwright/test';

/**
 * LESSON 02 - Locators: finding elements the way a user would
 * Read docs/lessons/02-locators.md alongside this file.
 *
 * Preference order (top = most robust):
 *   1. getByRole      - button, link, heading, checkbox... plus its visible name
 *   2. getByLabel     - form fields
 *   3. getByPlaceholder / getByText / getByTitle / getByAltText
 *   4. getByTestId    - when the UI has no stable accessible name
 *   5. page.locator('css=' | 'xpath=') - last resort, breaks when styling changes
 *
 * A locator is *lazy*: creating one queries nothing. The DOM is only inspected
 * when you act on it or assert on it - which is why locators never go stale.
 */

test.describe('Lesson 02 - locators', () => {
  test.beforeEach(async ({ page }) => {
    // Every test in this file needs to be logged in first.
    await page.goto('/');
    await page.getByLabel('Username').fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.waitForURL('**/inventory.html');
  });

  test('built-in locators', async ({ page }) => {
    // By ARIA role + accessible name.
    await expect(page.getByRole('heading', { name: 'Products', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();

    // By label text.
    await expect(page.getByLabel('Search products')).toBeVisible();

    // By placeholder.
    await expect(page.getByPlaceholder('e.g. keyboard')).toBeVisible();

    // By visible text (substring match by default).
    await expect(page.getByText('Wireless Mouse')).toBeVisible();

    // By test id - the app sets data-testid="product-list".
    await expect(page.getByTestId('product-list')).toBeVisible();
  });

  test('exact vs substring matching', async ({ page }) => {
    // Substring, case-insensitive: matches "Mechanical Keyboard".
    await expect(page.getByText('keyboard')).toBeVisible();

    // Exact match: whitespace-trimmed, case-sensitive, whole string.
    await expect(page.getByText('Mechanical Keyboard', { exact: true })).toBeVisible();

    // Regular expressions work too.
    await expect(page.getByRole('link', { name: /^Cart/ })).toBeVisible();
  });

  test('lists: count, nth, first and last', async ({ page }) => {
    const cards = page.getByTestId('product-card');

    // The demo catalogue has 6 products.
    await expect(cards).toHaveCount(6);

    // Default sort is name A-Z, so the first card is "27\" 4K Monitor".
    await expect(cards.first().getByRole('heading')).toHaveText('27" 4K Monitor');
    await expect(cards.nth(1).getByRole('heading')).toHaveText('Laptop Stand');
    await expect(cards.last().getByRole('heading')).toHaveText('Wireless Mouse');

    // Need the values in JS? `all*` methods return arrays (no auto-waiting -
    // assert the count first, as we did above).
    const names = await cards.getByRole('heading').allTextContents();
    expect(names).toContain('USB-C Hub');
  });

  test('filtering narrows a list down to one item', async ({ page }) => {
    const cards = page.getByTestId('product-card');

    // filter({ hasText }) keeps only the cards containing that text.
    const mouse = cards.filter({ hasText: 'Wireless Mouse' });
    await expect(mouse).toHaveCount(1);
    await expect(mouse.getByTestId('product-price')).toHaveText('$24.99');

    // filter({ has: locator }) keeps cards that contain a matching child.
    const soldOut = cards.filter({ has: page.getByTestId('out-of-stock') });
    await expect(soldOut.getByRole('heading')).toHaveText('USB-C Hub');

    // filter({ hasNotText }) is the inverse.
    await expect(cards.filter({ hasNotText: 'Out of stock' })).toHaveCount(5);
  });

  test('chaining scopes a search inside a parent', async ({ page }) => {
    // There are six "Add to cart" buttons on the page. This one belongs to the
    // headphones card - chaining removes the ambiguity.
    const headphones = page.getByTestId('product-card').filter({ hasText: 'Noise Cancelling' });
    await headphones.getByRole('button', { name: 'Add to cart' }).click();

    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });

  test('strict mode: an ambiguous locator is a failing test, not a coin flip', async ({ page }) => {
    // page.getByRole('button', { name: 'Add to cart' }) matches 6 elements.
    // Acting on it throws a "strict mode violation" instead of silently picking
    // the first one. Prove it here so the error is familiar when you hit it:
    const ambiguous = page.getByRole('button', { name: 'Add to cart' });
    await expect(ambiguous).toHaveCount(6);
    await expect(ambiguous.click()).rejects.toThrow(/strict mode violation/);

    // The fixes: .first(), .nth(i), .filter(...) or chaining from a parent.
    await ambiguous.first().click();
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });

  test('CSS and XPath still exist, but prefer them last', async ({ page }) => {
    await expect(page.locator('[data-testid="product-card"] h3').first()).toBeVisible();
    await expect(page.locator('css=.badge')).toHaveText('0');
    await expect(page.locator('xpath=//h1')).toHaveText('Products');
  });
});

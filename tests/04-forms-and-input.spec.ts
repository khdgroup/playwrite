import { test, expect } from '@playwright/test';

/**
 * LESSON 04 - Forms, inputs and user actions
 * Read docs/lessons/04-forms-and-input.md alongside this file.
 *
 * Every action below performs "actionability checks" first: the element must be
 * attached, visible, stable, able to receive events and enabled. Playwright waits
 * for all of that automatically - that is why there are no sleeps in this file.
 */

test.describe('Lesson 04 - forms and input', () => {
  test('fill, clear and keyboard input', async ({ page }) => {
    await page.goto('/');
    const username = page.getByLabel('Username');

    // fill() sets the value in one go - fast and what you want 95% of the time.
    await username.fill('standard_user');
    await expect(username).toHaveValue('standard_user');

    // clear() is shorthand for fill('').
    await username.clear();
    await expect(username).toHaveValue('');

    // pressSequentially() types character by character, firing each keystroke.
    // Use it only when the app reacts to individual keys (autocomplete, masks).
    await username.pressSequentially('standard_user', { delay: 10 });
    await expect(username).toHaveValue('standard_user');

    // Submitting with the keyboard instead of the mouse.
    await page.getByLabel('Password').fill('secret123');
    await page.getByLabel('Password').press('Enter');
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('validation errors are shown for empty fields', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByTestId('login-error')).toHaveText('Username is required.');

    await page.getByLabel('Username').fill('standard_user');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByTestId('login-error')).toHaveText('Password is required.');
  });

  test('a locked-out account is rejected', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Username').fill('locked_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByTestId('login-error')).toHaveText(
      'Sorry, this user has been locked out.',
    );
  });

  test.describe('inside the app', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.getByLabel('Username').fill('standard_user');
      await page.getByLabel('Password').fill('secret123');
      await page.getByRole('button', { name: 'Log in' }).click();
      await page.waitForURL('**/inventory.html');
    });

    test('search filters the product grid live', async ({ page }) => {
      await page.getByLabel('Search products').fill('keyboard');

      await expect(page.getByTestId('product-card')).toHaveCount(1);
      await expect(page.getByTestId('result-count')).toHaveText('1 product found');

      await page.getByLabel('Search products').fill('nothing-matches-this');
      await expect(page.getByTestId('product-card')).toHaveCount(0);
      await expect(page.getByTestId('empty-state')).toBeVisible();
    });

    test('select dropdowns: by label, value or index', async ({ page }) => {
      const sort = page.getByLabel('Sort by');

      await sort.selectOption({ label: 'Price (low to high)' });
      await expect(page.getByTestId('product-card').first()).toContainText('Wireless Mouse');

      await sort.selectOption('price-desc'); // by value attribute
      await expect(page.getByTestId('product-card').first()).toContainText('27" 4K Monitor');

      await sort.selectOption({ index: 1 }); // Name (Z to A)
      await expect(page.getByTestId('product-card').first()).toContainText('Wireless Mouse');
      await expect(sort).toHaveValue('name-desc');
    });

    test('checkboxes: check, uncheck and assert', async ({ page }) => {
      await page.getByTestId('product-card').filter({ hasText: 'Laptop Stand' })
        .getByRole('button', { name: 'Add to cart' }).click();
      await page.getByTestId('cart-link').click();

      const giftWrap = page.getByLabel('Gift wrap this order');
      await expect(giftWrap).not.toBeChecked();

      await giftWrap.check();
      await expect(giftWrap).toBeChecked();

      await giftWrap.uncheck();
      await expect(giftWrap).not.toBeChecked();
    });

    test('a disabled control cannot be clicked', async ({ page }) => {
      const soldOutButton = page
        .getByTestId('product-card')
        .filter({ hasText: 'USB-C Hub' })
        .getByRole('button', { name: 'Add to cart' });

      await expect(soldOutButton).toBeDisabled();

      // Playwright waits for the button to become enabled and then times out,
      // instead of clicking a dead element and reporting a false pass.
      await expect(soldOutButton.click({ timeout: 1_000 })).rejects.toThrow(/Timeout/);
      await expect(page.getByTestId('cart-count')).toHaveText('0');
    });

    test('other common actions', async ({ page }) => {
      const card = page.getByTestId('product-card').filter({ hasText: 'Wireless Mouse' });

      await card.hover();                       // mouse over
      await card.getByRole('button').dblclick(); // adds the product twice
      await expect(page.getByTestId('cart-count')).toHaveText('2');

      await page.keyboard.press('Control+A');   // raw keyboard access
      await page.getByTestId('logout-button').click();
      await expect(page).toHaveURL(/index\.html/);
    });
  });
});

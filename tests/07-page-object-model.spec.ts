import { test, expect, USERS } from '../fixtures/fixtures';

/**
 * LESSON 07 - The Page Object Model
 * Read docs/lessons/07-page-object-model.md alongside this file.
 *
 * The classes live in ../pages. Compare a test here with lesson 02: the steps
 * read like a test case written by a manual tester, and when a data-testid
 * changes you edit exactly one file.
 *
 * The `loginPage` / `inventoryPage` / `cartPage` fixtures come from
 * ../fixtures/fixtures.ts, so no test needs `new LoginPage(page)`.
 */

test.describe('Lesson 07 - page objects', () => {
  test('a valid login lands on the products page', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.loginSuccessfully();

    await expect(inventoryPage.heading).toBeVisible();
    await expect(inventoryPage.products).toHaveCount(6);
  });

  test('an invalid login shows the error banner', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.unknown.username, USERS.unknown.password);

    await expect(loginPage.errorMessage).toHaveText(
      'Username and password do not match any user in this service.',
    );
  });

  test('end-to-end purchase', async ({ loginPage, inventoryPage, cartPage }) => {
    await test.step('sign in', async () => {
      await loginPage.goto();
      await loginPage.loginSuccessfully(USERS.standard.username, USERS.standard.password);
    });

    await test.step('add two products', async () => {
      await inventoryPage.addToCart('Wireless Mouse');
      await inventoryPage.addToCart('Laptop Stand');
      await expect(inventoryPage.cartCount).toHaveText('2');
    });

    await test.step('review the cart', async () => {
      await inventoryPage.openCart();
      await expect(cartPage.rows).toHaveCount(2);
      // 24.99 + 32.75
      await expect(cartPage.total).toHaveText('$57.74');
    });

    await test.step('check out', async () => {
      await cartPage.checkout({
        firstName: 'Asha',
        lastName: 'Patel',
        postalCode: 'EC1A 1BB',
        giftWrap: true,
      });

      await expect(cartPage.confirmation).toBeVisible();
      await expect(cartPage.orderId).toHaveText(/^QA-\d+$/);
      await expect(cartPage.orderTotal).toHaveText('$57.74');
    });

    await test.step('the cart is emptied afterwards', async () => {
      await inventoryPage.goto();
      await expect(inventoryPage.cartCount).toHaveText('0');
    });
  });

  test('removing an item updates the total', async ({ loginPage, inventoryPage, cartPage }) => {
    await loginPage.goto();
    await loginPage.loginSuccessfully();

    await inventoryPage.addToCart('Mechanical Keyboard');
    await inventoryPage.addToCart('Laptop Stand');
    await inventoryPage.openCart();

    await expect(cartPage.total).toHaveText('$122.25');

    await cartPage.removeItem('Mechanical Keyboard');
    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.total).toHaveText('$32.75');
  });

  test('checkout is rejected when a required field is empty', async ({
    loginPage,
    inventoryPage,
    cartPage,
  }) => {
    await loginPage.goto();
    await loginPage.loginSuccessfully();
    await inventoryPage.addToCart('Laptop Stand');
    await inventoryPage.openCart();

    await cartPage.checkout({ firstName: '', lastName: 'Patel', postalCode: 'EC1A 1BB' });

    await expect(cartPage.error).toHaveText('Missing required field: firstName');
    await expect(cartPage.confirmation).toBeHidden();
  });

  test('searching and sorting through the page object', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.loginSuccessfully();

    await inventoryPage.sortBy('Price (high to low)');
    expect(await inventoryPage.productNames()).toEqual([
      '27" 4K Monitor',
      'Noise Cancelling Headphones',
      'Mechanical Keyboard',
      'USB-C Hub',
      'Laptop Stand',
      'Wireless Mouse',
    ]);

    await inventoryPage.searchFor('hub');
    await expect(inventoryPage.products).toHaveCount(1);
    await expect(inventoryPage.resultCount).toHaveText('1 product found');
  });
});

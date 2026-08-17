import { test, expect } from '../../fixtures/fixtures';

/**
 * EXERCISES - your turn.
 *
 * Each test below is marked `test.fixme`, so the suite stays green until you
 * implement it. Steps:
 *   1. delete the `test.fixme(...)` line,
 *   2. replace the TODO comments with real Playwright code,
 *   3. run `npx playwright test tests/exercises --headed`.
 *
 * Solutions live in docs/EXERCISES.md - try first, peek after.
 */

test.describe('Exercises', () => {
  test('E1 (lesson 02/03): the monitor costs $399.00', async ({ loggedInPage }) => {
    test.fixme(true, 'Not implemented yet');
    // TODO: find the product card for '27" 4K Monitor'
    // TODO: assert its price element reads $399.00
    // TODO: assert its "Add to cart" button is enabled
  });

  test('E2 (lesson 04): searching is case-insensitive', async ({ loggedInPage }) => {
    test.fixme(true, 'Not implemented yet');
    // TODO: type 'MOUSE' into the search box
    // TODO: assert exactly one card is shown and it is the Wireless Mouse
  });

  test('E3 (lesson 04/05): adding the same product twice sets quantity 2', async ({ loggedInPage }) => {
    test.fixme(true, 'Not implemented yet');
    // TODO: click "Add to cart" on 'Laptop Stand' twice
    // TODO: assert the header badge shows 2
    // TODO: open the cart and assert the row quantity is 2 and subtotal $65.50
  });

  test('E4 (lesson 07): checkout fails without a postal code', async ({
    loginPage,
    inventoryPage,
    cartPage,
  }) => {
    test.fixme(true, 'Not implemented yet');
    // TODO: use the page objects to log in, add a product and open the cart
    // TODO: submit the checkout form with an empty postal code
    // TODO: assert the error reads 'Missing required field: postalCode'
  });

  test('E5 (lesson 09): mock a catalogue of three products', async ({ page }) => {
    test.fixme(true, 'Not implemented yet');
    // TODO: log in
    // TODO: route '**/api/products' and fulfil it with three fake products
    // TODO: reload and assert the grid shows exactly your three products
  });

  test('E6 (lesson 10): the support iframe greets the user', async ({ page }) => {
    test.fixme(true, 'Not implemented yet');
    // TODO: open /playground.html
    // TODO: use frameLocator to click "Chat with support"
    // TODO: assert the status inside the frame changes
  });

  test('E7 (lesson 05/09): the reviews endpoint is called exactly once', async ({ page }) => {
    test.fixme(true, 'Not implemented yet');
    // TODO: log in, count requests to /api/reviews with page.on('request', ...)
    // TODO: click "Load reviews", wait for the three reviews to render
    // TODO: assert the endpoint was hit once
  });

  test('E8 (lesson 03): every product price is formatted as $x.xx', async ({ loggedInPage }) => {
    test.fixme(true, 'Not implemented yet');
    // TODO: collect all price texts with allTextContents()
    // TODO: assert each one matches /^\$\d+\.\d{2}$/
  });
});

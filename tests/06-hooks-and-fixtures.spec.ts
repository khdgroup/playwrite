import { test, expect, USERS } from '../fixtures/fixtures';

/**
 * LESSON 06 - Hooks, fixtures and test steps
 * Read docs/lessons/06-hooks-and-fixtures.md alongside this file.
 *
 * Note the import above: `test` comes from ../fixtures/fixtures, which extends
 * the built-in one with a `loggedInPage` fixture. Everything else still works.
 *
 * Hook order for a run:
 *   beforeAll -> [ beforeEach -> test -> afterEach ] * n -> afterAll
 */

test.describe('Lesson 06 - hooks and fixtures', () => {
  // Runs once for the whole describe block, in the worker process.
  test.beforeAll(async () => {
    console.log('[beforeAll] one-time setup, e.g. seeding data');
  });

  test.afterAll(async () => {
    console.log('[afterAll] one-time cleanup');
  });

  test('the loggedInPage fixture skips the boilerplate', async ({ loggedInPage }) => {
    // No login code here - the fixture already did it, and will clean up after.
    await expect(loggedInPage.getByRole('heading', { name: 'Products' })).toBeVisible();
    await expect(loggedInPage.getByTestId('current-user')).toHaveText(USERS.standard.username);
  });

  test('fixtures are built per test, so tests stay independent', async ({ loggedInPage }) => {
    // The previous test never added anything to the cart; this one starts clean
    // because every test gets a fresh browser context.
    await expect(loggedInPage.getByTestId('cart-count')).toHaveText('0');
  });

  test('test.step turns a long test into a readable report', async ({ loggedInPage }) => {
    const page = loggedInPage;

    await test.step('add a product to the cart', async () => {
      await page.getByTestId('product-card').filter({ hasText: 'Laptop Stand' })
        .getByRole('button', { name: 'Add to cart' }).click();
      await expect(page.getByTestId('cart-count')).toHaveText('1');
    });

    await test.step('open the cart', async () => {
      await page.getByTestId('cart-link').click();
      await expect(page.getByRole('heading', { name: 'Your cart' })).toBeVisible();
    });

    await test.step('verify the line item', async () => {
      await expect(page.getByTestId('cart-row')).toHaveCount(1);
      await expect(page.getByTestId('cart-item-name')).toHaveText('Laptop Stand');
      await expect(page.getByTestId('cart-total')).toHaveText('$32.75');
    });
  });

  test.describe('per-test configuration', () => {
    // Applies to every test in this block.
    test.describe.configure({ retries: 1 });

    test('slow tests can ask for more time', async ({ loggedInPage }) => {
      test.slow(); // triples this test's timeout
      await expect(loggedInPage.getByTestId('product-card')).toHaveCount(6);
    });

    test('skip or fixme when a test should not run', async ({ loggedInPage }) => {
      test.skip(process.platform === 'sunos', 'the demo app is not supported there');
      await expect(loggedInPage).toHaveURL(/inventory/);
    });

    test('tags and annotations show up in the report', async ({ loggedInPage }) => {
      test.info().annotations.push({ type: 'issue', description: 'JIRA-1234' });
      await expect(loggedInPage.getByRole('heading', { name: 'Products' })).toBeVisible();
    });
  });
});

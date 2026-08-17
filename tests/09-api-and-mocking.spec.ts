import { test, expect } from '@playwright/test';

/**
 * LESSON 09 - API testing and network mocking
 * Read docs/lessons/09-api-and-mocking.md alongside this file.
 *
 * Two separate skills:
 *  A) Testing the API directly with the `request` fixture - fast, no browser.
 *  B) Intercepting the browser's requests with page.route() to force states the
 *     UI can hardly produce on demand (empty catalogue, server error, slow API).
 */

test.describe('Lesson 09A - testing the API directly', () => {
  test('GET /api/products returns the catalogue', async ({ request }) => {
    const response = await request.get('/api/products');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const products = await response.json();
    expect(products).toHaveLength(6);
    expect(products[0]).toMatchObject({ id: 1, name: 'Wireless Mouse', price: 24.99 });
    expect(products.every((p: { price: number }) => p.price > 0)).toBe(true);
  });

  test('POST /api/login: happy path and the two failure modes', async ({ request }) => {
    const ok = await request.post('/api/login', {
      data: { username: 'standard_user', password: 'secret123' },
    });
    expect(ok.ok()).toBeTruthy();
    expect(await ok.json()).toMatchObject({ username: 'standard_user' });

    const locked = await request.post('/api/login', {
      data: { username: 'locked_user', password: 'secret123' },
    });
    expect(locked.status()).toBe(403);
    expect((await locked.json()).error).toContain('locked out');

    const wrong = await request.post('/api/login', {
      data: { username: 'standard_user', password: 'nope' },
    });
    expect(wrong.status()).toBe(401);
  });

  test('POST /api/checkout validates its input', async ({ request }) => {
    const created = await request.post('/api/checkout', {
      data: {
        firstName: 'Asha',
        lastName: 'Patel',
        postalCode: 'EC1A 1BB',
        items: [{ id: 1, quantity: 2 }],
      },
    });
    expect(created.status()).toBe(201);
    expect(await created.json()).toMatchObject({ total: 49.98 });

    const invalid = await request.post('/api/checkout', {
      data: { firstName: '', lastName: 'Patel', postalCode: 'EC1A 1BB', items: [] },
    });
    expect(invalid.status()).toBe(400);
    expect((await invalid.json()).error).toBe('Missing required field: firstName');
  });

  test('API setup + UI verification is the fastest way to reach a state', async ({
    page,
    request,
  }) => {
    // Get the token from the API instead of driving the login form...
    const response = await request.post('/api/login', {
      data: { username: 'standard_user', password: 'secret123' },
    });
    const { token, username } = await response.json();

    // ...then hand it to the browser before the app boots.
    await page.addInitScript(
      ([user, jwt]) => {
        localStorage.setItem('qa-shop.auth', JSON.stringify({ username: user, token: jwt }));
      },
      [username, token],
    );

    await page.goto('/inventory.html');
    await expect(page.getByTestId('current-user')).toHaveText('standard_user');
  });
});

test.describe('Lesson 09B - mocking the network', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Username').fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.waitForURL('**/inventory.html');
  });

  test('stub the product list with fixture data', async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        json: [
          { id: 99, name: 'Test Widget', price: 10, category: 'test', stock: 1, description: 'Mocked.' },
        ],
      });
    });

    await page.reload();

    await expect(page.getByTestId('product-card')).toHaveCount(1);
    await expect(page.getByTestId('product-card')).toContainText('Test Widget');
    await expect(page.getByTestId('result-count')).toHaveText('1 product found');
  });

  test('an empty catalogue shows the empty state', async ({ page }) => {
    await page.route('**/api/products', (route) => route.fulfill({ json: [] }));
    await page.reload();

    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('result-count')).toHaveText('0 products found');
  });

  test('simulate a 500 so you can check the failure handling', async ({ page }) => {
    await page.route('**/api/checkout', (route) =>
      route.fulfill({ status: 500, json: { error: 'Payment provider unavailable.' } }),
    );

    await page.getByTestId('product-card').first().getByRole('button').click();
    await page.getByTestId('cart-link').click();
    await page.getByLabel('First name').fill('Asha');
    await page.getByLabel('Last name').fill('Patel');
    await page.getByLabel('Postal code').fill('EC1A 1BB');
    await page.getByRole('button', { name: 'Place order' }).click();

    await expect(page.getByTestId('checkout-error')).toHaveText('Payment provider unavailable.');
  });

  test('inspect or modify a real response instead of replacing it', async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      const response = await route.fetch();      // let it hit the real server
      const products = await response.json();
      products.forEach((product: { price: number }) => {
        product.price = 0;                        // ...then tamper with the body
      });
      await route.fulfill({ response, json: products });
    });

    await page.reload();
    await expect(page.getByTestId('product-price').first()).toHaveText('$0.00');
  });

  test('block requests entirely', async ({ page }) => {
    await page.route('**/api/reviews*', (route) => route.abort());

    await page.getByRole('button', { name: 'Load reviews' }).click();
    // The list never appears because the request was killed at the network layer.
    await expect(page.getByTestId('review')).toHaveCount(0);
  });

  test('spy on requests without changing them', async ({ page }) => {
    const requestedUrls: string[] = [];
    page.on('request', (request) => requestedUrls.push(request.url()));

    await page.reload();
    await expect(page.getByTestId('product-card')).toHaveCount(6);

    expect(requestedUrls.some((url) => url.includes('/api/products'))).toBe(true);
  });
});

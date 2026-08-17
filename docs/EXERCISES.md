# Exercises

Open `tests/exercises/exercises.spec.ts`. Each exercise is marked `test.fixme`
so the suite stays green until you implement it.

For each one: delete the `test.fixme(...)` line, write the code, then run

```bash
npx playwright test tests/exercises --headed
```

Try before you peek. Your version does not have to match the solution - if it
passes for the right reason, it is correct.

---

## E1 - The monitor costs $399.00 (lessons 02, 03)

<details><summary>Solution</summary>

```ts
test('E1: the monitor costs $399.00', async ({ loggedInPage }) => {
  const card = loggedInPage.getByTestId('product-card').filter({ hasText: '27" 4K Monitor' });

  await expect(card).toHaveCount(1);
  await expect(card.getByTestId('product-price')).toHaveText('$399.00');
  await expect(card.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
});
```
</details>

## E2 - Searching is case-insensitive (lesson 04)

<details><summary>Solution</summary>

```ts
test('E2: searching is case-insensitive', async ({ loggedInPage }) => {
  await loggedInPage.getByLabel('Search products').fill('MOUSE');

  await expect(loggedInPage.getByTestId('product-card')).toHaveCount(1);
  await expect(loggedInPage.getByTestId('product-card')).toContainText('Wireless Mouse');
});
```
</details>

## E3 - Adding the same product twice (lessons 04, 05)

<details><summary>Solution</summary>

```ts
test('E3: adding the same product twice sets quantity 2', async ({ loggedInPage }) => {
  const addButton = loggedInPage
    .getByTestId('product-card')
    .filter({ hasText: 'Laptop Stand' })
    .getByRole('button', { name: 'Add to cart' });

  await addButton.click();
  await addButton.click();
  await expect(loggedInPage.getByTestId('cart-count')).toHaveText('2');

  await loggedInPage.getByTestId('cart-link').click();
  await expect(loggedInPage.getByTestId('cart-row')).toHaveCount(1);
  await expect(loggedInPage.getByTestId('cart-item-qty')).toHaveText('2');
  await expect(loggedInPage.getByTestId('cart-item-subtotal')).toHaveText('$65.50');
});
```
</details>

## E4 - Checkout fails without a postal code (lesson 07)

<details><summary>Solution</summary>

```ts
test('E4: checkout fails without a postal code', async ({ loginPage, inventoryPage, cartPage }) => {
  await loginPage.goto();
  await loginPage.loginSuccessfully();
  await inventoryPage.addToCart('Wireless Mouse');
  await inventoryPage.openCart();

  await cartPage.checkout({ firstName: 'Asha', lastName: 'Patel', postalCode: '' });

  await expect(cartPage.error).toHaveText('Missing required field: postalCode');
  await expect(cartPage.confirmation).toBeHidden();
});
```
</details>

## E5 - Mock a catalogue of three products (lesson 09)

<details><summary>Solution</summary>

```ts
test('E5: mock a catalogue of three products', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('**/inventory.html');

  await page.route('**/api/products', route =>
    route.fulfill({
      json: [
        { id: 1, name: 'Alpha', price: 1, category: 'test', stock: 1, description: 'a' },
        { id: 2, name: 'Beta', price: 2, category: 'test', stock: 1, description: 'b' },
        { id: 3, name: 'Gamma', price: 3, category: 'test', stock: 1, description: 'c' },
      ],
    }),
  );

  await page.reload();

  await expect(page.getByTestId('product-card')).toHaveCount(3);
  await expect(page.getByTestId('product-card').getByRole('heading'))
    .toHaveText(['Alpha', 'Beta', 'Gamma']);
});
```
</details>

## E6 - The support iframe (lesson 10)

<details><summary>Solution</summary>

```ts
test('E6: the support iframe greets the user', async ({ page }) => {
  await page.goto('/playground.html');

  const frame = page.frameLocator('[data-testid="support-frame"]');
  await expect(frame.getByTestId('frame-status')).toHaveText('Support is offline');

  await frame.getByRole('button', { name: 'Chat with support' }).click();
  await expect(frame.getByTestId('frame-status')).toHaveText('An agent will join shortly');
});
```
</details>

## E7 - The reviews endpoint is called exactly once (lessons 05, 09)

<details><summary>Solution</summary>

```ts
test('E7: the reviews endpoint is called exactly once', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('**/inventory.html');

  let calls = 0;
  page.on('request', request => {
    if (request.url().includes('/api/reviews')) calls += 1;
  });

  await page.getByRole('button', { name: 'Load reviews' }).click();
  await expect(page.getByTestId('review')).toHaveCount(3);

  expect(calls).toBe(1);
});
```
</details>

## E8 - Every price is formatted as $x.xx (lesson 03)

<details><summary>Solution</summary>

```ts
test('E8: every product price is formatted as $x.xx', async ({ loggedInPage }) => {
  await expect(loggedInPage.getByTestId('product-card')).toHaveCount(6);

  const prices = await loggedInPage.getByTestId('product-price').allTextContents();
  expect(prices).toHaveLength(6);
  for (const price of prices) {
    expect(price).toMatch(/^\$\d+\.\d{2}$/);
  }
});
```
</details>

---

## Going further

Once the eight are done, try these on your own - no solutions provided:

1. The cart badge survives a page reload.
2. Sorting by price, then searching, keeps the sort order.
3. Removing the last item shows the empty-cart message and hides the checkout form.
4. Logging out and hitting `/cart.html` directly redirects to the login page.
5. A slow `/api/products` response (use `route.fulfill` after a delay) still
   renders correctly - and the test does not use a single sleep.
6. Convert exercises E1-E3 to use page objects instead of raw locators.

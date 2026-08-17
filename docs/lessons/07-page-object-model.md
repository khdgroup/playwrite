# Lesson 07 - The Page Object Model

**Spec file:** `tests/07-page-object-model.spec.ts`
**Page objects:** `pages/LoginPage.ts`, `pages/InventoryPage.ts`, `pages/CartPage.ts`

## The problem it solves

Lesson 02 repeated this in four places:

```ts
await page.getByTestId('username').fill('standard_user');
await page.getByTestId('password').fill('secret123');
await page.getByRole('button', { name: 'Log in' }).click();
```

When the login form changes, you edit every one of them. A Page Object puts the
knowledge of *how* the page works in one file, so tests only say *what* they do.

## The shape

```ts
export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.getByTestId('username');
    this.loginButton = page.getByRole('button', { name: 'Log in' });
  }

  async goto() { await this.page.goto('/'); }

  async login(username: string, password: string) { ... }
}
```

Rules that keep page objects healthy:

1. **Locators are fields, actions are methods.** Declare each locator once.
2. **Methods describe intent** - `loginSuccessfully()`, not `clickSubmitButton()`.
3. **Expose locators** so tests can write their own assertions. Do not hide the
   page behind a wall of `getXText()` helpers.
4. **Keep assertions out of page objects**, with one exception: a "the page is
   ready" check inside `goto()` is fine (see `LoginPage.goto`).
5. **No test data inside page objects.** Pass it in.
6. One class per page or per significant component (a header, a modal).

## Wiring them up as fixtures

`fixtures/fixtures.ts` exposes `loginPage`, `inventoryPage` and `cartPage`, so
tests never call `new LoginPage(page)`:

```ts
test('a valid login lands on the products page', async ({ loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.loginSuccessfully();
  await expect(inventoryPage.heading).toBeVisible();
});
```

## What a full flow looks like

```ts
await loginPage.goto();
await loginPage.loginSuccessfully();
await inventoryPage.addToCart('Wireless Mouse');
await inventoryPage.addToCart('Laptop Stand');
await inventoryPage.openCart();
await expect(cartPage.total).toHaveText('$57.74');
await cartPage.checkout({ firstName: 'Asha', lastName: 'Patel', postalCode: 'EC1A 1BB' });
await expect(cartPage.confirmation).toBeVisible();
```

Anyone on the team can read that, including people who do not write code.

## When *not* to use a page object

For a one-off check of a single element, a direct locator is clearer. POM pays
off when a screen is used by several tests. Do not build 20 page objects up
front - grow them as the suite grows.

Next: [Lesson 08 - Authentication](08-authentication.md)

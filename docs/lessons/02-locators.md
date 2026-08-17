# Lesson 02 - Locators: finding elements

**Spec file:** `tests/02-locators.spec.ts`

A locator is a **description of how to find an element**, not the element
itself. Creating one touches nothing:

```ts
const button = page.getByRole('button', { name: 'Add to cart' }); // no DOM query yet
await button.click();  // NOW Playwright finds it, waits for it, and clicks
```

Because the lookup happens at the moment of use, locators never go stale - even
if React re-rendered the whole page in between.

## The priority list

Use the highest one that works. The higher you are, the closer the test is to
what a real user perceives, and the less it breaks on refactors.

| # | Locator | Example | Use for |
| --- | --- | --- | --- |
| 1 | `getByRole` | `getByRole('button', { name: 'Log in' })` | Anything interactive or semantic: buttons, links, headings, checkboxes, dialogs |
| 2 | `getByLabel` | `getByLabel('Username')` | Form fields |
| 3 | `getByPlaceholder` | `getByPlaceholder('e.g. keyboard')` | Inputs without a label |
| 4 | `getByText` | `getByText('Out of stock')` | Non-interactive copy |
| 5 | `getByAltText` / `getByTitle` | `getByAltText('Company logo')` | Images, tooltips |
| 6 | `getByTestId` | `getByTestId('cart-count')` | Elements with no stable user-visible identity |
| 7 | `locator('css=' \| 'xpath=')` | `locator('.badge')` | Last resort |

Why not CSS first? `.btn-primary.mt-2` changes the day someone touches the
stylesheet; "the button labelled Log in" does not.

`getByTestId` reads `data-testid` by default - change it in the config with
`use: { testIdAttribute: 'data-qa' }` if your app uses something else.

## Matching rules

```ts
page.getByText('keyboard')                        // substring, case-insensitive
page.getByText('Mechanical Keyboard', { exact: true })  // whole string, case-sensitive
page.getByRole('link', { name: /^Cart/ })         // regex
```

## Working with lists

```ts
const cards = page.getByTestId('product-card');

await expect(cards).toHaveCount(6);
cards.first();      // cards.nth(0)
cards.nth(2);
cards.last();
await cards.getByRole('heading').allTextContents();   // string[]
```

`all*()` methods return immediately and do **not** retry. Assert `toHaveCount`
first so you know the list has finished rendering.

## Narrowing down

```ts
// keep only cards containing this text
cards.filter({ hasText: 'Wireless Mouse' })

// keep only cards containing a matching child element
cards.filter({ has: page.getByTestId('out-of-stock') })

// the inverse
cards.filter({ hasNotText: 'Out of stock' })

// chaining: search *inside* one card
cards.filter({ hasText: 'Wireless Mouse' }).getByRole('button', { name: 'Add to cart' })
```

Chaining is what makes "click the Add to cart button of *that* product" a
one-liner instead of an XPath riddle.

## Strict mode

If a locator matches more than one element, Playwright **fails the test** rather
than guessing:

```
Error: strict mode violation: getByRole('button', { name: 'Add to cart' })
resolved to 6 elements
```

This is a feature: a silent "pick the first one" hides real bugs. Fix it with
`.first()`, `.nth(i)`, `.filter(...)` or chaining.

## Finding locators without writing them

```bash
npx playwright codegen http://127.0.0.1:4173   # record clicks -> generated code
npx playwright test --ui                       # pick-locator button in UI mode
```

Treat generated code as a first draft: it often picks a lower-priority locator
than you would.

## Try it yourself

- Write a locator for the "Remove" button of the Laptop Stand row on the cart page.
- Write one for the price of the USB-C Hub card.
- Deliberately trigger a strict-mode violation and read the error carefully.

Next: [Lesson 03 - Assertions](03-assertions.md)

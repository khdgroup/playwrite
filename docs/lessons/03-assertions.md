# Lesson 03 - Assertions

**Spec file:** `tests/03-assertions.spec.ts`

## Two families

**Web-first (auto-retrying).** The argument is a locator or the page. Playwright
re-checks until it passes or the `expect` timeout (5s in our config) expires.
Always `await` them.

```ts
await expect(page.getByTestId('result-count')).toHaveText('6 products found');
```

**Generic (immediate).** The argument is a value you already have. No retry, no
`await` on the assertion itself.

```ts
const names = await page.getByRole('heading').allTextContents();
expect(names).toHaveLength(6);
```

> If you ever feel the urge to add a sleep before an assertion, you have used a
> generic assertion where a web-first one belongs.

## The ones you will use every day

| Assertion | Checks |
| --- | --- |
| `toBeVisible()` / `toBeHidden()` | Rendered and non-empty / not rendered |
| `toHaveText(s)` | Full text content (trimmed). Pass an array to check a whole list, in order |
| `toContainText(s)` | Substring |
| `toHaveValue(s)` | Value of an input/select/textarea |
| `toHaveCount(n)` | Number of matched elements |
| `toBeEnabled()` / `toBeDisabled()` | Interactive state |
| `toBeChecked()` | Checkbox / radio |
| `toBeEditable()` / `toBeEmpty()` / `toBeFocused()` | Field state |
| `toHaveAttribute(name, value)` | Attribute |
| `toHaveClass(...)` / `toHaveCSS(prop, value)` | Styling |
| `toHaveURL(url \| regex)` | Page location |
| `toHaveTitle(text \| regex)` | Document title |

Negate any of them with `.not`:

```ts
await expect(page.getByTestId('login-error')).not.toBeVisible();
```

## Generic assertions worth knowing

```ts
expect(value).toBe(42);                 // strict equality
expect(object).toEqual({ id: 1 });      // deep equality
expect(object).toMatchObject({ id: 1 }); // deep, partial
expect(list).toContain('USB-C Hub');
expect(text).toMatch(/^\$\d+\.\d{2}$/);
expect(list).toHaveLength(6);
expect(flag).toBeTruthy();
```

## Soft assertions

`expect.soft()` records the failure and lets the test continue, so one run
reports every problem instead of only the first. The test still ends up failed.

```ts
await expect.soft(page.getByTestId('cart-count')).toHaveText('0');
await expect.soft(page.getByTestId('search')).toBeEditable();
```

Use them for a batch of independent checks on one screen. Do **not** use them
where a failure makes the following steps meaningless (if the page did not load,
keep the hard assertion).

## `expect.poll`

Retries an arbitrary function until it returns the expected value - for things
that are not DOM elements (localStorage, an API, a database row):

```ts
await expect.poll(async () => {
  const raw = await page.evaluate(() => localStorage.getItem('qa-shop.cart'));
  return JSON.parse(raw ?? '[]').length;
}, { message: 'cart should contain one line item', timeout: 5_000 }).toBe(1);
```

There is also `expect(fn).toPass()` which retries a whole block of assertions.

## Timeouts

```ts
await expect(locator).toHaveText('Done', { timeout: 10_000 });  // one assertion
```

Global defaults live in `playwright.config.ts` (`expect.timeout`, `timeout`,
`use.actionTimeout`). Raise them there only if the whole app is slow; prefer a
targeted override for one genuinely slow screen.

## Custom messages

```ts
await expect(page.getByTestId('product-list'), 'the product grid should render').toBeVisible();
```

The message appears in the report - worth it for non-obvious checks.

Next: [Lesson 04 - Forms and input](04-forms-and-input.md)

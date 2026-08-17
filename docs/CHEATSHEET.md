# Playwright cheat sheet

## CLI

```bash
npx playwright test                        # run everything
npx playwright test tests/02-locators.spec.ts
npx playwright test -g "logs in"           # by test title
npx playwright test --grep @smoke          # by tag
npx playwright test --grep-invert @slow
npx playwright test --project=authenticated
npx playwright test --headed               # show the browser
npx playwright test --ui                   # interactive UI mode
npx playwright test --debug                # step-through inspector
npx playwright test --workers=1            # serial, for debugging
npx playwright test --repeat-each=10       # hunt a flaky test
npx playwright test --last-failed
npx playwright test --update-snapshots
npx playwright show-report
npx playwright show-trace test-results/<dir>/trace.zip
npx playwright codegen http://127.0.0.1:4173
npx playwright install chromium firefox webkit
```

## Locators

```ts
page.getByRole('button', { name: 'Log in' })   // exact: true for a whole-string match
page.getByRole('heading', { level: 1 })
page.getByLabel('Username')
page.getByPlaceholder('e.g. keyboard')
page.getByText('Out of stock')
page.getByTestId('cart-count')
page.getByAltText('Company logo')
page.getByTitle('Close')
page.locator('css=.badge')
page.locator('xpath=//h1')
page.frameLocator('#iframe').getByRole('button')

list.first() / .last() / .nth(2)
list.filter({ hasText: 'Mouse' })
list.filter({ hasNotText: 'Out of stock' })
list.filter({ has: page.getByTestId('badge') })
parent.getByRole('button')                      // chaining
locatorA.or(locatorB)  /  locatorA.and(locatorB)
```

## Actions

```ts
await page.goto('/path');
await page.reload();  await page.goBack();
await locator.click({ button: 'right', modifiers: ['Shift'], clickCount: 2 });
await locator.dblclick();  await locator.hover();
await locator.fill('text');  await locator.clear();
await locator.pressSequentially('text', { delay: 50 });
await locator.press('Enter');   await page.keyboard.press('Control+A');
await locator.check();  await locator.uncheck();
await select.selectOption({ label: 'Price (low to high)' });
await input.setInputFiles('file.txt');
await locator.dragTo(target);
await locator.scrollIntoViewIfNeeded();
await locator.focus();  await locator.blur();
```

## Reads (no auto-wait - prefer assertions)

```ts
await locator.textContent();   await locator.innerText();
await locator.inputValue();    await locator.getAttribute('href');
await locator.isVisible();     await locator.isEnabled();  await locator.isChecked();
await locator.count();         await locator.allTextContents();
await page.title();            page.url();
await page.evaluate(() => localStorage.getItem('key'));
```

## Assertions

```ts
await expect(locator).toBeVisible() / toBeHidden()
await expect(locator).toHaveText('x') / toContainText('x') / toHaveText(['a','b'])
await expect(locator).toHaveValue('x') / toHaveCount(3)
await expect(locator).toBeEnabled() / toBeDisabled() / toBeChecked() / toBeEditable()
await expect(locator).toHaveAttribute('href', '/cart.html')
await expect(locator).toHaveClass('badge') / toHaveCSS('color', 'rgb(0,0,0)')
await expect(page).toHaveURL(/cart/) / toHaveTitle('QA Shop')
await expect(page).toHaveScreenshot('name.png')
await expect(locator).not.toBeVisible()
await expect.soft(locator).toBeVisible()
await expect.poll(async () => value, { timeout: 5000 }).toBe(1)
await expect(async () => { ... }).toPass()

expect(value).toBe / toEqual / toMatchObject / toContain / toMatch / toHaveLength / toBeTruthy
```

## Network

```ts
await page.route('**/api/x', r => r.fulfill({ json: {...} }));
await page.route('**/api/x', r => r.fulfill({ status: 500, json: { error: 'boom' } }));
await page.route('**/api/x', r => r.abort());
await page.route('**/api/x', r => r.continue());
await page.unroute('**/api/x');

const res = await request.get('/api/products');
await request.post('/api/login', { data: { username, password } });

const p = page.waitForResponse('**/api/x');  await action;  const res = await p;
page.on('request' | 'response' | 'console' | 'pageerror' | 'dialog', handler);
```

## Structure

```ts
test.describe('group', () => {});
test.beforeAll / beforeEach / afterEach / afterAll
test.step('name', async () => {});
test.skip(cond, 'why');  test.fixme();  test.fail();  test.slow();
test.setTimeout(60_000);
test.describe.configure({ mode: 'serial', retries: 1 });
test('title', { tag: '@smoke' }, async ({ page }) => {});
test.use({ viewport: { width: 1280, height: 720 }, locale: 'en-GB' });
```

## Rules of thumb

1. `getByRole` first, `getByTestId` when there is nothing user-visible, CSS last.
2. Never `waitForTimeout`. Let assertions do the waiting.
3. One behaviour per test; tests must not depend on each other.
4. Assert what the user sees, not implementation details.
5. Mock the edges, run the core against the real backend.
6. A flaky test is a broken test.

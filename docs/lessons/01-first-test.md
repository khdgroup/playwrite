# Lesson 01 - Your first test

**Spec file:** `tests/01-first-test.spec.ts`
**Run it:** `npx playwright test tests/01-first-test.spec.ts --headed`

## What Playwright actually is

Playwright is two things bundled together:

1. A **browser automation library** - it drives Chromium, Firefox and WebKit.
2. A **test runner** (`@playwright/test`) - it finds spec files, runs them in
   parallel worker processes, retries, and writes reports.

You get both from one dependency, which is why there is no Mocha/Jest/Selenium
grid to configure.

## Anatomy of a test

```ts
import { test, expect } from '@playwright/test';

test('logs in with valid credentials', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/inventory\.html/);
});
```

| Piece | Meaning |
| --- | --- |
| `test('title', fn)` | Registers one test case. The title is what shows up in the report - write it like a test case name. |
| `async ({ page })` | `page` is a **fixture**: a fresh, isolated browser tab created for this test only. Nothing leaks between tests. |
| `await` | Every Playwright call is asynchronous. A missing `await` is the #1 cause of weird, order-dependent failures. |
| `expect(...)` | The assertion. `expect(locator)` assertions retry automatically until they pass or time out. |

## Isolation is the default

Each test gets its own **browser context** - a clean profile with empty cookies,
empty localStorage and its own cache. That is why lesson 06 can assert an empty
cart without any cleanup code, and why tests can run in parallel safely.

## `page.goto('/')`

The `/` is resolved against `baseURL` in `playwright.config.ts`
(`http://127.0.0.1:4173`). Keep URLs relative so the same suite can run against
local, staging and CI environments by changing one variable.

## Try it yourself

1. Run `npx playwright test tests/01-first-test.spec.ts` - three tests pass.
2. Run it again with `--headed` and watch the browser.
3. Break something on purpose: change `'standard_user'` to `'wrong_user'` in the
   second test, re-run, then open `npx playwright show-report`. Look at the error
   message, the screenshot and the failing line.
4. Undo the change.

## Cheat sheet

```bash
npx playwright test                      # everything
npx playwright test tests/01-*.spec.ts   # one file
npx playwright test -g "logs in"         # tests whose title matches
npx playwright test --headed             # show the browser
npx playwright test --ui                 # interactive UI mode (start here!)
npx playwright show-report               # open the last HTML report
```

Next: [Lesson 02 - Locators](02-locators.md)

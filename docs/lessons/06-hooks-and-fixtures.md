# Lesson 06 - Hooks, fixtures and steps

**Spec files:** `tests/06-hooks-and-fixtures.spec.ts`, `fixtures/fixtures.ts`

## Hooks

```ts
test.beforeAll(async () => { /* once per worker, per describe block */ });
test.beforeEach(async ({ page }) => { /* before every test */ });
test.afterEach(async ({ page }) => { /* after every test, even on failure */ });
test.afterAll(async () => { /* once at the end */ });
```

Order: `beforeAll` → (`beforeEach` → test → `afterEach`) × n → `afterAll`.

Note that `beforeAll` runs **once per worker process**. With parallel workers it
may run several times overall, so never use it to share mutable state between
tests.

## Fixtures - the better `beforeEach`

A fixture is named setup that Playwright builds **on demand** and tears down
automatically. Tests declare what they need in their arguments:

```ts
test('...', async ({ loggedInPage }) => { ... });
```

Our `loggedInPage` fixture (`fixtures/fixtures.ts`):

```ts
export const test = base.extend<CourseFixtures>({
  loggedInPage: async ({ page }, use) => {
    await login(page);                       // setup
    await page.waitForURL('**/inventory.html');
    await use(page);                         // the test runs here
    await page.evaluate(() => localStorage.clear());  // teardown
  },
});
```

Why fixtures beat hooks:

| | `beforeEach` | Fixture |
| --- | --- | --- |
| Runs for tests that do not need it | yes | no |
| Reusable across files | copy-paste | one import |
| Has its own teardown | separate `afterEach` | same function, after `use()` |
| Composable | no | fixtures can depend on fixtures |

Import `test` from `fixtures/fixtures` instead of `@playwright/test` to get
them. `expect` is re-exported from the same file for convenience.

## Test steps

```ts
await test.step('add a product to the cart', async () => {
  ...
});
```

Steps group actions in the HTML report and the trace viewer. On a 40-line
end-to-end test they turn "something failed somewhere" into "step 3 failed".

## Per-test and per-block configuration

```ts
test.describe.configure({ mode: 'serial' });   // run in order, stop after a failure
test.describe.configure({ retries: 1 });
test.slow();                                    // triple this test's timeout
test.setTimeout(60_000);
test.skip(condition, 'reason');
test.fixme('not implemented yet');
test.fail();                                    // this test is expected to fail
test.info().annotations.push({ type: 'issue', description: 'JIRA-1234' });
```

Use `mode: 'serial'` sparingly - it couples tests together, which is exactly what
isolation is supposed to prevent.

Next: [Lesson 07 - Page Object Model](07-page-object-model.md)

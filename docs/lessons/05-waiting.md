# Lesson 05 - Waiting, without sleeps

**Spec file:** `tests/05-waiting.spec.ts`

Hard-coded sleeps are the number one cause of flaky UI suites. They are both too
short (on a loaded CI machine) and too long (on every green run). Playwright is
designed so you almost never need one.

## The three layers of waiting

**1. Actions wait by themselves.** `click()`, `fill()` and friends run the
actionability checks from lesson 04 first.

**2. Assertions retry.** `await expect(locator).toBeVisible()` polls until it
passes or the expect timeout expires. This covers 90% of "wait for X" needs:

```ts
// The banner appears ~900ms after load. No sleep, no explicit wait.
await expect(page.getByTestId('promo-banner')).toBeVisible();
```

**3. Explicit waits** for the rest:

```ts
await page.getByTestId('promo-banner').waitFor({ state: 'visible' });
await page.waitForURL('**/cart.html');
await page.waitForResponse(r => r.url().includes('/api/reviews') && r.status() === 200);
await page.waitForRequest('**/api/checkout');
await page.waitForLoadState('domcontentloaded');
await page.waitForFunction(() => document.title.startsWith('QA'));
```

`waitFor` states: `attached`, `detached`, `visible`, `hidden`.

## Listen before you act

Anything based on `waitFor*` events must be set up **before** the action that
triggers it, or you race the event and hang until the timeout:

```ts
const responsePromise = page.waitForResponse('**/api/reviews*');  // 1. listen
await page.getByRole('button', { name: 'Load reviews' }).click(); // 2. act
const response = await responsePromise;                           // 3. await
```

Same pattern for popups (`context.waitForEvent('page')`), downloads and file
choosers - see lesson 10.

## Loading states are worth asserting

```ts
await page.getByRole('button', { name: 'Load reviews' }).click();
await expect(page.getByTestId('reviews-loading')).toBeVisible();  // spinner shows
await expect(page.getByTestId('review')).toHaveCount(3);          // data arrives
await expect(page.getByTestId('reviews-loading')).toBeHidden();   // spinner clears
```

That is three real requirements, tested. Deleting the spinner assertions would
still pass, but you would stop catching "spinner never disappears" bugs.

## Giving one assertion more time

```ts
await expect(page.getByTestId('job-status')).toHaveText('Job completed', { timeout: 10_000 });
```

Prefer a local override to raising the global timeout for everyone.

## What about `networkidle`?

`page.waitForLoadState('networkidle')` is discouraged - modern apps poll and
stream, so "no requests for 500ms" may never happen. Wait for the thing you
actually care about instead.

## The one legitimate use of `waitForTimeout`

Debugging, interactively, on your own machine. Never in committed code. Make it
a review rule:

```ts
await page.waitForTimeout(3000);  // ❌ never merge this
```

Next: [Lesson 06 - Hooks and fixtures](06-hooks-and-fixtures.md)

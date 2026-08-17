# Lesson 08 - Authentication: log in once, reuse everywhere

**Spec files:** `tests/auth.setup.ts`, `tests/authenticated/08-authenticated-session.spec.ts`
**Run it:** `npx playwright test --project=authenticated`

## The problem

Every test so far started by filling the login form. On a 300-test suite that is
300 logins: minutes of wall-clock time, and 300 chances for a flaky login to fail
a test that was not about logging in.

## The solution: storage state

A browser context's cookies + localStorage can be saved to a JSON file and
loaded into new contexts.

**Step 1 - a setup test that logs in and saves the state** (`tests/auth.setup.ts`):

```ts
setup('authenticate as standard_user', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.waitForURL('**/inventory.html');            // wait for it to be real
  await expect(page.getByTestId('current-user')).toHaveText('standard_user');

  await page.context().storageState({ path: STORAGE_STATE });
});
```

The two waits matter: save too early and you write an empty session, which fails
every downstream test with a confusing redirect.

**Step 2 - wire it into the config:**

```ts
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'authenticated',
    testMatch: '**/authenticated/**',
    dependencies: ['setup'],                        // always runs setup first
    use: { storageState: 'playwright/.auth/user.json' },
  },
]
```

**Step 3 - write tests that start signed in:**

```ts
test('lands on a protected page without logging in', async ({ page }) => {
  await page.goto('/inventory.html');
  await expect(page.getByTestId('current-user')).toHaveText('standard_user');
});
```

## Still isolated

Each test gets a **copy** of the saved state, not a shared session. Adding to the
cart in one test does not affect the next one - so you get the speed of a shared
login with the safety of isolation.

## Practical notes

- `playwright/.auth/` is git-ignored. Never commit real session tokens.
- Multiple roles? One setup file per role, one storage-state file per role, and a
  project per role (`admin`, `customer`, ...).
- Tokens that expire mid-run: the setup project runs once per `npx playwright
  test` invocation, so this only bites on very long runs; re-authenticate in a
  fixture if you hit it.
- Tests *about* logging in must not use the authenticated project - keep them in
  the default project, as lessons 01, 04 and 07 do.
- An even faster variant: get the token from the API and inject it with
  `page.addInitScript()` - see the last test in lesson 09A.

Next: [Lesson 09 - API testing and mocking](09-api-and-mocking.md)

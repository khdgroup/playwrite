# Lesson 11 - Data-driven tests, tags and debugging

**Spec file:** `tests/11-data-driven-and-debugging.spec.ts`

## Data-driven tests

Generate one test per data row. Each row gets its own name, its own retry and
its own line in the report:

```ts
const loginCases = JSON.parse(fs.readFileSync('test-data/login-cases.json', 'utf-8'));

for (const data of loginCases) {
  test(`login is rejected: ${data.title}`, async ({ page }) => {
    ...
    await expect(page.getByTestId('login-error')).toHaveText(data.expectedError);
  });
}
```

**Do not loop inside a single test.** With one test and five iterations, the
first failure hides the other four and the report says nothing about which case
broke.

Data can come from an inline array, a JSON/CSV file, or a generator - it is just
JavaScript running at collection time.

## Tags

```ts
test('critical path still works', { tag: ['@smoke', '@critical'] }, async ({ page }) => { ... });
```

```bash
npx playwright test --grep @smoke              # only smoke tests
npx playwright test --grep-invert @slow        # everything except slow ones
npx playwright test --grep "@smoke|@critical"  # either
```

A practical split: `@smoke` on 5-10 tests that run on every commit, everything
else nightly.

## Annotations and attachments

```ts
test.info().annotations.push({ type: 'issue', description: 'JIRA-1234' });

await testInfo.attach('console.log', { body: logText, contentType: 'text/plain' });
await testInfo.attach('inventory.png', { body: await page.screenshot(), contentType: 'image/png' });
```

Both show up in the HTML report next to the test.

## Debugging toolkit

| Tool | Command | Use it when |
| --- | --- | --- |
| **UI mode** | `npx playwright test --ui` | Default choice. Watch mode, time-travel through every action, pick locators live |
| **Inspector** | `npx playwright test --debug` | Step through a test line by line |
| **Headed** | `npx playwright test --headed` | Just want to see the browser |
| **Codegen** | `npx playwright codegen http://127.0.0.1:4173` | Record actions into starter code |
| **Trace viewer** | `npx playwright show-trace test-results/.../trace.zip` | A CI failure you cannot reproduce locally |
| **HTML report** | `npx playwright show-report` | After any run |
| **Slow motion** | `--headed --slow-mo=500` (via config `launchOptions`) | Watch what is happening at human speed |

Also useful: `PWDEBUG=1 npx playwright test` opens the Inspector,
`DEBUG=pw:api npx playwright test` logs every protocol call.

### Reading a trace

The trace records a screenshot before/after every action, the DOM snapshot, the
network log and the console. On a failure it answers "what did the page actually
look like at that moment" - which is nearly always the question. Our config uses
`trace: 'on-first-retry'`; set `trace: 'on'` locally while investigating.

## Retries and flakiness

```ts
retries: process.env.CI ? 2 : 0
```

A test that fails then passes is reported as **flaky**, not passed. Treat flaky
as broken: retries exist to keep the pipeline moving while you fix the root
cause, not to hide it. The usual causes, in order: hard-coded sleeps, tests
depending on each other's data, and assertions on non-deterministic content.

## Visual regression (opt-in here)

```ts
await expect(page).toHaveScreenshot('about-page.png', { maxDiffPixelRatio: 0.02 });
```

First run creates the baseline; later runs diff against it. Baselines are
per-OS/browser, so they must be generated in the same environment CI uses -
usually a Docker image. Run ours with:

```bash
PW_VISUAL=1 npx playwright test -g "matches the baseline" --update-snapshots
PW_VISUAL=1 npx playwright test -g "matches the baseline"
```

Next: [CI with GitHub Actions](12-ci.md)

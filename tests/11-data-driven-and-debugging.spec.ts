import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

/**
 * LESSON 11 - Data-driven tests, tags and debugging
 * Read docs/lessons/11-data-driven-and-debugging.md alongside this file.
 *
 * Handy commands while working on this file:
 *   npx playwright test --ui                  interactive mode with time travel
 *   npx playwright test tests/11-*.spec.ts --debug     step through with Inspector
 *   npx playwright test --grep @smoke         run only the smoke tests
 *   npx playwright test --grep-invert @slow   skip the slow ones
 *   npx playwright show-report                open the HTML report
 *   npx playwright show-trace test-results/.../trace.zip
 */

type LoginCase = {
  title: string;
  username: string;
  password: string;
  expectedError: string;
};

const loginCases: LoginCase[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'test-data', 'login-cases.json'), 'utf-8'),
);

test.describe('Lesson 11A - data-driven tests', () => {
  // One test per data row: each gets its own name, its own retry and its own
  // line in the report. Never loop *inside* a single test - the first failure
  // would hide every later case.
  for (const data of loginCases) {
    test(`login is rejected: ${data.title}`, async ({ page }) => {
      await page.goto('/');
      await page.getByLabel('Username').fill(data.username);
      await page.getByLabel('Password').fill(data.password);
      await page.getByRole('button', { name: 'Log in' }).click();

      await expect(page.getByTestId('login-error')).toHaveText(data.expectedError);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }

  const sortCases = [
    { option: 'Name (A to Z)', expectedFirst: '27" 4K Monitor' },
    { option: 'Name (Z to A)', expectedFirst: 'Wireless Mouse' },
    { option: 'Price (low to high)', expectedFirst: 'Wireless Mouse' },
    { option: 'Price (high to low)', expectedFirst: '27" 4K Monitor' },
  ];

  for (const { option, expectedFirst } of sortCases) {
    test(`sorting by "${option}" puts ${expectedFirst} first`, async ({ page }) => {
      await page.goto('/');
      await page.getByLabel('Username').fill('standard_user');
      await page.getByLabel('Password').fill('secret123');
      await page.getByRole('button', { name: 'Log in' }).click();
      await page.waitForURL('**/inventory.html');

      await page.getByLabel('Sort by').selectOption({ label: option });
      await expect(page.getByTestId('product-card').first()).toContainText(expectedFirst);
    });
  }
});

test.describe('Lesson 11B - tags, annotations and reporting', () => {
  test('critical path still works', { tag: ['@smoke', '@critical'] }, async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
  });

  test('full catalogue check', { tag: '@regression' }, async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Username').fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByTestId('product-card')).toHaveCount(6);
  });

  test('attachments and console logs land in the HTML report', async ({ page }, testInfo) => {
    const consoleMessages: string[] = [];
    page.on('console', (message) => consoleMessages.push(`${message.type()}: ${message.text()}`));
    page.on('pageerror', (error) => consoleMessages.push(`pageerror: ${error.message}`));

    await page.goto('/');
    await page.getByLabel('Username').fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.waitForURL('**/inventory.html');

    await testInfo.attach('console.log', {
      body: consoleMessages.join('\n') || '(no console output)',
      contentType: 'text/plain',
    });
    await testInfo.attach('inventory.png', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });

    // The browser should not be throwing errors during a happy-path flow.
    expect(consoleMessages.filter((line) => line.startsWith('pageerror'))).toEqual([]);
  });

  test.describe('visual regression (opt-in)', () => {
    // Screenshot baselines are machine-specific (fonts, GPU, OS), so this stays
    // off by default. Turn it on with:
    //   PW_VISUAL=1 npx playwright test -g "matches the baseline" --update-snapshots
    // and from then on:
    //   PW_VISUAL=1 npx playwright test -g "matches the baseline"
    test.skip(!process.env.PW_VISUAL, 'Set PW_VISUAL=1 to run visual tests');

    test('the about page matches the baseline', async ({ page }) => {
      await page.goto('/about.html');
      await expect(page).toHaveScreenshot('about-page.png', { maxDiffPixelRatio: 0.02 });
    });
  });
});

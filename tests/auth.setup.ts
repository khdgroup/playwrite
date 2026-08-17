import { test as setup, expect } from '@playwright/test';
import path from 'node:path';

/**
 * LESSON 08 (part 1) - log in once, reuse everywhere.
 *
 * This file is picked up by the `setup` project in playwright.config.ts, and the
 * `authenticated` project declares `dependencies: ['setup']`, so it always runs
 * first. The saved file contains cookies + localStorage for the app's origin.
 *
 * Result: one login per run instead of one per test.
 */

export const STORAGE_STATE = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate as standard_user', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Log in' }).click();

  // Wait for the session to actually exist before saving it, otherwise you can
  // capture an empty state and every downstream test fails mysteriously.
  await page.waitForURL('**/inventory.html');
  await expect(page.getByTestId('current-user')).toHaveText('standard_user');

  await page.context().storageState({ path: STORAGE_STATE });
});

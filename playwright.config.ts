import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the QA training course.
 *
 * Read this file top to bottom once - almost every question a new automation
 * engineer has ("where do screenshots go?", "how do I run on Firefox?",
 * "why does it retry?") is answered by one of the options below.
 *
 * Docs: https://playwright.dev/docs/test-configuration
 */

/** The demo app under test. Started automatically by the `webServer` block. */
export const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:4173';

export default defineConfig({
  // Where the spec files live.
  testDir: './tests',

  // Run tests inside a single file in parallel too (each test gets its own page).
  fullyParallel: true,

  // Fail the build on CI if someone accidentally committed `test.only`.
  forbidOnly: !!process.env.CI,

  // Retry flaky tests on CI only, so locally you see failures immediately.
  retries: process.env.CI ? 2 : 0,

  // Worker processes. Undefined = one per CPU core (halved on CI).
  workers: process.env.CI ? 1 : undefined,

  // Hard limits: a single test may run 30s, a single expect may wait 5s.
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // Reporters: pretty output in the terminal + an HTML report you can open later.
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  // Settings inherited by every test.
  use: {
    baseURL: BASE_URL,

    // Artefacts. `on-first-retry` keeps runs fast but still captures evidence.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // How long a single action (click, fill, ...) may wait for the element.
    actionTimeout: 10_000,

    // Makes `getByTestId()` look at data-testid attributes (this is the default,
    // shown here so you know where to change it if your app uses data-qa).
    testIdAttribute: 'data-testid',
  },

  projects: [
    // 1. Lessons 01-07 + 09-11: plain browser, no logged-in state.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/authenticated/**', '**/*.setup.ts'],
    },

    // 2. Lesson 08: log in once here...
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // ...then reuse that session for every test in tests/authenticated.
    {
      name: 'authenticated',
      testMatch: '**/authenticated/**',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
    },

    // 3. Cross-browser. Uncomment after running:
    //    npx playwright install firefox webkit
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    //   testIgnore: ['**/authenticated/**', '**/*.setup.ts'],
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    //   testIgnore: ['**/authenticated/**', '**/*.setup.ts'],
    // },
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 7'] },
    //   testIgnore: ['**/authenticated/**', '**/*.setup.ts'],
    // },
  ],

  // Playwright starts the demo app before the run and shuts it down after.
  webServer: {
    command: 'node app/server.js',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});

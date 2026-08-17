# Playwright for QA - a hands-on course

A self-contained Playwright training repo: a small e-commerce app to test
against, eleven lessons that build on each other, and exercises with solutions.

Everything runs **offline on your laptop**. No staging environment, no test
accounts to request, no flaky third-party site.

---

## 1. Setup (5 minutes)

```bash
npm install
npx playwright install chromium     # add "firefox webkit" for cross-browser later
npx playwright test                 # should finish green
```

Requirements: Node.js 18 or newer.

You never need to start the app yourself - Playwright boots it before the run and
stops it after (the `webServer` block in `playwright.config.ts`). To poke at it
by hand:

```bash
npm run app        # http://127.0.0.1:4173
```

Log in with **standard_user / secret123** (or **locked_user / secret123** to see
a rejected login).

## 2. How to work through the course

Each lesson is a pair: a markdown explanation and a runnable spec file with
heavily commented examples.

```bash
# read docs/lessons/01-first-test.md, then:
npx playwright test tests/01-first-test.spec.ts --headed
```

Best way to learn: open **UI mode** and keep it open all day.

```bash
npx playwright test --ui
```

| # | Lesson | Doc | Spec |
| --- | --- | --- | --- |
| 01 | Your first test | [doc](docs/lessons/01-first-test.md) | `tests/01-first-test.spec.ts` |
| 02 | Locators - finding elements | [doc](docs/lessons/02-locators.md) | `tests/02-locators.spec.ts` |
| 03 | Assertions | [doc](docs/lessons/03-assertions.md) | `tests/03-assertions.spec.ts` |
| 04 | Forms, inputs and actions | [doc](docs/lessons/04-forms-and-input.md) | `tests/04-forms-and-input.spec.ts` |
| 05 | Waiting, without sleeps | [doc](docs/lessons/05-waiting.md) | `tests/05-waiting.spec.ts` |
| 06 | Hooks, fixtures and steps | [doc](docs/lessons/06-hooks-and-fixtures.md) | `tests/06-hooks-and-fixtures.spec.ts` |
| 07 | Page Object Model | [doc](docs/lessons/07-page-object-model.md) | `tests/07-page-object-model.spec.ts` |
| 08 | Authentication / storage state | [doc](docs/lessons/08-authentication.md) | `tests/auth.setup.ts`, `tests/authenticated/` |
| 09 | API testing and mocking | [doc](docs/lessons/09-api-and-mocking.md) | `tests/09-api-and-mocking.spec.ts` |
| 10 | Dialogs, tabs, uploads, iframes | [doc](docs/lessons/10-dialogs-tabs-uploads-frames.md) | `tests/10-dialogs-tabs-uploads-frames.spec.ts` |
| 11 | Data-driven tests and debugging | [doc](docs/lessons/11-data-driven-and-debugging.md) | `tests/11-data-driven-and-debugging.spec.ts` |
| 12 | Running in CI | [doc](docs/lessons/12-ci.md) | `.github/workflows/playwright.yml` |

Then: **[Exercises](docs/EXERCISES.md)** (`tests/exercises/`) and the
**[Cheat sheet](docs/CHEATSHEET.md)**.

Suggested pacing for a team: lessons 01-05 in the first session, 06-08 in the
second, 09-12 in the third, exercises as homework between them.

## 3. The app under test

**QA Shop** - `app/`, ~400 lines of vanilla HTML/JS and a dependency-free Node
server, so nothing gets in the way of the testing lessons.

| Page | What it exercises |
| --- | --- |
| `/index.html` | Login form, validation errors, locked-account error |
| `/inventory.html` | Product grid, live search, sorting, cart badge, a slow API call and a late-appearing banner |
| `/cart.html` | Table rows, remove buttons, totals, checkout form, server-side validation, confirmation |
| `/playground.html` | Dialogs, a new tab, file upload, an iframe, a 2-second background job |

JSON API used by lessons 05 and 09:

| Endpoint | Notes |
| --- | --- |
| `POST /api/login` | 200 / 401 wrong credentials / 403 locked |
| `GET /api/products` | 6 products, one out of stock |
| `GET /api/reviews` | Deliberately responds after 1.2s |
| `POST /api/checkout` | 201, or 400 with the first missing field |

Test accounts:

| Username | Password | Result |
| --- | --- | --- |
| `standard_user` | `secret123` | Logs in |
| `locked_user` | `secret123` | "Sorry, this user has been locked out." |

## 4. Repo layout

```
app/                    the demo application + its server
tests/                  one spec per lesson
  authenticated/        lesson 08 - tests that start signed in
  exercises/            your turn (test.fixme stubs)
  auth.setup.ts         lesson 08 - saves the login session
pages/                  page objects (lesson 07)
fixtures/fixtures.ts    custom fixtures: loggedInPage, page objects, test users
test-data/              JSON test cases and an upload fixture file
docs/lessons/           the written lessons
docs/EXERCISES.md       exercises with solutions
docs/CHEATSHEET.md      one-page API reference
playwright.config.ts    fully commented configuration
```

## 5. Commands you will use

```bash
npx playwright test                          # everything
npx playwright test tests/03-assertions.spec.ts
npx playwright test -g "logs in"             # by title
npx playwright test --grep @smoke            # by tag
npx playwright test --project=authenticated  # lesson 08 only
npx playwright test --ui                     # interactive mode
npx playwright test --headed --workers=1     # watch it happen, one at a time
npx playwright test --debug                  # step-through inspector
npx playwright show-report                   # last HTML report
npx playwright codegen http://127.0.0.1:4173 # record a test
```

## 6. Team conventions this repo demonstrates

1. Locate by role/label first, `data-testid` when there is nothing user-visible,
   CSS/XPath as a last resort.
2. No `waitForTimeout` in committed code - assertions do the waiting.
3. One behaviour per test; no test depends on another test's leftovers.
4. Page objects hold locators and intent; assertions live in the tests.
5. Test data comes from `test-data/` or fixtures, never hardcoded twice.
6. Mock the edges (errors, third parties), run the core against the real backend.
7. A flaky test is a broken test - fix the cause, do not raise the retry count.

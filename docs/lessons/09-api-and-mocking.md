# Lesson 09 - API testing and network mocking

**Spec file:** `tests/09-api-and-mocking.spec.ts`

Two distinct skills that share a lesson because they use the same knowledge of
the app's HTTP traffic.

## A. Testing the API directly

The `request` fixture is a full HTTP client with the config's `baseURL` applied.
No browser is launched, so these tests run in milliseconds.

```ts
test('GET /api/products returns the catalogue', async ({ request }) => {
  const response = await request.get('/api/products');

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');

  const products = await response.json();
  expect(products).toHaveLength(6);
  expect(products[0]).toMatchObject({ id: 1, name: 'Wireless Mouse' });
});
```

```ts
await request.post('/api/login', { data: { username, password } });
await request.put('/api/thing/1', { data: {...} });
await request.get('/api/thing', { params: { page: 2 }, headers: { Authorization: 'Bearer x' } });
```

Useful response methods: `status()`, `ok()`, `headers()`, `json()`, `text()`,
`body()`.

**Where this fits in a test strategy:** validation rules, error codes and edge
cases belong in API tests - they are 50× faster and never flake. Keep UI tests
for what only the UI can prove.

## Hybrid: set up over the API, verify in the UI

```ts
const { token, username } = await (await request.post('/api/login', { data: creds })).json();

await page.addInitScript(([user, jwt]) => {
  localStorage.setItem('qa-shop.auth', JSON.stringify({ username: user, token: jwt }));
}, [username, token]);

await page.goto('/inventory.html');   // already signed in
```

`addInitScript` runs before any page script on every navigation - the standard
way to seed state, stub `Date`, or set feature flags.

## B. Mocking the network with `page.route`

`page.route(pattern, handler)` intercepts requests **the browser makes**, letting
you force states that are hard to produce for real.

```ts
// replace the response
await page.route('**/api/products', route => route.fulfill({ json: [ ...fake ] }));

// force a server error
await page.route('**/api/checkout', route =>
  route.fulfill({ status: 500, json: { error: 'Payment provider unavailable.' } }));

// block it entirely
await page.route('**/api/reviews*', route => route.abort());

// let it through untouched
await page.route('**/api/**', route => route.continue());

// modify the real response
await page.route('**/api/products', async route => {
  const response = await route.fetch();
  const body = await response.json();
  body.forEach(p => { p.price = 0; });
  await route.fulfill({ response, json: body });
});
```

Routes must be registered **before** the request happens. Registering after the
page has loaded means calling `page.reload()` to see the effect.

### What mocking is good for

- Empty states, error states, 500s, timeouts - deterministic and instant.
- Third-party services you cannot or should not call from tests.
- Pinning volatile data (prices, dates) so assertions stay stable.

### What it is bad for

- Your main happy-path suite. A mocked test cannot catch a real backend
  regression, and a mock that drifts from the real contract gives false
  confidence. Mock the edges, run the core against the real thing.

## Spying without changing anything

```ts
const urls: string[] = [];
page.on('request', r => urls.push(r.url()));
page.on('response', r => console.log(r.status(), r.url()));
page.on('console', m => console.log(m.type(), m.text()));
page.on('pageerror', e => console.log('JS error:', e.message));
```

Asserting "no JS errors during the flow" is a cheap, high-value check - see
lesson 11.

Next: [Lesson 10 - Dialogs, tabs, uploads, iframes](10-dialogs-tabs-uploads-frames.md)

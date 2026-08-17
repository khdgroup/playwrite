/**
 * QA Shop - the demo application used throughout this course.
 *
 * Deliberately dependency-free: `node app/server.js` is all it takes.
 * Playwright starts it automatically (see `webServer` in playwright.config.ts).
 *
 * Static files come from this folder. On top of that it exposes a small JSON API
 * so the course can cover API testing and network mocking:
 *
 *   POST /api/login      { username, password }  -> { token, username }
 *   GET  /api/products                           -> Product[]
 *   GET  /api/reviews?productId=1                -> Review[]   (slow on purpose)
 *   POST /api/checkout   { firstName, lastName, postalCode, items }
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT ?? 4173);
const HOST = process.env.HOST ?? '127.0.0.1';
const ROOT = __dirname;

const USERS = {
  standard_user: { password: 'secret123', status: 'active' },
  locked_user: { password: 'secret123', status: 'locked' },
};

const PRODUCTS = [
  { id: 1, name: 'Wireless Mouse', price: 24.99, category: 'accessories', stock: 12, description: 'Silent clicks, 18-month battery.' },
  { id: 2, name: 'Mechanical Keyboard', price: 89.5, category: 'accessories', stock: 5, description: 'Hot-swappable brown switches.' },
  { id: 3, name: 'USB-C Hub', price: 45.0, category: 'accessories', stock: 0, description: '7-in-1, 100W pass-through charging.' },
  { id: 4, name: '27" 4K Monitor', price: 399.0, category: 'displays', stock: 3, description: 'IPS panel, 99% sRGB.' },
  { id: 5, name: 'Laptop Stand', price: 32.75, category: 'furniture', stock: 20, description: 'Aluminium, adjustable height.' },
  { id: 6, name: 'Noise Cancelling Headphones', price: 199.99, category: 'audio', stock: 7, description: '30-hour battery, USB-C.' },
];

const REVIEWS = [
  { id: 1, author: 'Priya', rating: 5, comment: 'Works exactly as described.' },
  { id: 2, author: 'Marcus', rating: 4, comment: 'Good value, packaging was dented.' },
  { id: 3, author: 'Sofia', rating: 3, comment: 'Fine, but the cable is short.' },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function sendJson(res, status, body, delayMs = 0) {
  const payload = JSON.stringify(body);
  const write = () => {
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(payload);
  };
  if (delayMs > 0) setTimeout(write, delayMs);
  else write();
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

async function handleApi(req, res, url) {
  const route = `${req.method} ${url.pathname}`;

  if (route === 'POST /api/login') {
    const { username, password } = await readBody(req);
    const user = USERS[username];

    if (!user || user.password !== password) {
      return sendJson(res, 401, {
        error: 'Username and password do not match any user in this service.',
      });
    }
    if (user.status === 'locked') {
      return sendJson(res, 403, { error: 'Sorry, this user has been locked out.' });
    }
    return sendJson(res, 200, { token: `token-${username}-${Date.now()}`, username });
  }

  if (route === 'GET /api/products') {
    return sendJson(res, 200, PRODUCTS);
  }

  if (route === 'GET /api/reviews') {
    // Slow on purpose: lesson 05 uses it to teach auto-waiting.
    return sendJson(res, 200, REVIEWS, 1200);
  }

  if (route === 'POST /api/checkout') {
    const body = await readBody(req);
    const missing = ['firstName', 'lastName', 'postalCode'].filter(
      (field) => !String(body[field] ?? '').trim(),
    );
    if (missing.length > 0) {
      return sendJson(res, 400, { error: `Missing required field: ${missing[0]}` });
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return sendJson(res, 400, { error: 'Your cart is empty.' });
    }
    const total = body.items.reduce((sum, item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    return sendJson(res, 201, {
      orderId: `QA-${1000 + body.items.length}`,
      total: Number(total.toFixed(2)),
    });
  }

  return sendJson(res, 404, { error: `No API route for ${route}` });
}

function serveStatic(req, res, url) {
  const rel = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1 data-testid="not-found">404 - page not found</h1>');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith('/api/')) {
    handleApi(req, res, url).catch(() => sendJson(res, 500, { error: 'Server error' }));
  } else {
    serveStatic(req, res, url);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`QA Shop running at http://${HOST}:${PORT}`);
});

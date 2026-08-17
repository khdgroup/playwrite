/* Shared helpers: session, cart storage and the header cart badge. */

const AUTH_KEY = 'qa-shop.auth';
const CART_KEY = 'qa-shop.cart';

const session = {
  save(auth) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  },
  read() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
    } catch {
      return null;
    }
  },
  clear() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(CART_KEY);
  },
  /** Pages behind the login wall call this first. */
  requireLogin() {
    const auth = session.read();
    if (!auth) {
      location.replace('/index.html?redirected=1');
      return null;
    }
    return auth;
  },
};

const cart = {
  read() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch {
      return [];
    }
  },
  write(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    renderCartBadge();
  },
  add(id) {
    const items = cart.read();
    const line = items.find((item) => item.id === id);
    if (line) line.quantity += 1;
    else items.push({ id, quantity: 1 });
    cart.write(items);
  },
  remove(id) {
    cart.write(cart.read().filter((item) => item.id !== id));
  },
  count() {
    return cart.read().reduce((total, item) => total + item.quantity, 0);
  },
  clear() {
    cart.write([]);
  },
};

function renderCartBadge() {
  const badge = document.querySelector('[data-testid="cart-count"]');
  if (badge) badge.textContent = String(cart.count());
}

function renderHeaderUser() {
  const auth = session.read();
  const label = document.querySelector('[data-testid="current-user"]');
  if (label && auth) label.textContent = auth.username;

  const logout = document.querySelector('[data-testid="logout-button"]');
  if (logout) {
    logout.addEventListener('click', () => {
      session.clear();
      location.href = '/index.html';
    });
  }
}

function money(value) {
  return `$${Number(value).toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartBadge();
  renderHeaderUser();
});

/* Cart page: renders cart lines and submits the checkout form to /api/checkout. */

let catalogue = [];

function lines() {
  return cart
    .read()
    .map((item) => ({ ...item, product: catalogue.find((p) => p.id === item.id) }))
    .filter((line) => line.product);
}

function render() {
  const body = document.querySelector('[data-testid="cart-items"]');
  const table = document.querySelector('[data-testid="cart-table"]');
  const empty = document.querySelector('[data-testid="empty-cart"]');
  const form = document.querySelector('[data-testid="checkout-form"]');
  const current = lines();

  body.innerHTML = '';
  let total = 0;

  for (const line of current) {
    const subtotal = line.product.price * line.quantity;
    total += subtotal;

    const row = document.createElement('tr');
    row.dataset.testid = 'cart-row';
    row.dataset.productId = String(line.id);
    row.innerHTML = `
      <td data-testid="cart-item-name">${line.product.name}</td>
      <td>${money(line.product.price)}</td>
      <td data-testid="cart-item-qty">${line.quantity}</td>
      <td data-testid="cart-item-subtotal">${money(subtotal)}</td>
      <td><button class="secondary" data-testid="remove-item">Remove</button></td>
    `;
    row.querySelector('[data-testid="remove-item"]').addEventListener('click', () => {
      cart.remove(line.id);
      render();
    });
    body.appendChild(row);
  }

  document.querySelector('[data-testid="cart-total"]').textContent = money(total);

  const isEmpty = current.length === 0;
  empty.classList.toggle('hidden', !isEmpty);
  table.classList.toggle('hidden', isEmpty);
  form.classList.toggle('hidden', isEmpty);
}

async function loadCatalogue() {
  const response = await fetch('/api/products');
  catalogue = await response.json();
  render();
}

function wireCheckout() {
  const form = document.querySelector('[data-testid="checkout-form"]');
  const error = document.querySelector('[data-testid="checkout-error"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.classList.add('hidden');

    const payload = {
      firstName: document.querySelector('[data-testid="first-name"]').value.trim(),
      lastName: document.querySelector('[data-testid="last-name"]').value.trim(),
      postalCode: document.querySelector('[data-testid="postal-code"]').value.trim(),
      giftWrap: document.querySelector('[data-testid="gift-wrap"]').checked,
      items: cart.read(),
    };

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      error.textContent = data.error || 'Checkout failed.';
      error.classList.remove('hidden');
      return;
    }

    document.querySelector('[data-testid="order-id"]').textContent = data.orderId;
    document.querySelector('[data-testid="order-total"]').textContent = money(data.total);
    document.querySelector('[data-testid="order-confirmation"]').classList.remove('hidden');
    document.querySelector('[data-testid="cart-view"]').classList.add('hidden');
    cart.clear();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!session.requireLogin()) return;
  wireCheckout();
  loadCatalogue();
});

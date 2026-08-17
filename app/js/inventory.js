/* Product listing: fetches /api/products, then filters and sorts client-side. */

let allProducts = [];

function sortProducts(products, mode) {
  const sorted = [...products];
  switch (mode) {
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

function render() {
  const list = document.querySelector('[data-testid="product-list"]');
  const emptyState = document.querySelector('[data-testid="empty-state"]');
  const counter = document.querySelector('[data-testid="result-count"]');
  const query = document.querySelector('[data-testid="search"]').value.trim().toLowerCase();
  const sortMode = document.querySelector('[data-testid="sort"]').value;

  const visible = sortProducts(
    allProducts.filter((product) => product.name.toLowerCase().includes(query)),
    sortMode,
  );

  list.innerHTML = '';
  for (const product of visible) {
    const card = document.createElement('article');
    card.className = 'card product';
    card.dataset.testid = 'product-card';
    card.dataset.productId = String(product.id);
    card.innerHTML = `
      <h3>${product.name}</h3>
      <p class="desc">${product.description}</p>
      <p class="price" data-testid="product-price">${money(product.price)}</p>
      ${product.stock === 0 ? '<p class="out-of-stock" data-testid="out-of-stock">Out of stock</p>' : ''}
      <button data-testid="add-to-cart" ${product.stock === 0 ? 'disabled' : ''}>
        Add to cart
      </button>
    `;
    card.querySelector('[data-testid="add-to-cart"]').addEventListener('click', () => {
      cart.add(product.id);
    });
    list.appendChild(card);
  }

  counter.textContent = `${visible.length} product${visible.length === 1 ? '' : 's'} found`;
  emptyState.classList.toggle('hidden', visible.length > 0);
}

async function loadProducts() {
  const response = await fetch('/api/products');
  allProducts = await response.json();
  render();
}

function wireReviews() {
  const button = document.querySelector('[data-testid="load-reviews"]');
  const loading = document.querySelector('[data-testid="reviews-loading"]');
  const list = document.querySelector('[data-testid="reviews"]');

  button.addEventListener('click', async () => {
    button.disabled = true;
    loading.classList.remove('hidden');
    list.classList.add('hidden');

    const response = await fetch('/api/reviews?productId=1');
    const reviews = await response.json();

    list.innerHTML = reviews
      .map((review) => `<li data-testid="review">${review.author} - ${review.rating}/5 - ${review.comment}</li>`)
      .join('');

    loading.classList.add('hidden');
    list.classList.remove('hidden');
    button.disabled = false;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!session.requireLogin()) return;

  document.querySelector('[data-testid="search"]').addEventListener('input', render);
  document.querySelector('[data-testid="sort"]').addEventListener('change', render);
  wireReviews();
  loadProducts();

  // Appears late on purpose - lesson 05 uses it to show auto-waiting.
  setTimeout(() => {
    const banner = document.querySelector('[data-testid="promo-banner"]');
    banner.textContent = 'Free shipping on orders over $50 today!';
    banner.classList.remove('hidden');
  }, 900);
});

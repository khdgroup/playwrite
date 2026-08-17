import { type Locator, type Page, expect } from '@playwright/test';

/** Page Object for /inventory.html (see lesson 07). */
export class InventoryPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly search: Locator;
  readonly sort: Locator;
  readonly products: Locator;
  readonly resultCount: Locator;
  readonly emptyState: Locator;
  readonly cartLink: Locator;
  readonly cartCount: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Products', level: 1 });
    this.search = page.getByTestId('search');
    this.sort = page.getByTestId('sort');
    this.products = page.getByTestId('product-card');
    this.resultCount = page.getByTestId('result-count');
    this.emptyState = page.getByTestId('empty-state');
    this.cartLink = page.getByTestId('cart-link');
    this.cartCount = page.getByTestId('cart-count');
    this.logoutButton = page.getByTestId('logout-button');
  }

  async goto() {
    await this.page.goto('/inventory.html');
    await expect(this.heading).toBeVisible();
  }

  /** One product card, found by its visible name. */
  card(productName: string): Locator {
    return this.products.filter({ hasText: productName });
  }

  async addToCart(productName: string) {
    await this.card(productName).getByTestId('add-to-cart').click();
  }

  async searchFor(term: string) {
    await this.search.fill(term);
  }

  async sortBy(label: string) {
    await this.sort.selectOption({ label });
  }

  async openCart() {
    await this.cartLink.click();
  }

  async productNames(): Promise<string[]> {
    return this.products.locator('h3').allTextContents();
  }
}

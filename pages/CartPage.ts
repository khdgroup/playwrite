import { type Locator, type Page, expect } from '@playwright/test';

export type CheckoutDetails = {
  firstName: string;
  lastName: string;
  postalCode: string;
  giftWrap?: boolean;
};

/** Page Object for /cart.html (see lesson 07). */
export class CartPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly rows: Locator;
  readonly total: Locator;
  readonly emptyMessage: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly giftWrap: Locator;
  readonly placeOrder: Locator;
  readonly error: Locator;
  readonly confirmation: Locator;
  readonly orderId: Locator;
  readonly orderTotal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Your cart', level: 1 });
    this.rows = page.getByTestId('cart-row');
    this.total = page.getByTestId('cart-total');
    this.emptyMessage = page.getByTestId('empty-cart');
    this.firstName = page.getByLabel('First name');
    this.lastName = page.getByLabel('Last name');
    this.postalCode = page.getByLabel('Postal code');
    this.giftWrap = page.getByTestId('gift-wrap');
    this.placeOrder = page.getByRole('button', { name: 'Place order' });
    this.error = page.getByTestId('checkout-error');
    this.confirmation = page.getByTestId('order-confirmation');
    this.orderId = page.getByTestId('order-id');
    this.orderTotal = page.getByTestId('order-total');
  }

  async goto() {
    await this.page.goto('/cart.html');
    await expect(this.heading).toBeVisible();
  }

  row(productName: string): Locator {
    return this.rows.filter({ hasText: productName });
  }

  async removeItem(productName: string) {
    await this.row(productName).getByTestId('remove-item').click();
  }

  async checkout(details: CheckoutDetails) {
    await this.firstName.fill(details.firstName);
    await this.lastName.fill(details.lastName);
    await this.postalCode.fill(details.postalCode);
    if (details.giftWrap) await this.giftWrap.check();
    await this.placeOrder.click();
  }
}

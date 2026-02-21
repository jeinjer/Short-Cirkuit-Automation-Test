import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';

import { CatalogPage } from '../../pages/CatalogPage';
import { ProductDetailPage } from '../../pages/ProductDetailPage';
import { CartDrawerPage } from '../../pages/CartDrawerPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

Given('limpio el carrito si tiene items', async function (this: CustomWorld) {
  const cartBtn = this.page.locator('button[title="Carrito"]').first();
  await cartBtn.waitFor({ state: 'visible' });
  await cartBtn.click();

  const cart = new CartDrawerPage(this.page);
  await cart.waitOpen();
  await cart.clearIfHasItems();
  await cartBtn.click().catch(() => {});
  await this.page.getByRole('heading', { name: /mi carrito/i }).first().waitFor({ state: 'hidden' }).catch(() => {});
});

When('agrego un producto con stock al carrito', async function (this: CustomWorld) {
  const catalog = new CatalogPage(this.page);
  await catalog.goto(config.baseUrl);
  await catalog.openFirstProductWithStock(8);

  const pdp = new ProductDetailPage(this.page);
  const loaded = await pdp.waitLoaded();
  if (!loaded) throw new Error('No se pudo abrir un producto con stock para agregar al carrito.');

  const name = await pdp.getProductName();
  this.state.productName = name;
  await pdp.addToCart();
});

When('voy a checkout desde el carrito', async function (this: CustomWorld) {
  const cartBtn = this.page.locator('button[title="Carrito"]').first();
  await cartBtn.waitFor({ state: 'visible' });
  await cartBtn.click();

  const cart = new CartDrawerPage(this.page);
  await cart.waitOpen();
  await cart.goToCheckout();
});

When('genero el pedido', async function (this: CustomWorld) {
  const checkout = new CheckoutPage(this.page);
  await checkout.waitLoaded();
  const orderId = await checkout.generateOrder();
  this.state.orderId = orderId;
});

async function assertOrderAndContinue(this: CustomWorld) {
  expect((this.state.orderId || '').length > 0).to.equal(true);
  const continuar = this.page.getByRole('link', { name: /^continuar$/i }).first();
  const visible = await continuar.isVisible().catch(() => false);
  expect(visible).to.equal(true);
}

async function assertCartEmpty(this: CustomWorld) {
  const cartBtn = this.page.locator('button[title="Carrito"]').first();
  await cartBtn.click();

  const cart = new CartDrawerPage(this.page);
  await cart.waitOpen();
  await cart.assertEmpty();
}

Then('veo el ID del pedido y el botón Continuar', assertOrderAndContinue);
Then('veo el ID del pedido y el boton Continuar', assertOrderAndContinue);
Then('veo el ID del pedido y el botÃ³n Continuar', assertOrderAndContinue);

Then('el carrito queda vacío', assertCartEmpty);
Then('el carrito queda vacio', assertCartEmpty);
Then('el carrito queda vacÃ­o', assertCartEmpty);

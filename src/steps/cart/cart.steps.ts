import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';

import { LoginPage } from '../../pages/LoginPage';
import { CatalogPage } from '../../pages/CatalogPage';
import { ProductDetailPage } from '../../pages/ProductDetailPage';
import { CartDrawerPage } from '../../pages/CartDrawerPage';

Given('estoy logueado como cliente', async function (this: CustomWorld) {
  const userMenu = this.page.getByRole('button').filter({ hasText: /usuario/i }).first();
  const already = await userMenu.isVisible().catch(() => false);
  if (already) return;

  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;
  if (!email || !password) throw new Error('Faltan TEST_EMAIL o TEST_PASSWORD en .env');

  const login = new LoginPage(this.page);
  await login.goto(config.baseUrl);
  await login.login(email, password);

  // confirmación mínima
  await userMenu.waitFor({ state: 'visible', timeout: config.timeouts.expect });
});

When('abro el primer producto con stock', async function (this: CustomWorld) {
  const catalog = new CatalogPage(this.page);
  await catalog.openFirstProductWithStock();

  const pdp = new ProductDetailPage(this.page);
  await pdp.waitLoaded();
  this.state.productName = await pdp.getProductName();
});

When('abro el primer producto con stock suficiente para incrementar', async function (this: CustomWorld) {
  const catalog = new CatalogPage(this.page);
  await catalog.openFirstProductWithStock(2); // minStock=2

  const pdp = new ProductDetailPage(this.page);
  await pdp.waitLoaded();
  this.state.productName = await pdp.getProductName();
});

When('agrego el producto al carrito', async function (this: CustomWorld) {
  const pdp = new ProductDetailPage(this.page);
  await pdp.addToCart();
});

Then('veo el panel de carrito con el producto', async function (this: CustomWorld) {
  const pdp = new ProductDetailPage(this.page);
  await pdp.openCartDrawer();

  const cart = new CartDrawerPage(this.page);
  await cart.waitOpen();

  const name = this.state.productName || '';
  expect(name.length > 0).to.equal(true);

  await cart.assertHasProduct(name);
});



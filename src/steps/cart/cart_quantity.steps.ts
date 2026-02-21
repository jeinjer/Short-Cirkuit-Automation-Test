import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { Header } from '../../pages/Header';
import { CartDrawerPage } from '../../pages/CartDrawerPage';
import { config } from '../../support/env';

async function poll<T>(
  fn: () => Promise<T>,
  predicate: (v: T) => boolean,
  timeoutMs: number,
  intervalMs = 200
): Promise<T> {
  const start = Date.now();
  let last: T;
  while (Date.now() - start < timeoutMs) {
    last = await fn();
    if (predicate(last)) return last;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  // @ts-ignore
  return last;
}

When('abro el carrito', async function (this: CustomWorld) {
  const header = new Header(this.page);
  await header.openCart();

  const cart = new CartDrawerPage(this.page);
  await cart.waitOpen();
});

When('guardo cantidad e items actuales', async function (this: CustomWorld) {
  const cart = new CartDrawerPage(this.page);
  await cart.waitOpen();

  this.state.qtyBefore = await cart.getFirstItemQuantity();
  this.state.itemsBefore = await cart.getTotalItemsCount();
});

When('incremento la cantidad del primer item', async function (this: CustomWorld) {
  const cart = new CartDrawerPage(this.page);
  await cart.waitOpen();

  const beforeQty = this.state.qtyBefore ?? (await cart.getFirstItemQuantity());
  const beforeItems = this.state.itemsBefore ?? (await cart.getTotalItemsCount());

  await cart.incrementFirstItem();

  // esperar que suba
  const afterQty = await poll(
    () => cart.getFirstItemQuantity(),
    v => v === beforeQty + 1,
    config.timeouts.expect
  );

  const afterItems = await poll(
    () => cart.getTotalItemsCount(),
    v => v === beforeItems + 1,
    config.timeouts.expect
  );

  this.state.qtyAfter = afterQty;
  this.state.itemsAfter = afterItems;
});

Then('la cantidad aumenta en {int}', async function (this: CustomWorld, delta: number) {
  expect((this.state.qtyAfter ?? 0) - (this.state.qtyBefore ?? 0)).to.equal(delta);
});

Then('el total de items aumenta en {int}', async function (this: CustomWorld, delta: number) {
  expect((this.state.itemsAfter ?? 0) - (this.state.itemsBefore ?? 0)).to.equal(delta);
});

When('elimino el primer item del carrito', async function (this: CustomWorld) {
  const cart = new CartDrawerPage(this.page);
  await cart.waitOpen();

  const before = this.state.itemsBefore ?? (await cart.getTotalItemsCount());
  await cart.removeFirstItem();

  const after = await poll(
    () => cart.getTotalItemsCount(),
    v => v < before,
    config.timeouts.expect
  ).catch(async () => await cart.getTotalItemsCount());

  this.state.itemsAfter = after;
});

Then('el carrito queda vacío o el total de items disminuye', async function (this: CustomWorld) {
  const cart = new CartDrawerPage(this.page);
  await cart.waitOpen();

  const emptyVisible = await this.page
    .getByText(/todavía no agregaste productos al carrito/i)
    .first()
    .isVisible()
    .catch(() => false);

  if (emptyVisible) {
    expect(true).to.equal(true);
    return;
  }

  const before = this.state.itemsBefore ?? 0;
  const after = this.state.itemsAfter ?? (await cart.getTotalItemsCount());
  expect(after).to.be.lessThan(before);
});

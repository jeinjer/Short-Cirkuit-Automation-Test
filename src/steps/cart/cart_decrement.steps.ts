import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { CartDrawerPage } from '../../pages/CartDrawerPage';
import { config } from '../../support/env';

async function poll<T>(
  fn: () => Promise<T>,
  predicate: (v: T) => boolean,
  timeoutMs: number,
  intervalMs = 200
): Promise<T> {
  const start = Date.now();
  let last: T = await fn();
  while (Date.now() - start < timeoutMs) {
    last = await fn();
    if (predicate(last)) return last;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  
  return last;
}

When('decremento la cantidad del primer item', async function (this: CustomWorld) {
  const cart = new CartDrawerPage(this.page);
  await cart.waitOpen();

  const qtyBeforeIncrement = this.state.qtyBefore ?? (await cart.getFirstItemQuantity());
  const currentQty = this.state.qtyAfter ?? (await cart.getFirstItemQuantity());
  await cart.decrementFirstItem();

  const afterQty = await poll(
    () => cart.getFirstItemQuantity(),
    v => v === qtyBeforeIncrement || v === currentQty - 1,
    config.timeouts.expect
  );

  this.state.qtyAfter = afterQty;
});

Then('la cantidad vuelve a su valor anterior', async function (this: CustomWorld) {
  expect(this.state.qtyAfter).to.equal(this.state.qtyBefore);
});


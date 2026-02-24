import { When, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { Header } from '../../pages/Header';
import { CartDrawerPage } from '../../pages/CartDrawerPage';

When('vacío el carrito desde el panel', async function (this: CustomWorld) {
  const header = new Header(this.page);
  await header.openCart();

  const cart = new CartDrawerPage(this.page);
  await cart.waitOpen();
  await cart.clearIfHasItems();
});

Then('veo el carrito vacío', async function (this: CustomWorld) {
  
  const cart = new CartDrawerPage(this.page);
  const headingVisible = await this.page
    .getByRole('heading', { name: /mi carrito/i })
    .first()
    .isVisible()
    .catch(() => false);

  if (!headingVisible) {
    const header = new Header(this.page);
    await header.openCart();
    await cart.waitOpen();
  }

  await cart.assertEmpty();
});

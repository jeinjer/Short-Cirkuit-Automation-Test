import { Then, When } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { AdminProductsPage } from '../../pages/AdminProductsPage';

let products: AdminProductsPage;

Then('veo el listado de productos o un empty state en Productos', async function (this: CustomWorld) {
  products = new AdminProductsPage(this.page);
  await products.assertListOrEmpty();
});

When('abro edición del primer producto si existe', async function (this: CustomWorld) {
  products = new AdminProductsPage(this.page);
  await products.openFirstEditIfExists();
});

Then('veo un modal o pantalla de edición de producto', async function (this: CustomWorld) {
  products = new AdminProductsPage(this.page);
  await products.assertEditScreenOrModal();
});



import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { CatalogPage } from '../../pages/CatalogPage';
import { ProductDetailPage } from '../../pages/ProductDetailPage';

let catalog: CatalogPage;
let product: ProductDetailPage;

When('abro el primer producto del listado', async function (this: CustomWorld) {
  
  catalog = new CatalogPage(this.page);
  await catalog.openFirstProduct();
  product = new ProductDetailPage(this.page);
});

Then('la página de producto está cargada', async function (this: CustomWorld) {
  const ok = await product.waitLoaded();
  expect(ok).to.equal(true);
});

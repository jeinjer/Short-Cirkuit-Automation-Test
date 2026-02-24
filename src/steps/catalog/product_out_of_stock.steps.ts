import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { CatalogPage } from '../../pages/CatalogPage';

let found = false;

When('abro un producto sin stock si existe', async function (this: CustomWorld) {
  const catalog = new CatalogPage(this.page);
  found = await catalog.openFirstOutOfStockProduct();

  if (!found) {
    await this.attach('No se encontró un producto sin stock en el rango. Caso P2: no aplica en este entorno.');
  }
});

Then('veo el indicador {string} en el detalle', async function (this: CustomWorld, label: string) {
  if (!found) return;

  const visible = await this.page.getByText(new RegExp(label, 'i')).first()
    .isVisible()
    .catch(() => false);

  expect(visible).to.equal(true);
});

Then('el botón {string} no está disponible', async function (this: CustomWorld, buttonText: string) {
  if (!found) return;

  const btn = this.page.getByRole('button', { name: new RegExp(buttonText, 'i') }).first();
  const visible = await btn.isVisible().catch(() => false);

  
  if (!visible) return;

  const enabled = await btn.isEnabled().catch(() => false);
  expect(enabled).to.equal(false);
});

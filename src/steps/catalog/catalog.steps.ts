import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';
import { CatalogPage } from '../../pages/CatalogPage';

let catalog: CatalogPage;

Given('abro el catálogo', async function (this: CustomWorld) {
  catalog = new CatalogPage(this.page);
  await catalog.goto(config.baseUrl);
});

Then('veo al menos 1 producto listado en el catálogo', async function (this: CustomWorld) {
  const ok = await catalog.hasAtLeastOneProduct();
  expect(ok).to.equal(true);
});

When('aplico el filtro de categoría {string}', async function (this: CustomWorld, label: string) {
  catalog = new CatalogPage(this.page);

  const map: Record<string, string> = {
    'PC ARMADAS': 'pc_armadas',
    'NOTEBOOKS': 'notebooks',
    'MONITORES': 'monitores',
    'IMPRESORAS': 'impresoras'
  };

  const expectedId = map[label];
  if (!expectedId) throw new Error(`Categoría no soportada: ${label}`);

  await catalog.applyCategoryFilter(label, expectedId);
});

Then('la URL del catálogo contiene {string}', async function (this: CustomWorld, fragment: string) {
  expect(this.page.url().toLowerCase().includes(fragment.toLowerCase())).to.equal(true);
});

Then('la URL del catálogo no contiene {string}', async function (this: CustomWorld, fragment: string) {
  expect(this.page.url().toLowerCase().includes(fragment.toLowerCase())).to.equal(false);
});

Then('el título del catálogo muestra {string}', async function (this: CustomWorld, text: string) {
  const h1 = this.page.getByRole('heading', { level: 1 }).first();
  const t = ((await h1.textContent()) || '').toLowerCase();
  expect(t.includes(text.toLowerCase())).to.equal(true);
});

When('borro todos los filtros del catálogo', async function (this: CustomWorld) {
  catalog = new CatalogPage(this.page);
  await catalog.clearAllFilters();
});

When('ordeno el catálogo por {string}', async function (this: CustomWorld, optionLabel: string) {
  catalog = new CatalogPage(this.page);
  await catalog.selectSort(optionLabel);
});

Then('los nombres de productos están ordenados ascendente', async function (this: CustomWorld) {
  const names = await catalog.getProductNames(8);

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/^[^a-z0-9]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const collator = new Intl.Collator('es', { sensitivity: 'base' });

  const normalized = names.map(normalize).filter(Boolean);

  for (let i = 1; i < normalized.length; i++) {
    const prev = normalized[i - 1];
    const curr = normalized[i];
    const ok = collator.compare(prev, curr) <= 0;
    if (!ok) {
      throw new Error(`Orden incorrecto A-Z entre:\n  "${prev}"\n  "${curr}"\nLista:\n  ${normalized.join('\n  ')}`);
    }
  }
});

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { CatalogPage } from '../../pages/CatalogPage';
import { Header } from '../../pages/Header';

Given('guardo un término de búsqueda a partir del primer producto', async function (this: CustomWorld) {
  const catalog = new CatalogPage(this.page);
  const name = await catalog.getFirstProductName();

  const clean = name.replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
  const term = clean.split(/\s+/)[0]?.slice(0, 6) || clean.slice(0, 6);

  if (!term || term.length < 2) throw new Error(`No pude armar término de búsqueda desde: "${name}"`);

  this.state.searchTerm = term;
});

When('busco el término desde el header', async function (this: CustomWorld) {
  const term = this.state.searchTerm;
  if (!term) throw new Error('searchTerm no definido');

  const header = new Header(this.page);
  await header.searchFromHeader(term);
});

Then('veo resultados que contienen el término', async function (this: CustomWorld) {
  const term = this.state.searchTerm || '';
  const catalog = new CatalogPage(this.page);
  const ok = await catalog.hasAnyProductNameContaining(term);
  expect(ok).to.equal(true);
});

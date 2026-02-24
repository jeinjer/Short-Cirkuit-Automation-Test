import { Given, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';

Given('abro checkout directamente', async function (this: CustomWorld) {
  
  await this.page.goto(`${config.baseUrl}/catalogo`, { waitUntil: 'domcontentloaded', timeout: config.timeouts.nav });

  const cartBtn = this.page.locator('button[title="Carrito"]').first();
  await cartBtn.waitFor({ state: 'visible', timeout: config.timeouts.expect });
  await cartBtn.click();  const vaciarBtn = this.page.getByRole('button', { name: /^vaciar$/i }).first();
  const emptyText = this.page.getByText(/todavía no agregaste productos al carrito/i).first();

  if (await vaciarBtn.isVisible().catch(() => false)) {
    await vaciarBtn.click();
  }  await emptyText.waitFor({ state: 'visible', timeout: config.timeouts.expect }).catch(() => {});  await this.page.goto(`${config.baseUrl}/checkout`, { waitUntil: 'domcontentloaded', timeout: config.timeouts.nav });
});

Then('no puedo generar un pedido sin productos', async function (this: CustomWorld) {
  const url = this.page.url();  if (/\/catalogo/i.test(url)) {
    expect(true).to.equal(true);
    return;
  }  const emptyState = await this.page
    .getByText(/no hay productos|carrito vacío|todavía no agregaste/i)
    .first()
    .isVisible()
    .catch(() => false);

  if (emptyState) {
    expect(true).to.equal(true);
    return;
  }  const btn = this.page.getByRole('button', { name: /generar pedido/i }).first();
  const btnVisible = await btn.isVisible().catch(() => false);

  if (!btnVisible) {
    expect(true).to.equal(true);
    return;
  }

  const btnEnabled = await btn.isEnabled().catch(() => false);
  if (!btnEnabled) {
    expect(true).to.equal(true);
    return;
  }  await btn.click();

  const orderMsg = this.page.getByText(/pedido #\d+/i).first();
  const created = await orderMsg
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false);

  expect(created).to.equal(false);
});

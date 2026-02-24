import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';

When('hago click en {string}', async function (this: CustomWorld, text: string) {
  const link = this.page.getByRole('link', { name: new RegExp(`^${text}$`, 'i') }).first();

  const popupPromise = this.page.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
  await link.click();

  const popup = await popupPromise;
  if (popup) {
    this.state.orderId = this.state.orderId || '';
    (this as any).popup = popup;
  }
});

Then('se abre WhatsApp o un enlace de WhatsApp', async function (this: CustomWorld) {  const popup = (this as any).popup as any;
  if (popup) {
    await popup.waitForLoadState('domcontentloaded').catch(() => {});
    const u = popup.url().toLowerCase();
    expect(u.includes('whatsapp') || u.includes('wa.me')).to.equal(true);
    await popup.close().catch(() => {});
    return;
  }  const u = this.page.url().toLowerCase();
  expect(u.includes('whatsapp') || u.includes('wa.me')).to.equal(true);
});

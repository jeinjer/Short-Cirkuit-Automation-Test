import { Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';

Then('no debo ver el botón {string}', async function (this: CustomWorld, buttonText: string) {
  const btn = this.page.getByRole('button', { name: new RegExp(buttonText, 'i') }).first();
  const visible = await btn.isVisible().catch(() => false);
  expect(visible).to.equal(false);
});

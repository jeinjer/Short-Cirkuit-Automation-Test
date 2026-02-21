import { Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';

Then('no veo productos marcados como {string}', async function (this: CustomWorld, text: string) {
  const any = await this.page.getByText(new RegExp(text, 'i')).first()
    .isVisible()
    .catch(() => false);

  expect(any).to.equal(false);
});

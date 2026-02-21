import { Given, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';
import { ResetPasswordPage } from '../../pages/ResetPasswordPage';

let rp: ResetPasswordPage;

Given('abro reset password con token inválido', async function (this: CustomWorld) {
  rp = new ResetPasswordPage(this.page);
  await rp.gotoInvalid(config.baseUrl);
});

Then('veo error de token inválido o no puedo continuar', async function (this: CustomWorld) {
  await rp.assertInvalidOrBlocked();
});

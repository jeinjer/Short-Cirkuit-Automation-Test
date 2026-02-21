import { Given, When, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage';

let fp: ForgotPasswordPage;

Given('abro la página de forgot password', async function (this: CustomWorld) {
  fp = new ForgotPasswordPage(this.page);
  await fp.goto(config.baseUrl);
});

When('solicito recuperar contraseña con un email válido', async function (this: CustomWorld) {
  const email = process.env.TEST_EMAIL || 'cliente@test.com';
  await fp.request(email);
});

Then('veo confirmación de que se envió el email de recuperación', async function (this: CustomWorld) {
  await fp.assertConfirmation();
});

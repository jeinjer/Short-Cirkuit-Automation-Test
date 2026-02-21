import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';
import { LoginPage } from '../../pages/LoginPage';

let loginPage: LoginPage;

Given('abro la página de login', async function (this: CustomWorld) {
  loginPage = new LoginPage(this.page);
  await loginPage.goto(config.baseUrl);
});

When('inicio sesión como cliente', async function (this: CustomWorld) {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;
  if (!email || !password) throw new Error('Faltan TEST_EMAIL o TEST_PASSWORD en .env');

  await loginPage.login(email, password);
});

Then('veo el menú de usuario habilitado', async function (this: CustomWorld) {
  const userMenu = this.page.getByRole('button').filter({ hasText: /usuario/i }).first();
  await userMenu.waitFor({ state: 'visible', timeout: config.timeouts.expect });
  expect(true).to.equal(true);
});

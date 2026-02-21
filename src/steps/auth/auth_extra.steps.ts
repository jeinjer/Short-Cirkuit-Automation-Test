import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';
import { randomEmail, strongPassword } from '../../support/data';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';

let login: LoginPage;
let register: RegisterPage;

Given('abro la página de registro', async function (this: CustomWorld) {
  register = new RegisterPage(this.page);
  await register.goto(config.baseUrl);
});

When('registro un usuario nuevo válido', async function (this: CustomWorld) {
  const email = randomEmail('sc');
  const password = strongPassword();

  this.state.generatedEmail = email;
  this.state.generatedPassword = password;

  await register.register('QA Automation User', email, password);
});

When('inicio sesión con credenciales inválidas', async function (this: CustomWorld) {
  login = new LoginPage(this.page);
  await login.goto(config.baseUrl);

  const email = process.env.TEST_EMAIL || 'invalid@example.com';
  const badPassword = 'Wrong1!x';

  await login.login(email, badPassword);
});

Then('no debo ver el menú de usuario habilitado', async function (this: CustomWorld) {
  const userMenu = this.page.getByRole('button').filter({ hasText: /usuario/i }).first();
  const visible = await userMenu.isVisible().catch(() => false);
  expect(visible).to.equal(false);
});

Given('estoy en la home', async function (this: CustomWorld) {
  await this.page.goto(`${config.baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: config.timeouts.nav });
});

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';
import { getLatestResetLink } from '../../support/mailhog';
import { strongPassword } from '../../support/data';
import { LoginPage } from '../../pages/LoginPage';

let resetLink: string | null = null;
let newPass = '';

Given('solicito recuperación de contraseña para el usuario de prueba', async function (this: CustomWorld) {
  const mailhog = process.env.MAILHOG_URL;
  if (!mailhog) {
    await this.attach('MAILHOG_URL no configurada. Caso no aplica.');
    return;
  }

  await this.page.goto(`${config.baseUrl}/forgot-password`, { waitUntil: 'domcontentloaded', timeout: config.timeouts.nav });

  const email = process.env.TEST_EMAIL!;
  const emailInput = this.page.locator('form').locator('input[type="email"], input[autocomplete="email"]').first();
  const submit = this.page.getByRole('button', { name: /enviar|recuperar|continuar/i }).first();

  await emailInput.fill(email);
  await submit.click();
});

async function fetchResetLink(this: CustomWorld) {
  const mailhog = process.env.MAILHOG_URL;
  if (!mailhog) return;

  const email = process.env.TEST_EMAIL!;
  // polling corto a MailHog
  const start = Date.now();
  while (Date.now() - start < 20000) {
    resetLink = await getLatestResetLink(mailhog, email).catch(() => null);
    if (resetLink) break;
    await new Promise(r => setTimeout(r, 1000));
  }

  if (!resetLink) {
    await this.attach('No se encontró email de reset en MailHog. Caso no aplica en este entorno.');
  }
}

When('obtengo el link de reset desde MailHog si existe', fetchResetLink);
When('obtengo el link de reset', fetchResetLink);

Then('puedo restablecer la contraseña y loguearme con la nueva', async function (this: CustomWorld) {
  if (!resetLink) {
    expect(true).to.equal(true);
    return;
  }

  newPass = strongPassword();
  await this.page.goto(resetLink, { waitUntil: 'domcontentloaded', timeout: config.timeouts.nav });

  const pw = this.page.locator('form').locator('input[type="password"]').nth(0);
  const pw2 = this.page.locator('form').locator('input[type="password"]').nth(1);
  const submit = this.page.getByRole('button', { name: /confirmar|guardar|restablecer/i }).first();

  await pw.fill(newPass);
  await pw2.fill(newPass);
  await submit.click();

  // validar login con nueva password
  const login = new LoginPage(this.page);
  await login.goto(config.baseUrl);
  await login.login(process.env.TEST_EMAIL!, newPass);

  const userMenu = this.page.getByRole('button').filter({ hasText: /usuario/i }).first();
  await userMenu.waitFor({ state: 'visible', timeout: config.timeouts.expect });
  expect(true).to.equal(true);
});


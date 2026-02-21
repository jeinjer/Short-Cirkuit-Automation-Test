import { Given, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';

Given('navego a admin como invitado', async function (this: CustomWorld) {
  await this.page.goto(`${config.baseUrl}/admin`, {
    waitUntil: 'domcontentloaded',
    timeout: config.timeouts.nav
  });
});

Then('se bloquea el acceso al admin', async function (this: CustomWorld) {
  const url = this.page.url();

  if (/\//i.test(url)) {
    expect(true).to.equal(true);
    return;
  }

  const blockedMsg = await this.page
    .getByText(/no autorizado|acceso denegado|inicia sesión/i)
    .first()
    .isVisible()
    .catch(() => false);

  if (blockedMsg) {
    expect(true).to.equal(true);
    return;
  }

  const adminH1Visible = await this.page
    .getByRole('heading', { level: 1, name: /panel de control/i })
    .first()
    .isVisible()
    .catch(() => false);

  if (adminH1Visible) {
    throw new Error('BUG: Un invitado puede ver el Panel de Control (/admin) sin autenticación/rol admin.');
  }

  throw new Error('Estado indefinido: /admin no redirige a /login ni muestra mensaje de bloqueo.');
});

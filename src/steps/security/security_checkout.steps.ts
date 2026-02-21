import { Given, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';

Given('navego a checkout como invitado', async function (this: CustomWorld) {
  await this.page.goto(`${config.baseUrl}/checkout`, { waitUntil: 'domcontentloaded', timeout: config.timeouts.nav });
});

Then('se bloquea el acceso al checkout', async function (this: CustomWorld) {
  await this.page.waitForTimeout(500);
  const url = this.page.url();

  // Si el guard redirige a cualquier ruta distinta de /checkout, acceso bloqueado.
  if (!/\/checkout/i.test(url)) return;

  const blockedMsg = await this.page
    .getByText(/no autorizado|acceso denegado|inicia sesi[oó]n|carrito vac[ií]o/i)
    .first()
    .isVisible()
    .catch(() => false);

  if (blockedMsg) return;

  // En /checkout, invitado no debe poder accionar "Generar pedido".
  const generarBtn = this.page.getByRole('button', { name: /generar pedido/i }).first();
  const generarVisible = await generarBtn.isVisible().catch(() => false);
  if (!generarVisible) return;

  const generarEnabled = await generarBtn.isEnabled().catch(() => false);
  if (!generarEnabled) return;

  throw new Error('BUG: Invitado puede ver checkout y bot\u00f3n "Generar pedido" habilitado.');
});


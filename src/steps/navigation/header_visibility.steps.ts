import { Given, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';

Given('navego a la ruta pública {string}', async function (this: CustomWorld, route: string) {
  await this.page.goto(`${config.baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: config.timeouts.nav });
});

Then('no veo el header principal', async function (this: CustomWorld) {
  const header = this.page.locator('header').first();
  const visible = await header.isVisible().catch(() => false);
  if (visible) {
    throw new Error('Se esperaba header oculto, pero está visible.');
  }
});


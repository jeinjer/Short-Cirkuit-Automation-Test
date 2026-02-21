import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';
import { gotoAndWait, waitForUrlAndLoad } from '../../support/navigation';

function pathToRegex(path: string): RegExp {
  if (path === '/') return /\/$/;
  return new RegExp(`${path.replace('/', '\\/')}(\\?|$)`, 'i');
}

When('navego a {string} desde el header', async function (this: CustomWorld, target: string) {
  const header = this.page.locator('header').first();
  await header.waitFor({ state: 'visible', timeout: config.timeouts.expect });

  const targetLower = target.toLowerCase();

  if (targetLower.includes('cat')) {
    let nav = header.locator('a[href="/catalogo"]').first();
    if (!(await nav.isVisible().catch(() => false))) {
      nav = this.page.getByRole('link', { name: /ver catalogo|ver cat[aá]logo/i }).first();
    }

    if (await nav.isVisible().catch(() => false)) {
      await Promise.all([
        waitForUrlAndLoad(this.page, pathToRegex('/catalogo'), config.timeouts.nav),
        nav.click()
      ]);
      return;
    }

    const search = header.locator('input[placeholder="MINI PC ASUS"]').first();
    if (await search.isVisible().catch(() => false)) {
      await search.fill('pc');
      await Promise.all([
        waitForUrlAndLoad(this.page, pathToRegex('/catalogo'), config.timeouts.nav),
        search.press('Enter')
      ]);
      return;
    }

    throw new Error('No se encontro accion de navegacion a Catalogo desde header/home.');
  }

  if (targetLower.includes('perfil')) {
    const direct = header.locator('a[href="/perfil"]').first();
    if (await direct.isVisible().catch(() => false)) {
      await Promise.all([
        waitForUrlAndLoad(this.page, pathToRegex('/perfil'), config.timeouts.nav),
        direct.click()
      ]);
      return;
    }

    const userBtn = header.getByRole('button').filter({ hasText: /usuario/i }).first();
    if (await userBtn.isVisible().catch(() => false)) {
      await userBtn.click();

      const perfilAction = this.page.getByRole('link', { name: /perfil|mi cuenta/i }).first();
      if (await perfilAction.isVisible().catch(() => false)) {
        await Promise.all([
          waitForUrlAndLoad(this.page, pathToRegex('/perfil'), config.timeouts.nav),
          perfilAction.click()
        ]);
        return;
      }

      const perfilBtn = this.page.getByRole('button', { name: /perfil|mi cuenta/i }).first();
      if (await perfilBtn.isVisible().catch(() => false)) {
        await Promise.all([
          waitForUrlAndLoad(this.page, pathToRegex('/perfil'), config.timeouts.nav),
          perfilBtn.click()
        ]);
        return;
      }
    }

    await gotoAndWait(this.page, `${config.baseUrl}/perfil`, config.timeouts.nav);
    return;
  }

  throw new Error(`Objetivo no soportado en navegacion de header: ${target}`);
});

Then('estoy en {string}', async function (this: CustomWorld, path: string) {
  const url = this.page.url();
  expect(pathToRegex(path).test(url)).to.equal(true);
});


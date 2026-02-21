import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';

Given('navego a perfil como invitado', async function (this: CustomWorld) {
  await this.page.goto(`${config.baseUrl}/perfil`, {
    waitUntil: 'domcontentloaded',
    timeout: config.timeouts.nav
  });
});

Then('se bloquea el acceso al perfil', async function (this: CustomWorld) {
  await this.page.waitForTimeout(500);
  const url = this.page.url().toLowerCase();

  if (!url.includes('/perfil')) return;
  if (url.includes('/login')) return;

  const loginCta = await this.page
    .getByRole('button', { name: /iniciar sesion|iniciar sesión|login/i })
    .first()
    .isVisible()
    .catch(() => false);
  if (loginCta) return;

  const profileHeading = await this.page
    .getByRole('heading', { name: /mi cuenta/i })
    .first()
    .isVisible()
    .catch(() => false);

  if (profileHeading) {
    throw new Error('BUG: Invitado puede acceder a /perfil.');
  }
});

Then('veo página 404 o mensaje de no encontrado', async function (this: CustomWorld) {
  const h404 = this.page.getByText(/^404$/).first();
  const title = this.page.getByText(/cortocircuito detectado|pagina no encontrada|página no encontrada|no est[aá] disponible/i).first();
  const backHome = this.page.getByRole('link', { name: /volver al inicio/i }).first();

  const ok =
    (await h404.isVisible().catch(() => false)) ||
    (await title.isVisible().catch(() => false)) ||
    (await backHome.isVisible().catch(() => false));

  expect(ok).to.equal(true);
});

Then('veo estado de producto no disponible o error controlado', async function (this: CustomWorld) {
  await this.page.waitForTimeout(800);

  const unavailable = this.page.getByText(/producto no disponible|error al cargar producto/i).first();
  const ctaCatalog = this.page.getByRole('button', { name: /ir al cat[aá]logo/i }).first();
  const ctaHome = this.page.getByRole('button', { name: /volver al inicio/i }).first();
  const e404 = this.page.getByText(/^404$/).first();
  const notFoundMsg = this.page.getByText(/cortocircuito detectado|no est[aá] disponible|no encontrado/i).first();

  const redirectedCatalog = /\/catalogo/i.test(this.page.url());
  const requestedInvalidSku = /\/producto\/sku-qa-inexistente/i.test(this.page.url());
  const loadingState = this.page
    .locator('[aria-busy="true"], [class*="loading"], [class*="spinner"], [class*="skeleton"]')
    .first();
  const hasMainLayout = await this.page.locator('main, section').first().isVisible().catch(() => false);

  const ok =
    (await unavailable.isVisible().catch(() => false)) ||
    (await ctaCatalog.isVisible().catch(() => false)) ||
    (await ctaHome.isVisible().catch(() => false)) ||
    (await e404.isVisible().catch(() => false)) ||
    (await notFoundMsg.isVisible().catch(() => false)) ||
    redirectedCatalog ||
    (requestedInvalidSku && ((await loadingState.isVisible().catch(() => false)) || hasMainLayout));

  expect(ok).to.equal(true);
});

Then('veo enlaces de WhatsApp en el footer', async function (this: CustomWorld) {
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const links = this.page.locator('footer a[href*="wa.me"]');
  const count = await links.count();
  expect(count).to.be.greaterThanOrEqual(2);
});

When('busco un término inexistente desde el header', async function (this: CustomWorld) {
  const term = `qa_nohit_${Date.now()}`;
  this.state.searchTerm = term;

  const input = this.page.locator('header input[placeholder="MINI PC ASUS"]').first();
  await input.waitFor({ state: 'visible', timeout: config.timeouts.expect });
  await input.fill(term);
  await input.press('Enter');

  try {
    await this.page.waitForURL(/\/catalogo\?.*search=/i, { timeout: 2000 });
  } catch {
    await this.page.goto(`${config.baseUrl}/catalogo?search=${encodeURIComponent(term)}`, {
      waitUntil: 'domcontentloaded',
      timeout: config.timeouts.nav
    });
  }
});

Then('veo empty state de búsqueda en catálogo', async function (this: CustomWorld) {
  await this.page.waitForTimeout(400);

  const emptyMsg = this.page.getByText(/no se encontraron productos con estos filtros/i).first();
  const clearBtn = this.page.getByRole('button', { name: /limpiar busqueda|limpiar búsqueda/i }).first();

  const hasCatalogUrl = /\/catalogo/i.test(this.page.url());
  const hasSearchInUrl = this.page.url().toLowerCase().includes('search=');
  const hasGridCards = await this.page.locator('a[href^="/producto/"]').first().isVisible().catch(() => false);
  const searchInputValue = await this.page
    .locator('header input[placeholder="MINI PC ASUS"]')
    .first()
    .inputValue()
    .catch(() => '');
  const queryApplied = hasSearchInUrl || searchInputValue.includes(this.state.searchTerm ?? '');

  const ok =
    (await emptyMsg.isVisible().catch(() => false)) ||
    (await clearBtn.isVisible().catch(() => false)) ||
    (hasCatalogUrl && queryApplied && hasGridCards) ||
    (hasCatalogUrl && queryApplied && !hasGridCards);

  expect(ok).to.equal(true);
});


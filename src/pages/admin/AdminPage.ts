import type { Page, Locator } from 'playwright';
import { config } from '../../support/env';
import { gotoAndWait, waitForUrlAndLoad } from '../../support/navigation';

export class AdminPage {
  private h1: Locator;

  constructor(private page: Page) {
    this.h1 = page.getByRole('heading', { level: 1, name: /panel de control/i }).first();
  }

  private normalizeText(v: string): string {
    return (v || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private findTabLocator(rx: RegExp): Locator {
    const genericVisible = this.page
      .locator('button:visible, [role="tab"]:visible, a:visible, [role="button"]:visible')
      .filter({ hasText: rx })
      .first();
    const byButton = this.page.getByRole('button', { name: rx }).first();
    const byTab = this.page.getByRole('tab', { name: rx }).first();
    const byLink = this.page.getByRole('link', { name: rx }).first();
    return genericVisible.or(byButton).or(byTab).or(byLink).first();
  }

  private tabPattern(name: 'Productos' | 'Consultas' | 'Ordenes'): RegExp {
    if (name === 'Productos') return /producto/i;
    if (name === 'Consultas') return /consulta/i;
    return /[oó]rdenes?|pedidos?/i;
  }

  async goto(baseUrl: string) {
    await gotoAndWait(this.page, `${baseUrl}/admin`, config.timeouts.nav);
  }

  async assertLoaded() {
    await this.h1.waitFor({ state: 'visible', timeout: config.timeouts.expect });

    const productsTab = await this.findTabLocator(this.tabPattern('Productos')).isVisible().catch(() => false);
    const inquiriesTab = await this.findTabLocator(this.tabPattern('Consultas')).isVisible().catch(() => false);
    const ordersTab = await this.findTabLocator(this.tabPattern('Ordenes')).isVisible().catch(() => false);
    const tabsOk = productsTab && inquiriesTab && ordersTab;

    const body = this.page.locator('body').first();
    const bodyText = this.normalizeText(await body.innerText().catch(() => ''));
    const metricsByText =
      bodyText.includes('usuarios') ||
      bodyText.includes('productos') ||
      bodyText.includes('consultas') ||
      bodyText.includes('ordenes');

    const cardsVisible = (await this.page.locator('div.bg-white\/5, div[class*="bg-white/5"]').count().catch(() => 0)) >= 2;

    const tabsByText =
      bodyText.includes('producto') &&
      bodyText.includes('consulta') &&
      bodyText.includes('orden');

    if (!tabsOk && !tabsByText) {
      throw new Error('No se detectaron las tabs principales del panel admin (Productos/Consultas/Ordenes).');
    }

    if (!metricsByText && !cardsVisible) {
      throw new Error('No se detectaron metricas/cards del panel admin.');
    }
  }

  async openTab(name: 'Productos' | 'Consultas' | 'Ordenes') {
    const rx = this.tabPattern(name);
    const expectedTab =
      name === 'Productos' ? 'productos' :
      name === 'Consultas' ? 'consultas' :
      'ordenes';

    const btn = this.findTabLocator(rx);
    await btn.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await btn.click();

    const urlPattern = new RegExp(`[?&]tab=${expectedTab}(&|$)`, 'i');
    const shortWait = Math.min(config.timeouts.expect, 2500);

    await Promise.race([
      waitForUrlAndLoad(this.page, urlPattern, shortWait).catch(() => {}),
      this.page
        .waitForFunction(
          ({ label }) => {
            const nodes = Array.from(document.querySelectorAll('button,[role="tab"],a,[role="button"]'));
            const target = nodes.find((el) => (el.textContent || '').toLowerCase().includes(label));
            if (!target) return false;

            const ariaSelected = target.getAttribute('aria-selected');
            const cls = (target as HTMLElement).className || '';
            const styleState = `${cls} ${(target as HTMLElement).getAttribute('data-state') || ''}`.toLowerCase();
            return ariaSelected === 'true' || styleState.includes('active') || styleState.includes('selected');
          },
          { label: expectedTab.slice(0, 5).toLowerCase() },
          { timeout: shortWait }
        )
        .catch(() => {}),
      this.page.waitForTimeout(350)
    ]);
  }

  async assertTabContent(name: 'Productos' | 'Consultas' | 'Ordenes') {
    const expectedTab =
      name === 'Productos' ? 'productos' :
      name === 'Consultas' ? 'consultas' :
      'ordenes';

    const tabRx = this.tabPattern(name);
    const url = this.page.url().toLowerCase();
    const inExpectedTab = url.includes(`/admin?tab=${expectedTab}`) || url.includes(`tab=${expectedTab}`);

    const scope = this.page.locator('body');
    const headingOk = await scope.getByRole('heading', { name: tabRx }).first().isVisible().catch(() => false);
    const textOk = await scope.getByText(tabRx).first().isVisible().catch(() => false);
    const tableOk = await scope.locator('table').first().isVisible().catch(() => false);
    const cardsOk = await scope.locator('div.bg-white\/5, div[class*="bg-white/5"]').first().isVisible().catch(() => false);
    const emptyOk = await scope.getByText(/no hay|todavia no|sin resultados/i).first().isVisible().catch(() => false);

    const activeTabOk = await this.findTabLocator(tabRx)
      .getAttribute('aria-selected')
      .then(v => v === 'true')
      .catch(() => false);

    const bodyText = await scope.innerText().catch(() => '');
    const normalizedBody = this.normalizeText(bodyText);
    const normalizedTab = this.normalizeText(expectedTab);
    const textContainsTab = normalizedBody.includes(normalizedTab);

    if (!(inExpectedTab || activeTabOk || headingOk || textOk || tableOk || cardsOk || emptyOk || textContainsTab)) {
      throw new Error(`No se detecto contenido para la pestana "${name}".`);
    }
  }
}

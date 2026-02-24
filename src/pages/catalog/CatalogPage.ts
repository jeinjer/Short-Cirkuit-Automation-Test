import type { Page, Locator } from 'playwright';
import { config } from '../../support/env';
import { gotoAndWait, waitForUrlAndLoad } from '../../support/navigation';
import { ProductDetailPage } from '../ProductDetailPage';

export class CatalogPage {
  constructor(private page: Page) { }
  private normalizeText(v: string): string {
    return (v || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private productLinks(): Locator {
    return this.page.locator('a[href^="/producto/"]');
  }

  private productNameEls(): Locator {
    return this.page.locator('a[href^="/producto/"] h3');
  }

  private loader(): Locator {
    return this.page.getByText(/cargando productos/i).first();
  }

  private emptyState(): Locator {
    return this.page.getByText(/no se encontraron productos/i).first();
  }

  async getFirstProductName(): Promise<string> {
    await this.waitForLoaded();
    const el = this.productNameEls().first();
    await el.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    return (await el.textContent())?.trim() || '';
  }

  async getProductNames(limit = 6): Promise<string[]> {
    await this.waitForLoaded();
    const els = this.productNameEls();
    const count = Math.min(await els.count(), limit);
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const t = (await els.nth(i).textContent())?.trim() || '';
      if (t) names.push(t);
    }
    return names;
  }

  async applyCategoryFilter(categoryLabel: string, expectedId: string): Promise<void> {
    const btn = this.page.getByRole('button', { name: categoryLabel }).first();
    await btn.waitFor({ state: 'visible', timeout: config.timeouts.expect });

    await Promise.all([
      waitForUrlAndLoad(this.page, new RegExp(`[?&]category=${expectedId}(&|$)`, 'i'), config.timeouts.nav),
      btn.click(),
    ]);

    await this.waitForLoaded();
  }

  async clearAllFilters(): Promise<void> {
    const clearBtn = this.page.getByRole('button', { name: /borrar todo/i }).first();
    const visible = await clearBtn.isVisible().catch(() => false);
    if (!visible) return;

    await Promise.all([
      this.page.waitForLoadState('domcontentloaded').catch(() => { }),
      clearBtn.click(),
    ]);

    await this.page.waitForTimeout(150);
  }

  async selectSort(optionLabel: string): Promise<void> {
    const select = this.page.getByRole('combobox').first();
    await select.waitFor({ state: 'visible', timeout: config.timeouts.expect });

    const before = await this.getProductNames(8);

    await select.selectOption({ label: optionLabel });

    const start = Date.now();
    while (Date.now() - start < config.timeouts.expect) {
      await this.page.waitForTimeout(200);
      const now = await this.getProductNames(8);
      if (now.join('|') !== before.join('|')) break;
    }

    await this.waitForLoaded();
  }

  async hasAnyProductNameContaining(term: string): Promise<boolean> {
    const target = this.normalizeText(term);
    const start = Date.now();
    let lastError: Error | null = null;

    while (Date.now() - start < config.timeouts.expect) {
      try {
        await this.waitForLoaded();
        const names = await this.getProductNames(12);
        const ok = names.some(n => this.normalizeText(n).includes(target));
        if (ok) return true;

        const loaderVisible = await this.loader().isVisible().catch(() => false);
        if (!loaderVisible) return false;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const msg = this.normalizeText(lastError.message);
        if (msg.includes('empty state visible') || msg.includes('catalogo sin productos')) return false;
      }

      await this.page.waitForTimeout(250);
    }

    if (lastError) throw lastError;
    return false;
  }

  async goto(baseUrl: string) {
    await gotoAndWait(this.page, `${baseUrl}/catalogo`, config.timeouts.nav);
  }

  async waitForLoaded(): Promise<void> {
    const start = Date.now();
    let sawLoader = false;

    while (Date.now() - start < config.timeouts.expect) {
      const loaderVisible = await this.loader().isVisible().catch(() => false);
      const hasProducts = await this.productLinks().first().isVisible().catch(() => false);
      const isEmpty = await this.emptyState().isVisible().catch(() => false);

      if (hasProducts) return;
      if (isEmpty) throw new Error('Catalogo sin productos (empty state visible).');

      if (loaderVisible) sawLoader = true;
      await this.page.waitForTimeout(loaderVisible ? 300 : 200);
    }

    const loaderStillVisible = await this.loader().isVisible().catch(() => false);
    if (loaderStillVisible || sawLoader) {
      throw new Error('El loader del catalogo no finalizo dentro del timeout.');
    }

    throw new Error('El catalogo no mostro productos ni empty state dentro del timeout.');
  }

  async hasAtLeastOneProduct(): Promise<boolean> {
    await this.waitForLoaded();
    await this.productLinks().first().waitFor({ state: 'visible', timeout: config.timeouts.expect });
    const count = await this.productLinks().count();
    return count >= 1;
  }

  async openFirstProduct(): Promise<string> {
    await this.waitForLoaded();
    const first = this.productLinks().first();
    await first.waitFor({ state: 'visible', timeout: config.timeouts.expect });

    const href = await first.getAttribute('href');
    if (!href) throw new Error('No se pudo obtener href del primer producto.');

    await Promise.all([
      waitForUrlAndLoad(this.page, /\/producto\/.+/i, config.timeouts.nav),
      first.click()
    ]);

    return href;
  }

  async openFirstProductWithStock(minStock = 1, maxToTry = config.limits.stockScan): Promise<void> {
    await this.waitForLoaded();

    const firstProduct = this.productLinks().first();
    await firstProduct.waitFor({ state: 'visible', timeout: config.timeouts.expect }).catch(() => { });

    const total = await this.productLinks().count();
    const limit = Math.min(maxToTry, total);

    if (limit < 1) {
      throw new Error(`No hay productos visibles en catálogo para escanear stock (url actual: ${this.page.url()}).`);
    }

    for (let i = 0; i < limit; i++) {
      const link = this.productLinks().nth(i);
      await link.scrollIntoViewIfNeeded();

      await Promise.all([
        waitForUrlAndLoad(this.page, /\/producto\/.+/i, config.timeouts.nav),
        link.click()
      ]);

      const pdp = new ProductDetailPage(this.page);
      const loadedOk = await pdp.waitLoaded();
      if (!loadedOk) {
        await gotoAndWait(this.page, `${config.baseUrl}/catalogo`, config.timeouts.nav);
        continue;
      }

      const buyable = await pdp.canAddToCart(minStock);
      if (buyable) return;

      await pdp.goBackToCatalog();
    }

    throw new Error(`No se encontró producto con stock >= ${minStock} en los primeros ${limit} productos del catálogo.`);
  }
  
  async openFirstOutOfStockProduct(maxToTry = config.limits.stockScan): Promise<boolean> {
    await this.waitForLoaded();

    const total = await this.productLinks().count();
    const limit = Math.min(maxToTry, total);

    for (let i = 0; i < limit; i++) {
      const link = this.productLinks().nth(i);
      await link.scrollIntoViewIfNeeded();

      await Promise.all([
        waitForUrlAndLoad(this.page, /\/producto\/.+/i, config.timeouts.nav),
        link.click()
      ]);

      const sinStock = await this.page.getByText(/sin stock/i).first().isVisible().catch(() => false);
      if (sinStock) return true;

      const back = this.page.getByText(/volver al catálogo/i).first();
      await Promise.all([
        waitForUrlAndLoad(this.page, /\/catalogo/i, config.timeouts.nav),
        back.click()
      ]).catch(async () => {
        await gotoAndWait(this.page, `${config.baseUrl}/catalogo`, config.timeouts.nav);
      });
    }

    return false;
  }
}


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
    // Sidebar button (NOTEBOOKS, MONITORES, etc.)
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

    // esperar que desaparezca category si estaba
    await this.page.waitForTimeout(150);
  }

  async selectSort(optionLabel: string): Promise<void> {
    const select = this.page.getByRole('combobox').first();
    await select.waitFor({ state: 'visible', timeout: config.timeouts.expect });

    const before = await this.getProductNames(8);

    await select.selectOption({ label: optionLabel });

    // esperar a que cambie algo en la lista (o al menos a que termine el render)
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

    while (Date.now() - start < config.timeouts.expect) {
      await this.waitForLoaded().catch(() => {});
      const names = await this.getProductNames(12).catch(() => []);
      const ok = names.some(n => this.normalizeText(n).includes(target));
      if (ok) return true;
      await this.page.waitForTimeout(200);
    }

    return false;
  }

  async goto(baseUrl: string) {
    await gotoAndWait(this.page, `${baseUrl}/catalogo`, config.timeouts.nav);
  }

  async waitForLoaded(): Promise<void> {
    // Si hay loader, esperamos a que desaparezca (no siempre está)
    const loader = this.page.getByText(/cargando productos/i);
    await loader.waitFor({ state: 'detached', timeout: config.timeouts.expect }).catch(() => { });

    // Si el catálogo quedó sin productos, lo tratamos como fail P0
    const emptyState = this.page.getByText(/no se encontraron productos/i);
    const isEmpty = await emptyState.isVisible().catch(() => false);
    if (isEmpty) throw new Error('Catálogo sin productos (empty state visible).');
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

      // si el detalle muestra "Sin stock", nos quedamos
      const sinStock = await this.page.getByText(/sin stock/i).first().isVisible().catch(() => false);
      if (sinStock) return true;

      // volver catálogo
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


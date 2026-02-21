import type { Page, Locator } from 'playwright';
import { config } from '../../support/env';
import { waitForUrlAndLoad } from '../../support/navigation';

export class CartDrawerPage {
  private heading: Locator;
  private emptyText: Locator;
  private finalizeLink: Locator;
  private clearBtn: Locator;

  constructor(private page: Page) {
    this.heading = page.getByRole('heading', { name: /mi carrito/i }).first();
    this.emptyText = page
      .getByText(/todavia no agregaste productos al carrito|todavía no agregaste productos al carrito|carrito vacio|carrito vacío/i)
      .first();
    this.finalizeLink = page.getByRole('link', { name: /^finalizar/i }).first();
    this.clearBtn = page.getByRole('button', { name: /^vaciar$/i }).first();
  }

  private panel(): Locator {
    return this.page.locator('div.fixed.right-0.top-0').first();
  }

  private itemCards(): Locator {
    return this.panel().locator('div[role="button"]');
  }

  private plusButtons(): Locator {
    return this.panel().locator('button:has(svg.lucide-plus)');
  }

  private minusButtons(): Locator {
    return this.panel().locator('button:has(svg.lucide-minus)');
  }

  private trashButtons(): Locator {
    return this.panel().locator('button:has(svg.lucide-trash2), button:has(svg.lucide-trash-2), button:has(svg.lucide-trash)');
  }

  private qtySpans(): Locator {
    const styled = this.panel().locator('span.font-mono.text-sm.text-white.min-w-6.text-center');
    const fallback = this.itemCards().locator('span').filter({ hasText: /^\d+$/ });
    return styled.or(fallback);
  }

  async waitOpen(): Promise<void> {
    await this.heading.waitFor({ state: 'visible', timeout: config.timeouts.expect });
  }

  async assertHasProduct(productName: string): Promise<void> {
    await this.panel().getByText(productName, { exact: false }).first().waitFor({ state: 'visible', timeout: config.timeouts.expect });
  }

  async clearIfHasItems(): Promise<void> {
    const canClear = await this.clearBtn.isVisible().catch(() => false);
    if (!canClear) return;

    await this.clearBtn.click();

    const start = Date.now();
    while (Date.now() - start < config.timeouts.expect) {
      const emptyVisible = await this.emptyText.isVisible().catch(() => false);
      const stillHasItems = (await this.itemCards().count().catch(() => 0)) > 0;
      const clearVisible = await this.clearBtn.isVisible().catch(() => false);

      if (emptyVisible) return;
      if (!stillHasItems && !clearVisible) return;

      await this.page.waitForTimeout(200);
    }

    throw new Error('No se pudo confirmar carrito vacio luego de hacer click en Vaciar.');
  }

  async goToCheckout(): Promise<void> {
    await this.finalizeLink.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await Promise.all([
      waitForUrlAndLoad(this.page, /\/checkout/i, config.timeouts.nav),
      this.finalizeLink.click()
    ]);
  }

  async assertEmpty(): Promise<void> {
    const emptyVisible = await this.emptyText.isVisible().catch(() => false);
    if (emptyVisible) return;

    const noItems = (await this.itemCards().count().catch(() => 0)) === 0;
    const clearHidden = !(await this.clearBtn.isVisible().catch(() => false));
    if (noItems && clearHidden) return;

    throw new Error('El carrito no esta vacio segun indicadores UI.');
  }

  async getFirstItemQuantity(): Promise<number> {
    const qty = this.qtySpans().first();
    await qty.waitFor({ state: 'visible', timeout: config.timeouts.expect });

    const txt = (await qty.textContent()) || '0';
    return Number((txt.match(/\d+/)?.[0]) || '0');
  }

  async getTotalItemsCount(): Promise<number> {
    const qtys = this.qtySpans();
    const count = await qtys.count();
    if (count === 0) return 0;

    let total = 0;
    for (let i = 0; i < count; i++) {
      const txt = (await qtys.nth(i).textContent().catch(() => '0')) || '0';
      total += Number((txt.match(/\d+/)?.[0]) || '0');
    }
    return total;
  }

  async incrementFirstItem(): Promise<void> {
    const plus = this.plusButtons().first();
    await plus.waitFor({ state: 'visible', timeout: config.timeouts.expect });

    const enabled = await plus.isEnabled().catch(() => false);
    if (!enabled) throw new Error('No se puede incrementar: boton de suma deshabilitado (stock limite).');

    await plus.click();
  }

  async decrementFirstItem(): Promise<void> {
    const minus = this.minusButtons().first();
    await minus.waitFor({ state: 'visible', timeout: config.timeouts.expect });

    const enabled = await minus.isEnabled().catch(() => false);
    if (!enabled) throw new Error('No se puede decrementar: boton de resta deshabilitado (qty minima).');

    await minus.click();
  }

  async removeFirstItem(): Promise<void> {
    const before = await this.getTotalItemsCount();

    const trash = this.trashButtons().first();
    await trash.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await trash.click();

    await Promise.race([
      this.emptyText.waitFor({ state: 'visible', timeout: config.timeouts.expect }),
      this.page
        .waitForFunction(
          ({ selector, prev }) => {
            const panel = document.querySelector(selector);
            if (!panel) return false;
            const values = Array.from(panel.querySelectorAll('span'))
              .map(el => Number((el.textContent || '').trim()))
              .filter(n => Number.isFinite(n));
            const total = values.reduce((acc, n) => acc + n, 0);
            return total < prev;
          },
          { selector: 'div.fixed.right-0.top-0', prev: before },
          { timeout: 8000 }
        )
        .catch(() => {})
    ]).catch(() => {});
  }
}


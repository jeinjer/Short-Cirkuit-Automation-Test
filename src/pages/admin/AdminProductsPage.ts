import type { Page, Locator } from 'playwright';
import { config } from '../../support/env';

export class AdminProductsPage {
  private scope: Locator;

  constructor(private page: Page) {
    this.scope = page.locator('body');
  }

  private tableRows(): Locator {
    return this.scope.locator('table tbody tr');
  }

  private productCards(): Locator {
    return this.scope.locator('button:has(svg.lucide-square-pen), button:has(svg.lucide-power)');
  }

  private emptyState(): Locator {
    return this.scope.getByText(/no hay productos|sin productos|todavia no hay productos|todavía no hay productos/i).first();
  }

  async assertListOrEmpty(): Promise<void> {
    await this.scope.waitFor({ state: 'visible', timeout: config.timeouts.expect });

    const searchVisible = await this.scope
      .locator('input[placeholder*="Buscar por Nombre" i], input[placeholder*="SKU" i]')
      .first()
      .isVisible()
      .catch(() => false);
    const rowsVisible = await this.tableRows().first().isVisible().catch(() => false);
    const cardsVisible = await this.productCards().first().isVisible().catch(() => false);
    const emptyVisible = await this.emptyState().isVisible().catch(() => false);
    const onProductosUrl = /[?&]tab=productos/i.test(this.page.url());

    if (!(rowsVisible || cardsVisible || emptyVisible || (searchVisible && onProductosUrl))) {
      throw new Error('No se detecto listado de productos (tabla/cards) ni empty state en Productos.');
    }
  }

  async openFirstEditIfExists(): Promise<void> {
    await this.assertListOrEmpty();

    const firstRow = this.tableRows().first();
    if (await firstRow.isVisible().catch(() => false)) {
      const editBtn = firstRow.getByRole('button', { name: /editar|edit/i }).first();
      if (await editBtn.isVisible().catch(() => false)) {
        await editBtn.click();
        return;
      }
    }

    const editBtn = this.scope.locator('button:has(svg.lucide-square-pen), button:has(svg.lucide-pen), button[title*="Editar" i]').first();
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await this.page.waitForTimeout(200);
      return;
    }
  }

  async assertEditScreenOrModal(): Promise<void> {
    const modalOk = await this.page.locator('[role="dialog"]').first().isVisible().catch(() => false);
    const headingOk = await this.page.getByRole('heading').filter({ hasText: /editar|edicion|edición|producto/i }).first().isVisible().catch(() => false);
    const formOk = await this.page.locator('input, textarea, select').first().isVisible().catch(() => false);

    if (!(modalOk || headingOk || formOk)) {
      throw new Error('No se detecto pantalla/modal de edicion de producto.');
    }
  }
}


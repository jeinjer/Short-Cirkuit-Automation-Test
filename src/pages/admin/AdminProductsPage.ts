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
    return this.scope.locator(
      'button:has(svg.lucide-square-pen), button:has(svg.lucide-pen), button:has(svg.lucide-edit), button:has(svg.lucide-power)'
    );
  }

  private paginationControls(): Locator {
    const navButtons = this.scope
      .locator('button:has-text("Anterior"), button:has-text("Siguiente"), button:has-text("Ir")')
      .first();
    const pageText = this.scope.getByText(/p.gina\s+\d+\s+de\s+\d+/i).first();
    return navButtons.or(pageText).first();
  }

  private emptyState(): Locator {
    return this.scope
      .getByText(/no hay productos|sin productos|todavia no hay productos|todavía no hay productos|no se encontraron productos/i)
      .first();
  }

  private loaderText(): Locator {
    return this.scope.getByText(/cargando|loading/i).first();
  }

  private busyIndicator(): Locator {
    return this.scope.locator('[aria-busy="true"], [role="progressbar"], .animate-spin, [class*="skeleton"]').first();
  }

  async assertListOrEmpty(): Promise<void> {
    await this.scope.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    const start = Date.now();

    while (Date.now() - start < config.timeouts.expect) {
      const searchVisible = await this.scope
        .locator('input[placeholder*="Buscar por Nombre" i], input[placeholder*="SKU" i], input[placeholder*="Marca" i]')
        .first()
        .isVisible()
        .catch(() => false);
      const rowsVisible = await this.tableRows().first().isVisible().catch(() => false);
      const cardsVisible = await this.productCards().first().isVisible().catch(() => false);
      const emptyVisible = await this.emptyState().isVisible().catch(() => false);
      const pagerVisible = await this.paginationControls().isVisible().catch(() => false);
      const loaderByText = await this.loaderText().isVisible().catch(() => false);
      const loaderByBusy = await this.busyIndicator().isVisible().catch(() => false);
      const loaderVisible = loaderByText || loaderByBusy;

      if (rowsVisible || cardsVisible || emptyVisible) return;
      if (searchVisible && !loaderVisible) return;
      if (searchVisible && pagerVisible) return;
      await this.page.waitForTimeout(loaderVisible ? 300 : 200);
    }

    const loaderStillVisible =
      (await this.loaderText().isVisible().catch(() => false)) ||
      (await this.busyIndicator().isVisible().catch(() => false));

    if (loaderStillVisible) {
      throw new Error('El loader de Productos no finalizo dentro del timeout.');
    }

    throw new Error('No se detecto listado de productos (tabla/cards) ni empty state en Productos.');
  }

  async openFirstEditIfExists(): Promise<boolean> {
    await this.assertListOrEmpty();

    const firstRow = this.tableRows().first();
    if (await firstRow.isVisible().catch(() => false)) {
      const editBtn = firstRow.getByRole('button', { name: /editar|edit/i }).first();
      if (await editBtn.isVisible().catch(() => false)) {
        await editBtn.click();
        return true;
      }
    }

    const editBtn = this.scope
      .locator('button:has(svg.lucide-square-pen), button:has(svg.lucide-pen), button:has(svg.lucide-edit), button[title*="Editar" i]')
      .first();
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await this.page.waitForTimeout(200);
      return true;
    }

    return false;
  }

  async assertEditScreenOrModal(): Promise<void> {
    const modalOk = await this.page.locator('[role="dialog"]').first().isVisible().catch(() => false);
    const headingOk = await this.page.getByRole('heading').filter({ hasText: /editar|edicion|edicion|producto/i }).first().isVisible().catch(() => false);
    const formOk = await this.page.locator('input, textarea, select').first().isVisible().catch(() => false);

    if (!(modalOk || headingOk || formOk)) {
      throw new Error('No se detecto pantalla/modal de edicion de producto.');
    }
  }
}

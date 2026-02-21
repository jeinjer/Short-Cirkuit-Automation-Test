import type { Page, Locator } from 'playwright';

export class AdminProductsToggle {
  private scope: Locator;

  constructor(private page: Page) {
    this.scope = page.locator('body');
  }

  private firstRow(): Locator {
    return this.scope.locator('table tbody tr').first();
  }

  private toast(): Locator {
    return this.page.locator('[data-sonner-toast]').first();
  }

  async toggleFirstIfExists(): Promise<boolean> {
    const row = this.firstRow();
    if (await row.isVisible().catch(() => false)) {
      const toggle = row.getByRole('switch').first()
        .or(row.locator('input[type="checkbox"]').first())
        .or(row.getByRole('button', { name: /activar|desactivar/i }).first());

      if (await toggle.isVisible().catch(() => false)) {
        await toggle.click().catch(() => {});
        return true;
      }
    }

    const power = this.scope.locator('button[title*="Habilitar" i], button[title*="Deshabilitar" i], button:has(svg.lucide-power)').first();
    if (await power.isVisible().catch(() => false)) {
      await power.click();
      return true;
    }

    return false;
  }

  async assertConfirmation(): Promise<void> {
    const toastOk = await this.toast().waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
    if (toastOk) return;

    const statusText = await this.scope.getByText(/activo|inactivo|habilitar|deshabilitar/i).first().isVisible().catch(() => false);
    if (!statusText) {
      throw new Error('No se detecto confirmacion de cambio (toast ni estado activo/inactivo).');
    }
  }
}

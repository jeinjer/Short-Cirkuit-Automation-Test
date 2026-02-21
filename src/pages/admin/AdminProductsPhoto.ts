import type { Page, Locator } from 'playwright';
import path from 'path';

export class AdminProductsPhoto {
  private scope: Locator;

  constructor(private page: Page) {
    this.scope = page.locator('body');
  }

  private firstRow(): Locator {
    return this.scope.locator('table tbody tr').first();
  }

  private firstCard(): Locator {
    return this.scope.locator('div.bg-white\/5').filter({ has: this.scope.locator('h3') }).first();
  }

  async openPhotoEditorIfExists(): Promise<boolean> {
    const row = this.firstRow();
    if (await row.isVisible().catch(() => false)) {
      const btn = row.getByRole('button', { name: /foto|imagen|editar/i }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await this.page.waitForTimeout(200);
        return true;
      }
    }

    const card = this.firstCard();
    if (await card.isVisible().catch(() => false)) {
      const editBtn = card.locator('button:has(svg.lucide-square-pen), button[title*="Editar" i], button:has(svg.lucide-image)').first();
      if (await editBtn.isVisible().catch(() => false)) {
        await editBtn.click();
        await this.page.waitForTimeout(200);
        return true;
      }
    }

    return false;
  }

  async uploadIfPossible(): Promise<'uploaded' | 'not_available'> {
    const root = (await this.page.locator('[role="dialog"]').first().isVisible().catch(() => false))
      ? this.page.locator('[role="dialog"]').first()
      : this.scope;

    const file = root.locator('input[type="file"]').first();
    if (!(await file.isVisible().catch(() => false))) return 'not_available';

    const imgPath = path.resolve('src/assets/test-image.png');
    await file.setInputFiles(imgPath);

    const save = root.getByRole('button', { name: /guardar|actualizar|confirmar|save|update/i }).first();
    if (await save.isVisible().catch(() => false)) {
      await save.click();
      await this.page.locator('[data-sonner-toast]').first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    }

    return 'uploaded';
  }
}

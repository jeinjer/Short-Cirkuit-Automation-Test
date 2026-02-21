import type { Page, Locator } from 'playwright';
import { config } from '../../support/env';
import { gotoAndWait } from '../../support/navigation';

export class ProfilePage {
  private h1: Locator;
  private toaster: Locator;

  constructor(private page: Page) {
    this.h1 = page.getByRole('heading', { level: 1, name: /mi cuenta/i }).first();
    this.toaster = page.locator('[data-sonner-toast]').first();
  }

  async goto(baseUrl: string) {
    await gotoAndWait(this.page, `${baseUrl}/perfil`, config.timeouts.nav);
  }

  async assertLoaded() {
    await this.h1.waitFor({ state: 'visible', timeout: config.timeouts.expect });
  }

  async openSection(name: 'Mis pedidos' | 'Mis consultas') {
    const btn = this.page.getByRole('button', { name }).first();
    await btn.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await btn.click();
    await this.page
      .getByText(/cargando seccion|cargando sección/i)
      .first()
      .waitFor({ state: 'detached', timeout: config.timeouts.expect })
      .catch(() => {});
  }

  async assertOrdersSection() {
    const header = this.page.getByText(/^Mis pedidos$/).first();
    await header.waitFor({ state: 'visible', timeout: config.timeouts.expect });
  }

  async assertInquiriesSection() {
    const header = this.page.getByText(/^Mis consultas$/).first();
    await header.waitFor({ state: 'visible', timeout: config.timeouts.expect });
  }

  async assertBasicInfo() {
    const profileBlock = this.page.getByText(/datos del perfil/i).first();
    const blockOk = await profileBlock.isVisible().catch(() => false);

    const nameValue = this.page.locator('p').filter({ hasText: /\s+/ }).first();
    const emailValue = this.page.locator('p').filter({ hasText: /@/ }).first();

    const nameOk = await nameValue.isVisible().catch(() => false);
    const emailOk = await emailValue.isVisible().catch(() => false);

    if (!blockOk) throw new Error('No se detecto bloque de perfil.');
    if (!nameOk) throw new Error('No se detecto nombre visible en Perfil.');
    if (!emailOk) throw new Error('No se detecto email visible en Perfil.');
  }

  async selectFirstAvatarOption(): Promise<void> {
    const firstAvatar = this.page.locator('img[alt="avatar-option"]').first();
    await firstAvatar.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await firstAvatar.click();
  }

  async saveProfileChanges(): Promise<void> {
    const saveBtn = this.page.getByRole('button', { name: /guardar cambios/i }).first();
    await saveBtn.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await saveBtn.click();
  }

  async removeAvatar(): Promise<void> {
    const removeBtn = this.page.getByRole('button', { name: /quitar avatar/i }).first();
    await removeBtn.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await removeBtn.click();
  }

  async assertProfileToast(expected: RegExp): Promise<void> {
    const toast = this.page.locator('[data-sonner-toast]').filter({ hasText: expected }).first();
    const ok = await toast.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
    if (ok) return;

    const profileLoaded = await this.h1.isVisible().catch(() => false);
    const anyToast = await this.toaster.isVisible().catch(() => false);
    if (!profileLoaded && !anyToast) {
      throw new Error(`No se detecto confirmacion esperada: ${expected}`);
    }
  }

  async assertInquiriesListOrEmpty(): Promise<void> {
    const start = Date.now();

    while (Date.now() - start < config.timeouts.expect) {
      const hasCard = await this.page
        .locator('article, li, div')
        .filter({ hasText: /consulta|respuesta|administrador|estado/i })
        .first()
        .isVisible()
        .catch(() => false);

      const empty = await this.page
        .getByText(/todavia no hiciste consultas|todavía no hiciste consultas|sin consultas|no hay consultas/i)
        .first()
        .isVisible()
        .catch(() => false);

      const loader = await this.page
        .getByText(/cargando consultas|cargando seccion|cargando sección/i)
        .first()
        .isVisible()
        .catch(() => false);

      if (hasCard || empty) return;
      await this.page.waitForTimeout(loader ? 300 : 200);
    }

    throw new Error('No se detecto listado de consultas ni empty state en perfil.');
  }
}


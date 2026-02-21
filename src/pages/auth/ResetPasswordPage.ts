import type { Page, Locator } from 'playwright';
import { config } from '../../support/env';

export class ResetPasswordPage {
  private pass1: Locator;
  private pass2: Locator;
  private submit: Locator;

  constructor(private page: Page) {
    const form = page.locator('form').first();
    const pw = form.locator('input[type="password"]');
    this.pass1 = pw.nth(0);
    this.pass2 = pw.nth(1);
    this.submit = page.getByRole('button', { name: /confirmar|guardar|restablecer/i }).first();
  }

  async gotoInvalid(baseUrl: string) {
    // asume token por query; si tu app usa otra forma, igual debería fallar/controlar
    await this.page.goto(`${baseUrl}/reset-password?token=invalid`, { waitUntil: 'domcontentloaded', timeout: config.timeouts.nav });
  }

  async assertInvalidOrBlocked() {
    const err = this.page.getByText(/token inválido|token invalido|expirado|no válido|no valido|error/i).first();
    const errVisible = await err.isVisible().catch(() => false);
    if (errVisible) return;

    // si no hay error visible, al menos el submit debería estar deshabilitado o no visible
    const visible = await this.submit.isVisible().catch(() => false);
    if (!visible) return;

    const enabled = await this.submit.isEnabled().catch(() => false);
    if (!enabled) return;

    throw new Error('Reset password no bloquea token inválido (no hay error visible y el submit está habilitado).');
  }
}

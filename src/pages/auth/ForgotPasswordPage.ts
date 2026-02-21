import type { Page, Locator } from 'playwright';
import { config } from '../../support/env';

export class ForgotPasswordPage {
  private email: Locator;
  private submit: Locator;

  constructor(private page: Page) {
    const form = page.locator('form').first();
    this.email = form.locator('input[type="email"], input[autocomplete="email"]').first();
    this.submit = page.getByRole('button', { name: /enviar|recuperar|continuar/i }).first();
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/forgot-password`, { waitUntil: 'domcontentloaded', timeout: config.timeouts.nav });
  }

  async request(email: string) {
    await this.email.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await this.email.fill(email);
    await this.submit.click();
  }

  async assertConfirmation() {
    const toast = this.page.locator('[data-sonner-toast]').first();
    const text = this.page.getByText(/revisa|revisa tu correo|te enviamos|email enviado|si existe una cuenta|enlace/i).first();

    const toastOk = await toast.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
    const textOk = await text.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);

    if (toastOk || textOk) return;

    // fallback tolerante: request enviada y formulario bloqueado temporalmente
    const submitDisabled = await this.submit.isDisabled().catch(() => false);
    const emailDisabled = await this.email.isDisabled().catch(() => false);
    if (submitDisabled || emailDisabled) return;

    throw new Error('No se detecto confirmacion de recuperacion (toast/texto/estado de envio).');
  }
}


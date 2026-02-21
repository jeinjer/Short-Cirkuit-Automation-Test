import type { Page, Locator } from 'playwright';
import { config } from '../../support/env';

export class CheckoutPage {
  private title: Locator;
  private submit: Locator;
  private toastOk: Locator;
  private orderMsg: Locator;
  private continuarBtn: Locator;

  constructor(private page: Page) {
    this.title = page.getByRole('heading', { level: 1, name: /checkout/i }).first();
    this.submit = page.getByRole('button', { name: /generar pedido/i }).first();

    this.toastOk = page.locator('[data-sonner-toast]').filter({ hasText: /pedido generado|continua por whatsapp/i }).first();
    this.orderMsg = page.getByText(/pedido\s*#\s*[a-z0-9]+\s*generado correctamente/i).first();
    this.continuarBtn = page.getByRole('link', { name: /^continuar$/i }).first();
  }

  async waitLoaded(): Promise<void> {
    await this.title.waitFor({ state: 'visible', timeout: config.timeouts.expect });
  }

  async generateOrder(): Promise<string> {
    const cartBackdrop = this.page.locator('div.fixed.inset-0.bg-black\\/60.z-60').first();
    await cartBackdrop.waitFor({ state: 'hidden', timeout: config.timeouts.expect }).catch(() => {});

    await this.submit.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await this.submit.waitFor({ state: 'attached', timeout: config.timeouts.expect });

    let clicked = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const enabled = await this.submit.isEnabled().catch(() => false);
      if (!enabled) {
        await this.page.waitForTimeout(300);
        continue;
      }
      try {
        await this.submit.click({ timeout: 5000 });
        clicked = true;
        break;
      } catch {
        await this.page.waitForTimeout(300);
      }
    }

    if (!clicked) {
      throw new Error('No se pudo hacer click en "Generar pedido" (overlay o botón no habilitado).');
    }

    await this.orderMsg.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await this.continuarBtn.waitFor({ state: 'visible', timeout: config.timeouts.expect });

    await this.toastOk.waitFor({ state: 'visible', timeout: 6000 }).catch(() => {});

    const txt = (await this.orderMsg.textContent()) || '';
    const m = txt.match(/pedido\s*#\s*([a-z0-9]+)/i);
    return m?.[1] || '';
  }
}


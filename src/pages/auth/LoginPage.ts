import type { Page, Locator } from 'playwright';
import { config } from '../../support/env';
import { gotoAndWait } from '../../support/navigation';

export class LoginPage {
  private userMenu: Locator;

  constructor(private page: Page) {
    this.userMenu = page.getByRole('button').filter({ hasText: /usuario/i }).first();
  }

  private emailField(): Locator {
    return this.page
      .locator('form input[type="email"], form input[autocomplete="email"], input[type="email"], input[autocomplete="email"]')
      .first();
  }

  private passwordField(): Locator {
    return this.page
      .locator('form input[type="password"], form input[autocomplete="current-password"], input[type="password"], input[autocomplete="current-password"]')
      .first();
  }

  private submitButton(): Locator {
    return this.page.getByRole('button', { name: /iniciar sesion|iniciar sesión|login/i }).first();
  }

  async goto(baseUrl: string) {
    await gotoAndWait(this.page, `${baseUrl}/login`, config.timeouts.nav);
  }

  async login(email: string, password: string) {
    if (await this.userMenu.isVisible().catch(() => false)) return;

    const emailInput = this.emailField();
    const passInput = this.passwordField();

    const hasEmail = await emailInput.waitFor({ state: 'visible', timeout: config.timeouts.expect }).then(() => true).catch(() => false);
    const hasPass = await passInput.waitFor({ state: 'visible', timeout: config.timeouts.expect }).then(() => true).catch(() => false);

    if (!hasEmail || !hasPass) {
      if (await this.userMenu.isVisible().catch(() => false)) return;
      throw new Error('No se encontraron campos de login visibles (email/password).');
    }

    await emailInput.fill(email);
    await passInput.fill(password);

    const submit = this.submitButton();
    if (await submit.isVisible().catch(() => false)) {
      await submit.click();
    } else {
      await passInput.press('Enter');
    }

    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.userMenu.waitFor({ state: 'visible', timeout: config.timeouts.expect }).catch(() => {});
  }

  async isUserMenuVisible(): Promise<boolean> {
    return this.userMenu.isVisible().catch(() => false);
  }
}


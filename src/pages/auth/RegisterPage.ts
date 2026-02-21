import type { Page, Locator } from 'playwright';
import { config } from '../../support/env';

export class RegisterPage {
  private nameInput: Locator;
  private emailInput: Locator;
  private pass1: Locator;
  private pass2: Locator;
  private submit: Locator;

  constructor(private page: Page) {
    const form = page.locator('form').first();
    this.nameInput = form.locator('input[type="text"], input[name*="name" i]').first();
    this.emailInput = form.locator('input[type="email"], input[autocomplete="email"]').first();

    const passwords = form.locator('input[type="password"]');
    this.pass1 = passwords.nth(0);
    this.pass2 = passwords.nth(1);

    this.submit = page.getByRole('button', { name: /confirmar|registrar|crear cuenta/i }).first();
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/registro`, { waitUntil: 'domcontentloaded', timeout: config.timeouts.nav });
  }

  async register(fullName: string, email: string, password: string) {
    await this.nameInput.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await this.nameInput.fill(fullName);

    await this.emailInput.fill(email);
    await this.pass1.fill(password);
    await this.pass2.fill(password);

    await Promise.all([
      this.page.waitForLoadState('domcontentloaded').catch(() => {}),
      this.submit.click()
    ]);
  }
}

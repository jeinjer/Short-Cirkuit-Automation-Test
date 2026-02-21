import { Page, Locator } from 'playwright';
import { expect } from '@playwright/test';

export class HomePage {
  private main: Locator;
  private header: Locator;
  private footer: Locator;

  constructor(private page: Page) {
    this.main = page.locator('main');
    this.header = page.locator('header');
    this.footer = page.locator('footer');
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  }

  async assertMainElements() {
    await expect(this.header).toBeVisible();
    await expect(this.main).toBeVisible();
    await expect(this.footer).toBeVisible();
  }

  async assertCatalogSectionHasProducts() {
    // sin testids: buscamos links a detalle producto en la home
    const productLinks = this.page.locator('a[href^="/producto/"]');
    await expect(productLinks.first()).toBeVisible();
  }
}
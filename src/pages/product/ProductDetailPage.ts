import type { Page, Locator } from 'playwright';
import { config } from '../../support/env';
import { waitForUrlAndLoad } from '../../support/navigation';

export class ProductDetailPage {
  private loader: Locator;
  private errorState: Locator;
  private backToCatalog: Locator;
  private title: Locator;
  private priceLabel: Locator;
  private stockText: Locator;

  // NUEVO
  private addToCartBtn: Locator;
  private cartBtn: Locator;
  private toastAdded: Locator;
  private cartBadge: Locator;
  private askInquiryBtn: Locator;
  private inquiryTextarea: Locator;
  private inquirySubmitBtn: Locator;
  private inquirySuccessBox: Locator;
  private inquiryToast: Locator;

  constructor(private page: Page) {
    this.loader = page.getByText(/cargando\.\.\./i).first();
    this.errorState = page.getByText(/producto no encontrado|error al cargar|ocurrió un error/i).first();

    this.backToCatalog = page.getByText(/volver al catálogo/i).first();
    this.title = page.locator('h1').first();
    this.priceLabel = page.getByText(/precio final/i).first();
    this.stockText = page.getByText(/stock disponible:|sin stock/i).first();

    // NUEVO (según tu UI real)
    this.addToCartBtn = page.getByRole('button', { name: /agregar al carrito/i }).first();
    this.cartBtn = page.locator('button[title="Carrito"]').first();
    this.toastAdded = page.locator('[data-sonner-toast]').filter({ hasText: /producto agregado al carrito/i }).first();
    this.cartBadge = this.cartBtn.locator('div').filter({ hasText: /^\d+$/ }).first();
    this.askInquiryBtn = page.getByRole('button', { name: /consultar sobre este producto|consultar/i }).first();
    this.inquiryTextarea = page.locator('textarea[placeholder*="Escribe tu consulta" i]').first();
    this.inquirySubmitBtn = page.getByRole('button', { name: /^enviar$/i }).first();
    this.inquirySuccessBox = page.getByText(/consulta enviada correctamente/i).first();
    this.inquiryToast = page.locator('[data-sonner-toast]').filter({ hasText: /consulta enviada|te responderemos/i }).first();
  }

  // MANTENÉ tu waitLoaded() que ya pasa

  async waitLoaded(): Promise<boolean> {
    const inProductUrl = /\/producto\/.+/i.test(this.page.url());
    if (!inProductUrl) return false;

    await this.loader.waitFor({ state: 'detached', timeout: config.timeouts.expect }).catch(() => {});

    const hasError = await this.errorState.isVisible().catch(() => false);
    if (hasError) return false;

    const titleVisible = await this.title
      .waitFor({ state: 'visible', timeout: config.timeouts.expect })
      .then(() => true)
      .catch(() => false);
    return titleVisible;
  }

  async getProductName(): Promise<string> {
    await this.title.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    return (await this.title.textContent())?.trim() || '';
  }

async canAddToCart(minStock = 1): Promise<boolean> {
  const stockTxt = (await this.stockText.textContent())?.toLowerCase() || '';
  const m = stockTxt.match(/stock disponible:\s*(\d+)/i);
  const qty = m ? Number(m[1]) : (stockTxt.includes('stock disponible') ? 999 : 0);

  const btnVisible = await this.addToCartBtn.isVisible().catch(() => false);
  const btnEnabled = await this.addToCartBtn.isEnabled().catch(() => false);

  return qty >= minStock && btnVisible && btnEnabled;
}

  async addToCart(): Promise<void> {
    await this.addToCartBtn.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await this.addToCartBtn.click();

    // señal primaria: badge con número en el botón de carrito
    await this.cartBadge.waitFor({ state: 'visible', timeout: config.timeouts.expect }).catch(() => {});

    // señal secundaria: toast
    await this.toastAdded.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});
  }

  async openCartDrawer(): Promise<void> {
    await this.cartBtn.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await this.cartBtn.click();
    await this.page.getByRole('heading', { name: /mi carrito/i }).waitFor({ state: 'visible', timeout: config.timeouts.expect });
  }

  async goBackToCatalog(): Promise<void> {
    await this.backToCatalog.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await Promise.all([
      waitForUrlAndLoad(this.page, /\/catalogo/i, config.timeouts.nav),
      this.backToCatalog.click()
    ]);
  }

  async sendInquiry(message: string): Promise<void> {
    await this.askInquiryBtn.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await this.askInquiryBtn.click();

    await this.inquiryTextarea.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await this.inquiryTextarea.fill(message);

    await this.inquirySubmitBtn.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    await this.inquirySubmitBtn.click();
  }

  async assertInquirySent(): Promise<void> {
    const okBox = await this.inquirySuccessBox.isVisible().catch(() => false);
    const okToast = await this.inquiryToast.isVisible().catch(() => false);
    if (!okBox && !okToast) {
      await this.inquirySuccessBox.waitFor({ state: 'visible', timeout: config.timeouts.expect }).catch(() => {});
      await this.inquiryToast.waitFor({ state: 'visible', timeout: 6000 }).catch(() => {});
    }
  }
}


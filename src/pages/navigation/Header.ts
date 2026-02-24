import type { Page, Locator } from 'playwright';
import { config } from '../../support/env';
import { waitForUrlAndLoad } from '../../support/navigation';

export class Header {
    private userBtn: Locator;
    private cartBtn: Locator;

    constructor(private page: Page) {
        this.userBtn = page.getByRole('button').filter({ hasText: /usuario/i }).first();
        this.cartBtn = page.locator('button[title="Carrito"]').first();
        this.searchInput = page.locator('input[placeholder="MINI PC ASUS"]').first();
    }

    private searchInput: Locator;

    async searchFromHeader(term: string) {
        await this.searchInput.waitFor({ state: 'visible', timeout: config.timeouts.expect });
        await this.searchInput.fill(term);
        await Promise.all([
            waitForUrlAndLoad(this.page, /\/catalogo\?.*search=/i, config.timeouts.nav),
            this.searchInput.press('Enter'),
        ]);
        await this.page.waitForLoadState('networkidle').catch(() => {});
        await this.page.waitForTimeout(250);
    }

    async openUserMenu() {
        await this.userBtn.waitFor({ state: 'visible', timeout: config.timeouts.expect });
        await this.userBtn.click();
    }

    async logout() {
        await this.openUserMenu();

        const logoutItem = this.page
            .getByRole('button', { name: /cerrar sesión|cerrar sesion|salir|logout/i })
            .first();

        const logoutLink = this.page
            .getByRole('link', { name: /cerrar sesión|cerrar sesion|salir|logout/i })
            .first();

        if (await logoutItem.isVisible().catch(() => false)) {
            await logoutItem.click();
        } else if (await logoutLink.isVisible().catch(() => false)) {
            await logoutLink.click();
        } else {
            await this.page.locator('text=/cerrar sesión|cerrar sesion|salir|logout/i').first().click();
        }

        await this.userBtn.waitFor({ state: 'detached', timeout: config.timeouts.expect }).catch(() => { });
    }

    async openCart() {
        const heading = this.page.getByRole('heading', { name: /mi carrito/i }).first();
        const alreadyOpen = await heading.isVisible().catch(() => false);
        if (alreadyOpen) return;

        await this.cartBtn.waitFor({ state: 'visible', timeout: config.timeouts.expect });
        await this.cartBtn.click();
        await heading.waitFor({ state: 'visible', timeout: config.timeouts.expect });
    }
}

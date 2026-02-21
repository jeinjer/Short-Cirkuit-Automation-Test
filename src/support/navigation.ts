import type { Page } from 'playwright';
import { config } from './env';

export async function waitForUrlAndLoad(
  page: Page,
  url: RegExp | string,
  timeout = config.timeouts.nav
): Promise<void> {
  await page.waitForURL(url, { timeout });
  await page.waitForLoadState('domcontentloaded', { timeout: Math.min(timeout, 15000) }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: Math.min(timeout, 10000) }).catch(() => {});
}

export async function gotoAndWait(page: Page, url: string, timeout = config.timeouts.nav): Promise<void> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
  await page.waitForLoadState('networkidle', { timeout: Math.min(timeout, 10000) }).catch(() => {});
}

import 'dotenv/config';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const role = (arg('role') || '').toLowerCase(); 
  const outFile = arg('out');

  if (!outFile) throw new Error('Falta --out storageStates/<file>.json');
  if (role !== 'client' && role !== 'admin') throw new Error('Falta --role client|admin');

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) throw new Error('Falta BASE_URL en .env');

  const email = role === 'admin' ? process.env.TEST_ADMIN_EMAIL : process.env.TEST_EMAIL;
  const password = role === 'admin' ? process.env.TEST_ADMIN_PASSWORD : process.env.TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      role === 'admin'
        ? 'Faltan TEST_ADMIN_EMAIL o TEST_ADMIN_PASSWORD en .env'
        : 'Faltan TEST_EMAIL o TEST_PASSWORD en .env'
    );
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });

  const emailInput = page.locator('form').locator('input[type="email"], input[autocomplete="email"]').first();
  const passInput = page.locator('form').locator('input[type="password"], input[autocomplete="current-password"]').first();
  const submit = page.getByRole('button', { name: /iniciar sesión|login/i }).first();

  await emailInput.fill(email);
  await passInput.fill(password);
  await submit.click();

  await page.getByRole('button').filter({ hasText: /usuario/i }).first().waitFor({ state: 'visible', timeout: 30000 });

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  await context.storageState({ path: outFile });

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
import { When, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { AdminPage } from '../../pages/AdminPage';

function normalizeTab(tab: string): 'Productos' | 'Consultas' | 'Ordenes' {
  const t = tab
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (t.includes('producto')) return 'Productos';
  if (t.includes('consulta')) return 'Consultas';
  if (t.includes('orden') || t.includes('pedido')) return 'Ordenes';

  throw new Error(`Tab no soportada: ${tab}`);
}

async function openTabStep(this: CustomWorld, tab: string) {
  const admin = new AdminPage(this.page);
  await admin.openTab(normalizeTab(tab));
}

async function assertTabStep(this: CustomWorld, tab: string) {
  const admin = new AdminPage(this.page);
  await admin.assertTabContent(normalizeTab(tab));
}

When(/^abro la pesta(?:n|ñ|Ã±|ÃƒÂ±)a "([^"]*)"$/, openTabStep);
Then(/^veo contenido de la pesta(?:n|ñ|Ã±|ÃƒÂ±)a "([^"]*)"$/, assertTabStep);

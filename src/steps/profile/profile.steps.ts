import { When, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';
import { ProfilePage } from '../../pages/ProfilePage';

let profile: ProfilePage;

When('abro mi perfil', async function (this: CustomWorld) {
  profile = new ProfilePage(this.page);
  await profile.goto(config.baseUrl);
});

Then('veo el perfil cargado', async function (this: CustomWorld) {
  profile = new ProfilePage(this.page);
  await profile.assertLoaded();
});

When('abro la sección {string}', async function (this: CustomWorld, section: string) {
  profile = new ProfilePage(this.page);
  if (section !== 'Mis pedidos' && section !== 'Mis consultas') {
    throw new Error(`Sección no soportada: ${section}`);
  }
  await profile.openSection(section as any);
});

Then('veo la sección {string}', async function (this: CustomWorld, section: string) {
  profile = new ProfilePage(this.page);
  if (section === 'Mis pedidos') {
    await profile.assertOrdersSection();
    return;
  }
  if (section === 'Mis consultas') {
    await profile.assertInquiriesSection();
    return;
  }
  throw new Error(`Sección no soportada: ${section}`);
});

Then('veo nombre y email del usuario', async function () {
  await profile.assertBasicInfo();
});


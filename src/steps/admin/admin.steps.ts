import { Given, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';
import { AdminPage } from '../../pages/AdminPage';

let admin: AdminPage;

Given('abro el panel de admin', async function (this: CustomWorld) {
  admin = new AdminPage(this.page);
  await admin.goto(config.baseUrl);
});

async function assertAdminLoaded(this: CustomWorld) {
  await admin.assertLoaded();
}

Then('veo el panel de control con metricas y pestanas', assertAdminLoaded);
Then('veo el panel de control con métricas y pestañas', assertAdminLoaded);
Then('veo el panel de control con mÃ©tricas y pestaÃ±as', assertAdminLoaded);

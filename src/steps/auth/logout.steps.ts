import { When } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { Header } from '../../pages/Header';

When('cierro sesión', async function (this: CustomWorld) {
  const header = new Header(this.page);
  await header.logout();
});

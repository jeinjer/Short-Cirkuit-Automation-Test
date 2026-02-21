import { When, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { ProductDetailPage } from '../../pages/ProductDetailPage';
import { ProfilePage } from '../../pages/ProfilePage';

When('envío una consulta del producto', async function (this: CustomWorld) {
  const pdp = new ProductDetailPage(this.page);
  const msg = `Consulta QA ${Date.now()}`;
  this.state.searchTerm = msg;
  await pdp.sendInquiry(msg);
});

Then('veo confirmación de consulta enviada', async function (this: CustomWorld) {
  const pdp = new ProductDetailPage(this.page);
  await pdp.assertInquirySent();
});

Then('veo al menos una consulta listada o empty state de consultas', async function (this: CustomWorld) {
  const profile = new ProfilePage(this.page);
  await profile.assertInquiriesListOrEmpty();
});


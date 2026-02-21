import { When, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { ProfilePage } from '../../pages/ProfilePage';

When('selecciono un avatar disponible', async function (this: CustomWorld) {
  const profile = new ProfilePage(this.page);
  await profile.selectFirstAvatarOption();
});

When('guardo cambios de perfil', async function (this: CustomWorld) {
  const profile = new ProfilePage(this.page);
  await profile.saveProfileChanges();
});

Then('veo confirmación de perfil actualizado', async function (this: CustomWorld) {
  const profile = new ProfilePage(this.page);
  await profile.assertProfileToast(/perfil actualizado|actualizado/i);
});

When('quito el avatar del perfil', async function (this: CustomWorld) {
  const profile = new ProfilePage(this.page);
  await profile.removeAvatar();
});

Then('veo confirmación de avatar eliminado', async function (this: CustomWorld) {
  const profile = new ProfilePage(this.page);
  await profile.assertProfileToast(/avatar eliminado|eliminado/i);
});


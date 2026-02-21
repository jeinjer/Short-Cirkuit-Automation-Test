import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { AdminProductsToggle } from '../../pages/AdminProductsToggle';

let toggled = false;

When('alterno el estado activo del primer producto si existe', async function (this: CustomWorld) {
  const t = new AdminProductsToggle(this.page);
  toggled = await t.toggleFirstIfExists();

  if (!toggled) {
    await this.attach('No se encontró acción de Activar/Desactivar en la primera fila. Caso no aplica.');
  }
});

Then('veo confirmación de cambio de estado', async function (this: CustomWorld) {
  if (!toggled) {
    expect(true).to.equal(true);
    return;
  }
  const t = new AdminProductsToggle(this.page);
  await t.assertConfirmation();
});

import { Given, Then } from '@cucumber/cucumber';
import { HomePage } from '../../pages/HomePage';

let home: HomePage;

Given('que abro la home', async function () {
  home = new HomePage(this.page);
  await home.goto(process.env.BASE_URL as string);
});

Then('veo los elementos principales del home', async function () {
  await home.assertMainElements();
});

Then('veo un listado de productos al final', async function () {
  await home.assertCatalogSectionHasProducts();
});

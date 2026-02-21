import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import type { CustomWorld } from '../../support/world';
import { config } from '../../support/env';

function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${config.baseUrl}${normalized}`;
}

async function apiRequest(
  world: CustomWorld,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
  withAuth = false
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (withAuth) {
    if (!world.state.apiToken) throw new Error('No hay token API en el estado del escenario.');
    headers.Authorization = `Bearer ${world.state.apiToken}`;
  }

  const res = await fetch(apiUrl(path), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  world.state.apiStatus = res.status;

  const txt = await res.text();
  try {
    world.state.apiBody = txt ? JSON.parse(txt) : null;
  } catch {
    world.state.apiBody = txt;
  }
}

Given('inicio sesion por API como cliente', async function (this: CustomWorld) {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  if (!email || !password) {
    throw new Error('Faltan TEST_EMAIL o TEST_PASSWORD en .env para pruebas de API autenticadas.');
  }

  await apiRequest(this, 'POST', '/api/auth/login', { email, password });

  if (this.state.apiStatus !== 200) {
    throw new Error(`Login API fallo con status ${this.state.apiStatus}. Body: ${JSON.stringify(this.state.apiBody)}`);
  }

  this.state.apiToken = this.state.apiBody?.token;
});

Given('no tengo token API', function (this: CustomWorld) {
  this.state.apiToken = undefined;
});

When('intento login API con credenciales invalidas', async function (this: CustomWorld) {
  await apiRequest(this, 'POST', '/api/auth/login', {
    email: `qa_invalid_${Date.now()}@mail.com`,
    password: 'invalid-pass'
  });
});

When('consulto por API el carrito actual', async function (this: CustomWorld) {
  await apiRequest(this, 'GET', '/api/cart', undefined, true);
});

When('consulto por API mi perfil', async function (this: CustomWorld) {
  await apiRequest(this, 'GET', '/api/auth/me', undefined, true);
});

When('consulto por API mi perfil sin autenticacion', async function (this: CustomWorld) {
  await apiRequest(this, 'GET', '/api/auth/me');
});

When('consulto por API el carrito sin autenticacion', async function (this: CustomWorld) {
  await apiRequest(this, 'GET', '/api/cart');
});

When('consulto por API el listado de productos', async function (this: CustomWorld) {
  await apiRequest(this, 'GET', '/api/products?page=1&limit=5');
});

When('consulto por API un SKU invalido', async function (this: CustomWorld) {
  await apiRequest(this, 'GET', '/api/products/sku-qa-inexistente');
});

When('consulto por API las categorias', async function (this: CustomWorld) {
  await apiRequest(this, 'GET', '/api/categories');
});

When('consulto por API filtros dinamicos', async function (this: CustomWorld) {
  await apiRequest(this, 'GET', '/api/filters');
});

When('consulto por API el listado admin de consultas sin autenticacion', async function (this: CustomWorld) {
  await apiRequest(this, 'GET', '/api/inquiries');
});

When('consulto por API el listado admin de consultas con token cliente', async function (this: CustomWorld) {
  await apiRequest(this, 'GET', '/api/inquiries', undefined, true);
});

When('intento actualizar cantidad de carrito por encima del stock', async function (this: CustomWorld) {
  await apiRequest(this, 'GET', '/api/products?inStockOnly=true&limit=10', undefined, true);
  const products = this.state.apiBody?.data;

  if (!Array.isArray(products) || products.length === 0) {
    throw new Error('No hay productos en stock para ejecutar el caso de stock maximo en API.');
  }

  const candidate = products.find((p: any) => Number(p?.quantity) > 0) || products[0];
  const productId = String(candidate.id || '');
  const stock = Number(candidate.quantity || 0);

  if (!productId || stock <= 0) {
    throw new Error('No se pudo obtener productId/stock valido para el escenario de carrito API.');
  }

  this.state.apiProductId = productId;
  this.state.apiProductStock = stock;

  await apiRequest(this, 'DELETE', '/api/cart', undefined, true);

  await apiRequest(this, 'POST', '/api/cart/items', { productId, quantity: 1 }, true);
  if (this.state.apiStatus !== 200) {
    throw new Error(`No se pudo preparar carrito para test de stock. Status ${this.state.apiStatus}`);
  }

  await apiRequest(this, 'PATCH', `/api/cart/items/${productId}`, { quantity: stock + 1 }, true);
});

When('intento agregar item al carrito sin productId', async function (this: CustomWorld) {
  await apiRequest(this, 'POST', '/api/cart/items', { quantity: 1 }, true);
});

When('intento agregar item al carrito con cantidad invalida', async function (this: CustomWorld) {
  await apiRequest(this, 'GET', '/api/products?inStockOnly=true&limit=10', undefined, true);
  const products = this.state.apiBody?.data;

  if (!Array.isArray(products) || products.length === 0) {
    throw new Error('No hay productos en stock para ejecutar validacion de cantidad invalida en carrito API.');
  }

  const candidate = products.find((p: any) => Number(p?.quantity) > 0) || products[0];
  const productId = String(candidate.id || '');
  if (!productId) {
    throw new Error('No se pudo obtener un productId valido para carrito API.');
  }

  await apiRequest(this, 'POST', '/api/cart/items', { productId, quantity: -1 }, true);
});

When('limpio el carrito por API', async function (this: CustomWorld) {
  await apiRequest(this, 'DELETE', '/api/cart', undefined, true);
});

Then('el codigo de respuesta API es {int}', function (this: CustomWorld, status: number) {
  expect(this.state.apiStatus).to.equal(status);
});

Then('la respuesta API incluye token y usuario', function (this: CustomWorld) {
  const body = this.state.apiBody;
  expect(body).to.be.an('object');
  expect(body?.token).to.be.a('string').and.to.have.length.greaterThan(10);
  expect(body?.user).to.be.an('object');
  expect(body?.user?.email).to.be.a('string');
  expect(body?.user?.role).to.be.a('string');
});

Then('la respuesta API de perfil incluye email y rol', function (this: CustomWorld) {
  const body = this.state.apiBody;
  expect(body).to.be.an('object');
  expect(body?.email).to.be.a('string').and.to.have.length.greaterThan(3);
  expect(body?.role).to.be.a('string').and.to.have.length.greaterThan(2);
});

Then('la respuesta API de productos incluye data y meta', function (this: CustomWorld) {
  const body = this.state.apiBody;
  expect(body).to.be.an('object');
  expect(body?.data).to.be.an('array');
  expect(body?.meta).to.be.an('object');
  expect(body?.meta?.page).to.be.a('number');
  expect(body?.meta?.last_page).to.be.a('number');
});

Then('la respuesta API de categorias incluye name y count', function (this: CustomWorld) {
  const body = this.state.apiBody;
  expect(Array.isArray(body)).to.equal(true);

  if (body.length > 0) {
    expect(body[0]).to.have.property('name');
    expect(body[0]).to.have.property('count');
  }
});

Then('la respuesta API de filtros incluye brands', function (this: CustomWorld) {
  const body = this.state.apiBody;
  expect(body).to.be.an('object');
  expect(body?.brands).to.be.an('array');
});

Then('la respuesta API de carrito incluye summary', function (this: CustomWorld) {
  const body = this.state.apiBody;
  expect(body).to.be.an('object');
  expect(body?.data).to.be.an('array');
  expect(body?.summary).to.be.an('object');
  expect(body?.summary?.totalItems).to.be.a('number');
});

Then('el carrito API queda vacio', function (this: CustomWorld) {
  const body = this.state.apiBody;
  expect(body).to.be.an('object');
  expect(body?.data).to.be.an('array').and.to.have.length(0);
  expect(body?.summary?.totalItems).to.equal(0);
});

Then('la respuesta API indica error de stock maximo', function (this: CustomWorld) {
  const body = this.state.apiBody;
  const raw = JSON.stringify(body || {}).toLowerCase();
  expect(raw.includes('stock')).to.equal(true);
});


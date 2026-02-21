# Short Cirkuit Automation Suite

Suite de automatizacion E2E y API para validar los flujos criticos de Short Cirkuit.

## 1. Objetivo del repositorio

Este proyecto existe para detectar regresiones funcionales rapido y con evidencia accionable.

Cobertura principal:
- UI (Playwright + Cucumber): flujos de usuario reales en navegador.
- API (Cucumber): contratos basicos y reglas de negocio de endpoints criticos.

Enfoque:
- Priorizar escenarios de uso diario y de alto impacto de negocio.
- Mantener una suite estable, legible y modular por dominios funcionales.
- Generar reportes y evidencias para debug rapido (screenshot/trace/video segun configuracion).

---

## 2. Que se esta testeando

### 2.1 UI (end-to-end)
Dominios cubiertos actualmente:
- `auth`: login, logout, registro, forgot/reset password, visibilidad de header segun sesion.
- `catalog`: listado, filtros, sort, busqueda, stock.
- `product`: detalle, inquiry, manejo de producto sin stock o SKU invalido.
- `cart`: agregar, incrementar/decrementar, eliminar item, vaciar carrito.
- `checkout`: casos base y negativos.
- `profile`: carga de perfil, tabs, avatar.
- `admin`: panel, tabs, productos (listado/acciones).
- `security`: restricciones para invitados y accesos protegidos.
- `navigation`: rutas y accesos desde header/footer.

### 2.2 API
Cobertura orientada a operacion diaria:
- `auth/security`: login invalido, login valido, `/api/auth/me` con/sin token.
- `catalog contracts`: `/api/products`, `/api/categories`, `/api/filters`, SKU inexistente.
- `cart rules`: contrato de carrito, vaciado, validaciones de payload, limite de stock.
- `admin protection`: bloqueo de endpoints admin para invitado/cliente.

---

## 3. Stack tecnologico

- `TypeScript`
- `@cucumber/cucumber` (BDD + runner)
- `playwright` (automatizacion browser)
- `chai` (assertions)
- `dotenv` (config por entorno)
- `multiple-cucumber-html-reporter` (reporte HTML)

Node requerido:
- `>= 20`

---

## 4. Estructura del proyecto

```text
src/
  features/
    smoke/
      <dominio>/*.feature
    regression/
      <dominio>/*.feature
  steps/
    <dominio>/*.steps.ts
  pages/
    <dominio>/*.ts
    *.ts                    # capa de compatibilidad via re-export
  support/
    env.ts
    world.ts
    hooks.ts
    data.ts
    mailhog.ts
  assets/

scripts/
  clean.cjs
  generate-report.cjs
  create-storage-state.ts

reports/
  index.html
  cucumber-report.json
  screenshots/
  traces/
  videos/

storageStates/
  client.json
  admin.json
```

Dominios usados:
- `api`, `admin`, `auth`, `cart`, `catalog`, `checkout`, `navigation`, `product`, `profile`, `security`, `coverage`

---

## 5. Instalacion y setup

### 5.1 Instalar dependencias
```bash
npm install
npx playwright install
```

### 5.2 Configurar variables de entorno
```bash
cp .env.example .env
```

Config minima recomendada en `.env`:
- `BASE_URL=http://localhost:5173`
- Credenciales para casos autenticados (`TEST_EMAIL`, `TEST_PASSWORD`)
- Credenciales admin si vas a ejecutar escenarios `@auth_admin`

---

## 6. Ejecucion de pruebas

### 6.1 Comandos principales
```bash
npm run test:ui          # todo (UI + API segun tags en features)
npm run test:smoke       # suite minima critica
npm run test:regression  # suite ampliada
npm run test:api         # solo escenarios taggeados con @api
```

Todos los comandos de test ejecutan:
1. `clean`
2. `cucumber-js`
3. `report`

### 6.2 Ejecucion por tags custom
```bash
# ejemplo: solo p0
cross-env TAGS="@p0" cucumber-js --config cucumber.js

# ejemplo: api + p1
cross-env TAGS="@api and @p1" cucumber-js --config cucumber.js
```

### 6.3 Storage state para sesiones autenticadas (UI)
Generar sesiones persistentes para escenarios con `@auth_client` y `@auth_admin`:

```bash
npm run auth:client
npm run auth:admin
```

Archivos generados:
- `storageStates/client.json`
- `storageStates/admin.json`

### 6.4 CI pipelines (GitHub Actions)
Este repo ahora tiene pipelines separadas por tipo de suite:

- `Smoke` -> `.github/workflows/smoke.yml`
- `Regression` -> `.github/workflows/regression.yml`
- `API` -> `.github/workflows/api.yml`

Las 3 usan un workflow reutilizable central:
- `.github/workflows/_run-suite.yml`

Beneficios del enfoque:
- Una sola logica comun de setup/ejecucion.
- Menor duplicacion de YAML.
- Mismo formato de artefactos y evidencias para todas las suites.

Triggers por pipeline:
- `Smoke`:
  - `push` a `main`
  - `pull_request`
  - `workflow_dispatch`
- `Regression`:
  - `push` a `main`
  - `pull_request` hacia `main`
  - `schedule` diario (`0 3 * * *`)
  - `workflow_dispatch`
- `API`:
  - `push` a `main`
  - `pull_request`
  - `workflow_dispatch`

Concurrencia:
- Cada pipeline cancela ejecuciones previas en la misma rama (`cancel-in-progress: true`) para ahorrar minutos de CI.

Artefactos:
- Se sube carpeta `reports/` en cada corrida (incluso fallando).
- Retencion configurada en `14` dias.
- Nombres:
  - `smoke-reports-<run_id>`
  - `regression-reports-<run_id>`
  - `api-reports-<run_id>`

Secrets requeridos en GitHub:
- `BASE_URL`
- `TEST_EMAIL`
- `TEST_PASSWORD`
- `TEST_ADMIN_EMAIL` (necesario para suites UI con storage state admin)
- `TEST_ADMIN_PASSWORD` (necesario para suites UI con storage state admin)

Notas tecnicas:
- `Smoke` y `Regression` generan storage states (`npm run auth:client`, `npm run auth:admin`).
- `API` no genera storage states (`generate_storage_states: false`).
- Retries en CI:
  - `Smoke`: `RETRY=1`
  - `API`: `RETRY=1`
  - `Regression` en `push/PR`: `RETRY=1`
  - `Regression` en `nightly` (`schedule`): `RETRY=2`
- El workflow reutilizable ya incluye:
  - `actions/setup-node@v4` con cache npm
  - instalacion de browsers Playwright
  - creacion de `.env` para CI
  - subida de reportes/evidencia

---

## 7. Tags y priorizacion

Tags base:
- `@smoke`: validacion minima critica.
- `@regression`: cobertura extendida.
- `@api`: escenarios API.
- `@ui`: escenarios UI.

Prioridades:
- `@p0`: flujo core de negocio, rompe operacion.
- `@p1`: importante, impacto medio/alto.
- `@p2`: cobertura complementaria.

Contexto de sesion:
- `@auth_client`: requiere storage state cliente.
- `@auth_admin`: requiere storage state admin.
- `@clean_cart`: limpia carrito al iniciar escenario.

---

## 8. Variables de entorno (referencia)

| Variable | Default | Uso |
|---|---|---|
| `BASE_URL` | `http://localhost:5173` | URL base del frontend objetivo |
| `BROWSER` | `chromium` | Browser Playwright (`chromium`, `firefox`, `webkit`) |
| `HEADLESS` | `true` | Ejecucion con/sin UI |
| `VIEWPORT_WIDTH` | `1440` | Ancho viewport |
| `VIEWPORT_HEIGHT` | `900` | Alto viewport |
| `STEP_TIMEOUT` | `60000` | Timeout por step Cucumber |
| `NAV_TIMEOUT` | `30000` | Timeout navegacion |
| `ACTION_TIMEOUT` | `15000` | Timeout acciones Playwright |
| `EXPECT_TIMEOUT` | `10000` | Timeout waits/asserts |
| `TRACE` | `onfail` | `on`, `onfail`, `off` |
| `VIDEO` | `off` | `on`, `onfail`, `off` |
| `SCREENSHOT` | `onfail` | `on`, `onfail`, `off` |
| `PARALLEL` | `1` | Paralelismo Cucumber |
| `RETRY` | `1` | Reintentos Cucumber por escenario fallido |
| `DETAILED_LOGS` | `true` | Activa logs detallados por step/evento en hooks |
| `LOG_TO_CONSOLE` | `true` | Imprime logs detallados tambien en consola |
| `TEST_EMAIL` | - | Credencial cliente |
| `TEST_PASSWORD` | - | Credencial cliente |
| `TEST_ADMIN_EMAIL` | - | Credencial admin |
| `TEST_ADMIN_PASSWORD` | - | Credencial admin |
| `STOCK_SCAN_LIMIT` | `12` | Maximo de productos a escanear para stock |

---

## 9. Reportes y evidencias

Salida principal:
- `reports/index.html` (reporte navegable)
- `reports/cucumber-report.json` (resultado crudo)

Evidencia por escenario:
- `reports/screenshots/` (si corresponde)
- `reports/screenshots/steps/` (captura exacta al fallar un step)
- `reports/traces/` (muy util para debug Playwright)
- `reports/videos/` (si esta habilitado)
- `reports/logs/` (log tecnico por escenario con steps, navegacion, requests fallidas y respuestas 4xx/5xx)

Notas:
- El script `scripts/generate-report.cjs` normaliza JSON de Cucumber para evitar fallos por formatos concatenados.
- El script `scripts/clean.cjs` limpia artefactos previos antes de cada corrida.

---

## 10. Convenciones de automatizacion

Principios aplicados en este repo:
- POM para encapsular selectores/comportamiento UI.
- Steps centrados en lenguaje de negocio (Gherkin en espanol).
- Asserts orientados a comportamiento observable (no a implementacion interna).
- Selectores resilientes (roles, labels y fallbacks realistas).
- Prioridad a estabilidad y mantenibilidad sobre cantidad de casos.

Reglas practicas:
- Antes de agregar un escenario nuevo, validar que no duplique cobertura existente.
- Para casos de stock/cantidad, evitar supuestos invalidos (ej. incrementar con stock 1).
- Si un comportamiento puede variar por data, hacer asserts de estado controlado, no exact matching fragil.

---

## 11. Guia rapida para agregar pruebas

### 11.1 Nuevo caso UI
1. Crear/editar `.feature` en `src/features/<suite>/<dominio>/`.
2. Implementar step definitions en `src/steps/<dominio>/`.
3. Reusar/extender page object en `src/pages/<dominio>/`.
4. Etiquetar con prioridad (`@p0/@p1/@p2`) y suite (`@smoke/@regression`).

### 11.2 Nuevo caso API
1. Crear escenario en `src/features/regression/api/`.
2. Implementar step en `src/steps/api/api.steps.ts`.
3. Validar status code + contrato minimo + mensaje de error relevante.
4. Evitar casos artificiales sin impacto real de operacion.

---

## 12. Troubleshooting

### `cross-env` no reconocido en PowerShell
Ejecutar via npm scripts (`npm run test:regression`) o usar `npx cucumber-js ...` para corridas manuales.

### Falla por storage state faltante
Generar sesiones:
```bash
npm run auth:client
npm run auth:admin
```

### Falla de reporte HTML por JSON invalido
El generador actual ya contempla casos de JSON concatenado. Si reaparece, revisar `reports/cucumber-report.json` y relanzar:
```bash
npm run report
```

### Escenario flaky por data variable
- Revisar trace en `reports/traces/*.zip`.
- Ajustar precondicion del escenario (ej. producto con stock suficiente).
- Fortalecer selector o condicion de espera en POM/steps.

---

## 13. TL;DR

Si queres correr rapido y ver estado general:

```bash
npm install
npx playwright install
npm run test:regression
```

Y revisar:
- `reports/index.html`


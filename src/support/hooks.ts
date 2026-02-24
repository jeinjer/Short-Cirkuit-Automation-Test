import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  BeforeStep,
  AfterStep,
  Status,
  setDefaultTimeout
} from '@cucumber/cucumber';
import { chromium, firefox, webkit, Browser } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { config } from './env';
import { CustomWorld } from './world';

let browser: Browser | undefined;


setDefaultTimeout((config as any).timeouts?.step ?? 60000);

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function pushLog(world: CustomWorld, line: string) {
  const formatted = `${new Date().toISOString()} | ${line}`;
  world.logs.push(formatted);
  if (config.logging.console) {
    console.log(formatted);
  }
}

function safeName(name: string) {
  return name
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 120);
}

async function getBrowser(): Promise<Browser> {
  if (browser) return browser;

  const launcher =
    config.browser === 'firefox'
      ? firefox
      : config.browser === 'webkit'
        ? webkit
        : chromium;

  browser = await launcher.launch({ headless: config.headless });
  return browser;
}

BeforeAll(async function () {
  ensureDir(path.resolve('reports'));
  ensureDir(path.resolve('reports/screenshots'));
  ensureDir(path.resolve('reports/screenshots/steps'));
  ensureDir(path.resolve('reports/traces'));
  ensureDir(path.resolve('reports/videos'));
  ensureDir(path.resolve('reports/logs'));
  ensureDir(path.resolve('storageStates'));
});

Before(async function (this: CustomWorld, scenario) {
  const b = await getBrowser();

  this.scenarioName = safeName(scenario.pickle.name);
  this.startTime = Date.now();
  this.logs = [];
  this.stepStartedAt = 0;
  this.stepIndex = 0;

  pushLog(this, `SCENARIO_START | ${this.scenarioName}`);

  const tags = (scenario.pickle.tags || []).map((t: any) => t.name);
  let storageStatePath: string | undefined;
  if (tags.includes('@auth_client')) storageStatePath = path.resolve('storageStates/client.json');
  if (tags.includes('@auth_admin')) storageStatePath = path.resolve('storageStates/admin.json');

  if (storageStatePath && !fs.existsSync(storageStatePath)) {
    throw new Error(
      `No existe ${storageStatePath}. Generarlo con:\n` +
      `  npm run auth:client\n` +
      `  npm run auth:admin`
    );
  }

  const recordVideo = config.evidence.video !== 'off';

  const contextOptions: any = {
    viewport: config.viewport,
    recordVideo: recordVideo ? { dir: path.resolve('reports/videos') } : undefined,
    ...(storageStatePath ? { storageState: storageStatePath } : {})
  };

  this.context = await b.newContext(contextOptions);

  this.page = await this.context.newPage();

  if (config.logging.detailed) {
    this.page.on('framenavigated', (frame) => {
      if (frame === this.page.mainFrame()) {
        pushLog(this, `NAVIGATED | ${frame.url()}`);
      }
    });

    this.page.on('requestfailed', (request) => {
      pushLog(
        this,
        `REQUEST_FAILED | ${request.method()} ${request.url()} | ${request.failure()?.errorText || 'unknown'}`
      );
    });

    this.page.on('response', (response) => {
      if (response.status() >= 400) {
        pushLog(this, `RESPONSE_${response.status()} | ${response.request().method()} ${response.url()}`);
      }
    });

    this.page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        pushLog(this, `BROWSER_${msg.type().toUpperCase()} | ${msg.text()}`);
      }
    });
  }

  if (tags.includes('@clean_cart')) {
    try {
      await this.page.goto(`${config.baseUrl}/catalogo`, { waitUntil: 'domcontentloaded', timeout: config.timeouts.nav });

      const cartBtn = this.page.locator('button[title="Carrito"]').first();
      const visible = await cartBtn.isVisible().catch(() => false);
      if (visible) {
        await cartBtn.click();

        const vaciarBtn = this.page.getByRole('button', { name: /^vaciar$/i }).first();
        const emptyText = this.page.getByText(/todavía no agregaste productos al carrito/i).first();

        if (await vaciarBtn.isVisible().catch(() => false)) {
          await vaciarBtn.click();
        }

        await emptyText.waitFor({ state: 'visible', timeout: config.timeouts.expect }).catch(() => {});
      }
    } catch {
    }
  }
  
  this.page.setDefaultTimeout(config.timeouts.action);
  this.page.setDefaultNavigationTimeout(config.timeouts.nav);

  const traceMode = config.evidence.trace;
  const doTrace = traceMode === 'on' || traceMode === 'onfail';
  if (doTrace) {
    await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  }
});

BeforeStep(async function (this: CustomWorld, step) {
  this.stepIndex += 1;
  this.stepStartedAt = Date.now();
  pushLog(this, `STEP_START | ${step.pickleStep?.text || 'unknown step'}`);
});

AfterStep(async function (this: CustomWorld, step) {
  const elapsed = Date.now() - (this.stepStartedAt || Date.now());
  const st = step.result?.status || 'UNKNOWN';
  pushLog(this, `STEP_END | ${step.pickleStep?.text || 'unknown step'} | status=${st} | ${elapsed}ms`);

  if (st === Status.FAILED) {
    const stepName = safeName(step.pickleStep?.text || `step_${this.stepIndex}`);
    const stepSsPath = path.resolve(
      'reports/screenshots/steps',
      `${this.scenarioName}_${this.startTime}_step${this.stepIndex}_${stepName}.png`
    );
    try {
      await this.page.screenshot({ path: stepSsPath, fullPage: true });
      const buf = fs.readFileSync(stepSsPath);
      await this.attach(`STEP_SCREENSHOT: ${stepSsPath}`);
      await this.attach(buf, 'image/png');
    } catch {
    }
  }
});

After(async function (this: CustomWorld, scenario) {
  const status = scenario.result?.status;
  const failed = status === Status.FAILED;

  const artifactId = `${this.scenarioName}_${this.startTime}`;
  const logPath = path.resolve('reports/logs', `${artifactId}.log`);

  if (failed) {
    pushLog(this, `SCENARIO_END | FAILED | ${this.scenarioName}`);
  } else {
    pushLog(this, `SCENARIO_END | PASSED | ${this.scenarioName}`);
  }

  try {
    fs.writeFileSync(logPath, this.logs.join('\n'), 'utf8');
    if (failed) {
      await this.attach(`LOG: ${logPath}`);
      await this.attach(this.logs.join('\n'), 'text/plain');
    }
  } catch {
  }
  const ssMode = config.evidence.screenshot;
  if (ssMode === 'on' || (ssMode === 'onfail' && failed)) {
    const ssPath = path.resolve('reports/screenshots', `${artifactId}.png`);
    try {
      await this.page.screenshot({ path: ssPath, fullPage: true });
      const buf = fs.readFileSync(ssPath);
      await this.attach(buf, 'image/png');
    } catch {
    }
  }
  const traceMode = config.evidence.trace;
  if (traceMode === 'on' || (traceMode === 'onfail' && failed)) {
    const tracePath = path.resolve('reports/traces', `${artifactId}.zip`);
    try {
      await this.context.tracing.stop({ path: tracePath });
      await this.attach(`TRACE: ${tracePath}`);
    } catch {
    }
  } else {
    try {
      await this.context.tracing.stop();
    } catch {
    }
  }
  const videoMode = config.evidence.video;
  const video = this.page.video();

  try {
    await this.page.close();
  } catch {
  }

  try {
    await this.context.close();
  } catch {
  }

  if (video && videoMode === 'onfail' && !failed) {
    try {
      const p = await video.path();
      if (p && fs.existsSync(p)) fs.unlinkSync(p);
    } catch {
    }
  }
});

AfterAll(async function () {
  try {
    await browser?.close();
  } finally {
    browser = undefined;
  }
});

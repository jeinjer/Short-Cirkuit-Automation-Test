import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';


const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  
  dotenv.config();
}

function bool(v: string | undefined, def: boolean): boolean {
  if (v === undefined) return def;
  return ['1', 'true', 'yes', 'y', 'on'].includes(v.toLowerCase());
}

function num(v: string | undefined, def: number): number {
  if (v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export type EvidenceMode = 'on' | 'onfail' | 'off';
export type TraceMode = 'on' | 'onfail' | 'off';
export type BrowserName = 'chromium' | 'firefox' | 'webkit';

export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',

  limits: {
    stockScan: num(process.env.STOCK_SCAN_LIMIT, 12)
  },

  browser: (process.env.BROWSER || 'chromium') as BrowserName,
  headless: bool(process.env.HEADLESS, true),
  viewport: {
    width: num(process.env.VIEWPORT_WIDTH, 1440),
    height: num(process.env.VIEWPORT_HEIGHT, 900)
  },

  timeouts: {
    step: num(process.env.STEP_TIMEOUT, 60000),
    nav: num(process.env.NAV_TIMEOUT, 30000),
    action: num(process.env.ACTION_TIMEOUT, 15000),
    expect: num(process.env.EXPECT_TIMEOUT, 10000)
  },

  evidence: {
    trace: (process.env.TRACE || 'onfail') as TraceMode,
    video: (process.env.VIDEO || 'off') as EvidenceMode,
    screenshot: (process.env.SCREENSHOT || 'onfail') as EvidenceMode
  },

  logging: {
    detailed: bool(process.env.DETAILED_LOGS, true),
    console: bool(process.env.LOG_TO_CONSOLE, true)
  },

  creds: {
    userEmail: process.env.TEST_EMAIL || '',
    userPassword: process.env.TEST_PASSWORD || '',
    adminEmail: process.env.TEST_ADMIN_EMAIL || '',
    adminPassword: process.env.TEST_ADMIN_PASSWORD || ''
  }
};

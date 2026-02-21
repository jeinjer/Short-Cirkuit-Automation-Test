import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import type { Browser, BrowserContext, Page } from 'playwright';

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  // scenario-scoped metadata
  scenarioName = '';
  startTime = Date.now();
  logs: string[] = [];
  stepStartedAt = 0;
  stepIndex = 0;

  state: {
  productName?: string;
  orderId?: string;
  generatedEmail?: string;
  generatedPassword?: string;
  searchTerm?: string;
  qtyBefore?: number;
  qtyAfter?: number;
  itemsBefore?: number;
  itemsAfter?: number;
  apiToken?: string;
  apiStatus?: number;
  apiBody?: any;
  apiProductId?: string;
  apiProductStock?: number;
  } = {};

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);

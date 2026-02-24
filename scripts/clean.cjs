const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const targets = [
  path.resolve('reports/json'),
  path.resolve('reports/screenshots'),
  path.resolve('reports/logs'),
  path.resolve('reports/videos'),
  path.resolve('reports/index.html'),
  path.resolve('reports/index.json'),
  path.resolve('reports/cucumber-report.json'),
  path.resolve('reports/.cucumber-json'),
  path.resolve('.playwright'),
];

async function rmSafe(p) {
  try {
    await fsp.rm(p, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  } catch {
  }
}

(async () => {
  for (const t of targets) await rmSafe(t);
  fs.mkdirSync(path.resolve('reports'), { recursive: true });
  fs.mkdirSync(path.resolve('reports/json'), { recursive: true });
  fs.mkdirSync(path.resolve('reports/screenshots'), { recursive: true });
  fs.mkdirSync(path.resolve('reports/logs'), { recursive: true });
  fs.mkdirSync(path.resolve('reports/traces'), { recursive: true });
  fs.mkdirSync(path.resolve('reports/videos'), { recursive: true });
})();

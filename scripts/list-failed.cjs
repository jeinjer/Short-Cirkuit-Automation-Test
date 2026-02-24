const fs = require('fs');
const path = require('path');

const candidates = [
  path.resolve('reports', 'cucumber-report.json'),
  path.resolve('reports', '.cucumber-json', 'cucumber-report.json'),
];

function parseConcatenatedJson(raw) {
  const text = String(raw || '').replace(/^\uFEFF/, '');
  const chunks = [];
  let i = 0;

  while (i < text.length) {
    while (i < text.length && !['[', '{'].includes(text[i])) i++;
    if (i >= text.length) break;

    const start = i;
    const stack = [text[i]];
    let inString = false;
    let escaped = false;
    i++;

    while (i < text.length && stack.length > 0) {
      const ch = text[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === '"') inString = false;
      } else {
        if (ch === '"') inString = true;
        else if (ch === '[' || ch === '{') stack.push(ch);
        else if (ch === ']' || ch === '}') {
          const open = stack[stack.length - 1];
          if ((open === '[' && ch === ']') || (open === '{' && ch === '}')) {
            stack.pop();
          }
        }
      }
      i++;
    }

    const chunk = text.slice(start, i).trim();
    if (chunk) chunks.push(JSON.parse(chunk));
  }

  return chunks;
}

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    const chunks = parseConcatenatedJson(raw);
    const merged = [];
    for (const chunk of chunks) {
      if (Array.isArray(chunk)) merged.push(...chunk);
      else merged.push(chunk);
    }
    return merged;
  }
}

const existingCandidates = candidates
  .filter((p) => fs.existsSync(p))
  .map((p) => ({ path: p, mtimeMs: fs.statSync(p).mtimeMs }))
  .sort((a, b) => b.mtimeMs - a.mtimeMs);

const filePath = existingCandidates[0]?.path;
if (!filePath) {
  console.log('[failed] No se encontro reporte. Ejecuta tests primero.');
  process.exit(1);
}

const results = loadJson(filePath);
let failedCount = 0;

for (const feature of results) {
  if (!feature || !Array.isArray(feature.elements)) continue;

  for (const scenario of feature.elements) {
    if (!scenario || !Array.isArray(scenario.steps)) continue;
    const failedSteps = scenario.steps.filter(
      (step) => step?.result?.status === 'failed'
    );
    const failedBeforeHooks = Array.isArray(scenario.before)
      ? scenario.before.filter((hook) => hook?.result?.status === 'failed')
      : [];
    const failedAfterHooks = Array.isArray(scenario.after)
      ? scenario.after.filter((hook) => hook?.result?.status === 'failed')
      : [];

    if (!failedSteps.length && !failedBeforeHooks.length && !failedAfterHooks.length) {
      continue;
    }
    failedCount++;

    console.log(`FEATURE: ${feature.name || '(sin nombre)'}`);
    console.log(`SCENARIO: ${scenario.name || '(sin nombre)'}`);
    if (feature.uri) console.log(`FILE: ${feature.uri}`);

    for (const step of failedSteps) {
      console.log(`  STEP: ${step.keyword || ''}${step.name || ''}`);
      if (step.result?.error_message) {
        const firstLine = String(step.result.error_message).split('\n')[0];
        console.log(`  ERROR: ${firstLine}`);
      }
    }
    for (const hook of failedBeforeHooks) {
      console.log('  HOOK: before');
      if (hook.result?.error_message) {
        const firstLine = String(hook.result.error_message).split('\n')[0];
        console.log(`  ERROR: ${firstLine}`);
      }
    }
    for (const hook of failedAfterHooks) {
      console.log('  HOOK: after');
      if (hook.result?.error_message) {
        const firstLine = String(hook.result.error_message).split('\n')[0];
        console.log(`  ERROR: ${firstLine}`);
      }
    }
    console.log('');
  }
}

if (!failedCount) {
  console.log('[failed] No hay escenarios fallidos en el reporte actual.');
  process.exit(0);
}

console.log(`[failed] Fuente: ${filePath}`);
console.log(`[failed] Escenarios fallidos: ${failedCount}`);

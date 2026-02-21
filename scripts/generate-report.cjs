const fs = require('fs');
const path = require('path');
const report = require('multiple-cucumber-html-reporter');

const jsonPath = path.resolve('reports', 'cucumber-report.json');
if (!fs.existsSync(jsonPath)) {
  console.log('[report] No cucumber JSON found at', jsonPath);
  process.exit(0);
}

const jsonDir = path.resolve('reports', '.cucumber-json');
fs.mkdirSync(jsonDir, { recursive: true });

for (const file of fs.readdirSync(jsonDir)) {
  if (file.toLowerCase().endsWith('.json')) {
    fs.unlinkSync(path.join(jsonDir, file));
  }
}

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
        if (escaped) {
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
        } else if (ch === '"') {
          inString = false;
        }
      } else {
        if (ch === '"') {
          inString = true;
        } else if (ch === '[' || ch === '{') {
          stack.push(ch);
        } else if (ch === ']' || ch === '}') {
          const open = stack[stack.length - 1];
          if ((open === '[' && ch === ']') || (open === '{' && ch === '}')) {
            stack.pop();
          }
        }
      }
      i++;
    }

    const chunk = text.slice(start, i).trim();
    if (chunk) {
      chunks.push(JSON.parse(chunk));
    }
  }

  return chunks;
}

function loadCucumberResults(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    const parsedChunks = parseConcatenatedJson(raw);
    if (!parsedChunks.length) throw new Error('No se pudo parsear cucumber-report.json');

    const merged = [];
    for (const chunk of parsedChunks) {
      if (Array.isArray(chunk)) merged.push(...chunk);
      else merged.push(chunk);
    }
    return merged;
  }
}

const normalized = loadCucumberResults(jsonPath)
  .filter((item) => item && typeof item === 'object' && Array.isArray(item.elements))
  .map((feature, idx) => ({
    ...feature,
    uri: feature.uri || feature.id || `feature-${idx + 1}.feature`,
  }));
const normalizedPath = path.join(jsonDir, 'cucumber-report.json');
fs.writeFileSync(normalizedPath, JSON.stringify(normalized, null, 2), 'utf8');

report.generate({
  jsonDir,
  reportPath: path.resolve('reports'),
  reportName: 'UI Automation Report',
  pageTitle: 'UI Automation Report',
  displayDuration: true,
  metadata: {
    browser: {
      name: process.env.BROWSER || 'chromium'
    },
    device: 'local',
    platform: {
      name: process.platform
    }
  },
  customData: {
    title: 'Run info',
    data: [
      { label: 'Base URL', value: process.env.BASE_URL || '' },
      { label: 'Headless', value: String(process.env.HEADLESS || '') },
      { label: 'Trace', value: String(process.env.TRACE || '') },
      { label: 'Video', value: String(process.env.VIDEO || '') }
    ]
  }
});

console.log('[report] HTML generated at', path.resolve('reports', 'index.html'));

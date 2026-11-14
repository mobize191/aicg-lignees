// fill-assets-manifest-v34.mjs — construit assets-v34.json depuis tools/out-v2/v34/*.jpg (base64 embarqué)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const OUT = ROOT + 'tools/out-v2/v34';

const v33 = JSON.parse(readFileSync(ROOT + 'assets-v33.json', 'utf8'));
const art = {};

// Fonds repris de v33
for (const [k, v] of Object.entries(v33.bg || {})) art['bg-' + k] = v;

// Images v34
const files = readdirSync(OUT).filter(f => f.endsWith('.jpg') && !f.includes('/'));
for (const f of files) {
  const id = f.replace('.jpg', '');
  const b64 = readFileSync(OUT + '/' + f).toString('base64');
  art[id] = 'data:image/jpeg;base64,' + b64;
}

const manifest = { art, bg: v33.bg || {} };
writeFileSync(ROOT + 'assets-v34.json', JSON.stringify(manifest));
console.log('assets-v34.json:', files.length, 'images,', (JSON.stringify(manifest).length / 1024 / 1024).toFixed(1), 'Mo');

// patch-assets-v34-retry2.mjs — remplace UNIQUEMENT les clés existantes de assets-v34.json
// par les nouveaux jpg du retry ciblé (aucune nouvelle clé). Vérifie avant/après.
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const OUT = ROOT + 'tools/out-v2/v34';
const TAGS = ['e31-r', 'e31-o', 'e14-r'];

const manifest = JSON.parse(readFileSync(ROOT + 'assets-v34.json', 'utf8'));
const before = Object.keys(manifest.art).length;

for (const tag of TAGS) {
  if (!(tag in manifest.art)) throw new Error('clé absente avant patch: ' + tag);
  const oldLen = manifest.art[tag].length;
  const b64 = readFileSync(OUT + '/' + tag + '.jpg').toString('base64');
  manifest.art[tag] = 'data:image/jpeg;base64,' + b64;
  console.log(tag, 'remplacé (avant', (oldLen / 1024).toFixed(0) + 'Ko -> après', (b64.length / 1024).toFixed(0) + 'Ko)');
}

const after = Object.keys(manifest.art).length;
if (before !== after) throw new Error('nombre de clés changé ! ' + before + ' -> ' + after);

writeFileSync(ROOT + 'assets-v34.json', JSON.stringify(manifest));
console.log('assets-v34.json :', after, 'clés (inchangé),', (JSON.stringify(manifest).length / 1024 / 1024).toFixed(1), 'Mo');

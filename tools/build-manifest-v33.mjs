// build-manifest-v33.mjs — construit assets-v33.json (set complet vague 3.3 depuis tools/out-v2/v33),
// assets-v32.json (set complet vague 3.2 depuis tools/out-v2/v32) et ajoute les arts existant
// dans une seule version (les 37 cartes de la 3.3) au manifeste par défaut assets-v3.json.
// Format identique : { art: {id: dataURI}, bg: {donjon: dataURI} }.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

const dataUri = (dir, f) => 'data:image/jpeg;base64,' + readFileSync(dir + '/' + f).toString('base64');
const idOf = (f) => f.replace(/\.jpe?g$/, '');

function buildSet(dir) {
  const art = {};
  const bg = {};
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.jpg'))) {
    if (f.startsWith('bg-')) bg[idOf(f).replace(/^bg-/, '')] = dataUri(dir, f);
    else art[idOf(f)] = dataUri(dir, f);
  }
  return { art, bg };
}

// --- assets-v33.json : set complet 3.3 (271 relancées + 37 nouvelles + 6 fonds) ---
const V33 = ROOT + 'tools/out-v2/v33';
if (!existsSync(V33)) throw new Error('tools/out-v2/v33 absent — génération 3.3 non terminée');
const s33 = buildSet(V33);
writeFileSync(ROOT + 'assets-v33.json', JSON.stringify({ art: s33.art, bg: s33.bg }));
console.log('assets-v33.json :', Object.keys(s33.art).length, 'arts +', Object.keys(s33.bg).length, 'fonds');

// --- assets-v32.json : set complet 3.2 depuis out-v2/v32, fonds manquants repris de v3.0 ---
const V32 = ROOT + 'tools/out-v2/v32';
const v3 = JSON.parse(readFileSync(ROOT + 'assets-v3.json', 'utf8'));
const s32 = buildSet(V32);
for (const [k, v] of Object.entries(v3.bg ?? {})) if (!s32.bg[k]) s32.bg[k] = v;
writeFileSync(ROOT + 'assets-v32.json', JSON.stringify({ art: s32.art, bg: s32.bg }));
console.log('assets-v32.json :', Object.keys(s32.art).length, 'arts +', Object.keys(s32.bg).length, 'fonds');

// --- assets-v3.json (défaut) : ajout des arts existant uniquement en 3.3 (les 37 cartes) ---
const NEW37 = ['c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11','c12','c13','c14','p5','p6',
  'w1','w2','w3','w4','w5','w6','w7','w8','w9','w10','w11','w12','w13','w14','w15','w16','w17','w18','w19','w20','w21'];
let added = 0;
for (const id of NEW37) {
  if (s33.art[id] && !v3.art[id]) { v3.art[id] = s33.art[id]; added++; }
}
writeFileSync(ROOT + 'assets-v3.json', JSON.stringify(v3));
console.log('assets-v3.json :', Object.keys(v3.art).length, 'arts (dont', added, 'nouveaux 3.3-only) +', Object.keys(v3.bg ?? {}).length, 'fonds');

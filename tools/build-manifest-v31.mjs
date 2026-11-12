// build-manifest-v31.mjs — construit le manifeste v3.1 et met à jour le manifeste v3.0 (défaut).
//  - assets-v3.1.json : set complet 3.1 = 265 arts vague 3.1 (tools/out-v2/v31) + 7 cartes série 3
//    + 90 arts d'équipement (tools/out-v2/s3) + 6 fonds 3.1, plus les 2 fonds non régénérés repris de v3.0.
//  - assets-v3.json (v3.0, source par défaut) : on y ajoute UNIQUEMENT les assets n'existant que dans
//    la 3.1 (7 cartes série 3 + 90 équipements) -> présents par défaut partout, le switch ne les retire pas.
// Format identique au manifeste v3 : { art: {id: dataURI}, bg: {donjon: dataURI} }.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const V31 = ROOT + 'tools/out-v2/v31';
const S3 = ROOT + 'tools/out-v2/s3';

const dataUri = (dir, f) =>
  'data:image/jpeg;base64,' + readFileSync(dir + '/' + f).toString('base64');
const idOf = (f) => f.replace(/\.jpe?g$/, '');

// --- v3.1 : set complet ---
const v3 = JSON.parse(readFileSync(ROOT + 'assets-v3.json', 'utf8'));
const art31 = {};
const bg31 = {};
for (const f of readdirSync(V31).filter((f) => f.endsWith('.jpg'))) {
  if (f.startsWith('bg-')) bg31[idOf(f).replace(/^bg-/, '')] = dataUri(V31, f); // clés = id de donjon, comme v3.0
  else art31[idOf(f)] = dataUri(V31, f);
}
const newOnly = {}; // assets existant seulement en 3.1 (cartes série 3 + équipement)
for (const f of readdirSync(S3).filter((f) => f.endsWith('.jpg'))) {
  art31[idOf(f)] = dataUri(S3, f);
  newOnly[idOf(f)] = art31[idOf(f)];
}
// fonds non régénérés en 3.1 : repris du manifeste v3.0
for (const [k, v] of Object.entries(v3.bg ?? {})) if (!bg31[k]) bg31[k] = v;

writeFileSync(ROOT + 'assets-v3.1.json', JSON.stringify({ art: art31, bg: bg31 }));
console.log('assets-v3.1.json :', Object.keys(art31).length, 'arts +', Object.keys(bg31).length, 'fonds');

// --- v3.0 (défaut) : ajout des assets 3.1-only ---
for (const [id, uri] of Object.entries(newOnly)) if (!v3.art[id]) v3.art[id] = uri;
writeFileSync(ROOT + 'assets-v3.json', JSON.stringify(v3));
console.log('assets-v3.json :', Object.keys(v3.art).length, 'arts (dont', Object.keys(newOnly).length, 'nouveaux 3.1-only) +', Object.keys(v3.bg ?? {}).length, 'fonds');

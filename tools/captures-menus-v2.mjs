// tools/captures-menus-v2.mjs — lot 7 menus v2 : captures avant/après par écran du hub.
// Le sandbox n'a pas de Chromium : les « captures » sont des snapshots DOM rendus par le
// harnais stub (bootDist) à la taille de référence 390x844 (métadonnées viewport consignées).
// À rejouer avec Playwright côté CI pour de vraies captures pixel.
// Usage : node tools/captures-menus-v2.mjs <dist-avant.html> <dist-apres.html> <sortie-dir>
import { bootDist, wait } from '../stub.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const [avant, apres, outDir] = process.argv.slice(2);
const ROUTES = ['#accueil', '#equipe', '#personnage', '#collection', '#forge', '#autel', '#donjons', '#quetes', '#terres', '#boutique', '#inventaire', '#glossaire'];
const VIEWPORT = '390x844';

async function snap(file, tag) {
  const { api, els } = bootDist(file);
  const out = [];
  for (const r of ROUTES) {
    api.go(r);
    await wait(25);
    const app = els.get('app');
    const html = (app?._innerHTML ?? '') + `\n<!-- snapshot live: back=${!!app?.querySelector('.back')} btns=${app?.querySelectorAll('.btn').length ?? 0} -->\n`;
    out.push({ route: r, html });
  }
  return out;
}

const a = await snap(avant, 'avant');
const b = await snap(apres, 'apres');
mkdirSync(outDir, { recursive: true });
for (let i = 0; i < ROUTES.length; i++) {
  const r = ROUTES[i].slice(1);
  writeFileSync(`${outDir}/avant-${r}-${VIEWPORT}.html`, a[i].html);
  writeFileSync(`${outDir}/apres-${r}-${VIEWPORT}.html`, b[i].html);
}
writeFileSync(`${outDir}/README.md`, `# Captures menus v2 (lot 7, ${VIEWPORT})

Snapshots DOM rendus par le harnais stub (bootDist) — le sandbox n'a pas de Chromium ;
à rejouer avec Playwright (390x844) pour des captures pixel. Avant = dist du commit lot 6,
après = dist du lot 7 (cibles tactiles 44px, retour au clic systématique, mobile 520px).
`);
const diff = ROUTES.filter((r, i) => a[i].html !== b[i].html);
console.log(`captures: ${ROUTES.length} écrans x2 -> ${outDir}`);
console.log('écrans modifiés par le lot 7 :', diff.map((r) => r.slice(1)).join(', ') || 'aucun (inchangé)');

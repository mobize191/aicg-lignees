// tools/audit.mjs : l'audit se genere depuis les donnees (ACC-5-1, EXI-P5-1)
import { readFileSync } from 'node:fs';
const load = (f) => JSON.parse(readFileSync(`data/${f}.json`, 'utf8'));
const grimoire = load('grimoire'), fusion = load('fusion-map'), schools = load('schools'), monsters = load('monsters');
const out = ['# Audit des sorts (genere depuis data/)', ''];
out.push(`Genere par \`node tools/audit.mjs\` — ne pas éditer à la main.`, '');
out.push('## Le grimoire');
out.push(`- communs : ${grimoire.communs.length}, sorts de race : ${grimoire.race.length}, entrées d'école : ${grimoire.entrees.length}`);
out.push(`- sorts de lignée référencés : ${grimoire.lignee.length} (7 familles x 6 paliers)`);
out.push(`- sorts d'école à crans : ${grimoire.ecole.length}, uniques : ${grimoire.uniques.length}`);
out.push(`- écoles : ${Object.keys(schools).length} (${Object.values(schools).map((s) => s.nom).join(', ')})`, '');
out.push('## Les crans des sorts d\u2019école');
for (const s of grimoire.ecole) {
  const crans = Object.entries(s.crans).map(([c, v]) => v.vide ? `${c}: vide` : `${c}: ${v.cout}\u2726 L${v.largeur}${v.mult ? ' x' + v.mult : ''}${v.taux ? ' ' + Math.round(v.taux * 100) + '%' : ''}`).join(' | ');
  out.push(`- ${s.nom} (${s.ecole}, ${s.role}) : ${crans}`);
}
out.push('', '## La fusion par biome');
for (const [biome, b] of Object.entries(fusion)) {
  if (!b.trie) { out.push(`- ${biome} : non trie (chemin legacy)`); continue; }
  const sigs = Object.values(b.signatures);
  const total = monsters.filter((m) => m.dungeon === biome).length;
  const uniques = sigs.filter((s) => s.unique).length;
  out.push(`- ${biome} : ${sigs.length}/${total} signatures résolues (${uniques} uniques, ${sigs.length - uniques} fondues)`);
}
console.log(out.join('\n'));

// Genere les tableaux de reference depuis data/*.json : docs/tables/{cartes,sorts,monstres,monde}.md
// Usage : node tools/gen-tables.mjs   (a relancer apres CHAQUE evolution des data, puis commit)
// Regle : ces tableaux sont GENERES, on ne les edite jamais a la main.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const D = 'data/';
const O = 'docs/tables/';
mkdirSync(O, { recursive: true });
const load = (f) => JSON.parse(readFileSync(D + f, 'utf8'));
const T = (v) => (v === undefined || v === null || v === '' ? '-' : String(v));
const esc = (s) => T(s).replace(/\|/g, '\\|');
const row = (cells) => '| ' + cells.map(esc).join(' | ') + ' |';
const head = (cols) => row(cols) + '\n' + row(cols.map(() => '---'));
const NA = 'GENERE DEPUIS data/*.json PAR tools/gen-tables.mjs : NE PAS EDITER A LA MAIN. Relancer le script apres chaque evolution des data, puis commit.';
const byId = (cards, id) => cards.find((c) => c.id === id);

// ============================== cartes.md ==============================
const cards = load('cards.json');
const schools = load('schools.json');
const families = load('families.json');
const evolutions = load('evolutions.json');
const soloSteps = load('solo-steps.json');
let out = [];
out.push('# Tableau des cartes', '', '> ' + NA, '');
const cls = {};
cards.forEach((c) => { (cls[c.classe] = cls[c.classe] || []).push(c); });
out.push('**' + cards.length + ' cartes jouables** (data/cards.json), reparties : ' +
  Object.keys(cls).sort().map((k) => k + ' ' + cls[k].length).join(', ') + '.', '');
out.push('Le sort signature est le `soloSpell` ; l\'effet est le champ `effect` (kind + valeur). L\'element et la famille sont absents des cartes non-elementaires.', '');
for (const k of Object.keys(cls).sort()) {
  out.push('## Classe ' + k + ' (' + cls[k].length + ')', '');
  out.push(head(['id', 'nom', 'rarete', 'element', 'role', 'ATQ', 'PV', 'AGI', 'INT', 'famille', 'sort signature', 'effet']));
  cls[k].sort((a, b) => a.id.localeCompare(b.id)).forEach((c) => {
    out.push(row([c.id, c.name, c.rarity, c.element, c.role, c.atk, c.hp, c.agi, c.int, c.family, c.soloSpell,
      c.effect ? c.effect.kind + (c.effect.value !== undefined ? ' ' + c.effect.value : '') + (c.effect.ttl ? ' (ttl ' + c.effect.ttl + ')' : '') : '-']));
  });
  out.push('');
}
out.push('## Familles de lignee (data/families.json)', '');
out.push('Une famille = un chemin de cartes (steps) qui monte en rarete. `future` liste les extensions prevues par la spec v3.', '');
out.push(head(['famille', 'nom', 'etapes (cartes)', 'future']));
for (const [fid, f] of Object.entries(families)) {
  out.push(row([fid, f.name, f.steps.map((id) => (byId(cards, id) ? id + ' ' + byId(cards, id).name : id)).join(' -> '), (f.future || []).join(', ')]));
}
out.push('');
out.push('## Evolutions (data/evolutions.json)', '');
out.push('Les cartes a choix listent chaque voie possible ; l\'evolution exige le niveau 10 et des eclats (EVO_COST).', '');
out.push(head(['carte', 'evolue vers', 'voie']));
for (const [from, tos] of Object.entries(evolutions)) {
  const a = byId(cards, from);
  for (const ch of (Array.isArray(tos) ? tos : [tos])) {
    const b = byId(cards, ch.to);
    out.push(row([from + (a ? ' ' + a.name : ''), ch.to + (b ? ' ' + b.name : ''), ch.voie]));
  }
}
out.push('', '## Soudures solos (data/solo-steps.json)', '');
out.push('Les solos sans voie montent d\'un cran au palier indique.', '');
out.push(head(['carte', 'evolue vers', 'rarete']));
for (const [from, to] of Object.entries(soloSteps)) {
  const a = byId(cards, from), b = byId(cards, to);
  out.push(row([from + (a ? ' ' + a.name : ''), to + (b ? ' ' + b.name : ''), T(b ? b.rarity : '')]));
}
out.push('');
writeFileSync(O + 'cartes.md', out.join('\n') + '\n');

// ============================== sorts.md ==============================
const grimoire = load('grimoire.json');
const fusion = load('fusion-map.json');
const lineageSpells = load('lineage-spells.json');
out = [];
out.push('# Tableau des sorts', '', '> ' + NA, '');
out.push('Les sorts vivent dans data/grimoire.json en six categories : ' +
  '`communs` (' + grimoire.communs.length + '), `entrees` (' + grimoire.entrees.length + '), `race` (' + grimoire.race.length + '), `ecole` (' + grimoire.ecole.length + '), `lignee` (' + grimoire.lignee.length + '), `uniques` (' + grimoire.uniques.length + ').', '');
const catTable = (titre, arr, cols, fn) => {
  out.push('## ' + titre + ' (' + arr.length + ')', '');
  out.push(head(cols));
  arr.forEach((s) => out.push(row(fn(s))));
  out.push('');
};
catTable('Sorts communs', grimoire.communs, ['id', 'nom', 'ecole', 'role', 'cible', 'cout', 'mult', 'description'],
  (s) => [s.id, s.nom, s.ecole, s.role, s.cible, s.cout, s.mult, s.desc]);
catTable('Sorts d\'entree de classe', grimoire.entrees, ['id', 'nom', 'classe', 'ecole', 'role', 'cible', 'cout', 'mult', 'description'],
  (s) => [s.id, s.nom, s.classe, s.ecole, s.role, s.cible, s.cout, s.mult, s.desc]);
catTable('Sorts de race', grimoire.race, ['id', 'nom', 'race', 'ecole', 'role', 'cible', 'cout', 'mult', 'description'],
  (s) => [s.id, s.nom, s.race, s.ecole, s.role, s.cible, s.cout, s.mult, s.desc]);
out.push('## Sorts d\'ecolage (' + grimoire.ecole.length + ')', '');
out.push('Appris en ecolant une zone. Le `cran` monte le cout et la largeur (cibles contigues, ou `equipe`/`equipe-renforcee`).', '');
out.push(head(['id', 'nom', 'ecole', 'role', 'cible', 'crans (cout / largeur / effet)']));
const cranStr = (v) => {
  const parts = [T(v.cout) + ' / ' + T(v.largeur)];
  if (v.mult !== undefined) parts.push('x' + v.mult);
  else if (v.taux !== undefined) parts.push('taux ' + Math.round(v.taux * 100) + '%' + (v.tours ? ', ' + v.tours + ' tour(s)' : ''));
  else if (v.vide) parts.push('VIDE : ' + T(v.raison));
  return parts.join(' ; ');
};
grimoire.ecole.forEach((s) => {
  const crans = s.crans ? Object.entries(s.crans).map(([k, v]) => k + ' : ' + cranStr(v)).join(' ; ') : T(s.cout) + ' / ' + T(s.cible) + ' / x' + T(s.mult);
  out.push(row([s.id, s.nom, s.ecole, s.role, s.cible, crans]));
});
out.push('');
out.push('## Sorts de lignee (' + grimoire.lignee.length + ')', '');
out.push('Un sort par palier de famille, appris en montant la lignee.', '');
out.push(head(['famille', 'palier', 'sort', 'cout', 'mult', 'big', 'description']));
grimoire.lignee.forEach((s) => out.push(row([s.famille, s.palier, s.sort, s.cout, s.mult, s.big, s.desc])));
out.push('');
catTable('Sorts uniques', grimoire.uniques, ['id', 'nom', 'carte porteuse', 'role', 'cible', 'cout', 'mult', 'description'],
  (s) => [s.id, s.nom, s.carte, s.role, s.cible, s.cout, s.mult, s.desc]);
out.push('## Ecoles (data/schools.json)', '');
out.push('Les verrous d\'ouverture : une ecole s\'ouvre par PROFIL (classe de carte) ou par VOIE (choix d\'eveil).', '');
out.push(head(['ecole', 'nom', 'role', 'profils', 'voies']));
for (const [sid, s] of Object.entries(schools)) {
  out.push(row([sid, s.nom, s.role, (s.ouvrePar.profils || []).join(', '), (s.ouvrePar.voies || []).join(', ')]));
}
out.push('');
out.push('## Catalogue brut par famille (data/lineage-spells.json)', '');
out.push(head(['famille', 'sorts (nom)']));
for (const [fam, arr] of Object.entries(lineageSpells)) {
  out.push(row([fam, arr.map((s) => s.name).join(' / ')]));
}
out.push('');
out.push('## Fusions de monstres (data/fusion-map.json)', '');
out.push('Fusionner un monstre enseigne son sort (`fusion`) a un cran donne.', '');
for (const [dg, m] of Object.entries(fusion)) {
  if (!m.signatures) continue;
  out.push('### Donjon ' + dg, '');
  out.push(head(['monstre', 'sort appris', 'cran']));
  for (const [mid, sig] of Object.entries(m.signatures)) out.push(row([mid, sig.fusion, sig.cran]));
  out.push('');
}
writeFileSync(O + 'sorts.md', out.join('\n') + '\n');

// ============================== monstres.md ==============================
const monsters = load('monsters.json');
const monsterFamilies = load('monster-families.json');
out = [];
out.push('# Tableau des monstres', '', '> ' + NA, '');
out.push('**' + monsters.length + ' monstres** (data/monsters.json), par donjon. La classe determine les memes regles que les cartes (esquive, frappe a l\'arriere).', '');
const dgs = {};
monsters.forEach((m) => { (dgs[m.dungeon] = dgs[m.dungeon] || []).push(m); });
for (const dg of Object.keys(dgs).sort()) {
  out.push('## Donjon ' + dg + ' (' + dgs[dg].length + ')', '');
  out.push(head(['id', 'nom', 'rarete', 'classe', 'element', 'role', 'ATQ', 'PV', 'AGI', 'INT', 'sort solo', 'effet']));
  dgs[dg].sort((a, b) => a.id.localeCompare(b.id)).forEach((m) => {
    out.push(row([m.id, m.name, m.rarity, m.classe, m.element, m.role, m.atk, m.hp, m.agi, m.int, m.soloSpell,
      m.effect ? m.effect.kind + (m.effect.value !== undefined ? ' ' + m.effect.value : '') : '-']));
  });
  const mf = monsterFamilies[dg];
  if (mf) {
    out.push('', '### Lignees de monstres du donjon (data/monster-families.json)', '');
    out.push(head(['lignee', 'lignes', 'side', 'mythique']));
    mf.forEach((f) => out.push(row([f.name, f.lines.map((l) => l.join(' -> ')).join(' ; '), (f.side || []).join(', '), f.mythic])));
  }
  out.push('');
}
writeFileSync(O + 'monstres.md', out.join('\n') + '\n');

// ============================== monde.md ==============================
const engine = load('engine.json');
const dungeons = load('dungeons.json');
const difficulties = load('difficulties.json');
const runMods = load('run-mods.json');
const keywords = load('keywords.json');
const zones = load('zones.json');
const trees = load('trees.json');
const synergies = load('synergies.json');
out = [];
out.push('# Le monde et les constantes du moteur', '', '> ' + NA, '');
out.push('## Constantes du moteur (data/engine.json)', '');
out.push('Ce fichier est LA source de verite du moteur : aucune valeur de design ne vit dans src/ (test allowlist).', '');
out.push(head(['constante', 'valeur']));
const engShow = ['CLASSES', 'ELEMENTS', 'RACES', 'RACE_LABEL', 'BEATS', 'BEATEN_BY', 'PALIERS', 'RARITY_POWER', 'FAMILY_MANA', 'MONSTER_MANA', 'SOLO_MANA', 'EVO_COST', 'TEAM_MAX', 'LEVEL_CAP', 'DMG_REDUCTION_MAX', 'SAVE_VERSION', 'VERSION'];
for (const k of engShow) if (engine[k] !== undefined) out.push(row([k, JSON.stringify(engine[k])]));
if (engine.RACE_MOD) out.push(row(['RACE_MOD', JSON.stringify(engine.RACE_MOD)]));
if (engine.CLASSE_MODS) out.push(row(['CLASSE_MODS', JSON.stringify(engine.CLASSE_MODS)]));
if (engine.SPELL_CAT_LABEL) out.push(row(['SPELL_CAT_LABEL', JSON.stringify(engine.SPELL_CAT_LABEL)]));
out.push('');
out.push('## Donjons (data/dungeons.json)', '');
out.push(head(['id', 'nom', 'etages', 'tier', 'types', 'icone', 'eclats (shards)', 'boss']));
dungeons.forEach((d) => out.push(row([d.id, d.name, d.floors, d.tier, (d.types || []).join('/'), d.icon, (d.shards || []).join(', '),
  Object.entries(d.bossNames || {}).map(([f, n]) => 'et.' + f + ' : ' + n).join(' ; ')])));
out.push('');
out.push('## Difficultes (data/difficulties.json)', '');
out.push(head(['id', 'nom', 'rarete min', 'plafond mob', 'boss 5', 'boss 10', 'tous boss', 'points', 'drop monstre', 'drop eclat']));
difficulties.forEach((d) => out.push(row([d.id, d.name, d.minR, d.mobCap, d.boss5, d.boss10, d.allBoss, d.pts, d.monsterDrop, d.shardDrop])));
out.push('');
out.push('## Modificateurs de run (data/run-mods.json)', '');
out.push(head(['id', 'glyph', 'nom', 'description']));
runMods.forEach((m) => out.push(row([m.id, m.glyph, m.name, m.desc])));
out.push('');
out.push('## Mots-cles d\'element (data/keywords.json)', '');
out.push(head(['mot-cle', 'element', 'biome', 'effet']));
Object.entries(keywords).forEach(([k, v]) => out.push(row([k, v.element, v.biome, v.desc])));
out.push('');
out.push('## Zones d\'errance (data/zones.json)', '');
out.push(head(['zone', 'nature', 'cadence', 'apres', 'rencontres']));
zones.forEach((z) => out.push(row([z.id, z.nature, z.cadence, z.apres, (z.rencontres || []).length + ' monstres : ' + (z.rencontres || []).join(', ')])));
out.push('');
out.push('## Arbres d\'eveil (data/trees.json)', '');
out.push('Les eveils font monter une carte vers une autre via une voie ; la voie ouvre des ecoles.', '');
for (const [race, t] of Object.entries(trees)) {
  out.push('### Race ' + race + ' (rang ' + T(t.rang) + ')', '');
  out.push(head(['de', 'vers', 'voie', 'effet', 'ecoles ouvertes']));
  (t.eveils || []).forEach((ev) => out.push(row([ev.de, ev.vers, ev.voie, ev.effet, (ev.ecoles || []).join(', ')])));
  out.push('');
}
out.push('## Synergies d\'equipe (data/synergies.json)', '');
out.push(head(['classe', 'palier 1', 'palier 2']));
Object.entries(synergies).forEach(([k, v]) => out.push(row([k, v['1'] ? v['1'].desc : '-', v['2'] ? v['2'].desc : '-'])));
out.push('');
writeFileSync(O + 'monde.md', out.join('\n') + '\n');

console.log('tables generees : cartes, sorts, monstres, monde (docs/tables/)');

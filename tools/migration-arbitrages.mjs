// Migration data v0.47 : arbitrages actes de la session design (nov 2026)
// 1. Gardien-Mecanique s4 : Pretre -> Guerrier (le Rempart suit le profil Guerrier)
// 2. Invocateur de Fournaise a21 : Invocateur -> Mage (classe Invocateur supprimee, invocations via l'Appel)
// 3. Ecoles : rempart ouvert au profil Guerrier ; entree (l'Entrave) ouverte au Mage ET a l'Occultiste
// 4. Sorts d'ecolage communs renommes : Morsure d'Ecume -> Lame d'Ecume, Chant de Sirene -> Melodie enjoutante,
//    Carapace de Corail -> Barriere de Corail, Guet des Fonds -> Vigie des Flots (ids inchanges : sauvegardes preservees)
// 5. Les 8 monstres Invocateurs reclasses : Foyers + bosquet -> Mage ; Caveaux (liches) -> Occultiste
import { readFileSync, writeFileSync } from 'node:fs';

const D = 'data/';
const w = (f, obj) => writeFileSync(D + f, JSON.stringify(obj, null, 1) + '\n');

// ---- cards.json ----
const cards = JSON.parse(readFileSync(D + 'cards.json', 'utf8'));
const s4 = cards.find((c) => c.id === 's4');
if (!s4) throw new Error('s4 introuvable');
console.log('s4 avant :', s4.name, s4.classe);
s4.classe = 'Guerrier';
const a21 = cards.find((c) => c.id === 'a21');
if (!a21) throw new Error('a21 introuvable');
console.log('a21 avant :', a21.name, a21.classe);
a21.classe = 'Mage';
w('cards.json', cards);
const restantes = {};
cards.forEach((c) => { restantes[c.classe] = (restantes[c.classe] || 0) + 1; });
console.log('classes cartes apres :', JSON.stringify(restantes));
if (cards.some((c) => c.classe === 'Invocateur')) throw new Error('classe Invocateur encore presente dans cards.json');

// ---- schools.json ----
const schools = JSON.parse(readFileSync(D + 'schools.json', 'utf8'));
if (JSON.stringify(schools.rempart.ouvrePar.profils) !== '["Gardien"]') throw new Error('rempart profils inattendu : ' + JSON.stringify(schools.rempart.ouvrePar.profils));
schools.rempart.ouvrePar.profils = ['Guerrier'];
if (JSON.stringify(schools.entrave.ouvrePar.profils) !== '["Occultiste"]') throw new Error('entrave profils inattendu : ' + JSON.stringify(schools.entrave.ouvrePar.profils));
schools.entrave.ouvrePar.profils = ['Mage', 'Occultiste'];
w('schools.json', schools);
console.log('rempart profils :', JSON.stringify(schools.rempart.ouvrePar.profils), '| entrave profils :', JSON.stringify(schools.entrave.ouvrePar.profils));

// ---- grimoire.json ----
const grimoire = JSON.parse(readFileSync(D + 'grimoire.json', 'utf8'));
const REN = {
  'Morsure d’Écume': 'Lame d’Écume',
  'Chant de Sirène': 'Mélodie envoûtante',
  'Carapace de Corail': 'Barrière de Corail',
  'Guet des Fonds': 'Vigie des Flots',
};
let renCount = 0;
(function walk(node) {
  if (Array.isArray(node)) { node.forEach(walk); return; }
  if (node && typeof node === 'object') {
    if (node.nom && REN[node.nom]) { console.log('grimoire :', node.nom, '->', REN[node.nom]); node.nom = REN[node.nom]; renCount++; }
    Object.values(node).forEach(walk);
  }
})(grimoire);
if (renCount !== 4) throw new Error('renommages grimoire : ' + renCount + '/4');
w('grimoire.json', grimoire);

// ---- monsters.json ----
const monsters = JSON.parse(readFileSync(D + 'monsters.json', 'utf8'));
const RECLASS = { f5: 'Mage', f12: 'Mage', f23: 'Mage', g13: 'Mage', g10: 'Mage', k7: 'Occultiste', k15: 'Occultiste', k16: 'Occultiste' };
let rec = 0;
for (const m of monsters) {
  if (RECLASS[m.id]) {
    if (m.classe !== 'Invocateur') throw new Error(m.id + ' n est pas Invocateur : ' + m.classe);
    console.log('monstre', m.id, m.nm, ': Invocateur ->', RECLASS[m.id]);
    m.classe = RECLASS[m.id];
    rec++;
    if (m.soloSpell === 'Carapace de Corail') { console.log('  soloSpell :', m.soloSpell, '-> Barrière de Corail'); m.soloSpell = 'Barrière de Corail'; }
    if (m.soloSpell === 'Guet des Fonds') { console.log('  soloSpell :', m.soloSpell, '-> Vigie des Flots'); m.soloSpell = 'Vigie des Flots'; }
    if (m.soloSpell === 'Morsure d’Écume') { console.log('  soloSpell :', m.soloSpell, '-> Lame d’Écume'); m.soloSpell = 'Lame d’Écume'; }
    if (m.soloSpell === 'Chant de Sirène') { console.log('  soloSpell :', m.soloSpell, '-> Mélodie envoûtante'); m.soloSpell = 'Mélodie envoûtante'; }
  }
}
if (rec !== 8) throw new Error('reclassifications : ' + rec + '/8');
// renommages des soloSpell hors invocateurs reclasses
for (const m of monsters) {
  if (m.soloSpell && REN[m.soloSpell]) { console.log('soloSpell', m.id, ':', m.soloSpell, '->', REN[m.soloSpell]); m.soloSpell = REN[m.soloSpell]; }
}
if (monsters.some((m) => m.classe === 'Invocateur')) throw new Error('classe Invocateur encore presente dans monsters.json');
w('monsters.json', monsters);
console.log('MIGRATION DATA OK');

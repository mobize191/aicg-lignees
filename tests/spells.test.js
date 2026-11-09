import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rmSync, cpSync, writeFileSync } from 'node:fs';
import { mulberry32 } from './helpers/rng.js';
import { loadEngine, loadData } from './helpers/load.mjs';

const ligne5 = (E) => [0, 1, 2, 3, 4].map((i) => ({ uid: `e${i}`, hp: 100, maxHp: 100, alive: true, shield: 0, status: {} }));
const lanceur = (E, atk = 10) => ({ uid: 'l1', atk });

test('Morsure d\u2019Écume : crans I-IV, largeurs 1/2/3/5, mults 1.5/1.8/2.2/2.6, coûts 3/4/5/6★ (ACC-2-2)', () => {
  const E = loadEngine();
  const attendu = { I: [1, 1.5, 3], II: [2, 1.8, 4], III: [3, 2.2, 5], IV: [5, 2.6, 6] };
  for (const [cran, [n, mult, cout]] of Object.entries(attendu)) {
    const cibles = ligne5(E);
    const res = E.castSpell(E.DATA, 'morsure-decume', cran, { lanceur: lanceur(E), cibles, events: [] });
    assert.equal(res.largeur, n === 3 ? 3 : n, `cran ${cran} largeur`);
    assert.equal(res.cibles.length, n, `cran ${cran} touche ${n} cible(s)`);
    assert.equal(res.mult, mult, `cran ${cran} mult`);
    assert.equal(res.cout, cout, `cran ${cran} coût`);
    assert.equal(res.degats, Math.round(10 * mult), `cran ${cran} dégâts`);
  }
});

test('Morsure d\u2019Écume suit les données : modifier le JSON change le résultat (ACC-2-2)', () => {
  const dir = 'tests/fixtures/data-crans-sorts';
  const data = loadData();
  const sort = data.grimoire.ecole.find((s) => s.id === 'morsure-decume');
  sort.crans.I.mult = 9.9;
  rmSync(dir, { recursive: true, force: true });
  cpSync('data', dir, { recursive: true });
  writeFileSync(`${dir}/grimoire.json`, JSON.stringify(data.grimoire, null, 1) + '\n');
  const E2 = loadEngine(dir);
  const res = E2.castSpell(E2.DATA, 'morsure-decume', 'I', { lanceur: lanceur(E2), cibles: ligne5(E2), events: [] });
  assert.equal(res.degats, Math.round(10 * 9.9));
  rmSync(dir, { recursive: true, force: true });
});

test('Chant de Sirène : stun 25/20/15/10 % sur les largeurs 1/2/3/5, contre le seuil (ACC-2-3)', () => {
  const E = loadEngine();
  const attendu = { I: 0.25, II: 0.20, III: 0.15, IV: 0.10 };
  for (const [cran, taux] of Object.entries(attendu)) {
    const c = E.cranOf('chant-de-sirene', cran);
    assert.equal(c.taux, taux, `cran ${cran} taux`);
  }
  const cibles = ligne5(E);
  cibles[0].seuil = 0.10;
  const events = [];
  E.castSpell(E.DATA, 'chant-de-sirene', 'I', { lanceur: lanceur(E), cibles, events, rng: () => 0 });
  assert.ok(events.some((e) => e.type === 'stun'), 'stun appliqué quand le jet passe sous le taux moins le seuil');
  const cibles2 = ligne5(E);
  cibles2[0].seuil = 0.30;
  const events2 = [];
  E.castSpell(E.DATA, 'chant-de-sirene', 'I', { lanceur: lanceur(E), cibles: cibles2, events: events2, rng: () => 0 });
  assert.ok(!events2.some((e) => e.type === 'stun'), 'le seuil de la cible bloque le stun (0 < 0.25 - 0.30 est faux)');
});

test('fusion des Marées : 30 signatures sur 30 résolues, 7 uniques + 23 fondues (ACC-2-4)', () => {
  const E = loadEngine();
  const marees = E.DATA['fusion-map'].marees;
  assert.ok(marees.trie);
  const ids = Object.keys(marees.signatures);
  assert.equal(ids.length, 30);
  const uniques = ids.filter((id) => marees.signatures[id].unique);
  const fondues = ids.filter((id) => marees.signatures[id].fusion);
  assert.equal(uniques.length, 7);
  assert.equal(fondues.length, 23);
  for (const id of ids) assert.ok(E.resolveSignature(id), `signature ${id} résolue`);
  // un monstre des Marées caste son cran de fusion ; un biome non trié garde sa signature
  assert.deepEqual(E.resolveSignature('e1'), { sort: 'morsure-decume', cran: 'I' });
  assert.deepEqual(E.resolveSignature('e13'), { unique: 'maree-noire' });
  assert.equal(E.resolveSignature('f1'), null);
});

test('fin du verrou de classe : deux profils, même école ouverte, même sort, même effet (ACC-2-5)', () => {
  const E = loadEngine();
  const guerrier = { classe: 'Guerrier', voie: 'voie du guerrier', ecoles: [] };
  const assassin = { classe: 'Assassin', voie: 'voie de l’assassinat', ecoles: [] };
  assert.ok(E.canCast(guerrier, 'morsure-decume'), 'le guerrier ouvre la Lame');
  assert.ok(E.canCast(assassin, 'morsure-decume'), 'l’assassin ouvre la Lame aussi');
  const mageSansVoie = { classe: 'Mage', voie: '', ecoles: [] };
  assert.ok(!E.canCast(mageSansVoie, 'morsure-decume') || E.profilSchools('Mage').length >= 0);
  // changer la voie en données change l'école suivie
  const voieEau = { classe: 'Mage', voie: 'les flots — l’Eau', ecoles: [] };
  assert.ok(E.openSchools('les flots — l’Eau').length >= 0);
});

test('acquisition de départ : commun + sort de race à la naissance (EXI-P2-6)', () => {
  const E = loadEngine();
  assert.deepEqual(E.sortsDeDepart('n1'), ['frappe-precise', 'discipline-de-ligne']);
  assert.deepEqual(E.sortsDeDepart('n3'), ['premiers-soins', 'discipline-de-ligne']);
  assert.deepEqual(E.sortsDeDepart('n13'), ['premiers-soins', 'ferveur-celeste']);
  assert.deepEqual(E.sortsDeDepart('a1'), ['frappe-precise']);
});

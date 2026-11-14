import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// Gel v1 — lot A (spec-gel-v1 §3 lot A, suite 39) : le camp démon d19-d36 en data,
// familles chair/puissance, écoles le Vice / la Fureur, 2×6 sorts de lignée,
// signatures au grimoire, éveils n14 → d19/d24 (garde-fou : n14 → d8 conservé pour l’instant).
// Digest INCHANGÉ attendu : aucune carte nouvelle dans les pools de donjons.

const E = loadEngine();

test('lot A gel : éveils n14 → d19/d24 posés (le garde-fou n14 → d8 a été levé au lot B)', () => {
  const ev = E.eveilsOf('n14').map((e) => e.vers);
  assert.ok(ev.includes('d19') && ev.includes('d24'), 'deux voies du camp démon');
  assert.ok(E.eveilOf('n14', 'd19') && E.eveilOf('n14', 'd24'));
});

test('lot A gel : écoles le Vice / la Fureur + 2×6 sorts de lignée + signatures au grimoire', () => {
  assert.ok(E.DATA.schools.vice && E.DATA.schools.fureur);
  assert.equal(E.DATA['lineage-spells'].chair.length, 6);
  assert.equal(E.DATA['lineage-spells'].puissance.length, 6);
  const li = E.DATA.grimoire.lignee.filter((l) => l.famille === 'chair');
  assert.equal(li.length, 6, 'grimoire lignée chair');
  const uniq = new Set(E.DATA.grimoire.uniques.map((u) => u.id));
  for (const id of ['extase-interdite', 'sceptre-du-jugement', 'devoration-totale', 'souffle-noir']) {
    assert.ok(uniq.has(id), `signature ${id} au grimoire`);
  }
  assert.equal(E.DATA.engine.FAM_SCHOOL.chair, 'vice');
  assert.equal(E.DATA.engine.FAM_SCHOOL.puissance, 'fureur');
});

test('lot A gel + lot 5 donjons : le camp démon entre dans le pool du Donjon des Démons', () => {
  // au lot 1 (suite 39) les cartes gel étaient horsPool (digest inchangé) ; au lot 5 elles entrent
  // dans les pools des donjons de famille (spec-donjons §4, IMPACT DIGEST majeur mesuré)
  const poolDemons = new Set(E.monstersOf('donjon-demons').map((m) => m.id));
  for (let i = 19; i <= 36; i++) assert.ok(poolDemons.has(`d${i}`), `d${i} dans le pool du Donjon des Démons`);
  // les boss dédiés (cartes bossCards) restent hors des pools de vagues aléatoires
  for (const d of E.DATA.dungeons) {
    for (const m of E.monstersOf(d.id)) assert.ok(!m.horsPool, `${m.id} hors pool (boss Card)`);
  }
  assert.equal(E.raceOfCard(E.getMonster('d23')), 'divine');
});

test('lot A gel : validateur 0 erreur', () => {
  const errs = [];
  E.validate(E.DATA, errs);
  assert.deepEqual(errs, []);
});

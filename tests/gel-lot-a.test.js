import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// Gel v1 — lot A (spec-gel-v1 §3 lot A, suite 39) : le camp démon d19-d36 en data,
// familles chair/puissance, écoles le Vice / la Fureur, 2×6 sorts de lignée,
// signatures au grimoire, éveils n14 → d19/d24 (garde-fou : n14 → d8 conservé pour l’instant).
// Digest INCHANGÉ attendu : aucune carte nouvelle dans les pools de donjons.

const E = loadEngine();

test('lot A gel : les 18 cartes du camp démon existent (d19-d36, dungeon divin, fam chair/puissance)', () => {
  for (let i = 19; i <= 36; i++) {
    const m = E.getMonster(`d${i}`);
    assert.ok(m, `d${i} présent`);
    assert.equal(m.dungeon, 'divin');
    assert.ok(['chair', 'puissance'].includes(m.fam), `d${i} fam chair/puissance`);
    assert.equal(m.element, 'Ombre');
    assert.ok(m.soloSpell, `d${i} a un sort solo`);
  }
  assert.equal(E.getMonster('d23').name, 'Asmodia, Reine du Désir');
  assert.equal(E.getMonster('d28').name, 'Belzébuth, Roi des Démons');
  assert.equal(E.getMonster('d32').beast, true, 'Famine bestiale (spec gel §1.9)');
});

test('lot A gel : chaînes complètes R → L avec choix doubles aux UC (d19 → {d20|d29}, d24 → {d25|d33})', () => {
  assert.deepEqual(E.evoTargetsOf('d19').sort(), ['d20', 'd29']);
  assert.deepEqual(E.evoTargetsOf('d24').sort(), ['d25', 'd33']);
  const chain = { d20: 'd21', d21: 'd22', d22: 'd23', d29: 'd30', d30: 'd31', d31: 'd32', d25: 'd26', d26: 'd27', d27: 'd28', d33: 'd34', d34: 'd35', d35: 'd36' };
  for (const [from, to] of Object.entries(chain)) {
    assert.deepEqual(E.evoTargetsOf(from), [to], `${from} → ${to}`);
  }
});

test('lot A gel : éveils n14 → d19/d24 posés, garde-fou n14 → d8 conservé', () => {
  const ev = E.eveilsOf('n14').map((e) => e.vers);
  assert.ok(ev.includes('d19') && ev.includes('d24'), 'deux voies du camp démon');
  assert.ok(ev.includes('d8'), 'garde-fou : n14 → d8 toujours présent avant le lot accès Chœur');
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

test('lot A gel : les nouvelles cartes sont hors pools de donjons (digest inchangé attendu)', () => {
  const inPools = new Set();
  for (const d of E.DATA.dungeons) for (const m of E.monstersOf(d.id)) inPools.add(m.id);
  for (let i = 19; i <= 36; i++) assert.ok(!inPools.has(`d${i}`), `d${i} hors pools`);
  assert.equal(E.raceOfCard(E.getMonster('d23')), 'divine');
});

test('lot A gel : validateur 0 erreur', () => {
  const errs = [];
  E.validate(E.DATA, errs);
  assert.deepEqual(errs, []);
});

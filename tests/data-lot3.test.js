import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, loadData } from './helpers/load.mjs';

// Lot 3 refonte v2 — DATA du rééquilibrage (phase B de l'étude, contrats M1) :
// supports relevés sur les DEUX catalogues, bug PV série a Mage, tanks budget:'tank',
// armes intPct des profils lanceurs, modificateurs d'école en data (E).

const E = loadEngine();
const data = loadData();

const SUPPORT = ['Prêtre', 'Occultiste'];
const MON_BAND = { C: 8, UC: 9, R: 10, SR: 11, UR: 13, L: 14 };
const CARD_BAND = { C: 8, UC: 10, R: 12 };

test('lot 3 : aucun support monstre sous atk 8 (bande 8-14 selon palier)', () => {
  for (const m of data.monsters) {
    if (!SUPPORT.includes(m.classe)) continue;
    const band = MON_BAND[m.rarity];
    if (!band) continue;
    assert.ok(m.atk >= band, `${m.id} (${m.classe} ${m.rarity}) atk ${m.atk} < ${band}`);
  }
});

test('lot 3 : INT des Prêtres/Occultistes cartes 6-10 sur C-R (derive de atk x 0.8)', () => {
  for (const c of data.cards) {
    if (!SUPPORT.includes(c.classe)) continue;
    const band = CARD_BAND[c.rarity];
    if (!band) continue;
    assert.ok(c.atk >= band, `${c.id} atk ${c.atk} < ${band}`);
    assert.ok(c.int >= 6, `${c.id} int ${c.int} < 6 (plancher INT 6 sur C-R)`);
  }
});

test('lot 3 : bug de PV de la série a Mage corrigé (R = 70, aligné série v)', () => {
  const a = data.cards.filter((c) => c.id[0] === 'a' && c.classe === 'Mage');
  assert.ok(a.length >= 10);
  for (const c of a) {
    if (c.rarity === 'R') assert.equal(c.hp, 70, `${c.id} hp R`);
  }
  const v3 = data.cards.find((c) => c.id === 'v3');
  const aR = a.filter((c) => c.rarity === 'R');
  for (const c of aR) assert.equal(c.hp, v3.hp, `${c.id} aligné sur v3`);
});

test('lot 3 : tanks bas-ATQ inscrits explicitement budget tank (M4)', () => {
  for (const id of ['s4', 's6', 's7', 's11', 's12']) {
    const c = data.cards.find((x) => x.id === id);
    assert.equal(c.budget, 'tank', id);
  }
});

test('lot 3 : armes frappe des profils lanceurs en intPct par défaut', () => {
  const lanceurs = ['Mage', 'Prêtre', 'Occultiste'];
  for (const p of data.equipment.pieces) {
    if (p.slot !== 'arme' || p.ligne !== 'frappe') continue;
    if (lanceurs.includes(p.classe)) assert.equal(p.bonus.stat, 'intPct', p.id);
    else assert.equal(p.bonus.stat, 'atkPct', p.id);
  }
});

test('lot 3 (E) : modificateurs d\'école en data, appliqués à la construction de l\'unité', () => {
  assert.deepEqual(data.schools.lame.mod, { mult: 1.1 });
  assert.deepEqual(data.schools.baume.mod, { mult: 0.8 });
  assert.deepEqual(data.schools.rempart.mod, { cout: 0.8 });
  assert.deepEqual(data.schools.entrave.mod, { mult: 0.7 });
  const sp = { name: 'Test', cost: 4, mult: 2, ecole: 'lame', role: 'degats' };
  const out = E.applySchoolMod(sp);
  assert.equal(out.mult, 2 * 1.1);
  assert.equal(out.cost, 4, 'lame n\'a pas de mod de coût');
  assert.equal(E.applySchoolMod(out).mult, out.mult, 'idempotent (flag)');
  const rempart = E.applySchoolMod({ name: 'Mur', cost: 5, mult: 1.7, ecole: 'rempart', role: 'bouclier' });
  assert.equal(rempart.cost, 4, 'rempart cout x0.8 arrondi');
  assert.equal(rempart.mult, 1.7, 'rempart sans mod de mult');
  const entrave = E.applySchoolMod({ name: 'Charme', cost: 3, taux: 0.25, ecole: 'entrave', role: 'controle' });
  assert.ok(Math.abs(entrave.taux - 0.25 * 0.7) < 1e-9, 'entrave taux x0.7');
  // intégration makeUnit : un sort d'école porté par la carte est modifié dans u.spells
  const card = { ...E.getCard('a1'), spells: [{ name: 'Frappe Test', cost: 2, mult: 2, ecole: 'lame', role: 'degats' }] };
  const u = E.makeUnit(card, 'u1', 1);
  assert.equal(u.spells[0].mult, 2 * 1.1, 'makeUnit applique le mod d\'école');
  assert.equal(card.spells[0].mult, 2, 'la carte source n\'est pas mutée');
});

test('lot 3 : validateur accepte les mods d\'école et rejette un mod hors bornes', () => {
  const d2 = JSON.parse(JSON.stringify(data));
  const errors = [];
  E.validate(d2, errors);
  assert.ok(!errors.some((e) => e.includes('mod.')), errors.join(' | '));
  d2.schools.lame.mod = { mult: 5 };
  const errors2 = [];
  E.validate(d2, errors2);
  assert.ok(errors2.some((e) => e.includes('mod.mult')), 'mod.mult 5 rejeté');
});

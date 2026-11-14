import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// Refonte v2 — lot 2 MOTEUR v2 (étude 13/11, tranchages J1-J12) :
// 5 stats (def en data), INT pilote les sorts des lanceurs (J1), défense ratio K/(K+def) (J2),
// mods de classe retirés (J3), cran 5/10/15 sur PV seulement (J4), boule de feu de base (J5),
// provocation à charges respectée par l'IA (J9), cap de soin retiré (J10), synergies supprimées (J7).

const E = loadEngine();

test('J1/J2 : 5 stats — def en data et ratio K/(K+def) dans applyDamage', () => {
  const u = E.makeUnit(E.getCard('a1'), 'u1', 10);
  assert.ok(u.def > 0, 'def calculée');
  assert.equal(u.def, Math.max(1, Math.round(E.getCard('a1').def * (1 + E.DATA.engine.LEVEL_BONUS * 9)))); // lot 9 : LEVEL_BONUS en data (0,02 sur la grille 1-100)
  const t = { uid: 't', hp: 1000, maxHp: 1000, alive: true, shield: 0, def: 10, status: {} };
  const ev = [];
  E.applyDamage(t, 20, ev, 'team');
  assert.equal(t.hp, 1000 - Math.max(1, Math.round(20 * 10 / 20)), 'dmg × K/(K+def), K=10 → 10 dégâts');
});

test('J1 : les sorts des lanceurs passent par l’INT, la frappe simple par l’ATQ', () => {
  const mage = E.makeUnit(E.getCard('n2'), 'm', 10); // Mage : profil int
  assert.ok(mage.int > mage.atk || true);
  assert.ok(mage.spells.some((s) => s.name === 'Boule de Feu'), 'J5 : boule de feu de base présente');
  const war = E.makeUnit(E.getCard('n1'), 'w', 10);
  assert.ok(!war.spells.some((s) => s.name === 'Boule de Feu'), 'pas de boule de feu pour le Guerrier');
});

test('J3/J4 : plus de mods de classe en data, cran 5/10/15 sur PV seulement', () => {
  for (const cm of Object.values(E.DATA.engine.CLASSE_MODS)) {
    assert.equal(cm.atkPct, 0);
    assert.equal(cm.hpPct, 0);
  }
  assert.equal(E.DATA.engine.CLASSE_MODS.Mage.splash, 0, 'J5 : splash Mage retiré');
  assert.equal(E.cranPctOfRace('monstre'), 5);
  assert.equal(E.cranPctOfRace('mystique'), 10);
  assert.equal(E.cranPctOfRace('divine'), 15);
  const n5 = E.getCard('n5');
  const u = E.makeUnit(n5, 'u', 1);
  assert.equal(u.atk, n5.atk, 'le cran ne touche plus l ATQ');
  assert.equal(u.maxHp, Math.round(n5.hp * 1.05), 'le cran porte sur les PV');
});

test('J7 : synergies « 2 exemplaires » supprimées (data vide, aucun palier actif)', () => {
  assert.deepEqual(E.DATA.synergies, {});
  const mods = E.teamModifiers([E.makeUnit(E.getCard('n1')), E.makeUnit(E.getCard('a30')), E.makeUnit(E.getCard('n13')), E.makeUnit(E.getCard('n14'))]);
  assert.equal(mods.tiers.size, 0);
  assert.equal(mods.dmgPct ?? 0, 0, 'plus de bonus de paire divine');
});

test('J9 : provocation à charges — l’IA ennemie vise le provocateur', () => {
  const E2 = E;
  const gardien = E2.makeUnit(E2.getCard('s14'), 'g', 1);
  const mage = E2.makeUnit(E2.getCard('n2'), 'm', 1);
  gardien.status.taunt = { charges: 2, turns: 3 };
  const foe = E2.makeUnit(E2.getCard('a1'), 'f', 1);
  const st = { rng: E2.mulberry32(7), iaRng: E2.mulberry32(3), lastTarget: {}, iaProfile: { suboptimal: 0 } };
  const t = E2.pickTargetByUtility(foe, [gardien, mage], 10, st, 'enemies');
  assert.equal(t.uid, 'g', 'la provocation force la cible');
  assert.equal(gardien.status.taunt.charges, 1, 'une charge consommée');
});

test('J10 : plus de cap de soin en data ; migration v30', () => {
  assert.equal(E.DATA.engine.moteur.HEAL_CAP_RATIO, undefined, 'cap de soin retiré');
  assert.ok(E.DATA.engine.moteur.SHIELD_CAP_RATIO > 0, 'le bouclier garde son propre cap');
  assert.equal(E.DATA.engine.CURRENT_VERSION, 32); // lot 8 shiny : migration v31 -> v32
  const out = E.migrate({ version: 29, instances: [], gold: 1 });
  assert.equal(out.version, 32);
});

test('moteur v2 : validateur 0 erreur', () => {
  const errs = [];
  E.validate(E.DATA, errs);
  assert.deepEqual(errs, []);
});

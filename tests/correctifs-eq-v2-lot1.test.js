import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, loadData } from './helpers/load.mjs';

// Correctifs d'équilibre v2 — lot 1 (docs/prompt-correctifs-equilibre-v2.md) :
// la fiche Mage suit le moteur (le sort de base des lanceurs porte sur l'INT, combat.js) :
// - cartes a/v Mage : INT explicite par palier (INT_T, calibré au harnas : R 33 -> ~61 % au palier R,
//   SR aplati car la bande ATQ Guerrier SR (24) est un outlier), PV à 89 % du PV Guerrier, ATQ/AGI inchangées ;
// - Mages monstres : INT à parité de l'ATQ Guerrier du palier (WAR_ATK), PV à 89 % du PV Guerrier.
// cardPower pondère l'INT des profils lanceurs (J1).
// Le strike Mage reste 0,8 — la compensation passe par la base INT, option documentée du
// tranchage J3 (PAS de normalisation du strike : une seule des deux options).

const E = loadEngine();
const data = loadData();
const jsr = (x) => Math.floor(x + 0.5);

const WAR_ATK = { C: 10, UC: 13, R: 17, SR: 24, UR: 30, L: 40 }; // ATQ Guerrier de référence par palier
const WAR_HP = { C: 62, UC: 76, R: 88, SR: 82, UR: 95, L: 105 };  // PV Guerrier de référence par palier
const INT_T = { C: 21, UC: 26, R: 33, SR: 33, UR: 40, L: 55 };     // INT explicite cartes a/v Mage

test('lot 1 eq v2 : INT des Mages a/v = INT_T[palier] ; PV = 89 % du PV Guerrier du palier', () => {
  const mages = data.cards.filter((c) => /^(a|v)\d+$/.test(c.id) && c.classe === 'Mage');
  assert.ok(mages.length >= 10);
  for (const c of mages) {
    if (!INT_T[c.rarity]) continue;
    assert.equal(c.int, INT_T[c.rarity], `${c.id} (${c.rarity}) INT ${c.int} = INT_T`);
    assert.equal(c.hp, jsr(WAR_HP[c.rarity] * 0.89), `${c.id} (${c.rarity}) PV ${c.hp}`);
  }
});

test('lot 1 eq v2 : Mages monstres >= parité ATQ Guerrier du palier (les deux collections ; lot 3 relève ensuite à la bande carte)', () => {
  const mons = data.monsters.filter((m) => m.classe === 'Mage' && WAR_ATK[m.rarity]);
  assert.ok(mons.length >= 10);
  for (const m of mons) {
    assert.ok(m.int >= WAR_ATK[m.rarity], `${m.id} (${m.rarity}) INT ${m.int} >= ATQ Guerrier ${WAR_ATK[m.rarity]} (lot 3 : bande carte ${INT_T[m.rarity]})`);
  }
});

test('lot 1 eq v2 : cardPower suit le profil — lanceurs pondérés sur l’INT (J1), Guerrier sur l’ATQ', () => {
  const M = E.DATA.engine.moteur;
  const lvl = 45;
  const m = 1 + E.DATA.engine.LEVEL_BONUS * (lvl - 1);
  const powerOf = (c) => {
    const rp = E.DATA.engine.RARITY_POWER[c.rarity] ?? 1;
    const step = 1 + M.POWER_SPELL_STEP * Math.max(0, (c.spells ?? []).length - 1);
    return rp * step;
  };
  const mage = data.cards.find((c) => c.id === 'a8'); // Mage R : int 33, atk 14
  const expectedMage = (Math.max(1, Math.round(mage.int * m)) * M.POWER_ATK_WEIGHT + Math.max(1, Math.round(mage.hp * m)) * M.POWER_HP_WEIGHT) * powerOf(mage);
  assert.ok(Math.abs(E.cardPower(mage, lvl) - expectedMage) < 1e-9, 'cardPower Mage = INT pondérée (profil int), pas ATQ');
  const atkBased = (Math.max(1, Math.round(mage.atk * m)) * M.POWER_ATK_WEIGHT + Math.max(1, Math.round(mage.hp * m)) * M.POWER_HP_WEIGHT) * powerOf(mage);
  assert.ok(Math.abs(E.cardPower(mage, lvl) - atkBased) > 1e-6, 'la métrique distingue bien INT et ATQ pour le Mage');
  const war = data.cards.find((c) => c.id === 'a48'); // Guerrier R
  const expectedWar = (Math.max(1, Math.round(war.atk * m)) * M.POWER_ATK_WEIGHT + Math.max(1, Math.round(war.hp * m)) * M.POWER_HP_WEIGHT) * powerOf(war);
  assert.ok(Math.abs(E.cardPower(war, lvl) - expectedWar) < 1e-9, 'Guerrier reste pondéré sur ATQ');
  assert.equal(E.PROFILS.Mage.stat, 'int');
  assert.equal(E.PROFILS.Guerrier.stat, 'atk');
});

test('lot 1 eq v2 : strike Mage inchangé (0,8) — compensation dans la base INT, option documentée', () => {
  assert.equal(E.DATA.engine.CLASSE_MODS.Mage.strike, 0.8, 'pas de normalisation du strike (une seule des deux options J3)');
  const mage = data.cards.find((c) => c.id === 'a8');
  assert.equal(mage.int, 33, 'R : INT 11 -> 33 (calibré au harnas, cible 60-70 % au R)');
  assert.equal(mage.hp, 78, 'R : PV 70 -> 78 (~89 % de 88)');
  assert.equal(mage.atk, 14, 'ATQ de base inchangée (la frappe magique porte sur l’INT)');
});

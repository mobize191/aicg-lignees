import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, loadData } from './helpers/load.mjs';

// Lot 9 — XP 1-100 (phase 3 de l'étude) : courbe cubique (total n^3, précédent Pokémon),
// table de minutes par niveau (tranches de la grille v1) en data, niveaux de donjon
// étirés sur la grille v1 (application affine depuis les données, divins 95-100 inchangés).
// La courbe de stats est préservée : LEVEL_BONUS x DUNGEON_LEVEL_STRETCH = 0,08 historique,
// donc le digest est INCHANGÉ par construction (re-mesuré et consigné).

const E = loadEngine();
const data = loadData();

test('lot 9 : data — cap 100, courbe cubique, table de minutes, étirement grille v1', () => {
  assert.equal(data.engine.LEVEL_CAP, 100);
  assert.equal(data.engine.XP.courbe, 'cubique');
  assert.equal(data.engine.XP.minutesParCombat, 1);
  assert.equal(data.engine.XP.niveauxParTranche, 25);
  assert.deepEqual(data.engine.XP.minutesParTranche, { '1-25': 45, '26-50': 90, '51-75': 135, '76-100': 180 });
  assert.equal(data.engine.moteur.DUNGEON_LEVEL_STRETCH, 4);
  assert.equal(data.engine.moteur.LEGACY_LEVEL_CAP, 25);
  assert.equal(data.engine.LEVEL_BONUS, 0.02, '0.08 x 25/100 : courbe de stats aplatie sur 1-100');
});

test('lot 9 : stretchLevel — marches historiques projetées sur la grille v1, divins inchangés', () => {
  assert.equal(E.stretchLevel(1), 1);
  assert.equal(E.stretchLevel(5), 17);
  assert.equal(E.stretchLevel(20), 77);
  assert.equal(E.stretchLevel(25), 97);
  assert.equal(E.stretchLevel(26), 26, 'au-dessus du cap historique : déjà sur la grille v1, inchangé');
  assert.equal(E.stretchLevel(95), 95);
  assert.equal(E.stretchLevel(100), 100);
  for (let l = 1; l <= 25; l++) assert.equal(E.stretchLevel(l), 1 + (l - 1) * 4);
});

test('lot 9 : préservation de la courbe de stats — m(stretch(L)) avec 0,02 == m(L) avec 0,08', () => {
  const bonus = E.DATA.engine.LEVEL_BONUS;
  assert.equal(bonus * E.DATA.engine.moteur.DUNGEON_LEVEL_STRETCH, 0.08, 'croissance historique retrouvée');
  for (const L of [1, 2, 5, 10, 15, 20, 25]) {
    const mNew = 1 + bonus * (E.stretchLevel(L) - 1);
    const mOld = 1 + 0.08 * (L - 1);
    assert.ok(Math.abs(mNew - mOld) < 1e-12, `niveau ${L} : ${mNew} == ${mOld}`);
  }
  // preuve au moteur : mêmes stats pour un niveau historique et son projeté
  const card = E.getCard('a1');
  const uOld = E.makeUnit({ ...card, level: 20 });
  const uNew = E.makeUnit({ ...card, level: E.stretchLevel(20) });
  assert.equal(uNew.atk, Math.max(1, Math.round(card.atk * (1 + 0.08 * 19))), 'ATQ identique à l’ancienne courbe');
  assert.equal(uNew.hp, Math.max(1, Math.round(card.hp * (1 + 0.08 * 19))));
  assert.ok(uOld.atk < uNew.atk, 'au même niveau 20, la stat est plus faible qu’avant (courbe aplatie), c’est voulu');
});

test('lot 9 : les vagues suivent l’étirement (levelIn) et les donjons rendent des niveaux grille v1', () => {
  const dg = E.DATA.dungeons.find((d) => d.id === 'marees');
  const w1 = E.makeWave(7, 1, 'marees', 1);
  const w10 = E.makeWave(7, 10, 'marees', 1);
  for (const u of [...w1.avant, ...w1.arriere]) assert.ok(u.level >= 1 && u.level <= 97, `niveau vague ${u.level}`);
  const maxW = Math.max(...[...w10.avant, ...w10.arriere].map((u) => u.level ?? 1));
  assert.ok(maxW > 25, `les hauts étages dépassent l’ancienne grille 25 (étirés) : ${maxW}`);
  assert.equal(E.dungeonLevelOf('marees', 1), 1);
  assert.equal(E.dungeonLevelOf('zenith', 5), 97);
  assert.equal(E.dungeonLevelOf('gobelins-ecumes', 2), 9);
  assert.equal(E.dungeonLevelOf('donjon-demons', 1), 95, 'divin inchangé');
  void dg;
});

test('lot 9 : courbe cubique — cumul 1 -> 100 = 100^3, monotone, cap 100', () => {
  const xp = (lvl) => { const n = lvl + 1; return Math.max(1, n * n * n - lvl * lvl * lvl); };
  let total = 0;
  let prev = 0;
  for (let l = 1; l < E.DATA.engine.LEVEL_CAP; l++) {
    const x = xp(l);
    assert.ok(x > prev, `strictement croissante en ${l}`);
    prev = x;
    total += x;
  }
  assert.equal(total, 100 * 100 * 100 - 1, 'total = 100^3 - 1 (télescopage de la courbe n^3)');
  assert.equal(xp(1), 7);
  assert.equal(xp(99), 29701);
});

test('lot 9 : validateur 0 erreur (EXI-DATA-7 XP + étirement en data)', () => {
  const errs = [];
  E.validate(E.DATA, errs);
  assert.deepEqual(errs, []);
});

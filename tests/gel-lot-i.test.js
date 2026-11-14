import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// Gel v1 — lot I (spec-gel-v1 §3 lot I, §1.6, suite 16) : bosses Marées e31/e32 + correctif boss
// NON ALÉATOIRE — chaque étage de boss tire sa carte dédiée (dungeon.bossCards), jamais un monstre
// du pool renommé. [IMPACT DIGEST] accepté : mesure obligatoire contre la baseline.

const E = loadEngine();

test('lot I gel : e31/e32 existent (L, marees, purs monstres, hors pool aléatoire)', () => {
  for (const [id, nom] of [['e31', 'Hydre des Marées'], ['e32', 'Souverain des Marées']]) {
    const m = E.getMonster(id);
    assert.ok(m, id);
    assert.equal(m.name, nom);
    assert.equal(m.rarity, 'L');
    assert.equal(m.dungeon, 'marees');
    assert.equal(m.beast, true, nom + ' pur monstre (spec gel §1.10 option a)');
    assert.equal(m.horsPool, true, id + ' hors pool de vagues aléatoires');
  }
  assert.ok(!E.monstersOf('marees').some((m) => m.id === 'e31' || m.id === 'e32'));
});

test('lot I gel : boss non aléatoire — bossCards par donjon, étages 5 et 10', () => {
  const att = { marees: ['e31', 'e32'], forge: ['f23', 'f13'], bosquet: ['g16', 'g8'], crypte: ['k13', 'k17'], zenith: ['z6', 'z8'] };
  for (const [did, [b5, b10]] of Object.entries(att)) {
    const d = E.DATA.dungeons.find((x) => x.id === did);
    assert.equal(d.bossCards['5'], b5, did + ' étage 5');
    assert.equal(d.bossCards['10'], b10, did + ' étage 10');
    const w5 = E.makeWave(42, 5, did, 1);
    const w10 = E.makeWave(42, 10, did, 1);
    assert.equal(w5.avant[0].id, b5, `${did} étage 5 = ${b5}`);
    assert.equal(w10.avant[0].id, b10, `${did} étage 10 = ${b10}`);
    assert.ok(w5.avant[0].boss && w10.avant[0].boss);
    assert.equal(w5.avant[0].name, d.bossNames['5']);
    assert.equal(w10.avant[0].name, d.bossNames['10']);
  }
});

test('lot I gel : validateur 0 erreur', () => {
  const errs = [];
  E.validate(E.DATA, errs);
  assert.deepEqual(errs, []);
});

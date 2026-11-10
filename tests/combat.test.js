import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './helpers/rng.js';
import { loadEngine } from './helpers/load.mjs';

const ligne5 = () => [0, 1, 2, 3, 4].map((i) => ({ uid: `e${i}`, hp: 100, maxHp: 100, alive: true, shield: 0, status: {} }));

test('la zone frappe exactement 3 cibles contiguës sur 5, le centre en auto (ACC-3-3)', () => {
  const E = loadEngine();
  const ligne = ligne5();
  const auto = E.pickZoneTargets(ligne, null);
  assert.deepEqual(auto.map((u) => u.uid), ['e1', 'e2', 'e3']);
  const choix0 = E.pickZoneTargets(ligne, 0);
  assert.deepEqual(choix0.map((u) => u.uid), ['e0', 'e1', 'e2']);
  const choix2 = E.pickZoneTargets(ligne, 2);
  assert.deepEqual(choix2.map((u) => u.uid), ['e2', 'e3', 'e4']);
});

test('la zone ne remplace pas une cible morte avant l\u2019impact (ACC-3-3)', () => {
  const E = loadEngine();
  const ligne = ligne5();
  ligne[2].hp = 0;
  const res = E.pickZoneTargets(ligne, null);
  assert.deepEqual(res.map((u) => u.uid), ['e1', 'e3'], 'pas de glissement vers e4');
});

test('la largeur vient des données : le cran III vaut 3 (ACC-3-3)', () => {
  const E = loadEngine();
  assert.equal(E.cranOf('morsure-decume', 'III').largeur, 3);
  const cibles = ligne5();
  const res = E.castSpell(E.DATA, 'morsure-decume', 'III', { lanceur: { uid: 'x', atk: 10, classe: 'Guerrier' }, cibles, events: [] });
  assert.equal(res.cibles.length, 3);
});

test('l\u2019ordre du tour suit l\u2019agilité, stable à égalité (ACC-3-4)', () => {
  const E = loadEngine();
  const mk = (uid, agi) => ({ uid, agi, atk: 999 - agi, alive: true, hp: 10, maxHp: 10, status: {}, spells: [] });
  const st = {
    turn: 0, winner: null, rng: mulberry32(1),
    team: { attaque: [mk('a', 10), mk('b', 20)], support: [] },
    enemies: { attaque: [mk('c', 15)], support: [] },
    mods: {},
  };
  E.beginRound(st);
  assert.deepEqual(st.round.items.map((i) => i.u.uid), ['b', 'c', 'a'], 'le plus agile agit avant, l\u2019attaque ne compte plus');
  const st2 = {
    turn: 0, winner: null, rng: mulberry32(1),
    team: { attaque: [mk('a', 10), mk('b', 10)], support: [] },
    enemies: { attaque: [], support: [] }, mods: {},
  };
  E.beginRound(st2);
  assert.deepEqual(st2.round.items.map((i) => i.u.uid), ['a', 'b'], 'à égalité l\u2019ordre reste stable');
});

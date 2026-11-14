import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// Gel v1 — lot H (spec-gel-v1 §3 lot H, §2.5, suites 30/31) : Légion Solaire (z3) et Clergé du Plein Jour
// (z23) sont des familles HUMAINES — pas de dédoublonnage (u4/u5 restent humaines, le donjon du Zénith
// les réutilise comme ennemis) ; z8 Astre Capiteux re-racé divin camp ange (lot C).

const E = loadEngine();

test('lot H gel : Légion/Clergé humains côté donjon ET côté joueur (pas de dédoublonnage)', () => {
  assert.equal(E.raceOfCard(E.getMonster('z3')), 'humaine', 'z3 Arbalétrier Doré (Légion Solaire)');
  assert.equal(E.raceOfCard(E.getMonster('z23')), 'humaine', 'z23 Chapelain du Jour (Clergé)');
  assert.equal(E.raceOfCard(E.getCard('u4')), 'humaine');
  assert.equal(E.raceOfCard(E.getCard('u5')), 'humaine');
  assert.equal(E.raceOfCard(E.getMonster('z8')), 'divine', 'z8 re-racé camp ange (lot C)');
  // le donjon du Zénith réutilise les z-cards comme ennemis (temple des trompés)
  assert.ok(E.monstersOf('zenith').some((m) => m.id === 'z3') && E.monstersOf('zenith').some((m) => m.id === 'z23'));
});

test('lot H gel : validateur 0 erreur', () => {
  const errs = [];
  E.validate(E.DATA, errs);
  assert.deepEqual(errs, []);
});

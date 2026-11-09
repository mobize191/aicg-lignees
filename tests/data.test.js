import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData, loadEngine } from './helpers/load.mjs';
test('les donnees se chargent et passent le validateur (ACC-0-3)', () => {
  const E = loadEngine();
  assert.deepEqual(E.errors, []);
});
test('les cartes connues sont presentes (e13, d18, n15)', () => {
  const data = loadData();
  assert.ok(data.monsters.find((m) => m.id === 'e13'));
  assert.ok(data.monsters.find((m) => m.id === 'd18'));
  assert.ok(data.cards.find((c) => c.id === 'n15'));
});

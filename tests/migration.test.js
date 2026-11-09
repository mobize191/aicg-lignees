import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadEngine } from './helpers/load.mjs';

test('v8 traverse la chaine sans perte (ACC-0-5, EXI-SAVE-1)', () => {
  const E = loadEngine();
  const save = JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));
  const out = E.migrate(structuredClone(save));
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.equal(out.instances.length, save.instances.length);
  assert.equal(out.tokens.length, save.tokens.length);
  assert.deepEqual(out.collection, save.collection);
  assert.deepEqual(out.instances.map((i) => [i.id, i.lvl, i.xp]), save.instances.map((i) => [i.id, i.lvl, i.xp]));
});

test('v8 -> v9 : aucune carte perdue, chaque exemplaire garde ou re-choisit sa voie (ACC-1-4)', () => {
  const E = loadEngine();
  const save = JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));
  const out = E.migrate(structuredClone(save));
  assert.equal(out.version, 9);
  assert.equal(out.instances.length, save.instances.length);
  assert.deepEqual(out.instances.map((i) => i.id), save.instances.map((i) => i.id));
  for (const inst of out.instances) {
    if (E.eveilsOf(inst.id).length) assert.ok(inst.voie, `l'exemplaire ${inst.id} a une voie`);
  }
});

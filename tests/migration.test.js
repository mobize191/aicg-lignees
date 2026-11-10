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

test('v8 -> v9 -> v10 : aucune carte perdue, chaque exemplaire garde ou re-choisit sa voie (ACC-1-4)', () => {
  const E = loadEngine();
  const save = JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));
  const out = E.migrate(structuredClone(save));
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.equal(out.instances.length, save.instances.length);
  assert.deepEqual(out.instances.map((i) => i.id), save.instances.map((i) => i.id));
  for (const inst of out.instances) {
    if (E.eveilsOf(inst.id).length) assert.ok(inst.voie, `l'exemplaire ${inst.id} a une voie`);
  }
});

test('v8 -> v9 -> v10 : les sorts connus survivent au re-mappage (ACC-2-7)', () => {
  const E = loadEngine();
  const save = JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));
  save.instances[0].acc = [{ name: 'Jet d’Écume' }, { name: 'Marée Noire' }, { name: 'Frappe Pratics' }];
  const out = E.migrate(structuredClone(save));
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  const sorts = out.instances[0].sorts;
  assert.equal(sorts.length, 3, 'aucun sort appris perdu');
  assert.deepEqual(sorts[0], { sort: 'morsure-decume', cran: 'I' });
  assert.deepEqual(sorts[1], { sort: 'maree-noire', unique: true });
  assert.deepEqual(sorts[2], { nom: 'Frappe Pratics', legacy: true });
});

test('v8 -> v11 : chaque exemplaire reçoit agilité et intelligence, aucune régression (ACC-3-6)', () => {
  const E = loadEngine();
  const save = JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));
  const out = E.migrate(structuredClone(save));
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.equal(out.instances.length, save.instances.length);
  for (const inst of out.instances) {
    assert.ok(Number.isFinite(inst.agi) && inst.agi >= 1, `${inst.id} a une agilité`);
    assert.ok(Number.isFinite(inst.int) && inst.int >= 1, `${inst.id} a une intelligence`);
  }
  assert.deepEqual(out.tokens.length, save.tokens.length);
});

test('v8 -> v12 : grimoire appris et zones visitées présents, chaîne complète (EXI-SAVE-1)', () => {
  const E = loadEngine();
  const save = JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));
  const out = E.migrate(structuredClone(save));
  assert.equal(out.version, 13);
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.ok(Array.isArray(out.grimoire));
  assert.ok(Array.isArray(out.zonesVisitees));
  assert.equal(out.instances.length, save.instances.length);
});

test('v12 -> v13 : les sorts connus d\u2019un biome trie se re-mappent, les autres restent (EXI-T-4)', () => {
  const E = loadEngine();
  const s = {
    version: 12,
    instances: [{ iid: 'i1', id: 'f1', sorts: [{ name: 'Poing de Cendre' }, { sort: 'morsure-decume', cran: 'I' }], acc: [{ name: 'Colonne de Feu' }] }],
    grimoire: [{ sort: 'morsure-decume', cran: 'I' }],
  };
  const out = E.migrate(s);
  assert.equal(out.version, 13);
  assert.deepEqual(out.instances[0].sorts[0], { sort: 'morsure-decume', cran: 'I' }, 'Poing de Cendre fonde au cran I');
  assert.deepEqual(out.instances[0].sorts[1], { sort: 'morsure-decume', cran: 'I' }, 'un sort deja remappe reste intact');
  assert.deepEqual(out.instances[0].acc[0], { sort: 'colonne-de-feu', cran: 'III' }, 'la signature de f20 fond vers son cran');
  assert.deepEqual(out.grimoire[0], { sort: 'morsure-decume', cran: 'I' }, 'le grimoire appris ne bouge pas');
  const s2 = { version: 12, instances: [{ iid: 'i2', id: 'g1', sorts: [{ name: '\u00c9treinte de Racines' }] }] };
  const out2 = E.migrate(s2);
  assert.deepEqual(out2.instances[0].sorts[0], { name: '\u00c9treinte de Racines' }, 'le Bosquet non trie garde sa signature legacy');
});

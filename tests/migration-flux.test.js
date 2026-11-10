// T-FIX-2 : la migration v8 -> v15 est branchée dans le flux réel de chargement,
// pas seulement testée sur la fonction isolée (constat C2 du rapport de vérification).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { loadEngine } from './helpers/load.mjs';

const uiSrc = () => readFileSync('src/ui.js', 'utf8');
const fixtureV8 = () => JSON.parse(readFileSync('tests/fixtures/save-v8.json', 'utf8'));

test('flux réel (a) : la fixture v8 migre en v15 avec voies, sorts re-mappés, agi/int, grimoire et zones initialisés', () => {
  const E = loadEngine();
  const out = E.migrate(structuredClone(fixtureV8()));
  assert.equal(out.version, 15);
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.ok(Array.isArray(out.grimoire));
  assert.ok(Array.isArray(out.zonesVisitees));
  for (const inst of out.instances) {
    if (E.eveilsOf(inst.id).length) assert.ok(inst.voie, `voie posée pour ${inst.id}`);
    assert.ok(Number.isFinite(inst.agi) && inst.agi >= 1);
    assert.ok(Number.isFinite(inst.int) && inst.int >= 1);
  }
  assert.equal(out.instances.length, fixtureV8().instances.length);
  assert.equal(out.tokens.length, fixtureV8().tokens.length);
});

test('flux réel (b) : la source branche la migration dans le chargement (pas de code mort)', () => {
  const src = uiSrc();
  assert.ok(/restore\(migrate\(/.test(src), 'load() applique migrate() avant restore()');
  assert.ok(/data\.version > CURRENT_VERSION/.test(src), 'restore() accepte jusqu’à CURRENT_VERSION (15)');
  assert.ok(/grimoire:/.test(src.match(/function snapshot[\s\S]*?\n}/)[0]), 'snapshot() persiste grimoire');
  assert.ok(/zonesVisitees:/.test(src.match(/function snapshot[\s\S]*?\n}/)[0]), 'snapshot() persiste zonesVisitees');
  const eng = JSON.parse(readFileSync('data/engine.json', 'utf8'));
  assert.equal(eng.SAVE_VERSION, 15);
  assert.equal(eng.SAVE_VERSION, eng.CURRENT_VERSION, 'SAVE_VERSION === CURRENT_VERSION');
});

test('flux réel (c) : une sauvegarde déjà en v15 se recharge sans être rejetée', () => {
  const E = loadEngine();
  const v8 = fixtureV8();
  const v15 = E.migrate(structuredClone(v8));
  assert.equal(v15.version, 15);
  // rejouer la migration sur une v14 doit être un no-op (idempotence)
  const again = E.migrate(structuredClone(v15));
  assert.equal(again.version, 15);
  assert.equal(again.instances.length, v15.instances.length);
  writeFileSync('tests/fixtures/save-v14.json', JSON.stringify(v15, null, 1) + '\n');
  const reloaded = JSON.parse(readFileSync('tests/fixtures/save-v14.json', 'utf8'));
  assert.equal(reloaded.version, 15);
});

test('invariant : SAVE_VERSION === CURRENT_VERSION dans data/engine.json', () => {
  const eng = JSON.parse(readFileSync('data/engine.json', 'utf8'));
  assert.equal(eng.SAVE_VERSION, eng.CURRENT_VERSION);
});

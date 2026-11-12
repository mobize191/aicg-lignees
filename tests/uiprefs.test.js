import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bootDist } from '../stub.mjs';

// correctifs v1.37 lot 3 : mode Tactique par défaut, choix persisté dans la save (uiPrefs.combatAuto)

const uiSrc = () => readFileSync('src/ui.js', 'utf8');

test('v1.37 lot 3 (a) : Tactique par défaut dans le code (autoMode initial false)', () => {
  const src = uiSrc();
  assert.ok(/let autoMode = false;/.test(src), 'autoMode initialisé à false');
  assert.ok(!/let autoMode = true;/.test(src), 'plus de démarrage en Auto');
});

test('v1.37 lot 3 (b) : boot neuf -> mode Tactique, et save() persiste uiPrefs.combatAuto=false', () => {
  const { api, mem } = bootDist('dist.html');
  assert.equal(api._autoMode(), false, 'mode Tactique au boot sans sauvegarde');
  api.save();
  const raw = JSON.parse(mem.get(api.slotKey(api._activeSlot())));
  assert.equal(raw.uiPrefs?.combatAuto, false, 'uiPrefs.combatAuto persisté à false');
});

test('v1.37 lot 3 (c) : le choix Auto est persisté puis restauré au rechargement (load)', () => {
  const { api, mem } = bootDist('dist.html');
  api._setAuto(true);
  api.store.uiPrefs.combatAuto = true; // ce que fait le bouton Mode
  api.save();
  const raw = JSON.parse(mem.get(api.slotKey(api._activeSlot())));
  assert.equal(raw.uiPrefs?.combatAuto, true, 'choix Auto persisté dans la save');
  api._setAuto(false); // on simule un rechargement avec autoMode à false
  const ok = api.load();
  assert.equal(ok, true);
  assert.equal(api._autoMode(), true, 'restore() resynchronise autoMode depuis uiPrefs');
  assert.equal(api.store.uiPrefs.combatAuto, true);
});

test('v1.37 lot 3 (d) : une sauvegarde sans uiPrefs (pré-v1.37) recharge en Tactique, sans rejet', () => {
  const { api, mem } = bootDist('dist.html');
  api._setAuto(true);
  api.store.uiPrefs.combatAuto = true;
  api.save();
  const key = api.slotKey(api._activeSlot());
  const raw = JSON.parse(mem.get(key));
  delete raw.uiPrefs; // sauvegarde ancienne, champ absent
  mem.set(key, JSON.stringify(raw));
  api._setAuto(true);
  const ok = api.load();
  assert.equal(ok, true, 'save sans uiPrefs acceptée');
  assert.equal(api.store.uiPrefs.combatAuto, false, 'défaut Tactique (ACTÉ)');
  assert.equal(api._autoMode(), false);
});

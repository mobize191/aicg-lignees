import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bootDist, wait } from '../stub.mjs';

// correctifs v1.39 lot 2 : suppression du mode auto — plus de autoMode / #auto-turn / uiPrefs.combatAuto
// dans le code ; une vieille sauvegarde contenant le champ se charge sans erreur (migration passive) ;
// un combat démarré attend l'action du joueur (pas d'enchaînement automatique).

const uiSrc = () => readFileSync('src/ui.js', 'utf8');
const distSrc = () => readFileSync('dist.html', 'utf8');

test('v1.39 lot 2 (a) : plus aucune référence autoMode / #auto-turn / combatAuto dans src/ui.js', () => {
  const src = uiSrc();
  assert.ok(!/autoMode/.test(src), 'plus de variable autoMode');
  assert.ok(!/auto-turn/.test(src), 'plus de bouton #auto-turn');
  assert.ok(!/combatAuto\s*:/.test(src) && !/combatAuto\s*===/.test(src), 'plus de persistance combatAuto');
  assert.ok(!/tactMult|combatTally|lastTactMult/.test(src), 'plomberie de pénalité auto retirée');
});

test('v1.39 lot 2 (b) : grep de contrôle — aucune référence autoMode / #auto-turn dans le dist construit', () => {
  const html = distSrc();
  assert.ok(!/autoMode/.test(html), 'dist sans autoMode');
  assert.ok(!/auto-turn/.test(html), 'dist sans #auto-turn');
  assert.ok(!/id="mode"/.test(html), 'dist sans bouton #mode');
});

test('v1.39 lot 2 (c) : une sauvegarde contenant uiPrefs.combatAuto:true se charge sans erreur, champ ignoré (migration passive)', () => {
  const { api, mem } = bootDist('dist.html');
  api.save();
  const key = api.slotKey(api._activeSlot());
  const raw = JSON.parse(mem.get(key));
  raw.uiPrefs = { combatAuto: true }; // vieille sauvegarde v1.37
  mem.set(key, JSON.stringify(raw));
  const ok = api.load();
  assert.equal(ok, true, 'save avec combatAuto acceptée (pas de rejet, pas de bump de version)');
  assert.ok(!('combatAuto' in api.store.uiPrefs), 'champ ignoré au chargement');
});

test('v1.39 lot 2 (d) : save() ne persiste plus le champ combatAuto', () => {
  const { api, mem } = bootDist('dist.html');
  api.save();
  const raw = JSON.parse(mem.get(api.slotKey(api._activeSlot())));
  assert.ok(raw.uiPrefs && !('combatAuto' in raw.uiPrefs), 'uiPrefs persisté sans combatAuto');
});

test('v1.39 lot 2 (e) : un combat démarré attend l\u2019action du joueur (pas d\u2019enchaînement automatique)', async (t) => {
  const { api, doc } = bootDist('dist.html');
  t.after(() => { doc.body.querySelector('#recomp-all')?.click(); api.go('#accueil'); api.store.errance = null; });
  const store = api.store;
  store.diff = 1;
  store.team.slots = ['n1', 'n3'].map((id) => api.newInst(id, 5).iid);
  api._speed(6);
  api._tacPause(false);
  api.go('#combat');
  await wait(800); // le flux démarre seul, mais bloque sur la fenêtre d'action de la première carte
  const st = api._state();
  assert.ok(st, 'combat lancé');
  assert.equal(st.winner, null, 'aucun vainqueur : rien ne s\u2019est enchaîné tout seul');
  assert.ok(api._actEl(), 'la fenêtre d\u2019action attend le joueur');
});

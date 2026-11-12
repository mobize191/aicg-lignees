import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadEngine } from './helpers/load.mjs';
import { bootDist } from '../stub.mjs';

// correctifs v1.37 lot 7 : héros figé après un combat de zone (chemin vidé au lancement),
// aucun pas automatique au retour, grâce post-combat = 8 pas (constante en data)

test('v1.37 lot 7 (a) : figerHero vide chemin, pending, goal et vélocité', () => {
  const E = loadEngine();
  const st = E.createErranceState('zone-marees');
  assert.ok(E.setTarget(st, st.map.spawn.x + 3, st.map.spawn.y), 'chemin posé avant combat');
  assert.ok(st.hero.path.length > 0 && st.goal, 'le héros marchait');
  st.pending = { x: 1, y: 1 };
  assert.equal(E.figerHero(st), true);
  assert.equal(st.hero.path.length, 0, 'chemin vidé');
  assert.equal(st.pending, null);
  assert.equal(st.goal, null);
  assert.equal(st.hero.v.x, 0);
  assert.equal(st.hero.v.y, 0);
  assert.equal(E.figerHero(null), false);
});

test('v1.37 lot 7 (b) : après figerHero, aucun pas automatique et aucune rencontre sans input', () => {
  const E = loadEngine();
  const st = E.createErranceState('zone-marees');
  E.setTarget(st, st.map.spawn.x + 4, st.map.spawn.y);
  E.figerHero(st); // ce que fait startZoneFight au lancement du combat
  st.grace = E.DATA.engine.ERRANCE_GRACE_COMBAT;
  E.stepErrance(st, 0.05, () => 0); // enregistre la tuile de départ (lastTile)
  let steps = 0, enc = 0;
  for (let i = 0; i < 40; i++) {
    const ev = E.stepErrance(st, 0.05, () => 0); // rng 0 => rencontre dès que grâce à 0 dans les herbes
    steps += ev.steps;
    if (ev.encounter) enc++;
  }
  assert.equal(steps, 0, 'aucun pas joué sans input (héros figé)');
  assert.equal(enc, 0, 'aucune rencontre sans input');
});

test('v1.37 lot 7 (c) : la grâce post-combat vaut 8 (constante en data) et bloque 8 pas de rencontre', () => {
  const E = loadEngine();
  assert.equal(E.DATA.engine.ERRANCE_GRACE_COMBAT, 8, 'constante en data = 8 pas');
  const st = E.createErranceState('zone-marees');
  // placer le héros dans un patch d'herbes
  let hb = null;
  for (let y = 0; y < st.map.h && !hb; y++) for (let x = 0; x < st.map.w; x++) if (st.map.terr[st.map.idx(x, y)] === E.ET.HERBES) { hb = { x, y }; break; }
  assert.ok(hb, 'patch d\u2019herbes présent');
  st.hero.x = hb.x + 0.5; st.hero.y = hb.y + 0.5; st.lastTile = -1; st.grace = E.DATA.engine.ERRANCE_GRACE_COMBAT;
  E.stepErrance(st, 0.05, () => 0); // enregistre la tuile de départ
  let stepsBeforeEnc = -1;
  for (let i = 0; i < 400 && stepsBeforeEnc < 0; i++) {
    st.hero.x += 0.11; // force un changement de tuile toutes les ~9 frames
    const ev = E.stepErrance(st, 0.05, () => 0);
    if (ev.encounter) stepsBeforeEnc = st.steps;
  }
  assert.ok(stepsBeforeEnc >= 9, `rencontre seulement après la grâce de 8 pas (1er pas de grâce + 8 = ${stepsBeforeEnc})`);
});

test('v1.37 lot 7 (d) : flux réel — startZoneFight fige le héros de l\u2019errance (boot dist)', () => {
  const { api } = bootDist('dist.html');
  api._tacPause(true); // pas de chaîne de tours auto dans le stub
  api.grantCards(['n1', 'n3'], 5);
  api.store.team.slots = [api.newInst('n1', 5).iid, api.newInst('n3', 5).iid];
  api.store.errance = api.createErranceState('zone-marees'); // sans enterZone : pas de boucle rAF dans le stub
  const st = api.store.errance;
  assert.ok(st, 'errance active');
  assert.ok(api.setTarget(st, st.map.spawn.x + 3, st.map.spawn.y), 'chemin posé');
  assert.ok(st.hero.path.length > 0);
  api.startZoneFight('zone-marees', { donjon: false });
  assert.equal(st.hero.path.length, 0, 'chemin vidé au lancement du combat');
  assert.equal(st.pending, null);
  assert.equal(st.goal, null);
  assert.ok(api.store.zoneFight, 'combat de zone lancé');
  const src = readFileSync('src/ui.js', 'utf8');
  assert.ok(/figerHero\(store\.errance\)/.test(src), 'startZoneFight appelle figerHero');
  assert.ok(/grace = M\.ERRANCE_GRACE_COMBAT/.test(src), 'grâce post-combat lue en data');
});

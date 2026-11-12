import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// correctifs v1.37 lot 1 : garde « équipe formée » + cycle de vie des combats (plus d'état zombie)

test('v1.37 lot 1 (a) : sans équipe, gardeEquipe refuse (enterZone / enterAt / startZoneFight)', () => {
  const E = loadEngine();
  assert.equal(E.gardeEquipe({ team: { slots: [] } }).ok, false, 'équipe vide -> refus');
  assert.equal(E.gardeEquipe({ team: { slots: [null, undefined] } }).ok, false, 'slots vides -> refus');
  assert.equal(E.gardeEquipe({ team: { slots: ['i1'] } }).ok, true, '1 carte -> ok');
  assert.equal(E.gardeEquipe({}).ok, false, 'pas de team -> refus');
  assert.equal(E.gardeEquipe({ team: { slots: [] } }).reason, 'equipe', 'raison explicite');
});

test('v1.37 lot 1 (b) : combat de zone quitté sans fin -> rencontres de l\u2019errance débloquées', () => {
  const E = loadEngine();
  const st = E.createErranceState('zone-marees');
  const storeLike = { team: { slots: ['i1'] }, zoneFight: { zone: 'zone-marees', donjon: false }, runState: { active: true, kind: 'zone', units: {} } };
  assert.equal(E.combatZoneEnCours(storeLike), true, 'combat de zone en cours -> rencontres bloquées');
  E.quitterCombat(storeLike); // navigation hors #combat sans victoire
  assert.equal(E.combatZoneEnCours(storeLike), false, 'plus de combat de zone en cours');
  assert.equal(storeLike.zoneFight, null, 'plus d\u2019état zombie');
  // simuler des pas dans les hautes herbes : une rencontre peut se déclencher
  let enc = 0;
  st.hero.x = st.map.spawn.x; st.hero.y = st.map.spawn.y;
  // téléporter le héros dans un patch d'herbes et simuler des changements de tuile
  let hb = null;
  for (let y = 0; y < st.map.h && !hb; y++) for (let x = 0; x < st.map.w; x++) if (st.map.terr[st.map.idx(x, y)] === E.ET.HERBES) { hb = { x, y }; break; }
  assert.ok(hb, 'patch d\u2019herbes présent');
  st.hero.x = hb.x + .5; st.hero.y = hb.y + .5; st.lastTile = -1; st.grace = 0;
  for (let i = 0; i < 50; i++) {
    st.hero.x += 0.01; // force le changement de tuile à chaque pas
    const ev = E.stepErrance(st, 0.05, () => 0); // rng = 0 -> rencontre dès que grace à 0 dans les herbes
    if (ev.encounter) { enc++; break; }
  }
  assert.ok(enc === 1, 'rencontre déclenchée après nettoyage (pas de blocage zombie)');
});

test('v1.37 lot 1 (c) : enterAt avec état de zone résiduel -> run DONJON propre, étage 2 enchaîné (pas de retour errance)', () => {
  const E = loadEngine();
  const storeLike = { team: { slots: ['i1'] }, zoneFight: { zone: 'zone-marees', donjon: false }, runState: { active: true, kind: 'zone', units: {} } };
  E.initRun(storeLike, 'donjon'); // ce que fait enterAt (menu donjon)
  assert.equal(storeLike.zoneFight, null, 'état de zone résiduel effacé');
  assert.equal(E.genreRun(storeLike.runState), 'donjon', 'run DONJON');
  // la branche victoire « won && store.zoneFight » est fausse -> enchaînement étage 2 (pas de retour errance)
  assert.equal(!!storeLike.zoneFight, false, 'victoire étage 1 ne retombe pas dans la branche zone');
});

test('v1.37 lot 1 (d) : genreRun / initRun / quitterCombat — sémantique du kind', () => {
  const E = loadEngine();
  assert.equal(E.genreRun(null), null);
  assert.equal(E.genreRun({ active: false, kind: 'zone' }), null, 'run inactif -> null');
  assert.equal(E.genreRun({ active: true, kind: 'zone' }), 'zone');
  const s = { team: { slots: ['i1'] }, runState: { active: false, units: {} } };
  E.initRun(s, 'zone');
  assert.equal(E.genreRun(s.runState), 'zone');
  E.quitterCombat(s);
  assert.equal(E.genreRun(s.runState), null, 'après quitterCombat, plus de run actif');
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadEngine } from './helpers/load.mjs';
import { bootDist } from '../stub.mjs';

// correctifs v1.38 lot 2 : aléatoire PAR COMBAT (zoneFightCount persisté dans le seed des vagues de zone,
// donjons classiques inchangés) + taille de vague errance.waveSize en data

test('v1.38 lot 2 (a) : deux combats de zone consécutifs -> deux vagues distinctes ; même compteur -> même vague (déterminisme)', () => {
  const { api } = bootDist('dist.html');
  api._tacPause(true); // pas de chaîne de tours dans le stub
  api.store.team.slots = [api.newInst('n1', 5).iid, api.newInst('n3', 5).iid];
  api.store.errance = api.createErranceState('zone-marees');
  api.startZoneFight('zone-marees', { donjon: false });
  const c1 = api.store.zoneFightCount;
  api.go('#accueil');
  api.startZoneFight('zone-marees', { donjon: false });
  const c2 = api.store.zoneFightCount;
  assert.equal(c2, c1 + 1, 'compteur incrémenté à chaque combat de zone');
  const ids = (c) => api.makeWave(api.waveSeedFor('marees', 1, c), 1, 'marees', 1).avant.map((m) => m.id).join(',');
  assert.notEqual(ids(c1), ids(c2), 'deux combats consécutifs = deux vagues distinctes');
  assert.equal(ids(c1), ids(c1), 'même compteur = même vague (déterminisme conservé)');
  api.go('#accueil');
});

test('v1.38 lot 2 (b) : zoneFightCount persisté dans la save et restauré (sans rejet des saves anciennes)', () => {
  const { api, mem } = bootDist('dist.html');
  api._tacPause(true);
  api.store.team.slots = [api.newInst('n1', 5).iid];
  api.store.errance = api.createErranceState('zone-marees');
  api.startZoneFight('zone-marees', { donjon: false });
  api.startZoneFight('zone-marees', { donjon: false });
  api.go('#accueil');
  assert.equal(api.store.zoneFightCount, 2);
  api.save();
  const raw = JSON.parse(mem.get(api.slotKey(api._activeSlot())));
  assert.equal(raw.zoneFightCount, 2, 'compteur persisté dans la save');
  delete raw.zoneFightCount; // save ancienne
  mem.set(api.slotKey(api._activeSlot()), JSON.stringify(raw));
  assert.equal(api.load(), true, 'save sans zoneFightCount acceptée');
  assert.equal(api.store.zoneFightCount, 0, 'défaut 0');
});

test('v1.38 lot 2 (c) : waveSeedFor sans extra = hash historique inchangé (donjons classiques)', () => {
  const { api } = bootDist('dist.html');
  const today = new Date().toISOString().slice(0, 10);
  const legacyHash = (k) => { let h = 7; for (const ch of k) h = (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0; return h; };
  assert.equal(api.waveSeedFor('marees', 1), legacyHash(`${today}|marees|1`), 'sans extra : hash jour|donjon|diff identique à avant');
  assert.notEqual(api.waveSeedFor('marees', 1, 7), legacyHash(`${today}|marees|1`), 'avec compteur : hash différent');
  assert.equal(api.waveSeedFor('marees', 1, 7), api.waveSeedFor('marees', 1, 7), 'déterministe');
});

test('v1.38 lot 2 (d) : errance.waveSize en data pour les 5 zones (2-3 au début) et makeWave le respecte', () => {
  const E = loadEngine();
  const zones = E.DATA.zones ?? [];
  assert.ok(Array.isArray(zones) && zones.length === 5);
  for (const z of zones) {
    const ws = z.errance?.waveSize;
    assert.ok(Array.isArray(ws) && ws.length === 2 && ws[0] >= 2 && ws[1] <= 3, `${z.id} : waveSize ${JSON.stringify(ws)} dans [2,3]`);
  }
  // makeWave respecte la plage fournie (étage 1, plusieurs seeds)
  for (const seed of [11, 22, 33, 44, 55]) {
    const w2 = E.makeWave(seed, 1, 'marees', 1, null, [2, 2]);
    assert.equal(w2.avant.length, 2, `waveSize [2,2] -> 2 monstres (seed ${seed})`);
    assert.equal(w2.arriere.length, 0, 'pas de support étage 1');
    const w23 = E.makeWave(seed, 1, 'marees', 1, null, [2, 3]);
    assert.ok(w23.avant.length === 2 || w23.avant.length === 3, `waveSize [2,3] -> 2-3 monstres (seed ${seed}: ${w23.avant.length})`);
    const wDef = E.makeWave(seed, 1, 'marees', 1);
    assert.ok(wDef.avant.length >= 2 && wDef.avant.length <= 3, 'sans plage : comportement historique 2-3');
  }
});

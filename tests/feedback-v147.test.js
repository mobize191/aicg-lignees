import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootDist, wait } from '../stub.mjs';

// Spec vie du jeu — Lot 2 : feedback(tier, anchor) 3 tiers + hit-stop.
// hit-stop 80-100 ms réservé au tier large, jamais deux freezes qui se chevauchent (le plus récent
// restaure), kill switch 1 ligne en data (FX_HITSTOP=false), option « réduire les flashs » (teinte sans
// pulsation, ≤ 3 flashs/s via FX_FLASH_MAX_PER_S). Tests : hit-stop se termine toujours, shake amorti à 0.

test('Lot 2 : feedback small/medium/large ne lève aucune exception et pose les classes attendues', async () => {
  const { api, doc } = bootDist('dist.html');
  const el = doc.body.appendChild(doc.createElement('div'));
  api.feedback('small', el);
  api.feedback('medium', el);
  assert.ok(el.classList._set.has('shake'), 'medium -> shake posé');
  await wait(400);
  assert.ok(!el.classList._set.has('shake'), 'shake amorti à 0 (classe retirée)');
  api.feedback('large', el);
  assert.ok(el.classList._set.has('shake-big') && el.classList._set.has('zoom-pop'), 'large -> shake 0.7 + zoom');
  await wait(500);
  assert.ok(!el.classList._set.has('shake-big') && !el.classList._set.has('zoom-pop'), 'classes retirées au repos exact');
});

test('Lot 2 : deux feedback large rapprochés — le hit-stop se termine toujours (pas de freeze infini)', async () => {
  const { api, doc } = bootDist('dist.html');
  const el = doc.body.appendChild(doc.createElement('div'));
  const t0 = Date.now();
  api.feedback('large', el);
  await wait(30); // 30 ms d'écart
  api.feedback('large', el);
  await api.hitStopLarge();
  await wait(300);
  const dt = Date.now() - t0;
  assert.ok(dt < 2000, `hit-stop terminé en ${dt} ms (pas de chevauchement infini)`);
});

test('Lot 2 : kill switch en 1 ligne — FX_HITSTOP=false en data désactive le hit-stop', async () => {
  const { api, doc } = bootDist('dist.html');
  const el = doc.body.appendChild(doc.createElement('div'));
  assert.equal(api.DATA.engine.FX_HITSTOP, true);
  assert.ok(api.DATA.engine.FX_HITSTOP_MS >= 80 && api.DATA.engine.FX_HITSTOP_MS <= 100, '80-100 ms');
  assert.equal(api.DATA.engine.FX_FLASH_MAX_PER_S, 3, '≤ 3 flashs/s');
  // simule le kill switch
  const saved = api.DATA.engine.FX_HITSTOP;
  api.DATA.engine.FX_HITSTOP = false;
  const t0 = Date.now();
  await api.hitStopLarge();
  assert.ok(Date.now() - t0 < 50, 'hit-stop désactivé (retour immédiat)');
  api.DATA.engine.FX_HITSTOP = saved;
});

test('Lot 2 : rate limit — au plus FX_FLASH_MAX_PER_S flashs par seconde', async () => {
  const { api, doc } = bootDist('dist.html');
  const el = doc.body.appendChild(doc.createElement('div'));
  for (let i = 0; i < 8; i++) api.feedback('medium', el);
  await wait(20);
  const flashs = doc.body.querySelectorAll('.fx-flash').length;
  assert.ok(flashs <= 3, `${flashs} flashs posés pour 8 demandes (cap 3/s)`);
  await wait(1200);
  assert.equal(doc.body.querySelectorAll('.fx-flash').length, 0, 'flashs retirés après la seconde');
});

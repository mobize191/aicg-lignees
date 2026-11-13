import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootDist, wait } from '../stub.mjs';

// correctif retour terrain (15/11) : un combat de zone (Terres Sauvages) ne doit PAS s'afficher comme un donjon.
// startZoneFight pose store.dungeon = dungeonOfZone(zone) pour le pool de monstres, mais l'en-tête
// (h2 + #stage-chip) doit afficher la ZONE et « combat de zone » quand store.zoneFight && !donjon.
// Un seul bootDist par fichier : plusieurs boots dans un même process font planter le stub (artefact connu).

const h2of = (els) => { const h = [...els.get('app').querySelectorAll('h2')]; return h.length ? h[0].textContent : ''; };
const chipOf = (els) => { const c = els.get('app').querySelector('#stage-chip'); return c ? c.textContent : ''; };

test('en-tête de combat : zone vs donjon vs entrée de donjon depuis l\u2019errance', async () => {
  const { api, els, errors } = bootDist('dist.html');
  await wait(250);
  const store = api.store;
  store.team.slots = ['n1', 'n2', 'n3'].map((id) => api.newInst(id, 12).iid);

  // phase 1 : combat de zone (Terres Sauvages)
  store.zoneFight = { zone: 'zone-marees', donjon: false };
  store.runState = { active: true, units: {}, kind: 'zone' };
  store.dungeon = 'marees'; store.stage = 1; // ce que fait startZoneFight (pool de la zone)
  api.go('#combat'); await wait(400);
  let h2 = h2of(els), chip = chipOf(els);
  assert.ok(chip.includes('Combat de zone'), `zone : stage-chip = « Combat de zone » (vu: ${chip})`);
  assert.ok(!chip.includes('tage'), `zone : stage-chip sans étage (vu: ${chip})`);
  assert.ok(h2.includes('combat de zone'), `zone : h2 « combat de zone » (vu: ${h2.slice(0, 90)})`);
  assert.ok(h2.includes('berges des Mar'), 'zone : h2 affiche la nature de la zone');
  assert.ok(!/Antre des Mar/.test(h2), 'zone : h2 n\u2019affiche PAS le nom du donjon');

  // phase 2 : run donjon classique
  store.zoneFight = null;
  store.runState.kind = 'donjon';
  store.dungeon = 'marees'; store.stage = 3;
  api.go('#accueil'); await wait(150);
  api.go('#combat'); await wait(400);
  h2 = h2of(els); chip = chipOf(els);
  assert.ok(chip.includes('3/'), `donjon : stage-chip = étage (vu: ${chip})`);
  assert.ok(h2.includes('Antre des Mar') && h2.includes('3/'), `donjon : h2 intact (vu: ${h2.slice(0, 90)})`);

  // phase 3 : entrée du donjon DEPUIS l'errance (zoneFight.donjon = true) -> en-tête donjon conservé
  store.zoneFight = { zone: 'zone-marees', donjon: true };
  store.runState.kind = 'donjon';
  store.dungeon = 'marees'; store.stage = 1;
  api.go('#accueil'); await wait(150);
  api.go('#combat'); await wait(400);
  h2 = h2of(els); chip = chipOf(els);
  assert.ok(chip.includes('1/'), `donjon de zone : stage-chip = étage (vu: ${chip})`);
  assert.ok(h2.includes('Antre des Mar'), 'donjon de zone : h2 = donjon, pas la zone');

  assert.equal(errors.length, 0, '0 exception: ' + errors.map((e) => e.message).join('|').slice(0, 200));
  api.go('#accueil'); await wait(800); // nettoyage : quitte le combat pour vider les timers pendants avant la fin du test
});

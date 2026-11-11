import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, loadData } from './helpers/load.mjs';

test('errance : carte générée déterministe depuis le seed de la zone (zones.json)', () => {
  const E = loadEngine();
  const D = loadData();
  const zone = D.zones.find((z) => z.id === 'zone-marees');
  assert.ok(zone.errance?.seed > 0 && zone.errance.encRate > 0, 'seed + encRate en data');
  const m1 = E.genZoneMap(zone);
  const m2 = E.genZoneMap(zone);
  assert.deepEqual([...m1.terr], [...m2.terr], 'même seed = même carte');
  assert.ok(m1.w === 46 && m1.h === 32, 'dimensions de la zone');
  assert.ok(m1.donjon && m1.autel && m1.jarres.length > 0, 'donjon + autel + jarres présents');
  // spawn praticable
  const sx = Math.floor(m1.spawn.x), sy = Math.floor(m1.spawn.y);
  assert.ok(![2, 3, 4, 7, 8, 9, 10].includes(m1.terr[m1.idx(sx, sy)]), 'spawn sur terrain praticable');
});

test('errance : A* trouve un chemin valide vers la porte du donjon, jamais hors limites', () => {
  const E = loadEngine();
  const D = loadData();
  const zone = D.zones[0];
  const m = E.genZoneMap(zone);
  const path = E.astar(m, m.spawn.x, m.spawn.y, m.donjon.x, m.donjon.y + 2); // la porte
  assert.ok(path && path.length > 1, 'chemin trouvé');
  for (const p of path) {
    const x = Math.floor(p.x), y = Math.floor(p.y);
    assert.ok(m.inb(x, y), 'dans la carte');
    assert.ok(![2, 3, 4, 7, 8, 9, 10].includes(m.terr[m.idx(x, y)]), `tuile praticable (${x},${y})`);
  }
  const last = path[path.length - 1];
  assert.equal(Math.floor(last.x), m.donjon.x);
  assert.equal(Math.floor(last.y), m.donjon.y + 2);
  // lissage conserve la validité
  const sm = E.smoothPath(m, path);
  assert.ok(sm.length <= path.length && sm.length >= 2, 'lissage réduit le chemin');
});

test('errance : stepErrance déclenche une rencontre uniquement dans les hautes herbes, avec grâce', () => {
  const E = loadEngine();
  const D = loadData();
  const zone = D.zones[0];
  const st = E.createErranceState(zone.id);
  // grace initiale = 2 pas sûrs
  let enc = 0;
  const rng = () => 0; // rencontre forcée si herbe
  // marcher artificiellement : téléporter le héros case par case sur de l'herbe
  const m = st.map;
  let herbe = null;
  for (let y = 0; y < m.h && !herbe; y++) for (let x = 0; x < m.w && !herbe; x++) if (m.terr[m.idx(x, y)] === E.ET.HERBES) herbe = { x, y };
  assert.ok(herbe, 'il y a des hautes herbes');
  st.hero.x = herbe.x + 0.5; st.hero.y = herbe.y + 0.5; st.lastTile = -1; st.grace = 0;
  const ev = E.stepErrance(st, 0.1, rng);
  assert.equal(ev.encounter, true, 'rencontre forcée dans les herbes sans grâce');
  st.grace = 2; st.lastTile = -1;
  const ev2 = E.stepErrance(st, 0.1, rng);
  assert.equal(ev2.encounter, null, 'pas de rencontre pendant la grâce');
});

test('errance : autel soigne (+5 pas de grâce, contrat §8) et jarre lâche un éclat puis redevient herbe', () => {
  const E = loadEngine();
  const D = loadData();
  const st = E.createErranceState(D.zones[0].id);
  const g0 = st.grace;
  const r = E.interactAutel(st);
  assert.equal(r.type, 'autel');
  assert.equal(st.grace, g0 + 5, '+5 pas de grâce (AUTEL_SOIN_GRACE)');
  const jid = `jarre-${st.map.jarres[0].x}-${st.map.jarres[0].y}`;
  const rj = E.interactJarre(st, jid);
  assert.equal(rj.loot, 'eclat');
  assert.equal(st.map.terr[st.map.idx(st.map.jarres[0].x, st.map.jarres[0].y)], E.ET.HERBES, 'jarre redevient herbe');
  assert.equal(E.interactJarre(st, jid), null, 'jarre déjà brisée');
});

test('errance : déblocage en chaîne — zone de départ ouverte, suivantes verrouillées puis débloquées', () => {
  const E = loadEngine();
  const fakeStore = { zonesUnlocked: [] };
  assert.equal(E.zoneUnlocked('zone-marees', fakeStore), true, 'zone de départ (eau) ouverte');
  assert.equal(E.zoneUnlocked('zone-forge', fakeStore), false, 'zone suivante verrouillée');
  E.unlockZone('zone-marees', fakeStore);
  assert.equal(E.zoneUnlocked('zone-forge', fakeStore), true, 'vaincre le donjon de la zone débloque la suivante');
});

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

test('errance : pilotage inertiel — accélération, freinage sur le dernier waypoint, arrivée sans orbite', () => {
  const E = loadEngine();
  const D = loadData();
  const st = E.createErranceState(D.zones[0].id);
  const m = st.map;
  const sy = Math.floor(m.spawn.y);
  let tx = Math.floor(st.hero.x) + 1;
  while (tx < m.w - 2 && [2, 3, 4, 7, 8, 9, 10].includes(m.terr[m.idx(tx, sy)])) tx++;
  assert.ok(tx > Math.floor(st.hero.x), 'cible praticable trouvée');
  assert.equal(E.setTarget(st, tx, sy), true, 'cible posée');
  const startX = st.hero.x;
  E.stepErrance(st, 0.05, () => 0.99);
  assert.ok(Math.hypot(st.hero.v.x, st.hero.v.y) > 0.5, 'accélération progressive (pas de téléportation)');
  let frames = 0;
  while (st.hero.path.length && frames++ < 2000) E.stepErrance(st, 0.05, () => 0.99);
  assert.equal(st.hero.path.length, 0, 'arrivé : aucun waypoint résiduel (pas d’orbite)');
  const dEnd = Math.hypot(st.hero.x - (tx + 0.5), st.hero.y - (sy + 0.5));
  assert.ok(dEnd < 0.6, `proche de la cible (d=${dEnd.toFixed(2)})`);
  assert.ok(Math.hypot(st.hero.v.x, st.hero.v.y) < 0.01, 'freinage complet à l’arrêt');
  assert.ok(st.hero.x > startX + 0.5, 'le héros a avancé');
  assert.ok(Math.abs(st.hero.tilt) <= 0.1, 'tilt borné');
});

test('errance : collision par axe — le héros glisse le long d’un mur sans jamais le traverser', () => {
  const E = loadEngine();
  const D = loadData();
  const st = E.createErranceState(D.zones[0].id);
  const m = st.map;
  // bord ouest (x=0) = eau/arbre : on pousse le héros tout droit dedans
  st.hero.x = 1.5;
  st.hero.y = Math.floor(m.spawn.y) + 0.5;
  st.hero.v = { x: 0, y: 0 };
  st.hero.path = [{ x: -2.5, y: st.hero.y }];
  for (let i = 0; i < 300; i++) E.stepErrance(st, 0.05, () => 0.99);
  assert.ok(st.hero.x >= 0.99, `jamais entré dans le mur (x=${st.hero.x.toFixed(2)})`);
  assert.ok(st.hero.x < 1.6, 'le héros a bien tenté de traverser');
});

// ---------- refonte IA lot 4 : garde-fous anti-blocage de l'errance ----------
test('refonte IA lot 4 : stagnation -> repath après ~2 s, puis abandon propre après échecs répétés', () => {
  const E = loadEngine();
  const st = E.createErranceState('zone-marees');
  // héros enfermé dans une couronne d'arbres : aucun chemin ne sort, mais un chemin est posé
  const m = st.map;
  const hx = Math.floor(st.hero.x), hy = Math.floor(st.hero.y);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (dx || dy) m.terr[m.idx(hx + dx, hy + dy)] = E.ET.ARBRE;
  }
  st.hero.path = [{ x: hx + 3.5, y: hy + 0.5 }]; // waypoint inatteignable (mur entre les deux)
  st.goal = { x: hx + 3, y: hy };
  st.lastDist = null; st.stuckTime = 0; st.repaths = 0;
  let repaths = 0, abandoned = false;
  for (let i = 0; i < 200 && !abandoned; i++) {
    const ev = E.stepErrance(st, 0.05, () => 0);
    if (ev.repath) repaths++;
    if (ev.abandoned) abandoned = true;
  }
  assert.ok(repaths > 0, 'au moins un repath tenté après stagnation');
  assert.ok(abandoned, 'abandon après échecs répétés (changement d\'état)');
  assert.equal(st.hero.path.length, 0, 'chemin vidé à l\'abandon');
  assert.equal(st.goal, null, 'but abandonné');
});

test('refonte IA lot 4 : marche normale sans stagnation -> aucun repath, arrivée conservée', () => {
  const E = loadEngine();
  const st = E.createErranceState('zone-marees');
  const m = st.map;
  const ok = E.setTarget(st, m.donjon.x, m.donjon.y + 2); // la porte
  assert.ok(ok, 'cible posée');
  let repaths = 0, arrived = false;
  for (let i = 0; i < 2000 && !arrived; i++) {
    const ev = E.stepErrance(st, 0.05, () => 0);
    if (ev.repath) repaths++;
  }
  assert.equal(repaths, 0, 'aucun repath en marche normale');
  assert.ok(Math.hypot(st.hero.x - (m.donjon.x + 0.5), st.hero.y - (m.donjon.y + 2.5)) < 1, 'le héros a atteint la porte');
});

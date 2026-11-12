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
  // bande de mer profonde au sud (EAU_PROFONDE, solide) : on pousse le héros tout droit dedans
  const deepRow = m.h - 1; // anneau externe = EAU_PROFONDE
  assert.equal(m.terr[m.idx(Math.floor(m.spawn.x), deepRow)], 12, 'bord sud = eau profonde');
  st.hero.x = m.spawn.x;
  st.hero.y = deepRow - 2.5;
  st.hero.v = { x: 0, y: 0 };
  st.hero.path = [{ x: st.hero.x, y: deepRow + 5 }];
  for (let i = 0; i < 300; i++) E.stepErrance(st, 0.05, () => 0.99);
  assert.ok(st.hero.y < deepRow + 0.01, `jamais entré dans l'eau profonde (y=${st.hero.y.toFixed(2)}, limite ${deepRow})`);
  assert.ok(st.hero.y > deepRow - 2, 'le héros a bien tenté de traverser');
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
  assert.ok(repaths <= 1, `au plus un repath en marche normale (repaths=${repaths})`);
  assert.ok(Math.hypot(st.hero.x - (m.donjon.x + 0.5), st.hero.y - (m.donjon.y + 2.5)) < 1, 'le héros a atteint la porte');
});

test('refonte errance lot 1 : decorOrders/ambiance déterministes depuis le seed, palette zone en data avec défauts', () => {
  const E = loadEngine();
  const z = E.DATA.zones[0];
  const m1 = E.genZoneMap(z), m2 = E.genZoneMap(z);
  const d1 = E.decorOrders(m1, z), d2 = E.decorOrders(m2, z);
  assert.equal(JSON.stringify(d1), JSON.stringify(d2), 'même seed => mêmes ordres de décor');
  assert.ok(d1.blades.length > 0 && d1.pond && d1.herbSocles.length > 0 && d1.details.length > 0, 'décor présent (lames, étang, socles, détails)');
  const pal = E.errancePalette(z);
  assert.equal(pal.water0, '#78c2de', 'override zone-marees lu depuis zones.json');
  assert.equal(E.errancePalette({ id: 'zone-test', errance: { seed: 1 } }).water0, '#78c2de', 'défaut intégré pour les zones non paramétrées');
  const amb = E.buildAmbiance(m1, z);
  assert.ok(amb.dayLen === 100 && amb.flies.length === 42 && amb.clouds.length === 3 && Array.isArray(amb.prints), 'ambiance construite');
});

test('refonte errance lot 3 : layout v2 data-driven (Marées) — retour ville, huttes, étang à l\u2019échelle, déterministe', () => {
  const E = loadEngine();
  const D = loadData();
  const zone = D.zones[0];
  assert.ok(zone.errance.layout, 'layout présent en data pour la zone témoin');
  const m1 = E.genZoneMap(zone), m2 = E.genZoneMap(zone);
  assert.equal(JSON.stringify([...m1.terr]), JSON.stringify([...m2.terr]), 'déterministe depuis le seed');
  assert.ok(m1.retour && m1.terr[m1.idx(m1.retour.x, m1.retour.y)] === E.ET.RETOUR, 'point de retour ville posé');
  assert.ok(m1.huttes.length === 2 && m1.huttes.every((h) => h.title && h.text), '2 huttes avec dialogues');
  assert.ok(m1.terr[m1.idx(m1.donjon.x + 1, m1.donjon.y + m1.donjon.h)] === E.ET.PORTE, 'porte au sud du donjon');
  // spawn praticable, chemin atteignable vers la porte
  const p = E.astar(m1, m1.spawn.x, m1.spawn.y, m1.donjon.x + 1, m1.donjon.y + m1.donjon.h);
  assert.ok(p && p.length > 1, 'chemin vers la porte');
  // repli : les 4 autres zones (sans layout) utilisent le générateur historique
  for (const z of D.zones.slice(1)) {
    const m = E.genZoneMap(z);
    assert.ok(!z.errance.layout && m.retour, `repli générateur pour ${z.id}, retour ville posé`);
    assert.ok(m.donjon && m.autel && m.spawn, 'objets présents');
  }
});

test('refonte errance lot 3 : rescueHeroPos — position valide inchangée, position solide/orpheline secourue près du spawn', () => {
  const E = loadEngine();
  const D = loadData();
  const m = E.genZoneMap(D.zones[0]);
  const ok = E.rescueHeroPos(m, m.spawn.x, m.spawn.y);
  assert.equal(ok.x, m.spawn.x, 'position valide renvoyée telle quelle');
  const wall = E.rescueHeroPos(m, m.donjon.x, m.donjon.y); // mur du donjon = solide
  assert.ok(![2, 3, 4, 7, 8, 9, 10].includes(m.terr[m.idx(Math.floor(wall.x), Math.floor(wall.y))]), 'secouru sur tuile praticable');
  const d = Math.hypot(wall.x - m.spawn.x, wall.y - m.spawn.y);
  assert.ok(d <= 15, `secours proche du spawn (d=${d.toFixed(1)})`);
  const nul = E.rescueHeroPos(m, null, undefined);
  assert.ok(Number.isFinite(nul.x) && Number.isFinite(nul.y), 'position nulle secourue');
});

test('refonte errance lot 3 : migration v27 -> v28 normalise errance (non destructive)', () => {
  const E = loadEngine();
  const out = E.migrate({ version: 27, errance: { zone: 'zone-marees', x: 3, y: 4, grace: 2, steps: 10 } });
  assert.equal(out.version, E.DATA.engine.CURRENT_VERSION);
  assert.deepEqual(out.errance.looted, []);
  assert.deepEqual(out.errance.broken, []);
  assert.equal(out.errance.x, 3, 'position conservée');
  const bad = E.migrate({ version: 27, errance: { zone: 'zone-marees' } });
  assert.equal(bad.errance.x, null, 'position absente normalisée en null (secourue au chargement)');
});

test('correctif v1.36.1 lot 1 : le pond peint ne déborde pas des tuiles EAU (grand lac) — 5 zones', () => {
  const E = loadEngine();
  const D = loadData();
  for (const zone of D.zones) {
    const m = E.genZoneMap(zone);
    const d = E.decorOrders(m, zone);
    const T = m.t;
    if (!d.pond) continue;
    const p = d.pond;
    // aucune tuile non-EAU ne doit avoir son centre sous l'ellipse d'eau peinte (l'anneau de sable peut déborder de ≤ 0,25·T)
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const t = m.terr[m.idx(x, y)];
      if (t === E.ET.EAU || t === E.ET.EAU_PROFONDE || t === E.ET.EAU_PEU_PROFONDE) continue;
      const dxn = (x * T + T / 2 - p.cx) / p.rx;
      const dyn = (y * T + T / 2 - p.cy) / p.ry;
      assert.ok(dxn * dxn + dyn * dyn >= 1, `${zone.id}: tuile non-EAU (${x},${y}) sous le pond peint (centre ${Math.round(p.cx)},${Math.round(p.cy)} r ${Math.round(p.rx)}x${Math.round(p.ry)})`);
    }
    // si layout.pond en data, le pond peint correspond au pond data
    const lp = zone.errance?.layout?.pond;
    if (lp) {
      assert.ok(Math.abs(p.cx - (lp.x + .5) * T) <= T && Math.abs(p.cy - (lp.y + .5) * T) <= T, `${zone.id}: centre du pond peint != layout.pond`);
      assert.ok(Math.abs(p.rx - lp.rx * T) <= T + 0.25 * T && Math.abs(p.ry - lp.ry * T) <= T + 0.25 * T, `${zone.id}: rayons du pond peint != layout.pond`);
    }
  }
});


test('correctif v1.36.1 lot 2 : thème plage + EAU_PROFONDE (solide) / EAU_PEU_PROFONDE (praticable) en data, 5 zones', () => {
  const E = loadEngine();
  const D = loadData();
  assert.ok(![2, 3, 4, 7, 8, 9, 10].includes(12) && E.ET.EAU_PROFONDE === 12 && E.ET.EAU_PEU_PROFONDE === 13, 'codes eau en data de terrain');
  // profonde = solide, peu profonde = praticable
  const m0 = E.genZoneMap(D.zones[0]);
  const deep = m0.terr.findIndex((t) => t === 12);
  assert.ok(deep >= 0, 'Marées : bande de mer profonde présente');
  const shallow = m0.terr.findIndex((t) => t === 13);
  assert.ok(shallow >= 0, 'Marées : liseré peu profond présent');
  assert.ok(E.astar(m0, m0.spawn.x, m0.spawn.y, m0.retour.x, m0.retour.y), 'chemin spawn -> retour ville (praticable)');
  // retour ville à ≤ 6 tuiles du spawn
  const dRet = Math.hypot(m0.retour.x + .5 - m0.spawn.x, m0.retour.y + .5 - m0.spawn.y);
  assert.ok(dRet <= 6, `retour à ${dRet.toFixed(1)} tuiles du spawn (≤ 6)`);
  // pas de masse d'eau au centre : l'étang intérieur = layout.pond uniquement
  let interiorWater = 0;
  for (let y = 2; y < m0.h - 6; y++) for (let x = 2; x < m0.w - 2; x++) if (m0.terr[m0.idx(x, y)] === E.ET.EAU) interiorWater++;
  assert.ok(interiorWater <= 20, `étang intérieur contenu (${interiorWater} tuiles EAU)`);
  // 5 zones : config water en data
  for (const z of D.zones) assert.ok(z.errance?.water && Number.isInteger(z.errance.water.liseré), `${z.id}: errance.water.liseré en data`);
  // rescueHeroPos secourt une position devenue EAU_PROFONDE
  const m = E.genZoneMap(D.zones[0]);
  let deepTile = null;
  for (let y = 0; y < m.h && !deepTile; y++) for (let x = 0; x < m.w; x++) if (m.terr[m.idx(x, y)] === 12) { deepTile = { x, y }; break; }
  const r = E.rescueHeroPos(m, deepTile.x + .5, deepTile.y + .5);
  assert.ok(![2, 3, 4, 7, 8, 9, 10, 12].includes(m.terr[m.idx(Math.floor(r.x), Math.floor(r.y))]), 'secours hors de l’eau profonde');
});

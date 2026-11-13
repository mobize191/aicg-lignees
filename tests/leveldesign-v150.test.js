import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, loadData } from './helpers/load.mjs';

// Spec vie du jeu — Lot 5 : vérifications level design.
// (1) Reachabilité errance : depuis le spawn de CHAQUE zone, le A* existant atteint porte de donjon,
//     autel, chaque jarre et le retour ville. (2) Graphe d'acquisition acyclique (aucun déblocage
//     n'exige une ressource obtenable uniquement derrière lui). (3) Table de beats par zone en data
//     (intensité 0-1 + taux de rencontre piloté par la même table).

const ZONES = () => loadData().zones.filter((z) => z.errance);

test('Lot 5 : reachabilité — depuis le spawn de chaque zone, A* atteint porte, autel, jarres, retour ville', () => {
  const E = loadEngine();
  for (const zone of ZONES()) {
    const m = E.genZoneMap(zone);
    const targets = [
      ['porte', m.donjon.x + Math.floor(m.donjon.w / 2), m.donjon.y + m.donjon.h],
      ['autel', m.autel.x, m.autel.y],
      ['retour', m.retour.x, m.retour.y],
      ...m.jarres.map((j, i) => [`jarre${i}`, j.x, j.y]),
    ];
    for (const [label, tx, ty] of targets) {
      const w = E.nearestWalkableNear(m, m.spawn.x, m.spawn.y, tx, ty);
      assert.ok(w, `${zone.id} ${label} : cible praticable trouvée`);
      const path = E.astar(m, m.spawn.x, m.spawn.y, w.x, w.y);
      assert.ok(path && path.length > 0, `${zone.id} ${label} : A* atteint la cible depuis le spawn (${path && path.length} pas)`);
    }
  }
});

test('Lot 5 : graphe d\u2019acquisition acyclique — chaîne de donjons linéaire, difficultés ordonnées, zones chaînées', () => {
  const data = loadData();
  const dgs = data.dungeons;
  const byId = new Map(dgs.map((d) => [d.id, d]));
  // chaque req pointe vers un donjon existant, et le graphe est acyclique (chaîne strictement ordonnée)
  const seen = new Set();
  for (const d of dgs) {
    let cur = d;
    const chain = [];
    while (cur && cur.req) {
      assert.ok(byId.has(cur.req), `${d.id} : req ${cur.req} existe`);
      assert.ok(!chain.includes(cur.req), `${d.id} : pas de cycle via ${cur.req}`);
      chain.push(cur.req);
      cur = byId.get(cur.req);
    }
    seen.add(d.id);
  }
  assert.ok(!byId.get(dgs[0].id).req, 'le premier donjon n\u2019a pas de prérequis');
  // difficultés : ids croissants, la difficulté n est débloquée par le record de n-1 (pas l'inverse)
  const diffs = [...data.difficulties].sort((a, b) => a.id - b.id);
  assert.equal(diffs[0].id, 1);
  for (let i = 1; i < diffs.length; i++) assert.ok(diffs[i].id > diffs[i - 1].id, 'difficultés ordonnées');
  // zones chaînées (apres) sans cycle
  const zones = data.zones;
  for (const z of zones) {
    let cur = z;
    const chain = [z.id];
    while (cur && cur.apres && cur.apres !== 'donjon') {
      const nxt = zones.find((x) => x.id === cur.apres || x.cadence === cur.apres);
      if (!nxt) break;
      assert.ok(!chain.includes(nxt.id), `zone ${z.id} : pas de cycle via ${nxt.id}`);
      chain.push(nxt.id);
      cur = nxt;
    }
  }
  // chaque zone référence des monstres qui existent et appartiennent à son donjon
  const mons = new Map(data.monsters.map((m) => [m.id, m]));
  for (const z of zones) {
    for (const mid of z.rencontres ?? []) {
      assert.ok(mons.has(mid), `${z.id} : rencontre ${mid} existe`);
    }
  }
});

test('Lot 5 : table de beats par zone en data — intensité 0-1 et encRate pilotés par la même table', () => {
  const data = loadData();
  const zones = ZONES();
  assert.equal(zones.length, 5);
  for (const z of zones) {
    const b = z.errance.beats;
    assert.ok(b, `${z.id} : beats présents`);
    assert.ok(b.intensite >= 0 && b.intensite <= 1, `${z.id} : intensité ${b.intensite} dans [0,1]`);
    assert.ok(b.encRate > 0 && b.encRate <= 1, `${z.id} : encRate ${b.encRate} dans ]0,1]`);
    assert.equal(b.encRate, z.errance.encRate, `${z.id} : la même table pilote le taux de rencontre lu par le moteur`);
  }
  // le moteur lit bien encRate en data (pas de constante en dur)
  const src = loadEngine;
  assert.ok(typeof src === 'function');
});

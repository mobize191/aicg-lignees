import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadEngine, loadData } from './helpers/load.mjs';

// correctifs v1.40 : déclenchement robuste des interactions d'errance — hitbox élargie
// (bâtiment donjon + anneau, 8-voisinage), toast de confirmation, tuile praticable au
// 8-voisinage (repli ±2), déclenchement immédiat à portée, seuil en data (1,9),
// toast « chemin bloqué » si A* échoue/abandonne, retour ville -> #accueil (hub-ville).

const ZONES = () => loadData().zones.filter((z) => z.errance);

test('v1.40 (a) génératif : pour les 5 zones, chaque interaction (porte, retour, autel) a une tuile praticable à <= seuil du centre', () => {
  const E = loadEngine();
  const zones = ZONES();
  assert.equal(zones.length, 5, '5 zones avec errance');
  const RADIUS = loadData().engine.ERRANCE_ARRIVAL_RADIUS ?? 1.9;
  for (const zone of zones) {
    const m = E.genZoneMap(zone);
    const targets = [
      { type: 'porte', x: m.donjon.x + Math.floor(m.donjon.w / 2), y: m.donjon.y + m.donjon.h },
      { type: 'retour', x: m.retour.x, y: m.retour.y },
      { type: 'autel', x: m.autel.x, y: m.autel.y },
    ];
    for (const t of targets) {
      const w = E.nearestWalkableNear(m, m.spawn.x, m.spawn.y, t.x, t.y);
      assert.ok(w, `${zone.id} ${t.type} : une tuile praticable existe près de la cible`);
      const d = Math.hypot(w.x + .5 - (t.x + .5), w.y + .5 - (t.y + .5));
      assert.ok(d <= RADIUS, `${zone.id} ${t.type} : praticable à ${d.toFixed(2)} <= seuil ${RADIUS} (8-voisinage prioritaire)`);
    }
  }
});

test('v1.40 (b) hitbox : un clic sur un mur du bâtiment ou l\\u2019anneau vaut la porte ; 8-voisinage vaut autel/retour', () => {
  const E = loadEngine();
  const zone = ZONES()[0];
  const m = E.genZoneMap(zone);
  const d = m.donjon;
  // clic sur un mur du bâtiment (hitbox élargie)
  const onWall = E.interactAt(m, d.x, d.y, m.spawn.x, m.spawn.y, []);
  assert.equal(onWall?.type, 'porte', 'clic sur le mur du donjon -> porte');
  // clic sur l'anneau autour du bâtiment
  const onRing = E.interactAt(m, d.x - 1, d.y + 1, m.spawn.x, m.spawn.y, []);
  assert.equal(onRing?.type, 'porte', 'clic sur l\\u2019anneau -> porte');
  // clic à côté de l'autel (8-voisinage)
  const onAutel = E.interactAt(m, m.autel.x + 1, m.autel.y, m.spawn.x, m.spawn.y, []);
  assert.equal(onAutel?.type, 'autel', 'clic à côté de l\\u2019autel -> autel');
  // clic à côté du retour
  const onRetour = E.interactAt(m, m.retour.x, m.retour.y - 1, m.spawn.x, m.spawn.y, []);
  assert.equal(onRetour?.type, 'retour', 'clic à côté du retour -> retour');
  // case loin de tout -> rien
  const none = E.interactAt(m, 1, 1, m.spawn.x, m.spawn.y, []);
  assert.equal(none, null, 'case vide -> pas d\\u2019interaction');
});

test('v1.40 (c) déclenchement : héros adjacent avec pending posé -> ev.arrived part au stepErrance', () => {
  const E = loadEngine();
  const zone = ZONES()[0];
  const st = E.createErranceState(zone.id);
  const m = st.map;
  // place le héros à côté de l'autel, chemin vide
  st.hero.x = m.autel.x + 0.5; st.hero.y = m.autel.y - 1 + 0.5; st.hero.path = []; st.lastTile = -1; st.grace = 99;
  st.pending = { type: 'autel', x: m.autel.x, y: m.autel.y, label: 'l\\u2019autel' };
  const ev = E.stepErrance(st, 0.05, () => 1);
  assert.equal(ev.arrived?.type, 'autel', 'arrivée déclenchée à portée');
  assert.equal(st.pending, null, 'pending consommé');
});

test('v1.40 (d) héros déjà à portée : déclenchement immédiat sans mouvement (seuil en data 1,9)', () => {
  const E = loadEngine();
  const D = loadData();
  const RADIUS = D.engine.ERRANCE_ARRIVAL_RADIUS;
  assert.ok(Math.abs(RADIUS - 1.9) < 1e-9, 'seuil recalé à 1,9 en data');
  const zone = ZONES()[0];
  const st = E.createErranceState(zone.id);
  const m = st.map;
  const porte = { x: m.donjon.x + Math.floor(m.donjon.w / 2), y: m.donjon.y + m.donjon.h };
  st.hero.x = porte.x + 0.5; st.hero.y = porte.y + 1 + 0.5; // distance 1.0 < 1.9
  st.hero.path = []; st.grace = 99;
  st.lastTile = Math.floor(st.hero.x) * 1000 + Math.floor(st.hero.y); // même tuile : aucun pas ne sera compté
  st.pending = { type: 'porte', x: porte.x, y: porte.y, label: 'la porte du donjon' };
  const ev = E.stepErrance(st, 0.05, () => 1);
  assert.equal(ev.arrived?.type, 'porte', 'porte déclenchée immédiatement, héros immobile');
  assert.equal(ev.steps, 0, 'aucun pas consommé');
});

test('v1.40 (e) retour ville -> #accueil (hub-ville) + toast « chemin bloqué » sur A* abandonné', () => {
  const src = readFileSync('src/ui.js', 'utf8');
  assert.ok(/o\.type === 'retour'[\s\S]{0,200}go\('#accueil'\)/.test(src), 'retour ville envoie vers #accueil');
  assert.ok(!/o\.type === 'retour'[\s\S]{0,200}go\('#terres'\)/.test(src), 'plus de retour vers #terres');
  assert.ok(/Chemin bloqué vers/.test(src), 'toast explicite si le chemin est bloqué');
  assert.ok(/ev\.abandoned && st\.pending/.test(src), 'pending annulé avec toast si A* abandonne');
});

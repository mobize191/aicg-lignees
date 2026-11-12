// src/errance.js — errance top-down (zone témoin Marées puis généralisation)
// Logique pure, testable sans DOM : génération déterministe de la carte (seed en data/zones.json),
// A* 8 directions + lissage, rencontres au pas dans les hautes herbes, interactions (autel, collectables, donjon).
// Guide : docs/design/errance-topdown.md

// codes terrain
const ET = { PRAIRIE: 0, CHEMIN: 1, EAU: 2, ARBRE: 3, MUR_DONJON: 4, PORTE: 5, HERBES: 6, MAISON: 7, AUTEL: 8, ROCHER: 9, JARRE: 10, RETOUR: 11 };
const SOLID = new Set([ET.EAU, ET.ARBRE, ET.MUR_DONJON, ET.MAISON, ET.AUTEL, ET.ROCHER, ET.JARRE]);

function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

// génère la carte d'une zone : Uint8Array + objets interactifs, déterministe (seed de la zone)
// refonte errance lot 3 : si la zone porte un errance.layout en data (style maquette), il est consommé
// (chemin sinueux par waypoints, étang à l'échelle, huttes, point de retour ville) ; sinon repli sur le générateur historique.
function genZoneMap(zone) {
  const w = zone.errance?.map?.w ?? 46;
  const h = zone.errance?.map?.h ?? 32;
  const t = zone.errance?.map?.t ?? 36;
  const rnd = lcg(zone.errance?.seed ?? 20261110);
  const terr = new Uint8Array(w * h);
  const idx = (x, y) => y * w + x;
  const inb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  // ceinture d'eau + arbres en bordure (commun aux deux générateurs)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) terr[idx(x, y)] = (rnd() < 0.6 ? ET.EAU : ET.ARBRE);
    else terr[idx(x, y)] = ET.PRAIRIE;
  }
  const layout = zone.errance?.layout;
  let donjon, autel, spawn, jarres = [], retour = null, huttes = [];
  if (layout) {
    // chemin sinueux par waypoints (largeur ~3 tuiles, style maquette)
    const wp = layout.waypoints ?? [[Math.floor(w / 2), h - 3], [Math.floor(w / 2), Math.floor(h / 2)], [Math.floor(w / 2), 3]];
    const line = (a, b) => {
      const steps = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) + 1;
      for (let s = 0; s <= steps; s++) {
        const cx = Math.round(a[0] + (b[0] - a[0]) * s / steps), cy = Math.round(a[1] + (b[1] - a[1]) * s / steps);
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++)
          if (inb(cx + dx, cy + dy) && terr[idx(cx + dx, cy + dy)] === ET.PRAIRIE) terr[idx(cx + dx, cy + dy)] = ET.CHEMIN;
      }
    };
    for (let i = 0; i < wp.length - 1; i++) line(wp[i], wp[i + 1]);
    // étang à l'échelle (ellipse en tuiles)
    if (layout.pond) {
      const p = layout.pond;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const dxn = (x - p.x) / p.rx, dyn = (y - p.y) / p.ry;
        if (dxn * dxn + dyn * dyn < 1 && terr[idx(x, y)] === ET.PRAIRIE) terr[idx(x, y)] = ET.EAU;
      }
    }
    // patchs de hautes herbes
    for (const p of layout.patches ?? []) {
      for (let y = p[1]; y < p[1] + p[3]; y++) for (let x = p[0]; x < p[0] + p[2]; x++)
        if (inb(x, y) && terr[idx(x, y)] === ET.PRAIRIE) terr[idx(x, y)] = ET.HERBES;
    }
    // arbres épars puis rochers
    let placed = 0, tries = 0;
    while (placed < (layout.trees ?? 30) && tries++ < 600) {
      const x = 1 + Math.floor(rnd() * (w - 2)), y = 1 + Math.floor(rnd() * (h - 2));
      if (terr[idx(x, y)] === ET.PRAIRIE) { terr[idx(x, y)] = ET.ARBRE; placed++; }
    }
    let rocks = 0; tries = 0;
    while (rocks < (layout.rocks ?? 8) && tries++ < 600) {
      const x = 2 + Math.floor(rnd() * (w - 4)), y = 2 + Math.floor(rnd() * (h - 4));
      if (terr[idx(x, y)] === ET.PRAIRIE) { terr[idx(x, y)] = ET.ROCHER; rocks++; }
    }
    // huttes décoratives (dialogues)
    for (const hu of layout.huttes ?? []) {
      if (inb(hu.x, hu.y) && terr[idx(hu.x, hu.y)] === ET.PRAIRIE) {
        terr[idx(hu.x, hu.y)] = ET.MAISON;
        huttes.push({ x: hu.x, y: hu.y, type: 'maison', title: hu.title ?? 'Hutte', text: hu.text ?? '' });
      }
    }
    // bâtiment donjon (murs + porte au sud), autel, point de retour ville
    donjon = { x: layout.donjon?.x ?? w - 8, y: layout.donjon?.y ?? 3, w: layout.donjon?.w ?? 2, h: layout.donjon?.h ?? 2 };
    for (let dy = 0; dy < donjon.h; dy++) for (let dx = 0; dx < donjon.w; dx++) if (inb(donjon.x + dx, donjon.y + dy)) terr[idx(donjon.x + dx, donjon.y + dy)] = ET.MUR_DONJON;
    terr[idx(donjon.x + Math.floor(donjon.w / 2), donjon.y + donjon.h)] = ET.PORTE;
    autel = { x: layout.autel?.x ?? 5, y: layout.autel?.y ?? h - 6 };
    if (inb(autel.x, autel.y) && terr[idx(autel.x, autel.y)] === ET.PRAIRIE) terr[idx(autel.x, autel.y)] = ET.AUTEL;
    if (layout.retour && inb(layout.retour.x, layout.retour.y) && terr[idx(layout.retour.x, layout.retour.y)] === ET.PRAIRIE) {
      retour = { x: layout.retour.x, y: layout.retour.y };
      terr[idx(retour.x, retour.y)] = ET.RETOUR;
    }
    // jarres
    let nj = 0; tries = 0;
    while (nj < (layout.jarres ?? 6) && tries++ < 300) {
      const x = 3 + Math.floor(rnd() * (w - 6)), y = 3 + Math.floor(rnd() * (h - 6));
      if (inb(x, y) && terr[idx(x, y)] === ET.PRAIRIE) { terr[idx(x, y)] = ET.JARRE; jarres.push({ x, y, type: 'jarre' }); nj++; }
    }
    // spawn : praticable, sinon premier waypoint praticable
    spawn = { x: layout.spawn?.x ?? wp[0][0] + .5, y: layout.spawn?.y ?? wp[0][1] + .5 };
    const probe = { terr, idx, inb, w, h };
    if (solidT(probe, Math.floor(spawn.x), Math.floor(spawn.y))) {
      for (const wpt of wp) {
        const wx = Math.min(w - 1, Math.max(0, wpt[0])), wy = Math.min(h - 1, Math.max(0, wpt[1]));
        if (!SOLID.has(terr[idx(wx, wy)])) { spawn = { x: wx + .5, y: wy + .5 }; break; }
      }
    }
  } else {
    // générateur historique (repli) : étang 4x3, chemins en croix, patchs, rochers/arbres épars
    const ex = 6 + Math.floor(rnd() * (w - 12)), ey = 5 + Math.floor(rnd() * (h - 10));
    for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 4; dx++) if (inb(ex + dx, ey + dy)) terr[idx(ex + dx, ey + dy)] = ET.EAU;
    const cy = Math.floor(h / 2), cx = Math.floor(w / 2);
    for (let x = 2; x < w - 2; x++) terr[idx(x, cy)] = ET.CHEMIN;
    for (let y = 2; y < h - 2; y++) terr[idx(cx, y)] = ET.CHEMIN;
    const nPatch = 8 + Math.floor(rnd() * 5);
    for (let p = 0; p < nPatch; p++) {
      const px = 3 + Math.floor(rnd() * (w - 8)), py = 3 + Math.floor(rnd() * (h - 8));
      const pw = 3 + Math.floor(rnd() * 4), ph = 2 + Math.floor(rnd() * 3);
      for (let dy = 0; dy < ph; dy++) for (let dx = 0; dx < pw; dx++) {
        const x = px + dx, y = py + dy;
        if (inb(x, y) && terr[idx(x, y)] === ET.PRAIRIE) terr[idx(x, y)] = ET.HERBES;
      }
    }
    const nRock = 10 + Math.floor(rnd() * 8);
    for (let i = 0; i < nRock; i++) {
      const x = 2 + Math.floor(rnd() * (w - 4)), y = 2 + Math.floor(rnd() * (h - 4));
      if (terr[idx(x, y)] === ET.PRAIRIE) terr[idx(x, y)] = rnd() < 0.5 ? ET.ROCHER : ET.ARBRE;
    }
    donjon = { x: w - 8, y: 3, w: 2, h: 2 };
    for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) terr[idx(donjon.x + dx, donjon.y + dy)] = ET.MUR_DONJON;
    terr[idx(donjon.x, donjon.y + 2)] = ET.PORTE; // porte au sud
    autel = { x: 5, y: h - 6 };
    terr[idx(autel.x, autel.y)] = ET.AUTEL;
    for (let i = 0; i < 6; i++) {
      const x = 3 + Math.floor(rnd() * (w - 6)), y = 3 + Math.floor(rnd() * (h - 6));
      if (inb(x, y) && terr[idx(x, y)] === ET.PRAIRIE) { terr[idx(x, y)] = ET.JARRE; jarres.push({ x, y, type: 'jarre' }); }
    }
    spawn = { x: cx + 0.5, y: cy + 1.5 };
    terr[idx(cx, cy + 1)] = ET.CHEMIN;
  }
  return { w, h, t, terr, idx, inb, donjon, autel, jarres, spawn, retour, huttes, encRate: zone.errance?.encRate ?? 0.16, seed: zone.errance?.seed ?? 1 };
}

// sûreté des saves (refonte errance lot 3) : si la position persistée est solide ou orpheline (le layout a bougé),
// secourir vers la tuile praticable la plus proche du spawn (ordre déterministe)
function rescueHeroPos(map, x, y) {
  if (Number.isFinite(x) && Number.isFinite(y) && !solidT(map, Math.floor(x), Math.floor(y))) return { x, y };
  const sx = Math.floor(map.spawn.x), sy = Math.floor(map.spawn.y);
  for (let r = 0; r <= 14; r++) {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const tx = sx + dx, ty = sy + dy;
      if (!solidT(map, tx, ty)) return { x: tx + .5, y: ty + .5 };
    }
  }
  return { x: map.spawn.x, y: map.spawn.y };
}

const solidT = (m, x, y) => !m.inb(x, y) || SOLID.has(m.terr[m.idx(x, y)]);

// A* 8 directions, heuristique octile
function astar(m, sx, sy, tx, ty) {
  sx = Math.floor(sx); sy = Math.floor(sy); tx = Math.floor(tx); ty = Math.floor(ty);
  if (!m.inb(tx, ty) || SOLID.has(m.terr[m.idx(tx, ty)])) return null;
  const idx = m.idx;
  const key = (x, y) => y * m.w + x;
  const open = new Map(); // key -> {x,y,g,f,parent}
  const closed = new Set();
  const h = (x, y) => { const dx = Math.abs(x - tx), dy = Math.abs(y - ty); return Math.max(dx, dy) + 0.4142 * Math.min(dx, dy); };
  const start = { x: sx, y: sy, g: 0, f: h(sx, sy), parent: null };
  open.set(key(sx, sy), start);
  const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  let guard = 0;
  while (open.size && guard++ < 4000) {
    let bestK = -1, best = null;
    for (const [k, n] of open) if (!best || n.f < best.f) { best = n; bestK = k; }
    open.delete(bestK);
    if (best.x === tx && best.y === ty) {
      const path = [];
      let n = best;
      while (n) { path.push({ x: n.x + 0.5, y: n.y + 0.5 }); n = n.parent; }
      return path.reverse();
    }
    closed.add(bestK);
    for (const [dx, dy] of dirs) {
      const nx = best.x + dx, ny = best.y + dy;
      if (!m.inb(nx, ny)) continue;
      const t = m.terr[idx(nx, ny)];
      if (SOLID.has(t)) continue;
      if (dx !== 0 && dy !== 0 && (SOLID.has(m.terr[idx(best.x + dx, best.y)]) || SOLID.has(m.terr[idx(best.x, best.y + dy)]))) continue; // pas de coupe-corner
      const k = key(nx, ny);
      if (closed.has(k)) continue;
      const g = best.g + (dx !== 0 && dy !== 0 ? 1.4142 : 1);
      const ex = open.get(k);
      if (!ex || g < ex.g) open.set(k, { x: nx, y: ny, g, f: g + h(nx, ny), parent: best });
    }
  }
  return null;
}

// lissage par ligne de vue (string pulling simplifié)
function smoothPath(m, path) {
  if (!path || path.length < 3) return path ?? [];
  const lineOk = (a, b) => {
    const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) * 2);
    for (let i = 0; i <= steps; i++) {
      const x = Math.floor(a.x + (b.x - a.x) * (i / steps));
      const y = Math.floor(a.y + (b.y - a.y) * (i / steps));
      if (solidT(m, x, y)) return false;
    }
    return true;
  };
  const out = [path[0]];
  let i = 0;
  while (i < path.length - 1) {
    let j = path.length - 1;
    for (; j > i + 1; j--) if (lineOk(path[i], path[j])) break;
    out.push(path[j]);
    i = j;
  }
  return out;
}

// état d'errance d'une zone (persisté en sauvegarde, positions en tuiles)
function createErranceState(zoneId) {
  const zone = getZone(zoneId);
  if (!zone) throw new Error(`zone inconnue : ${zoneId}`);
  const map = genZoneMap(zone);
  return {
    zone: zoneId, map,
    hero: { x: map.spawn.x, y: map.spawn.y, path: [], speed: 3.4, v: { x: 0, y: 0 }, tilt: 0 },
    grace: 2, lastTile: -1, steps: 0,
    looted: [], broken: [], // ids d'objets persistés
    pending: null,
    goal: null, stuckTime: 0, repaths: 0, lastDist: null, // refonte IA lot 4 : anti-blocage
  };
}

// pose une cible de déplacement (clic/tap) : A* + lissage
function setTarget(st, tx, ty) {
  const path = astar(st.map, st.hero.x, st.hero.y, tx, ty);
  if (!path) return false;
  st.hero.path = smoothPath(st.map, path);
  st.pending = null;
  st.goal = { x: tx, y: ty };
  st.stuckTime = 0; st.repaths = 0; st.lastDist = null;
  return true;
}

// avance le héros le long du chemin ; retourne les événements de la frame
function stepErrance(st, dt, rng = Math.random) {
  const ev = { steps: 0, encounter: null, arrived: null };
  const hero = st.hero;
  dt = Math.min(0.05, dt); // dt borné : jamais de saut de tuile (onglet arrière-plan, iOS)
  const v = hero.v ?? (hero.v = { x: 0, y: 0 });
  const maxV = hero.speed; // tuiles/s
  // §5 pilotage inertiel : abandon des waypoints atteints ou dépassés (produit scalaire => aucune orbite)
  while (hero.path.length) {
    const w = hero.path[0];
    const dwx = w.x - hero.x, dwy = w.y - hero.y, d = Math.hypot(dwx, dwy);
    if (hero.path.length > 1) {
      const w2 = hero.path[1];
      const dot = dwx * (w2.x - w.x) + dwy * (w2.y - w.y);
      if (d < 0.5 || dot < 0) { hero.path.shift(); continue; } // « derrière » => abandonné
    } else if (d < 0.07) { hero.path.shift(); v.x = 0; v.y = 0; break; }
    break;
  }
  if (hero.path.length) {
    const w = hero.path[0];
    const dwx = w.x - hero.x, dwy = w.y - hero.y, d = Math.hypot(dwx, dwy) || 1e-6;
    // freinage progressif sur le DERNIER waypoint
    const want = hero.path.length === 1 ? Math.min(maxV, d / 0.22) : maxV;
    const dvx = (dwx / d) * want, dvy = (dwy / d) * want;
    // virage limité : virages en arc
    const turn = maxV * 5 * dt;
    let ex = dvx - v.x, ey = dvy - v.y;
    const em = Math.hypot(ex, ey) || 1e-9;
    if (em > turn) { ex = (ex / em) * turn; ey = (ey / em) * turn; }
    v.x += ex; v.y += ey;
    // intégration + collision PAR AXE (glisse le long des murs)
    const nx = hero.x + v.x * dt;
    if (!solidT(st.map, Math.floor(nx), Math.floor(hero.y))) hero.x = nx; else v.x = 0;
    const ny = hero.y + v.y * dt;
    if (!solidT(st.map, Math.floor(hero.x), Math.floor(ny))) hero.y = ny; else v.y = 0;
  } else {
    const f = Math.max(0, 1 - 8 * dt); // freinage doux sans destination
    v.x *= f; v.y *= f;
  }
  hero.tilt = (hero.tilt ?? 0) + (((v.x / maxV) * 0.09) - (hero.tilt ?? 0)) * Math.min(1, 10 * dt); // balancement
  // détection de pas = changement de tuile
  const tk = Math.floor(hero.x) * 1000 + Math.floor(hero.y);
  if (tk !== st.lastTile) {
    st.lastTile = tk;
    st.steps++;
    ev.steps++;
    const t = st.map.terr[st.map.idx(Math.floor(hero.x), Math.floor(hero.y))];
    if (st.grace > 0) st.grace--;
    else if (t === ET.HERBES && rng() < st.map.encRate) ev.encounter = true;
  }
  // refonte IA lot 4 : anti-blocage — stagnation => repath, puis abandon après échecs répétés
  const GUARDS = DATA.engine.ERRANCE_GUARDS;
  if (hero.path.length && st.goal) {
    const w = hero.path[0];
    const d = Math.hypot(w.x - hero.x, w.y - hero.y);
    if (st.lastDist == null || d < st.lastDist - GUARDS.progressEps) {
      st.lastDist = d;
      st.stuckTime = 0;
    } else {
      st.stuckTime += dt;
      if (st.stuckTime >= GUARDS.stuckAfter) {
        st.stuckTime = 0;
        st.repaths += 1;
        ev.repath = true;
        const p = astar(st.map, hero.x, hero.y, st.goal.x, st.goal.y);
        if (p) {
          hero.path = smoothPath(st.map, p);
        }
        st.lastDist = null;
        if (st.repaths > GUARDS.repathMax) {
          // changement d'état après échecs : abandon du but, arrêt propre
          hero.path = [];
          hero.v.x = 0; hero.v.y = 0;
          st.goal = null;
          st.repaths = 0;
          ev.abandoned = true;
        }
      }
    }
  }
  // arrivée sur une cible d'interaction
  if (st.pending && !hero.path.length) {
    const o = st.pending;
    if (Math.hypot(hero.x - (o.x + 0.5), hero.y - (o.y + 0.5)) < 1.6) {
      st.pending = null;
      ev.arrived = o;
    }
  }
  return ev;
}

// interaction : autel soigne (hook posé lot 1, contrat errance-topdown §8 : +5 pas de grâce)
function interactAutel(st) {
  st.grace += 5;
  return { type: 'autel' };
}

// interaction : jarre brisée -> lâche un collectable (éclat brut), redevient hautes herbes
function interactJarre(st, jid) {
  const j = st.map.jarres.find((x) => `jarre-${x.x}-${x.y}` === jid);
  if (!j || st.broken.includes(jid)) return null;
  st.broken.push(jid);
  st.map.terr[st.map.idx(j.x, j.y)] = ET.HERBES;
  return { type: 'jarre', loot: 'eclat' };
}

// ordre de déblocage des zones : suivre l'ordre des donjons (zones.json) ; store injectable pour les tests
function erranceStore(st) {
  return st ?? (typeof store !== 'undefined' ? store : { zonesUnlocked: [] });
}

function zoneUnlocked(zoneId, st) {
  const s = erranceStore(st);
  const order = (DATA.zones ?? []).map((z) => z.id);
  const i = order.indexOf(zoneId);
  if (i <= 0) return true; // la zone de départ (eau) est toujours ouverte
  const prev = order[i - 1];
  return (s.zonesUnlocked ?? []).includes(prev) || (s.zonesUnlocked ?? []).includes(zoneId);
}

function unlockZone(zoneId, st) {
  const s = erranceStore(st);
  s.zonesUnlocked = s.zonesUnlocked ?? [];
  if (!s.zonesUnlocked.includes(zoneId)) s.zonesUnlocked.push(zoneId);
}

// src/errance-paint.js — peinture de l'errance, style maquette A+ (docs/design/maquettes/errance-demo-jouable.html)
// Partie pure testable : errancePalette (data/zones.json, clé errance.paint, défauts intégrés),
// decorOrders + buildAmbiance (RNG déterministe dérivé du seed de zone, ordre d'appel fixe — guide §2).
// Partie canvas : paintZoneBase (pré-rendu offscreen unique, guide §3) + paintTileGround (re-peinture locale,
// ex. jarre cassée — les objets cassables restent dessinés par frame, jamais cuits, guide §8).
// Guide : docs/design/errance-topdown.md

function errancePalette(zone) {
  const p = (zone && zone.errance && zone.errance.paint) || {};
  const d = {
    grassTop: '#82b96b', grassBottom: '#4f8c4b',
    blotchLight: 'rgba(255,255,200,.05)', blotchDark: 'rgba(18,66,32,.08)', blotchMid: 'rgba(62,122,56,.06)',
    pathBase: '#b3945f', pathCore: '#d3b285', pathRut: 'rgba(120,95,60,.35)', pathStone: 'rgba(90,75,50,.5)',
    sand: '#c9b083', sandDark: '#a8926b',
    water0: '#78c2de', water1: '#4b8db0', water2: '#27556f', waterDeep: 'rgba(20,50,70,.25)', waterGlint: 'rgba(255,255,255,.35)',
    waterShallow0: 'rgba(170,225,240,.8)', waterShallow1: 'rgba(110,185,210,.6)', waterShallowGlint: 'rgba(255,255,255,.5)',
    reed: '#5e8a4a', reedTip: '#7a5b3a', lily: '#4c8a4f', lilyCut: '#2b5f80', lilyFlower: '#ffd76e',
    herbSocleDark: 'rgba(24,62,32,.85)', herbSocle: 'rgba(46,104,50,.5)',
    bladeA: '#3f8a42', bladeB: '#2e6b34',
    flowerCols: ['#ffd76e', '#e8a4c8', '#ffffff', '#c9a0f0'],
    borderFlowerCols: ['#ffd76e', '#e8a4c8', '#ffffff'],
    tuftDark: 'rgba(40,92,46,.55)', tuftLight: 'rgba(76,132,62,.5)', stem: '#3d7a41', petalCore: '#ffe9a8',
    stone: '#8d9188', stoneLight: 'rgba(255,255,255,.35)', stoneShadow: 'rgba(0,0,0,.22)',
    trunk: '#4a3527', trunkDark: 'rgba(0,0,0,.25)',
    leafDark: '#295c3b', leafMid: '#33704a', leafLight: '#3f8253', leafGlow: 'rgba(210,255,195,.3)', leafShade: 'rgba(20,50,30,.3)',
    rock: '#8d9188', rockLight: '#a3a89e', rockDark: '#6f7268', moss: 'rgba(70,120,70,.55)',
    donjonWall: '#6b5a49', donjonRoof: '#4c4036', donjonRoofLight: 'rgba(255,255,255,.12)', donjonTrim: '#57503f', donjonBrick: 'rgba(0,0,0,.16)', donjonMoss: 'rgba(70,120,65,.5)', donjonDoor: '#241c15', donjonGlow: 'rgba(255,215,110,.85)',
    autelBase: '#7a7468', autelTop: '#918a7c', autelGlow: 'rgba(140,220,255,.8)', autelRing: 'rgba(160,235,255,.9)',
    houseWall: '#8a6f56', houseRoof: '#6d4a3a', houseRoofLight: 'rgba(255,255,255,.13)', housePlanks: 'rgba(60,40,25,.3)', houseChimney: '#8a8378', houseChimneyTop: '#6d675e', houseDoor: '#241c15', houseWindow: '#3a2c20', houseGlow: 'rgba(255,215,110,.95)',
    retourWall: '#6f6a80', retourRoof: '#4a4660', retourGlow: 'rgba(160,235,255,.8)', retourDoor: '#1c2030',
    shadow: 'rgba(0,0,0,.3)',
    potBody: '#b5714a', potLight: '#cf8a5c', potDark: '#8a4f33', potLine: 'rgba(90,45,25,.5)', shard: '#a06a48',
    ground: '#0d1410',
  };
  return Object.assign({}, d, p);
}

// ordres de décor déterministes (seed de zone), ordre d'appel fixe — reproductibles à l'identique
function decorOrders(map, zone) {
  const T = map.t, W = map.w * T, H = map.h * T;
  const rnd = lcg((map.seed ^ 0x9e3779b9) >>> 0);
  const pal = errancePalette(zone);
  const terr = map.terr, idx = map.idx;
  const at = (px, py) => terr[idx(Math.floor(px / T), Math.floor(py / T))];
  const blotches = [];
  for (let i = 0; i < 1500; i++) {
    const x = rnd() * W, y = rnd() * H, r = 12 + rnd() * 55, q = rnd();
    blotches.push({ x, y, r, rot: rnd() * 3, c: q < .3 ? pal.blotchLight : q < .55 ? pal.blotchDark : pal.blotchMid });
  }
  const details = [];
  for (let i = 0; i < 1500; i++) {
    const x = rnd() * W, y = rnd() * H;
    if (at(x, y) !== ET.PRAIRIE) continue;
    const r = rnd();
    if (r < .07) details.push({ x, y, kind: 'flower', col: pal.flowerCols[Math.floor(rnd() * pal.flowerCols.length)] });
    else if (r < .12) details.push({ x, y, kind: 'stone', s: rnd() });
    else details.push({ x, y, kind: 'tuft', n: 2 + Math.floor(rnd() * 3), dark: rnd() < .5 });
  }
  const pathCircles = [], pathRuts = [], pathStones = [];
  for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) if (terr[idx(x, y)] === ET.CHEMIN) {
    pathCircles.push({ cx: x * T + T / 2, cy: y * T + T / 2, r: T * (.85 + rnd() * .15), coreDx: (rnd() - .5) * 6, coreDy: (rnd() - .5) * 6, coreR: T * (.52 + rnd() * .2) });
  }
  for (let i = 0; i < 900; i++) { const x = rnd() * W, y = rnd() * H; if (at(x, y) === ET.CHEMIN) pathRuts.push({ x, y, rx: 2 + rnd() * 4, ry: 1 + rnd() * 2, rot: rnd() * 3 }); }
  for (let i = 0; i < 260; i++) { const x = rnd() * W, y = rnd() * H; if (at(x, y) === ET.CHEMIN) pathStones.push({ x, y, r: 1 + rnd() * 1.6 }); }
  // étang peint : amas d'eau INTÉRIEUR uniquement (ceinture de bord x/y ∈ {0, w-1, h-1} exclue —
  // correctif v1.36.1 lot 1 « grand lac »), débordement plafonné à 0,25·T hors tuiles EAU.
  // Si la zone porte layout.pond en data, le pond peint en découle (mêmes tuiles EAU).
  let pond = null;
  {
    let n = 0, minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    for (let y = 1; y < map.h - 1; y++) for (let x = 1; x < map.w - 1; x++) if (terr[idx(x, y)] === ET.EAU) {
      n++; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
    }
    if (n > 0) {
      // aucun débordement d'eau hors tuiles EAU (garde-fou v1.36.1) : on rétrécit l'ellipse tant qu'une
      // tuile non-EAU a son centre dans (rx + 0,25·T, ry + 0,25·T) — l'anneau de sable peint prend +0,25·T max
      let rx = (maxx - minx + 1) / 2 * T, ry = (maxy - miny + 1) / 2 * T;
      const cx = (minx + maxx) / 2 * T + T / 2, cy = (miny + maxy) / 2 * T + T / 2;
      let guard = 0;
      while (guard++ < 40) {
        let bad = false;
        for (let y = 1; y < map.h - 1 && !bad; y++) for (let x = 1; x < map.w - 1; x++) {
          if (terr[idx(x, y)] === ET.EAU) continue;
          const dxn = (x * T + T / 2 - cx) / rx;
          const dyn = (y * T + T / 2 - cy) / ry;
          if (dxn * dxn + dyn * dyn < 1) { bad = true; break; }
        }
        if (!bad) break;
        rx = Math.max(T * .5, rx - T * .25);
        ry = Math.max(T * .5, ry - T * .25);
      }
      pond = { cx, cy, rx, ry };
    }
  }
  const pondDeep = [], pondGlints = [], lilies = [], reeds = [];
  if (pond) {
    for (let i = 0; i < 6; i++) pondDeep.push({ x: pond.cx + (rnd() - .5) * pond.rx * 1.2, y: pond.cy + (rnd() - .5) * pond.ry * 1.2, rx: 20 + rnd() * 30, ry: 8 + rnd() * 14, rot: rnd() * 3 });
    for (let i = 0; i < 9; i++) {
      const a = rnd() * 7;
      pondGlints.push({ x: pond.cx + Math.cos(a) * pond.rx * (0.2 + rnd() * 0.6), y: pond.cy + Math.sin(a) * pond.ry * (0.2 + rnd() * 0.6), w: 20 + rnd() * 26 });
    }
    const lilyOff = [[-.7, -.3], [.45, .1], [-.25, .58], [.2, -.58]];
    for (const o of lilyOff) lilies.push({ x: pond.cx + o[0] * pond.rx * .8, y: pond.cy + o[1] * pond.ry * .8 });
    for (let i = 0; i < 9; i++) {
      const a = -2.4 + i * .6;
      reeds.push({ x: pond.cx + Math.cos(a) * (pond.rx - 2), y: pond.cy + Math.sin(a) * (pond.ry - 2), h: 22 + rnd() * 8 });
    }
  }
  // hautes herbes : socles par tuile, lames animées, bordure de fleurs sur les tuiles en lisière
  const herbSocles = [], blades = [], borderFlowers = [];
  for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) {
    if (terr[idx(x, y)] !== ET.HERBES) continue;
    const cx = x * T + T / 2, cy = y * T + T / 2;
    herbSocles.push({ cx, cy });
    for (let k = 0; k < 6; k++) {
      blades.push({ x: (x + .12 + rnd() * .76) * T, y: (y + .25 + rnd() * .7) * T, h: 12 + rnd() * 11, ph: rnd() * 7, c: rnd() < .5 ? pal.bladeA : pal.bladeB });
    }
    const edge = (terr[idx(Math.max(0, x - 1), y)] === ET.PRAIRIE) || (terr[idx(Math.min(map.w - 1, x + 1), y)] === ET.PRAIRIE)
      || (terr[idx(x, Math.max(0, y - 1))] === ET.PRAIRIE) || (terr[idx(x, Math.min(map.h - 1, y + 1))] === ET.PRAIRIE);
    if (edge) {
      for (let k = 0; k < 4; k++) {
        const fx = cx + (rnd() - .5) * T * 1.7, fy = cy + (rnd() - .5) * T * 1.7;
        if (at(fx, fy) !== ET.PRAIRIE) continue;
        borderFlowers.push({ x: fx, y: fy, col: pal.borderFlowerCols[Math.floor(rnd() * pal.borderFlowerCols.length)] });
      }
    }
  }
  return { blotches, details, pathCircles, pathRuts, pathStones, pond, pondDeep, pondGlints, lilies, reeds, herbSocles, blades, borderFlowers };
}

// couche d'ambiance (guide §9bis) : entités animées, RNG déterministe dérivé du seed
function buildAmbiance(map, zone) {
  const T = map.t, W = map.w * T, H = map.h * T;
  const rnd = lcg((map.seed ^ 0x51ab3f) >>> 0);
  const amb = (zone && zone.errance && zone.errance.ambiance) || {};
  const N = (n) => Array.from({ length: n }, () => 0);
  return {
    dayLen: amb.dayLen ?? 100,
    flies: N(42).map(() => ({ x: rnd() * W, y: rnd() * H, ph: rnd() * 7, sp: .4 + rnd() * .8, r: 1.4 + rnd() * 1.6 })),
    butterflies: N(6).map((_, i) => ({ x: rnd() * W, y: rnd() * H, ph: rnd() * 7, sp: .6 + rnd() * .5, fl: rnd() * 7, col: ['#ffd76e', '#e8a4c8', '#c9a0f0'][i % 3] })),
    seeds: N(10).map(() => ({ x: rnd() * W, y: rnd() * H, ph: rnd() * 7 })),
    leaves: N(14).map(() => ({ x: rnd() * W, y: rnd() * H, ph: rnd() * 7, sp: .5 + rnd() * .7, rot: rnd() * 7, rs: (rnd() - .5) * 2.5 })),
    clouds: N(3).map(() => ({ x: rnd() * W, y: rnd() * H, s: 1 + rnd() * .4, v: 5 + rnd() * 6 })),
    chimneys: (map.huttes ?? []).map((h) => ({ x: (h.x + .4) * T, y: h.y * T })),
    prints: [], sparkles: [],
  };
}

function paintZoneBase(bx, map, zone) {
  const T = map.t, W = map.w * T, H = map.h * T;
  const pal = errancePalette(zone);
  const decor = map.decor ?? (map.decor = decorOrders(map, zone));
  const terr = map.terr, idx = map.idx;
  bx.imageSmoothingEnabled = true;
  if (bx.imageSmoothingQuality) bx.imageSmoothingQuality = 'high';
  // 1. fond : dégradé vertical + taches organiques
  const g = bx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, pal.grassTop); g.addColorStop(1, pal.grassBottom);
  bx.fillStyle = g; bx.fillRect(0, 0, W, H);
  for (const b of decor.blotches) { bx.fillStyle = b.c; bx.beginPath(); bx.ellipse(b.x, b.y, b.r, b.r * .55, b.rot, 0, 7); bx.fill(); }
  // 2. micro-détails de prairie
  for (const d of decor.details) {
    if (d.kind === 'flower') {
      bx.strokeStyle = pal.stem; bx.lineWidth = 1.3;
      bx.beginPath(); bx.moveTo(d.x, d.y); bx.lineTo(d.x, d.y - 5); bx.stroke();
      bx.fillStyle = d.col;
      for (let p = 0; p < 4; p++) { const a = p / 4 * 7; bx.beginPath(); bx.arc(d.x + Math.cos(a) * 2.3, d.y - 6 + Math.sin(a) * 2.3, 1.5, 0, 7); bx.fill(); }
      bx.fillStyle = pal.petalCore; bx.beginPath(); bx.arc(d.x, d.y - 6, 1.2, 0, 7); bx.fill();
    } else if (d.kind === 'stone') {
      bx.fillStyle = pal.stoneShadow; bx.beginPath(); bx.ellipse(d.x + .6, d.y + 1.2, 2.7, 1.4, 0, 0, 7); bx.fill();
      bx.fillStyle = pal.stone; bx.beginPath(); bx.ellipse(d.x, d.y, 2.4 + d.s * 2, 1.8 + d.s * 1.4, d.s * 3, 0, 7); bx.fill();
      bx.fillStyle = pal.stoneLight; bx.beginPath(); bx.ellipse(d.x - .8, d.y - .8, 1.1, .7, 0, 0, 7); bx.fill();
    } else {
      bx.strokeStyle = d.dark ? pal.tuftDark : pal.tuftLight;
      bx.lineWidth = 1.4; bx.beginPath();
      for (let k = 0; k < d.n; k++) { const ox = (k - d.n / 2) * 2.6; bx.moveTo(d.x + ox, d.y); bx.quadraticCurveTo(d.x + ox + 1.5, d.y - 3.5, d.x + ox, d.y - 6 - ((k * 7919) % 10) / 10 * 3); }
      bx.stroke();
    }
  }
  // 3. chemin de terre : base large, cœur clair, ornières, cailloux
  bx.fillStyle = pal.pathBase;
  for (const c of decor.pathCircles) { bx.beginPath(); bx.arc(c.cx, c.cy, c.r, 0, 7); bx.fill(); }
  bx.fillStyle = pal.pathCore;
  for (const c of decor.pathCircles) { bx.beginPath(); bx.arc(c.cx + c.coreDx, c.cy + c.coreDy, c.coreR, 0, 7); bx.fill(); }
  bx.fillStyle = pal.pathRut;
  for (const r of decor.pathRuts) { bx.beginPath(); bx.ellipse(r.x, r.y, r.rx, r.ry, r.rot, 0, 7); bx.fill(); }
  bx.fillStyle = pal.pathStone;
  for (const s of decor.pathStones) { bx.beginPath(); bx.arc(s.x, s.y, s.r, 0, 7); bx.fill(); }
  // 4. eau : EAU/EAU_PROFONDE = sombre opaque (infranchissable) ; EAU_PEU_PROFONDE = claire translucide avec reflets (praticable) ; SABLE = plage
  for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) {
    const tt = terr[idx(x, y)];
    if (tt === ET.EAU || tt === ET.EAU_PROFONDE) {
      const gw0 = bx.createRadialGradient(x * T + T / 2 - 6, y * T + T / 2 - 8, 2, x * T + T / 2, y * T + T / 2, T * .9);
      gw0.addColorStop(0, pal.water0); gw0.addColorStop(1, pal.water2);
      bx.fillStyle = gw0; bx.fillRect(x * T, y * T, T, T);
    } else if (tt === ET.EAU_PEU_PROFONDE) {
      bx.fillStyle = pal.sand; bx.fillRect(x * T, y * T, T, T);
      const gw1 = bx.createRadialGradient(x * T + T / 2 - 4, y * T + T / 2 - 5, 2, x * T + T / 2, y * T + T / 2, T * .95);
      gw1.addColorStop(0, pal.waterShallow0); gw1.addColorStop(1, pal.waterShallow1);
      bx.fillStyle = gw1; bx.fillRect(x * T, y * T, T, T);
      bx.strokeStyle = pal.waterShallowGlint; bx.lineWidth = 1.4; bx.lineCap = 'round';
      bx.beginPath(); bx.moveTo(x * T + 6 + (x * 7 + y * 13) % 10, y * T + T * .62); bx.quadraticCurveTo(x * T + T / 2, y * T + T * .55, x * T + T - 6 - (x * 5 + y * 11) % 8, y * T + T * .66); bx.stroke();
    } else if (tt === ET.SABLE) {
      bx.fillStyle = pal.sand; bx.fillRect(x * T, y * T, T, T);
      bx.fillStyle = pal.sandDark;
      for (let k = 0; k < 5; k++) { bx.beginPath(); bx.arc(x * T + ((k * 29 + x * 17 + y * 7) % 31) + 2, y * T + ((k * 19 + x * 11 + y * 23) % 29) + 2, 1 + (k % 2), 0, 7); bx.fill(); }
    }
  }
  if (decor.pond) {
    const p = decor.pond;
    bx.fillStyle = pal.sand; bx.beginPath(); bx.ellipse(p.cx, p.cy, p.rx + T * .25, p.ry + T * .25, 0, 0, 7); bx.fill();
    bx.fillStyle = pal.sandDark; bx.beginPath(); bx.ellipse(p.cx, p.cy, p.rx, p.ry, 0, 0, 7); bx.fill();
    const gw = bx.createRadialGradient(p.cx - 40, p.cy - 60, 10, p.cx, p.cy, Math.max(p.rx, p.ry));
    gw.addColorStop(0, pal.water0); gw.addColorStop(.55, pal.water1); gw.addColorStop(1, pal.water2);
    bx.fillStyle = gw; bx.beginPath(); bx.ellipse(p.cx, p.cy, p.rx - 2, p.ry - 2, 0, 0, 7); bx.fill();
    bx.fillStyle = pal.waterDeep;
    for (const d of decor.pondDeep) { bx.beginPath(); bx.ellipse(d.x, d.y, d.rx, d.ry, d.rot, 0, 7); bx.fill(); }
    bx.strokeStyle = pal.waterGlint; bx.lineWidth = 2;
    for (const gl of decor.pondGlints) { bx.beginPath(); bx.moveTo(gl.x, gl.y); bx.quadraticCurveTo(gl.x + 38, gl.y + 4, gl.x + gl.w, gl.y); bx.stroke(); }
    for (const li of decor.lilies) {
      bx.fillStyle = pal.waterDeep; bx.beginPath(); bx.ellipse(li.x + 2, li.y + 2, 14, 10, .3, 0, 7); bx.fill();
      bx.fillStyle = pal.lily; bx.beginPath(); bx.ellipse(li.x, li.y, 13, 9.5, .3, 0, 7); bx.fill();
      bx.fillStyle = pal.lilyCut; bx.beginPath(); bx.moveTo(li.x, li.y); bx.lineTo(li.x + 10, li.y + 4); bx.lineTo(li.x + 2, li.y + 8); bx.closePath(); bx.fill();
      bx.fillStyle = pal.lilyFlower; bx.beginPath(); bx.arc(li.x + 3, li.y - 1, 2.4, 0, 7); bx.fill();
    }
    for (const r of decor.reeds) {
      bx.strokeStyle = pal.reed; bx.lineWidth = 2.2;
      bx.beginPath(); bx.moveTo(r.x, r.y); bx.quadraticCurveTo(r.x + 3, r.y - 12, r.x + 1, r.y - r.h); bx.stroke();
      bx.fillStyle = pal.reedTip; bx.beginPath(); bx.ellipse(r.x + 1, r.y - r.h - 4, 2, 4.5, .2, 0, 7); bx.fill();
    }
  }
  // 5. socles des hautes herbes + bordure de fleurs (lecture visuelle des zones à rencontres)
  bx.fillStyle = pal.herbSocleDark;
  for (const s of decor.herbSocles) { bx.beginPath(); bx.ellipse(s.cx, s.cy, T * .62, T * .55, 0, 0, 7); bx.fill(); }
  bx.fillStyle = pal.herbSocle;
  for (const s of decor.herbSocles) { bx.beginPath(); bx.ellipse(s.cx + 3, s.cy + 2, T * .4, T * .3, 0, 0, 7); bx.fill(); }
  for (const f of decor.borderFlowers) {
    bx.fillStyle = f.col;
    for (let q = 0; q < 4; q++) { const qa = q / 4 * 7; bx.beginPath(); bx.arc(f.x + Math.cos(qa) * 1.8, f.y + Math.sin(qa) * 1.8, 1.3, 0, 7); bx.fill(); }
    bx.fillStyle = pal.petalCore; bx.beginPath(); bx.arc(f.x, f.y, 1, 0, 7); bx.fill();
  }
  // 6. objets : arbres en couches, rochers moussus, maisons, donjon peint, autel avec halo, porte de ville — ombre sous chaque objet
  for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) {
    if (terr[idx(x, y)] !== ET.ARBRE) continue;
    const cx = x * T + T / 2, cy = y * T + T / 2, R = 18 + ((x * 31 + y * 17) % 8);
    bx.fillStyle = pal.shadow; bx.beginPath(); bx.ellipse(cx + 4, cy + 10, R * 1.05, R * .42, 0, 0, 7); bx.fill();
    bx.fillStyle = pal.trunk; bx.fillRect(cx - 3.5, cy, 7, 13);
    bx.fillStyle = pal.trunkDark; bx.fillRect(cx + .5, cy, 3, 13);
    bx.fillStyle = pal.leafDark; bx.beginPath(); bx.arc(cx, cy - 8, R, 0, 7); bx.fill();
    bx.fillStyle = pal.leafMid;
    for (let b = 0; b < 3; b++) { bx.beginPath(); bx.arc(cx + ((b * 37 + x * 13 + y * 7) % 19) / 19 * R - R / 2, cy - 10 - (b * 11 % 10) / 10 * R * .5, R * .5, 0, 7); bx.fill(); }
    bx.fillStyle = pal.leafLight;
    for (let b = 0; b < 3; b++) { bx.beginPath(); bx.arc(cx - R * .25 + (b * 29 % 13) / 13 * R * .5, cy - 12 - (b * 7 % 10) / 10 * R * .4, R * .32, 0, 7); bx.fill(); }
    bx.fillStyle = pal.leafGlow; bx.beginPath(); bx.arc(cx - R * .3, cy - 8 - R * .45, R * .22, 0, 7); bx.fill();
    bx.fillStyle = pal.leafShade;
    for (let d2 = 0; d2 < 5; d2++) { bx.beginPath(); bx.arc(cx + ((d2 * 23 + x * 7) % 17) / 17 * R * 1.4 - R * .7, cy - 6 + (d2 * 13 % 10) / 10 * R * .7, 1.5, 0, 7); bx.fill(); }
  }
  for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) {
    if (terr[idx(x, y)] !== ET.ROCHER) continue;
    const cx = x * T + T / 2, cy = y * T + T / 2, R = 11 + ((x * 13 + y * 29) % 9);
    bx.fillStyle = 'rgba(0,0,0,.28)'; bx.beginPath(); bx.ellipse(cx + 3, cy + R * .55, R * 1.1, R * .4, 0, 0, 7); bx.fill();
    bx.fillStyle = pal.rock; bx.beginPath(); bx.ellipse(cx, cy, R, R * .75, 0, 0, 7); bx.fill();
    bx.fillStyle = pal.rockLight; bx.beginPath(); bx.ellipse(cx - R * .25, cy - R * .25, R * .6, R * .4, -.4, 0, 7); bx.fill();
    bx.fillStyle = pal.rockDark; bx.beginPath(); bx.ellipse(cx + R * .4, cy + R * .3, R * .45, R * .3, .3, 0, 7); bx.fill();
    bx.fillStyle = pal.moss;
    for (let m = 0; m < 4; m++) { bx.beginPath(); bx.arc(cx + ((m * 17 + x * 5) % 13) / 13 * R * 1.2 - R * .6, cy + ((m * 11 + y * 3) % 9) / 9 * R * .8 - R * .4, 2 + (m % 3), 0, 7); bx.fill(); }
  }
  for (const h of map.huttes ?? []) {
    const X = h.x * T, Y = h.y * T, Wd = 2 * T + 12, Hd = T + 22;
    bx.fillStyle = pal.shadow; bx.beginPath(); bx.ellipse(X + Wd / 2, Y + Hd + 2, Wd * .58, 12, 0, 0, 7); bx.fill();
    bx.fillStyle = pal.houseWall; bx.fillRect(X - 4, Y - 10, Wd, Hd);
    bx.fillStyle = pal.houseRoof; bx.beginPath(); bx.moveTo(X - 14, Y - 8); bx.lineTo(X + Wd / 2, Y - 40); bx.lineTo(X + Wd + 14, Y - 8); bx.closePath(); bx.fill();
    bx.fillStyle = pal.houseRoofLight; bx.beginPath(); bx.moveTo(X - 14, Y - 8); bx.lineTo(X + Wd / 2, Y - 40); bx.lineTo(X + Wd * .34, Y - 40); bx.lineTo(X - 14 + Wd * .2, Y - 8); bx.closePath(); bx.fill();
    bx.strokeStyle = pal.housePlanks; bx.lineWidth = 1;
    for (let yy = Y - 6; yy < Y + Hd - 26; yy += 6) { bx.beginPath(); bx.moveTo(X - 3, yy); bx.lineTo(X + Wd + 3, yy); bx.stroke(); }
    bx.fillStyle = pal.houseChimney; bx.fillRect(X + Wd * .68, Y - 26, 12, 22);
    bx.fillStyle = pal.houseChimneyTop; bx.fillRect(X + Wd * .68 - 2, Y - 28, 16, 5);
    bx.fillStyle = pal.houseDoor; bx.fillRect(X + Wd / 2 - 9, Y + Hd - 26, 18, 26);
    const wg = bx.createRadialGradient(X + 18, Y + 16, 1, X + 18, Y + 16, 15);
    wg.addColorStop(0, pal.houseGlow); wg.addColorStop(1, 'rgba(255,215,110,0)');
    bx.fillStyle = pal.houseWindow; bx.fillRect(X + 10, Y + 8, 14, 13);
    bx.fillStyle = wg; bx.beginPath(); bx.arc(X + 17, Y + 14, 15, 0, 7); bx.fill();
  }
  if (map.donjon) {
    const X = map.donjon.x * T, Y = map.donjon.y * T, Wd = map.donjon.w * T, Hd = map.donjon.h * T + 14;
    bx.fillStyle = 'rgba(0,0,0,.35)'; bx.beginPath(); bx.ellipse(X + Wd / 2, Y + Hd + 4, Wd * .62, 14, 0, 0, 7); bx.fill();
    bx.fillStyle = pal.donjonWall; bx.fillRect(X, Y + 20, Wd, Hd - 20);
    bx.fillStyle = pal.donjonRoof; bx.beginPath(); bx.moveTo(X - 8, Y + 22); bx.lineTo(X + Wd / 2, Y - 14); bx.lineTo(X + Wd + 8, Y + 22); bx.closePath(); bx.fill();
    bx.fillStyle = pal.donjonRoofLight; bx.beginPath(); bx.moveTo(X - 8, Y + 22); bx.lineTo(X + Wd / 2, Y - 14); bx.lineTo(X + Wd * .36, Y - 14); bx.lineTo(X - 8 + Wd * .22, Y + 22); bx.closePath(); bx.fill();
    bx.fillStyle = pal.donjonTrim; for (let i = 0; i < 4; i++) bx.fillRect(X + 8 + i * 57, Y + 30, 42, 7);
    bx.strokeStyle = pal.donjonBrick; bx.lineWidth = 1;
    for (let yy = Y + 42; yy < Y + Hd - 4; yy += 9) { bx.beginPath(); bx.moveTo(X, yy); bx.lineTo(X + Wd, yy); bx.stroke(); }
    bx.fillStyle = pal.donjonMoss;
    for (let i = 0; i < 16; i++) { bx.beginPath(); bx.arc(X + 6 + ((i * 41 + 13) % 97) / 97 * (Wd - 12), Y + 34 + ((i * 23 + 7) % 89) / 89 * (Hd - 40), 1.5 + (i % 4), 0, 7); bx.fill(); }
    const dX = X + Wd / 2 - 16;
    bx.fillStyle = pal.donjonDoor; bx.beginPath();
    bx.moveTo(dX, Y + Hd); bx.lineTo(dX, Y + 42); bx.arc(dX + 16, Y + 42, 16, Math.PI, 0); bx.lineTo(dX + 32, Y + Hd); bx.closePath(); bx.fill();
    const gg = bx.createRadialGradient(dX + 16, Y + 52, 2, dX + 16, Y + 52, 34);
    gg.addColorStop(0, pal.donjonGlow); gg.addColorStop(1, 'rgba(255,215,110,0)');
    bx.fillStyle = gg; bx.beginPath(); bx.arc(dX + 16, Y + 52, 34, 0, 7); bx.fill();
    if (bx.fillText) { // panneau « ⚔ Donjon » : repérable dès l'arrivée dans la zone
      bx.font = 'bold 13px sans-serif'; bx.textAlign = 'center';
      bx.fillStyle = 'rgba(10,14,22,.8)'; bx.fillText('⚔ Donjon', X + Wd / 2 + 1, Y - 18);
      bx.fillStyle = '#ffd76e'; bx.fillText('⚔ Donjon', X + Wd / 2, Y - 19);
    }
  }
  if (map.autel) {
    const X = map.autel.x * T, Y = map.autel.y * T;
    bx.fillStyle = 'rgba(0,0,0,.32)'; bx.beginPath(); bx.ellipse(X + T / 2, Y + T + 4, 26, 10, 0, 0, 7); bx.fill();
    bx.fillStyle = pal.autelBase; bx.fillRect(X - 2, Y + 2, T + 4, T + 4);
    bx.fillStyle = pal.autelTop; bx.fillRect(X + 2, Y - 6, T - 4, 10);
    const ga = bx.createRadialGradient(X + T / 2, Y, 2, X + T / 2, Y, 30);
    ga.addColorStop(0, pal.autelGlow); ga.addColorStop(1, 'rgba(140,220,255,0)');
    bx.fillStyle = ga; bx.beginPath(); bx.arc(X + T / 2, Y, 30, 0, 7); bx.fill();
    bx.strokeStyle = pal.autelRing; bx.lineWidth = 2;
    bx.beginPath(); bx.arc(X + T / 2, Y - 2, 8, 0, 7); bx.stroke();
  }
  if (map.retour) {
    const X = map.retour.x * T, Y = map.retour.y * T;
    bx.fillStyle = 'rgba(0,0,0,.32)'; bx.beginPath(); bx.ellipse(X + T / 2, Y + T + 4, 24, 9, 0, 0, 7); bx.fill();
    bx.fillStyle = pal.retourWall; bx.fillRect(X + 2, Y - 4, T - 4, T + 4);
    bx.fillStyle = pal.retourRoof; bx.beginPath(); bx.moveTo(X - 4, Y); bx.lineTo(X + T / 2, Y - 16); bx.lineTo(X + T + 4, Y); bx.closePath(); bx.fill();
    bx.fillStyle = pal.retourDoor; bx.beginPath(); bx.arc(X + T / 2, Y + T, 7, Math.PI, 0); bx.fill();
    const gr = bx.createRadialGradient(X + T / 2, Y + T - 4, 2, X + T / 2, Y + T - 4, 26);
    gr.addColorStop(0, pal.retourGlow); gr.addColorStop(1, 'rgba(160,235,255,0)');
    bx.fillStyle = gr; bx.beginPath(); bx.arc(X + T / 2, Y + T - 4, 26, 0, 7); bx.fill();
    if (bx.fillText) { // enseigne « ↩ Ville » lisible
      bx.font = 'bold 13px sans-serif'; bx.textAlign = 'center';
      bx.fillStyle = 'rgba(10,14,22,.8)'; bx.fillText('↩ Ville', X + T / 2 + 1, Y - 22);
      bx.fillStyle = '#bfe8ff'; bx.fillText('↩ Ville', X + T / 2, Y - 23);
    }
  }
}

// re-peinture locale d'une tuile (ex. jarre redevenue hautes herbes) : fond + détails de la tuile uniquement
function paintTileGround(bx, map, zone, x, y) {
  if (x < 0 || y < 0 || x >= map.w || y >= map.h) return;
  const T = map.t, W = map.w * T, H = map.h * T;
  const pal = errancePalette(zone);
  const decor = map.decor ?? (map.decor = decorOrders(map, zone));
  const t = map.terr[map.idx(x, y)];
  const px = x * T, py = y * T;
  const g = bx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, pal.grassTop); g.addColorStop(1, pal.grassBottom);
  bx.fillStyle = g; bx.fillRect(px, py, T, T);
  for (const b of decor.blotches) {
    if (b.x < px - b.r || b.x > px + T + b.r || b.y < py - b.r || b.y > py + T + b.r) continue;
    bx.fillStyle = b.c; bx.beginPath(); bx.ellipse(b.x, b.y, b.r, b.r * .55, b.rot, 0, 7); bx.fill();
  }
  if (t === ET.CHEMIN) {
    bx.fillStyle = pal.pathBase; bx.beginPath(); bx.arc(px + T / 2, py + T / 2, T * .9, 0, 7); bx.fill();
    bx.fillStyle = pal.pathCore; bx.beginPath(); bx.arc(px + T / 2, py + T / 2, T * .6, 0, 7); bx.fill();
    bx.fillStyle = pal.pathRut;
    for (const r of decor.pathRuts) { if (r.x < px || r.x > px + T || r.y < py || r.y > py + T) continue; bx.beginPath(); bx.ellipse(r.x, r.y, r.rx, r.ry, r.rot, 0, 7); bx.fill(); }
    bx.fillStyle = pal.pathStone;
    for (const s of decor.pathStones) { if (s.x < px || s.x > px + T || s.y < py || s.y > py + T) continue; bx.beginPath(); bx.arc(s.x, s.y, s.r, 0, 7); bx.fill(); }
  } else if (t === ET.EAU || t === ET.EAU_PROFONDE) {
    const gw = bx.createRadialGradient(px + T / 2 - 6, py + T / 2 - 8, 2, px + T / 2, py + T / 2, T * .9);
    gw.addColorStop(0, pal.water0); gw.addColorStop(1, pal.water2);
    bx.fillStyle = gw; bx.fillRect(px, py, T, T);
  } else if (t === ET.EAU_PEU_PROFONDE) {
    bx.fillStyle = pal.sand; bx.fillRect(px, py, T, T);
    const gw = bx.createRadialGradient(px + T / 2 - 4, py + T / 2 - 5, 2, px + T / 2, py + T / 2, T * .95);
    gw.addColorStop(0, pal.waterShallow0); gw.addColorStop(1, pal.waterShallow1);
    bx.fillStyle = gw; bx.fillRect(px, py, T, T);
  } else if (t === ET.SABLE) {
    bx.fillStyle = pal.sand; bx.fillRect(px, py, T, T);
    bx.fillStyle = pal.sandDark;
    for (let k = 0; k < 5; k++) { bx.beginPath(); bx.arc(px + ((k * 29 + x * 17 + y * 7) % 31) + 2, py + ((k * 19 + x * 11 + y * 23) % 29) + 2, 1 + (k % 2), 0, 7); bx.fill(); }
  } else if (t === ET.HERBES) {
    bx.fillStyle = pal.herbSocleDark; bx.beginPath(); bx.ellipse(px + T / 2, py + T / 2, T * .62, T * .55, 0, 0, 7); bx.fill();
    bx.fillStyle = pal.herbSocle; bx.beginPath(); bx.ellipse(px + T / 2 + 3, py + T / 2 + 2, T * .4, T * .3, 0, 0, 7); bx.fill();
  }
  for (const d of decor.details) {
    if (d.x < px || d.x > px + T || d.y < py || d.y > py + T) continue;
    if (d.kind === 'flower') {
      bx.strokeStyle = pal.stem; bx.lineWidth = 1.3;
      bx.beginPath(); bx.moveTo(d.x, d.y); bx.lineTo(d.x, d.y - 5); bx.stroke();
      bx.fillStyle = d.col;
      for (let p2 = 0; p2 < 4; p2++) { const a = p2 / 4 * 7; bx.beginPath(); bx.arc(d.x + Math.cos(a) * 2.3, d.y - 6 + Math.sin(a) * 2.3, 1.5, 0, 7); bx.fill(); }
      bx.fillStyle = pal.petalCore; bx.beginPath(); bx.arc(d.x, d.y - 6, 1.2, 0, 7); bx.fill();
    } else if (d.kind === 'stone') {
      bx.fillStyle = pal.stoneShadow; bx.beginPath(); bx.ellipse(d.x + .6, d.y + 1.2, 2.7, 1.4, 0, 0, 7); bx.fill();
      bx.fillStyle = pal.stone; bx.beginPath(); bx.ellipse(d.x, d.y, 2.4 + d.s * 2, 1.8 + d.s * 1.4, d.s * 3, 0, 7); bx.fill();
      bx.fillStyle = pal.stoneLight; bx.beginPath(); bx.ellipse(d.x - .8, d.y - .8, 1.1, .7, 0, 0, 7); bx.fill();
    } else {
      bx.strokeStyle = d.dark ? pal.tuftDark : pal.tuftLight;
      bx.lineWidth = 1.4; bx.beginPath();
      for (let k = 0; k < d.n; k++) { const ox = (k - d.n / 2) * 2.6; bx.moveTo(d.x + ox, d.y); bx.quadraticCurveTo(d.x + ox + 1.5, d.y - 3.5, d.x + ox, d.y - 6 - ((k * 7919) % 10) / 10 * 3); }
      bx.stroke();
    }
  }
  for (const f of decor.borderFlowers) {
    if (f.x < px || f.x > px + T || f.y < py || f.y > py + T) continue;
    bx.fillStyle = f.col;
    for (let q = 0; q < 4; q++) { const qa = q / 4 * 7; bx.beginPath(); bx.arc(f.x + Math.cos(qa) * 1.8, f.y + Math.sin(qa) * 1.8, 1.3, 0, 7); bx.fill(); }
    bx.fillStyle = pal.petalCore; bx.beginPath(); bx.arc(f.x, f.y, 1, 0, 7); bx.fill();
  }
}

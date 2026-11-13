import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// Spec vie du jeu — Lot 3 : héros d'errance peint et animé PAR CODE (src/errance-hero.js).
// Femme cape noire cheveux blancs, 4 directions, cycle de marche sinusoïdal + idle, silhouette ~36 px.
// AUCUNE image générée, AUCUN rectangle (pas de fillRect/rect).

function mockCtx() {
  const calls = [];
  const rec = (name) => (...a) => calls.push([name, ...a]);
  return {
    calls,
    save: rec('save'), restore: rec('restore'), translate: rec('translate'), scale: rec('scale'), rotate: rec('rotate'),
    beginPath: rec('beginPath'), closePath: rec('closePath'), moveTo: rec('moveTo'), lineTo: rec('lineTo'),
    quadraticCurveTo: rec('quadraticCurveTo'), ellipse: rec('ellipse'), arc: rec('arc'),
    fill: rec('fill'), stroke: rec('stroke'), fillRect: rec('fillRect'), rect: rec('rect'),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    set fillStyle(v) {}, set strokeStyle(v) {}, set lineWidth(v) {}, set lineCap(v) {},
  };
}

test('Lot 3 : drawHero existe et trace les 4 directions + idle sans erreur, sans aucun rectangle', () => {
  const E = loadEngine();
  assert.equal(typeof E.drawHero, 'function');
  for (const dir of ['down', 'up', 'left', 'right']) {
    for (const moving of [true, false]) {
      const ctx = mockCtx();
      E.drawHero(ctx, 100, 100, { vx: dir === 'left' ? -1 : dir === 'right' ? 1 : 0, vy: dir === 'up' ? -1 : dir === 'down' ? 1 : 0, dir, moving, time: 1.3, motionOK: true });
      assert.ok(ctx.calls.filter((c) => c[0] === 'fill' || c[0] === 'stroke').length > 8, `${dir} moving=${moving} : personnage tracé (${ctx.calls.length} ops)`);
      assert.equal(ctx.calls.filter((c) => c[0] === 'fillRect' || c[0] === 'rect').length, 0, 'aucun rectangle');
    }
  }
});

test('Lot 3 : le cycle de marche animé fait varier le tracé dans le temps (sinusoïde de phase)', () => {
  const E = loadEngine();
  const traceAt = (t) => {
    const ctx = mockCtx();
    E.drawHero(ctx, 0, 0, { vx: 1, vy: 0, dir: 'right', moving: true, time: t, motionOK: true });
    return JSON.stringify(ctx.calls.filter((c) => c[0] === 'lineTo' || c[0] === 'quadraticCurveTo'));
  };
  assert.notEqual(traceAt(0.1), traceAt(0.4), 'les jambes/cape bougent avec la phase');
  const idleA = (() => { const c = mockCtx(); E.drawHero(c, 0, 0, { vx: 0, vy: 0, moving: false, time: 0.2, motionOK: true }); return JSON.stringify(c.calls); })();
  const idleB = (() => { const c = mockCtx(); E.drawHero(c, 0, 0, { vx: 0, vy: 0, moving: false, time: 2.9, motionOK: true }); return JSON.stringify(c.calls); })();
  assert.notEqual(idleA, idleB, 'idle vivant (respiration / mèches qui dérivent)');
});

test('Lot 3 : silhouette contenue dans ~36 px (rayon de lisibilité) et ombre au sol présente', () => {
  const E = loadEngine();
  const ctx = mockCtx();
  E.drawHero(ctx, 0, 0, { vx: 0, vy: 1, dir: 'down', moving: true, time: 0.5, motionOK: true });
  const pts = ctx.calls.filter((c) => ['moveTo', 'lineTo', 'quadraticCurveTo', 'ellipse', 'arc'].includes(c[0]));
  let xs = [], ys = [];
  for (const c of pts) { xs.push(c[1]); ys.push(c[2]); }
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  assert.ok(w <= 36 && h <= 50, `silhouette ${w.toFixed(1)}x${h.toFixed(1)} px (cape sous les pieds comprise)`);
  assert.ok(ctx.calls.some((c) => c[0] === 'ellipse' && c[2] > 8), 'ombre elliptique au sol');
});

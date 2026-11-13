// src/errance-hero.js — héros d'errance peint et animé PAR CODE (Lot 3, spec vie-jeu, TRANCHÉ 12/11).
// Femme à la cape noire et aux cheveux blancs : tête en ellipse (peau en dégradé doux), cheveux en
// mèches courbes, cape noire en polygone souple qui ondule à l'opposé du mouvement, bras/jambes en
// capsules arrondies. Cycle de marche en sin(phase) + bob vertical, cape/cheveux en retard de phase ;
// idle = respiration lente. 4 directions, silhouette lisible à ~36 px. Aucune image, aucun rectangle.

function drawHero(ctx, x, y, o = {}) {
  const time = o.time ?? 0;
  const vx = o.vx ?? 0, vy = o.vy ?? 0;
  const hsp = Math.hypot(vx, vy);
  const moving = (o.moving ?? hsp > 0.15) && (o.motionOK ?? true);
  const dir = o.dir ?? (Math.abs(vx) > Math.abs(vy) ? (vx < -0.05 ? 'left' : 'right') : (vy < -0.05 ? 'up' : 'down'));
  const walkPh = moving ? time * 11 : 0;
  const bob = o.motionOK === false ? 0 : (moving ? Math.sin(walkPh) * 1.6 : Math.sin(time * 2.4) * 0.9);
  const capePh = walkPh - 1.2; // retard de phase : la cape suit le mouvement
  const breathe = o.motionOK === false ? 0 : Math.sin(time * 1.8) * 0.5;

  ctx.save();
  ctx.translate(x, y + bob);
  if (o.tilt) ctx.rotate(o.tilt * (dir === 'left' ? -1 : 1));

  // --- ombre portée elliptique (au sol, sous le personnage) ---
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath(); ctx.ellipse(1.5, 11.5, 11, 4, 0, 0, 7); ctx.fill();

  const profile = dir === 'left' || dir === 'right';
  if (profile) ctx.scale(dir === 'left' ? -1 : 1, 1);

  // --- cape noire : polygone souple qui ondule (à l'opposé du mouvement) ---
  const sway = moving ? Math.sin(capePh) * 2.4 : Math.sin(time * 1.6) * 0.8;
  const capeLen = 20 + (moving ? 2 : 0);
  ctx.fillStyle = '#14161f';
  ctx.beginPath();
  ctx.moveTo(-6, -12);
  ctx.quadraticCurveTo(-11 - sway, -2, -8 - sway * 1.4, capeLen * 0.55);
  ctx.quadraticCurveTo(-4 - sway * 1.6 + Math.sin(capePh + 1) * 1.6, capeLen, 0 - sway * 0.6, capeLen * 0.8);
  ctx.quadraticCurveTo(5 + sway * 0.8, capeLen * 0.7, 7 + sway * 0.4, capeLen * 0.4);
  ctx.quadraticCurveTo(9, 0, 6, -12);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.07)';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-5, -10); ctx.quadraticCurveTo(-9 - sway, 0, -6 - sway * 1.3, capeLen * 0.5); ctx.stroke();

  // --- jambes : capsules arrondies, balancement en sin(phase) ---
  const legSwing = moving ? Math.sin(walkPh) * 4 : 0;
  ctx.strokeStyle = '#23242e';
  ctx.lineWidth = 4.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-2.5, 4); ctx.lineTo(-2.5 + legSwing, 10.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2.5, 4); ctx.lineTo(2.5 - legSwing, 10.5); ctx.stroke();

  // --- bras : capsules arrondies ---
  ctx.strokeStyle = '#2e3140';
  ctx.lineWidth = 3.8;
  const armSwing = moving ? Math.sin(walkPh + Math.PI) * 3.4 : Math.sin(time * 2.2) * 0.6;
  if (profile) {
    ctx.beginPath(); ctx.moveTo(2, -8); ctx.lineTo(5 + armSwing, -1); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(-4.5, -8); ctx.lineTo(-6 - armSwing * 0.7, -1.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4.5, -8); ctx.lineTo(6 + armSwing * 0.7, -1.5); ctx.stroke();
  }

  // --- tunique sous la cape (corps) ---
  const g = ctx.createLinearGradient(0, -14, 0, 6);
  g.addColorStop(0, '#3a3f55');
  g.addColorStop(1, '#262a3c');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, -3 + breathe * 0.4, 7, 9.5, 0, 0, 7); ctx.fill();

  // --- tête : ellipse peau en dégradé doux ---
  const skin = ctx.createRadialGradient(-1.5, -21, 1, 0, -19, 7);
  skin.addColorStop(0, '#f6d7b8');
  skin.addColorStop(1, '#e0b48e');
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.ellipse(0, -19, 6.2, 7, 0, 0, 7); ctx.fill();

  // --- cheveux blancs : mèches en courbes qui dérivent (retard de phase) ---
  const hairPh = capePh + 0.5;
  const back = dir === 'up';
  if (back) {
    ctx.fillStyle = '#eef1f7';
    ctx.beginPath(); ctx.ellipse(0, -18, 7.4, 8.4, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#d8dde8';
    ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 2.4, -24 + Math.abs(i));
      ctx.quadraticCurveTo(i * 3 + Math.sin(time * 2 + i) * 1.2, -16, i * 2.2 + Math.sin(hairPh + i) * 1.5, -8);
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = '#f2f4f8';
    ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 2.2, -24.5 + Math.abs(i) * 0.8);
      ctx.quadraticCurveTo(i * 3.1 + Math.sin(time * 2.1 + i * 1.3) * 1.1, -19, i * 2.6 + Math.sin(hairPh + i) * 1.8, -11);
      ctx.stroke();
    }
    ctx.fillStyle = '#f2f4f8';
    ctx.beginPath(); ctx.ellipse(0, -22.5, 6.4, 4.6, 0, Math.PI, 0); ctx.fill();
  }
  if (!back && !profile) {
    ctx.fillStyle = '#2a2320';
    ctx.beginPath(); ctx.arc(-2.2, -19.5, 0.9, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(2.2, -19.5, 0.9, 0, 7); ctx.fill();
  }
  if (profile) {
    ctx.fillStyle = '#2a2320';
    ctx.beginPath(); ctx.arc(2.6, -19.5, 0.9, 0, 7); ctx.fill();
  }

  ctx.restore();
}

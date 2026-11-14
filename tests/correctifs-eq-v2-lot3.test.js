import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// Correctifs d'équilibre v2 — lot 3 (docs/prompt-correctifs-equilibre-v2.md) : I1 —
// les monstres recrutables (hors horsPool) remontent aux bandes des meilleures cartes joueur
// du même palier/classe (critère cardPower, budget M4 partagé) : atk = bande, INT = bande pour les
// lanceurs (stat de frappe), agi/int dérivés des ratios sinon, PV ajusté du cran de race (PV seul,
// cran 5/10/15 inchangé) pour la même PV effective que la carte de référence.

const E = loadEngine();
const LVL = E.stretchLevel(12);
const RATIOS = E.DATA.engine.moteur.STAT_RATIOS;
const LANCEURS = new Set(Object.entries(E.DATA.engine.profils ?? {}).filter(([, p]) => p.stat === 'int').map(([k]) => k));
const jsr = (x) => Math.floor(x + 0.5);

function bands() {
  const b = {};
  for (const c of E.DATA.cards) {
    const k = `${c.rarity}|${c.classe}`;
    if (!b[k] || E.cardPower(c, LVL) > E.cardPower(b[k], LVL)) b[k] = c;
  }
  return b;
}

test('lot 3 eq v2 : tout monstre recrutable est à la bande de la meilleure carte du palier/classe (atk, INT lanceurs, PV cran-ajusté)', () => {
  const b = bands();
  const mons = E.DATA.monsters.filter((m) => !m.horsPool && b[`${m.rarity}|${m.classe}`]);
  assert.ok(mons.length >= 150, `${mons.length} monstres recrutables couverts`);
  for (const m of mons) {
    const band = b[`${m.rarity}|${m.classe}`];
    const cranM = E.cranPctOfRace(E.raceOfCard(m));
    const cranC = E.cranPctOfRace(E.raceOfCard(band));
    const r = RATIOS[m.classe] ?? RATIOS.Guerrier;
    assert.equal(m.atk, band.atk, `${m.id} atk = bande (${band.id})`);
    assert.equal(m.hp, jsr((band.hp * (1 + cranC / 100)) / (1 + cranM / 100)), `${m.id} hp cran-ajusté = bande`);
    assert.equal(m.agi, Math.max(1, Math.round(m.atk * r.agi)), `${m.id} agi dérivée`);
    if (LANCEURS.has(m.classe)) assert.equal(m.int, band.int, `${m.id} INT = bande (lanceur, stat de frappe)`);
    else assert.equal(m.int, Math.max(1, Math.round(m.atk * r.int)), `${m.id} int dérivée`);
    // budget M4 partagé : PV effective égale à celle de la carte de référence (cran PV appliqué au makeUnit)
    const uM = E.makeUnit({ ...m, level: LVL }), uC = E.makeUnit({ ...band, level: LVL });
    assert.ok(Math.abs(uM.maxHp - uC.maxHp) <= 2, `${m.id} maxHp effective ${uM.maxHp} vs bande ${uC.maxHp} (${band.id})`);
    assert.ok(Math.abs(uM.atk - uC.atk) <= 1 || LANCEURS.has(m.classe), `${m.id} atk effective proche de la bande`);
  }
});

test('lot 3 eq v2 : non-régression marathon après remontée des monstres (3× k4 R, 3× f11 R, garde 150)', () => {
  const DGS = ['marees', 'forge', 'bosquet', 'crypte', 'zenith'];
  for (const id of ['k4', 'f11', 'z17']) {
    const m = E.allMonsters().find((x) => x.id === id);
    for (let n = 0; n < 3; n++) {
      const dg = DGS[n % 5];
      const diff = 1 + (n % 3);
      const floors = E.dungeonById(dg).floors;
      const wave = E.makeWave(n + 1, 1 + (n % floors), dg, diff);
      const mk = () => ({ ...m, level: LVL });
      const st = E.initCombat({ avant: [mk(), mk()], arriere: [mk()] }, wave, n + 1, {}, { difficulty: diff });
      let t = 0;
      while (!st.winner && t < 150) { E.resolveTurn(st); t++; }
      assert.ok(st.winner, `${id} seed ${n + 1} : combat tranché en ${t} tours, pas de marathon`);
    }
  }
});

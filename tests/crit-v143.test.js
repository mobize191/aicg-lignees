import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './helpers/rng.js';
import { loadEngine } from './helpers/load.mjs';

// Spec vie du jeu — Lot 1 (TRANCHÉ 12/11) : coups critiques d'agilité.
// CRIT_BASE 5 % + 1 %/point d'avantage d'agi (positif seul), plafond 30 %, dégâts x1,5 après buffs/malus ;
// l'esquive se résout AVANT le tirage ; sorts exclus en v1 ; symétrique joueur/ennemis/auto ; event damage + champ crit.

const mk = (agi) => ({ uid: 'u' + agi, agi, atk: 10, alive: true, hp: 1000, maxHp: 1000, shield: 0, status: {}, classe: 'Guerrier' });

test('Lot 1 : bornes 5-30 %, monotone en écart d’agi, cap atteint', () => {
  const E = loadEngine();
  const a = mk(10), t = mk(10);
  assert.equal(E.critChanceOf(a, t), 0.05, 'plancher 5 % à égalité');
  assert.ok(Math.abs(E.critChanceOf(mk(20), mk(10)) - 0.15) < 1e-9, '+1 %/point d’avantage');
  assert.equal(E.critChanceOf(mk(10), mk(20)), 0.05, 'avantage négatif ignoré');
  assert.equal(E.critChanceOf(mk(100), mk(10)), 0.30, 'plafond 30 %');
  assert.ok(E.critChanceOf(mk(30), mk(10)) < E.critChanceOf(mk(40), mk(10)), 'monotone');
  // constantes en data
  assert.equal(E.DATA.engine.moteur.CRIT_BASE, 0.05);
  assert.equal(E.DATA.engine.moteur.CRIT_PER_AGI, 0.01);
  assert.equal(E.DATA.engine.moteur.CRIT_CAP, 0.30);
  assert.equal(E.DATA.engine.moteur.CRIT_MULT, 1.5);
});

test('Lot 1 : tirage semé — la fréquence rejoint la chance théorique', () => {
  const E = loadEngine();
  const a = mk(30), t = mk(10); // chance = 0.05 + 20*0.01 = 25 %
  let crits = 0;
  const rng = mulberry32(1234);
  for (let i = 0; i < 20000; i++) if (E.rollCrit(a, t, rng)) crits++;
  const f = crits / 20000;
  assert.ok(Math.abs(f - 0.25) < 0.02, 'fréquence ' + f + ' ~ 25 %');
});

test('Lot 1 : une frappe esquivée ne peut pas critiquer (esquive d’abord) — frappe physique de la ligne', () => {
  const E = loadEngine();
  const st = E.initCombat({ avant: [{ ...E.getCard('a1'), level: 20 }], reserve: [] }, [{ ...E.getMonster('e1') }], 77, {}, { difficulty: 1 });
  const u = st.team.avant[0];
  u.agi = 1; u.atk = 10;
  const foe = st.enemies.avant[0];
  foe.agi = 999; foe.hp = 100000; foe.maxHp = 100000; // esquive quasi certaine, cible increvable
  E.beginRound(st);
  let dodges = 0, badCrit = 0, landed = 0;
  for (let k = 0; k < 60 && !st.winner; k++) {
    const r = E.stepRound(st, { kind: 'attack' });
    const evs = r.events.filter((e) => e.type === 'dodge' || e.type === 'attack');
    const dodged = evs.some((e) => e.type === 'dodge');
    if (dodged) dodges++;
    for (const ev of evs) {
      if (ev.type === 'attack') { landed++; if (dodged && ev.crit) badCrit++; }
    }
    if (!st.winner) E.beginRound(st);
  }
  assert.ok(dodges > 0, 'des esquives ont eu lieu (' + dodges + ')');
  assert.ok(landed > 0, 'des frappes ont touché (' + landed + ')');
  assert.equal(badCrit, 0, 'aucune frappe esquivée n’a critiqué (esquive résolue d’abord)');
});

test('Lot 1 : le flag crit n’apparaît que sur les frappes (kind basic), jamais sur un sort', () => {
  const E = loadEngine();
  const st = E.initCombat({ avant: [{ ...E.getCard('a1'), level: 20 }], reserve: [] }, [{ ...E.getMonster('e1') }], 88, {}, { difficulty: 1 });
  const u = st.team.avant[0];
  u.agi = 500; // cap 30 %
  st.enemies.avant[0].hp = 100000; st.enemies.avant[0].maxHp = 100000; st.enemies.avant[0].agi = 1;
  u.spells = [{ name: 'Frappe Test', cost: 1, mult: 2, ecole: 'lame', role: 'degats' }];
  u.mana = 99; u.manaMax = 99; u.manaRegen = 0;
  E.beginRound(st);
  let spellCrit = 0, basicCrit = 0, basics = 0;
  for (let k = 0; k < 40 && !st.winner; k++) {
    const r = E.stepRound(st, k % 2 === 0 ? { kind: 'spell', idx: 0 } : { kind: 'attack' });
    for (const ev of r.events) {
      if (ev.type !== 'attack') continue;
      if (ev.kind === 'special') { if (ev.crit) spellCrit++; }
      else { basics++; if (ev.crit) basicCrit++; }
    }
    if (!st.winner) E.beginRound(st);
  }
  assert.equal(spellCrit, 0, 'sorts exclus des crits en v1');
  assert.ok(basics > 0 && basicCrit > 0, 'l’auto/joueur critique bien en frappe physique (' + basicCrit + '/' + basics + ')');
});

test('Lot 1 : event damage porte crit:true quand la frappe critique', () => {
  const E = loadEngine();
  // simule directement : frappe physique avec agi très haute vs cible lente, cible avec grosse vie
  const st = E.initCombat({ avant: [{ ...E.getCard('a1'), level: 20 }], reserve: [] }, [{ ...E.getMonster('e1') }], 99, {}, { difficulty: 1 });
  const u = st.team.avant[0];
  u.agi = 400;
  st.enemies.avant[0].agi = 1; st.enemies.avant[0].hp = 100000; st.enemies.avant[0].maxHp = 100000;
  E.beginRound(st);
  let sawCritDmg = false, sawNonCritDmg = false;
  for (let k = 0; k < 30 && !st.winner; k++) {
    const r = E.stepRound(st, { kind: 'attack' });
    for (const ev of r.events) {
      if (ev.type === 'damage' && ev.crit) sawCritDmg = true;
      if (ev.type === 'damage' && !ev.crit) sawNonCritDmg = true;
    }
    if (!st.winner) E.beginRound(st);
  }
  assert.ok(sawCritDmg, 'au moins un damage crit: true (30 % de chance x 30 frappes)');
  assert.ok(sawNonCritDmg, 'et des damage sans crit');
});

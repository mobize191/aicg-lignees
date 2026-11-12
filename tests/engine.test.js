import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './helpers/rng.js';
import { loadEngine } from './helpers/load.mjs';

function fixtureCombat(E) {
  const cards = DATA_cards(E);
  const team = {
    avant: [cards.find((c) => c.id === 'n1'), cards.find((c) => c.id === 'n4')],
    arriere: [cards.find((c) => c.id === 'n3')],
  };
  const foes = E.DATA.monsters.filter((m) => m.dungeon === 'marees').slice(0, 3);
  return E.initCombat(team, foes, 12345, {});
}
function DATA_cards(E) { return E.DATA.cards; }

test('applyDamage respecte le bouclier puis la vie (ACC-0-6)', () => {
  const E = loadEngine();
  const t = { hp: 100, maxHp: 100, shield: 30, alive: true };
  E.applyDamage(t, 50, [], 'enemies');
  assert.equal(t.shield, 0);
  assert.equal(t.hp, 80);
});

test('le bonus d\u2019opposition suit BEATS (ACC-0-6)', () => {
  const E = loadEngine();
  assert.equal(E.elementMult('Feu', 'Nature'), 1 + E.DATA.engine.OPP_BONUS);
  assert.equal(E.elementMult('Eau', 'Nature'), 1);
});

test('un soin plafonne a la vie max de la cible (ACC-0-6)', () => {
  const E = loadEngine();
  const soigneur = E.makeUnit(E.DATA.monsters.find((m) => m.id === 'e7'));
  const t = { uid: 't1', hp: 95, maxHp: 100, alive: true, shield: 0 };
  const events = [];
  E.applySupport(soigneur, { avant: [t], arriere: [] }, {}, events, 'team', []);
  assert.ok(t.hp <= t.maxHp);
  assert.equal(t.hp, 100);
});

test('resolveTurn produit des evenements et un etat coherent (ACC-0-6)', () => {
  const E = loadEngine();
  E.setRoll(mulberry32(42));
  const st = fixtureCombat(E);
  const events = E.resolveTurn(st, null);
  assert.ok(Array.isArray(events) && events.length > 0);
  assert.ok(events.some((e) => e.type === 'turn'));
});

test('la boucle complete se termine avec un vainqueur (ACC-0-6)', () => {
  const E = loadEngine();
  E.setRoll(mulberry32(7));
  const st = fixtureCombat(E);
  const log = E.playAuto(st, 60);
  assert.ok(st.winner === 'team' || st.winner === 'enemies');
  assert.ok(log.some((e) => e.type === 'end'));
});

test('l\u2019ordre du tour se calcule sur l\u2019agilité depuis la phase 3 (ACC-3-4)', () => {
  const E = loadEngine();
  const st = fixtureCombat(E);
  E.beginRound(st);
  const agis = st.round.items.map((it) => it.u.agi);
  const sorted = [...agis].sort((a, b) => b - a);
  assert.deepEqual(agis, sorted);
});

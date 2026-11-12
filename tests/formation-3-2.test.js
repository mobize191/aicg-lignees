import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// Refonte direction — Lot A (TRANCHÉ 12/11) : formation 3 actifs + 2 réserve.
// Moteur : slots 0-2 en avant, 3-4 en state.reserve (hors ciblage, hors items de tour),
// « Échanger » volontaire coûte le tour de l’entrante, remplacement sur K.O. automatique
// et GRATUIT (l’entrante joue au tour suivant), PV/mana conservés, réserve à 50 % d'XP
// (constante data engine.reserveXpMult, appliquée côté UI), pas de bump de save.

const FIVE = ['a1', 'n3', 'a29', 'n1', 's5'];
const team5 = (E) => ({ avant: FIVE.slice(0, 3).map((id) => ({ ...E.getCard(id), level: 20 })), reserve: FIVE.slice(3).map((id) => ({ ...E.getCard(id), level: 20 })) });
const foesOf = (E, n = 3) => E.DATA.monsters.filter((m) => m.dungeon === 'marees').slice(0, n).map((m) => ({ ...m }));

test('Lot A : 5 cartes -> 3 avant + 2 réserve, arrière vide, rangs posés', () => {
  const E = loadEngine();
  const st = E.initCombat(team5(E), foesOf(E), 101);
  assert.equal(st.team.avant.length, 3);
  assert.equal(st.team.arriere.length, 0, 'arrière joueur vide');
  assert.equal(st.reserve.length, 2);
  assert.ok(st.reserve.every((u) => u.rang === 'reserve'));
  assert.ok(st.team.avant.every((u) => u.rang === 'avant'));
  assert.ok(st.reserve.every((u) => u.alive));
});

test('Lot A : la réserve ne joue pas (hors items du round) et une équipe de 2 cartes fonctionne', () => {
  const E = loadEngine();
  const st = E.initCombat(team5(E), foesOf(E), 102);
  E.beginRound(st);
  const teamItems = st.round.items.filter((i) => i.side === 'team').map((i) => i.u.uid);
  const reserveUids = st.reserve.map((u) => u.uid);
  assert.ok(reserveUids.every((uid) => !teamItems.includes(uid)), 'aucune unité de réserve dans les items');
  assert.equal(teamItems.length, 3, 'seuls les 3 actifs jouent');
  const st2 = E.initCombat({ avant: [{ ...E.getCard('a1'), level: 20 }, { ...E.getCard('n3'), level: 20 }], reserve: [] }, foesOf(E, 2), 103);
  assert.equal(st2.team.avant.length, 2);
  assert.equal(st2.reserve.length, 0);
  E.beginRound(st2);
  assert.equal(st2.round.items.filter((i) => i.side === 'team').length, 2);
});

test('Lot A : « Échanger » volontaire coûte le tour — sortant benché, entrante hors items ce tour, PV/mana conservés', () => {
  const E = loadEngine();
  const st = E.initCombat(team5(E), foesOf(E), 104);
  st.team.avant[0].agi = 9999; // le swap est joué par le premier item
  const out = st.team.avant[0];
  const entrant = st.reserve[0];
  entrant.hp = Math.floor(entrant.maxHp / 2);
  entrant.mana = 1;
  E.beginRound(st);
  const r = E.stepRound(st, { kind: 'swap', reserveIdx: 0 });
  const ev = r.events.find((e) => e.type === 'swap');
  assert.ok(ev, 'événement swap émis');
  assert.equal(ev.voluntary, true);
  assert.equal(st.team.avant[0], entrant, 'entrante en place');
  assert.equal(st.reserve[0], out, 'sortant en réserve');
  assert.equal(out.benched, true, 'sortant benché ce tour');
  assert.equal(entrant.hp, Math.floor(entrant.maxHp / 2), 'PV conservés');
  assert.equal(entrant.mana, 1, 'mana conservé');
  const next = E.peekRound(st);
  assert.ok(next && next.u !== entrant, 'entrante n’agit pas au tour de l’échange');
});

test('Lot A : K.O. en avant -> remplacement automatique GRATUIT, entrante joue au tour suivant', () => {
  const E = loadEngine();
  const st = E.initCombat(team5(E), foesOf(E), 105);
  const ko = st.team.avant[1];
  ko.alive = false; ko.hp = 0;
  const entrant = st.reserve[0];
  const events = E.beginRound(st);
  const ev = events.find((e) => e.type === 'swap');
  assert.ok(ev, 'événement swap émis au beginRound');
  assert.equal(ev.voluntary, false);
  assert.equal(st.team.avant[1], entrant);
  assert.ok(st.reserve.includes(ko), 'K.O. en réserve');
  assert.equal(st.reserve.filter(Boolean).length, 2);
  const items = st.round.items.filter((i) => i.side === 'team').map((i) => i.u.uid);
  assert.ok(!items.includes(entrant.uid), 'entrante ne joue pas le tour du K.O.');
  assert.equal(items.length, 2, 'seuls les 2 actifs restés jouent');
});

test('Lot A : sans réserve vivante, le K.O. reste en place et le combat peut se perdre', () => {
  const E = loadEngine();
  const st = E.initCombat({ avant: [{ ...E.getCard('a1'), level: 20 }], reserve: [] }, foesOf(E, 2), 106);
  st.team.avant[0].alive = false; st.team.avant[0].hp = 0;
  E.beginRound(st);
  assert.equal(st.team.avant[0].alive, false);
  let guard = 0;
  while (!st.winner && guard++ < 50) E.stepRound(st, null);
  assert.equal(st.winner, 'enemies');
});

test('Lot A : la constante réserve XP est en data (50 %)', () => {
  const E = loadEngine();
  assert.equal(E.DATA.engine.reserveXpMult, 0.5);
});

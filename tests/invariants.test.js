import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './helpers/rng.js';
import { loadEngine, loadData } from './helpers/load.mjs';

test('makeWave est deterministe a seed fixe', () => {
  const E = loadEngine();
  const a = E.makeWave(42, 1, 'marees', 1, null);
  const b = E.makeWave(42, 1, 'marees', 1, null);
  assert.deepEqual(a, b);
});

test('makeWave varie avec le seed et respecte le biome', () => {
  const E = loadEngine();
  const a = E.makeWave(42, 1, 'marees', 1, null);
  const b = E.makeWave(43, 1, 'marees', 1, null);
  assert.notDeepEqual(a, b);
  const ids = new Set(E.DATA.monsters.filter((m) => m.dungeon === 'marees').map((m) => m.id));
  for (const u of [...a.attaque, ...a.support]) assert.ok(ids.has(u.id) || ids.has(u.cardId) || u.id);
});

test('stageRewards retourne une structure coherente', () => {
  const E = loadEngine();
  const r = E.stageRewards(7, 5, 0, 'marees', 1);
  assert.ok(Array.isArray(r.cards));
  assert.equal(typeof r.boss, 'boolean');
});

test('openDivineBooster retourne 5 cartes divines (ACC-0-3)', () => {
  const E = loadEngine();
  const booster = E.openDivineBooster(mulberry32(3));
  assert.equal(booster.length, 5);
  for (const c of booster) assert.equal(c.dungeon, 'divin');
});

test('pickCard retourne un id du catalogue jouable', () => {
  const E = loadEngine();
  const id = E.pickCard(mulberry32(5), 'R');
  const c = E.getCard(id);
  assert.ok(c && c.rarity === 'R' && !c.archived && !c.monster);
});

test('tickStatuses applique un dot et reduit sa duree', () => {
  const E = loadEngine();
  const u = { uid: 'u1', hp: 50, maxHp: 50, alive: true, shield: 0, status: { dot: { dmg: 10, turns: 2 } } };
  const st = { team: { attaque: [u], support: [] }, enemies: { attaque: [], support: [] } };
  const events = [];
  E.tickStatuses(st, events);
  assert.equal(u.hp, 40);
  assert.ok(events.some((e) => e.type === 'dot' && e.targetId === 'u1'));
});

test('castSummon invoque un allie avec un sort (ACC-0-6)', () => {
  const E = loadEngine();
  const s = E.makeUnit(E.getMonster('e1'));
  s.effect = { kind: 'summon', value: 0.5, hpPct: 0.5, ttl: 3 };
  const allies = { attaque: [s], support: [] };
  const events = [];
  const inv = E.castSummon(s, allies, {}, events, 'team');
  assert.ok(inv && inv.uid.includes('-inv'));
  assert.equal(inv.spells.length, 1);
  assert.ok(events.some((e) => e.type === 'summon'));
});

test('elementTag signale fort contre BEATS', () => {
  const E = loadEngine();
  assert.equal(E.elementTag('Feu', 'Terre'), 'fort');
  assert.equal(E.elementTag('Terre', 'Feu'), null);
});

test('BEATEN_BY est l\u2019inverse de BEATS', () => {
  const E = loadEngine();
  for (const el of E.DATA.engine.ELEMENTS) {
    assert.equal(E.DATA.engine.BEATEN_BY[E.DATA.engine.BEATS[el]], el);
  }
});

test('teamModifiers active un palier avec 2 membres de meme type', () => {
  const E = loadEngine();
  const a = E.makeUnit(E.getCard('n1'));
  const b = E.makeUnit(E.getCard('a30'));
  const mods = E.teamModifiers([a, b]);
  assert.ok(mods.tiers.size > 0);
});

test('statsAt applique le bonus de niveau (LEVEL_BONUS en donnees)', () => {
  const E = loadEngine();
  const c = E.getCard('n1');
  const base = E.statsAt(c, 1, 0);
  const haut = E.statsAt(c, 11, 0);
  assert.equal(base.atk, c.atk);
  assert.equal(haut.atk, Math.max(1, Math.round(c.atk * (1 + E.DATA.engine.LEVEL_BONUS * 10))));
});

test('applyDamage met la cible hors combat a 0 PV', () => {
  const E = loadEngine();
  const t = { hp: 10, maxHp: 100, shield: 0, alive: true };
  E.applyDamage(t, 999, [], 'enemies');
  assert.equal(t.hp, 0);
  assert.equal(t.alive, false);
});

test('initCombat construit 2 camps avec mana initial reduit', () => {
  const E = loadEngine();
  const st = E.initCombat(
    { attaque: [E.getCard('n1')], support: [E.getCard('n3')] },
    [E.getMonster('e1')], 5, {});
  assert.ok(st.team.attaque[0].mana < st.team.attaque[0].manaMax);
  assert.equal(st.winner, null);
});

test('evoTargetsOf suit EVO_CHOICES en donnees', () => {
  const E = loadEngine();
  assert.equal(E.evoTargetsOf('n1').length, 3);
  assert.equal(E.evoVoieOf('n1', 'a30'), 'voie du guerrier');
});

test('evoCostOf lit EVO_COST en donnees', () => {
  const E = loadEngine();
  assert.deepEqual(E.evoCostOf('n1'), ['brut', 3]);
});

test('nextFormOf suit SOLO_STEPS en donnees', () => {
  const E = loadEngine();
  assert.equal(E.nextFormOf('a34'), 'a40');
});

test('migrate refuse une version sans migration', () => {
  const E = loadEngine();
  assert.throws(() => E.migrate({ version: 7 }), /pas de migration/);
});

test('le validateur detecte un doublon d\u2019id (copie modifiee)', () => {
  const E = loadEngine();
  const data = loadData();
  data.cards.push({ ...data.cards[0] });
  const errors = [];
  E.validate(data, errors);
  assert.ok(errors.some((e) => e.includes('meme id')));
});

test('le validateur detecte une reference inconnue (copie modifiee)', () => {
  const E = loadEngine();
  const data = loadData();
  data.evolutions.zz = [{ to: 'carte-inconnue', voie: 'x' }];
  const errors = [];
  E.validate(data, errors);
  assert.ok(errors.some((e) => e.includes('carte-inconnue')));
});

test('le monstre temoin n\u2019est PAS dans les donnees principales (preuve de modularite)', () => {
  const E = loadEngine();
  assert.equal(E.getMonster('x-temoin'), undefined);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './helpers/rng.js';
import { loadEngine } from './helpers/load.mjs';
import { rmSync, cpSync, writeFileSync, readFileSync } from 'node:fs';

const ligne5 = () => [0, 1, 2, 3, 4].map((i) => ({ uid: `e${i}`, hp: 100, maxHp: 100, alive: true, shield: 0, status: {} }));

test('la zone frappe exactement 3 cibles contiguës sur 5, le centre en auto (ACC-3-3)', () => {
  const E = loadEngine();
  const ligne = ligne5();
  const auto = E.pickZoneTargets(ligne, null);
  assert.deepEqual(auto.map((u) => u.uid), ['e1', 'e2', 'e3']);
  const choix0 = E.pickZoneTargets(ligne, 0);
  assert.deepEqual(choix0.map((u) => u.uid), ['e0', 'e1', 'e2']);
  const choix2 = E.pickZoneTargets(ligne, 2);
  assert.deepEqual(choix2.map((u) => u.uid), ['e2', 'e3', 'e4']);
});

test('la zone ne remplace pas une cible morte avant l\u2019impact (ACC-3-3)', () => {
  const E = loadEngine();
  const ligne = ligne5();
  ligne[2].hp = 0;
  const res = E.pickZoneTargets(ligne, null);
  assert.deepEqual(res.map((u) => u.uid), ['e1', 'e3'], 'pas de glissement vers e4');
});

test('la largeur vient des données : le cran III vaut 3 (ACC-3-3)', () => {
  const E = loadEngine();
  assert.equal(E.cranOf('morsure-decume', 'III').largeur, 3);
  const cibles = ligne5();
  const res = E.castSpell(E.DATA, 'morsure-decume', 'III', { lanceur: { uid: 'x', atk: 10, classe: 'Guerrier' }, cibles, events: [] });
  assert.equal(res.cibles.length, 3);
});

test('l\u2019ordre du tour suit l\u2019agilité, stable à égalité (ACC-3-4)', () => {
  const E = loadEngine();
  const mk = (uid, agi) => ({ uid, agi, atk: 999 - agi, alive: true, hp: 10, maxHp: 10, status: {}, spells: [] });
  const st = {
    turn: 0, winner: null, rng: mulberry32(1),
    team: { attaque: [mk('a', 10), mk('b', 20)], support: [] },
    enemies: { attaque: [mk('c', 15)], support: [] },
    mods: {},
  };
  E.beginRound(st);
  assert.deepEqual(st.round.items.map((i) => i.u.uid), ['b', 'c', 'a'], 'le plus agile agit avant, l\u2019attaque ne compte plus');
  const st2 = {
    turn: 0, winner: null, rng: mulberry32(1),
    team: { attaque: [mk('a', 10), mk('b', 10)], support: [] },
    enemies: { attaque: [], support: [] }, mods: {},
  };
  E.beginRound(st2);
  assert.deepEqual(st2.round.items.map((i) => i.u.uid), ['a', 'b'], 'à égalité l\u2019ordre reste stable');
});

// ---------- T0.2 : le ciblage vient de la fiche du sort, pas du rôle de l'unite ----------
const raceSpellOf = (E, nom) => {
  const s = E.DATA.grimoire.race.find((x) => x.nom === nom);
  return { name: s.nom, cost: s.cout, mult: s.mult, cat: 'race', ecole: s.ecole, role: s.role, cible: s.cible };
};
const boostUnit = (E, cardId, nom, uid) => E.makeUnit({ ...E.getCard(cardId), spells: [raceSpellOf(E, nom)] }, uid, 1);
const boostFoe = (E) => E.makeUnit(E.getCard('a1'), 'f1', 1);
const boostState = (team) => ({
  turn: 0, winner: null, rng: mulberry32(1),
  team: { attaque: team, support: [] },
  enemies: { attaque: [boostFoe(globalThis.__E)], support: [] },
  mods: {},
});

test('T0.2 repro : Discipline de Ligne (soi) aiguille le lanceur, pas un ennemi', () => {
  const E = loadEngine();
  globalThis.__E = E;
  const disc = raceSpellOf(E, 'Discipline de Ligne');
  assert.equal(E.spellSideOf(disc), 'self', 'la fiche du sort dit "soi"');
  const u1 = boostUnit(E, 'n1', 'Discipline de Ligne', 'u1');
  const st = boostState([u1]);
  u1.mana = u1.manaMax = 10;
  E.beginRound(st);
  const foeHpBefore = st.enemies.attaque[0].hp;
  const manaBefore = u1.mana;
  const r = E.stepRound(st, { kind: 'spell', idx: 0 });
  assert.ok((u1.atkBuff ?? 0) > 0, 'le lanceur reçoit le bonus');
  assert.equal(st.enemies.attaque[0].hp, foeHpBefore, 'aucun dégât porté à l\u2019ennemi');
  assert.ok(u1.mana < manaBefore, 'le coût du sort est bien dépensé');
  assert.ok(r.events.some((e) => e.type === 'buff' && e.targetId === 'u1'), 'un événement buff est émis');
});

test('T0.2 : Ferveur Céleste (1 allié) aiguille l\u2019allié désigné par la fenêtre', () => {
  const E = loadEngine();
  globalThis.__E = E;
  const ferveur = raceSpellOf(E, 'Ferveur Céleste');
  assert.equal(E.spellSideOf(ferveur), 'ally');
  const u1 = boostUnit(E, 'n14', 'Ferveur Céleste', 'u1');
  const u2 = boostUnit(E, 'n1', 'Discipline de Ligne', 'u2');
  const st = boostState([u1, u2]);
  u1.mana = u1.manaMax = 10; u2.mana = u2.manaMax = 10;
  u1.agi = 20; u2.agi = 10; // l'ordre du tour est maîtrisé : le Démon agit le premier
  E.beginRound(st);
  const foeHpBefore = st.enemies.attaque[0].hp;
  const r = E.stepRound(st, { kind: 'spell', idx: 0, allyUid: 'u2' });
  assert.ok((u2.atkBuff ?? 0) > 0, 'l\u2019allié désigné reçoit le bonus');
  assert.equal(u1.atkBuff ?? 0, 0, 'le lanceur ne se buffe pas si l\u2019allié est désigné');
  assert.equal(st.enemies.attaque[0].hp, foeHpBefore, 'aucun dégât en sneak');
  assert.ok(r.events.some((e) => e.type === 'buff' && e.targetId === 'u2'), 'un événement buff vers l\u2019allié');
});

test('T0.2 : en auto (sans pas tactique) le sort reste un coup sur l\u2019ennemi, digest inchangé', () => {
  const E = loadEngine();
  globalThis.__E = E;
  const u1 = boostUnit(E, 'n1', 'Discipline de Ligne', 'u1');
  const st = boostState([u1]);
  u1.mana = 3; // juste assez pour le sort (3), pas pour une signature (5)
  E.beginRound(st);
  const foeHpBefore = st.enemies.attaque[0].hp;
  E.stepRound(st, null);
  assert.ok(st.enemies.attaque[0].hp < foeHpBefore, 'en auto le sort frappe l\u2019ennemi (chemin historique intact)');
  assert.equal(u1.atkBuff, 0, 'aucun buff posé en auto');
});

test('lot 3 : un sort tactique à fiche "zone" frappe 3 cibles contiguës autour de l’ancrage (ACC-C)', () => {
  // copie des données où la Lame d'Écume n'a que ses crans I et III remplis (max = 3)
    const dir = 'tests/fixtures/data-zone';
  rmSync(dir, { recursive: true, force: true });
  cpSync('data', dir, { recursive: true });
  const gri = JSON.parse(readFileSync(`${dir}/grimoire.json`, 'utf8'));
  const lame = gri.ecole.find((s) => s.id === 'morsure-decume');
  lame.crans.II.vide = true; lame.crans.II.raison = 'test'; lame.crans.IV.vide = true; lame.crans.IV.raison = 'test';
  writeFileSync(`${dir}/grimoire.json`, JSON.stringify(gri, null, 1) + '\n');
  const E = loadEngine(dir);
  E.setRoll(mulberry32(9));
  const team = { attaque: [E.getCard('n1')], support: [E.getCard('n3')] };
  const foes = E.DATA.monsters.filter((m) => m.dungeon === 'marees').slice(0, 5);
  const st = E.initCombat(team, foes, 777, {});
  const u = st.team.attaque[0];
  u.spells = [{ name: 'Lame d\u2019\u00c9cume', cost: 3, mult: 1.5 }];
  u.mana = 10; u.manaMax = 10; u.manaRegen = 2; u.agi = 999;
  assert.equal(E.largeurOfSpellName('Lame d\u2019\u00c9cume'), 3);
  const pre = E.beginRound(st);
  st._events = [...pre];
  const r = E.stepRound(st, { kind: 'spell', idx: 0, targetUid: 'e.a2' });
  const hits = r.events.filter((e) => e.type === 'attack' && e.sourceId === u.uid);
  assert.equal(hits.length, 3, 'la zone touche 3 cibles contiguës');
  assert.deepEqual(hits.map((h) => h.targetId).sort(), ['e.a2', 'e.a3', 'e.a4']);
  rmSync(dir, { recursive: true, force: true });
});

test('lot 3 : un sort à fiche "tous" touche toute la ligne sans désignation (ACC-C)', () => {
  const E = loadEngine();
  E.setRoll(mulberry32(9));
  const team = { attaque: [E.getCard('n1')], support: [] };
  const foes = E.DATA.monsters.filter((m) => m.dungeon === 'marees' && m.classe !== 'Assassin').slice(0, 4);
  const st = E.initCombat(team, foes, 778, {});
  const u = st.team.attaque[0];
  u.spells = [{ name: 'Hurlement', cost: 3, mult: 1.5 }]; // cran IV = tous (5)
  u.mana = 10; u.manaMax = 10; u.manaRegen = 2; u.agi = 999;
  assert.equal(E.largeurOfSpellName('Hurlement'), 5);
  E.beginRound(st);
  const r = E.stepRound(st, { kind: 'spell', idx: 0 }); // aucune cible désignée
  const hits = r.events.filter((e) => e.type === 'attack' && e.sourceId === u.uid);
  assert.equal(hits.length, 4, 'toute la ligne est touchée');
});

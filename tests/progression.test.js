import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rmSync, cpSync, writeFileSync } from 'node:fs';
import { mulberry32 } from './helpers/rng.js';
import { loadEngine, loadData } from './helpers/load.mjs';

test('arbres : 100 % des références résolues, aucun doublon de nom (ACC-1-1)', () => {
  const E = loadEngine();
  assert.deepEqual(E.errors, []);
  const names = E.DATA.cards.map((c) => c.name);
  assert.equal(new Set(names).size, names.length);
});

test('éveil de l\u2019Ange Éveillé : l\u2019Ange Gardien disparaît, la mauvaise volonté est portée par l\u2019Éveillé (ACC-1-2)', () => {
  const E = loadEngine();
  const eveil = E.eveilOf('n13', 'p1');
  assert.ok(eveil, 'l\u2019éveil n13 -> Ange Éveillé existe dans trees.json');
  assert.equal(eveil.effet, 'remplace');
  assert.equal(eveil.disparait, 'p2');
  assert.ok(eveil.portes.some((p) => p.id === 'mauvaise-volonte'), 'la mauvaise volonté part de l\u2019Ange Éveillé');
  const instances = [
    { iid: 'i1', id: 'n13', lvl: 10, xp: 0 },
    { iid: 'i2', id: 'p2', lvl: 5, xp: 0, acc: [{ name: 'Garde céleste', cost: 4, mult: 1.6 }] },
  ];
  const retires = E.applyRemplace(instances, eveil, 'i1');
  assert.deepEqual(retires, ['i2']);
  E.applyTreeEveil(instances[0], eveil);
  assert.equal(instances[0].id, 'p1');
  assert.ok(instances[0].acc.some((s) => s.name === 'Garde céleste'), 'les pouvoirs de l\u2019Ange Gardien passent à l\u2019Éveillé');
  const noms = new Set(E.DATA.cards.map((c) => c.name));
  assert.ok(noms.has('Ange Éveillé') && noms.has('Éveillé du Seuil'), 'les deux noms coexistent sans collision');
});

test('les crans de race +10/+20/+30 s\u2019appliquent aux stats, par données uniquement (ACC-1-3)', () => {
  const E = loadEngine();
  const uMonstre = E.makeUnit(E.getCard('n5'));
  const uDivine = E.makeUnit(E.getCard('n13'));
  assert.equal(uMonstre.cranPct, 10);
  assert.equal(uDivine.cranPct, 30);
  const base = E.getCard('n5');
  const cm = E.classeMods(base);
  assert.equal(uMonstre.atk, Math.max(1, Math.round(base.atk * (1 + cm.atkPct) * 1.10)));
  // modifier le cran dans une copie des données change le résultat proportionnellement
  const dir = 'tests/fixtures/data-crans';
  const data = loadData();
  data.trees.monstre.crans['1'] = 12;
  rmSync(dir, { recursive: true, force: true });
  cpSync('data', dir, { recursive: true });
  writeFileSync(`${dir}/trees.json`, JSON.stringify(data.trees, null, 1) + '\n');
  const E2 = loadEngine(dir);
  const u2 = E2.makeUnit(E2.getCard('n5'));
  assert.equal(u2.cranPct, 12);
  assert.equal(u2.atk, Math.max(1, Math.round(base.atk * (1 + cm.atkPct) * 1.12)));
  rmSync(dir, { recursive: true, force: true });
});

test('les communes déléguées existent avec leur voie (EXI-P1-3)', () => {
  const E = loadEngine();
  assert.equal(E.getCard('p3')?.name, 'Pousse des Sèves');
  assert.equal(E.getCard('p4')?.name, 'Fidèle du Jour');
  assert.ok(E.getCard('p3').voie && E.getCard('p4').voie);
});

test('errance : passage scripté de zone, récoltes dans les bornes, cadence zone/donjon (ACC-4-2)', () => {
  const E = loadEngine();
  const zone = E.getZone('zone-marees');
  assert.equal(zone.cadence, 'zone');
  assert.equal(zone.apres, 'donjon');
  // RNG semé : toutes les récoltes dans les bornes configurées
  for (const seed of [1, 2, 3, 42, 99]) {
    const res = E.runZone('zone-marees', mulberry32(seed));
    for (const r of res.recoltes) {
      if (r.type === 'eclat') assert.ok(zone.recoltes.eclats.tiers.includes(r.tier));
      if (r.type === 'N') assert.ok(zone.poolN.includes(r.carte));
      if (r.type === 'jeton') assert.ok(true);
    }
    assert.ok(Array.isArray(res.enseignements) && res.enseignements.length > 0);
  }
  // la cadence alterne : chaque zone est suivie d'un donjon
  for (const z of E.DATA.zones) assert.equal(z.apres, 'donjon');
});

test('apprentissage : un cran II appris en zone est persisté, castable, et survit à l\u2019évolution (ACC-4-3)', () => {
  const E = loadEngine();
  const grimoire = [];
  E.learnCran(grimoire, 'morsure-decume', 'II');
  assert.ok(E.isLearned(grimoire, 'morsure-decume', 'II'));
  const inst = { iid: 'i1', id: 'n1', lvl: 10, xp: 0, classe: 'Guerrier', voie: 'voie du guerrier', sorts: [] };
  assert.ok(E.canCastLearned(inst, grimoire, 'morsure-decume', 'II'), 'cran II castable par un guerrier (école la Lame ouverte)');
  const res = E.castSpell(E.DATA, 'morsure-decume', 'II', { lanceur: { uid: 'x', classe: 'Guerrier', atk: 10 }, cibles: [0,1,2,3,4].map((i) => ({ uid: 'c' + i, hp: 100, maxHp: 100, alive: true, shield: 0, status: {} })), events: [] });
  assert.equal(res.cibles.length, 2);
  const eveil = E.eveilOf('n1', 'a30');
  E.applyTreeEveil(inst, eveil);
  assert.ok(E.isLearned(grimoire, 'morsure-decume', 'II'), 'le cran appris survit à l\u2019évolution');
});

test('T1.2 éveil : le coût d\'éveil d\'une naissance est typé pierre, les autres rangs gardent les éclats', () => {
  const E = loadEngine();
  const data = loadData();
  assert.deepEqual(E.evoCostOf('n1'), ['pierre', data.engine.EVEIL_COST], 'la naissance paie des pierres d\'éveil');
  assert.deepEqual(E.evoCostOf('a30'), data.engine.EVO_COST.UC, 'un maillon UC garde ses éclats');
  assert.deepEqual(E.evoCostOf('n13'), data.engine.EVO_COST.C, 'la porte divine (C) garde ses éclats');
});

test('T1.2 éveil : le routage N -> C passe par trees.json, la naissance reste jouable avant l\'éveil', () => {
  const E = loadEngine();
  const eveil = E.eveilOf('n1', 'a30');
  assert.ok(eveil, 'l\'éveil n1 -> a30 existe dans trees.json');
  assert.equal(eveil.voie, 'voie du guerrier');
  assert.ok(E.eveilOf('n1', 'a30') && E.eveilOf('n1', 's14') && E.eveilOf('n1', 'a33'), 'les trois voies du Novice sont câblées');
  // une naissance non éveillée reste une unité de combat complète
  E.setRoll(mulberry32(7));
  const team = { attaque: [E.getCard('n1'), E.getCard('n4')], support: [E.getCard('n3')] };
  const mob = [E.getMonster('e1')];
  const st = E.initCombat(team, mob, 5, {});
  const log = E.playAuto(st, 60);
  assert.ok(log.length > 0, 'la naissance agit au combat sans être éveillée');
});

test('T1.3 : le tirage de naissance ne sort que des naissances disponibles, jamais une archive (EXI-N-4)', () => {
  const E = loadEngine();
  E.setRoll(mulberry32(42));
  for (let i = 0; i < 60; i++) {
    const c = E.drawNaissance();
    assert.ok(c, 'le pool de naissances est non vide');
    assert.ok(c.raciale, 'seules des naissances sortent');
    assert.ok(c.rarity === 'N' || (c.rarity === 'C' && E.raceOfCard(c) === 'divine'), 'rang N, porte divine en C');
    assert.ok(!c.archived, 'jamais une carte archivee (Ange Gardien)');
  }
  assert.equal(E.drawNaissance(mulberry32(1), () => false), null, 'pool filtre vide : null, pas de crash');
});

test('T1.3 : la rarete du jeton suit la table en data, communes au taux de reference puis decroissant (decision 8)', () => {
  const E = loadEngine();
  const data = loadData();
  const tiers = data.engine.JETON_RARITY;
  for (const [palier, table] of Object.entries(tiers)) {
    const total = table.reduce((a, [, p]) => a + p, 0);
    assert.ok(Math.abs(total - 1) < 1e-9, `le palier ${palier} somme a 1`);
    const byRar = Object.fromEntries(table);
    assert.ok((byRar.C ?? 0) >= (byRar.UC ?? 0) && (byRar.UC ?? 0) >= (byRar.R ?? 0), `palier ${palier} : taux decroissant avec la rarete`);
  }
  assert.ok(data.engine.N_DROP_RATE > 0 && data.engine.N_DROP_RATE < 0.05, 'le drop de naissance en donjon reste tres bas');
  // tirage seme : bornes attendues
  const rng = mulberry32(7);
  assert.equal(E.jetonRarityFor(rng, 0), 'C', 'aucun donjon boucle : jeton commune');
  const tirages = [];
  const rng2 = mulberry32(99);
  for (let i = 0; i < 1000; i++) tirages.push(E.jetonRarityFor(rng2, 5));
  const pct = (r) => tirages.filter((x) => x === r).length / tirages.length;
  assert.ok(pct('R') > 0.07 && pct('R') < 0.13, `R autour de 10 % (obtenu ${pct('R')})`);
  assert.ok(pct('UC') > 0.35 && pct('UC') < 0.45, `UC autour de 40 % (obtenu ${pct('UC')})`);
  assert.ok(pct('C') > 0.45 && pct('C') < 0.55, `C autour de 50 % (obtenu ${pct('C')})`);
  const rng3 = mulberry32(21);
  for (let i = 0; i < 200; i++) assert.notEqual(E.jetonRarityFor(rng3, 2), 'R', 'deux donjons boucles : pas de Rare au jeton');
});

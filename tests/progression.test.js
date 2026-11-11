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

test('éveil de l\u2019Jeune Séraphin : l\u2019Ange Gardien disparaît, la mauvaise volonté est portée par l\u2019Éveillé (ACC-1-2)', () => {
  const E = loadEngine();
  const eveil = E.eveilOf('n13', 'p1');
  assert.ok(eveil, 'l\u2019éveil n13 -> Jeune Séraphin existe dans trees.json');
  assert.equal(eveil.effet, 'remplace');
  assert.equal(eveil.disparait, 'p2');
  assert.ok(eveil.portes.some((p) => p.id === 'mauvaise-volonte'), 'la mauvaise volonté part de l\u2019Jeune Séraphin');
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
  assert.ok(noms.has('Jeune Séraphin') && noms.has('Éveillé du Seuil'), 'les deux noms coexistent sans collision');
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
  const team = { avant: [E.getCard('n1'), E.getCard('n4')], arriere: [E.getCard('n3')] };
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
    assert.ok(c.rarity !== 'N', 'boucle v2 lot 5 : le rang N est exclu des drops');
    assert.ok(E.raceOfCard(c) === 'divine', 'seule la porte divine (C/UC) droppe encore');
    assert.ok(!c.archived, 'jamais une carte archivee (Ange Gardien)');
  }
  assert.equal(E.drawNaissance(mulberry32(1), () => false), null, 'pool filtre vide : null, pas de crash');
});

test('T1.3 révisé (économie v2 lot E3b) : les jetons de génération sont supprimés — JETON_RARITY retiré des data, plus de tirage de rareté de jeton', () => {
  const E = loadEngine();
  const data = loadData();
  assert.equal(data.engine.JETON_RARITY, undefined, 'JETON_RARITY a disparu des data');
  assert.ok(data.engine.JETON_OR && data.engine.JETON_OR.C > 0, 'JETON_OR en data pour la conversion en or (migration v25)');
  assert.equal(E.jetonRarityFor, undefined, 'plus de fonction de tirage de jeton côté moteur');
  assert.ok(data.engine.N_DROP_RATE > 0 && data.engine.N_DROP_RATE < 0.05, 'le drop de naissance en donjon reste tres bas');
});

// ---------- lot 5 : mécanismes spéciaux des arbres (EXI-M) ----------
test('lot 5 : régression consomme l\u2019Éclat et spawne une nouvelle carte, l\u2019ancienne reste (EXI-M-1)', () => {
  const E = loadEngine();
  const entry = E.evoEntryOf('a17', 'a20');
  assert.equal(entry.type, 'regression');
  const inst = { iid: 'i1', id: 'a17', lvl: 10, xp: 0, acc: [{ name: 'Tranche-Monde' }] };
  const ctx = { items: { 'eclat-regression': 1 }, owned: ['a17'], events: [] };
  const r = E.applySpecialEvo(inst, entry, ctx);
  assert.ok(r.ok && r.spawned, 'regression appliquée');
  assert.equal(r.spawned.id, 'a20');
  assert.equal(ctx.items['eclat-regression'], 0, 'éclat consommé');
  assert.equal(inst.id, 'a17', 'l\u2019ancienne carte reste');
  assert.equal(r.spawned.acc.length, 1, '100 % des sorts conservés');
  // sans l'éclat : refusé
  const r2 = E.applySpecialEvo(inst, entry, { items: {}, owned: ['a17'], events: [] });
  assert.equal(r2.ok, false, 'condition non remplie = refusé');
});

test('lot 5 : fusion consomme 2 exemplaires, malédiction transforme sans choix, secrète floutée (EXI-M-1/3)', () => {
  const E = loadEngine();
  const fusion = E.evoEntryOf('a27', 'a28');
  assert.equal(fusion.type, 'fusion');
  const rf = E.applySpecialEvo({ iid: 'i1', id: 'a27' }, fusion, { owned: ['a27', 'a27'] });
  assert.ok(rf.ok && rf.consumed === 2 && rf.to === 'a28');
  const mal = E.evoEntryOf('a34', 'e3');
  assert.equal(mal.type, 'malediction');
  const inst = { iid: 'i2', id: 'a34' };
  const rm = E.applySpecialEvo(inst, mal, { events: ['malediction'] });
  assert.ok(rm.ok && inst.id === 'e3' && inst.locked, 'transformation verrouillée');
  assert.equal(E.evoLabelOf('n4', 'a37'), '??', 'secrète floutée « ?? »');
  assert.notEqual(E.evoLabelOf('n4', 'a31'), '??', 'voie standard lisible');
  const evt = E.evoEntryOf('p1', 'd6');
  assert.equal(evt.type, 'evenement');
  const rOff = E.applySpecialEvo({ iid: 'i3', id: 'p1' }, evt, { owned: [] });
  assert.equal(rOff.ok, false, 'équilibre sans ange+démon = refusé');
  const rOn = E.applySpecialEvo({ iid: 'i3', id: 'p1' }, evt, { owned: ['n13', 'n14'] });
  assert.ok(rOn.ok && rOn.spawned.id === 'd6', 'équilibre avec ange+démon = Kairos');
});

// ---------- lot 6 : contenu v3 (EXI-V) ----------
test('lot 6 : les 4 nouvelles familles v3 ont leur échelle complète C→L et leurs références résolvent (EXI-V-1)', () => {
  const E = loadEngine();
  assert.deepEqual(E.errors, []);
  for (const fam of ['crepuscule', 'vol', 'zele', 'appel']) {
    const f = E.getFamily(fam);
    assert.ok(f, `famille ${fam} posée`);
    assert.equal(f.steps.length, 6, `${fam} : 6 paliers`);
    const rars = f.steps.map((id) => E.getCard(id)?.rarity);
    assert.deepEqual(rars, ['C', 'UC', 'R', 'SR', 'UR', 'L'], `${fam} : C→L sans saut`);
    const sorts = E.DATA['lineage-spells'][fam];
    assert.equal(sorts.length, 6);
    assert.deepEqual(sorts.map((s) => s.cost), [2, 3, 5, 9, 14, 20], `${fam} : échelle de coûts 2/3/5/9/14/20`);
    for (let i = 1; i < 6; i++) assert.ok(E.evoTargetsOf(f.steps[i - 1]).includes(f.steps[i]), `${fam} : ${f.steps[i - 1]} → ${f.steps[i]}`);
  }
});

test('lot 6 : renommages actés (EXI-V-2) : p1 = Jeune Séraphin (id inchangé), Écuyer Fervent présent', () => {
  const E = loadEngine();
  assert.equal(E.getCard('p1').name, 'Jeune Séraphin');
  const ecuyer = E.DATA.cards.find((c) => c.name === 'Écuyer Fervent');
  assert.ok(ecuyer, 'Écuyer Fervent existe (entrée paladin → Légion Solaire)');
  assert.ok(E.getFamily('zele').steps.includes(ecuyer.id));
});

test('boucle v2 lot 5 : palier d\'évolution sans perte nette, vérifié par simulation sur TOUTES les voies', () => {
  const E = loadEngine();
  let checked = 0;
  for (const c of E.DATA.cards) {
    for (const t of E.evoTargetsOf(c.id)) {
      const to = E.getCard(t) ?? E.getMonster(t);
      if (!to) continue;
      checked++;
      const pct = E.noLossPctOf(c, to);
      const prev = E.makeUnit({ ...c }, 'p', 10);
      const next = E.makeUnit({ ...to, noLossPct: pct }, 'n', 1);
      assert.ok(next.atk >= prev.atk, `${c.id}->${t} ATQ ${prev.atk} -> ${next.atk}`);
      assert.ok(next.maxHp >= prev.maxHp, `${c.id}->${t} PV ${prev.maxHp} -> ${next.maxHp}`);
    }
  }
  assert.ok(checked > 50, `voies simulées : ${checked}`);
});

test('boucle v2 lot 5 : rang N exclu des drops — drawNaissance ne sort jamais une naissance N', () => {
  const E = loadEngine();
  const rng = E.mulberry32(1234);
  for (let i = 0; i < 500; i++) {
    const c = E.drawNaissance(rng, () => true);
    if (c) assert.notEqual(c.rarity, 'N', `${c.id} est rang N et ne doit pas dropper`);
  }
});

test('boucle v2 lot 5 : solos archivés — hors pools actifs, toujours en data et jouables', () => {
  const E = loadEngine();
  const solos = E.DATA.cards.filter((c) => !c.family && !c.dungeon && !c.raciale);
  assert.ok(solos.length >= 20, 'les solos existent en data');
  assert.ok(solos.every((c) => c.archived === true), 'toutes les solos portent archived: true');
  // hors des pools de tirage
  const rng = E.mulberry32(99);
  for (let i = 0; i < 200; i++) {
    const id = E.pickCard(rng, 'C');
    assert.notEqual(E.getCard(id).archived, true, 'pickCard ne sort jamais une archive');
  }
  // jouables : une solo archivée reste instanciable et combative
  const u = E.makeUnit({ ...E.getCard(solos[0].id), level: 5 }, 's', 5);
  assert.ok(u.atk > 0 && u.maxHp > 0);
});

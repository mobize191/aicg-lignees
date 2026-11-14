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
  assert.equal(eveil.effet, 'standard', 'p2 Ange Gardien retiré au gel lot G : plus de remplace');
  assert.equal(eveil.disparait, undefined);
  assert.ok(eveil.portes.some((p) => p.id === 'mauvaise-volonte'), 'la mauvaise volonté part de l\u2019Jeune Séraphin');
  const instances = [{ iid: 'i1', id: 'n13', lvl: 10, xp: 0 }];
  E.applyTreeEveil(instances[0], eveil);
  assert.equal(instances[0].id, 'p1');
  const noms = new Set(E.DATA.cards.map((c) => c.name));
  assert.ok(noms.has('Jeune Séraphin') && noms.has('Éveillé du Seuil'), 'les deux noms coexistent sans collision');
});

test('les crans de race +10/+20/+30 s\u2019appliquent aux stats, par données uniquement (ACC-1-3)', () => {
  const E = loadEngine();
  const uMonstre = E.makeUnit(E.getCard('n5'));
  const uDivine = E.makeUnit(E.getCard('n13'));
  assert.equal(uMonstre.cranPct, 5, 'J4 : cran allégé 5/10/15');
  assert.equal(uDivine.cranPct, 15);
  const base = E.getCard('n5');
  assert.equal(uMonstre.atk, Math.max(1, Math.round(base.atk)), 'J3/J4 : le cran ne touche plus l ATQ');
  assert.equal(uMonstre.maxHp, Math.max(1, Math.round(base.hp * 1.05)), 'J4 : le cran porte sur les PV');
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
  assert.equal(u2.atk, Math.max(1, Math.round(base.atk)), 'le cran ne touche pas l ATQ (J4)');
  assert.equal(u2.maxHp, Math.max(1, Math.round(base.hp * 1.12)), 'le cran se lit sur les PV');
  rmSync(dir, { recursive: true, force: true });
});

test('les communes déléguées existent avec leur voie (EXI-P1-3)', () => {
  const E = loadEngine();
  assert.equal(E.getCard('p3')?.name, 'Pousse des Sèves');
  assert.equal(E.getCard('p4'), undefined, 'p4 Fidèle du Jour retiré au gel lot G');
  assert.ok(E.getCard('p3').voie, 'Pousse des Sèves garde sa voie');
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

// ---------- lot 5/6 : mécanismes spéciaux des arbres (EXI-M) ----------
test('lot 6 (spec-fusion-v4 §2.5) : la RÉGRESSION MEURT — plus d’entrée a17, plus de type, éclats convertis en or', () => {
  const E = loadEngine();
  assert.equal(E.evoEntryOf('a17', 'a20'), null, 'entrée de régression a17 -> a20 supprimée');
  assert.ok(!E.DATA.engine.EVO_TYPES.includes('regression'), 'type regression retiré des EVO_TYPES');
  const entry = { type: 'regression', to: 'a20', condition: { kind: 'item', id: 'eclat-regression', n: 1 } };
  const r = E.applySpecialEvo({ iid: 'i1', id: 'a17', lvl: 10, acc: [] }, entry, { items: { 'eclat-regression': 1 }, owned: ['a17'], events: [] });
  assert.ok(!r || !r.ok || r.type !== 'regression', 'plus de branche regression');
  // migration v30 -> v33 (v31 : éclats de régression en stock -> or, suite 24 ; v32 : tirage shiny, lot 8 ; v33 : tirage Exception, suite 61)
  const out = E.migrate({ version: 30, instances: [], gold: 100, items: { 'eclat-regression': 3 } });
  assert.equal(out.version, 33);
  assert.equal(out.gold, 100 + 3 * E.DATA.engine.FUSION.eclatRegressionOr, '3 éclats x 500 or');
  assert.equal(out.items['eclat-regression'], undefined, 'éclats consommés par la migration');
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

test('contenu v3 lot C5 : greffe des 31 solos — plus aucune archive, chaque ex-solo a une famille d’accueil', () => {
  const E = loadEngine();
  const arch = E.DATA.cards.filter((c) => c.archived);
  assert.equal(arch.length, 0, 'plus aucune carte archivée (greffe ACTÉE 11/11)');
  const exSolos = ['a3', 'a4', 'a9', 's2', 's3', 'p3',
    'a34', 'a35', 'a36', 'a37', 'a38', 'a39', 'a40', 'a41', 'a42', 'a43', 'a44', 'a45', 'a46', 'a47', 'a48', 'a49',
    'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'];
  for (const id of exSolos) {
    const c = E.getCard(id);
    assert.ok(c && !c.archived, `${id} n'est plus archivée`);
    assert.ok(c.family && E.getFamily(c.family), `${id} a une famille d'accueil (${c.family})`);
    assert.ok(E.getFamily(c.family).future.includes(id), `${id} est dans le "future" de ${c.family}`);
  }
  // cibles d'évolution préservées : les solo-steps mènent à des cartes non archivées
  for (const [from, to] of Object.entries(E.DATA['solo-steps'])) {
    const cible = E.getCard(to) ?? E.getMonster(to);
    assert.ok(cible && !cible.archived, `la cible ${to} de ${from} n'est plus en archives`);
  }
  // les ex-solos C non-branch re-rentrent dans les tirages ; les branches de forge (b1-b7) restent hors drops
  const rng = E.mulberry32(99);
  const vus = new Set();
  for (let i = 0; i < 400; i++) vus.add(E.pickCard(rng, 'C'));
  assert.ok(vus.has('a3') || vus.has('s2') || vus.has('p3'), 'un ex-solo C peut re-sortir');
  assert.ok(!vus.has('b1'), 'b1 (branche de forge) reste hors des drops aléatoires');
  // jouables : un ex-solo reste instanciable et combatif
  const u = E.makeUnit({ ...E.getCard('a3'), level: 5 }, 's', 5);
  assert.ok(u.atk > 0 && u.maxHp > 0);
});

test('contenu v3 lot C6 — familles compagnons : 7 voies b_i → UR → L nommée, graines = branches de forge', () => {
  const E = loadEngine();
  const voies = [
    ['b1', 'c1', 'c8', 'Yuki'], ['b2', 'c2', 'c9', 'Onyx'], ['b3', 'c3', 'c10', 'Naïa'],
    ['b4', 'c4', 'c11', 'Aïna'], ['b5', 'c5', 'c12', 'Roc'], ['b6', 'c6', 'c13', 'Ember'], ['b7', 'c7', 'c14', 'Sylve'],
  ];
  for (const [graine, ur, l, prenom] of voies) {
    const g = E.getCard(graine);
    assert.ok(g && g.branch && g.rarity === 'SR' && g.family, `${graine} : graine SR branche de forge`);
    assert.equal(E.nextFormOf(graine), ur, `${graine} évolue vers l'UR ${ur}`);
    const u = E.getCard(ur);
    assert.ok(u && u.rarity === 'UR' && u.branch && u.family === g.family, `${ur} : UR de la voie, même famille`);
    assert.equal(E.nextFormOf(ur), l, `${ur} évolue vers la L ${l}`);
    const ll = E.getCard(l);
    assert.ok(ll && ll.rarity === 'L' && ll.name.includes(','), `${l} : L nommée`);
    assert.ok(ll.name.startsWith(prenom + ','), `${l} : même prénom que la graine (${prenom})`);
    assert.ok(u.atk > g.atk && ll.atk > u.atk, `${graine} : courbe de stats croissante`);
  }
  // anti-doublon de nom complet (EXI-DATA-3) toujours vert avec les 7 nouvelles L
  const errors = [];
  E.validate(E.DATA, errors);
  assert.deepEqual(errors, [], 'validateur vert (noms uniques)');
});

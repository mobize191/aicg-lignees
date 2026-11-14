import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, loadData } from './helpers/load.mjs';

// Lot 5 refonte v2 — DONJONS PAR FAMILLE (spec-donjons-par-famille-v1) :
// 5 majeurs recyclés (escalier de boss, mode Royale +10, panoplie), 5 donjons de famille
// carte 1, 3 donjons divins, pools par famille, gel entré dans les pools, errance recâblée
// (zone.region + zone.donjon), 2 difficultés à l'entrée du donjon.

const E = loadEngine();
const data = loadData();

test('lot 5 : 13 donjons — 5 majeurs + 5 familles carte 1 + 3 divins, champs du spec présents', () => {
  assert.equal(data.dungeons.length, 13);
  const majeurs = data.dungeons.filter((d) => d.majeur);
  assert.equal(majeurs.length, 5);
  for (const d of data.dungeons) {
    assert.ok(d.region >= 1 && d.region <= 4, `${d.id} region`);
    assert.ok(d.palier >= 1, `${d.id} palier`);
    assert.ok(Array.isArray(d.bossPaliers) && d.bossPaliers.length >= 1, `${d.id} bossPaliers`);
    assert.ok(d.royale && d.royale.palier === d.palier + 10, `${d.id} royale = palier+10`);
    assert.deepEqual(d.difficultes, ['normale', 'royale'], `${d.id} 2 difficultés`);
  }
  // M jamais en palier intermédiaire d'escalier
  for (const d of data.dungeons) {
    for (const bp of d.bossPaliers) {
      const ref = data.monsters.find((m) => m.id === bp.ref);
      assert.ok(ref.rarity !== 'M' || bp.floor === d.floors, `${d.id} : M ${bp.ref} seulement en boss final`);
    }
  }
});

test('lot 5 : pools par famille — monstersOf lit dungeon.pool, majors gardent le pool du biome', () => {
  const poolGob = E.monstersOf('gobelins-ecumes').map((m) => m.id);
  assert.ok(poolGob.includes('e1') && poolGob.includes('e17'), 'famille Gobelins des Écumes');
  assert.ok(!poolGob.includes('e23'), 'pas de Sirènes dans le donjon des gobelins');
  const poolZen = E.monstersOf('zenith').map((m) => m.id);
  assert.ok(poolZen.includes('z3') && poolZen.includes('z23'), 'majeur Zénith = tout le biome (Légion + Clergé)');
  // gel entré dans les pools au lot 5
  assert.ok(E.monstersOf('crypte').some((m) => m.id === 'k33'), 'gorgones k33 dans la Crypte');
  assert.ok(E.monstersOf('bosquet').some((m) => m.id === 'g33'), 'fées g33 dans le Bosquet');
  assert.ok(E.monstersOf('donjon-demons').some((m) => m.id === 'd28'), 'Belzébuth dans le Donjon des Démons');
  assert.ok(E.monstersOf('donjon-anges').some((m) => m.id === 'd40'), 'dévoyés dans le Donjon des Anges');
  // boss cards hors pools de vagues aléatoires
  assert.ok(!E.monstersOf('marees').some((m) => m.id === 'e31'), 'e31 reste un boss Card hors pool');
});

test('lot 5 : errance recâblée — chaque zone a region + donjon (famille) + rencontres re-peuplées', () => {
  const att = { 'zone-marees': 'gobelins-ecumes', 'zone-forge': 'enfants-braise', 'zone-bosquet': 'dryades-bosquet', 'zone-crypte': 'spectres-crypte', 'zone-zenith': 'clerge-zenith' };
  for (const z of data.zones) {
    assert.equal(z.region, 1, `${z.id} région 1`);
    assert.equal(z.donjon, att[z.id], `${z.id} donjon local`);
    const dj = data.dungeons.find((d) => d.id === z.donjon);
    for (const id of dj.pool) assert.ok(z.rencontres.includes(id), `${z.id} rencontre ${id} (famille du donjon local)`);
  }
  assert.ok(data.zones.find((z) => z.id === 'zone-marees').rencontres.includes('e23'), 'zone-marees garde les Sirènes (rencontres historiques + famille)');
  assert.ok(data.zones.find((z) => z.id === 'zone-forge').rencontres.includes('f2'), 'gobelins régionaux (Fumées) en rencontre');
});

test('lot 5 : difficulté Royale — +10 niveaux sur les vagues et boss royal du donjon', () => {
  assert.equal(data.engine.moteur.ROYALE_LEVEL_BONUS, 10);
  const D = E.difficultyById('royale');
  assert.equal(D.royale, true);
  assert.deepEqual(E.bandOf('royale'), D.bande, 'bande de la Royale = bande Normale');
  const wN = E.makeWave(42, 2, 'gobelins-ecumes', 2);
  const wR = E.makeWave(42, 2, 'gobelins-ecumes', 'royale');
  const lvlN = Math.max(...[...wN.avant, ...wN.arriere].map((u) => u.level));
  const lvlR = Math.max(...[...wR.avant, ...wR.arriere].map((u) => u.level));
  assert.equal(lvlR - lvlN, 10, 'vagues Royale +10 niveaux');
  // boss étage 3 : normale = bossPaliers, royale = royale.boss
  const dj = data.dungeons.find((d) => d.id === 'gobelins-ecumes');
  const bN = E.makeWave(42, 3, 'gobelins-ecumes', 2);
  const bR = E.makeWave(42, 3, 'gobelins-ecumes', 'royale');
  assert.equal(bN.avant[0].id ?? bN.avant[0].cardId, dj.bossPaliers[0].ref, 'boss normale = escalier');
  assert.equal(bR.avant[0].id ?? bR.avant[0].cardId, dj.royale.boss, 'boss royale = tête royale');
  assert.ok(bR.avant[0].boss, 'boss flagué');
  // dungeonLevelOf : majeurs étirés sur la grille v1 (lot 9), familles = palier étiré, royale +10 hors étirement
  assert.equal(E.dungeonLevelOf('marees', 1), 1);
  assert.equal(E.dungeonLevelOf('zenith', 5), E.stretchLevel(25));
  assert.equal(E.dungeonLevelOf('gobelins-ecumes', 2), E.stretchLevel(3));
  assert.equal(E.dungeonLevelOf('gobelins-ecumes', 'royale'), E.stretchLevel(3) + 10);
  assert.equal(E.dungeonLevelOf('donjon-equilibre', 1), 100); // divin déjà sur la grille v1 : non ré-étiré
  assert.equal(E.dungeonLevelOf('donjon-equilibre', 'royale'), 110);
});

test('lot 5 : validateur EXI-DJ-1 — rejets (pool inconnu, M en escalier, royale fausse, zone.donjon inconnu)', () => {
  const d2 = JSON.parse(JSON.stringify(data));
  const errs = [];
  E.validate(d2, errs);
  assert.ok(!errs.some((e) => e.includes('EXI-DJ-1')), errs.join(' | '));
  d2.dungeons[5].pool.push('monstre-inconnu');
  d2.dungeons[5].bossPaliers.push({ floor: 2, ref: 'f13' }); // M en palier intermédiaire (floors=3)
  d2.dungeons[5].royale.palier = 99;
  d2.zones[0].donjon = 'donjon-inconnu';
  const errs2 = [];
  E.validate(d2, errs2);
  assert.ok(errs2.some((e) => e.includes('pool inconnu')), 'pool inconnu rejeté');
  assert.ok(errs2.some((e) => e.includes('dans un escalier')), 'M en escalier rejeté');
  assert.ok(errs2.some((e) => e.includes('royale palier')), 'royale fausse rejetée');
  assert.ok(errs2.some((e) => e.includes('donjon inconnu')), 'zone.donjon inconnu rejeté');
});

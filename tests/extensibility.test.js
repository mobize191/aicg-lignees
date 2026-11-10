import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './helpers/rng.js';
import { rmSync, cpSync, writeFileSync, readFileSync } from 'node:fs';
import { loadEngine } from './helpers/load.mjs';

test('un monstre ajoute en donnees seules est jouable (ACC-0-4, EXI-MOD-2)', () => {
  const E = loadEngine('tests/fixtures/data-temoin');
  E.setRoll(mulberry32(1));
  const team = {
    attaque: [E.getCard('n1'), E.getCard('n4')],
    support: [E.getCard('n3')],
  };
  const temoin = E.getMonster('x-temoin');
  assert.ok(temoin, 'le monstre temoin existe dans les donnees du fixture');
  const st = E.initCombat(team, [temoin], 999, {});
  const log = E.playAuto(st, 60);
  assert.ok(log.some((e) => e.sourceId === 'e.a0'), 'le temoin a agi dans le combat');
});

test('l\u2019école fictive « l\u2019Éclipse » caste sur les quatre largeurs en données seules (ACC-2-6, EXI-MOD-2)', () => {
    const dir = 'tests/fixtures/data-eclipse';
  rmSync(dir, { recursive: true, force: true });
  cpSync('data', dir, { recursive: true });
  const schools = JSON.parse(readFileSync(`${dir}/schools.json`, 'utf8'));
  schools['eclipse'] = { nom: 'l’Éclipse', role: 'degats', ouvrePar: { profils: ['Mage'], voies: ['voie éclipse'] } };
  writeFileSync(`${dir}/schools.json`, JSON.stringify(schools, null, 1) + '\n');
  const grimoire = JSON.parse(readFileSync(`${dir}/grimoire.json`, 'utf8'));
  grimoire.ecole.push({ id: 'trait-declipse', nom: 'Trait d’Éclipse', ecole: 'eclipse', role: 'degats', crans: {
    I: { cout: 3, largeur: 1, mult: 1.5 }, II: { cout: 4, largeur: 2, mult: 1.8 },
    III: { cout: 5, largeur: 3, mult: 2.2 }, IV: { cout: 6, largeur: 5, mult: 2.6 } } });
  writeFileSync(`${dir}/grimoire.json`, JSON.stringify(grimoire, null, 1) + '\n');
  const monsters = JSON.parse(readFileSync(`${dir}/monsters.json`, 'utf8'));
  monsters.push({ id: 'x-eclipse', dungeon: 'zenith', name: 'Éclipse du test', rarity: 'C', classe: 'Mage', element: 'Ombre', role: 'attaque', atk: 20, hp: 80, soloSpell: 'Trait d’Éclipse' });
  writeFileSync(`${dir}/monsters.json`, JSON.stringify(monsters, null, 1) + '\n');

  const E = loadEngine(dir);
  assert.deepEqual(E.errors, []);
  const ligne = [0, 1, 2, 3, 4].map((i) => ({ uid: `e${i}`, hp: 100, maxHp: 100, alive: true, shield: 0, status: {} }));
  const lanceur = { uid: 'x', atk: 10, classe: 'Mage', voie: 'voie éclipse', ecoles: E.openSchools('voie éclipse') };
  assert.ok(E.canCast(lanceur, 'trait-declipse'), 'la voie fictive ouvre l’école fictive');
  for (const [cran, n] of [['I', 1], ['II', 2], ['III', 3], ['IV', 5]]) {
    const res = E.castSpell(E.DATA, 'trait-declipse', cran, { lanceur, cibles: ligne.map((t) => ({ ...t })), events: [] });
    assert.equal(res.cibles.length, n, `cran ${cran} : ${n} cible(s)`);
  }
  rmSync(dir, { recursive: true, force: true });
});

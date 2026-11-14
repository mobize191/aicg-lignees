import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// Gel v1 — lot E (spec-gel-v1 §3 lot E, suites 24/28) : paladin a50-a53 (entrée a30 → « la lumière »,
// choix du zèle au palier R : a50 → u3 Croisé de l'Aube) + chevalier s15-s18 (entrée s14 → « la voie
// du rempart »), familles + 6 sorts de lignée chacune, Noms actés : Isaure, Kiri l'Invincible.

const E = loadEngine();

test('lot E gel : paladin a50-a53 et chevalier s15-s18 (familles paladin/chevalerie, Neutres, Guerrier)', () => {
  const att = { a50: ['Paladin', 'R'], a51: ['Paladin Sacré', 'SR'], a52: ['Paladine Sacrée', 'UR'], a53: ['Isaure, Égide de l’Aube', 'L'],
    s15: ['Chevalier', 'R'], s16: ['Chevalière du Rempart', 'SR'], s17: ['Gardienne du Rempart', 'UR'], s18: ['Kiri l’Invincible', 'L'] };
  for (const [id, [nom, pal]] of Object.entries(att)) {
    const c = E.getCard(id);
    assert.ok(c, id);
    assert.equal(c.name, nom);
    assert.equal(c.rarity, pal);
    assert.equal(c.classe, 'Guerrier');
    assert.equal(c.element, 'Neutre', id + ' humaine = Neutre');
    assert.equal(E.raceOfCard(c), 'humaine');
  }
  assert.equal(E.getCard('a50').family, 'paladin');
  assert.equal(E.getCard('s18').family, 'chevalerie');
});

test('lot E gel : entrées et choix — a30 → {a6|a50}, a50 → {a51|u3}, s14 → {s6|s15}, chaînes R→L', () => {
  assert.deepEqual(E.evoTargetsOf('a30').sort(), ['a50', 'a6']);
  assert.deepEqual(E.evoTargetsOf('a50').sort(), ['a51', 'u3'], 'choix du zèle au palier R');
  assert.deepEqual(E.evoTargetsOf('s14').sort(), ['s15', 's6']);
  assert.deepEqual(E.evoTargetsOf('a51'), ['a52']);
  assert.deepEqual(E.evoTargetsOf('a52'), ['a53']);
  assert.deepEqual(E.evoTargetsOf('s16'), ['s17']);
  assert.deepEqual(E.evoTargetsOf('s17'), ['s18']);
  assert.deepEqual(E.DATA.families.paladin.steps, ['a50', 'a51', 'a52', 'a53']);
  assert.deepEqual(E.DATA.families.chevalerie.steps, ['s15', 's16', 's17', 's18']);
});

test('lot E gel : 6 sorts de lignée par famille + FAM_SCHOOL/FAM_ORDER renseignés', () => {
  assert.equal(E.DATA['lineage-spells'].paladin.length, 6);
  assert.equal(E.DATA['lineage-spells'].chevalerie.length, 6);
  assert.deepEqual(E.DATA['lineage-spells'].paladin.map((s) => s.cost), [2, 3, 5, 9, 14, 20]);
  assert.equal(E.DATA.engine.FAM_SCHOOL.paladin, 'ferveur');
  assert.equal(E.DATA.engine.FAM_SCHOOL.chevalerie, 'rempart');
  assert.ok(E.DATA.engine.FAM_ORDER.includes('paladin') && E.DATA.engine.FAM_ORDER.includes('chevalerie'));
});

test('lot E gel : validateur 0 erreur', () => {
  const errs = [];
  E.validate(E.DATA, errs);
  assert.deepEqual(errs, []);
});

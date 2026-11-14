import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// Gel v1 — lot C (spec-gel-v1 §3 lot C) : les anges dévoyés d37-d40, la porte « mauvaise volonté »
// de p1 vivante (évolution p1 → d37), le re-racement de z8 (élément Lumière, camp ange),
// l'école l'Orgueil + 6 sorts de lignée + signature « Lumière Noire ».

const E = loadEngine();

test('lot C gel : les 4 anges dévoyés existent (d37-d40, fam devoyes, divins joueur)', () => {
  for (const [id, nom, pal, classe, elt] of [
    ['d37', 'Ange Ardent', 'R', 'Guerrier', 'Feu'],
    ['d38', 'Ange du Zénith', 'SR', 'Guerrier', 'Lumière'],
    ['d39', 'Astre Vaillant', 'UR', 'Guerrier', 'Lumière'],
    ['d40', 'Astre Rayonnant', 'L', 'Prêtre', 'Lumière'],
  ]) {
    const m = E.getMonster(id);
    assert.ok(m, id);
    assert.equal(m.name, nom);
    assert.equal(m.rarity, pal);
    assert.equal(m.classe, classe);
    assert.equal(m.element, elt);
    assert.equal(m.fam, 'devoyes');
    assert.equal(E.raceOfCard(m), 'divine');
  }
  assert.equal(E.getMonster('d40').soloSpell, 'Lumière Noire');
});

test('lot C gel : la porte « mauvaise volonté » est vivante — p1 → d37 au choix du palier R', () => {
  const ev = E.DATA.trees.divine.eveils.find((e) => e.de === 'n13');
  assert.ok(ev.portes.find((p) => p.id === 'mauvaise-volonte').vivante, 'porte marquée vivante');
  const ch = E.DATA.evolutions.p1.map((c) => c.to);
  assert.ok(ch.includes('d37') && ch.includes('p5') && ch.includes('d6'), 'choix au R : d37 / p5 / d6 (événement)');
});

test('lot C gel : z8 Astre Capiteux re-racé camp ange, élément Lumière, courbe inchangée', () => {
  const z8 = E.getMonster('z8');
  assert.equal(z8.element, 'Lumière');
  assert.equal(z8.fam, 'devoyes');
  assert.equal(z8.atk, 53);
  assert.equal(z8.hp, 144);
  assert.equal(E.raceOfCard(z8), 'divine');
});

test('lot C gel : école l’Orgueil + 6 sorts de lignée devoyes + signature au grimoire', () => {
  assert.ok(E.DATA.schools.orgueil);
  assert.equal(E.DATA['lineage-spells'].devoyes.length, 6);
  assert.equal(E.DATA.grimoire.lignee.filter((l) => l.famille === 'devoyes').length, 6);
  const uniq = E.DATA.grimoire.uniques.find((u) => u.id === 'lumiere-noire');
  assert.ok(uniq && uniq.carte === 'd40');
  assert.equal(E.DATA.engine.FAM_SCHOOL.devoyes, 'orgueil');
  assert.equal(E.DATA.engine.SCHOOL_ELEMENT.orgueil, 'Lumière');
});

test('lot C gel : validateur 0 erreur + hors pools de donjons', () => {
  const errs = [];
  E.validate(E.DATA, errs);
  assert.deepEqual(errs, []);
  const inPools = new Set();
  for (const d of E.DATA.dungeons) for (const m of E.monstersOf(d.id)) inPools.add(m.id);
  for (const id of ['d37', 'd38', 'd39', 'd40']) assert.ok(!inPools.has(id), id + ' hors pools');
});

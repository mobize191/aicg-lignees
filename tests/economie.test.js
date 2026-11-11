import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadData } from './helpers/load.mjs';

test('économie v2 — prix de la Boutique en data (calibrage v0)', () => {
  const D = loadData();
  const eng = D.engine;
  assert.equal(eng.ECLAT_BUY_PRIX, 150, 'éclat brut acheté 150 or');
  assert.equal(eng.GEM_BRUT_PRIX, 100, 'éclat brut revendable 100 or (achat > revente)');
  assert.ok(eng.ECLAT_BUY_PRIX > eng.GEM_BRUT_PRIX);
  for (const p of Object.values(D.potions)) {
    assert.ok(Number.isInteger(p.prix) && p.prix > 0, `potion ${p.id} a un prix entier > 0`);
  }
});

test('économie v2 — rayon équipement Boutique = pièces source boutique, 200 à 1 600 or, jamais de set', () => {
  const D = loadData();
  const pieces = D.equipment.pieces;
  const boutique = pieces.filter((p) => p.source === 'boutique');
  assert.equal(boutique.length, 60, '60 pièces boutique (40 armes typées + 4 armures + 16 slots d’équipe, C à SR)');
  for (const p of boutique) {
    assert.ok(!p.set, `${p.id} boutique n'appartient à aucun set`);
    assert.ok(p.prix >= 200 && p.prix <= 1600, `${p.id} prix ${p.prix} dans 200-1 600`);
    assert.ok(['arme', 'armure', 'equipe'].includes(p.slot), `${p.id} slot connu`);
    if (p.slot === 'arme') assert.ok(p.classe, `${p.id} arme typée par classe`);
  }
  const sets = pieces.filter((p) => p.set);
  assert.equal(sets.length, 90, '90 pièces de set (5 zones x 3 paliers x 6 pièces), hors Boutique');
  for (const p of sets) assert.notEqual(p.source, 'boutique', `${p.id} set non vendu à la Boutique`);
});

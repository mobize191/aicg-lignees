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

test('économie v2 lot E2 — marchand de créatures : échelle de prix en data, bornes actées', () => {
  const D = loadData();
  const m = D.marchand;
  assert.ok(m, 'data/marchand.json existe');
  assert.equal(m.prixParRarete.C, 200, 'borne basse actée : C 200 or');
  assert.equal(m.prixParRarete.UR, 10000, 'borne haute actée : UR 10 000 or');
  const rars = m.raretesVendues;
  assert.deepEqual([...rars].sort(), ['C', 'R', 'SR', 'UC', 'UR'].sort(), 'raretés vendues C à UR (pas L/M)');
  for (const r of rars) assert.ok(m.prixParRarete[r] > 0, `prix ${r} renseigné`);
  assert.equal(m.maxExemplaires, 3, 'limite 3 exemplaires, comme le recrutement');
  const nonNomme = D.monsters.filter((x) => !(x.name ?? '').includes(','));
  for (const x of nonNomme) {
    if (rars.includes(x.rarity)) assert.ok(m.prixParRarete[x.rarity], `${x.id} achetable`);
  }
});

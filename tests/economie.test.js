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

test('économie v2 lot E3a — Guilde : compagnons, prix actés C 500 → UR 2 000 or, 3 offres/jour', () => {
  const D = loadData();
  const g = D.guilde;
  assert.ok(g, 'data/guilde.json existe');
  assert.equal(g.prixCompagnons.C, 500);
  assert.equal(g.prixCompagnons.UR, 2000);
  assert.equal(g.nbOffresJour, 3, 'rotation de 3 offres par jour');
  assert.ok(!('L' in g.prixCompagnons) && !('N' in g.prixCompagnons), 'L et N jamais recrutables');
  assert.equal(g.maxExemplaires, 3);
});

test('économie v2 lot E4 — quêtes quotidiennes en data + migration v24 non destructive', () => {
  const D = loadData();
  const q = D.quetes;
  assert.ok(q.petites.length >= 3 && q.moyennes.length >= 3 && q.grandes.length >= 3, 'pool de quêtes par taille');
  for (const t of ['petites', 'moyennes', 'grandes']) {
    for (const quest of q[t]) {
      assert.ok(quest.id && quest.type && quest.n > 0 && quest.or > 0, `quête ${quest.id} cohérente`);
    }
  }
  assert.equal(q.bonusCompletion.pierre, 1, 'bonus de complétion : 1 pierre d’éveil (acté)');
  assert.equal(q.grandeBonusN.unJourSur, 3, 'grande quête : carte N un jour sur trois');
});

test('migration v23 -> v24 : champ quetes initialisé, rien perdu', async () => {
  const { loadEngine } = await import('./helpers/load.mjs');
  const E = loadEngine();
  const old = { version: 23, gold: 500, potions: { soin30: 2 }, dailyDone: '2026-11-10', instances: [] };
  const out = E.migrate(old);
  assert.equal(out.version, 24);
  assert.equal(out.gold, 500, 'or conservé');
  assert.deepEqual(out.potions, { soin30: 2 }, 'potions conservées');
  assert.equal(out.dailyDone, '2026-11-10', 'dailyDone inerté mais conservé');
  assert.deepEqual(out.quetes, { day: '', list: [], bonusDone: false }, 'quêtes initialisées vierges');
});

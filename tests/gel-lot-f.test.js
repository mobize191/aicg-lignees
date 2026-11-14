import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// Gel v1 — lot F (spec-gel-v1 §3 lot F, §1.5) : gorgones k33-k40 (crypte) + fées g33-g39 (bosquet),
// éveils w21 → k33 et w20 → g2 → g33, lignées d'accueil des Enge. Cartes hors pools (horsPool)
// jusqu'au lot donjons : digest inchangé attendu.

const E = loadEngine();

test('lot F gel : gorgones k33-k40 et fées g33-g39 présentes, mystiques, hors pools de vagues', () => {
  const att = {
    k33: ['Serpent des Récifs', 'UC'], k34: ['Fileuse du Regard', 'R'], k35: ['Pétrifiante des Écueils', 'SR'],
    k36: ['Gorgonne Immaculée', 'UR'], k37: ['Méduse, Reine des Écueils', 'L'],
    k38: ['Mère des Serpents', 'SR'], k39: ['Grande Serpentine', 'UR'], k40: ['Euryale, Nourrice des Serpents', 'L'],
    g33: ['Fée des Groves', 'R'], g34: ['Fée des Jeux', 'SR'], g35: ['Souveraine des Jeux', 'UR'],
    g36: ['Mab, Souveraine des Jeux', 'L'], g37: ['Fée des Ronces', 'SR'], g38: ['Reine des Ronces', 'UR'],
    g39: ['Aubépine, Reine des Ronces', 'L'],
  };
  for (const [id, [nom, pal]] of Object.entries(att)) {
    const m = E.getMonster(id);
    assert.ok(m, id);
    assert.equal(m.name, nom);
    assert.equal(m.rarity, pal);
    assert.equal(E.raceOfCard(m), 'mystique');
    assert.ok(!m.horsPool, id + ' entré dans les pools au lot 5 (donjons par famille)');
  }
  // lot 5 : gorgones dans le pool de la Crypte, fées dans celui du Bosquet
  const poolCrypte = new Set(E.monstersOf('crypte').map((m) => m.id));
  const poolBosquet = new Set(E.monstersOf('bosquet').map((m) => m.id));
  for (let i = 33; i <= 40; i++) assert.ok(poolCrypte.has(`k${i}`), `k${i} dans les vagues de la Crypte`);
  for (let i = 33; i <= 39; i++) assert.ok(poolBosquet.has(`g${i}`), `g${i} dans les vagues du Bosquet`);
  // les boss dédiés (e31/e32) restent hors pools de vagues aléatoires
  for (const d of E.DATA.dungeons) {
    for (const m of E.monstersOf(d.id)) assert.ok(!m.horsPool, m.id + ' hors pool (boss Card)');
  }
});

test('lot F gel : éveils des Enge — w21 → k33, w20 → g2 → g33 ; chaînes sans trou', () => {
  assert.deepEqual(E.eveilsOf('w21').map((e) => e.vers), ['k33']);
  assert.deepEqual(E.eveilsOf('w20').map((e) => e.vers), ['g2']);
  assert.deepEqual(E.DATA.evolutions.g2.map((c) => c.to), ['g33']);
  const line = (id) => {
    for (const fams of Object.values(E.DATA['monster-families'])) for (const fam of fams) for (const l of fam.lines ?? []) {
      const i = l.indexOf(id);
      if (i >= 0 && i < l.length - 1) return l[i + 1];
    }
    return null;
  };
  assert.equal(line('k33'), 'k34');
  assert.equal(line('k36'), 'k37');
  assert.equal(line('g35'), 'g36');
  assert.equal(line('g38'), 'g39');
});

test('lot F gel : validateur 0 erreur', () => {
  const errs = [];
  E.validate(E.DATA, errs);
  assert.deepEqual(errs, []);
});

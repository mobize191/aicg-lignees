import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine } from './helpers/load.mjs';

// Gel v1 — lot D (spec-gel-v1 §3 lot D, suites 31/33) : chaîne céleste p5 → p7 → p8 → p6,
// p5 re-palier UR → R, p6 renommé « Séraphin, Archange Ultime », p7/p8 nouvelles (famille seuil).

const E = loadEngine();

test('lot D gel : p5 re-palier R, p6 renommé, p7/p8 présentes (famille seuil)', () => {
  assert.equal(E.getCard('p5').rarity, 'R');
  assert.equal(E.getCard('p5').name, 'Séraphin, Porteur de Lumière');
  assert.equal(E.getCard('p6').name, 'Séraphin, Archange Ultime');
  assert.equal(E.getCard('p6').rarity, 'L');
  for (const [id, nom, pal] of [['p7', 'Ange de Lumière', 'SR'], ['p8', 'Archange', 'UR']]) {
    const c = E.getCard(id);
    assert.ok(c, id);
    assert.equal(c.name, nom);
    assert.equal(c.rarity, pal);
    assert.equal(c.family, 'seuil');
    assert.equal(c.classe, 'Prêtre');
    assert.equal(c.element, 'Lumière');
  }
});

test('lot D gel : maillons p5 → p7 → p8 → p6 (solo-steps) et famille seuil à jour', () => {
  assert.deepEqual(E.formsOf('p5').map((f) => f.to), ['p7']);
  assert.deepEqual(E.formsOf('p7').map((f) => f.to), ['p8']);
  assert.deepEqual(E.formsOf('p8').map((f) => f.to), ['p6']);
  assert.deepEqual(E.DATA.families.seuil.future, ['p5', 'p7', 'p8', 'p6']);
  // p1 garde ses trois voies : p5 (céleste), d6 (événement), d37 (mauvaise volonté)
  const ch = E.DATA.evolutions.p1.map((c) => c.to).sort();
  assert.deepEqual(ch, ['d37', 'd6', 'p5']);
});

test('lot D gel : validateur 0 erreur', () => {
  const errs = [];
  E.validate(E.DATA, errs);
  assert.deepEqual(errs, []);
});

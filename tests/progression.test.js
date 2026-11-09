import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rmSync, cpSync, writeFileSync } from 'node:fs';
import { loadEngine, loadData } from './helpers/load.mjs';

test('arbres : 100 % des références résolues, aucun doublon de nom (ACC-1-1)', () => {
  const E = loadEngine();
  assert.deepEqual(E.errors, []);
  const names = E.DATA.cards.map((c) => c.name);
  assert.equal(new Set(names).size, names.length);
});

test('éveil de l\u2019Ange Éveillé : l\u2019Ange Gardien disparaît, la mauvaise volonté est portée par l\u2019Éveillé (ACC-1-2)', () => {
  const E = loadEngine();
  const eveil = E.eveilOf('n13', 'p1');
  assert.ok(eveil, 'l\u2019éveil n13 -> Ange Éveillé existe dans trees.json');
  assert.equal(eveil.effet, 'remplace');
  assert.equal(eveil.disparait, 'p2');
  assert.ok(eveil.portes.some((p) => p.id === 'mauvaise-volonte'), 'la mauvaise volonté part de l\u2019Ange Éveillé');
  const instances = [
    { iid: 'i1', id: 'n13', lvl: 10, xp: 0 },
    { iid: 'i2', id: 'p2', lvl: 5, xp: 0, acc: [{ name: 'Garde céleste', cost: 4, mult: 1.6 }] },
  ];
  const retires = E.applyRemplace(instances, eveil, 'i1');
  assert.deepEqual(retires, ['i2']);
  E.applyTreeEveil(instances[0], eveil);
  assert.equal(instances[0].id, 'p1');
  assert.ok(instances[0].acc.some((s) => s.name === 'Garde céleste'), 'les pouvoirs de l\u2019Ange Gardien passent à l\u2019Éveillé');
  const noms = new Set(E.DATA.cards.map((c) => c.name));
  assert.ok(noms.has('Ange Éveillé') && noms.has('Éveillé du Seuil'), 'les deux noms coexistent sans collision');
});

test('les crans de race +10/+20/+30 s\u2019appliquent aux stats, par données uniquement (ACC-1-3)', () => {
  const E = loadEngine();
  const uMonstre = E.makeUnit(E.getCard('n5'));
  const uDivine = E.makeUnit(E.getCard('n13'));
  assert.equal(uMonstre.cranPct, 10);
  assert.equal(uDivine.cranPct, 30);
  const base = E.getCard('n5');
  const cm = E.classeMods(base);
  assert.equal(uMonstre.atk, Math.max(1, Math.round(base.atk * (1 + cm.atkPct) * 1.10)));
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
  assert.equal(u2.atk, Math.max(1, Math.round(base.atk * (1 + cm.atkPct) * 1.12)));
  rmSync(dir, { recursive: true, force: true });
});

test('les communes déléguées existent avec leur voie (EXI-P1-3)', () => {
  const E = loadEngine();
  assert.equal(E.getCard('p3')?.name, 'Pousse des Sèves');
  assert.equal(E.getCard('p4')?.name, 'Fidèle du Jour');
  assert.ok(E.getCard('p3').voie && E.getCard('p4').voie);
});
